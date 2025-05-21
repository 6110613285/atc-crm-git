import React, { useState } from "react";
import { FormControl, Button, Table, Tabs, Tab, Card, Badge, Container, Alert, Modal, Form, } from "react-bootstrap";
import Swal from "sweetalert2";

const getCurrentDateTime = () => {
  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  const time = now.toTimeString().slice(0, 8).replace(/:/g, "-");
  return `${date}_${time}`;
};


function HelloComponent() {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ po: "", qo: "", CUSTOMER: "", Partname: "", QTY: "", Note: "" });
  const [types, setTypes] = useState([]); // สมมุติว่าคุณอยากเก็บ type ที่เพิ่ม



  const saveBucket = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER}/Store.php?action=addBucket` +
        `&po=${encodeURIComponent(getCurrentDateTime())}` +
        `&qo=${encodeURIComponent(partNameRef.current.value)}` +
        `&CUSTOMER=${encodeURIComponent(selectedType)}` +
        `&Partname=${encodeURIComponent(brandRef.current.value)}` +
        `&QTY=${encodeURIComponent(supplierRef.current.value)}` +
        `&Note=${encodeURIComponent(selectedTypeId)}`,
        {
          method: "POST",
        }
      );

      const result = await res.json();

      if (result.success) {
        Swal.fire({
          position: "center",
          icon: "success",
          title: "Saved Success",
          showConfirmButton: false,
          timer: 1500,
        });
      } else {
        console.log(result);
        Swal.fire({
          position: "center",
          icon: "error",
          title: "Failed to save data",
          text: result.message || "",
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



  return (
    <Container className="p-4">
      <h1>Hello</h1>



      <Button variant="primary" onClick={() => setShowModal(true)}>
        Add
      </Button>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Bucket</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="po">
              <Form.Label>PO</Form.Label>
              <Form.Control
                type="text"
                value={formData.po}
                onChange={(e) => setFormData({ ...formData, po: e.target.value })}
                placeholder="Enter PO"
              />
            </Form.Group>

            <Form.Group controlId="qo" className="mt-3">
              <Form.Label>QO</Form.Label>
              <Form.Control
                type="text"
                value={formData.qo}
                onChange={(e) => setFormData({ ...formData, qo: e.target.value })}
                placeholder="Enter QO"
              />
            </Form.Group>

            <Form.Group controlId="CUSTOMER" className="mt-3">
              <Form.Label>CUSTOMER</Form.Label>
              <Form.Control
                type="text"
                value={formData.CUSTOMER}
                onChange={(e) => setFormData({ ...formData, CUSTOMER: e.target.value })}
                placeholder="Enter CUSTOMER"
              />
            </Form.Group>

            <Form.Group controlId="Partname" className="mt-3">
              <Form.Label>Partname</Form.Label>
              <Form.Control
                type="text"
                value={formData.Partname}
                onChange={(e) => setFormData({ ...formData, Partname: e.target.value })}
                placeholder="Enter Partname"
              />
            </Form.Group>

            <Form.Group controlId="QTY" className="mt-3">
              <Form.Label>QTY</Form.Label>
              <Form.Control
                type="text"
                value={formData.QTY}
                onChange={(e) => setFormData({ ...formData, QTY: e.target.value })}
                placeholder="Enter QTY"
              />
            </Form.Group>

            <Form.Group controlId="Note" className="mt-3">
              <Form.Label>Note</Form.Label>
              <Form.Control
                type="text"
                value={formData.Note}
                onChange={(e) => setFormData({ ...formData, Note: e.target.value })}
                placeholder="Enter Note"
              />
            </Form.Group>

          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button
            variant="success"
            onClick={() => saveBucket(formData)}
          >
            Save
          </Button>

        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default HelloComponent;
