import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col, Alert } from "react-bootstrap";
import { Pencil, Save, XCircle } from "react-bootstrap-icons";

/**
 * EditModal - คอมโพเนนต์สำหรับแก้ไขข้อมูลที่สามารถใช้ได้กับทุกหน้า
 * @param {Object} props - คุณสมบัติของคอมโพเนนต์
 * @param {React.ReactNode} props.children - คอมโพเนนต์ลูกที่จะใช้เป็นปุ่มเปิด Modal
 * @param {Function} props.onSave - ฟังก์ชันที่จะเรียกเมื่อบันทึกข้อมูล
 * @param {Object} props.data - ข้อมูลที่จะแก้ไข
 * @param {string} props.entityType - ประเภทของข้อมูล (location, store, type)
 * @param {string} props.apiUrl - URL ของ API สำหรับการอัปเดตข้อมูล
 */
const EditModal = ({ children, onSave, data, entityType, apiUrl }) => {
  const [show, setShow] = useState(false);
  const [formData, setFormData] = useState({});
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [types, setTypes] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  // โหลดข้อมูล stores สำหรับกรณีที่เป็นการแก้ไข location
  useEffect(() => {
    if (entityType === "location" && show) {
      fetchStores();
    }
  }, [entityType, show]);

  // กำหนดค่าเริ่มต้นของฟอร์มเมื่อข้อมูลเปลี่ยนแปลง
  useEffect(() => {
    if (data) {
      setFormData({ ...data });
    }
  }, [data, show]);

  useEffect(() => {
    if (show) {
      if (entityType === "location") {
        fetchStores();
      } else if (entityType === "part" || entityType === "serial") {
        fetchTypes();
        fetchSuppliers();
      }
    }
  }, [entityType, show]);

  // ฟังก์ชันดึงข้อมูล stores
  const fetchStores = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${import.meta.env.VITE_SERVER}/Store.php?action=getStores`,
        {
          method: "GET",
        }
      );
      const storesData = await res.json();
      if (storesData !== null) {
        setStores(storesData);
      } else {
        setStores([]);
      }
      setLoading(false);
    } catch (err) {
      console.error("Error fetching stores:", err);
      setError("ไม่สามารถโหลดข้อมูลคลังได้");
      setLoading(false);
      setStores([]);
    }
  };

  const fetchTypes = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${import.meta.env.VITE_SERVER}/Store.php?action=getType`,
        {
          method: "GET",
        }
      );
      const typesData = await res.json();
      if (typesData !== null) {
        setTypes(typesData);
      } else {
        setTypes([]);
      }
      setLoading(false);
    } catch (err) {
      console.error("Error fetching types:", err);
      setError("ไม่สามารถโหลดข้อมูลประเภทสินค้าได้");
      setLoading(false);
      setTypes([]);
    }
  };

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${import.meta.env.VITE_SERVER}/Store.php?action=getSuppliers`,
        {
          method: "GET",
        }
      );
      const suppliersData = await res.json();
      if (suppliersData !== null) {
        setSuppliers(suppliersData);
      } else {
        setSuppliers([]);
      }
      setLoading(false);
    } catch (err) {
      console.error("Error fetching suppliers:", err);
      setError("ไม่สามารถโหลดข้อมูลซัพพลายเออร์ได้");
      setLoading(false);
      setSuppliers([]);
    }
  };

  // จัดการการเปิด Modal
  const handleShow = () => {
    setShow(true);
    setError("");
    setSuccess("");
    if (data) {
      setFormData({ ...data });
    }
  };

  // จัดการการปิด Modal
  const handleClose = () => {
    setShow(false);
    setError("");
    setSuccess("");
  };

  // จัดการการเปลี่ยนแปลงข้อมูลในฟอร์ม
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // จัดการการบันทึกข้อมูล
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      let endpoint;
      let formSubmitData = new FormData();

      // กำหนด endpoint และข้อมูลตามประเภทของข้อมูล
      switch (entityType) {
        case "location":
          endpoint = `${apiUrl || import.meta.env.VITE_SERVER}/Store.php?action=updateLocation`;
          formSubmitData.append("location_id", formData.location_id);
          formSubmitData.append("location_name", formData.location_name);
          formSubmitData.append("location_detail", formData.location_detail || "");
          formSubmitData.append("store_id", formData.store_id);
          break;
        case "store":
          endpoint = `${apiUrl || import.meta.env.VITE_SERVER}/Store.php?action=updateStore`;
          formSubmitData.append("store_id", formData.store_id);
          formSubmitData.append("store_name", formData.store_name);
          formSubmitData.append("store_address", formData.store_address || "");
          formSubmitData.append("store_detail", formData.store_detail || "");
          break;
        case "type":
          endpoint = `${apiUrl || import.meta.env.VITE_SERVER}/Store.php?action=updateType`;
          formSubmitData.append("type_id", formData.type_id);
          formSubmitData.append("type_name", formData.type_name);
          formSubmitData.append("type_prefix", formData.type_prefix);
          formSubmitData.append("type_detail", formData.type_detail || "");
          break;
        case "part":
          endpoint = `${apiUrl || import.meta.env.VITE_SERVER}/Store.php?action=updatePart`;
          formSubmitData.append("part_num", formData.part_num);
          formSubmitData.append("part_name", formData.part_name);
          formSubmitData.append("part_type", formData.part_type);
          formSubmitData.append("supplier", formData.supplier || "");
          formSubmitData.append("brand", formData.brand || "");
          formSubmitData.append("min", formData.min || "0");
          formSubmitData.append("part_detail", formData.part_detail || "");
          break;
        case "serial":
          endpoint = `${apiUrl || import.meta.env.VITE_SERVER}/Store.php?action=updateSerial`;
          formSubmitData.append("part_no", formData.part_no);
          formSubmitData.append("part_num", formData.part_num);
          formSubmitData.append("supplier", formData.supplier || "");
          formSubmitData.append("brand", formData.brand || "");
          formSubmitData.append("sup_serial", formData.sup_serial || "");
          formSubmitData.append("sup_part_number", formData.sup_part_number || "");
          formSubmitData.append("packsize", formData.packsize || "1");
          break;
        default:
          throw new Error("ไม่รู้จักประเภทข้อมูล");
      }

      const response = await fetch(endpoint, {
        method: "POST",
        body: formSubmitData,
      });

      const result = await response.json();

      if (result.status === "success") {
        setSuccess("บันทึกข้อมูลสำเร็จ");
        setTimeout(() => {
          handleClose();
          if (onSave) onSave();
        }, 1500);
      } else {
        setError(result.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }
    } catch (err) {
      console.error("Error updating data:", err);
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์");
    } finally {
      setLoading(false);
    }
  };

  // สร้างชื่อหัวข้อ Modal ตามประเภทของข้อมูล
  const getModalTitle = () => {
    switch (entityType) {
      case "location":
        return "แก้ไขข้อมูลสถานที่";
      case "store":
        return "แก้ไขข้อมูลคลังสินค้า";
      case "type":
        return "แก้ไขข้อมูลประเภทสินค้า";
      case "part":
        return "แก้ไขข้อมูลชิ้นส่วน";
      case "serial":
        return "แก้ไขข้อมูลซีเรียลนัมเบอร์";
      default:
        return "แก้ไขข้อมูล";
    }
  };

  // สร้างฟอร์มตามประเภทของข้อมูล
  const renderForm = () => {
    switch (entityType) {
      case "location":
        return (
          <>
            <Form.Group className="mb-3">
              <Form.Label>ชื่อสถานที่</Form.Label>
              <Form.Control
                type="text"
                name="location_name"
                value={formData.location_name || ""}
                onChange={handleChange}
                required
                style={{ backgroundColor: "#333", color: "#fff", border: "1px solid #444" }}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>คลังสินค้า</Form.Label>
              <Form.Select
                name="store_id"
                value={formData.store_id || ""}
                onChange={handleChange}
                required
                style={{ backgroundColor: "#333", color: "#fff", border: "1px solid #444" }}
              >
                <option value="">-- เลือกคลังสินค้า --</option>
                {stores.map((store) => (
                  <option key={store.store_id} value={store.store_id}>
                    {store.store_name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>รายละเอียด</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="location_detail"
                value={formData.location_detail || ""}
                onChange={handleChange}
                style={{ backgroundColor: "#333", color: "#fff", border: "1px solid #444" }}
              />
            </Form.Group>
          </>
        );
      case "store":
        return (
          <>
            <Form.Group className="mb-3">
              <Form.Label>ชื่อคลังสินค้า</Form.Label>
              <Form.Control
                type="text"
                name="store_name"
                value={formData.store_name || ""}
                onChange={handleChange}
                required
                style={{ backgroundColor: "#333", color: "#fff", border: "1px solid #444" }}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>ที่อยู่</Form.Label>
              <Form.Control
                type="text"
                name="store_address"
                value={formData.store_address || ""}
                onChange={handleChange}
                style={{ backgroundColor: "#333", color: "#fff", border: "1px solid #444" }}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>รายละเอียด</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="store_detail"
                value={formData.store_detail || ""}
                onChange={handleChange}
                style={{ backgroundColor: "#333", color: "#fff", border: "1px solid #444" }}
              />
            </Form.Group>
          </>
        );
      case "type":
        return (
          <>
            <Form.Group className="mb-3">
              <Form.Label>ชื่อประเภทสินค้า</Form.Label>
              <Form.Control
                type="text"
                name="type_name"
                value={formData.type_name || ""}
                onChange={handleChange}
                required
                style={{ backgroundColor: "#333", color: "#fff", border: "1px solid #444" }}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>คำนำหน้ารหัส</Form.Label>
              <Form.Control
                type="text"
                name="type_prefix"
                value={formData.type_prefix || ""}
                onChange={handleChange}
                required
                style={{ backgroundColor: "#333", color: "#fff", border: "1px solid #444" }}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>รายละเอียด</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="type_detail"
                value={formData.type_detail || ""}
                onChange={handleChange}
                style={{ backgroundColor: "#333", color: "#fff", border: "1px solid #444" }}
              />
            </Form.Group>
          </>
        );
      case "part":
        return (
          <>
            <Form.Group className="mb-3">
              <Form.Label>Part Number</Form.Label>
              <Form.Control
                type="text"
                name="part_num"
                value={formData.part_num || ""}
                onChange={handleChange}
                readOnly
                className="bg-light"
                style={{ backgroundColor: "#333", color: "#ddd", cursor: "not-allowed" }}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Part Name</Form.Label>
              <Form.Control
                type="text"
                name="part_name"
                value={formData.part_name || ""}
                onChange={handleChange}
                required
                style={{ backgroundColor: "#333", color: "#fff", border: "1px solid #444" }}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Type</Form.Label>
              <Form.Select
                name="part_type"
                value={formData.part_type || ""}
                onChange={handleChange}
                required
                style={{ backgroundColor: "#333", color: "#fff", border: "1px solid #444" }}
              >
                <option value="">-- เลือกประเภทสินค้า --</option>
                {types.map((type) => (
                  <option key={type.type_id} value={type.type_prefix}>
                    {type.type_name} ({type.type_prefix})
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Supplier</Form.Label>
              <Form.Select
                name="supplier"
                value={formData.supplier || ""}
                onChange={handleChange}
                style={{ backgroundColor: "#333", color: "#fff", border: "1px solid #444" }}
              >
                <option value="">-- เลือกซัพพลายเออร์ --</option>
                {suppliers.map((supplier, index) => (
                  <option key={index} value={supplier.supplier_name || supplier.name}>
                    {supplier.supplier_name || supplier.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Brand</Form.Label>
              <Form.Control
                type="text"
                name="brand"
                value={formData.brand || ""}
                onChange={handleChange}
                style={{ backgroundColor: "#333", color: "#fff", border: "1px solid #444" }}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Min</Form.Label>
              <Form.Control
                type="number"
                name="min"
                value={formData.min || "0"}
                onChange={handleChange}
                style={{ backgroundColor: "#333", color: "#fff", border: "1px solid #444" }}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>รายละเอียด</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="part_detail"
                value={formData.part_detail || ""}
                onChange={handleChange}
                style={{ backgroundColor: "#333", color: "#fff", border: "1px solid #444" }}
              />
            </Form.Group>
          </>
        );
      case "serial":
        return (
          <>
            <Form.Group className="mb-3">
              <Form.Label>Serial Number</Form.Label>
              <Form.Control
                type="text"
                name="part_no"
                value={formData.part_no || ""}
                onChange={handleChange}
                readOnly
                className="bg-light"
                style={{ backgroundColor: "#333", color: "#ddd", cursor: "not-allowed" }}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Part Number</Form.Label>
              <Form.Control
                type="text"
                name="part_num"
                value={formData.part_num || ""}
                onChange={handleChange}
                required
                style={{ backgroundColor: "#333", color: "#fff", border: "1px solid #444" }}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Supplier</Form.Label>
              <Form.Select
                name="supplier"
                value={formData.supplier || ""}
                onChange={handleChange}
                style={{ backgroundColor: "#333", color: "#fff", border: "1px solid #444" }}
              >
                <option value="">-- เลือกซัพพลายเออร์ --</option>
                {suppliers.map((supplier, index) => (
                  <option key={index} value={supplier.supplier_name || supplier.name}>
                    {supplier.supplier_name || supplier.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Brand</Form.Label>
              <Form.Control
                type="text"
                name="brand"
                value={formData.brand || ""}
                onChange={handleChange}
                style={{ backgroundColor: "#333", color: "#fff", border: "1px solid #444" }}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Supplier Serial Number</Form.Label>
              <Form.Control
                type="text"
                name="sup_serial"
                value={formData.sup_serial || ""}
                onChange={handleChange}
                style={{ backgroundColor: "#333", color: "#fff", border: "1px solid #444" }}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Supplier Part Number</Form.Label>
              <Form.Control
                type="text"
                name="sup_part_number"
                value={formData.sup_part_number || ""}
                onChange={handleChange}
                style={{ backgroundColor: "#333", color: "#fff", border: "1px solid #444" }}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Packsize</Form.Label>
              <Form.Control
                type="number"
                name="packsize"
                value={formData.packsize || "1"}
                onChange={handleChange}
                style={{ backgroundColor: "#333", color: "#fff", border: "1px solid #444" }}
              />
            </Form.Group>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {/* ปุ่มเปิด Modal */}
      <span onClick={handleShow} style={{ cursor: "pointer" }}>
        {children || (
          <Button
            variant="warning"
            size="sm"
            className="me-1"
            style={{
              borderRadius: "6px",
              backgroundColor: "#fb8c00",
              borderColor: "#fb8c00",
            }}
          >
            <Pencil size={16} />
          </Button>
        )}
      </span>

      {/* Modal แก้ไขข้อมูล */}
      <Modal
        show={show}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
        centered
        size="lg"
        contentClassName="bg-dark text-light border-secondary"
      >
        <Modal.Header
          style={{ borderBottom: "1px solid #444" }}
          className="bg-dark text-light"
        >
          <Modal.Title>
            <Pencil className="me-2" />
            {getModalTitle()}
          </Modal.Title>
          <Button
            variant="link"
            onClick={handleClose}
            className="text-light p-0 border-0"
            style={{ fontSize: "1.5rem" }}
          >
            <XCircle />
          </Button>
        </Modal.Header>
        <Modal.Body className="bg-dark text-light">
          {error && (
            <Alert variant="danger" className="mb-3">
              {error}
            </Alert>
          )}
          {success && (
            <Alert variant="success" className="mb-3">
              {success}
            </Alert>
          )}
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={12}>{renderForm()}</Col>
            </Row>
            <div className="d-flex justify-content-end gap-2 mt-3">
              <Button
                variant="secondary"
                onClick={handleClose}
                style={{
                  backgroundColor: "#555",
                  borderColor: "#555",
                  borderRadius: "6px",
                }}
              >
                <XCircle className="me-1" size={18} /> ยกเลิก
              </Button>
              <Button
                variant="success"
                type="submit"
                disabled={loading}
                style={{
                  backgroundColor: "#00c853",
                  borderColor: "#00c853",
                  borderRadius: "6px",
                }}
              >
                {loading ? (
                  "กำลังบันทึก..."
                ) : (
                  <>
                    <Save className="me-1" size={18} /> บันทึก
                  </>
                )}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default EditModal;