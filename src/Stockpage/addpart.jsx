import React, { useState, useRef, useEffect } from "react";
import { Button, Modal, Form, Row, Col, ListGroup } from "react-bootstrap";
import Swal from "sweetalert2";

function addPart({ onSave }) {
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
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [typeInputRef]);

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
    if (form.checkValidity() === false || !selectedType || !selectedTypeId) {
      event.preventDefault();
      event.stopPropagation();
      if (!selectedType) {
        Swal.fire({
          position: "center",
          icon: "error",
          title: "Please select a valid type",
          showConfirmButton: false,
          timer: 2000,
        });
      }
    } else {
      event.preventDefault();
      event.stopPropagation();
      saveLogEntry();
    }
    setValidated(true);
  };

  const saveLogEntry = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER}/Store.php?action=addPart` +
        `&date=${encodeURIComponent(getCurrentDateTime())}` +
        `&partname=${encodeURIComponent(partNameRef.current.value)}` +
        `&parttype=${encodeURIComponent(selectedType)}` +
        `&type_id=${encodeURIComponent(selectedTypeId)}` +
        `&supplier=${encodeURIComponent(supplierRef.current.value)}` +
        `&brand=${encodeURIComponent(brandRef.current.value)}` +
        `&min=${encodeURIComponent(minRef.current.value || '0')}` +
        `&note=${encodeURIComponent(noteRef.current.value || '')}`,
        {
          method: "POST",
        }
      );
      const data = await res.json();
      if (data === "ok") {
        Swal.fire({
          position: "center",
          icon: "success",
          title: "Saved Success",
          showConfirmButton: false,
          timer: 1500,
        });
        setShow(false);
        onSave(true);
      } else {
        console.log(data);
        Swal.fire({
          position: "center",
          icon: "error",
          title: "Failed to save data",
          showConfirmButton: false,
          timer: 2000,
        });
      }
    } catch (err) {
      console.log(err);
      Swal.fire({
        position: "center",
        icon: "error",
        title: "Something went wrong!",
        showConfirmButton: false,
        timer: 2000,
      });
      onSave(false);
    }
  };

  // Refs for form fields
  const partNumRef = useRef(null);
  const partNameRef = useRef(null);
  const partTypeRef = useRef(null);
  const noteRef = useRef(null);
  const minRef = useRef(null);
  const supplierRef = useRef(null);
  const brandRef = useRef(null);

  return (
    <div className="d-flex justify-content-end">
      <Button className="fw-bold" variant="primary" onClick={handleShow}>
        Add Part
      </Button>

      <Modal size="lg" show={show} onHide={handleClose}>
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>
              <b>Add Part</b>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row className="mb-3">
              <Form.Group as={Col} md="6" className="mb-3 position-relative" ref={typeInputRef}>
                <Form.Label><b>Type</b></Form.Label>
                <div className="input-group">
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
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-caret-down-fill" viewBox="0 0 16 16">
                        <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
                      </svg>
                    </Button>
                  </div>
                </div>
                {showTypeDropdown && (
                  <ListGroup 
                    className="position-absolute w-100 shadow-sm" 
                    style={{ zIndex: 1000, maxHeight: '200px', overflowY: 'auto' }}
                  >
                    {filteredTypes.length > 0 ? (
                      filteredTypes.map(type => (
                        <ListGroup.Item 
                          key={type.type_id} 
                          action 
                          onClick={() => handleTypeSelection(type)}
                          style={{ cursor: 'pointer' }}
                        >
                          {type.type_name} ({type.type_prefix})
                        </ListGroup.Item>
                      ))
                    ) : (
                      <ListGroup.Item>No matching types found</ListGroup.Item>
                    )}
                  </ListGroup>
                )}
                <Form.Control.Feedback type="invalid">
                  Please select a valid type.
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group as={Col} md="6" className="mb-3">
                <Form.Label><b>Part Name</b></Form.Label>
                <Form.Control required type="text" ref={partNameRef} />
              </Form.Group>

              <Form.Group as={Col} md="6" className="mb-3">
                <Form.Label><b>Part Number</b></Form.Label>
                <Form.Control 
                  required 
                  type="text" 
                  ref={partNumRef}
                  value={partNumber}
                  readOnly
                />
              </Form.Group>

              <Form.Group as={Col} md="6" className="mb-3">
                <Form.Label><b>Supplier</b></Form.Label>
                <Form.Control type="text" ref={supplierRef} />
              </Form.Group>

              <Form.Group as={Col} md="6" className="mb-3">
                <Form.Label><b>Brand</b></Form.Label>
                <Form.Control type="text" ref={brandRef} />
              </Form.Group>

              <Form.Group as={Col} md="6" className="mb-3">
                <Form.Label><b>Minimum</b></Form.Label>
                <Form.Control type="text" ref={minRef} />
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
            <Button variant="secondary" onClick={handleClose}>
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

export default addPart;