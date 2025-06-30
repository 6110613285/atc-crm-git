import React, { useState, useRef, useEffect } from "react";
import { Button, Modal, Form, Row, Col } from "react-bootstrap";
import Swal from "sweetalert2";

function EditUser({ user, onSave, children }) {
  const Username = localStorage.getItem("fullname");
  const [validated, setValidated] = useState(false);
  const [show, setShow] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");

  // Refs for form fields
  const usernameRef = useRef(null);
  const fullnameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const phoneRef = useRef(null);
  // const noteRef = useRef(null);

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
  };

  // โหลดข้อมูลเดิมเมื่อเปิด modal
  useEffect(() => {
    if (user && show) {
      // โหลดข้อมูลเดิมลงในฟอร์ม
      if (usernameRef.current) {
        usernameRef.current.value = user.username || '';
      }
      
      if (fullnameRef.current) {
        const fullname = user.fnameth && user.lnameth 
          ? `${user.fnameth} ${user.lnameth}`
          : user.fname && user.lname 
            ? `${user.fname} ${user.lname}`
            : '';
        fullnameRef.current.value = fullname;
      }
      
      if (emailRef.current) {
        emailRef.current.value = user.email || '';
      }
      
      if (phoneRef.current) {
        phoneRef.current.value = user.tel || '';
      }
      
      // if (noteRef.current) {
      //   noteRef.current.value = user.note || '';
      // }
      
      // ตั้งค่า role/level
      setSelectedRole(user.level || '');
    }
  }, [user, show]);

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
      updateUserEntry();
    }
    setValidated(true);
  };

  const updateUserEntry = async () => {
    try {
      // แยกชื่อ-นามสกุล จาก fullname
      const fullname = fullnameRef.current.value.trim();
      const nameParts = fullname.split(' ');
      const fname = nameParts[0] || '';
      const lname = nameParts.slice(1).join(' ') || '';

      // สร้างข้อมูลเป็น JSON Object แทน FormData
      const userData = {
        id: user.user_id, // ใช้ user_id จาก props
        fname: fname,
        lname: lname,
        fnameth: fname, // หรือแยกเป็นชื่อไทยถ้าต้องการ
        lnameth: lname,  // หรือแยกเป็นนามสกุลไทยถ้าต้องการ
        email: emailRef.current.value,
        level: selectedRole,
        tel: phoneRef.current.value || '',
        // note: noteRef.current.value || '', // ลบออกเพราะ PHP ไม่รองรับฟิลด์นี้
        status: user.status || 'active', // รักษาสถานะเดิม
        department: user.department || '', // รักษาข้อมูลเดิม
        position: user.position || '' // รักษาข้อมูลเดิม
      };

      // เพิ่ม password เฉพาะเมื่อมีการกรอก
      if (passwordRef.current.value.trim() !== '') {
        userData.password = passwordRef.current.value;
      }

      console.log('Sending data:', userData); // สำหรับ debug

      const res = await fetch(`${import.meta.env.VITE_SERVER}/User.php?action=updateUser`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });
      
      const data = await res.json();
      console.log('Response:', data); // สำหรับ debug
      
      if (data.success === true || data === "ok") {
        Swal.fire({
          position: "center",
          icon: "success",
          title: "User Updated Successfully",
          showConfirmButton: false,
          timer: 1500,
        });
        setShow(false);
        onSave(true);
      } else {
        console.log('Error response:', data);
        Swal.fire({
          position: "center",
          icon: "error",
          title: `Failed to update user: ${data.message || 'Unknown error'}`,
          showConfirmButton: false,
          timer: 2000,
        });
      }
    } catch (err) {
      console.log('Catch error:', err);
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
    <>
      <div onClick={handleShow} style={{ cursor: 'pointer' }}>
        {children}
      </div>

      <Modal size="lg" show={show} onHide={handleClose}>
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>
              <b>Edit User - {user?.fname} {user?.lname}</b>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row className="mb-3">
              <Form.Group as={Col} md="6" className="mb-3">
                <Form.Label><b>Username</b></Form.Label>
                <Form.Control 
                  type="text" 
                  ref={usernameRef} 
                  disabled
                  placeholder="Auto-generated"
                />
                <Form.Text className="text-muted">
                  Username is auto-generated and cannot be changed
                </Form.Text>
              </Form.Group>

              <Form.Group as={Col} md="6" className="mb-3">
                <Form.Label><b>Full Name</b></Form.Label>
                <Form.Control required type="text" ref={fullnameRef} />
                <Form.Control.Feedback type="invalid">
                  Please provide a valid full name.
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group as={Col} md="6" className="mb-3">
                <Form.Label><b>Email</b></Form.Label>
                <Form.Control required type="email" ref={emailRef} />
                <Form.Control.Feedback type="invalid">
                  Please provide a valid email.
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group as={Col} md="6" className="mb-3">
                <Form.Label><b>Password</b></Form.Label>
                <Form.Control 
                  type="password" 
                  ref={passwordRef} 
                  placeholder="Leave blank to keep current password"
                />
                <Form.Text className="text-muted">
                  Leave blank if you don't want to change the password
                </Form.Text>
              </Form.Group>

              <Form.Group as={Col} md="6" className="mb-3">
                <Form.Label><b>Role</b></Form.Label>
                <Form.Select
                  required
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  isInvalid={validated && !selectedRole}
                >
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  Please select a valid role.
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group as={Col} md="6" className="mb-3">
                <Form.Label><b>Phone Number</b></Form.Label>
                <Form.Control type="text" ref={phoneRef} />
              </Form.Group>

              {/* <Form.Group as={Col} md="12" className="mb-3">
                <Form.Label><b>Note</b></Form.Label>
                <Form.Control
                  type="text"
                  ref={noteRef}
                  as="textarea"
                  rows={3}
                  disabled
                />
                <Form.Text className="text-muted">
                  Note field is not supported in current API
                </Form.Text>
              </Form.Group> */}
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              <b>Close</b>
            </Button>
            <Button type="submit" variant="warning">
              <b>Update</b>
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
}

export default EditUser;