import React, { useState, useRef, useEffect } from "react";
import { Button, Modal, Form, Row, Col, ListGroup, Table } from "react-bootstrap";
import Swal from "sweetalert2";

function LoadIn({ onSave, Username = localStorage.getItem("fullname"), children }) {
  const [validated, setValidated] = useState(false);
  const [show, setShow] = useState(false);
  const [parts, setParts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [serials, setSerials] = useState([]);
  const [selectedPart, setSelectedPart] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [partName, setPartName] = useState('');
  const [supplier, setSupplier] = useState('');
  const [storeName, setStoreName] = useState('');
  const [selectedSerials, setSelectedSerials] = useState([{ serial: "", quantity: 1 }]);

  const [partInput, setPartInput] = useState("");
  const [locationInput, setLocationInput] = useState("");
  const [serialInput, setSerialInput] = useState("");
  const [filteredParts, setFilteredParts] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [filteredSerials, setFilteredSerials] = useState([]);
  const [showPartDropdown, setShowPartDropdown] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showSerialDropdown, setShowSerialDropdown] = useState(false);
  const [activeSerialRow, setActiveSerialRow] = useState(null);

  const locationInputRef = useRef(null);
  const serialInputRef = useRef(null);

  const handleClose = () => {
    setShow(false);
    resetForm();
  };

  const handleShow = () => {
    setShow(true);
    resetForm();
  };

  // เพิ่มฟังก์ชันสำหรับดึงข้อมูลจาก serial ที่ผู้ใช้กรอก
  const handleSerialInputManual = (index, serialNumber) => {
    // ถ้าไม่มี serial number หรือมีความยาวน้อยเกินไป ให้ข้าม
    if (!serialNumber || serialNumber.length < 3) {
      return;
    }

    // ค้นหา serial ในข้อมูลที่มีอยู่
    const foundSerial = serials.find(serial =>
      serial.part_no === serialNumber
    );

    if (foundSerial) {
      // อัพเดทข้อมูลในช่อง serial ปัจจุบัน
      const updatedSerials = [...selectedSerials];
      updatedSerials[index] = {
        ...updatedSerials[index],
        serial: foundSerial.part_no,
        part_num: foundSerial.part_num,
        part_name: foundSerial.part_name,
        supplier: foundSerial.supplier,
        brand: foundSerial.brand,
        quantity: foundSerial.qty || 1,
        sup_serial: foundSerial.sup_serial || ''
      };
      setSelectedSerials(updatedSerials);

      // ดึงข้อมูล Part
      setPartInput(foundSerial.part_num || '');
      setPartName(foundSerial.part_name || '');
      setSupplier(foundSerial.supplier || '');

      // หาข้อมูล Part ที่เกี่ยวข้องกับ Serial และเก็บไว้
      const associatedPart = parts.find(p => p.part_num === foundSerial.part_num);
      if (associatedPart) {
        setSelectedPart(associatedPart);
      } else {
        // ถ้าไม่พบใน parts สร้างข้อมูลจาก serial
        setSelectedPart({
          part_num: foundSerial.part_num,
          part_name: foundSerial.part_name,
          supplier: foundSerial.supplier
        });
      }
    } else {
      // ถ้าไม่พบข้อมูล serial ในระบบ
      // ต้องล้างข้อมูล part เพื่อป้องกันการใช้ข้อมูลผิด
      const updatedSerials = [...selectedSerials];
      updatedSerials[index] = {
        ...updatedSerials[index],
        serial: serialNumber,
        part_num: '',
        part_name: '',
        supplier: '',
        brand: '',
        quantity: 1,
        sup_serial: ''
      };
      setSelectedSerials(updatedSerials);

      // แจ้งเตือนผู้ใช้ (อาจใช้ alert แบบเล็กแทน Swal เพื่อไม่ให้รบกวนการทำงาน)
      console.warn(`Serial number ${serialNumber} not found in database`);
    }

  };

  const resetForm = () => {
    setValidated(false);
    setSelectedPart(null);
    setSelectedLocation(null);
    setPartInput("");
    setLocationInput("");
    setSerialInput("");
    setPartName("");
    setSupplier("");
    setStoreName("");
    setSelectedSerials([{ serial: "", quantity: 1 }]);
    setShowPartDropdown(false);
    setShowLocationDropdown(false);
    setShowSerialDropdown(false);
    setActiveSerialRow(null);

    // Reset all refs
    Object.values(refs).forEach(ref => {
      if (ref.current) {
        ref.current.value = "";
      }
    });
  };

  useEffect(() => {
    fetchParts();
    fetchLocations();
    fetchSerials();
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (locationInputRef.current && !locationInputRef.current.contains(event.target)) {
        setShowLocationDropdown(false);
      }

      // ตรวจสอบการคลิกนอก serial dropdowns
      let clickedInside = false;

      // ตรวจสอบการคลิกใน input fields
      const serialInputs = document.querySelectorAll('[id^="serial-input-"]');
      serialInputs.forEach(input => {
        if (input.contains(event.target)) {
          clickedInside = true;
        }
      });

      // ตรวจสอบการคลิกใน dropdown buttons
      const serialButtons = document.querySelectorAll('.serial-dropdown-btn');
      serialButtons.forEach(button => {
        if (button.contains(event.target)) {
          clickedInside = true;
        }
      });

      // ตรวจสอบการคลิกใน dropdown ที่กำลังแสดง
      const serialDropdown = document.querySelector(".serial-dropdown");
      if (serialDropdown && serialDropdown.contains(event.target)) {
        clickedInside = true;
      }

      // ถ้าคลิกข้างนอก ให้ซ่อน dropdown
      if (!clickedInside) {
        setShowSerialDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (locationInput) {
      const filtered = locations.filter(location =>
        location.location_name.toLowerCase().includes(locationInput.toLowerCase())
      );
      setFilteredLocations(filtered);
    } else {
      setFilteredLocations(locations);
    }
  }, [locationInput, locations]);

  useEffect(() => {
    if (serialInput) {
      const filtered = serials.filter(serial =>
        serial.part_no.toLowerCase().includes(serialInput.toLowerCase()) ||
        serial.part_num.toLowerCase().includes(serialInput.toLowerCase()) ||
        (serial.part_name && serial.part_name.toLowerCase().includes(serialInput.toLowerCase()))
      );
      setFilteredSerials(filtered);
    } else {
      setFilteredSerials(serials);
    }
  }, [serialInput, serials]);

  // ฟังก์ชันดึงข้อมูล parts
  const fetchParts = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SERVER}/Store.php?action=getParts`);
      const data = await response.json();
      if (data) {
        setParts(data);
        setFilteredParts(data);
      }
    } catch (error) {
      console.error("Error fetching parts:", error);
    }
  };

  //ตะกร้า
   const fetchBucket = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SERVER}/Store.php?action=getBucket`);
      const data = await response.json();
      if (data) {
        setParts(data);
        setFilteredParts(data);
      }
    } catch (error) {
      console.error("Error fetching parts:", error);
    }
  };

  // แก้ไขฟังก์ชันดึงข้อมูลจาก tb_location แทน tb_stores
  const fetchLocations = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SERVER}/Store.php?action=getLo`);
      const data = await response.json();
      if (data) {
        setLocations(data);
        setFilteredLocations(data);
      }
    } catch (error) {
      console.error("Error fetching locations:", error);
    }
  };

  // เพิ่มฟังก์ชันดึงข้อมูล Serial Numbers
  const fetchSerials = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SERVER}/Store.php?action=getSerials`);
      const data = await response.json();
      if (Array.isArray(data)) {
        // ถ้าข้อมูลไม่มี qty ให้กำหนดค่าเริ่มต้นเป็น 1
        const serialsWithQty = data.map(serial => ({
          ...serial,
          qty: serial.qty || 1
        }));
        setSerials(serialsWithQty);
        setFilteredSerials(serialsWithQty);
      } else {
        setSerials([]);
        setFilteredSerials([]);
      }
    } catch (error) {
      console.error("Error fetching serials:", error);
      setSerials([]);
      setFilteredSerials([]);
    }
  };

  const handleLocationInputChange = (e) => {
    setLocationInput(e.target.value);
    setSelectedLocation(null);
    setStoreName('');
    setShowLocationDropdown(true);
  };

  const handleSerialInputChange = (e) => {
    setSerialInput(e.target.value);
    setShowSerialDropdown(true);
  };

  const handleLocationInputClick = () => {
    setShowLocationDropdown(true);
  };

  const handleSerialInputClick = (index) => {
    setSerialInput("");
    setActiveSerialRow(index); // เก็บแถวที่กำลังแสดง dropdown
    setShowSerialDropdown(true);
    serialInputRef.current = { element: document.querySelector(`#serial-input-${index}`), index };
  };

  const handleLocationSelection = (location) => {
    setLocationInput(location.location_name);
    setStoreName(location.store_name || '');
    setSelectedLocation(location);
    setShowLocationDropdown(false);

    // หลังจากเลือก Location แล้ว ให้ focus ไปที่ช่อง Serial Number แรก
    setTimeout(() => {
      const firstSerialInput = document.querySelector('#serial-input-0');
      if (firstSerialInput) {
        firstSerialInput.focus();
      }
    }, 100);
  };

  // ฟังก์ชันจัดการการเลือก Serial
  const handleSerialSelection = (serial) => {
    // ตรวจสอบว่ามี ref และ index ที่ถูกต้องหรือไม่
    if (!serialInputRef.current || serialInputRef.current.index === undefined) {
      return;
    }

    const index = serialInputRef.current.index;

    // อัพเดตรายการ serial ที่ index ที่กำหนด และเพิ่ม quantity จาก database
    const updatedSerials = [...selectedSerials];
    updatedSerials[index] = {
      ...updatedSerials[index],
      serial: serial.part_no,
      part_num: serial.part_num,
      part_name: serial.part_name,
      supplier: serial.supplier,
      brand: serial.brand,
      quantity: serial.qty || 1,
      sup_serial: serial.sup_serial || ''
    };
    setSelectedSerials(updatedSerials);

    // ดึงข้อมูล Part จาก Serial Number ที่เลือกและอัพเดต Part Information
    setPartInput(serial.part_num || '');
    setPartName(serial.part_name || '');
    setSupplier(serial.supplier || '');

    // หาข้อมูล Part ที่เกี่ยวข้องกับ Serial และเก็บไว้
    const associatedPart = parts.find(p => p.part_num === serial.part_num);
    if (associatedPart) {
      setSelectedPart(associatedPart);
    } else {
      // ถ้าไม่พบใน parts สร้างข้อมูลจาก serial
      setSelectedPart({
        part_num: serial.part_num,
        part_name: serial.part_name,
        supplier: serial.supplier
      });
    }

    setShowSerialDropdown(false);
    setActiveSerialRow(null); // รีเซ็ตแถวที่กำลังทำงาน
  };

  // ฟังก์ชันสำหรับเพิ่มช่อง Serial เพิ่มเติม
  const addSerialRow = () => {
    const newSerials = [...selectedSerials, { serial: "", quantity: 1 }];
    setSelectedSerials(newSerials);

    // ใช้ setTimeout เพื่อให้แน่ใจว่า DOM ได้ render ก่อนที่จะพยายาม focus
    setTimeout(() => {
      const newRowIndex = newSerials.length - 1;
      const newRowInput = document.querySelector(`#serial-input-${newRowIndex}`);
      if (newRowInput) {
        newRowInput.focus();
      }
    }, 0);
  };

  // ฟังก์ชันสำหรับลบช่อง Serial
  const removeSerialRow = (index) => {
    if (selectedSerials.length > 1) {
      const updatedSerials = [...selectedSerials];
      updatedSerials.splice(index, 1);
      setSelectedSerials(updatedSerials);
    }
  };

  // ฟังก์ชันสำหรับอัพเดตค่า quantity ของ Serial แต่ละรายการ
  const updateSerialQuantity = (index, quantity) => {
    const updatedSerials = [...selectedSerials];
    updatedSerials[index].quantity = quantity;
    setSelectedSerials(updatedSerials);
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    const options = {
      timeZone: 'Asia/Bangkok',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    };

    const thailandTime = now.toLocaleString('en-US', options);
    const [date, time] = thailandTime.split(', ');
    const [month, day, year] = date.split('/');
    return `${year}-${month}-${day} ${time}`;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      setValidated(true);
      return;
    }

    // ตรวจสอบว่าได้เลือก Location หรือไม่
    if (!selectedLocation) {
      Swal.fire({
        position: "center",
        icon: "error",
        title: "โปรดเลือกตำแหน่งจัดเก็บ (Location)",
        showConfirmButton: false,
        timer: 2000,
      });
      return;
    }

    // ตรวจสอบว่ามี Serial ที่เลือกหรือไม่
    if (selectedSerials.length === 0 || selectedSerials.some(item => !item.serial)) {
      Swal.fire({
        position: "center",
        icon: "error",
        title: "โปรดกรอก Serial Number อย่างน้อย 1 รายการ",
        showConfirmButton: false,
        timer: 2000,
      });
      return;
    }

    try {
      // บันทึก Log และอัพเดท Stock สำหรับแต่ละ Serial
      for (const serialItem of selectedSerials) {
        await saveLogEntry(serialItem);
        await updateStock(serialItem);
      }

      Swal.fire({
        position: "center",
        icon: "success",
        title: "บันทึกข้อมูลสำเร็จ",
        showConfirmButton: false,
        timer: 1500,
      });
      setShow(false);
      if (onSave) onSave(true);
    } catch (err) {
      console.error(err);
      Swal.fire({
        position: "center",
        icon: "error",
        title: "เกิดข้อผิดพลาดในการบันทึกข้อมูล",
        showConfirmButton: false,
        timer: 2000,
      });
    }
  };

  // แก้ไขฟังก์ชันสำหรับบันทึกลง tb_log_product
  const saveLogEntry = async (serialItem) => {
    try {
      const queryString =
        `${import.meta.env.VITE_SERVER}/Store.php?action=insertLogProduct` +
        `&date=${encodeURIComponent(getCurrentDateTime())}` +
        `&uname=${encodeURIComponent(Username)}` +
        `&partnum=${encodeURIComponent(serialItem.part_num || (selectedPart ? selectedPart.part_num : ''))}` +
        `&partname=${encodeURIComponent(serialItem.part_name || partName)}` +
        `&supplier=${encodeURIComponent(serialItem.supplier || supplier)}` +
        `&qty=${encodeURIComponent(serialItem.quantity)}` +
        `&location=${encodeURIComponent(selectedLocation.location_name)}` +
        `&storename=${encodeURIComponent(selectedLocation.store_name)}` +
        `&note=${encodeURIComponent(refs.noteRef.current.value || '')}` +
        `&status=${encodeURIComponent("IN")}` +
        `&serial_num=${encodeURIComponent(serialItem.serial || '')}`;

      const res = await fetch(queryString, {
        method: "POST",
      });

      const data = await res.json();
      if (data !== "ok") {
        throw new Error("Failed to save log entry");
      }
    } catch (err) {
      console.error('Error details:', err);
      throw err;
    }
  };

  // แก้ไขฟังก์ชันสำหรับอัพเดท stock
  const updateStock = async (serialItem) => {
    try {
      const queryString =
        `${import.meta.env.VITE_SERVER}/Store.php?action=updateStock` +
        `&date=${encodeURIComponent(getCurrentDateTime())}` +
        `&uname=${encodeURIComponent(Username)}` +
        `&partnum=${encodeURIComponent(serialItem.part_num || (selectedPart ? selectedPart.part_num : ''))}` +
        `&partname=${encodeURIComponent(serialItem.part_name || partName)}` +
        `&supplier=${encodeURIComponent(serialItem.supplier || supplier)}` +
        `&qty=${encodeURIComponent(serialItem.quantity)}` +
        `&location=${encodeURIComponent(selectedLocation.location_name)}` +
        `&storename=${encodeURIComponent(selectedLocation.store_name)}` +
        `&note=${encodeURIComponent(refs.noteRef.current.value || '')}` +
        `&status=${encodeURIComponent("IN")}` +
        `&serial_num=${encodeURIComponent(serialItem.serial || '')}` +
        `&sup_serial=${encodeURIComponent(serialItem.sup_serial || '')}` +
        `&sup_bar=${encodeURIComponent(serialItem.sup_part_number || '')}` ;

      const res = await fetch(queryString, {
        method: "POST",
      });
      const data = await res.json();
      if (data !== "ok") {
        throw new Error("Failed to update stock");
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  // Refs for form fields
  const refs = {
    partNumRef: useRef(null),
    partNameRef: useRef(null),
    partTypeRef: useRef(null),
    supplierRef: useRef(null),
    qtyRef: useRef(null),
    locationIdRef: useRef(null),
    locationNameRef: useRef(null),
    noteRef: useRef(null),
  };

  return (
    <div className="d-flex justify-content-end">
      <Button className="fw-bold" variant="success" onClick={handleShow}>
        {children || "LoadIn"}
      </Button>

      <Modal size="lg" show={show} onHide={handleClose}>
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>
              <b>Load In Products</b>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row className="mb-3">
              {/* ย้าย Location ขึ้นมาเป็นฟิลด์แรก */}
              <Form.Group as={Col} md="12" className="mb-3" ref={locationInputRef}>
                <Form.Label><b>Location</b></Form.Label>
                <div className="input-group">
                  <Form.Control
                    required
                    type="text"
                    value={locationInput}
                    onChange={handleLocationInputChange}
                    onClick={handleLocationInputClick}
                    placeholder="เลือกตำแหน่งจัดเก็บ (Location) ก่อน..."
                    isInvalid={validated && !selectedLocation}
                  />
                  <div className="input-group-append">
                    <Button
                      variant="outline-secondary"
                      onClick={handleLocationInputClick}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-caret-down-fill" viewBox="0 0 16 16">
                        <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z" />
                      </svg>
                    </Button>
                  </div>
                </div>
                {showLocationDropdown && (
                  <ListGroup
                    className="position-absolute w-100 shadow-sm"
                    style={{ zIndex: 1000, maxHeight: '200px', overflowY: 'auto' }}
                  >
                    {filteredLocations.length > 0 ? (
                      filteredLocations.map(location => (
                        <ListGroup.Item
                          key={location.location_id}
                          action
                          onClick={() => handleLocationSelection(location)}
                          style={{ cursor: 'pointer' }}
                        >
                          {location.location_name} ({location.store_name})
                        </ListGroup.Item>
                      ))
                    ) : (
                      <ListGroup.Item>
                        No matching locations found
                        <Button
                          variant="link"
                          className="w-100 text-primary mt-1"
                          onClick={() => {
                            setShowLocationDropdown(false);
                            // เรียกใช้ component AddLocation
                          }}
                        >
                          <i className="fas fa-plus-circle me-1"></i>
                          Click to add new location
                        </Button>
                      </ListGroup.Item>
                    )}
                  </ListGroup>
                )}
              </Form.Group>

              {/* ย้าย Store Name ขึ้นมา */}
              <Form.Group as={Col} md="12" className="mb-3">
                <Form.Label><b>Store Name</b></Form.Label>
                <Form.Control
                  required
                  type="text"
                  value={storeName}
                  readOnly
                />
              </Form.Group>

              {/* ย้าย Serial Numbers ขึ้นมาเป็นอันดับที่สอง */}
              <Form.Group as={Col} md="12" className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <Form.Label><b>Serial Numbers</b></Form.Label>
                  <Button
                    variant="success"
                    size="sm"
                    className="add-serial-btn" // เพิ่ม class นี้
                    onClick={addSerialRow}
                  >
                    <i className="fas fa-plus"></i> Add Serial
                  </Button>
                </div>

                <Table bordered hover size="sm" className="mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th style={{ width: '40%' }}>Serial Number</th>
                      <th style={{ width: '20%' }}>Part Number</th>
                      <th style={{ width: '20%' }}>Part Name</th>
                      <th style={{ width: '10%' }}>Quantity</th>
                      <th style={{ width: '10%' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedSerials.map((item, index) => (
                      <tr key={index}>
                        <td>
                          <div className="input-group input-group-sm">
                            <Form.Control
                              required
                              type="text"
                              id={`serial-input-${index}`}
                              value={item.serial}
                              onChange={(e) => {
                                const serialValue = e.target.value;
                                const updatedSerials = [...selectedSerials];
                                updatedSerials[index].serial = serialValue;
                                setSelectedSerials(updatedSerials);

                                // เพิ่มเรียกใช้ฟังก์ชันดึงข้อมูล serial
                                handleSerialInputManual(index, serialValue);
                              }}
                              onBlur={(e) => {
                                // ตรวจสอบอีกครั้งเมื่อออกจากช่อง (blur)
                                handleSerialInputManual(index, e.target.value);
                              }}
                              onKeyDown={(e) => {
                                // เมื่อกด Enter ในช่อง Serial
                                if (e.key === 'Enter') {
                                  e.preventDefault(); // ป้องกันการ submit form

                                  // ตรวจสอบข้อมูล serial ที่กรอก
                                  handleSerialInputManual(index, e.target.value);

                                  // ถ้าเป็นรายการสุดท้าย ให้เรียกฟังก์ชัน addSerialRow() เหมือนการกดปุ่ม "Add Serial"
                                  if (index === selectedSerials.length - 1) {
                                    // จำลองการคลิกที่ปุ่ม Add Serial
                                    const addButton = document.querySelector('.add-serial-btn');
                                    if (addButton) {
                                      addButton.click(); // จำลองการคลิกที่ปุ่ม
                                    } else {
                                      // ถ้าไม่พบปุ่ม ก็เรียกฟังก์ชันตรงๆ
                                      addSerialRow();
                                    }
                                  } else {
                                    // ถ้าไม่ใช่รายการสุดท้าย ให้ focus ไปที่ช่อง serial ของรายการถัดไป
                                    const nextRowInput = document.querySelector(`#serial-input-${index + 1}`);
                                    if (nextRowInput) {
                                      nextRowInput.focus();
                                    }
                                  }
                                }
                              }}
                              placeholder="Enter Serial..."
                            />

                          </div>
                        </td>
                        <td>
                          <Form.Control
                            size="sm"
                            type="text"
                            value={item.part_num || ''}
                            readOnly
                          />
                        </td>
                        <td>
                          <Form.Control
                            size="sm"
                            type="text"
                            value={item.part_name || ''}
                            readOnly
                          />
                        </td>
                        <td>
                          <Form.Control
                            size="sm"
                            required
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateSerialQuantity(index, parseInt(e.target.value) || 1)}
                          />
                        </td>
                        <td className="text-center">
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => removeSerialRow(index)}
                            disabled={selectedSerials.length <= 1}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-trash" viewBox="0 0 16 16">
                              <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6Z" />
                              <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1Z" />
                            </svg>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Form.Group>

              <Form.Group as={Col} md="12" className="mb-3">
                <Form.Label><b>Note</b></Form.Label>
                <Form.Control type="text" ref={refs.noteRef} placeholder="บันทึกเพิ่มเติม (ไม่บังคับ)" />
              </Form.Group>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              <b>Close</b>
            </Button>
            <Button type="submit" variant="success" disabled={!selectedLocation}>
              <b>Save</b>
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}

export default LoadIn;