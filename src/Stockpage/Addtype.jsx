import React, { useState, useRef } from "react";
import { Button, Modal, Form, Row, Col } from "react-bootstrap";
import Swal from "sweetalert2";

function TypeEdit({ onSave }) {
  const [validated, setValidated] = useState(false);
  const [show, setShow] = useState(false);
  
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleSubmit = async (event) => {
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    } else {
      event.preventDefault();
      event.stopPropagation();
      saveTypeEntry();
    }
    setValidated(true);
  };

  const saveTypeEntry = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER}/Store.php?action=addType` +
        `&type_name=${encodeURIComponent(typeNameRef.current.value)}` +
        `&type_prefix=${encodeURIComponent(typePrefixRef.current.value)}` +
        `&type_detail=${encodeURIComponent(typeDetailRef.current.value || '')}`,
        {
          method: "POST",
        }
      );
      const data = await res.json();
      if (data === "ok") {
        Swal.fire({
          position: "center",
          icon: "success",
          title: "Saved Successfully",
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
  const typeNameRef = useRef(null);
  const typePrefixRef = useRef(null);
  const typeDetailRef = useRef(null);

  return (
    <div className="d-flex justify-content-end">
      <Button className="fw-bold" variant="primary" onClick={handleShow}>
        Add Type
      </Button>

      <Modal show={show} onHide={handleClose}>
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>
              <b>Add Type</b>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row className="mb-3">
              <Form.Group as={Col} md="12" className="mb-3">
                <Form.Label><b>Type Name</b></Form.Label>
                <Form.Control 
                  required 
                  type="text" 
                  ref={typeNameRef}
                  maxLength={50} 
                />
                <Form.Control.Feedback type="invalid">
                  <b>Please enter type name.</b>
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group as={Col} md="12" className="mb-3">
                <Form.Label><b>Type Prefix</b></Form.Label>
                <Form.Control 
                  required 
                  type="text" 
                  ref={typePrefixRef}
                  maxLength={2}
                  style={{ textTransform: 'uppercase' }}
                  onInput={(e) => {
                    e.target.value = e.target.value.toUpperCase();
                    if (e.target.value.length > 2) {
                      e.target.value = e.target.value.slice(0, 2);
                    }
                  }}
                />
                <Form.Text className="text-muted">
                  Enter exactly 2 characters (e.g., AR, CR, TY)
                </Form.Text>
                <Form.Control.Feedback type="invalid">
                  <b>Please enter a 2-character type prefix.</b>
                </Form.Control.Feedback>
              </Form.Group>

              {/* <Form.Group as={Col} md="12" className="mb-3">
                <Form.Label><b>Type Unit</b></Form.Label>
                <Form.Control 
                  required 
                  type="text" 
                  ref={typeUnitRef}
                  maxLength={50}
                />
                <Form.Control.Feedback type="invalid">
                  <b>Please enter type unit.</b>
                </Form.Control.Feedback>
              </Form.Group> */}

              <Form.Group as={Col} md="12" className="mb-3">
                <Form.Label><b>Type Detail</b></Form.Label>
                <Form.Control 
                  type="text" 
                  ref={typeDetailRef}
                  maxLength={50}
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

export default TypeEdit;