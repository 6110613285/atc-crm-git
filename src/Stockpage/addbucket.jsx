import React, { useState, useRef, useEffect } from "react";
import { Button, Modal, Form, Row, Col, ListGroup } from "react-bootstrap";
import Swal from "sweetalert2";

function addBucket({ onSave }) {
  const Username = localStorage.getItem("fullname");
  const [validated, setValidated] = useState(false);
  const [show, setShow] = useState(false);
  const [types, setTypes] = useState([]);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedTypeId, setSelectedTypeId] = useState(null);
  const [partNumber, setPartNumber] = useState("");
  const [typeInput, setTypeInput] = useState("");
  const [filteredTypes, setFilteredTypes] = useState([]);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  
  const typeInputRef = useRef(null);
  
  // ย้าย Refs มาไว้ด้านบน
  const uidRef = useRef(null);
  const poRef = useRef(null);
  const qoRef = useRef(null);
  const customerRef = useRef(null);
  const bucketIdRef = useRef(null);
  const userIdRef = useRef(null);
  const usernameRef = useRef(null);
  const partNameRef = useRef(null);
  const qtyRef = useRef(null);
  const statusRef = useRef(null);
  const noteRef = useRef(null);
  
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
    setSelectedType(null);
    setSelectedTypeId(null);
    setPartNumber("");
    setTypeInput("");
    setShowTypeDropdown(false);
    setFilteredTypes(types);
  };

  useEffect(() => {
    fetchTypes();
  }, []);

  useEffect(() => {
    if (typeInput) {
      const filtered = types.filter(type => 
        type.type_name.toLowerCase().includes(typeInput.toLowerCase()) ||
        type.type_prefix.toLowerCase().includes(typeInput.toLowerCase())
      );
      setFilteredTypes(filtered);
    } else {
      setFilteredTypes(types);
    }
  }, [typeInput, types]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (typeInputRef.current && !typeInputRef.current.contains(event.target)) {
        setShowTypeDropdown(false);
      }
    }
    
    if (show) { // เฉพาะเมื่อ modal เปิดอยู่
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [show]);

  const fetchTypes = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SERVER}/Store.php?action=getType`);
      const data = await response.json();
      if (data) {
        setTypes(data);
        setFilteredTypes(data);
      }
    } catch (error) {
      console.error("Error fetching types:", error);
    }
  };

  const generatePartNumber = async (typeId, typePrefix) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SERVER}/Store.php?action=getLastGen&type_id=${typeId}`);
      const data = await response.json();
      
      if (data && data.last_gen !== null) {
        const gen = parseInt(data.last_gen);
        const formattedGen = String(gen).padStart(5, '0');
        const newPartNumber = `${typePrefix}${formattedGen}`;
        setPartNumber(newPartNumber);
        return newPartNumber;
      } else {
        console.error("Error getting last gen:", data);
        return null;
      }
    } catch (error) {
      console.error("Error generating part number:", error);
      return null;
    }
  };

  const handleTypeSelection = (type) => {
    setTypeInput(`${type.type_name} (${type.type_prefix})`);
    setSelectedType(type.type_prefix);
    setSelectedTypeId(type.type_id);
    setShowTypeDropdown(false);
    
    // Generate part number when type is selected
    generatePartNumber(type.type_id, type.type_prefix);
  };

  const handleTypeInputChange = (e) => {
    setTypeInput(e.target.value);
    setSelectedType(null);
    setSelectedTypeId(null);
    setPartNumber("");
    setShowTypeDropdown(true);
  };

  const handleTypeInputFocus = () => {
    setShowTypeDropdown(true);
  };

  const handleTypeInputClick = () => {
    setShowTypeDropdown(true);
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
    const form = event.currentTarget;
    saveBucketEntry();
    setValidated(true);
  };

  // ปุ่ม save - แก้ไข syntax error
  const saveBucketEntry = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER}/Store.php?action=saveBucket` +
        `&UID=${encodeURIComponent(uidRef.current?.value || '')}` +
        `&PO=${encodeURIComponent(poRef.current?.value || '')}` +
        `&QO=${encodeURIComponent(qoRef.current?.value || '')}` +
        `&CUSTOMER=${encodeURIComponent(customerRef.current?.value || '')}` +
        `&BucketID=${encodeURIComponent("test")}` +
        `&USERID=${encodeURIComponent("5555")}` +
        `&USERNAME=${encodeURIComponent(usernameRef.current?.value || '')}` +
        `&Partname=${encodeURIComponent(typeInput)}` +
        `&QTY=${encodeURIComponent(qtyRef.current?.value || '')}` +
        `&status=${encodeURIComponent("napprove")}` +
        `&datetime=${encodeURIComponent(getCurrentDateTime())}` +
        `&Note=${encodeURIComponent(noteRef.current?.value || '')}`,
        {
          method: "POST",
        }
      );

      const data = await res.json();

      if (data.status === "success") {
        Swal.fire({
          icon: "success",
          title: "บันทึกข้อมูลสำเร็จ",
          timer: 1500,
          showConfirmButton: false,
        });
        handleClose(); // ปิด modal หลังบันทึกสำเร็จ
        if (onSave) onSave(); // เรียก callback ถ้ามี
      } else {
        Swal.fire({
          icon: "error",
          title: "ไม่สามารถบันทึกได้",
          text: data.message || "เกิดข้อผิดพลาด",
        });
      }
    } catch (error) {
      console.error("Error saving bucket:", error);
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: error.message,
      });
    }
  };

  return (
    <div className="d-flex justify-content-end">
      <Button className="fw-bold" variant="primary" onClick={handleShow}>
        Add Bucket
      </Button>

      <Modal 
        size="lg" 
        show={show} 
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
        aria-labelledby="modal-title"
        aria-hidden={!show}
        role="dialog"
      >
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title id="modal-title">
              <b>Add Bucket</b>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row className="mb-3">

              {/* หน้า popup addbucket */}
              <Form.Group as={Col} md="6" className="mb-3">
                <Form.Label><b>PO</b></Form.Label>
                <Form.Control required type="text" ref={poRef} />
              </Form.Group>

              <Form.Group as={Col} md="6" className="mb-3">
                <Form.Label><b>QO</b></Form.Label>
                <Form.Control required type="text" ref={qoRef} />
              </Form.Group>

              <Form.Group as={Col} md="6" className="mb-3">
                <Form.Label><b>CUSTOMER</b></Form.Label>
                <Form.Control required type="text" ref={customerRef} />
              </Form.Group>

              <Form.Group as={Col} md="6" className="mb-3">
                <Form.Label><b>USERNAME</b></Form.Label>
                <Form.Control required type="text" ref={usernameRef} />
              </Form.Group>

              <Form.Group as={Col} md="6" className="mb-3">
                <Form.Label><b>QTY</b></Form.Label>
                <Form.Control required type="number" ref={qtyRef} />
              </Form.Group>

              <Form.Group as={Col} md="12" className="mb-3" ref={typeInputRef}>
                <Form.Label><b>Partname</b></Form.Label>
                <div className="input-group" style={{ position: 'relative' }}>
                  <Form.Control 
                    required 
                    type="text" 
                    value={typeInput}
                    onChange={handleTypeInputChange}
                    onFocus={handleTypeInputFocus}
                    onClick={handleTypeInputClick}
                    placeholder="Type to search..."
                    isInvalid={validated && !selectedType}
                  />
                  <div className="input-group-append">
                    <Button 
                      variant="outline-secondary" 
                      onClick={handleTypeInputClick}
                      type="button"
                      tabIndex={-1}
                      aria-hidden="true"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-caret-down-fill" viewBox="0 0 16 16">
                        <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
                      </svg>
                    </Button>
                  </div>
                  
                  {/* Dropdown List */}
                  {showTypeDropdown && filteredTypes.length > 0 && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        zIndex: 1000,
                        maxHeight: '200px',
                        overflowY: 'auto',
                        border: '1px solid #ccc',
                        backgroundColor: 'white',
                        borderRadius: '0.25rem'
                      }}
                      role="listbox"
                      aria-label="Type selection dropdown"
                    >
                      {filteredTypes.map((type) => (
                        <div
                          key={type.type_id}
                          role="option"
                          tabIndex={0}
                          onClick={() => handleTypeSelection(type)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleTypeSelection(type);
                            }
                          }}
                          style={{ 
                            cursor: 'pointer',
                            padding: '8px 12px',
                            borderBottom: '1px solid #eee',
                            backgroundColor: 'white'
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                        >
                          {type.type_name} ({type.type_prefix})
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <Form.Control.Feedback type="invalid">
                  Please select a valid part type.
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group as={Col} md="12" className="mb-3">
                <Form.Label><b>Note</b></Form.Label>
                <Form.Control 
                  type="text" 
                  ref={noteRef} 
                  as="textarea" 
                  rows={3}
                />
              </Form.Group>

            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose} type="button">
              <b>Close</b>
            </Button>
            <Button type="submit" variant="success">
              <b>Save</b>
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}

export default addBucket;