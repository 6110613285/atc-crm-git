import React, { useState, useRef, useEffect } from "react";
import { Button, Modal, Form, Row, Col, ListGroup, Table } from "react-bootstrap";
import Swal from "sweetalert2";

function ProductEdit({ onSave }) {
  const Username = localStorage.getItem("fullname")
  const [validated, setValidated] = useState(false);
  const [show, setShow] = useState(false);
  const [parts, setParts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [serials, setSerials] = useState([]);
  const [selectedPart, setSelectedPart] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedAction, setSelectedAction] = useState("");
  const [partName, setPartName] = useState('');
  const [supplier, setSupplier] = useState('');
  const [stockParts, setStockParts] = useState([]);
  const [borrowedParts, setBorrowedParts] = useState([]);
  const [activeSerialRow, setActiveSerialRow] = useState(null);
  // State สำหรับเก็บรายการ Serial Numbers ที่เลือก
  const [selectedSerials, setSelectedSerials] = useState([{ serial: "", quantity: 1 }]);

  const [partInput, setPartInput] = useState("");
  const [locationInput, setLocationInput] = useState("");
  const [serialInput, setSerialInput] = useState("");
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [filteredSerials, setFilteredSerials] = useState([]);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showSerialDropdown, setShowSerialDropdown] = useState(false);

  const partInputRef = useRef(null);
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

  const resetForm = () => {
    setValidated(false);
    setSelectedPart(null);
    setSelectedLocation(null);
    setSelectedAction("");
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
    setActiveSerialRow(null); // เพิ่มบรรทัดนี้

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
    fetchStockParts();
    fetchBorrowedParts();
    fetchSerials();
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (partInputRef.current && !partInputRef.current.contains(event.target)) {
        setShowPartDropdown(false);
      }
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
    if (selectedAction === "IN") {
      if (partInput) {
        const filtered = parts.filter(part =>
          part.part_num.toLowerCase().includes(partInput.toLowerCase()) ||
          (part.part_name && part.part_name.toLowerCase().includes(partInput.toLowerCase()))
        );
        setFilteredParts(filtered);
      } else {
        setFilteredParts(parts);
      }
    } else if (selectedAction === "OUT" || selectedAction === "BORROW") {
      if (partInput) {
        const filtered = stockParts.filter(part =>
          part.part_num.toLowerCase().includes(partInput.toLowerCase()) ||
          (part.part_name && part.part_name.toLowerCase().includes(partInput.toLowerCase()))
        );
        setFilteredStockParts(filtered);
      } else {
        setFilteredStockParts(stockParts);
      }
    } else if (selectedAction === "RETURN") {
      if (partInput) {
        const filtered = borrowedParts.filter(part =>
          part.part_num.toLowerCase().includes(partInput.toLowerCase()) ||
          (part.part_name && part.part_name.toLowerCase().includes(partInput.toLowerCase()))
        );
        setFilteredBorrowedParts(filtered);
      } else {
        setFilteredBorrowedParts(borrowedParts);
      }
    }
  }, [partInput, selectedAction, parts, stockParts, borrowedParts]);

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

  // กรองรายการ Serials ตามข้อความที่พิมพ์
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
      }
    } catch (error) {
      console.error("Error fetching locations:", error);
    }
  };

  const fetchStockParts = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SERVER}/Store.php?action=getStockParts`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setStockParts(data);
      } else {
        setStockParts([]);
      }
    } catch (error) {
      console.error("Error fetching stock parts:", error);
      setStockParts([]);
    }
  };

  const fetchBorrowedParts = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SERVER}/Store.php?action=getBorrowedParts`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setBorrowedParts(data);
      } else {
        setBorrowedParts([]);
      }
    } catch (error) {
      console.error("Error fetching borrowed parts:", error);
      setBorrowedParts([]);
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

  const handlePartInputClick = () => {
    setShowPartDropdown(true);
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

  const handlePartSelection = (part) => {
    if (selectedAction === "IN") {
      setPartInput(part.part_num);
      setPartName(part.part_name || '');
      setSupplier(part.supplier || '');
      setSelectedPart(part);
    } else if (selectedAction === "OUT" || selectedAction === "BORROW") {
      setPartInput(`${part.part_num} - Stock: ${part.qty}`);
      setPartName(part.part_name || '');
      setSupplier(part.supplier || '');
      setSelectedPart(part);
      // ตั้งค่า Location อัตโนมัติ
      setStoreName(part.store_name || '');
      setSelectedLocation({
        location_id: part.location_id,
        location_name: part.location,
        store_name: part.store_name
      });
    } else if (selectedAction === "RETURN") {
      setPartInput(`${part.part_num} - Borrowed: ${part.qty}`);
      setPartName(part.part_name || '');
      setSupplier(part.supplier || '');
      setSelectedPart(part);
      setStoreName(part.store_name || '');
      setSelectedLocation({
        location_id: part.location_id,
        location_name: part.location,
        store_name: part.store_name
      });
    }
    setShowPartDropdown(false);
  };

  const loadSerialsForLocation = async (locationName) => {
    try {
      // กรณี OUT จะดึงข้อมูล serials จาก tb_stock ตาม location ที่เลือก
      if (selectedAction === "OUT") {
        const response = await fetch(
          `${import.meta.env.VITE_SERVER}/Store.php?action=getSerialsForLocation&location=${locationName}`
        );
        const data = await response.json();
        if (Array.isArray(data)) {
          // แปลงข้อมูลให้ตรงกับโครงสร้างที่ใช้ในส่วนอื่น
          const formattedData = data.map(item => ({
            ...item,
            part_no: item.serial_num,
          }));
          setSerials(formattedData);
          setFilteredSerials(formattedData);
        } else {
          setSerials([]);
          setFilteredSerials([]);
        }
      }
    } catch (error) {
      console.error("Error loading serials for location:", error);
      setSerials([]);
      setFilteredSerials([]);
    }
  };

  const handleLocationSelection = (location) => {
    setLocationInput(location.location_name);
    setStoreName(location.store_name || '');
    setSelectedLocation(location);
    setShowLocationDropdown(false);
  };

  // ฟังก์ชันจัดการการเลือก Serial
  // แก้ไขฟังก์ชันสำหรับการเลือก Serial
const handleSerialSelection = (serial) => {
  // ตรวจสอบว่ามี ref และ index ที่ถูกต้องหรือไม่
  if (!serialInputRef.current || serialInputRef.current.index === undefined) {
    return;
  }
  
  const index = serialInputRef.current.index;
  
  // ในกรณี OUT ดึงข้อมูลจาก stock
  if (selectedAction === "OUT") {
    // ค้นหาข้อมูลใน serials ที่โหลดมาจาก location ที่เลือก
    const stockSerial = serials.find(item => item.serial_num === serial.part_no);
    
    if (stockSerial) {
      const updatedSerials = [...selectedSerials];
      updatedSerials[index] = {
        ...updatedSerials[index],
        serial: serial.part_no,
        part_num: stockSerial.part_num,
        part_name: stockSerial.part_name,
        supplier: stockSerial.supplier,
        quantity: 1, // Default quantity เป็น 1 ผู้ใช้สามารถเปลี่ยนได้
        max_quantity: stockSerial.qty, // เก็บจำนวนสูงสุดที่มีอยู่
        sup_serial: stockSerial.sup_serial || ''
      };
      setSelectedSerials(updatedSerials);
      
      // ถ้ายังไม่ได้เลือก part ให้ใช้ข้อมูลจาก serial ที่เลือก
      if (!selectedPart) {
        setPartName(stockSerial.part_name || '');
        setSupplier(stockSerial.supplier || '');
        setSelectedPart(stockSerial);
      }
    }
  } else {
    // อัพเดตรายการ serial ที่ index ที่กำหนด และเพิ่ม quantity จาก database (สำหรับกรณี IN)
    const updatedSerials = [...selectedSerials];
    updatedSerials[index] = {
      ...updatedSerials[index],
      serial: serial.part_no,
      part_num: serial.part_num,
      part_name: serial.part_name,
      supplier: serial.supplier,
      brand: serial.brand,
      quantity: serial.qty || 1 ,
      sup_serial: serial.sup_serial || ''
    };
    setSelectedSerials(updatedSerials);
    
    // หากเป็นการเลือก serial แรก และยังไม่ได้เลือก part ให้ดึงข้อมูล part มาแสดงด้วย
    if (index === 0 && !selectedPart) {
      const associatedPart = parts.find(p => p.part_num === serial.part_num);
      if (associatedPart) {
        setPartName(associatedPart.part_name || serial.part_name || '');
        setSupplier(associatedPart.supplier || serial.supplier || '');
        setSelectedPart(associatedPart);
      } else {
        setPartName(serial.part_name || '');
        setSupplier(serial.supplier || '');
      }
    }
  }
  
  setShowSerialDropdown(false);
  setActiveSerialRow(null); // รีเซ็ตแถวที่กำลังทำงาน
};

  // ฟังก์ชันสำหรับเพิ่มช่อง Serial เพิ่มเติม
  const addSerialRow = () => {
    setSelectedSerials([...selectedSerials, { serial: "", quantity: 1 }]);
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

    // ตรวจสอบว่ามี Serial ที่เลือกหรือไม่
    if (selectedSerials.length === 0 || selectedSerials.some(item => !item.serial)) {
      Swal.fire({
        position: "center",
        icon: "error",
        title: "โปรดเลือก Serial Number อย่างน้อย 1 รายการ",
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
        `&partnum=${encodeURIComponent(serialItem.part_num || selectedPart.part_num)}` +
        `&partname=${encodeURIComponent(serialItem.part_name || partName)}` +
        `&supplier=${encodeURIComponent(serialItem.supplier || supplier)}` +
        `&qty=${encodeURIComponent(serialItem.quantity)}` +
        `&location=${encodeURIComponent(selectedLocation.location_name)}` +
        `&storename=${encodeURIComponent(selectedLocation.store_name)}` +
        `&note=${encodeURIComponent(refs.noteRef.current.value || '')}` +
        `&status=${encodeURIComponent(selectedAction)}` +
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
        `&partnum=${encodeURIComponent(serialItem.part_num || selectedPart.part_num)}` +
        `&partname=${encodeURIComponent(serialItem.part_name || partName)}` +
        `&supplier=${encodeURIComponent(serialItem.supplier || supplier)}` +
        `&qty=${encodeURIComponent(serialItem.quantity)}` +
        `&location=${encodeURIComponent(selectedLocation.location_name)}` +
        `&storename=${encodeURIComponent(selectedLocation.store_name)}` +
        `&note=${encodeURIComponent(refs.noteRef.current.value || '')}` +
        `&status=${encodeURIComponent(selectedAction)}` +
        `&serial_num=${encodeURIComponent(serialItem.serial || '')}` +
        `&sup_serial=${encodeURIComponent(serialItem.sup_serial || '')}`;

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
    statusRef: useRef(null),
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
      <Button className="fw-bold" variant="primary" onClick={handleShow}>
        Update Stock
      </Button>

      <Modal size="lg" show={show} onHide={handleClose}>
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>
              <b>Update Stock</b>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row className="mb-3">
              <Form.Group as={Col} md="6" className="mb-3">
                <Form.Label><b>Action</b></Form.Label>
                <Form.Select
                  required
                  ref={refs.statusRef}
                  onChange={(e) => setSelectedAction(e.target.value)}
                  value={selectedAction}
                >
                  <option value="">----- SELECT ACTION -----</option>
                  <option value="IN">LoadIn</option>
                  <option value="OUT">LoadOut</option>
                  {/* <option value="BORROW">Borrow</option>
                  <option value="RETURN">GiveBack</option> */}
                </Form.Select>
              </Form.Group>

              {selectedAction && (
                <>
                  <Form.Group as={Col} md="6" className="mb-3 position-relative" ref={locationInputRef}>
                    <Form.Label><b>Location</b></Form.Label>
                    <div className="input-group">
                      <Form.Control
                        required
                        type="text"
                        value={locationInput}
                        onChange={handleLocationInputChange}
                        onClick={handleLocationInputClick}
                        placeholder={selectedAction === "OUT" ? "Select location..." : "Type to search..."}
                        isInvalid={validated && !selectedLocation}
                        readOnly={selectedAction === "BORROW" || selectedAction === "RETURN"}
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
                        {selectedAction === "IN" ? (
                          // แสดงรายการสถานที่สำหรับ IN
                          filteredLocations.length > 0 ? (
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
                                  // เรียกใช้ component AddLo
                                }}
                              >
                                <i className="fas fa-plus-circle me-1"></i>
                                Click to add new location
                              </Button>
                            </ListGroup.Item>
                          )
                        ) : (
                          // แสดงรายการสถานที่สำหรับ OUT
                          stockParts.length > 0 ? (
                            [...new Map(stockParts.map(item => [item.location, item])).values()].map((item, idx) => (
                              <ListGroup.Item
                                key={idx}
                                action
                                onClick={() => {
                                  setLocationInput(item.location);
                                  setStoreName(item.store_name || '');
                                  setSelectedLocation({
                                    location_name: item.location,
                                    store_name: item.store_name
                                  });
                                  setShowLocationDropdown(false);
                            
                                  // โหลด serial numbers สำหรับ location นี้
                                  loadSerialsForLocation(item.location);
                                }}
                                style={{ cursor: 'pointer' }}
                              >
                                {item.location} ({item.store_name})
                              </ListGroup.Item>
                            ))
                          ) : (
                            <ListGroup.Item>No locations found</ListGroup.Item>
                          )
                        )}
                      </ListGroup>
                    )}
                  </Form.Group>

                  <Form.Group as={Col} md="6" className="mb-3">
                    <Form.Label><b>Store Name</b></Form.Label>
                    <Form.Control
                      required
                      type="text"
                      value={selectedLocation ? selectedLocation.store_name : ''}
                      readOnly
                    />
                  </Form.Group>

                  {/* ส่วนแสดงรายการ Serial Numbers */}
                  <Form.Group as={Col} md="12" className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <Form.Label><b>Serial Numbers</b></Form.Label>
                      <Button
                        variant="success"
                        size="sm"
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
                            <td className="position-relative">
                              <div className="input-group input-group-sm">
                                <Form.Control
                                  required
                                  type="text"
                                  id={`serial-input-${index}`}
                                  value={item.serial}
                                  onChange={(e) => {
                                    const updatedSerials = [...selectedSerials];
                                    updatedSerials[index].serial = e.target.value;
                                    setSelectedSerials(updatedSerials);
                                    setSerialInput(e.target.value);
                                    setActiveSerialRow(index); // ตั้งค่าแถวปัจจุบัน
                                    setShowSerialDropdown(true);
                                  }}
                                  onClick={() => handleSerialInputClick(index)}
                                  placeholder="Search Serial..."
                                />
                                <div className="input-group-append">
                                  <Button
                                    variant="outline-secondary"
                                    size="sm"
                                    className="serial-dropdown-btn"
                                    onClick={() => handleSerialInputClick(index)}
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-caret-down-fill" viewBox="0 0 16 16">
                                      <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z" />
                                    </svg>
                                  </Button>
                                </div>
                              </div>
                              {showSerialDropdown && activeSerialRow === index && (
                                <ListGroup
                                  className="position-absolute w-100 shadow-sm serial-dropdown"
                                  style={{ zIndex: 1000, maxHeight: '200px', overflowY: 'auto' }}
                                >
                                  {filteredSerials.length > 0 ? (
                                    filteredSerials.map(serial => (
                                      <ListGroup.Item
                                        key={serial.part_no}
                                        action
                                        onClick={() => handleSerialSelection(serial)}
                                        style={{ cursor: 'pointer' }}
                                      >
                                        {serial.part_no} - {serial.part_name} (Qty: {serial.qty || 1})
                                      </ListGroup.Item>
                                    ))
                                  ) : (
                                    <ListGroup.Item>No matching serials found</ListGroup.Item>
                                  )}
                                </ListGroup>
                              )}
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
                                  <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1ZM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118ZM2.5 3h11V2h-11v1Z" />
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
                    <Form.Control type="text" ref={refs.noteRef} />
                  </Form.Group>
                </>
              )}
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              <b>Close</b>
            </Button>
            <Button type="submit" variant="success" disabled={!selectedAction || !selectedLocation}>
              <b>Save</b>
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}

export default ProductEdit;