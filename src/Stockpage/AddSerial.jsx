import React, { useState, useEffect, useRef } from "react";
import { Modal, Button, Form, Row, Col, ListGroup, Table } from "react-bootstrap";
import Swal from "sweetalert2";
import { PDFViewer, PDFDownloadLink, Document, Page } from "@react-pdf/renderer";
import { SerialLabelPDF, MultipleSerialDocument } from "./SerialLabelPDF";

function AddSerial({ onSave }) {
  const [show, setShow] = useState(false);
  const [validated, setValidated] = useState(false);
  const [serialCount, setSerialCount] = useState(1);
  const [serialInputs, setSerialInputs] = useState([{ sup_serial: "", sup_part_number: "", packsize: "1", Username: localStorage.getItem("fullname") }]);
  const [parts, setParts] = useState([]);
  const [types, setTypes] = useState([]);
  const [filteredParts, setFilteredParts] = useState([]);
  const [partInput, setPartInput] = useState("");
  const [showPartDropdown, setShowPartDropdown] = useState(false);
  const [selectedPart, setSelectedPart] = useState(null);
  const [selectedTypePrefix, setSelectedTypePrefix] = useState("");
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [savedSerials, setSavedSerials] = useState([]);

  const partInputRef = useRef(null);
  const serialCountRef = useRef(null);

  // ดึงข้อมูล parts และ types
  const fetchData = async () => {
    try {
      // ดึงข้อมูล parts
      const partsResponse = await fetch(`${import.meta.env.VITE_SERVER}/Store.php?action=getParts`);
      const partsData = await partsResponse.json();
      if (partsData) {
        setParts(partsData);
        setFilteredParts(partsData);
      }
      

      // ดึงข้อมูล types
      const typesResponse = await fetch(`${import.meta.env.VITE_SERVER}/Store.php?action=getType`);
      const typesData = await typesResponse.json();
      if (typesData) {
        setTypes(typesData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (partInput) {
      const filtered = parts.filter(part =>
        part.part_name.toLowerCase().includes(partInput.toLowerCase()) ||
        part.part_num.toLowerCase().includes(partInput.toLowerCase())
      );
      setFilteredParts(filtered);
    } else {
      setFilteredParts(parts);
    }
  }, [partInput, parts]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (partInputRef.current && !partInputRef.current.contains(event.target)) {
        setShowPartDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [partInputRef]);

  const findTypePrefix = (partType) => {
    const typeFound = types.find(type => type.type_name === partType || type.type_prefix === partType);
    return typeFound ? typeFound.type_prefix : "";
  };

  const generateSerialNumbers = async () => {
    try {
      const typePrefix = findTypePrefix(selectedPart.part_type);
      setSelectedTypePrefix(typePrefix);

      if (!typePrefix) {
        Swal.fire({
          position: "center",
          icon: "error",
          title: "ไม่พบ Type Prefix สำหรับชิ้นส่วนนี้",
          showConfirmButton: false,
          timer: 2000,
        });
        return;
      }

      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const datePrefix = `${year}${month}${day}`;

      const newSerialInputs = [];

      const response = await fetch(`${import.meta.env.VITE_SERVER}/Store.php?action=getLastSerialCount&date=${datePrefix}`);
      const data = await response.json();

      let startSequence = 1;
      if (data && data.last_count) {
        startSequence = parseInt(data.last_count) + 1;
      }

      for (let i = 0; i < serialCount; i++) {
        const sequence = startSequence + i;
        newSerialInputs.push({
          serial: `${typePrefix}${datePrefix}${String(sequence).padStart(4, '0')}`,
          sup_serial: "",
          sup_part_number: "",
          packsize: "1"
        });
      }

      setSerialInputs(newSerialInputs);

    } catch (error) {
      console.error("Error generating serial numbers:", error);
      Swal.fire({
        position: "center",
        icon: "error",
        title: "เกิดข้อผิดพลาดในการสร้าง Serial Numbers",
        showConfirmButton: false,
        timer: 2000,
      });
    }
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  const handlePartSelection = (part) => {
    setPartInput(part.part_name);
    setSelectedPart(part);
    setShowPartDropdown(false);
  };

  const handlePartInputChange = (e) => {
    setPartInput(e.target.value);
    setSelectedPart(null);
    setShowPartDropdown(true);
  };

  const handleSerialCountChange = (e) => {
    const count = parseInt(e.target.value);
    setSerialCount(count);
    setSerialInputs([]);
  };

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
    setSerialCount(1);
    setSerialInputs([{ sup_serial: "", sup_part_number: "", packsize: "1" }]);
    setPartInput("");
    setSelectedPart(null);
    setSelectedTypePrefix("");
    setShowPartDropdown(false);
  };

  const handleSupSerialChange = (index, value) => {
    const updatedInputs = [...serialInputs];
    updatedInputs[index].sup_serial = value;
    setSerialInputs(updatedInputs);
  };

  const handleSupPartNumberChange = (index, value) => {
    const updatedInputs = [...serialInputs];
    updatedInputs[index].sup_part_number = value;
    setSerialInputs(updatedInputs);
  };

  const handlePacksizeChange = (index, value) => {
    const updatedInputs = [...serialInputs];
    updatedInputs[index].packsize = value;
    setSerialInputs(updatedInputs);
  };

  const handleOpenPrintModal = () => {
    handleClose();
    setShowPrintModal(true);
  };

  const handleClosePrintModal = () => {
    setShowPrintModal(false);
    if (onSave) onSave();
  };

  // ฟังก์ชันสำหรับบันทึกข้อมูลแต่ไม่แสดงหน้าพิมพ์
  const handleSaveOnly = async (event) => {
    event.preventDefault();
    const serialSuccess = await saveSerialData();

    if (serialSuccess) {
      await saveAllLogs(); // บันทึก Log หลังจากบันทึก Serial สำเร็จ
      handleClose();
    }
  };

  // ฟังก์ชันสำหรับบันทึกและแสดงหน้าพิมพ์
  const handleSaveAndPrint = async (event) => {
    event.preventDefault();
    const serialSuccess = await saveSerialData();

    if (serialSuccess) {
      await saveAllLogs(); // บันทึก Log หลังจากบันทึก Serial สำเร็จ
      handleOpenPrintModal();
    }
  };

  const saveAllLogs = async () => {
    if (!selectedPart || serialInputs.length === 0) {
      return false;
    }

    try {
      const username = localStorage.getItem("fullname") || "-";

      // สร้าง Promise สำหรับการบันทึก Log แต่ละรายการ
      const logPromises = serialInputs.map(input => {
        const queryString =
          `${import.meta.env.VITE_SERVER}/Store.php?action=insertLogProduct` +
          `&date=${encodeURIComponent(getCurrentDateTime())}` +
          `&uname=${encodeURIComponent(username)}` +
          `&partnum=${encodeURIComponent(selectedPart.part_num)}` +
          `&partname=${encodeURIComponent(selectedPart.part_name)}` +
          `&supplier=${encodeURIComponent(selectedPart.supplier || '')}` +
          `&qty=${encodeURIComponent(input.packsize || '1')}` +
          `&location=${encodeURIComponent('-')}` +
          `&storename=${encodeURIComponent('-')}` +
          `&note=${encodeURIComponent('Serial Created')}` +
          `&status=${encodeURIComponent("Receive")}` +
          `&serial_num=${encodeURIComponent(input.serial)}`;

        return fetch(queryString, { method: "POST" })
          .then(res => res.json())
          .then(data => {
            if (data !== "ok") {
              throw new Error(`Failed to save log entry for serial ${input.serial}`);
            }
            return data;
          });
      });

      // ทำการบันทึกทั้งหมดพร้อมกัน
      await Promise.all(logPromises);
      return true;
    } catch (err) {
      console.error('Error saving logs:', err);
      return false;
    }
  };


  // แยกฟังก์ชันบันทึกข้อมูลออกมาต่างหาก เพื่อให้สามารถเรียกใช้ได้ทั้งจากปุ่ม Save Only และ Save and Print
  const saveSerialData = async () => {
    const form = document.querySelector('form');
    const username = localStorage.getItem("fullname") || "-";
    const currentDateTime = getCurrentDateTime();

    if (form.checkValidity() === false || !selectedPart) {
      if (!selectedPart) {
        Swal.fire({
          position: "center",
          icon: "error",
          title: "กรุณาเลือกชิ้นส่วน",
          showConfirmButton: false,
          timer: 2000,
        });
      }
      setValidated(true);
      return false;
    }

    // ตรวจสอบว่าได้สร้าง Serial Numbers แล้วหรือไม่
    if (serialInputs.length === 0 || !serialInputs[0].serial) {
      Swal.fire({
        position: "center",
        icon: "error",
        title: "กรุณาสร้าง Serial Numbers ก่อนบันทึก",
        showConfirmButton: false,
        timer: 2000,
      });
      return false;
    }

    // บันทึกข้อมูล
    try {
      const promises = serialInputs.map(input => {
        return fetch(
          `${import.meta.env.VITE_SERVER}/Store.php?action=addSerial` +
          `&part_no=${encodeURIComponent(input.serial)}` +
          `&part_num=${encodeURIComponent(selectedPart.part_num)}` +
          `&part_name=${encodeURIComponent(selectedPart.part_name)}` +
          `&supplier=${encodeURIComponent(selectedPart.supplier || '')}` +
          `&brand=${encodeURIComponent(selectedPart.brand || '')}` +
          `&sup_serial=${encodeURIComponent(input.sup_serial || '')}` +
          `&sup_part_number=${encodeURIComponent(input.sup_part_number || '')}` +
          `&packsize=${encodeURIComponent(input.packsize || '')}` +
          `&username=${encodeURIComponent(username)}` +
          `&date=${encodeURIComponent(currentDateTime)}`,
          {
            method: "POST",
          }
        ).then(res => res.json());
      });

      const results = await Promise.all(promises);

      if (results.every(result => result === "ok")) {
        const serialsToPrint = serialInputs.map(input => ({
          serial: input.serial,
          part_num: selectedPart.part_num,
          part_name: selectedPart.part_name,
          supplier: selectedPart.supplier || '',
          brand: selectedPart.brand || '',
          sup_serial: input.sup_serial || '',
          sup_part_number: input.sup_part_number || '',
          packsize: input.packsize || '1'
        }));

        setSavedSerials(serialsToPrint);

        Swal.fire({
          position: "center",
          icon: "success",
          title: "บันทึกข้อมูลสำเร็จ",
          showConfirmButton: false,
          timer: 1500,
        });

        // ปิด Modal หลังจากบันทึกแล้ว (เฉพาะกรณี Save Only)
        if (onSave) onSave();
        return true;
      } else {
        console.log(results);
        Swal.fire({
          position: "center",
          icon: "error",
          title: "เกิดข้อผิดพลาดในการบันทึกข้อมูล",
          showConfirmButton: false,
          timer: 2000,
        });
        return false;
      }
    } catch (err) {
      console.log(err);
      Swal.fire({
        position: "center",
        icon: "error",
        title: "เกิดข้อผิดพลาดในการบันทึกข้อมูล",
        showConfirmButton: false,
        timer: 2000,
      });
      return false;
    }
  };

  return (
    <>
      <Button variant="primary" className="fw-bold" onClick={handleShow}>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-plus-circle me-1" viewBox="0 0 16 16">
          <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
          <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
        </svg>
        Create Serials
      </Button>

      <Modal size="lg" show={show} onHide={handleClose}>
        <Form noValidate validated={validated}>
          <Modal.Header closeButton>
            <Modal.Title>
              <b>Create Serial Numbers</b>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row className="mb-3">
              <Form.Group as={Col} md="6" className="mb-3 position-relative" ref={partInputRef}>
                <Form.Label><b>Parts</b></Form.Label>
                <div className="input-group">
                  <Form.Control
                    required
                    type="text"
                    value={partInput}
                    onChange={handlePartInputChange}
                    onFocus={() => setShowPartDropdown(true)}
                    onClick={() => setShowPartDropdown(true)}
                    placeholder="พิมพ์เพื่อค้นหาชิ้นส่วน..."
                    isInvalid={validated && !selectedPart}
                  />
                  <div className="input-group-append">
                    <Button
                      variant="outline-secondary"
                      onClick={() => setShowPartDropdown(!showPartDropdown)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-caret-down-fill" viewBox="0 0 16 16">
                        <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z" />
                      </svg>
                    </Button>
                  </div>
                </div>
                {showPartDropdown && (
                  <ListGroup
                    className="position-absolute w-100 shadow-sm"
                    style={{ zIndex: 1000, maxHeight: '200px', overflowY: 'auto' }}
                  >
                    {filteredParts.length > 0 ? (
                      filteredParts.map(part => (
                        <ListGroup.Item
                          key={part.part_num}
                          action
                          onClick={() => handlePartSelection(part)}
                          style={{ cursor: 'pointer' }}
                        >
                          {part.part_name} ({part.part_num}) {part.supplier} {part.brand}
                        </ListGroup.Item>
                      ))
                    ) : (
                      <ListGroup.Item>ไม่พบชิ้นส่วนที่ตรงกับคำค้นหา</ListGroup.Item>
                    )}
                  </ListGroup>
                )}
                <Form.Control.Feedback type="invalid">
                  กรุณาเลือกชิ้นส่วน
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group as={Col} md="6" className="mb-3">
                <Form.Label><b>Quantity</b></Form.Label>
                <Form.Control
                  required
                  type="number"
                  ref={serialCountRef}
                  value={serialCount}
                  onChange={handleSerialCountChange}
                />
              </Form.Group>
            </Row>

            {selectedPart && (
              <div className="mb-3 p-3 border rounded bg-light">
                <h6><b>ข้อมูลชิ้นส่วนที่เลือก</b></h6>
                <Row>
                  <Col md="6">
                    <p><b>Part Number:</b> {selectedPart.part_num}</p>
                    <p><b>Part Name:</b> {selectedPart.part_name}</p>
                  </Col>
                  <Col md="6">
                    <p><b>Supplier:</b> {selectedPart.supplier || "-"}</p>
                    <p><b>Brand:</b> {selectedPart.brand || "-"}</p>
                  </Col>
                </Row>
              </div>
            )}

            <div className="d-flex justify-content-end mb-3">
              <Button
                variant="success"
                className="fw-bold"
                onClick={generateSerialNumbers}
                disabled={!selectedPart}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-repeat me-1" viewBox="0 0 16 16">
                  <path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41zm-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9z" />
                  <path fillRule="evenodd" d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5.002 5.002 0 0 0 8 3zM3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9H3.1z" />
                </svg>
                Create Serial
              </Button>
            </div>

            {serialInputs.length > 0 && serialInputs[0].serial && (
              <div className="mt-3">
                <h6><b>Serial Numbers ที่จะสร้าง</b></h6>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  <Table striped bordered hover responsive variant="dark">
                    <thead>
                      <tr className="text-center">
                        <th>No.</th>
                        <th>Serial Number</th>
                        <th>Supplier SN barcode</th>
                        <th>Supplier part number barcode</th>
                        <th>Pack Size</th>
                      </tr>
                    </thead>
                    <tbody>
                      {serialInputs.map((input, index) => (
                        <tr key={index}>
                          <td className="text-center">{index + 1}</td>
                          <td>{input.serial}</td>
                          <td>
                            <Form.Control
                              type="text"
                              value={input.sup_serial}
                              onChange={(e) => handleSupSerialChange(index, e.target.value)}
                              placeholder="ไม่บังคับกรอก"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  if (index === serialInputs.length - 1) {
                                    document.querySelector('button[type="button"]').focus();
                                  } else {
                                    const nextRow = e.target.closest('tr').nextElementSibling;
                                    if (nextRow) {
                                      nextRow.querySelector('td:nth-child(3) input').focus();
                                    }
                                  }
                                }
                              }}
                            />
                          </td>
                          <td>
                            <Form.Control
                              type="text"
                              value={input.sup_part_number || ''}
                              onChange={(e) => handleSupPartNumberChange(index, e.target.value)}
                              placeholder="ไม่บังคับกรอก"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  e.target.closest('tr').querySelector('td:nth-child(5) input').focus();
                                }
                              }}
                            />
                          </td>
                          <td>
                            <Form.Control
                              type="number"
                              min="1"
                              defaultValue="1"
                              value={input.packsize}
                              onChange={(e) => handlePacksizeChange(index, e.target.value)}
                              required
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  if (index === serialInputs.length - 1) {
                                    document.querySelector('button[type="button"]').focus();
                                  } else {
                                    const nextRow = e.target.closest('tr').nextElementSibling;
                                    if (nextRow) {
                                      nextRow.querySelector('td:nth-child(3) input').focus();
                                    }
                                  }
                                }
                              }}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" className="fw-bold" onClick={handleClose}>
              <b>ยกเลิก</b>
            </Button>

            {/* เพิ่มปุ่มบันทึกอย่างเดียว */}
            <Button variant="success" type="button" className="fw-bold me-2" onClick={handleSaveOnly}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-save me-1" viewBox="0 0 16 16">
                <path d="M2 1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H9.5a1 1 0 0 0-1 1v7.293l2.646-2.647a.5.5 0 0 1 .708.708l-3.5 3.5a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L7.5 9.293V2a2 2 0 0 1 2-2H14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h2.5a.5.5 0 0 1 0 1H2z" />
              </svg>
              <b>บันทึก</b>
            </Button>

            {/* ปุ่มบันทึกและพิมพ์เดิม */}
            <Button variant="primary" type="button" className="fw-bold" onClick={handleSaveAndPrint}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-save me-1" viewBox="0 0 16 16">
                <path d="M2 1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H9.5a1 1 0 0 0-1 1v7.293l2.646-2.647a.5.5 0 0 1 .708.708l-3.5 3.5a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L7.5 9.293V2a2 2 0 0 1 2-2H14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h2.5a.5.5 0 0 1 0 1H2z" />
              </svg>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-printer me-1" viewBox="0 0 16 16">
                <path d="M2.5 8a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z" />
                <path d="M5 1a2 2 0 0 0-2 2v2H2a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1v1a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-1h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1V3a2 2 0 0 0-2-2H5zM4 3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2H4V3zm1 5a2 2 0 0 0-2 2v1H2a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v-1a2 2 0 0 0-2-2H5zm7 2v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1z" />
              </svg>
              <b>บันทึกและพิมพ์</b>
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal
        show={showPrintModal}
        onHide={handleClosePrintModal}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>พิมพ์ป้าย Serial Number</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {savedSerials.length > 0 && (
            <>
              <h6 className="mb-3">
                <b>ตัวอย่างป้ายที่จะพิมพ์ ({savedSerials.length} ป้าย)</b>
              </h6>

              <PDFViewer width="100%" height="400px">
                <MultipleSerialDocument serialsData={savedSerials} />
              </PDFViewer>

              <div className="d-flex justify-content-center mt-3">
                <PDFDownloadLink
                  document={<MultipleSerialDocument serialsData={savedSerials} />}
                  fileName={`serial-labels-${savedSerials[0]?.serial || 'serial'}.pdf`}
                >
                  {({ blob, url, loading, error }) => {
                    if (error) {
                      console.error("Error creating PDF:", error);
                    }
                    return loading ? (
                      <Button variant="primary" disabled>
                        กำลังสร้างไฟล์ PDF...
                      </Button>
                    ) : (
                      <Button variant="primary">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="currentColor"
                          className="bi bi-download me-1"
                          viewBox="0 0 16 16"
                        >
                          <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z" />
                          <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z" />
                        </svg>
                        ดาวน์โหลด PDF สำหรับพิมพ์
                      </Button>
                    );
                  }}
                </PDFDownloadLink>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClosePrintModal}>
            เสร็จสิ้น
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default AddSerial;