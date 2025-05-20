import React, { useState, useRef, useEffect } from "react";
import { Button, Modal, Form, Row, Col, ListGroup, Table } from "react-bootstrap";
import Swal from "sweetalert2";

function LoadOut({ onSave, Username = localStorage.getItem("fullname"), children }) {
  const [validated, setValidated] = useState(false);
  const [show, setShow] = useState(false);
  const [stockParts, setStockParts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [serials, setSerials] = useState([]);
  const [selectedPart, setSelectedPart] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [partName, setPartName] = useState('');
  const [supplier, setSupplier] = useState('');
  const [selectedSerials, setSelectedSerials] = useState([{ serial: "", quantity: 1 }]);

  const [locationInput, setLocationInput] = useState("");
  const [serialInput, setSerialInput] = useState("");
  const [filteredStockParts, setFilteredStockParts] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [filteredSerials, setFilteredSerials] = useState([]);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [storeName, setStoreName] = useState('');

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
    setLocationInput("");
    setSerialInput("");
    setPartName("");
    setSupplier("");
    setStoreName("");
    setSelectedSerials([{ serial: "", quantity: 1 }]);
    setShowLocationDropdown(false);

    // Reset all refs
    Object.values(refs).forEach(ref => {
      if (ref.current) {
        ref.current.value = "";
      }
    });
  };

  useEffect(() => {
    fetchStockParts();
    fetchLocations();
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (locationInputRef.current && !locationInputRef.current.contains(event.target)) {
        setShowLocationDropdown(false);
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

  // กรองรายการ Serials ตามข้อความที่พิมพ์
  useEffect(() => {
    if (serialInput) {
      const filtered = serials.filter(serial =>
        serial.serial_num.toLowerCase().includes(serialInput.toLowerCase()) ||
        (serial.part_num && serial.part_num.toLowerCase().includes(serialInput.toLowerCase())) ||
        (serial.part_name && serial.part_name.toLowerCase().includes(serialInput.toLowerCase()))
      );
      setFilteredSerials(filtered);
    } else {
      setFilteredSerials(serials);
    }
  }, [serialInput, serials]);

  const fetchStockParts = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SERVER}/Store.php?action=getStockParts`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setStockParts(data);
        setFilteredStockParts(data);
      } else {
        setStockParts([]);
        setFilteredStockParts([]);
      }
    } catch (error) {
      console.error("Error fetching stock parts:", error);
      setStockParts([]);
      setFilteredStockParts([]);
    }
  };

  // ฟังก์ชันดึงข้อมูลจาก tb_location
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

  const handleLocationInputChange = (e) => {
    setLocationInput(e.target.value);
    setSelectedLocation(null);
    setStoreName('');
    setShowLocationDropdown(true);
  };

  const handleLocationInputClick = () => {
    setShowLocationDropdown(true);
  };

  const handleLocationSelection = (location) => {
    setLocationInput(location.location);
    setStoreName(location.store_name || '');
    setSelectedLocation({
      location_name: location.location,
      store_name: location.store_name
    });
    setShowLocationDropdown(false);
    
    // โหลด serial numbers สำหรับ location นี้
    loadSerialsForLocation(location.location);
  };

  // ฟังก์ชันโหลด serials จาก location ที่เลือก
  const loadSerialsForLocation = async (locationName) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SERVER}/Store.php?action=getSerialsForLocation&location=${encodeURIComponent(locationName)}`
      );
      const data = await response.json();
      if (Array.isArray(data)) {
        setSerials(data);
        setFilteredSerials(data);
      } else {
        setSerials([]);
        setFilteredSerials([]);
      }
    } catch (error) {
      console.error("Error loading serials for location:", error);
      setSerials([]);
      setFilteredSerials([]);
    }
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
    
    // ตรวจสอบว่าจำนวนที่ใส่ไม่เกินจำนวนที่มีอยู่
    const maxQty = updatedSerials[index].max_quantity || 1;
    const newQty = quantity > maxQty ? maxQty : quantity;
    
    updatedSerials[index].quantity = newQty;
    setSelectedSerials(updatedSerials);
  };

  const updateSerialInfo = async (index, serialNumber) => {
    if (!serialNumber || !selectedLocation) return;
    
    try {
      // ค้นหาข้อมูล serial จาก serials ที่โหลดมาแล้ว
      const serialInfo = serials.find(s => s.serial_num === serialNumber);
      
      if (serialInfo) {
        const updatedSerials = [...selectedSerials];
        updatedSerials[index] = {
          ...updatedSerials[index],
          serial: serialNumber,
          part_num: serialInfo.part_num,
          part_name: serialInfo.part_name,
          supplier: serialInfo.supplier,
          quantity: 1,
          max_quantity: serialInfo.qty, // เก็บจำนวนสูงสุดที่มีอยู่
          sup_serial: serialInfo.sup_serial || ''
        };
        setSelectedSerials(updatedSerials);
        
        // หากเป็นการเลือก serial แรก และยังไม่ได้เลือก part ให้ดึงข้อมูล part มาแสดงด้วย
        if (index === 0 && !selectedPart) {
          setPartName(serialInfo.part_name || '');
          setSupplier(serialInfo.supplier || '');
          setSelectedPart(serialInfo);
        }
      }
    } catch (error) {
      console.error("Error updating serial info:", error);
    }
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

  // ฟังก์ชันสำหรับบันทึกลง tb_log_product
  const saveLogEntry = async (serialItem) => {
    try {
      const queryString =
        `${import.meta.env.VITE_SERVER}/Store.php?action=insertLogProduct` +
        `&date=${encodeURIComponent(getCurrentDateTime())}` +
        `&uname=${encodeURIComponent(Username)}` +
        `&partnum=${encodeURIComponent(serialItem.part_num)}` +
        `&partname=${encodeURIComponent(serialItem.part_name)}` +
        `&supplier=${encodeURIComponent(serialItem.supplier || supplier)}` +
        `&qty=${encodeURIComponent(serialItem.quantity)}` +
        `&location=${encodeURIComponent(selectedLocation.location_name)}` +
        `&storename=${encodeURIComponent(selectedLocation.store_name)}` +
        `&note=${encodeURIComponent(refs.noteRef.current.value || '')}` +
        `&status=${encodeURIComponent("OUT")}` +
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

  // ฟังก์ชันสำหรับอัพเดท stock
  const updateStock = async (serialItem) => {
    try {
      const queryString =
        `${import.meta.env.VITE_SERVER}/Store.php?action=updateStock` +
        `&date=${encodeURIComponent(getCurrentDateTime())}` +
        `&uname=${encodeURIComponent(Username)}` +
        `&partnum=${encodeURIComponent(serialItem.part_num)}` +
        `&partname=${encodeURIComponent(serialItem.part_name)}` +
        `&supplier=${encodeURIComponent(serialItem.supplier || supplier)}` +
        `&qty=${encodeURIComponent(serialItem.quantity)}` +
        `&location=${encodeURIComponent(selectedLocation.location_name)}` +
        `&storename=${encodeURIComponent(selectedLocation.store_name)}` +
        `&note=${encodeURIComponent(refs.noteRef.current.value || '')}` +
        `&status=${encodeURIComponent("OUT")}` +
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
        <Button className="fw-bold" variant="danger" onClick={handleShow}>
            {children || "Load Out"}
        </Button>

      <Modal size="lg" show={show} onHide={handleClose}>
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>
              <b>Load Out - Remove from Stock</b>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row className="mb-3">
              <Form.Group as={Col} md="12" className="mb-3 position-relative" ref={locationInputRef}>
                <Form.Label><b>Location</b></Form.Label>
                <div className="input-group">
                  <Form.Control
                    required
                    type="text"
                    value={locationInput}
                    onChange={handleLocationInputChange}
                    onClick={handleLocationInputClick}
                    placeholder="Select location..."
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
                    {stockParts.length > 0 ? (
                      [...new Map(stockParts.map(item => [item.location, item])).values()].map((item, idx) => (
                        <ListGroup.Item
                          key={idx}
                          action
                          onClick={() => handleLocationSelection(item)}
                          style={{ cursor: 'pointer' }}
                        >
                          {item.location} ({item.store_name})
                        </ListGroup.Item>
                      ))
                    ) : (
                      <ListGroup.Item>No locations with stock found</ListGroup.Item>
                    )}
                  </ListGroup>
                )}
              </Form.Group>

              <Form.Group as={Col} md="6" className="mb-3">
                <Form.Label><b>Store Name</b></Form.Label>
                <Form.Control
                  required
                  type="text"
                  value={storeName}
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
                    className="add-serial-btn"
                    onClick={addSerialRow}
                    disabled={!selectedLocation}
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
                          <Form.Control
                            required
                            size="sm"
                            type="text"
                            id={`serial-input-${index}`}
                            value={item.serial}
                            onChange={(e) => {
                              const updatedSerials = [...selectedSerials];
                              updatedSerials[index].serial = e.target.value;
                              setSelectedSerials(updatedSerials);
                            }}
                            onBlur={(e) => updateSerialInfo(index, e.target.value)}
                            onKeyDown={(e) => {
                              // เมื่อกด Enter ในช่อง Serial
                              if (e.key === 'Enter') {
                                e.preventDefault(); // ป้องกันการ submit form
                                
                                // อัพเดทข้อมูล Serial ที่พิมพ์
                                updateSerialInfo(index, e.target.value);
                                
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
                            disabled={!selectedLocation}
                          />
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
                            max={item.max_quantity || 1}
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
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              <b>Close</b>
            </Button>
            <Button type="submit" variant="danger" disabled={!selectedLocation || !selectedSerials.some(item => item.serial)}>
              <b>Save</b>
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}

export default LoadOut;