import React, { useState, useRef, useEffect } from "react";
import { Button, Modal, Form, Row, Col, ListGroup } from "react-bootstrap";
import Swal from "sweetalert2";

function AddUser({ onSave }) {
  const Username = localStorage.getItem("fullname");
  const [validated, setValidated] = useState(false);
  const [show, setShow] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  
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
    setSelectedRole("");
    // Reset all form fields
    if (usernameRef.current) usernameRef.current.value = "";
    if (fullnameRef.current) fullnameRef.current.value = "";
    if (emailRef.current) emailRef.current.value = "";
    if (passwordRef.current) passwordRef.current.value = "";
    if (phoneRef.current) phoneRef.current.value = "";
    if (noteRef.current) noteRef.current.value = "";
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
    if (form.checkValidity() === false || !selectedRole) {
      event.preventDefault();
      event.stopPropagation();
      if (!selectedRole) {
        Swal.fire({
          position: "center",
          icon: "error",
          title: "Please select a valid role",
          showConfirmButton: false,
          timer: 2000,
        });
      }
    } else {
      event.preventDefault();
      event.stopPropagation();
      saveUserEntry();
    }
    setValidated(true);
  };
const saveUserEntry = async () => {
  try {
    // แยกชื่อ-นามสกุลแบบปลอดภัย
    const fullName = fullnameRef.current.value.trim();
    const nameParts = fullName.split(" ");
    const fname = nameParts[0] || ""; // ชื่อ
    const lname = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "-"; // ถ้าไม่มีนามสกุลให้เป็น "-"

    // Map roles to ENUM values (ปรับตามค่า ENUM ที่มีอยู่จริงในฐานข้อมูล)
    const roleLevelMap = {
      'admin': 'admin',        // หรืออาจจะเป็น 'ADMIN', '1', 'high' ฯล    // อาจจะ map เป็น 'user' level  
      'user': 'user'        // อาจจะ map เป็น 'user' level
    };

    // ตรวจสอบค่า status ENUM ที่มีในฐานข้อมูล
    // จาก PHP code เห็นว่า allowed_statuses = ['active', 'inactive', 'suspended']
    const statusValue = {
      'activation': 'activation',        // หรืออาจจะเป็น 'ADMIN', '1', 'high' ฯล    // อาจจะ map เป็น 'user' level  
      '0': '0'        // อาจจะ map เป็น 'user' level
    };// ใช้ 'active' ตามที่กำหนดใน PHP

    const userData = {
      fname: fname,
      lname: lname,
      fnameth: '',
      lnameth: '',
      department: selectedRole,
      position: selectedRole,
      tel: phoneRef.current.value || '',
      email: emailRef.current.value,
      level: roleLevelMap[selectedRole] || 'user', // Default เป็นค่าที่มีใน ENUM
      status: statusValue, // ใช้ค่าที่ตรงกับ ENUM
      zone: '',
      server_db: '',
      username_db: usernameRef.current.value,
      password_db: passwordRef.current.value,
      name_db: '',
      token: ''
    };

    const res = await fetch(
      `${import.meta.env.VITE_SERVER}/User.php?action=createUser`,
      {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      }
    );

    // ตรวจสอบ response type ก่อน parse JSON
    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await res.text();
      console.error('Non-JSON response:', text);
      throw new Error('Server returned non-JSON response');
    }

    const data = await res.json();

    if (data.success) {
      Swal.fire({
        position: "center",
        icon: "success",
        title: "User Created Successfully",
        text: `User ID: ${data.id}`,
        showConfirmButton: false,
        timer: 2000,
      });
      setShow(false);
      resetForm();
      onSave(true);
    } else {
      console.log(data);
      Swal.fire({
        position: "center",
        icon: "error",
        title: "Failed to create user",
        text: data.message || "Unknown error occurred",
        showConfirmButton: true,
      });
    }
  } catch (err) {
    console.error('Fetch error:', err);
    
    // ถ้าเป็น JSON parse error ให้แสดง response text
    if (err instanceof SyntaxError && err.message.includes('JSON')) {
      console.error('Invalid JSON response - likely PHP error');
    }
    
    Swal.fire({
      position: "center",
      icon: "error",
      title: "Something went wrong!",
      text: "Please check the console for detailed error information.",
      showConfirmButton: true,
    });
    onSave(false);
  }
};

  // Refs for form fields
  const usernameRef = useRef(null);
  const fullnameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const phoneRef = useRef(null);
  const noteRef = useRef(null);

  return (
    <div className="d-flex justify-content-end">
      <Button className="fw-bold" variant="primary" onClick={handleShow}>
        Add User
      </Button>

      <Modal size="lg" show={show} onHide={handleClose}>
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>
              <b>Add New User</b>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row className="mb-3">
              <Form.Group as={Col} md="6" className="mb-3">
                <Form.Label><b>Username <span className="text-danger">*</span></b></Form.Label>
                <Form.Control 
                  required 
                  type="text" 
                  ref={usernameRef}
                  placeholder="Enter username"
                  minLength={3}
                />
                <Form.Control.Feedback type="invalid">
                  Please provide a valid username (minimum 3 characters).
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group as={Col} md="6" className="mb-3">
                <Form.Label><b>Full Name <span className="text-danger">*</span></b></Form.Label>
                <Form.Control 
                  required 
                  type="text" 
                  ref={fullnameRef}
                  placeholder="Enter full name"
                />
                <Form.Control.Feedback type="invalid">
                  Please provide a valid full name.
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group as={Col} md="6" className="mb-3">
                <Form.Label><b>Email <span className="text-danger">*</span></b></Form.Label>
                <Form.Control 
                  required 
                  type="email" 
                  ref={emailRef}
                  placeholder="Enter email address"
                />
                <Form.Control.Feedback type="invalid">
                  Please provide a valid email address.
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group as={Col} md="6" className="mb-3">
                <Form.Label><b>Password <span className="text-danger">*</span></b></Form.Label>
                <Form.Control 
                  required 
                  type="password" 
                  ref={passwordRef}
                  placeholder="Enter password"
                  minLength={6}
                />
                <Form.Control.Feedback type="invalid">
                  Please provide a valid password (minimum 6 characters).
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group as={Col} md="6" className="mb-3">
                <Form.Label><b>Role/Position <span className="text-danger">*</span></b></Form.Label>
                <Form.Select 
                  required 
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  isInvalid={validated && !selectedRole}
                >
                  <option value="">Select Role/Position</option>
                  <option value="admin">Admin</option>
                  <option value="user">user</option>
                  
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  Please select a valid role.
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group as={Col} md="6" className="mb-3">
                <Form.Label><b>Phone Number</b></Form.Label>
                <Form.Control 
                  type="tel" 
                  ref={phoneRef}
                  placeholder="Enter phone number"
                  pattern="[0-9\-\+\s\(\)]+"
                />
                <Form.Control.Feedback type="invalid">
                  Please provide a valid phone number.
                </Form.Control.Feedback>
              </Form.Group>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              <b>Cancel</b>
            </Button>
            <Button type="submit" variant="success">
              <b>Create User</b>
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}

export default AddUser;