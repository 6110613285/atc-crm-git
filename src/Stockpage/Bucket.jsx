import React, { useState, useEffect, useRef } from "react";
import { FormControl, Button, Table, Tabs, Tab, Card, Badge, Container, Alert } from "react-bootstrap";
import PaginationComponent from "../components/PaginationComponent";
import AddBucket from "../Stockpage/addbucket";
import Swal from "sweetalert2";
import { Basket} from "react-bootstrap-icons";
import axios from 'axios';

import EditModal from "../Stockpage/EditModal";
import { Bucket, Pencil } from "react-bootstrap-icons"; //เรียกใช้ react-bootstrap-icons
import { 
  Search, 
  XCircle, 
  Trash, 
  Plus, 
  Tools
} from "react-bootstrap-icons";

function ManageBucketPage() {
  const searchRef = useRef(null);
  const [parts, setParts] = useState([]);

  // สถานะสำหรับการแบ่งหน้า
  const [currentPartPageData, setCurrentPartPageData] = useState([]);
  const [currentPartPage, setCurrentPartPage] = useState(1);
  const itemsPerPage = 15;

  // ===== ฟังก์ชันจัดการ Parts =====
  // ดึงข้อมูล parts
  const getBucket = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER}/Store.php?action=getBucket`,
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
          getBucket();
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

  //save bucket
const BucketForm = () => {
  const [formData, setFormData] = useState({
    UID: '',
    PO: '',
    QO: '',
    CUSTOMER: '',
    BucketID: '',
    USERID: '',
    USERNAME: '',
    Partname: '',
    QTY: '',
    status: 'approve',
    datetime: '',
    Note: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  };
   return (
    <form onSubmit={handleSubmit} className="p-4 max-w-md mx-auto shadow-lg rounded bg-white space-y-3">
      <h2 className="text-xl font-semibold text-center mb-4">เพิ่มข้อมูล Bucket</h2>

      {Object.keys(formData).map((key) => (
        key !== 'status' && key !== 'datetime' ? (
          <div key={key}>
            <label className="block mb-1 font-medium">{key}</label>
            <input
              type="text"
              name={key}
              value={formData[key]}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
        ) : null
      ))}
      <div>
        <label className="block mb-1 font-medium">Status</label>
        <select name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 border rounded">
          <option value="approve">Approve</option>
          <option value="na">Not Approve</option>
          <option value="cancel">Cancel</option>
        </select>
      </div>

      <div>
        <label className="block mb-1 font-medium">Datetime</label>
        <input
          type="datetime-local"
          name="datetime"
          value={formData.datetime}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded"
        />
      </div>
      <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
        บันทึกข้อมูล
      </button>
    </form>
  );
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
    getBucket();
  }, []);

  // อัปเดตข้อมูลหน้าเมื่อข้อมูล parts เปลี่ยนแปลง
  useEffect(() => {
    paginateParts(currentPartPage);
  }, [parts]);

  // ฟังก์ชันจัดการการบันทึก
  const handleSave = () => {
    getBucket();
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
              <Basket className="me-2" /> 
              <span className="fw-medium">Bucket</span>
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
                  <Basket className="me-2" size={22} />
                  Bucket         
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
                        await getBucket();
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
                  <AddBucket onSave={handleSave}>
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
                  </AddBucket>
                </div>
              </div>
              
              <div className="table-responsive">
                <Table hover className="align-middle border table-dark" style={{ borderRadius: "8px", overflow: "hidden" }}>
                  <thead style={{ backgroundColor: "#333333" }}>
                    <tr className="text-center">
                      <th className="py-3" style={{ color: "#e0e0e0" }}>No.</th> {/* ไอดีรายการหลัก */}
                      <th className="py-3" style={{ color: "#e0e0e0" }}>PO</th> {/* หมายเลขคำสั่งซื้อ */}
                      <th className="py-3" style={{ color: "#e0e0e0" }}>QO</th> {/* จำนวนที่สั่งซื้อ */}
                      <th className="py-3" style={{ color: "#e0e0e0" }}>CUSTOMER</th> {/* ชื่อลูกค้า */}
                      <th className="py-3" style={{ color: "#e0e0e0" }}>BucketID</th> {/* หมายเลขตะกร้า */}
                      <th className="py-3" style={{ color: "#e0e0e0" }}>USERID</th> {/* ไอดีผู้ใช้ */}
                      <th className="py-3" style={{ color: "#e0e0e0" }}>USERNAME</th> {/* ชื่อผู้ใช้ */}
                      <th className="py-3" style={{ color: "#e0e0e0" }}>Partname</th> {/* ชื่อชิ้นส่วน*/}
                      <th className="py-3" style={{ color: "#e0e0e0" }}>QTY</th> {/* จำนวน*/}
                      <th className="py-3" style={{ color: "#e0e0e0" }}>status</th> {/* สถานะรายการ */}
                      <th className="py-3" style={{ color: "#e0e0e0" }}>datetime</th> {/* วันเวลาบันทึก */}
                      <th className="py-3" style={{ color: "#e0e0e0" }}>Note</th> {/* หมายเหตุ */}
                      <th className="py-3" style={{ color: "#e0e0e0" }}>Action</th> {/* ลบ แก้ไขรายละเอียด */}
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
                         {/* ตารางช่องแรก */}
                      {currentPartPageData.map((part, index) => (
                        <tr key={part.UID} className="text-center">
                          <td>{(currentPartPage - 1) * itemsPerPage + index + 1}</td>
                          <td>
                            <Badge bg="dark" text="light" style={{ 
                              fontWeight: "medium", 
                              backgroundColor: "#424242",
                              padding: "6px 8px",
                              borderRadius: "4px"
                            }}>
                              {part.PO} 
                              {/* ตารางช่องแรก */}
                            </Badge>
                          </td>
                          <td className="fw-medium text-white">{part.QO}</td>
                          <td>
                            <Badge bg="success" style={{ 
                              fontWeight: "normal", 
                              backgroundColor: "#00c853",
                              padding: "5px 8px",
                              borderRadius: "4px",
                              fontSize: "0.85rem"
                            }}>
                              {part.CUSTOMER}
                            </Badge>
                          </td>
                          <td>{part.BucketID}</td>
                          <td>{part.USERID || "-"}</td>
                          <td>{part.USERNAME}</td>
                          <td>{part.Partname || "-"}</td>
                          <td>{part.QTY || "-"}</td>
                          <td>{part.status || "-"}</td>
                          <td>{part.datetime || "-"}</td>
                          <td>{part.Note || "-"}</td>
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
                            <EditModal 
  entityType="part" 
    data={part}  // ข้อมูล part ที่ต้องการแก้ไข
    onSave={handleSave}
    customTitle="แก้ไขข้อมูลชิ้นส่วน"
  >
  <Button
    variant="warning"
    size="sm"
    className="ms-1"
    style={{
      borderRadius: "6px",
      backgroundColor: "#fb8c00",
      borderColor: "#fb8c00"
    }}
  >
    <Pencil size={16} />
  </Button>
</EditModal>
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

export default ManageBucketPage;