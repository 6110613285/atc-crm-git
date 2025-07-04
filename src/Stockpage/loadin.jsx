import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Button, Modal, Form, Row, Col, ListGroup, Table, Spinner, Alert } from "react-bootstrap";
import Swal from "sweetalert2";
import QrScanner from "../Stockpage/scan";

function LoadIn({ onSave, Username = "DefaultUser", children }) {
  // Form validation state
  const [validated, setValidated] = useState(false);
  const [show, setShow] = useState(false);
  
  // Data states
  const [parts, setParts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [serials, setSerials] = useState([]);
  
  // Selected items
  const [selectedPart, setSelectedPart] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedSerials, setSelectedSerials] = useState([{ serial: "", quantity: 1 }]);
  
  // Form inputs
  const [partName, setPartName] = useState('');
  const [supplier, setSupplier] = useState('');
  const [storeName, setStoreName] = useState('');
  const [partInput, setPartInput] = useState("");
  const [locationInput, setLocationInput] = useState("");
  const [serialInput, setSerialInput] = useState("");
  
  // Filtered data
  const [filteredParts, setFilteredParts] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [filteredSerials, setFilteredSerials] = useState([]);
  
  // Dropdown states
  const [showPartDropdown, setShowPartDropdown] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showSerialDropdown, setShowSerialDropdown] = useState(false);
  const [activeSerialRow, setActiveSerialRow] = useState(null);
  
  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Refs
  const locationInputRef = useRef(null);
  const serialInputRef = useRef(null);
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

  // Helper functions
  const getCurrentDateTime = useCallback(() => {
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
  }, []);

  const resetForm = useCallback(() => {
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
    setError(null);

    // Reset all refs
    Object.values(refs).forEach(ref => {
      if (ref.current) {
        ref.current.value = "";
      }
    });
  }, []);

  // Modal handlers
  const handleClose = useCallback(() => {
    setShow(false);
    resetForm();
  }, [resetForm]);

  const handleShow = useCallback(() => {
    setShow(true);
    resetForm();
  }, [resetForm]);

  // API calls
  const fetchParts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_SERVER}/Store.php?action=getParts`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      if (data) {
        setParts(data);
        setFilteredParts(data);
      }
    } catch (error) {
      console.error("Error fetching parts:", error);
      setError("Failed to fetch parts data");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLocations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_SERVER}/Store.php?action=getLo`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      if (data) {
        setLocations(data);
        setFilteredLocations(data);
      }
    } catch (error) {
      console.error("Error fetching locations:", error);
      setError("Failed to fetch locations data");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSerials = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_SERVER}/Store.php?action=getSerials`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      if (Array.isArray(data)) {
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
      setError("Failed to fetch serials data");
      setSerials([]);
      setFilteredSerials([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Serial handling functions
  const handleSerialInputManual = useCallback((index, serialNumber) => {
    if (!serialNumber || serialNumber.length < 3) {
      return;
    }

    const foundSerial = serials.find(serial =>
      serial.part_no === serialNumber
    );

    if (foundSerial) {
      setSelectedSerials(prev => {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          serial: foundSerial.part_no,
          part_num: foundSerial.part_num,
          part_name: foundSerial.part_name,
          supplier: foundSerial.supplier,
          brand: foundSerial.brand,
          quantity: foundSerial.qty || 1,
          sup_serial: foundSerial.sup_serial || ''
        };
        return updated;
      });

      setPartInput(foundSerial.part_num || '');
      setPartName(foundSerial.part_name || '');
      setSupplier(foundSerial.supplier || '');

      const associatedPart = parts.find(p => p.part_num === foundSerial.part_num);
      if (associatedPart) {
        setSelectedPart(associatedPart);
      } else {
        setSelectedPart({
          part_num: foundSerial.part_num,
          part_name: foundSerial.part_name,
          supplier: foundSerial.supplier
        });
      }
    } else {
      setSelectedSerials(prev => {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          serial: serialNumber,
          part_num: '',
          part_name: '',
          supplier: '',
          brand: '',
          quantity: 1,
          sup_serial: ''
        };
        return updated;
      });
      console.warn(`Serial number ${serialNumber} not found in database`);
    }
  }, [serials, parts]);

  const addSerialRow = useCallback(() => {
    setSelectedSerials(prev => [...prev, { serial: "", quantity: 1 }]);
    
    // Focus on new input after DOM update
    setTimeout(() => {
      const newRowIndex = selectedSerials.length;
      const newRowInput = document.querySelector(`#serial-input-${newRowIndex}`);
      if (newRowInput) {
        newRowInput.focus();
        newRowInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  }, [selectedSerials.length]);

  const removeSerialRow = useCallback((index) => {
    if (selectedSerials.length > 1) {
      setSelectedSerials(prev => {
        const updated = [...prev];
        updated.splice(index, 1);
        return updated;
      });
    }
  }, [selectedSerials.length]);

  const updateSerialQuantity = useCallback((index, quantity) => {
    setSelectedSerials(prev => {
      const updated = [...prev];
      updated[index].quantity = quantity;
      return updated;
    });
  }, []);

  // Location handlers
  const handleLocationInputChange = useCallback((e) => {
    setLocationInput(e.target.value);
    setSelectedLocation(null);
    setStoreName('');
    setShowLocationDropdown(true);
  }, []);

  const handleLocationInputClick = useCallback(() => {
    setShowLocationDropdown(true);
  }, []);

  const handleLocationSelection = useCallback((location) => {
    setLocationInput(location.location_name);
    setStoreName(location.store_name || '');
    setSelectedLocation(location);
    setShowLocationDropdown(false);

    setTimeout(() => {
      const firstSerialInput = document.querySelector('#serial-input-0');
      if (firstSerialInput) {
        firstSerialInput.focus();
      }
    }, 100);
  }, []);

  // Serial dropdown handlers
  const handleSerialInputChange = useCallback((e) => {
    setSerialInput(e.target.value);
    setShowSerialDropdown(true);
  }, []);

  const handleSerialInputClick = useCallback((index) => {
    setSerialInput("");
    setActiveSerialRow(index);
    setShowSerialDropdown(true);
    serialInputRef.current = { 
      element: document.querySelector(`#serial-input-${index}`), 
      index 
    };
  }, []);

  const handleSerialSelection = useCallback((serial) => {
    if (!serialInputRef.current || serialInputRef.current.index === undefined) {
      return;
    }

    const index = serialInputRef.current.index;
    handleSerialInputManual(index, serial.part_no);
    setShowSerialDropdown(false);
    setActiveSerialRow(null);
  }, [handleSerialInputManual]);

  // QR Scanner handler
  const handleQRScan = useCallback((index, result) => {
    setSelectedSerials(prev => {
      const updated = [...prev];
      updated[index].serial = result;
      return updated;
    });

    handleSerialInputManual(index, result);

    // Auto-advance to next row or create new row
    setTimeout(() => {
      if (index === selectedSerials.length - 1) {
        addSerialRow();
      } else {
        const nextRowInput = document.querySelector(`#serial-input-${index + 1}`);
        if (nextRowInput) {
          nextRowInput.focus();
        }
      }
    }, 500);
  }, [selectedSerials.length, handleSerialInputManual, addSerialRow]);

  // Serial input key handler
  const handleSerialKeyDown = useCallback((e, index) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSerialInputManual(index, e.target.value);

      setTimeout(() => {
        if (index === selectedSerials.length - 1 && e.target.value.trim()) {
          addSerialRow();
        } else if (index < selectedSerials.length - 1) {
          const nextRowInput = document.querySelector(`#serial-input-${index + 1}`);
          if (nextRowInput) {
            nextRowInput.focus();
          }
        }
      }, 200);
    }
  }, [selectedSerials.length, handleSerialInputManual, addSerialRow]);

  // Form submission
  const saveLogEntry = useCallback(async (serialItem) => {
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
        `&note=${encodeURIComponent(refs.noteRef.current?.value || '')}` +
        `&status=${encodeURIComponent("IN")}` +
        `&serial_num=${encodeURIComponent(serialItem.serial || '')}`;

      const res = await fetch(queryString, { method: "POST" });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      
      const data = await res.json();
      if (data !== "ok") {
        throw new Error("Failed to save log entry");
      }
    } catch (err) {
      console.error('Error saving log entry:', err);
      throw err;
    }
  }, [getCurrentDateTime, Username, selectedPart, partName, supplier, selectedLocation]);

  const updateStock = useCallback(async (serialItem) => {
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
        `&note=${encodeURIComponent(refs.noteRef.current?.value || '')}` +
        `&status=${encodeURIComponent("IN")}` +
        `&serial_num=${encodeURIComponent(serialItem.serial || '')}` +
        `&sup_serial=${encodeURIComponent(serialItem.sup_serial || '')}` +
        `&sup_bar=${encodeURIComponent(serialItem.sup_part_number || '')}`;

      const res = await fetch(queryString, { method: "POST" });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      
      const data = await res.json();
      if (data !== "ok") {
        throw new Error("Failed to update stock");
      }
    } catch (err) {
      console.error('Error updating stock:', err);
      throw err;
    }
  }, [getCurrentDateTime, Username, selectedPart, partName, supplier, selectedLocation]);

  const handleSubmit = useCallback(async (event) => {
    event.preventDefault();
    event.stopPropagation();

    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      setValidated(true);
      return;
    }

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
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  }, [selectedLocation, selectedSerials, saveLogEntry, updateStock, onSave]);

  // Memoized filtered data
  const memoizedFilteredLocations = useMemo(() => {
    if (locationInput) {
      return locations.filter(location =>
        location.location_name.toLowerCase().includes(locationInput.toLowerCase())
      );
    }
    return locations;
  }, [locationInput, locations]);

  const memoizedFilteredSerials = useMemo(() => {
    if (serialInput) {
      return serials.filter(serial =>
        serial.part_no.toLowerCase().includes(serialInput.toLowerCase()) ||
        serial.part_num.toLowerCase().includes(serialInput.toLowerCase()) ||
        (serial.part_name && serial.part_name.toLowerCase().includes(serialInput.toLowerCase()))
      );
    }
    return serials;
  }, [serialInput, serials]);

  // Effects
  useEffect(() => {
    fetchParts();
    fetchLocations();
    fetchSerials();
  }, [fetchParts, fetchLocations, fetchSerials]);

  useEffect(() => {
    setFilteredLocations(memoizedFilteredLocations);
  }, [memoizedFilteredLocations]);

  useEffect(() => {
    setFilteredSerials(memoizedFilteredSerials);
  }, [memoizedFilteredSerials]);

  // Click outside handler
  useEffect(() => {
    function handleClickOutside(event) {
      if (locationInputRef.current && !locationInputRef.current.contains(event.target)) {
        setShowLocationDropdown(false);
      }

      let clickedInside = false;
      const serialInputs = document.querySelectorAll('[id^="serial-input-"]');
      const serialButtons = document.querySelectorAll('.serial-dropdown-btn');
      const serialDropdown = document.querySelector(".serial-dropdown");

      serialInputs.forEach(input => {
        if (input.contains(event.target)) clickedInside = true;
      });

      serialButtons.forEach(button => {
        if (button.contains(event.target)) clickedInside = true;
      });

      if (serialDropdown && serialDropdown.contains(event.target)) {
        clickedInside = true;
      }

      if (!clickedInside) {
        setShowSerialDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
            {error && (
              <Alert variant="danger" dismissible onClose={() => setError(null)}>
                {error}
              </Alert>
            )}
            
            {loading && (
              <div className="text-center mb-3">
                <Spinner animation="border" role="status" size="sm">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
              </div>
            )}

            <Row className="mb-3">
              {/* Location Field */}
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
                      </ListGroup.Item>
                    )}
                  </ListGroup>
                )}
              </Form.Group>

              {/* Store Name Field */}
              <Form.Group as={Col} md="12" className="mb-3">
                <Form.Label><b>Store Name</b></Form.Label>
                <Form.Control
                  required
                  type="text"
                  value={storeName}
                  readOnly
                />
              </Form.Group>

              {/* Serial Numbers Table */}
              <Form.Group as={Col} md="12" className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <Form.Label><b>Serial Numbers</b></Form.Label>
                  <Button
                    variant="success"
                    size="sm"
                    className="add-serial-btn"
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
  <div className="d-flex align-items-center gap-2">
    {/* Serial Input Section */}
    <div className="flex-grow-1">
      <div className="input-group input-group-sm">
        <Form.Control
          required
          type="text"
          id={`serial-input-${index}`}
          value={item.serial}
          onChange={(e) => {
            const serialValue = e.target.value;
            setSelectedSerials(prev => {
              const updated = [...prev];
              updated[index].serial = serialValue;
              return updated;
            });

            if (serialValue.length >= 3) {
              handleSerialInputManual(index, serialValue);
            }
          }}
          onBlur={(e) => {
            handleSerialInputManual(index, e.target.value);
          }}
          onKeyDown={(e) => handleSerialKeyDown(e, index)}
          placeholder="Enter Serial..."
          className={`form-control ${item.part_num ? 'is-valid' : ''}`}
          style={{ fontSize: '0.875rem' }}
        />
        
        {item.part_num && (
          <div className="input-group-append">
            <span className="input-group-text bg-success text-white">
              <i className="fas fa-check"></i>
            </span>
          </div>
        )}
      </div>
    </div>

    {/* QR Scanner Button */}
    <div className="flex-shrink-0">
      <QrScanner
        buttonOnly={true}
        readerId={`reader-${index}`}
        onScan={(result) => handleQRScan(index, result)}
      />
    </div>
  </div>

  {/* QR Reader Area - Hidden by default, will show when scanning */}
  <div id={`reader-${index}`} className="mx-auto mt-2" style={{ width: "250px" }}></div>
</td>
                        
                        <td>
                          <Form.Control
                            size="sm"
                            type="text"
                            value={item.part_num || ''}
                            readOnly
                            className={item.part_num ? 'bg-light' : ''}
                          />
                        </td>
                        <td>
                          <Form.Control
                            size="sm"
                            type="text"
                            value={item.part_name || ''}
                            readOnly
                            className={item.part_name ? 'bg-light' : ''}
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

              {/* Note Field */}
              <Form.Group as={Col} md="12" className="mb-3">
                <Form.Label><b>Note</b></Form.Label>
                <Form.Control 
                  type="text" 
                  ref={refs.noteRef} 
                  placeholder="บันทึกเพิ่มเติม (ไม่บังคับ)" 
                />
              </Form.Group>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose} disabled={loading}>
              <b>Close</b>
            </Button>
            <Button 
              type="submit" 
              variant="success" 
              disabled={!selectedLocation || loading}
            >
              {loading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    className="me-2"
                  />
                  Saving...
                </>
              ) : (
                <b>Save</b>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}

export default LoadIn;