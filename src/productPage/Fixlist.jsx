import React, { useState, useEffect, useRef } from "react";
import { FormControl, Button, Table, Card, Badge, Container, Modal, Form, Row, Col } from "react-bootstrap";
import PaginationComponent from "../components/PaginationComponent";
import Swal from "sweetalert2";
import {
  Search,
  XCircle,
  Trash,
  Plus,
  Tools,
  Pencil,
  CalendarDate,
  PersonFill,
  Display,
  Cpu,
  GeoAltFill
} from "react-bootstrap-icons";

function FixListPage() {
  const searchRef = useRef(null);
  const [fixList, setFixList] = useState([]);
  const [currentPageData, setCurrentPageData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [validated, setValidated] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const itemsPerPage = 15;

  // Form refs
  const statusRef = useRef(null);
  const locationRef = useRef(null);
  const dateRef = useRef(null);
  const fixIdRef = useRef(null);
  const modalRef = useRef(null);
  const cpuRef = useRef(null);
  const mainboardRef = useRef(null);
  const snRef = useRef(null);
  const customerRef = useRef(null);
  const symptomRef = useRef(null);
  const didRef = useRef(null);
  const equipinsiteRef = useRef(null);
  const senderRef = useRef(null);
  const receiverRef = useRef(null);

  // ฟังก์ชันดึงข้อมูล Fix List
  const fetchFixList = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_SERVER}/Store.php?action=getFixList`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setFixList(data);
        paginate(1, data);
      } else {
        setFixList([]);
        setCurrentPageData([]);
      }
    } catch (error) {
      console.error("Error fetching fix list:", error);
      setFixList([]);
      setCurrentPageData([]);
      Swal.fire({
        position: "center",
        icon: "error",
        title: "เกิดข้อผิดพลาดในการดึงข้อมูล",
        showConfirmButton: false,
        timer: 2000,
      });
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชันค้นหา
  const handleSearch = async () => {
    const searchTerm = searchRef.current.value.toLowerCase().trim();
    
    if (!searchTerm) {
      await fetchFixList();
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SERVER}/Store.php?action=searchFixList&search=${encodeURIComponent(searchTerm)}`
      );
      const data = await response.json();
      if (Array.isArray(data)) {
        setFixList(data);
        paginate(1, data);
      } else {
        setFixList([]);
        setCurrentPageData([]);
      }
    } catch (error) {
      console.error("Error searching fix list:", error);
      const filteredData = fixList.filter(item =>
        item.Status?.toLowerCase().includes(searchTerm) ||
        item.Location?.toLowerCase().includes(searchTerm) ||
        item.fixID?.toLowerCase().includes(searchTerm) ||
        item.Modal?.toLowerCase().includes(searchTerm) ||
        item.Cpu?.toLowerCase().includes(searchTerm) ||
        item.Customer?.toLowerCase().includes(searchTerm) ||
        item.SN?.toLowerCase().includes(searchTerm)
      );
      paginate(1, filteredData);
    }
  };

  // ฟังก์ชัน pagination
  const paginate = (pageNumber, data = fixList) => {
    const startIndex = (pageNumber - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setCurrentPageData(data.slice(startIndex, endIndex));
    setCurrentPage(pageNumber);
  };

  // ฟังก์ชันลบข้อมูล
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'คุณแน่ใจหรือไม่?',
      text: "คุณต้องการลบข้อมูลนี้หรือไม่?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e53935',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'ใช่, ลบเลย!',
      cancelButtonText: 'ยกเลิก'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SERVER}/Store.php?action=deleteFixItem&id=${id}`,
          { method: "DELETE" }
        );
        const data = await response.json();
        
        if (data.status === "success") {
          Swal.fire({
            position: "center",
            icon: "success",
            title: "ลบข้อมูลสำเร็จ",
            showConfirmButton: false,
            timer: 1500,
          });
          fetchFixList();
        } else {
          Swal.fire({
            position: "center",
            icon: "error",
            title: "ไม่สามารถลบข้อมูลได้",
            text: data.message,
            showConfirmButton: false,
            timer: 2000,
          });
        }
      } catch (error) {
        console.error("Error deleting item:", error);
        Swal.fire({
          position: "center",
          icon: "error",
          title: "เกิดข้อผิดพลาดในการลบข้อมูล",
          showConfirmButton: false,
          timer: 2000,
        });
      }
    }
  };

  // ฟังก์ชันสร้าง Fix ID อัตโนมัติ
  const generateFixId = async () => {
    try {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const datePrefix = `${year}${month}${day}`;

      // เรียก API เพื่อดึงเลขล่าสุดของวันนี้
      const response = await fetch(
        `${import.meta.env.VITE_SERVER}/Store.php?action=getLastFixId&date=${datePrefix}`
      );
      const data = await response.json();

      let nextSequence = 1;
      if (data && data.last_sequence) {
        nextSequence = parseInt(data.last_sequence) + 1;
      }

      const fixId = `F${datePrefix}${String(nextSequence).padStart(3, '0')}`;
      return fixId;
    } catch (error) {
      console.error("Error generating Fix ID:", error);
      return null;
    }
  };

  // ฟังก์ชันเปิด Modal สำหรับเพิ่มใหม่
  const handleAdd = async () => {
    setEditingItem(null);
    setShowAddModal(true);
    
    // กำหนดค่าเริ่มต้น
    setTimeout(async () => {
      // ตั้งวันที่เป็นวันปัจจุบัน
      const today = new Date();
      const todayString = today.toISOString().split('T')[0];
      
      if (dateRef.current) {
        dateRef.current.value = todayString;
      }
      
      // สร้าง Fix ID อัตโนมัติ
      const fixId = await generateFixId();
      if (fixId && fixIdRef.current) {
        fixIdRef.current.value = fixId;
      }
    }, 100);
  };

  // ฟังก์ชันเปิด Modal สำหรับแก้ไข
  const handleEdit = (item) => {
    setEditingItem(item);
    setShowEditModal(true);
    
    // กำหนดค่าเริ่มต้นในฟอร์ม
    setTimeout(() => {
      if (statusRef.current) statusRef.current.value = item.Status || '';
      if (locationRef.current) locationRef.current.value = item.Location || '';
      if (dateRef.current) dateRef.current.value = item.date || '';
      if (fixIdRef.current) fixIdRef.current.value = item.fixID || '';
      if (modalRef.current) modalRef.current.value = item.Modal || '';
      if (cpuRef.current) cpuRef.current.value = item.Cpu || '';
      if (mainboardRef.current) mainboardRef.current.value = item.Mainboard || '';
      if (snRef.current) snRef.current.value = item.SN || '';
      if (customerRef.current) customerRef.current.value = item.Customer || '';
      if (symptomRef.current) symptomRef.current.value = item.symptom || '';
      if (didRef.current) didRef.current.value = item.did || '';
      if (equipinsiteRef.current) equipinsiteRef.current.value = item.equipinsite || '';
      if (senderRef.current) senderRef.current.value = item.sender || '';
      if (receiverRef.current) receiverRef.current.value = item.receiver || '';
    }, 100);
  };

  // ฟังก์ชันบันทึกข้อมูล
  const handleSubmit = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      setValidated(true);
      return;
    }

    const formData = {
      Status: statusRef.current?.value || '',
      Location: locationRef.current?.value || '',
      date: dateRef.current?.value || '',
      fixID: fixIdRef.current?.value || '',
      Modal: modalRef.current?.value || '',
      Cpu: cpuRef.current?.value || '',
      Mainboard: mainboardRef.current?.value || '',
      SN: snRef.current?.value || '',
      Customer: customerRef.current?.value || '',
      symptom: symptomRef.current?.value || '',
      did: didRef.current?.value || '',
      equipinsite: equipinsiteRef.current?.value || '',
      sender: senderRef.current?.value || '',
      receiver: receiverRef.current?.value || ''
    };

    try {
      const action = editingItem ? 'updateFixItem' : 'addFixItem';
      const url = editingItem 
        ? `${import.meta.env.VITE_SERVER}/Store.php?action=${action}&id=${formData.fixID}`
        : `${import.meta.env.VITE_SERVER}/Store.php?action=${action}`;

      const queryParams = new URLSearchParams(formData).toString();
      
      const response = await fetch(`${url}&${queryParams}`, {
        method: "POST",
      });
      
      const data = await response.json();
      
      if (data === "ok" || data.status === "success") {
        Swal.fire({
          position: "center",
          icon: "success",
          title: editingItem ? "แก้ไขข้อมูลสำเร็จ" : "เพิ่มข้อมูลสำเร็จ",
          showConfirmButton: false,
          timer: 1500,
        });
        
        setShowAddModal(false);
        setShowEditModal(false);
        setEditingItem(null);
        resetForm();
        fetchFixList();
      } else {
        Swal.fire({
          position: "center",
          icon: "error",
          title: "ไม่สามารถบันทึกข้อมูลได้",
          text: typeof data === 'string' ? data : JSON.stringify(data),
          showConfirmButton: true,
        });
      }
    } catch (error) {
      console.error("Error saving data:", error);
      Swal.fire({
        position: "center",
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: error.message,
        showConfirmButton: true,
      });
    }
  };

  // ฟังก์ชัน reset form
  const resetForm = () => {
    const refs = [
      statusRef, locationRef, dateRef, fixIdRef, modalRef, cpuRef,
      mainboardRef, snRef, customerRef, symptomRef, didRef, 
      equipinsiteRef, senderRef, receiverRef
    ];
    
    refs.forEach(ref => {
      if (ref.current) {
        ref.current.value = '';
      }
    });
    
    setValidated(false);
  };

  // ฟังก์ชันปิด Modal
  const handleCloseModal = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setEditingItem(null);
    resetForm();
  };

  // ฟังก์ชันฟอร์แมตวันที่
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // ฟังก์ชันแสดงสถานะ
  const getStatusBadge = (status) => {
    const statusConfig = {
      'pending': { bg: 'warning', text: 'Pending' },
      'in-progress': { bg: 'info', text: 'In Progress' },
      'completed': { bg: 'success', text: 'Completed' },
      'cancelled': { bg: 'danger', text: 'Cancelled' }
    };
    
    const config = statusConfig[status?.toLowerCase()] || { bg: 'secondary', text: status || 'N/A' };
    
    return (
      <Badge bg={config.bg} style={{
        fontWeight: "500",
        padding: "6px 10px",
        borderRadius: "4px",
        fontSize: "0.85rem"
      }}>
        {config.text}
      </Badge>
    );
  };

  useEffect(() => {
    fetchFixList();
  }, []);

  useEffect(() => {
    paginate(currentPage);
  }, [fixList]);

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-vh-100" style={{
      fontFamily: "'Inter', 'Prompt', sans-serif",
      backgroundColor: "#1a1a1a",
      color: "#e0e0e0"
    }}>
      <Container fluid className="px-4 py-4">
        <Card className="border-0 shadow-sm" style={{ backgroundColor: "#2a2a2a", color: "#e0e0e0" }}>
          <Card.Body className="p-4">
            <div className="d-flex flex-column">
              <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
                <h5 className="m-0 fw-bold" style={{ color: "#00c853" }}>
                  <Tools className="me-2" size={22} />
                  Fix List Management
                </h5>
                <div className="d-flex gap-2 flex-wrap">
                  <div className="position-relative">
                    <FormControl
                      className="ps-4"
                      style={{
                        borderRadius: "6px",
                        boxShadow: "none",
                        minWidth: "250px",
                        backgroundColor: "#333333",
                        color: "#e0e0e0",
                        border: "1px solid #444444"
                      }}
                      type="text"
                      placeholder="Search fix list..."
                      ref={searchRef}
                      onKeyPress={handleKeyPress}
                    />
                    <Search className="position-absolute" style={{
                      left: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#999999"
                    }} />
                  </div>
                  <Button
                    variant="primary"
                    style={{
                      backgroundColor: "#00c853",
                      borderColor: "#00c853",
                      borderRadius: "6px"
                    }}
                    onClick={handleSearch}
                  >
                    <Search size={18} className="me-1" /> Search
                  </Button>
                  <Button
                    variant="light"
                    style={{
                      borderRadius: "6px",
                      border: "1px solid #444444",
                      backgroundColor: "#333333",
                      color: "#e0e0e0"
                    }}
                    onClick={() => {
                      searchRef.current.value = '';
                      fetchFixList();
                    }}
                  >
                    <XCircle size={18} className="me-1" /> Clear
                  </Button>
                  <Button
                    variant="success"
                    style={{
                      borderRadius: "6px",
                      backgroundColor: "#007e33",
                      borderColor: "#007e33"
                    }}
                    onClick={handleAdd}
                  >
                    <Plus size={18} className="me-1" /> Add New
                  </Button>
                </div>
              </div>

              <div className="table-responsive">
                <Table hover className="align-middle border table-dark" style={{ borderRadius: "8px", overflow: "hidden" }}>
                  <thead style={{ backgroundColor: "#333333" }}>
                    <tr className="text-center">
                      <th className="py-3" style={{ color: "#e0e0e0" }}>No.</th>
                      <th className="py-3" style={{ color: "#e0e0e0" }}>Status</th>
                      <th className="py-3" style={{ color: "#e0e0e0" }}>Location</th>
                      <th className="py-3" style={{ color: "#e0e0e0" }}>Date</th>
                      <th className="py-3" style={{ color: "#e0e0e0" }}>Fix ID</th>
                      <th className="py-3" style={{ color: "#e0e0e0" }}>Model</th>
                      <th className="py-3" style={{ color: "#e0e0e0" }}>CPU</th>
                      <th className="py-3" style={{ color: "#e0e0e0" }}>Serial Number</th>
                      <th className="py-3" style={{ color: "#e0e0e0" }}>Customer</th>
                      <th className="py-3" style={{ color: "#e0e0e0" }}>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="10" className="text-center py-5" style={{ color: "#bdbdbd" }}>
                          <div className="d-flex flex-column align-items-center">
                            <div className="spinner-border text-success mb-3" role="status">
                              <span className="visually-hidden">Loading...</span>
                            </div>
                            <span className="fw-medium">กำลังโหลดข้อมูล...</span>
                          </div>
                        </td>
                      </tr>
                    ) : currentPageData.length === 0 ? (
                      <tr>
                        <td colSpan="10" className="text-center py-5" style={{ color: "#bdbdbd" }}>
                          <div className="d-flex flex-column align-items-center">
                            <Tools size={40} className="mb-2 text-muted" />
                            <span className="fw-medium">No Data</span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      currentPageData.map((item, index) => (
                        <tr key={item.id || index} className="text-center text-white">
                          <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                          <td>{getStatusBadge(item.Status)}</td>
                          <td>
                            <div className="d-flex align-items-center justify-content-center">
                              <GeoAltFill size={14} className="me-1 text-secondary" />
                              {item.Location || '-'}
                            </div>
                          </td>
                          <td>
                            <small className="text-muted d-flex align-items-center justify-content-center">
                              <CalendarDate size={12} className="me-1" />
                              {formatDate(item.date)}
                            </small>
                          </td>
                          <td>
                            <Badge bg="dark" text="light" style={{
                              fontWeight: "medium",
                              backgroundColor: "#424242",
                              padding: "6px 8px",
                              borderRadius: "4px"
                            }}>
                              {item.fixID || '-'}
                            </Badge>
                          </td>
                          <td className="fw-medium text-white">
                            <Display className="me-2 text-success" size={14} />
                            {item.Modal || '-'}
                          </td>
                          <td>
                            <div className="d-flex align-items-center justify-content-center">
                              <Cpu size={14} className="me-1 text-info" />
                              {item.Cpu || '-'}
                            </div>
                          </td>
                          <td>{item.SN || '-'}</td>
                          <td>
                            <div className="d-flex align-items-center justify-content-center">
                              <PersonFill size={14} className="me-1 text-info" />
                              {item.Customer || '-'}
                            </div>
                          </td>
                          <td>
                            <div className="d-flex justify-content-center gap-1">
                              <Button
                                variant="warning"
                                size="sm"
                                style={{
                                  borderRadius: "6px",
                                  backgroundColor: "#fb8c00",
                                  borderColor: "#fb8c00"
                                }}
                                onClick={() => handleEdit(item)}
                              >
                                <Pencil size={16} />
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                style={{
                                  borderRadius: "6px",
                                  backgroundColor: "#e53935",
                                  borderColor: "#e53935"
                                }}
                                onClick={() => handleDelete(item.id)}
                              >
                                <Trash size={16} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>

              <div className="mt-3 d-flex justify-content-center">
                <PaginationComponent
                  itemsPerPage={itemsPerPage}
                  totalItems={fixList.length}
                  paginate={paginate}
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                />
              </div>
            </div>
          </Card.Body>
        </Card>
      </Container>

      {/* Add/Edit Modal */}
      <Modal
        show={showAddModal || showEditModal}
        onHide={handleCloseModal}
        size="xl"
        backdrop="static"
        keyboard={false}
        centered
        contentClassName="bg-dark text-light border-secondary"
      >
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Modal.Header
            style={{ borderBottom: "1px solid #444" }}
            className="bg-dark text-light"
          >
            <Modal.Title>
              <Tools className="me-2" />
              {editingItem ? 'แก้ไขข้อมูล Fix List' : 'เพิ่มข้อมูล Fix List ใหม่'}
            </Modal.Title>
            <Button
              variant="link"
              onClick={handleCloseModal}
              className="text-light p-0 border-0"
              style={{ fontSize: "1.5rem" }}
            >
              <XCircle />
            </Button>
          </Modal.Header>
          
          <Modal.Body className="bg-dark text-light">
            <Row className="mb-3">
              <Form.Group as={Col} md="6" className="mb-3">
                <Form.Label><b>Status *</b></Form.Label>
                <Form.Select
                  ref={statusRef}
                  required
                  style={{
                    backgroundColor: "#333",
                    color: "#fff",
                    border: "1px solid #444"
                  }}
                >
                  <option value="">เลือกสถานะ</option>
                  <option value="-">-</option>
                  <option value="รอซ่อม">รอซ่อม</option>
                  <option value="อยู่ระหว่างซ่อม">อยู่ระหว่างซ่อม</option>
                  <option value="อยู่ระหว่างเทส">อยู่ระหว่างเทส</option>
                  <option value="รออะไหล่ จอ">รออะไหล่ จอ</option>
                  <option value="รออะไหล่ บอด">รออะไหล่ บอด</option>
                  <option value="รออะไหล่">รออะไหล่</option>
                  <option value="ซ่อมแล้ว ok">ซ่อมแล้ว ok</option>
                  <option value="เครื่องขายมือ 2">เครื่องขายมือ 2</option>
                  <option value="ตีเป็นอะไหล่">ตีเป็นอะไหล่</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  <b>กรุณาเลือกสถานะ</b>
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group as={Col} md="6" className="mb-3">
                <Form.Label><b>Location *</b></Form.Label>
                <Form.Control
                  type="text"
                  ref={locationRef}
                  required
                  style={{
                    backgroundColor: "#333",
                    color: "#fff",
                    border: "1px solid #444"
                  }}
                />
                <Form.Control.Feedback type="invalid">
                  <b>กรุณาใส่ตำแหน่ง</b>
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group as={Col} md="6" className="mb-3">
                <Form.Label><b>Date *</b></Form.Label>
                <Form.Control
                  type="date"
                  ref={dateRef}
                  required
                  readOnly={!editingItem} // อ่านอย่างเดียวสำหรับการเพิ่มใหม่
                  style={{
                    backgroundColor: "#333",
                    color: "#fff",
                    border: "1px solid #444",
                    cursor: !editingItem ? "not-allowed" : "text"
                  }}
                />
                <Form.Control.Feedback type="invalid">
                  <b>กรุณาเลือกวันที่</b>
                </Form.Control.Feedback>
                {!editingItem && (
                  <Form.Text className="text-muted">
                    วันที่จะถูกตั้งเป็นวันปัจจุบันอัตโนมัติ
                  </Form.Text>
                )}
              </Form.Group>

              <Form.Group as={Col} md="6" className="mb-3">
                <Form.Label><b>Fix ID *</b></Form.Label>
                <Form.Control
                  type="text"
                  ref={fixIdRef}
                  required
                  readOnly // อ่านอย่างเดียวเสมอเพราะสร้างอัตโนมัติ
                  style={{
                    backgroundColor: "#333",
                    color: "#fff",
                    border: "1px solid #444",
                    cursor: "not-allowed"
                  }}
                />
                <Form.Control.Feedback type="invalid">
                  <b>Fix ID</b>
                </Form.Control.Feedback>
                <Form.Text className="text-muted">
                  รหัสจะถูกสร้างอัตโนมัติ (ปีเดือนวัน + เลขเจน 3 หลัก)
                </Form.Text>
              </Form.Group>

              <Form.Group as={Col} md="6" className="mb-3">
                <Form.Label><b>Model</b></Form.Label>
                <Form.Control
                  type="text"
                  ref={modalRef}
                  style={{
                    backgroundColor: "#333",
                    color: "#fff",
                    border: "1px solid #444"
                  }}
                />
              </Form.Group>

              <Form.Group as={Col} md="6" className="mb-3">
                <Form.Label><b>CPU</b></Form.Label>
                <Form.Control
                  type="text"
                  ref={cpuRef}
                  style={{
                    backgroundColor: "#333",
                    color: "#fff",
                    border: "1px solid #444"
                  }}
                />
              </Form.Group>

              <Form.Group as={Col} md="6" className="mb-3">
                <Form.Label><b>Mainboard</b></Form.Label>
                <Form.Control
                  type="text"
                  ref={mainboardRef}
                  style={{
                    backgroundColor: "#333",
                    color: "#fff",
                    border: "1px solid #444"
                  }}
                />
              </Form.Group>

              <Form.Group as={Col} md="6" className="mb-3">
                <Form.Label><b>Serial Number</b></Form.Label>
                <Form.Control
                  type="text"
                  ref={snRef}
                  style={{
                    backgroundColor: "#333",
                    color: "#fff",
                    border: "1px solid #444"
                  }}
                />
              </Form.Group>

              <Form.Group as={Col} md="12" className="mb-3">
                <Form.Label><b>Customer</b></Form.Label>
                <Form.Control
                  type="text"
                  ref={customerRef}
                  style={{
                    backgroundColor: "#333",
                    color: "#fff",
                    border: "1px solid #444"
                  }}
                />
              </Form.Group>

              <Form.Group as={Col} md="12" className="mb-3">
                <Form.Label><b>อาการ</b></Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  ref={symptomRef}
                  style={{
                    backgroundColor: "#333",
                    color: "#fff",
                    border: "1px solid #444"
                  }}
                />
              </Form.Group>

              <Form.Group as={Col} md="12" className="mb-3">
                <Form.Label><b>ทำอะไรไปบ้าง</b></Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  ref={didRef}
                  style={{
                    backgroundColor: "#333",
                    color: "#fff",
                    border: "1px solid #444"
                  }}
                />
              </Form.Group>

              <Form.Group as={Col} md="8" className="mb-3">
                <Form.Label><b>อุปกรณ์ข้างใน</b></Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  ref={equipinsiteRef}
                  style={{
                    backgroundColor: "#333",
                    color: "#fff",
                    border: "1px solid #444"
                  }}
                />
              </Form.Group>

              <Form.Group as={Col} md="2" className="mb-3">
                <Form.Label><b>ผู้ส่งซ่อม</b></Form.Label>
                <Form.Control
                  type="text"
                  ref={senderRef}
                  style={{
                    backgroundColor: "#333",
                    color: "#fff",
                    border: "1px solid #444"
                  }}
                />
              </Form.Group>

              <Form.Group as={Col} md="2" className="mb-3">
                <Form.Label><b>ผู้รับ</b></Form.Label>
                <Form.Control
                  type="text"
                  ref={receiverRef}
                  style={{
                    backgroundColor: "#333",
                    color: "#fff",
                    border: "1px solid #444"
                  }}
                />
              </Form.Group>
            </Row>
          </Modal.Body>
          
          <Modal.Footer className="bg-dark text-light" style={{ borderTop: "1px solid #444" }}>
            <Button
              variant="secondary"
              onClick={handleCloseModal}
              style={{
                backgroundColor: "#555",
                borderColor: "#555",
                borderRadius: "6px"
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
                borderRadius: "6px"
              }}
            >
              {loading ? (
                "กำลังบันทึก..."
              ) : (
                <>
                  <Tools className="me-1" size={18} />
                  {editingItem ? 'แก้ไข' : 'บันทึก'}
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}

export default FixListPage;