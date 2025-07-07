import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Col, Row, Spinner } from "react-bootstrap";
import Swal from "sweetalert2";

// Import ROLE_PERMISSIONS
import { ROLE_PERMISSIONS } from './permissions';

function EditUser({ children, user, onSave }) {
  const [show, setShow] = useState(false);
  // Initialize formData with user prop and parse permissions if available
  const [formData, setFormData] = useState(() => {
    let parsedPermissions = [];
    if (user.permissions) {
      try {
        parsedPermissions = JSON.parse(user.permissions).allowedRoutes || [];
      } catch (e) {
        console.error('Error parsing existing permissions on initial load:', e);
      }
    }
    return { ...user, permissions: parsedPermissions };
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({});

  useEffect(() => {
    // Update formData when the user prop changes (e.g., when a different user is selected for editing)
    let parsedPermissions = [];
    if (user.permissions) {
      try {
        parsedPermissions = JSON.parse(user.permissions).allowedRoutes || [];
      } catch (e) {
        console.error('Error parsing existing permissions on user prop change:', e);
      }
    }
    setFormData({ ...user, permissions: parsedPermissions });
  }, [user]);

  const handleClose = () => {
    setShow(false);
    // Reset form data to original user prop if modal is closed without saving
    let parsedPermissions = [];
    if (user.permissions) {
      try {
        parsedPermissions = JSON.parse(user.permissions).allowedRoutes || [];
      } catch (e) {
        console.error('Error parsing existing permissions on close:', e);
      }
    }
    setFormData({ ...user, permissions: parsedPermissions });
    setError({}); // Clear any validation errors
  };

  const handleShow = () => setShow(true);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePermissionChange = (e) => {
    const { id, checked } = e.target;
    const pageName = id.replace('edit-perm-', '');

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
    if (!formData.fname && !formData.fnameth) newErrors.fname = "กรุณากรอกชื่อ (ภาษาอังกฤษ หรือ ภาษาไทย)";
    if (!formData.lname && !formData.lnameth) newErrors.lname = "กรุณากรอกนามสกุล (ภาษาอังกฤษ หรือ ภาษาไทย)";

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "รูปแบบอีเมลไม่ถูกต้อง";
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "รหัสผ่านไม่ตรงกัน";
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

    setLoading(true);
    try {
      const dataToSend = {
        ...formData,
        action: "update",
        permissions: JSON.stringify({ allowedRoutes: formData.permissions }) // Convert to JSON string
      };

      // Remove confirmPassword as it's not needed in the backend
      delete dataToSend.confirmPassword;

      const response = await fetch(`${import.meta.env.VITE_SERVER}/User.php`, {
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
          title: "แก้ไขผู้ใช้สำเร็จ",
          showConfirmButton: false,
          timer: 1500,
        });
        handleClose();
        onSave(); // Trigger data refresh in parent
      } else {
        throw new Error(result.message || "ไม่สามารถแก้ไขผู้ใช้ได้");
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
      <span onClick={handleShow}>{children}</span>

      <Modal show={show} onHide={handleClose} size="lg" backdrop="static" keyboard={false}>
        <Modal.Header closeButton style={{ backgroundColor: "#2a2a2a", color: "#e0e0e0", borderBottom: "1px solid #444" }}>
          <Modal.Title>แก้ไขผู้ใช้งาน: {user.username}</Modal.Title>
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
                    value={formData.username || ''}
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
                    value={formData.email || ''}
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

            {/* Other fields similar to AddUser */}
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>ชื่อ (EN)</Form.Label>
                  <Form.Control
                    type="text"
                    name="fname"
                    value={formData.fname || ''}
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
                    value={formData.lname || ''}
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
                    value={formData.fnameth || ''}
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
                    value={formData.lnameth || ''}
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
                    value={formData.tel || ''}
                    onChange={handleChange}
                    style={{ backgroundColor: "#333", borderColor: "#555", color: "#e0e0e0" }}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>สถานะ</Form.Label>
                  <Form.Select
                    name="status"
                    value={formData.status || 'active'}
                    onChange={handleChange}
                    style={{ backgroundColor: "#333", borderColor: "#555", color: "#e0e0e0" }}
                  >
                    <option value="pending">Pending</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>แผนก</Form.Label>
                  <Form.Control
                    type="text"
                    name="department"
                    value={formData.department || ''}
                    onChange={handleChange}
                    style={{ backgroundColor: "#333", borderColor: "#555", color: "#e0e0e0" }}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>ตำแหน่ง</Form.Label>
                  <Form.Control
                    type="text"
                    name="position"
                    value={formData.position || ''}
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
                value={formData.level || ''}
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

            {/* แก้ไขเช็คเลือกตำแหน่ง
            <Form.Group className="mb-4 p-3 border rounded" style={{ borderColor: "#555" }}>
              <Form.Label className="mb-3 fs-5" style={{ color: "#00c853" }}>
                สิทธิ์การเข้าถึงหน้าเว็บสำหรับระดับ "{ROLE_PERMISSIONS[formData.level]?.label || formData.level}"
              </Form.Label>
              <Row>
                {currentRolePages.map(page => (
                  <Col xs={12} sm={6} md={4} key={page.name}>
                    <Form.Check
                      type="checkbox"
                      id={`edit-perm-${page.name}`} // Use a different ID prefix for edit modal
                      label={page.label}
                      checked={formData.permissions.includes(page.name)}
                      onChange={handlePermissionChange}
                      className="mb-2"
                      style={{ color: "#e0e0e0" }}
                    />
                  </Col>
                ))}
              </Row>
              <Form.Text className="text-muted mt-3">
                สามารถเลือกสิทธิ์การเข้าถึงตามต้องการ
              </Form.Text>
            </Form.Group> */}

            <div className="d-flex justify-content-end gap-2 mt-4">
              <Button variant="secondary" onClick={handleClose} disabled={loading} style={{ backgroundColor: "#444", borderColor: "#444", color: "#e0e0e0" }}>
                ยกเลิก
              </Button>
              <Button variant="primary" type="submit" disabled={loading} style={{ backgroundColor: "#00c853", borderColor: "#00c853" }}>
                {loading ? <Spinner animation="border" size="sm" /> : "บันทึกการเปลี่ยนแปลง"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default EditUser;