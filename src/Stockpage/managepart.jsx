import React, { useState, useEffect, useRef } from "react";
import { FormControl, Button, Table, Tabs, Tab, Card, Badge, Container, Alert } from "react-bootstrap";
import PaginationComponent from "../components/PaginationComponent";
import Addpart from "../Stockpage/addpart";
import Swal from "sweetalert2";
import { 
  Search, 
  XCircle, 
  Trash, 
  Plus, 
  Tools
} from "react-bootstrap-icons";

function ManageSerialPage() {
  const searchRef = useRef(null);
  const [parts, setParts] = useState([]);

  // สถานะสำหรับการแบ่งหน้า
  const [currentPartPageData, setCurrentPartPageData] = useState([]);
  const [currentPartPage, setCurrentPartPage] = useState(1);
  const itemsPerPage = 15;

  // ===== ฟังก์ชันจัดการ Parts =====
  // ดึงข้อมูล parts
  const getParts = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER}/Store.php?action=getParts`,
        {
          method: "GET",
        }
      );
      const data = await res.json();
      if (data === null) {
        setParts([]);
      } else {
        setParts(data);
      }
    } catch (err) {
      console.log(err);
      setParts([]);
    }
  };

  // ค้นหา parts
  const searchParts = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER}/Store.php?action=searchParts&search=${
          searchRef.current.value || ""
        }`,
        {
          method: "GET",
        }
      );
      const data = await res.json();
      if (data === null) {
        setParts([]);
      } else {
        setParts(data);
      }
    } catch (err) {
      console.log(err);
      setParts([]);
    }
  };

  // ลบ part
  const deletePart = async (partNum) => {
    if (window.confirm("คุณต้องการลบข้อมูลชิ้นส่วนนี้หรือไม่?")) {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_SERVER}/Store.php?action=deletePart&part_num=${partNum}`,
          {
            method: "DELETE",
          }
        );
        const data = await res.json();
        if (data.status === "success") {
          Swal.fire({
            position: "center",
            icon: "success",
            title: "ลบข้อมูลสำเร็จ",
            showConfirmButton: false,
            timer: 1500,
          });
          getParts();
        } else {
          Swal.fire({
            position: "center",
            icon: "error",
            title: `ไม่สามารถลบข้อมูลได้: ${data.message}`,
            showConfirmButton: false,
            timer: 2000,
          });
        }
      } catch (err) {
        console.log(err);
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

  // ===== ฟังก์ชันแบ่งหน้า =====
  // แบ่งหน้าสำหรับข้อมูล parts
  const paginateParts = (pageNumber) => {
    const startIndex = (pageNumber - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setCurrentPartPageData(parts.slice(startIndex, endIndex));
    setCurrentPartPage(pageNumber);
  };

  // ดึงข้อมูลเมื่อโหลดคอมโพเนนต์
  useEffect(() => {
    getParts();
  }, []);

  // อัปเดตข้อมูลหน้าเมื่อข้อมูล parts เปลี่ยนแปลง
  useEffect(() => {
    paginateParts(currentPartPage);
  }, [parts]);

  // ฟังก์ชันจัดการการบันทึก
  const handleSave = () => {
    getParts();
  };

  // ฟังก์ชันจัดการการกดปุ่ม Enter
  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      searchParts();
      paginateParts(1);
    }
  };

  return (
    <div className="min-vh-100" style={{ 
        fontFamily: "'Inter', 'Prompt', sans-serif",
        backgroundColor: "#1a1a1a",
        color: "#e0e0e0"
      }}>
      {/* ส่วนแท็บการจัดการ */}
      <Tabs
        activeKey="parts"
        className="mb-0 nav-fill"
        style={{ 
          backgroundColor: "#2a2a2a",
          borderBottom: "1px solid #333333",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
        }}
      >
        <Tab 
          eventKey="parts" 
          title={
            <div className="d-flex align-items-center py-3" style={{ color: "#00c853" }}>
              <Tools className="me-2" /> 
              <span className="fw-medium">Create New Parts</span>
            </div>
          }
        />
      </Tabs>

      <Container fluid className="px-4 py-4">
        <Card className="border-0 shadow-sm" style={{ backgroundColor: "#2a2a2a", color: "#e0e0e0" }}>
          <Card.Body className="p-4">
            <div className="d-flex flex-column">
              <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
                <h5 className="m-0 fw-bold" style={{ color: "#00c853" }}>
                  <Tools className="me-2" size={22} />
                  Parts
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
                      placeholder="ค้นหาชิ้นส่วน..."
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
                    onClick={async () => {
                      if (searchRef.current.value.trim() === '') {
                        await getParts();
                      } else {
                        await searchParts();
                      }
                      paginateParts(1);
                    }}
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
                    onClick={async () => {
                      searchRef.current.value = '';
                      await getParts();
                      paginateParts(1);
                    }}
                  >
                    <XCircle size={18} className="me-1" /> Clear
                  </Button>
                  <Addpart onSave={handleSave}>
                    <Button
                      variant="success"
                      style={{ 
                        borderRadius: "6px",
                        backgroundColor: "#007e33",
                        borderColor: "#007e33"
                      }}
                    >
                      <Plus size={18} className="me-1" />
                    </Button>
                  </Addpart>
                </div>
              </div>
              
              <div className="table-responsive">
                <Table hover className="align-middle border table-dark" style={{ borderRadius: "8px", overflow: "hidden" }}>
                  <thead style={{ backgroundColor: "#333333" }}>
                    <tr className="text-center">
                      <th className="py-3" style={{ color: "#e0e0e0" }}>No.</th>
                      <th className="py-3" style={{ color: "#e0e0e0" }}>Part Number</th>
                      <th className="py-3" style={{ color: "#e0e0e0" }}>Part Name</th>
                      <th className="py-3" style={{ color: "#e0e0e0" }}>Type Prefix</th>
                      <th className="py-3" style={{ color: "#e0e0e0" }}>Supplier</th>
                      <th className="py-3" style={{ color: "#e0e0e0" }}>Brand</th>
                      <th className="py-3" style={{ color: "#e0e0e0" }}>Min</th>
                      <th className="py-3" style={{ color: "#e0e0e0" }}>Detail</th>
                      <th className="py-3" style={{ color: "#e0e0e0" }}>Action</th>
                    </tr>
                  </thead>

                  {parts.length === 0 ? (
                    <tbody>
                      <tr>
                        <td colSpan={9} className="text-center py-5" style={{ color: "#bdbdbd" }}>
                          <div className="d-flex flex-column align-items-center">
                            <Tools size={40} className="mb-2 text-muted" />
                            <span className="fw-medium">No Data</span>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  ) : (
                    <tbody>
                      {currentPartPageData.map((part, index) => (
                        <tr key={part.part_num} className="text-center">
                          <td>{(currentPartPage - 1) * itemsPerPage + index + 1}</td>
                          <td>
                            <Badge bg="dark" text="light" style={{ 
                              fontWeight: "medium", 
                              backgroundColor: "#424242",
                              padding: "6px 8px",
                              borderRadius: "4px"
                            }}>
                              {part.part_num}
                            </Badge>
                          </td>
                          <td className="fw-medium text-white">{part.part_name}</td>
                          <td>
                            <Badge bg="success" style={{ 
                              fontWeight: "normal", 
                              backgroundColor: "#00c853",
                              padding: "5px 8px",
                              borderRadius: "4px",
                              fontSize: "0.85rem"
                            }}>
                              {part.part_type}
                            </Badge>
                          </td>
                          <td>{part.supplier}</td>
                          <td>{part.brand || "-"}</td>
                          <td>{part.min}</td>
                          <td>{part.part_detail || "-"}</td>
                          <td>
                            <Button
                              variant="danger"
                              size="sm"
                              style={{ 
                                borderRadius: "6px",
                                backgroundColor: "#e53935",
                                borderColor: "#e53935"
                              }}
                              onClick={() => deletePart(part.part_num)}
                            >
                              <Trash size={16} />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  )}
                </Table>
              </div>
              <div className="mt-3 d-flex justify-content-center">
                <PaginationComponent
                  itemsPerPage={itemsPerPage}
                  totalItems={parts.length}
                  paginate={paginateParts}
                  currentPage={currentPartPage}
                  setCurrentPage={setCurrentPartPage}
                />
              </div>
            </div>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}

export default ManageSerialPage;