import React, { useState, useRef , useEffect} from "react";
import { Button, Modal, Form, Row, Col } from "react-bootstrap";
import Swal from "sweetalert2";

function LocationEdit({ onSave }) {
  const [validated, setValidated] = useState(false);
  const [show, setShow] = useState(false);
  const [stores, setStores] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const handleClose = () => {
    setShow(false);
    setValidated(false);
    // Reset form
    locationNameRef.current.value = '';
    locationDetailRef.current.value = '';
  };
  
  const handleShow = () => setShow(true);

  const getCurrentDateTime = () => {
    const now = new Date();
    // Convert to Thai time (UTC+7)
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
      await saveLocationEntry();
    }
    setValidated(true);
  };
  const getStores = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER}/Store.php?action=getStores`,
        {
          method: "GET",
        }
      );
      const data = await res.json();
      if (Array.isArray(data)) {
        setStores(data);
      } else {
        setStores([]);
      }
    } catch (err) {
      console.error('Error fetching stores:', err);
      setStores([]);
    } finally {
      setIsLoading(false);
    }
  };
  const saveLocationEntry = async () => {
    try {
      // ดึงข้อมูล store ที่เลือก
      const selectedStore = stores.find(store => store.store_id === storeIdRef.current.value);
      const storeName = selectedStore ? selectedStore.store_name : '';
      const res = await fetch(
        `${import.meta.env.VITE_SERVER}/Store.php?action=addLo` +
        `&datetime=${encodeURIComponent(getCurrentDateTime())}` +
        `&location_name=${encodeURIComponent(locationNameRef.current.value)}` +
        `&location_detail=${encodeURIComponent(locationDetailRef.current.value || '')}` +
        `&store_id=${encodeURIComponent(storeIdRef.current.value)}` +
        `&store_name=${encodeURIComponent(storeName)}`,
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
  useEffect(() => {
    if (show) {
      getStores();
    }
  }, [show]);
  // Refs for form fields
  const locationNameRef = useRef(null);
  const locationDetailRef = useRef(null);
  const storeIdRef = useRef(null);
  const storeNameRef = useRef(null);

  return (
    <div className="d-flex justify-content-end">
      <Button className="fw-bold" variant="primary" onClick={handleShow}>
        Add Location
      </Button>

      <Modal show={show} onHide={handleClose}>
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>
              <b>Add Location</b>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row className="mb-3">
            <Form.Group as={Col} md="12" className="mb-3">
              <Form.Label><b>Store</b></Form.Label>
              <Form.Select
                required
                ref={storeIdRef}
              >
                <option value="">Select Store</option>
                {stores.map(store => (
                  <option key={store.store_id} value={store.store_id}>
                    {store.store_name}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                <b>Please select a store.</b>
              </Form.Control.Feedback>
            </Form.Group>
              <Form.Group as={Col} md="12" className="mb-3">
                <Form.Label><b>Location Name</b></Form.Label>
                <Form.Control 
                  required 
                  type="text" 
                  ref={locationNameRef}
                  maxLength={50} 
                />
                <Form.Control.Feedback type="invalid">
                  <b>Please enter location name.</b>
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group as={Col} md="12" className="mb-3">
                <Form.Label><b>Location Detail</b></Form.Label>
                <Form.Control 
                  type="text" 
                  ref={locationDetailRef}
                  maxLength={50}
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

export default LocationEdit;