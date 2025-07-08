import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Col, Row, Spinner } from "react-bootstrap";
import Swal from "sweetalert2";

// นำเข้า ROLE_PERMISSIONS และ helper functions
import { ROLE_PERMISSIONS, getPermissionCodes, getPermissionNames } from './permissions';

function AddUser({ children, onSave }) {
  const [show, setShow] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    username: "",
    password: "",
    confirmPassword: "",
    fname: "",
    lname: "",
    fnameth: "",
    lnameth: "",
    email: "",
    tel: "",
    department: "",
    position: "",
    level: "user", // Default level
    status: "pending",
    Roleuser: "", // This will store the codes as string
    permissions: [], // New state for selected permissions (names)
    username_db: "root",
    server_db: "localhoot",
    password_db: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({});

  const handleClose = () => {
    setShow(false);
    resetForm();
  };
  const handleShow = () => setShow(true);

  // Reset form data and errors
  const resetForm = () => {
    setFormData({
      user_id:"",
      username: "",
      password: "",
      confirmPassword: "",
      fname: "",
      lname: "",
      fnameth: "",
      lnameth: "",
      email: "",
      tel: "",
      department: "",
      position: "",
      level: "user",
      status: "pending",
      Roleuser: "",
      permissions: [], // New state for selected permissions (names)
      username_db: "root",
      server_db: "localhoot",
      password_db: ""
    });
    setError({});
  };

  // When level changes, update permissions
  useEffect(() => {
    const defaultPermissionsForLevel = ROLE_PERMISSIONS[formData.level]
      ? ROLE_PERMISSIONS[formData.level].pages.filter(p => p.required).map(p => p.name)
      : [];
    setFormData(prev => ({ ...prev, permissions: defaultPermissionsForLevel }));
  }, [formData.level]);

  // Update Roleuser when permissions change
  useEffect(() => {
    const codes = getPermissionCodes(formData.permissions);
    const roleUserString = codes.join(','); // Join codes with comma
    setFormData(prev => ({ ...prev, Roleuser: roleUserString }));
  }, [formData.permissions]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePermissionChange = (e) => {
    const { id, checked } = e.target;
    const pageName = id.replace('perm-', '');

    setFormData(prev => {
      const currentPermissions = new Set(prev.permissions);
      if (checked) {
        currentPermissions.add(pageName);
      } else {
        currentPermissions.delete(pageName);
      }
      return { ...prev, permissions: Array.from(currentPermissions) };
    });
  };

  // เพิ่ม state สำหรับควบคุมการแสดงรหัสผ่าน
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ฟังก์ชันสำหรับแสดง/ซ่อนรหัสผ่าน
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const validateForm = () => {
    let newErrors = {};
    if (!formData.username) newErrors.username = "กรุณากรอก Username";
    if (!formData.password) newErrors.password = "กรุณากรอก Password";
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "รหัสผ่านไม่ตรงกัน";
    if (!formData.fname && !formData.fnameth) newErrors.fname = "กรุณากรอกชื่อ (ภาษาอังกฤษ หรือ ภาษาไทย)";
    if (!formData.lname && !formData.lnameth) newErrors.lname = "กรุณากรอกนามสกุล (ภาษาอังกฤษ หรือ ภาษาไทย)";

    // Validate email format
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "รูปแบบอีเมลไม่ถูกต้อง";
    }

    setError(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      Swal.fire({
        icon: 'error',
        title: 'ข้อมูลไม่ครบถ้วน',
        text: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วนและถูกต้อง',
        confirmButtonText: 'ตกลง'
      });
      return;
    }
const generateUserId = () => {
  const now = new Date();
  
  // แปลงเป็นเวลาไทย
  const bangkokTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Bangkok"}));
  
  const year = bangkokTime.getFullYear();
  const month = String(bangkokTime.getMonth() + 1).padStart(2, '0');
  const day = String(bangkokTime.getDate()).padStart(2, '0');
  const dateKey = `${year}${month}${day}`;
  
  // เก็บ counter ใน localStorage (จะรีเซตเมื่อเปลี่ยนวัน)
  const storageKey = `userIdCounter_${dateKey}`;
  let currentCounter = parseInt(localStorage.getItem(storageKey) || '0');
  
  // เพิ่ม counter
  currentCounter++;
  localStorage.setItem(storageKey, currentCounter.toString());
  
  // ลบ counter ของวันเก่าออก (เก็บแค่วันปัจจุบัน)
  const allKeys = Object.keys(localStorage);
  allKeys.forEach(key => {
    if (key.startsWith('userIdCounter_') && key !== storageKey) {
      localStorage.removeItem(key);
    }
  });
  
  const paddedNumber = String(currentCounter).padStart(4, '0');
  return `ATC${dateKey}${paddedNumber}`;
};

// Class version สำหรับใช้ในหน้าเดียวกัน (เก็บ state ใน memory)

    setLoading(true);
    try {
      const dataToSend = {
        ...formData,
        action: "createUser",
        // Send both Roleuser (codes) and permissions (for backward compatibility)
        Roleuser: formData.Roleuser, // This contains the codes like "01,02,03"
        permissions: JSON.stringify({ allowedRoutes: formData.permissions }), // Keep this for compatibility
        user_id: generateUserId()   // ส่งid
      };
      delete dataToSend.confirmPassword; // Don't send confirmPassword to backend

      console.log('Sending data:', dataToSend); // Debug log

      const response = await fetch(`${import.meta.env.VITE_SERVER}/User.php?action=createUser`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });

      const result = await response.json();

      if (result.success) {
        Swal.fire({
          position: "center",
          icon: "success",
          title: "เพิ่มผู้ใช้สำเร็จ",
          showConfirmButton: false,
          timer: 1500,
        });
        handleClose();
        onSave(); // Trigger data refresh in parent
      } else {
        throw new Error(result.message || "ไม่สามารถเพิ่มผู้ใช้ได้");
      }
    } catch (err) {
      Swal.fire({
        position: "center",
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: err.message,
        showConfirmButton: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const currentRolePages = ROLE_PERMISSIONS[formData.level]?.pages || [];

  return (
    <>
      {/* Trigger button for the modal */}
      <span onClick={handleShow}>{children}</span>

      <Modal show={show} onHide={handleClose} size="lg" backdrop="static" keyboard={false}>
        <Modal.Header closeButton style={{ backgroundColor: "#2a2a2a", color: "#e0e0e0", borderBottom: "1px solid #444" }}>
          <Modal.Title>เพิ่มผู้ใช้งานใหม่</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: "#1a1a1a", color: "#e0e0e0" }}>
          <Form onSubmit={handleSubmit}>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Username <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    isInvalid={!!error.username}
                    style={{ backgroundColor: "#333", borderColor: "#555", color: "#e0e0e0" }}
                  />
                  <Form.Control.Feedback type="invalid">{error.username}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    isInvalid={!!error.email}
                    style={{ backgroundColor: "#333", borderColor: "#555", color: "#e0e0e0" }}
                  />
                  <Form.Control.Feedback type="invalid">{error.email}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            {/*  password */}
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Password <span className="text-danger">*</span></Form.Label>
                  <div className="position-relative">
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      isInvalid={!!error.password}
                      style={{
                        backgroundColor: "#333",
                        borderColor: "#555",
                        color: "#e0e0e0",
                        paddingRight: "40px"
                      }}
                    />
                    <Button
                      variant="link"
                      onClick={togglePasswordVisibility}
                      className="position-absolute top-50 end-0 translate-middle-y border-0"
                      style={{
                        color: "#888",
                        textDecoration: "none",
                        padding: "0",
                        margin: "0 10px 0 0",
                        background: "none",
                        zIndex: 5
                      }}
                    >
                      {showPassword ?
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                        :
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      }
                    </Button>
                  </div>
                  <Form.Control.Feedback type="invalid">{error.password}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Confirm Password <span className="text-danger">*</span></Form.Label>
                  <div className="position-relative">
                    <Form.Control
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      isInvalid={!!error.confirmPassword}
                      style={{
                        backgroundColor: "#333",
                        borderColor: "#555",
                        color: "#e0e0e0",
                        paddingRight: "40px"
                      }}
                    />
                    <Button
                      variant="link"
                      onClick={toggleConfirmPasswordVisibility}
                      className="position-absolute top-50 end-0 translate-middle-y border-0"
                      style={{
                        color: "#888",
                        textDecoration: "none",
                        padding: "0",
                        margin: "0 10px 0 0",
                        background: "none",
                        zIndex: 5
                      }}
                    >
                      {showConfirmPassword ?
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                        :
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      }
                    </Button>
                  </div>
                  <Form.Control.Feedback type="invalid">{error.confirmPassword}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>ชื่อ (EN)</Form.Label>
                  <Form.Control
                    type="text"
                    name="fname"
                    value={formData.fname}
                    onChange={handleChange}
                    isInvalid={!!error.fname && !formData.fnameth}
                    style={{ backgroundColor: "#333", borderColor: "#555", color: "#e0e0e0" }}
                  />
                  <Form.Control.Feedback type="invalid">{error.fname}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>นามสกุล (EN)</Form.Label>
                  <Form.Control
                    type="text"
                    name="lname"
                    value={formData.lname}
                    onChange={handleChange}
                    isInvalid={!!error.lname && !formData.lnameth}
                    style={{ backgroundColor: "#333", borderColor: "#555", color: "#e0e0e0" }}
                  />
                  <Form.Control.Feedback type="invalid">{error.lname}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>ชื่อ (TH)</Form.Label>
                  <Form.Control
                    type="text"
                    name="fnameth"
                    value={formData.fnameth}
                    onChange={handleChange}
                    isInvalid={!!error.fnameth && !formData.fname}
                    style={{ backgroundColor: "#333", borderColor: "#555", color: "#e0e0e0" }}
                  />
                  <Form.Control.Feedback type="invalid">{error.fnameth}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>นามสกุล (TH)</Form.Label>
                  <Form.Control
                    type="text"
                    name="lnameth"
                    value={formData.lnameth}
                    onChange={handleChange}
                    isInvalid={!!error.lnameth && !formData.lname}
                    style={{ backgroundColor: "#333", borderColor: "#555", color: "#e0e0e0" }}
                  />
                  <Form.Control.Feedback type="invalid">{error.lnameth}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>เบอร์โทรศัพท์</Form.Label>
                  <Form.Control
                    type="text"
                    name="tel"
                    value={formData.tel}
                    onChange={handleChange}
                    style={{ backgroundColor: "#333", borderColor: "#555", color: "#e0e0e0" }}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>แผนก</Form.Label>
                  <Form.Control
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    style={{ backgroundColor: "#333", borderColor: "#555", color: "#e0e0e0" }}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>ตำแหน่ง</Form.Label>
                  <Form.Control
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    style={{ backgroundColor: "#333", borderColor: "#555", color: "#e0e0e0" }}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-4">
              <Form.Label>ระดับผู้ใช้งาน (Role) <span className="text-danger">*</span></Form.Label>
              <Form.Select
                name="level"
                value={formData.level}
                onChange={handleChange}
                style={{ backgroundColor: "#333", borderColor: "#555", color: "#e0e0e0" }}
              >
                {Object.keys(ROLE_PERMISSIONS).map(levelKey => (
                  <option key={levelKey} value={levelKey}>
                    {ROLE_PERMISSIONS[levelKey].label}
                  </option>
                ))}
              </Form.Select>
              <Form.Text className="text-muted">
                {ROLE_PERMISSIONS[formData.level]?.description}
              </Form.Text>
            </Form.Group>

            {/* เช็คเลือกตำแหน่ง */}
            <Form.Group className="mb-4 p-3 border rounded" style={{ borderColor: "#555" }}>
              <Form.Label className="mb-3 fs-5" style={{ color: "#00c853" }}>
                สิทธิ์การเข้าถึงหน้าเว็บสำหรับระดับ "{ROLE_PERMISSIONS[formData.level]?.label || formData.level}"
              </Form.Label>
              <Row>
                {currentRolePages.map(page => (
                  <Col xs={12} sm={6} md={4} key={page.name}>
                    <Form.Check
                      type="checkbox"
                      id={`perm-${page.name}`}
                      label={`${page.label} (${page.code})`}
                      checked={formData.permissions.includes(page.name)}
                      onChange={handlePermissionChange}
                      className="mb-2"
                      style={{ color: "#e0e0e0" }}
                    />
                  </Col>
                ))}
              </Row>
              <Form.Text className="text-muted mt-3">
                สามารถเลือกสิทธิ์การเข้าถึงตามต้องการ | รหัสจะถูกบันทึกเป็น: {formData.Roleuser || "ไม่มีการเลือก"}
              </Form.Text>
            </Form.Group>

            <div className="d-flex justify-content-end gap-2 mt-4">
              <Button variant="secondary" onClick={handleClose} disabled={loading} style={{ backgroundColor: "#444", borderColor: "#444", color: "#e0e0e0" }}>
                ยกเลิก
              </Button>
              <Button variant="primary" type="submit" disabled={loading} style={{ backgroundColor: "#00c853", borderColor: "#00c853" }}>
                {loading ? <Spinner animation="border" size="sm" /> : "เพิ่มผู้ใช้งาน"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default AddUser;