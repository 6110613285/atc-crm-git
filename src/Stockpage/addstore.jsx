import React, { useState, useRef, useEffect } from "react";
import { Button, Modal, Form, Row, Col } from "react-bootstrap";
import Swal from "sweetalert2";

function StoreEdit({ onSave }) {
  const [validated, setValidated] = useState(false);
  const [show, setShow] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);

  

  const handleClose = () => {
    setShow(false);
    setValidated(false);
    // Reset form
    storeNameRef.current.value = '';
    storeDetailRef.current.value = '';
    storeAddressRef.current.value = '';
  };
  
  const handleShow = () => setShow(true);

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
    if (form.checkValidity()) {
      await saveStoreEntry();
    }
    setValidated(true);
  };

  const saveStoreEntry = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER}/Store.php?action=addStore` +
        `&store_name=${encodeURIComponent(storeNameRef.current.value)}` +
        `&store_detail=${encodeURIComponent(storeDetailRef.current.value || '')}` +
        `&store_address=${encodeURIComponent(storeAddressRef.current.value)}` +
        `&datetime=${encodeURIComponent(getCurrentDateTime())}`,
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
        handleClose();
        if (onSave) onSave();
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
    }
  };

  // Refs for form fields
  const storeNameRef = useRef(null);
  const storeDetailRef = useRef(null);
  const storeAddressRef = useRef(null);
  

  return (
    <div className="d-flex justify-content-end">
      <Button className="fw-bold" variant="primary" onClick={handleShow}>
        Add Store
      </Button>

      <Modal show={show} onHide={handleClose}>
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>
              <b>Add Store</b>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row className="mb-3">
              <Form.Group as={Col} md="12" className="mb-3">
                <Form.Label><b>Store Name</b></Form.Label>
                <Form.Control 
                  required 
                  type="text" 
                  ref={storeNameRef}
                  maxLength={50} 
                />
                <Form.Control.Feedback type="invalid">
                  <b>Please enter store name.</b>
                </Form.Control.Feedback>
              </Form.Group>


              <Form.Group as={Col} md="12" className="mb-3">
                <Form.Label><b>Store Address</b></Form.Label>
                <Form.Control 
                  required
                  type="text" 
                  ref={storeAddressRef}
                  maxLength={200}
                />
                <Form.Control.Feedback type="invalid">
                  <b>Please enter store address.</b>
                </Form.Control.Feedback>
              </Form.Group>

              
              <Form.Group as={Col} md="12" className="mb-3">
                <Form.Label><b>Store Detail</b></Form.Label>
                <Form.Control 
                  type="text" 
                  ref={storeDetailRef}
                  maxLength={200}
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

export default StoreEdit;