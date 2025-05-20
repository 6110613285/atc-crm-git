import React, { useContext, useState, useEffect, useRef } from "react";
import { FormControl, Button, Table, Card, Container, Badge } from "react-bootstrap";
import { UserContext } from "../App";
import PaginationComponent from "../components/PaginationComponent";
import AddSerial from "./AddSerial";
import Swal from "sweetalert2";
import { BlobProvider } from '@react-pdf/renderer';
import { SerialLabelPDF } from "./SerialLabelPDF";
import { useNavigate } from 'react-router-dom';
import { Printer } from "react-feather";
import {
  Search,
  XCircle,
  Trash,
  Plus,
  UpcScan,
  Box,
  Building
} from "react-bootstrap-icons";

function ReceivePart() {
  const userInfo = useContext(UserContext);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  // สถานะสำหรับ serials
  const [serials, setSerials] = useState([]);
  const [currentSerialPageData, setCurrentSerialPageData] = useState([]);
  const [currentSerialPage, setCurrentSerialPage] = useState(1);

  const itemsPerPage = 15;

  // ฟังก์ชันจัดการ Serials
  const getSerials = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER}/Store.php?action=getSerials`,
        {
          method: "GET",
        }
      );
      const data = await res.json();
      if (data === null) {
        setSerials([]);
      } else {
        setSerials(data);
      }
    } catch (err) {
      console.log(err);
      setSerials([]);
    }
  };

  const handleSearchInStock = (partNum) => {
    // เปลี่ยนไปที่หน้า LogStock พร้อมส่งพารามิเตอร์ search
    navigate(`/stock?search=${partNum}`);
  };

  // ค้นหา serials
  const searchSerials = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER}/Store.php?action=searchSerials&search=${searchRef.current.value || ""
        }`,
        {
          method: "GET",
        }
      );
      const data = await res.json();
      if (data === null) {
        setSerials([]);
      } else {
        setSerials(data);
      }
    } catch (err) {
      console.log(err);
      setSerials([]);
    }
  };

  // ลบ serial
  const deleteSerial = async (part_no) => {
    if (window.confirm("คุณต้องการลบ Serial นี้หรือไม่?")) {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_SERVER}/Store.php?action=deleteSerial&part_no=${part_no}`,
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
          getSerials();
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

  // เพิ่มฟังก์ชันแบ่งหน้าสำหรับ serials
  const paginateSerials = (pageNumber) => {
    const startIndex = (pageNumber - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setCurrentSerialPageData(serials.slice(startIndex, endIndex));
    setCurrentSerialPage(pageNumber);
  };

  const handleSave = () => {
    getSerials(); // โหลดข้อมูล serials ใหม่
  };

  const handleSearch = () => {
    const searchTerm = searchRef.current.value.toLowerCase().trim();
    searchSerials();
  };

  useEffect(() => {
    if (userInfo) {
      getSerials();
    }
  }, [userInfo]);

  // อัปเดตข้อมูลหน้าเมื่อข้อมูล serials เปลี่ยนแปลง
  useEffect(() => {
    paginateSerials(currentSerialPage);
  }, [serials]);

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
                  <UpcScan className="me-2" size={22} />
                  Receive Part
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
                      placeholder="ค้นหาซีเรียลนัมเบอร์..."
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
                        await getSerials();
                      } else {
                        await searchSerials();
                      }
                      paginateSerials(1);
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
                      await getSerials();
                      paginateSerials(1);
                    }}
                  >
                    <XCircle size={18} className="me-1" /> Clear
                  </Button>
                  <AddSerial onSave={handleSave}>
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
                  </AddSerial>
                </div>
              </div>

              <div className="table-responsive">
                <Table hover className="align-middle border table-dark" style={{ borderRadius: "8px", overflow: "hidden" }}>
                  <thead style={{ backgroundColor: "#333333" }}>
                    <tr className="text-center">
                      <th className="py-3" style={{ color: "#e0e0e0" }}>No.</th>
                      <th className="py-3" style={{ color: "#e0e0e0" }}>Serial Number</th>
                      <th className="py-3" style={{ color: "#e0e0e0" }}>Part Number</th>
                      <th className="py-3" style={{ color: "#e0e0e0" }}>Part Name</th>
                      <th className="py-3" style={{ color: "#e0e0e0" }}>Supplier</th>
                      <th className="py-3" style={{ color: "#e0e0e0" }}>Brand</th>
                      <th className="py-3" style={{ color: "#e0e0e0" }}>Supplier SN barcode</th>
                      <th className="py-3" style={{ color: "#e0e0e0" }}>Supplier part number barcode</th>
                      <th className="py-3" style={{ color: "#e0e0e0" }}>quantity</th>
                      <th className="py-3" style={{ color: "#e0e0e0" }}>Date</th>
                      <th className="py-3" style={{ color: "#e0e0e0" }}>Action</th>
                    </tr>
                  </thead>

                  {serials.length === 0 ? (
                    <tbody>
                      <tr>
                        <td colSpan={10} className="text-center py-5" style={{ color: "#bdbdbd" }}>
                          <div className="d-flex flex-column align-items-center">
                            <UpcScan size={40} className="mb-2 text-muted" />
                            <span className="fw-medium">No Data</span>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  ) : (
                    <tbody>
                      {currentSerialPageData.map((serial, index) => {
                        const labelData = {
                          serial: serial.part_no,
                          part_num: serial.part_num,
                          part_name: serial.part_name,
                          packsize: serial.packsize,
                          supplier: serial.supplier,
                          brand: serial.brand,
                          sup_serial: serial.sup_serial,
                          sup_part_number: serial.sup_part_number
                        };
                        const formatDate = (dateString) => {
                          if (!dateString) return "-";
                          const date = new Date(dateString);
                          const day = String(date.getDate()).padStart(2, '0');
                          const month = String(date.getMonth() + 1).padStart(2, '0');
                          const year = date.getFullYear();
                          const hours = String(date.getHours()).padStart(2, '0');
                          const minutes = String(date.getMinutes()).padStart(2, '0');

                          return `${day}/${month}/${year} ${hours}:${minutes}`;
                        };

                        return (
                          <tr key={serial.part_no} className="text-center">
                            <td>{(currentSerialPage - 1) * itemsPerPage + index + 1}</td>
                            <td>
                              <Badge bg="dark" text="light" style={{
                                fontWeight: "medium",
                                backgroundColor: "#424242",
                                padding: "6px 8px",
                                borderRadius: "4px"
                              }}>
                                {serial.part_no}
                              </Badge>
                            </td>
                            <td className="fw-medium text-white">
                              <UpcScan className="me-1 text-success" size={14} />
                              {serial.part_num}
                            </td>
                            <td>{serial.part_name}</td>
                            <td>
                              <span className="d-inline-flex align-items-center">
                                <Building size={14} className="me-1 text-secondary" />
                                {serial.supplier}
                              </span>
                            </td>
                            <td>{serial.brand || "-"}</td>
                            <td>{serial.sup_serial || "-"}</td>
                            <td>{serial.sup_part_number || "-"}</td>
                            <td>
                              <Badge bg="secondary" style={{
                                fontWeight: "normal",
                                backgroundColor: "#555555",
                                padding: "5px 8px",
                                borderRadius: "4px"
                              }}>
                                <Box size={12} className="me-1" />
                                {serial.packsize}
                              </Badge>
                            </td>
                            <td>
                              <small style={{ whiteSpace: "nowrap" }}>
                                {formatDate(serial.date)}
                              </small>
                            </td>
                            <td>
                              <div className="d-flex justify-content-center gap-2">
                                {/* ปุ่มพิมพ์ */}
                                <BlobProvider document={<SerialLabelPDF data={labelData} />}>
                                  {({ blob, url, loading, error }) => (
                                    <Button
                                      variant="primary"
                                      size="sm"
                                      style={{
                                        borderRadius: "6px",
                                        backgroundColor: "#007bff",
                                        borderColor: "#007bff"
                                      }}
                                      disabled={loading || !!error}
                                      onClick={() => {
                                        if (url) {
                                          window.open(url, '_blank');
                                        }
                                      }}
                                    >
                                      {loading ? (
                                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                      ) : (
                                        <Printer size={16} />
                                      )}
                                    </Button>
                                  )}
                                </BlobProvider>

                                {/* เพิ่มปุ่มค้นหาใน LogStock */}
                                <Button
                                  variant="info"
                                  size="sm"
                                  style={{
                                    borderRadius: "6px",
                                    backgroundColor: "#17a2b8",
                                    borderColor: "#17a2b8"
                                  }}
                                  onClick={() => handleSearchInStock(serial.part_num)}
                                >
                                  <Search size={16} />
                                </Button>

                                {userInfo && userInfo.level === "admin" && (
                                  <Button
                                    variant="danger"
                                    size="sm"
                                    style={{
                                      borderRadius: "6px",
                                      backgroundColor: "#e53935",
                                      borderColor: "#e53935"
                                    }}
                                    onClick={() => deleteSerial(serial.part_no)}
                                  >
                                    <Trash size={16} />
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  )}
                </Table>
              </div>
              <div className="mt-3 d-flex justify-content-center">
                <PaginationComponent
                  itemsPerPage={itemsPerPage}
                  totalItems={serials.length}
                  paginate={paginateSerials}
                  currentPage={currentSerialPage}
                  setCurrentPage={setCurrentSerialPage}
                />
              </div>
            </div>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}

export default ReceivePart;