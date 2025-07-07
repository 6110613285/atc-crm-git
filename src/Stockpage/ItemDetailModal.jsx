import React, { useState, useEffect } from "react";
import { Modal, Button, Table, Badge, Form, Row, Col } from "react-bootstrap";
import { UpcScan, Box, Building, CalendarDate, Printer, Plus, Pencil } from "react-bootstrap-icons";
import { BlobProvider, PDFDownloadLink } from '@react-pdf/renderer';
import { SerialLabelPDF, MultipleSerialDocument } from "./SerialLabelPDF";
import EditItemModal from "./EditItemModal"; // นำเข้า EditItemModal ใหม่
import Swal from "sweetalert2";

function ItemDetailModal({ show, onHide, partNum, locationName }) {
  const userLevel = localStorage.getItem("level");
  const [itemDetails, setItemDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddQtyModal, setShowAddQtyModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [addQty, setAddQty] = useState(1);
  const [validated, setValidated] = useState(false);
  
  // State สำหรับ Edit Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEditItem, setSelectedEditItem] = useState(null);

  useEffect(() => {
    if (show && partNum && locationName) {
      fetchItemDetails();
    }
  }, [show, partNum, locationName]);

  const fetchItemDetails = async () => {
    setLoading(true);
    try {
      // API call to fetch detailed items with same part_num and location
      const response = await fetch(
        `${import.meta.env.VITE_SERVER}/Store.php?action=getItemDetails&part_num=${partNum}&location=${locationName}`
      );
      const data = await response.json();
      if (Array.isArray(data)) {
        setItemDetails(data);
      } else {
        setItemDetails([]);
      }
    } catch (error) {
      console.error("Error fetching item details:", error);
      setItemDetails([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    return now.toISOString().slice(0, 19).replace('T', ' ');
  };

  // ฟังก์ชันเปิด Edit Modal
  const handleEditClick = (item) => {
    setSelectedEditItem(item);
    setShowEditModal(true);
  };

  // ฟังก์ชันปิด Edit Modal
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedEditItem(null);
  };

  // ฟังก์ชันบันทึกการแก้ไขสำเร็จ
  const handleEditSuccess = () => {
    fetchItemDetails(); // โหลดข้อมูลใหม่
    handleCloseEditModal();
    Swal.fire({
      title: "สำเร็จ!",
      text: "แก้ไขข้อมูลเรียบร้อยแล้ว",
      icon: "success",
      confirmButtonText: "ตกลง",
      background: '#2a2a2a',
      color: '#e0e0e0'
    });
  };

  // ฟังก์ชันเปิด Add QTY Modal
  const handleAddQtyClick = (item) => {
    setSelectedItem(item);
    setShowAddQtyModal(true);
    setAddQty(1);
    setValidated(false);
  };

  const handleCloseAddQtyModal = () => {
    setShowAddQtyModal(false);
    setSelectedItem(null);
    setAddQty(1);
    setValidated(false);
  };

  const handleAddQtySubmit = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    const form = event.currentTarget;
    if (form.checkValidity() === false || addQty < 1) {
      setValidated(true);
      return;
    }

    try {
      const Username = localStorage.getItem("fullname");
      
      // บันทึกลง tb_log_product
      const logQueryString =
        `${import.meta.env.VITE_SERVER}/Store.php?action=insertLogProduct` +
        `&date=${encodeURIComponent(getCurrentDateTime())}` +
        `&uname=${encodeURIComponent(Username)}` +
        `&partnum=${encodeURIComponent(selectedItem.part_num)}` +
        `&partname=${encodeURIComponent(selectedItem.part_name)}` +
        `&supplier=${encodeURIComponent(selectedItem.supplier || '')}` +
        `&qty=${encodeURIComponent(addQty)}` +
        `&location=${encodeURIComponent(locationName)}` +
        `&storename=${encodeURIComponent(selectedItem.store_name || '')}` +
        `&note=${encodeURIComponent('Add Quantity')}` +
        `&status=${encodeURIComponent("IN")}` +
        `&serial_num=${encodeURIComponent(selectedItem.serial_num || '')}`;

      const logRes = await fetch(logQueryString, {
        method: "POST",
      });

      const logData = await logRes.json();
      if (logData !== "ok") {
        throw new Error("Failed to save log entry");
      }

      // เพิ่ม stock quantity
      const addQtyQueryString =
        `${import.meta.env.VITE_SERVER}/Store.php?action=addQuantity` +
        `&date=${encodeURIComponent(getCurrentDateTime())}` +
        `&uname=${encodeURIComponent(Username)}` +
        `&partnum=${encodeURIComponent(selectedItem.part_num)}` +
        `&partname=${encodeURIComponent(selectedItem.part_name)}` +
        `&supplier=${encodeURIComponent(selectedItem.supplier || '')}` +
        `&qty=${encodeURIComponent(addQty)}` +
        `&location=${encodeURIComponent(locationName)}` +
        `&storename=${encodeURIComponent(selectedItem.store_name || '')}` +
        `&note=${encodeURIComponent('Add Quantity')}` +
        `&status=${encodeURIComponent("IN")}` +
        `&serial_num=${encodeURIComponent(selectedItem.serial_num || '')}`;

      const addRes = await fetch(addQtyQueryString, {
        method: "POST",
      });

      const addData = await addRes.json();
      if (addData === "ok") {
        handleCloseAddQtyModal();
        fetchItemDetails(); // โหลดข้อมูลใหม่
        Swal.fire({
          title: "สำเร็จ!",
          text: `เพิ่ม QTY จำนวน ${addQty} เรียบร้อยแล้ว`,
          icon: "success",
          confirmButtonText: "ตกลง",
          background: '#2a2a2a',
          color: '#e0e0e0'
        });
      } else {
        throw new Error("Failed to add quantity");
      }
    } catch (error) {
      console.error("Error adding quantity:", error);
      Swal.fire({
        title: "เกิดข้อผิดพลาด!",
        text: "ไม่สามารถเพิ่ม QTY ได้",
        icon: "error",
        confirmButtonText: "ตกลง",
        background: '#2a2a2a',
        color: '#e0e0e0'
      });
    }
  };

  return (
    <>
      <Modal
        show={show}
        onHide={onHide}
        size="xl"
        centered
        contentClassName="bg-dark text-light border-secondary"
      >
        <Modal.Header closeButton style={{ backgroundColor: "#2a2a2a", color: "#e0e0e0" }}>
          <Modal.Title>
            <UpcScan className="me-2" />
            รายละเอียดสินค้า - {partNum} ({locationName})
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: "#1a1a1a", color: "#e0e0e0" }}>
          {loading ? (
            <div className="text-center p-4">
              <div className="spinner-border text-light" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : itemDetails.length > 0 ? (
            <div className="table-responsive">
              <Table hover className="align-middle table-dark">
                <thead style={{ backgroundColor: "#333333" }}>
                  <tr className="text-center">
                    <th>Serial Number</th>
                    <th>Part Name</th>
                    <th>Quantity</th>
                    <th>Supplier</th>
                    <th>Supplier SN</th>
                    <th>Supplier Bar Code</th>
                    <th>Date</th>
                    <th>Note</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {itemDetails.map((item, index) => (
                    <tr key={index} className="text-center">
                      <td>
                        <Badge bg="dark" text="light" style={{ 
                          fontWeight: "medium", 
                          backgroundColor: "#424242",
                          padding: "6px 8px",
                          borderRadius: "4px"
                        }}>
                          <UpcScan className="me-1" size={14} />
                          {item.serial_num || '-'}
                        </Badge>
                      </td>
                      <td className="fw-medium text-white">{item.part_name}</td>
                      <td>
                        <Badge bg="secondary" style={{ 
                          fontWeight: "normal", 
                          backgroundColor: "#555555",
                          padding: "5px 8px",
                          borderRadius: "4px"
                        }}>
                          <Box size={12} className="me-1" />
                          {item.qty}
                        </Badge>
                      </td>
                      <td>
                        <span className="d-inline-flex align-items-center">
                          <Building size={14} className="me-1 text-secondary" />
                          {item.supplier}
                        </span>
                      </td>
                      <td>
                        <Badge bg="dark" text="light" style={{ 
                          fontWeight: "medium", 
                          backgroundColor: "#424242",
                          padding: "6px 8px",
                          borderRadius: "4px"
                        }}>
                          {item.sup_serial || "-"}
                        </Badge>
                      </td>
                      <td>
                        <Badge bg="dark" text="light" style={{ 
                          fontWeight: "medium", 
                          backgroundColor: "#424242",
                          padding: "6px 8px",
                          borderRadius: "4px"
                        }}>
                          {item.sup_barcode || "-"}
                        </Badge>
                      </td>
                      <td>
                        <small className="text-muted d-flex align-items-center justify-content-center">
                          <CalendarDate size={12} className="me-1" />
                          {formatDate(item.datetime)}
                        </small>
                      </td>
                      <td>
                        <small className="text-muted">{item.note || "-"}</small>
                      </td>
                      <td>
                        <div className="d-flex justify-content-center gap-1">
                          {/* ปุ่ม Edit */}
                          {userLevel === "admin" && (
                          <Button
                            variant="warning"
                            size="sm"
                            onClick={() => handleEditClick(item)}
                            style={{
                              borderRadius: "6px",
                              backgroundColor: "#fb8c00",
                              borderColor: "#fb8c00",
                            }}
                          >
                            <Pencil size={14} />
                          </Button>
                          )}
                          
                          {/* ปุ่ม Add QTY */}
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => handleAddQtyClick(item)}
                            style={{
                              borderRadius: "6px",
                              backgroundColor: "#28a745",
                              borderColor: "#28a745",
                            }}
                          >
                            <Plus size={14} />
                          </Button>
                          
                          {/* ปุ่ม Print Label */}
                          <BlobProvider
                            document={
                              <SerialLabelPDF
                                data={{
                                  serial: item.serial_num,
                                  part_name: item.part_name,
                                  part_num: item.part_num,
                                  location: locationName,
                                }}
                              />
                            }
                          >
                            {({ blob, url, loading, error }) => (
                              <Button
                                variant="info"
                                size="sm"
                                onClick={() => {
                                  if (url) {
                                    const link = document.createElement('a');
                                    link.href = url;
                                    link.download = `label_${item.serial_num}.pdf`;
                                    link.click();
                                  }
                                }}
                                disabled={loading}
                                style={{
                                  borderRadius: "6px",
                                  backgroundColor: "#17a2b8",
                                  borderColor: "#17a2b8",
                                }}
                              >
                                <Printer size={14} />
                              </Button>
                            )}
                          </BlobProvider>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <div className="text-center p-4">
              <p className="text-muted">ไม่พบข้อมูลสินค้า</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer style={{ backgroundColor: "#2a2a2a", color: "#e0e0e0" }}>
          <Button variant="secondary" onClick={onHide}>
            ปิด
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Item Modal */}
      {userLevel === "admin" && (
  <EditItemModal
    show={showEditModal}
    onHide={handleCloseEditModal}
    item={selectedEditItem}
    onSaveSuccess={handleEditSuccess}
  />
)}

      {/* Add QTY Modal */}
      <Modal
        show={showAddQtyModal}
        onHide={handleCloseAddQtyModal}
        centered
        contentClassName="bg-dark text-light border-secondary"
      >
        <Form noValidate validated={validated} onSubmit={handleAddQtySubmit}>
          <Modal.Header closeButton style={{ backgroundColor: "#2a2a2a", color: "#e0e0e0" }}>
            <Modal.Title>
              <Plus className="me-2" />
              เพิ่ม QTY
            </Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ backgroundColor: "#1a1a1a", color: "#e0e0e0" }}>
            {selectedItem && (
              <>
                <Row className="mb-3">
                  <Col md="6">
                    <strong>Part Number:</strong>
                    <p className="mb-1">{selectedItem.part_num}</p>
                  </Col>
                  <Col md="6">
                    <strong>Serial Number:</strong>
                    <p className="mb-1">{selectedItem.serial_num}</p>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md="12">
                    <strong>Part Name:</strong>
                    <p className="mb-1">{selectedItem.part_name}</p>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md="6">
                    <strong>QTY ปัจจุบัน:</strong>
                    <p className="mb-1 text-info">{selectedItem.qty}</p>
                  </Col>
                  <Col md="6">
                    <strong>Location:</strong>
                    <p className="mb-1">{locationName}</p>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Form.Group as={Col} md="12">
                    <Form.Label>จำนวนที่ต้องการเพิ่ม</Form.Label>
                    <Form.Control
                      type="number"
                      min="1"
                      value={addQty}
                      onChange={(e) => setAddQty(parseInt(e.target.value) || 1)}
                      style={{
                        backgroundColor: "#333333",
                        color: "#e0e0e0",
                        border: "1px solid #555555"
                      }}
                    />
                    <Form.Control.Feedback type="invalid">
                      <strong>กรุณาใส่จำนวนที่ต้องการเพิ่ม (ต้องมากกว่า 0)</strong>
                    </Form.Control.Feedback>
                  </Form.Group>

                  {/* แสดงผลลัพธ์ */}
                  <Col md="12">
                    <div className="p-3 rounded" style={{ backgroundColor: "#1e4620", border: "1px solid #28a745" }}>
                      <p className="mb-0" style={{ color: "#28a745" }}>
                        <strong>QTY หลังเพิ่ม: {parseInt(selectedItem.qty) + addQty}</strong>
                      </p>
                    </div>
                  </Col>
                </Row>
              </>
            )}
          </Modal.Body>
          <Modal.Footer style={{ backgroundColor: "#2a2a2a", color: "#e0e0e0" }}>
            <Button variant="secondary" onClick={handleCloseAddQtyModal}>
              ยกเลิก
            </Button>
            <Button type="submit" variant="success" style={{ backgroundColor: "#28a745", borderColor: "#28a745" }}>
              <Plus className="me-1" size={16} />
              เพิ่ม QTY
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
}

export default ItemDetailModal;