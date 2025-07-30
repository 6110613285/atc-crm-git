import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col, Alert } from "react-bootstrap";
import { PDFViewer, PDFDownloadLink } from "@react-pdf/renderer";
import { ComputerLabelPDF, MultipleComputerDocument } from "./SNProductPDF";

function CreateSerialModal({ show, onHide, fixID, customer, onSerialCreated }) {
  const [formData, setFormData] = useState({
    model: "",
    display: "",
    cpu: "",
    ram: "",
    ssd: "",
    password: "1234",
    qty: "1",
  });

  const [previewFormat, setPreviewFormat] = useState(""); // แสดง format ของ serial
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [createdSerials, setCreatedSerials] = useState([]); // เก็บ serial ที่สร้างแล้ว
  const [isLoadingPreview, setIsLoadingPreview] = useState(false); // loading สำหรับ preview
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [savedComputers, setSavedComputers] = useState([]);

  // Function to get next serial number from server
  const getNextSerialNumber = async (model, display, qty = 1) => {
    try {
      if (!model || !display) return "";
      
      setIsLoadingPreview(true);
      
      const apiUrl = `${import.meta.env.VITE_SERVER}/Product.php?action=GetNextSerial&server=${encodeURIComponent(import.meta.env.VITE_DB_SERVER || 'localhost')}&username=${encodeURIComponent(import.meta.env.VITE_DB_USERNAME || '')}&password=${encodeURIComponent(import.meta.env.VITE_DB_PASSWORD || '')}&db=${encodeURIComponent(import.meta.env.VITE_DB_NAME || '')}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model.trim(),
          display: display.trim(),
          qty: parseInt(qty) || 1
        }),
      });

      const responseText = await response.text();
      if (!response.ok) throw new Error('Failed to get next serial number');

      const result = JSON.parse(responseText);
      if (result.success && result.data) {
        const qtyNumber = parseInt(qty) || 1;
        if (qtyNumber === 1) {
          return result.data.nextSerial;
        } else {
          // สำหรับหลายตัว แสดงช่วง
          const firstSerial = result.data.nextSerial;
          const lastCounter = parseInt(firstSerial.slice(-4)) + qtyNumber - 1;
          const lastSerial = firstSerial.slice(0, -4) + lastCounter.toString().padStart(4, '0');
          return `${firstSerial} - ${lastSerial} (${qtyNumber} serials)`;
        }
      }
      
      return "";
    } catch (error) {
      console.error("Error getting next serial:", error);
      return "";
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Generate preview เมื่อมีการเปลี่ยนแปลง
  useEffect(() => {
    const updatePreview = async () => {
      if (formData.model && formData.display && formData.qty) {
        const qtyNumber = parseInt(formData.qty) || 1;
        const preview = await getNextSerialNumber(formData.model, formData.display, qtyNumber);
        setPreviewFormat(preview);
      } else {
        setPreviewFormat("");
      }
    };

    // เพิ่ม delay เล็กน้อยเพื่อไม่ให้เรียก API บ่อยเกินไป
    const debounceTimer = setTimeout(updatePreview, 500);
    return () => clearTimeout(debounceTimer);
  }, [formData.model, formData.display, formData.qty]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess(false);
    setCreatedSerials([]);

    try {
      if (!formData.model || !formData.display || !formData.cpu || !formData.ram || !formData.ssd || !formData.qty) {
        throw new Error("Please fill in all required fields");
      }

      const qtyNumber = parseInt(formData.qty);
      if (isNaN(qtyNumber) || qtyNumber < 1) {
        throw new Error("Quantity must be a valid number greater than 0");
      }

      // ✅ สร้าง serialDataArray ที่จะส่งให้ backend
      const serialDataArray = Array.from({ length: qtyNumber }, () => ({
        Model: formData.model.trim(),
        Display: formData.display.trim(),
        Cpu: formData.cpu.trim(),
        Ram: formData.ram.trim(),
        SSD: formData.ssd.trim(),
        Password: formData.password.trim(),
      }));

      // ✅ ส่งทั้งหมดในครั้งเดียว
      const apiUrl = `${import.meta.env.VITE_SERVER}/Product.php?action=CreateSerial&server=${encodeURIComponent(import.meta.env.VITE_DB_SERVER || 'localhost')}&username=${encodeURIComponent(import.meta.env.VITE_DB_USERNAME || '')}&password=${encodeURIComponent(import.meta.env.VITE_DB_PASSWORD || '')}&db=${encodeURIComponent(import.meta.env.VITE_DB_NAME || '')}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(serialDataArray),
      });

      const responseText = await response.text();
      if (!response.ok) throw new Error(responseText);

      const result = JSON.parse(responseText);
      if (!result.success) throw new Error(result.message || "Failed to create serials");

      // เก็บ serial ที่สร้างสำเร็จ
      setCreatedSerials(result.data || []);
      setSuccess(true);

      // เตรียมข้อมูลสำหรับพิมพ์ป้าย
      const computersForPrint = (result.data || []).map((serial) => ({
        serial: serial.SN,
        cpu: formData.cpu,
        ram: formData.ram,
        ssd: formData.ssd,
        password: formData.password
      }));

      setSavedComputers(computersForPrint);

      if (typeof onSerialCreated === 'function') {
        onSerialCreated(result.data || []);
      }

    } catch (err) {
      console.error("Error creating serial:", err);
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      model: "",
      display: "",
      cpu: "",
      ram: "",
      ssd: "",
      password: "1234",
      qty: "1",
    });
    setPreviewFormat("");
    setCreatedSerials([]);
    setError("");
    setSuccess(false);
    setIsLoading(false);
    setSavedComputers([]);
    setShowPrintModal(false);
    onHide();
  };

  const handleOpenPrintModal = () => {
    setShowPrintModal(true);
  };

  const handleClosePrintModal = () => {
    setShowPrintModal(false);
  };

  return (
    <>
      <Modal show={show} onHide={handleClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Create Serial</Modal.Title>
        </Modal.Header>
        
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {error && (
              <Alert variant="danger" className="mb-3">
                <strong>Error:</strong> {error}
              </Alert>
            )}

            {success && createdSerials.length > 0 && (
              <Alert variant="success" className="mb-3">
                <strong>Success:</strong> {createdSerials.length} serial(s) created successfully!
                <ul className="mb-0 mt-2">
                  {createdSerials.map((serial, index) => (
                    <li key={index}><strong>{serial.SN}</strong></li>
                  ))}
                </ul>
                <div className="mt-2">
                  <Button variant="success" size="sm" onClick={handleOpenPrintModal}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-printer me-1" viewBox="0 0 16 16">
                      <path d="M2.5 8a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z"/>
                      <path d="M5 1a2 2 0 0 0-2 2v2H2a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1v1a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-1h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1V3a2 2 0 0 0-2-2H5zM4 3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2H4V3zm1 5a2 2 0 0 0-2 2v1H2a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v-1a2 2 0 0 0-2-2H5zm7 2v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1z"/>
                    </svg>
                    Print Labels
                  </Button>
                </div>
              </Alert>
            )}

            {/* Preview Serial Number */}
            {(previewFormat || isLoadingPreview) && !success && (
              <Alert variant="info" className="mb-3">
                <strong>Next Serial Number:</strong> 
                {isLoadingPreview ? (
                  <span>
                    <span className="spinner-border spinner-border-sm ms-2 me-1" role="status" aria-hidden="true"></span>
                    Loading...
                  </span>
                ) : (
                  <span className="ms-2 text-primary fw-bold">{previewFormat}</span>
                )}
              </Alert>
            )}

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>
                    Model <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="model"
                    value={formData.model}
                    onChange={handleInputChange}
                    placeholder="Enter model name"
                    required
                    disabled={isLoading}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>
                    Display <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="display"
                    value={formData.display}
                    onChange={handleInputChange}
                    placeholder="e.g., 15.6, 13.3"
                    required
                    disabled={isLoading}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>
                    CPU <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="cpu"
                    value={formData.cpu}
                    onChange={handleInputChange}
                    placeholder="e.g., I5 - 8365U"
                    required
                    disabled={isLoading}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>
                    RAM <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="ram"
                    value={formData.ram}
                    onChange={handleInputChange}
                    placeholder="e.g., 8 GB"
                    required
                    disabled={isLoading}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>
                    SSD <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="ssd"
                    value={formData.ssd}
                    onChange={handleInputChange}
                    placeholder="e.g., 128 GB"
                    required
                    disabled={isLoading}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>
                    Password <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="e.g., 1234"
                    required
                    disabled={isLoading}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>
                    QTY <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="number"
                    name="qty"
                    value={formData.qty}
                    onChange={handleInputChange}
                    placeholder="e.g., 5"
                    min="1"
                    required
                    disabled={isLoading}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          
          <Modal.Footer>
            <Button 
              variant="secondary" 
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              variant="primary" 
              type="submit"
              disabled={isLoading || isLoadingPreview || !previewFormat}
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Creating...
                </>
              ) : (
                `Create ${formData.qty || 1} Serial(s)`
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Print Modal */}
      <Modal
        show={showPrintModal}
        onHide={handleClosePrintModal}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>พิมพ์ป้ายคอมพิวเตอร์</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {savedComputers.length > 0 && (
            <>
              <h6 className="mb-3">
                <b>ตัวอย่างป้ายที่จะพิมพ์ ({savedComputers.length} ป้าย)</b>
              </h6>

              <PDFViewer width="100%" height="400px">
                <MultipleComputerDocument computersData={savedComputers} />
              </PDFViewer>

              <div className="d-flex justify-content-center mt-3">
                <PDFDownloadLink
                  document={<MultipleComputerDocument computersData={savedComputers} />}
                  fileName={`computer-labels-${savedComputers[0]?.serial || 'computer'}.pdf`}
                >
                  {({ blob, url, loading, error }) => {
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
                          <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                          <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
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
            ปิด
          </Button>
          <Button variant="primary" onClick={handleClose}>
            เสร็จสิ้น
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default CreateSerialModal;