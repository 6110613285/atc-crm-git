import React, { useState, useRef } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { Pencil } from "react-bootstrap-icons";
import Swal from "sweetalert2";

function EditItemModal({ show, onHide, item, onSaveSuccess }) {
  const [validated, setValidated] = useState(false);

  // Refs for form fields
  const partNumRef = useRef(null);
  const partNameRef = useRef(null);
  const supplierRef = useRef(null);
  const qtyRef = useRef(null);
  const locationRef = useRef(null);
  const storeNameRef = useRef(null);
  const noteRef = useRef(null);
  const serialNumRef = useRef(null);
  const supSerialRef = useRef(null);
  const supBarcodeRef = useRef(null);

  // ตั้งค่าเริ่มต้นเมื่อเปิด modal
  React.useEffect(() => {
    if (show && item) {
      // ตั้งค่าเริ่มต้นให้กับ form fields
      if (partNumRef.current) partNumRef.current.value = item.part_num || '';
      if (partNameRef.current) partNameRef.current.value = item.part_name || '';
      if (supplierRef.current) supplierRef.current.value = item.supplier || '';
      if (qtyRef.current) qtyRef.current.value = item.qty || '';
      if (locationRef.current) locationRef.current.value = item.location || '';
      if (storeNameRef.current) storeNameRef.current.value = item.store_name || '';
      if (noteRef.current) noteRef.current.value = item.note || '';
      if (serialNumRef.current) serialNumRef.current.value = item.serial_num || '';
      if (supSerialRef.current) supSerialRef.current.value = item.sup_serial || '';
      if (supBarcodeRef.current) supBarcodeRef.current.value = item.sup_barcode || '';
      setValidated(false);
    }
  }, [show, item]);

  const handleClose = () => {
    setValidated(false);
    onHide();
  };

  const handleSubmit = async (event) => {
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    } else {
      event.preventDefault();
      event.stopPropagation();
      await saveEditedItem();
    }
    setValidated(true);
  };

  const saveEditedItem = async () => {
    try {
      const username = localStorage.getItem("fullname") || "Unknown";
      const currentDateTime = new Date().toISOString().slice(0, 19).replace('T', ' ');

      // สร้าง query string แบบเดิมที่ใช้ในโปรเจค (ไม่ต้องส่ง id)
      const queryString = 
        `${import.meta.env.VITE_SERVER}/Store.php?action=updateStockItem` +
        `&part_num=${encodeURIComponent(partNumRef.current.value)}` +
        `&part_name=${encodeURIComponent(partNameRef.current.value)}` +
        `&supplier=${encodeURIComponent(supplierRef.current.value)}` +
        `&qty=${encodeURIComponent(qtyRef.current.value)}` +
        `&location=${encodeURIComponent(locationRef.current.value)}` +
        `&store_name=${encodeURIComponent(storeNameRef.current.value)}` +
        `&note=${encodeURIComponent(noteRef.current.value)}` +
        `&serial_num=${encodeURIComponent(serialNumRef.current.value)}` +
        `&sup_serial=${encodeURIComponent(supSerialRef.current.value)}` +
        `&sup_barcode=${encodeURIComponent(supBarcodeRef.current.value)}` +
        `&updated_by=${encodeURIComponent(username)}` +
        `&updated_at=${encodeURIComponent(currentDateTime)}`;

      const res = await fetch(queryString, {
        method: "POST",
      });

      const data = await res.json();
      
      if (data === "ok") {
        // บันทึก log การแก้ไข
        const logQueryString = 
          `${import.meta.env.VITE_SERVER}/Store.php?action=insertEditLog` +
          `&date=${encodeURIComponent(currentDateTime)}` +
          `&user=${encodeURIComponent(username)}` +
          `&serial_num=${encodeURIComponent(serialNumRef.current.value)}` +
          `&part_num=${encodeURIComponent(partNumRef.current.value)}` +
          `&part_name=${encodeURIComponent(partNameRef.current.value)}` +
          `&action=${encodeURIComponent('EDIT_STOCK_ITEM')}` +
          `&note=${encodeURIComponent('แก้ไขข้อมูลสินค้าใน tb_stock')}`;

        await fetch(logQueryString, {
          method: "POST",
        });

        Swal.fire({
          position: "center",
          icon: "success",
          title: "แก้ไขข้อมูลสำเร็จ!",
          showConfirmButton: false,
          timer: 1500,
        });
        
        handleClose();
        if (onSaveSuccess) {
          onSaveSuccess();
        }
      } else {
        console.log(data);
        Swal.fire({
          position: "center",
          icon: "error",
          title: "ไม่สามารถบันทึกข้อมูลได้",
          showConfirmButton: false,
          timer: 2000,
        });
      }
    } catch (err) {
      console.log(err);
      Swal.fire({
        position: "center",
        icon: "error",
        title: "เกิดข้อผิดพลาด!",
        showConfirmButton: false,
        timer: 2000,
      });
    }
  };

  return (
    <Modal 
      show={show} 
      onHide={handleClose}
      size="lg"
      centered
    >
      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>
            <Pencil className="me-2" />
            <b>แก้ไขข้อมูลสินค้า</b>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="mb-3">
            <Form.Group as={Col} md="6" className="mb-3">
              <Form.Label><b>Part Number</b></Form.Label>
              <Form.Control 
                required 
                type="text" 
                ref={partNumRef}
                maxLength={100} 
              />
              <Form.Control.Feedback type="invalid">
                <b>กรุณากรอก Part Number</b>
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group as={Col} md="6" className="mb-3">
              <Form.Label><b>Serial Number</b></Form.Label>
              <Form.Control 
                type="text" 
                ref={serialNumRef}
                maxLength={100} 
              />
            </Form.Group>

            <Form.Group as={Col} md="12" className="mb-3">
              <Form.Label><b>Part Name</b></Form.Label>
              <Form.Control 
                required 
                type="text" 
                ref={partNameRef}
                maxLength={200} 
              />
              <Form.Control.Feedback type="invalid">
                <b>กรุณากรอก Part Name</b>
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group as={Col} md="6" className="mb-3">
              <Form.Label><b>Supplier</b></Form.Label>
              <Form.Control 
                type="text" 
                ref={supplierRef}
                maxLength={100} 
              />
            </Form.Group>

            <Form.Group as={Col} md="6" className="mb-3">
              <Form.Label><b>Quantity</b></Form.Label>
              <Form.Control 
                required 
                type="number" 
                ref={qtyRef}
                min="0"
              />
              <Form.Control.Feedback type="invalid">
                <b>กรุณากรอกจำนวนสินค้า</b>
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group as={Col} md="6" className="mb-3">
              <Form.Label><b>Location</b></Form.Label>
              <Form.Control 
                type="text" 
                ref={locationRef}
                maxLength={100} 
              />
            </Form.Group>

            <Form.Group as={Col} md="6" className="mb-3">
              <Form.Label><b>Store Name</b></Form.Label>
              <Form.Control 
                type="text" 
                ref={storeNameRef}
                maxLength={100} 
              />
            </Form.Group>

            <Form.Group as={Col} md="6" className="mb-3">
              <Form.Label><b>Supplier Serial</b></Form.Label>
              <Form.Control 
                type="text" 
                ref={supSerialRef}
                maxLength={100} 
              />
            </Form.Group>

            <Form.Group as={Col} md="6" className="mb-3">
              <Form.Label><b>Supplier Barcode</b></Form.Label>
              <Form.Control 
                type="text" 
                ref={supBarcodeRef}
                maxLength={100} 
              />
            </Form.Group>

            <Form.Group as={Col} md="12" className="mb-3">
              <Form.Label><b>Note</b></Form.Label>
              <Form.Control 
                as="textarea"
                rows={3}
                ref={noteRef}
                maxLength={500}
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
  );
}

export default EditItemModal;