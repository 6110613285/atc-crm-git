import React, { useState, useEffect, useRef } from "react";
import { FormControl, Button, Table, Card, Badge, Container, Row, Col } from "react-bootstrap";
import PaginationComponent from "../components/PaginationComponent";
import { Search, XCircle, Calendar, PersonFill, BoxArrowInRight, BoxArrowRight, ArrowRepeat, Eye } from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";

function PcLog() {
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const startDateRef = useRef(null);
  const endDateRef = useRef(null);
  const statusRef = useRef(null);
  
  const [logData, setLogData] = useState([]);
  const [currentPageData, setCurrentPageData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [totalLogs, setTotalLogs] = useState(0);

  const itemsPerPage = 25;

  // ฟังก์ชันดึงข้อมูล PC Log
  const getPcLog = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER}/Store.php?action=getPcLog`,
        { method: "GET" }
      );
      const data = await res.json();
      if (data === null) {
        setLogData([]);
      } else {
        setLogData(data);
        setTotalLogs(data.length);
        paginateLog(1, data);
      }
    } catch (err) {
      console.error("Error fetching PC log:", err);
      setLogData([]);
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชันค้นหา PC Log
  const searchPcLog = async () => {
    setLoading(true);
    try {
      const search = searchRef.current?.value || '';
      const status = statusRef.current?.value || '';
      const startDate = startDateRef.current?.value || '';
      const endDate = endDateRef.current?.value || '';

      const params = new URLSearchParams({
        action: 'searchPcLog',
        search: search,
        status: status,
        start_date: startDate,
        end_date: endDate
      });

      const res = await fetch(
        `${import.meta.env.VITE_SERVER}/Store.php?${params}`,
        { method: "GET" }
      );
      const data = await res.json();
      if (data === null) {
        setLogData([]);
      } else {
        setLogData(data);
        setTotalLogs(data.length);
        paginateLog(1, data);
      }
    } catch (err) {
      console.error("Error searching PC log:", err);
      setLogData([]);
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชันแบ่งหน้า
  const paginateLog = (pageNumber, data = logData) => {
    const startIndex = (pageNumber - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setCurrentPageData(data.slice(startIndex, endIndex));
    setCurrentPage(pageNumber);
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

  // ฟังก์ชันแสดง Badge สถานะ
  const getStatusBadge = (status) => {
    const statusConfig = {
      'IN': { bg: 'success', text: 'เข้า', icon: <BoxArrowInRight size={12} /> },
      'OUT': { bg: 'danger', text: 'ออก', icon: <BoxArrowRight size={12} /> },
      'BORROW': { bg: 'warning', text: 'ยืม', icon: <ArrowRepeat size={12} /> },
      'RETURN': { bg: 'info', text: 'คืน', icon: <ArrowRepeat size={12} /> }
    };
    
    const config = statusConfig[status] || { bg: 'secondary', text: status || 'Unknown', icon: null };
    
    return (
      <Badge bg={config.bg} className="d-flex align-items-center gap-1" style={{
        fontWeight: "500",
        padding: "6px 10px",
        borderRadius: "4px",
        fontSize: "0.85rem",
        minWidth: "60px",
        justifyContent: "center"
      }}>
        {config.icon}
        {config.text}
      </Badge>
    );
  };

  // ฟังก์ชันไปหน้า ProductPage พร้อมค้นหา
  const handleViewProduct = (searchTerm) => {
    // ไปหน้า ProductPage พร้อมพารามิเตอร์ค้นหา
    navigate(`/products?search=${encodeURIComponent(searchTerm)}`);
  };

  // ฟังก์ชันจัดการการกดปุ่ม Enter
  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      searchPcLog();
    }
  };

  // ฟังก์ชันล้างการค้นหา
  const handleClear = () => {
    if (searchRef.current) searchRef.current.value = '';
    if (statusRef.current) statusRef.current.value = '';
    if (startDateRef.current) startDateRef.current.value = '';
    if (endDateRef.current) endDateRef.current.value = '';
    getPcLog();
  };

  // นับจำนวนตามสถานะ
  const getStatusCounts = () => {
    const counts = { IN: 0, OUT: 0, BORROW: 0, RETURN: 0 };
    logData.forEach(log => {
      if (counts[log.status] !== undefined) {
        counts[log.status]++;
      }
    });
    return counts;
  };

  const statusCounts = getStatusCounts();

  // ดึงข้อมูลเมื่อโหลดคอมโพเนนต์
  useEffect(() => {
    getPcLog();
  }, []);

  // อัปเดตข้อมูลหน้าเมื่อข้อมูลเปลี่ยนแปลง
  useEffect(() => {
    paginateLog(currentPage);
  }, [logData]);

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
              {/* Header */}
              <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
                <h5 className="m-0 fw-bold" style={{ color: "#00c853" }}>
                  <Calendar className="me-2" size={22} />
                  PC Movement Log ({totalLogs} รายการ)
                </h5>
              </div>

              {/* สรุปสถานะ */}
              <Row className="mb-4">
                <Col md={3} sm={6} className="mb-2">
                  <Card style={{ backgroundColor: "#333333", border: "1px solid #444444" }}>
                    <Card.Body className="text-center py-2">
                      <div className="d-flex align-items-center justify-content-center gap-2">
                        <BoxArrowInRight size={20} className="text-success" />
                        <div>
                          <h6 className="text-success mb-0">{statusCounts.IN}</h6>
                          <small className="text-muted">เข้า</small>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3} sm={6} className="mb-2">
                  <Card style={{ backgroundColor: "#333333", border: "1px solid #444444" }}>
                    <Card.Body className="text-center py-2">
                      <div className="d-flex align-items-center justify-content-center gap-2">
                        <BoxArrowRight size={20} className="text-danger" />
                        <div>
                          <h6 className="text-danger mb-0">{statusCounts.OUT}</h6>
                          <small className="text-muted">ออก</small>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3} sm={6} className="mb-2">
                  <Card style={{ backgroundColor: "#333333", border: "1px solid #444444" }}>
                    <Card.Body className="text-center py-2">
                      <div className="d-flex align-items-center justify-content-center gap-2">
                        <ArrowRepeat size={20} className="text-warning" />
                        <div>
                          <h6 className="text-warning mb-0">{statusCounts.BORROW}</h6>
                          <small className="text-muted">ยืม</small>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3} sm={6} className="mb-2">
                  <Card style={{ backgroundColor: "#333333", border: "1px solid #444444" }}>
                    <Card.Body className="text-center py-2">
                      <div className="d-flex align-items-center justify-content-center gap-2">
                        <ArrowRepeat size={20} className="text-info" />
                        <div>
                          <h6 className="text-info mb-0">{statusCounts.RETURN}</h6>
                          <small className="text-muted">คืน</small>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              {/* ช่องค้นหา */}
              <Row className="mb-4">
                <Col lg={3} md={6} className="mb-2">
                  <div className="position-relative">
                    <FormControl
                      className="ps-4"
                      style={{
                        borderRadius: "6px",
                        backgroundColor: "#333333",
                        color: "#e0e0e0",
                        border: "1px solid #444444"
                      }}
                      type="text"
                      placeholder="ค้นหา Model, S/N, User..."
                      ref={searchRef}
                      onKeyPress={handleKeyPress}
                    />
                    <Search className="position-absolute" style={{
                      left: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#999999"
                    }} size={16} />
                  </div>
                </Col>
                <Col lg={2} md={6} className="mb-2">
                  <FormControl
                    as="select"
                    ref={statusRef}
                    style={{
                      borderRadius: "6px",
                      backgroundColor: "#333333",
                      color: "#e0e0e0",
                      border: "1px solid #444444"
                    }}
                  >
                    <option value="">ทุกสถานะ</option>
                    <option value="IN">เข้า</option>
                    <option value="OUT">ออก</option>
                    <option value="BORROW">ยืม</option>
                    <option value="RETURN">คืน</option>
                  </FormControl>
                </Col>
                <Col lg={2} md={6} className="mb-2">
                  <FormControl
                    type="date"
                    ref={startDateRef}
                    style={{
                      borderRadius: "6px",
                      backgroundColor: "#333333",
                      color: "#e0e0e0",
                      border: "1px solid #444444"
                    }}
                  />
                </Col>
                <Col lg={2} md={6} className="mb-2">
                  <FormControl
                    type="date"
                    ref={endDateRef}
                    style={{
                      borderRadius: "6px",
                      backgroundColor: "#333333",
                      color: "#e0e0e0",
                      border: "1px solid #444444"
                    }}
                  />
                </Col>
                <Col lg={3} md={12} className="mb-2">
                  <div className="d-flex gap-2">
                    <Button
                      variant="primary"
                      style={{
                        backgroundColor: "#00c853",
                        borderColor: "#00c853",
                        borderRadius: "6px",
                        flex: 1
                      }}
                      onClick={searchPcLog}
                    >
                      <Search size={16} className="me-1" /> ค้นหา
                    </Button>
                    <Button
                      variant="light"
                      style={{
                        borderRadius: "6px",
                        border: "1px solid #444444",
                        backgroundColor: "#333333",
                        color: "#e0e0e0"
                      }}
                      onClick={handleClear}
                    >
                      <XCircle size={16} />
                    </Button>
                  </div>
                </Col>
              </Row>

              {/* ตาราง PC Log */}
              <div className="table-responsive">
                <Table hover className="align-middle border table-dark" style={{ borderRadius: "8px", overflow: "hidden" }}>
                  <thead style={{ backgroundColor: "#333333" }}>
                    <tr className="text-center">
                      <th className="py-3" style={{ color: "#e0e0e0", width: "8%" }}>No.</th>
                      <th className="py-3" style={{ color: "#e0e0e0", width: "12%" }}>วันที่</th>
                      <th className="py-3" style={{ color: "#e0e0e0", width: "20%" }}>AT Model</th>
                      <th className="py-3" style={{ color: "#e0e0e0", width: "20%" }}>Serial Number</th>
                      <th className="py-3" style={{ color: "#e0e0e0", width: "12%" }}>สถานะ</th>
                      <th className="py-3" style={{ color: "#e0e0e0", width: "15%" }}>ผู้ดำเนินการ</th>
                      <th className="py-3" style={{ color: "#e0e0e0", width: "13%" }}>ดูรายละเอียด</th>
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="7" className="text-center py-5" style={{ color: "#bdbdbd" }}>
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
                        <td colSpan="7" className="text-center py-5" style={{ color: "#bdbdbd" }}>
                          <div className="d-flex flex-column align-items-center">
                            <Calendar size={40} className="mb-2 text-muted" />
                            <span className="fw-medium">ไม่พบข้อมูล Log</span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      currentPageData.map((log, index) => (
                        <tr key={log.logID || index} className="text-center text-white">
                          <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                          <td>
                            <div className="d-flex align-items-center justify-content-center">
                              <Calendar size={14} className="me-1 text-secondary" />
                              <small>{formatDate(log.date)}</small>
                            </div>
                          </td>
                          <td>
                            <Button
                              variant="link"
                              className="p-0 text-success text-decoration-none fw-bold"
                              onClick={() => handleViewProduct(log.ATC_modal)}
                              title="คลิกเพื่อดูรายละเอียดสินค้า"
                            >
                              {log.ATC_modal || '-'}
                            </Button>
                          </td>
                          <td>
                            <Button
                              variant="link"
                              className="p-0 text-decoration-none"
                              onClick={() => handleViewProduct(log.SN)}
                              title="คลิกเพื่อดูรายละเอียดสินค้า"
                            >
                              <Badge bg="dark" style={{
                                backgroundColor: "#424242",
                                padding: "5px 8px",
                                borderRadius: "4px",
                                fontFamily: "monospace",
                                color: "#fff"
                              }}>
                                {log.SN || '-'}
                              </Badge>
                            </Button>
                          </td>
                          <td>{getStatusBadge(log.status)}</td>
                          <td>
                            <div className="d-flex align-items-center justify-content-center">
                              <PersonFill size={14} className="me-1 text-info" />
                              <span>{log.user || '-'}</span>
                            </div>
                          </td>
                          <td>
                            <Button
                              variant="info"
                              size="sm"
                              onClick={() => handleViewProduct(log.ATC_modal)}
                              style={{
                                borderRadius: "4px",
                                padding: "4px 8px"
                              }}
                              title="ดูรายละเอียดสินค้า"
                            >
                              <Eye size={14} className="me-1" />
                              ดูรายละเอียด
                            </Button>
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
                  totalItems={logData.length}
                  paginate={paginateLog}
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                />
              </div>
            </div>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}

export default PcLog;