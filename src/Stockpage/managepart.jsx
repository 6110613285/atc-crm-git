import React, { useState, useEffect, useRef } from "react";
import { FormControl, Button, Table, Tabs, Tab, Card, Badge, Container, Alert, ListGroup, Modal } from "react-bootstrap";
import PaginationComponent from "../components/PaginationComponent";
import Addpart from "../Stockpage/addpart";
import Upimage from "../Stockpage/Upimage";
import Swal from "sweetalert2";
import PartImageModal from "../Stockpage/PartImageModal";

import EditModal from "../Stockpage/EditModal";
import { Pencil } from "react-bootstrap-icons";
import {
  Search,
  XCircle,
  Trash,
  Plus,
  Tools
} from "react-bootstrap-icons";


function ManageSerialPage() {
  const [selectedPartNum, setSelectedPartNum] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const showImageModal = (partNum) => {
    setSelectedPartNum(partNum);
    setShowModal(true);
  };

  const hideImageModal = () => {
    setShowModal(false)
  };

  const searchRef = useRef(null);
  const searchContainerRef = useRef(null);
  const [parts, setParts] = useState([]);

  // แยก state สำหรับ Modal แต่ละตัว
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedPartForUpload, setSelectedPartForUpload] = useState(null);

  // สถานะสำหรับการค้นหาแบบใหม่
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);

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

  // สร้าง suggestions
  const generateSuggestions = (input) => {
    if (!input || input.length < 1) {
      setSuggestions([]);
      return;
    }

    const searchInput = input.toLowerCase();
    const allSuggestions = [];
    const uniqueItems = new Set();

    parts.forEach(part => {
      // ตรวจสอบ part_name
      if (part.part_name?.toLowerCase().includes(searchInput) && !uniqueItems.has(part.part_name)) {
        allSuggestions.push({
          text: part.part_name,
          type: 'Part Name',
          icon: '📦'
        });
        uniqueItems.add(part.part_name);
      }

      // ตรวจสอบ part_num
      if (part.part_num?.toLowerCase().includes(searchInput) && !uniqueItems.has(part.part_num)) {
        allSuggestions.push({
          text: part.part_num,
          type: 'Part Number',
          icon: '🔢'
        });
        uniqueItems.add(part.part_num);
      }

      // ตรวจสอบ part_type
      if (part.part_type?.toLowerCase().includes(searchInput) && !uniqueItems.has(part.part_type)) {
        allSuggestions.push({
          text: part.part_type,
          type: 'Type Prefix',
          icon: '🏷️'
        });
        uniqueItems.add(part.part_type);
      }

      // ตรวจสอบ supplier
      if (part.supplier?.toLowerCase().includes(searchInput) && !uniqueItems.has(part.supplier)) {
        allSuggestions.push({
          text: part.supplier,
          type: 'Supplier',
          icon: '🏭'
        });
        uniqueItems.add(part.supplier);
      }

      // ตรวจสอบ brand
      if (part.brand?.toLowerCase().includes(searchInput) && !uniqueItems.has(part.brand)) {
        allSuggestions.push({
          text: part.brand,
          type: 'Brand',
          icon: '🏪'
        });
        uniqueItems.add(part.brand);
      }
    });

    // จำกัดจำนวน suggestions เป็น 8 รายการ
    setSuggestions(allSuggestions.slice(0, 8));
  };

  // จัดการการเปลี่ยนแปลงใน input
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (searchRef.current) {
      searchRef.current.value = value;
    }
    generateSuggestions(value);
    setShowSuggestions(true);
    setSelectedSuggestionIndex(-1);
  };

  // เลือก suggestion
  const selectSuggestion = (suggestion) => {
    setSearchTerm(suggestion.text);
    if (searchRef.current) {
      searchRef.current.value = suggestion.text;
    }
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);

    // ทำการค้นหาทันทีเมื่อเลือก suggestion
    const filteredData = parts.filter(part =>
      part.part_name?.toLowerCase().includes(suggestion.text.toLowerCase()) ||
      part.part_num?.toLowerCase().includes(suggestion.text.toLowerCase()) ||
      part.part_type?.toLowerCase().includes(suggestion.text.toLowerCase()) ||
      part.supplier?.toLowerCase().includes(suggestion.text.toLowerCase()) ||
      part.brand?.toLowerCase().includes(suggestion.text.toLowerCase()) ||
      part.part_detail?.toLowerCase().includes(suggestion.text.toLowerCase())
    );
    paginateParts(1, filteredData);
  };

  // จัดการ keyboard navigation
  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter') {
        handleSearch();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;

      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;

      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0 && selectedSuggestionIndex < suggestions.length) {
          selectSuggestion(suggestions[selectedSuggestionIndex]);
        } else {
          handleSearch();
        }
        break;

      case 'Escape':
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        break;

      default:
        break;
    }
  };

  // ค้นหา parts
  const handleSearch = () => {
    const searchTerm = searchRef.current?.value?.toLowerCase().trim() || "";
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);

    const filteredData = parts.filter(part =>
      part.part_name?.toLowerCase().includes(searchTerm) ||
      part.part_num?.toLowerCase().includes(searchTerm) ||
      part.part_type?.toLowerCase().includes(searchTerm) ||
      part.supplier?.toLowerCase().includes(searchTerm) ||
      part.brand?.toLowerCase().includes(searchTerm) ||
      part.part_detail?.toLowerCase().includes(searchTerm)
    );
    paginateParts(1, filteredData);
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

  // === ฟังก์ชันจัดการ Modal ===
  const handleOpenUploadModal = (part) => {
    setSelectedPartForUpload(part.part_num);  // ✅ ส่งแค่ part_num (string)
    setShowUploadModal(true);
  };


  const handleCloseUploadModal = () => {
    setShowUploadModal(false);
    setSelectedPartForUpload(null);
  };

  const handleUploadSuccess = () => {
    // รีเฟรชข้อมูลหลังจากอัปโหลดสำเร็จ
    getParts();
    handleCloseUploadModal();
  };

  // ===== ฟังก์ชันแบ่งหน้า =====
  // แบ่งหน้าสำหรับข้อมูล parts
  const paginateParts = (pageNumber, data = parts) => {
    const startIndex = (pageNumber - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setCurrentPartPageData(data.slice(startIndex, endIndex));
    setCurrentPartPage(pageNumber);
  };

  // ปิด suggestions เมื่อคลิกข้างนอก
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

  // ฟังก์ชันจัดการการกดปุ่ม Enter (เก่า - รักษาไว้เพื่อ backward compatibility)
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
                  <div className="position-relative" ref={searchContainerRef}>
                    <FormControl
                      className="ps-4"
                      style={{
                        borderRadius: "6px",
                        boxShadow: "none",
                        minWidth: "1000px",
                        backgroundColor: "#333333",
                        color: "#e0e0e0",
                        border: "1px solid #444444"
                      }}
                      type="text"
                      placeholder="ค้นหาชิ้นส่วน..."
                      ref={searchRef}
                      value={searchTerm}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      onFocus={() => {
                        if (suggestions.length > 0) setShowSuggestions(true);
                      }}
                    />
                    <Search className="position-absolute" style={{
                      left: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#999999"
                    }} />

                    {/* Clear button */}
                    {searchTerm && (
                      <Button
                        variant="link"
                        className="position-absolute p-0"
                        style={{
                          right: "8px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          color: "#999999",
                          border: "none",
                          background: "none"
                        }}
                        onClick={() => {
                          setSearchTerm("");
                          if (searchRef.current) {
                            searchRef.current.value = "";
                          }
                          setShowSuggestions(false);
                          paginateParts(1, parts);
                        }}
                      >
                        <XCircle size={16} />
                      </Button>
                    )}

                    {/* Suggestions Dropdown */}
                    {showSuggestions && suggestions.length > 0 && (
                      <ListGroup
                        className="position-absolute shadow-lg"
                        style={{
                          top: "100%",
                          left: "0",
                          right: "-10%",
                          minWidth: "350px",
                          width: "100%",
                          zIndex: 1000,
                          maxHeight: "300px",
                          overflowY: "auto",
                          backgroundColor: "#2a2a2a",
                          border: "1px solid #444444",
                          borderRadius: "6px",
                          marginTop: "2px"
                        }}
                      >
                        {suggestions.map((suggestion, index) => (
                          <ListGroup.Item
                            key={index}
                            action
                            onClick={() => selectSuggestion(suggestion)}
                            className={`d-flex align-items-center ${index === selectedSuggestionIndex ? 'active' : ''}`}
                            style={{
                              backgroundColor: index === selectedSuggestionIndex ? "#007bff" : "#2a2a2a",
                              color: index === selectedSuggestionIndex ? "#fff" : "#e0e0e0",
                              border: "none",
                              borderBottom: index < suggestions.length - 1 ? "1px solid #444444" : "none",
                              cursor: "pointer",
                              padding: "8px 12px"
                            }}
                          >
                            <span className="me-2">{suggestion.icon}</span>
                            <div className="flex-grow-1">
                              <div className="fw-medium">{suggestion.text}</div>
                              <small className="text-muted">{suggestion.type}</small>
                            </div>
                          </ListGroup.Item>
                        ))}
                      </ListGroup>
                    )}
                  </div>

                  <Button
                    variant="light"
                    style={{
                      borderRadius: "6px",
                      border: "1px solid #444444",
                      backgroundColor: "#333333",
                      color: "#e0e0e0"
                    }}
                    onClick={() => {
                      setSearchTerm("");
                      if (searchRef.current) {
                        searchRef.current.value = "";
                      }
                      setShowSuggestions(false);
                      paginateParts(1, parts);
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
                      <th className="py-3" style={{ color: "#e0e0e0" }}>Img</th>
                    </tr>
                  </thead>

                  {currentPartPageData.length === 0 ? (
                    <tbody>
                      <tr>
                        <td colSpan={10} className="text-center py-5" style={{ color: "#bdbdbd" }}>
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
                            <div className="d-flex justify-content-center gap-1">
                              <EditModal
                                entityType="part"
                                data={part}
                                onSave={handleSave}
                                customTitle="แก้ไขข้อมูลชิ้นส่วน"
                              >
                                <Button
                                  variant="warning"
                                  size="sm"
                                  style={{
                                    borderRadius: "6px",
                                    backgroundColor: "#fb8c00",
                                    borderColor: "#fb8c00"
                                  }}
                                >
                                  <Pencil size={16} />
                                </Button>
                              </EditModal>

                              <Button
                                variant="info"
                                size="sm"
                                style={{
                                  borderRadius: "6px",
                                  backgroundColor: "#0091ea",
                                  borderColor: "#0091ea"
                                }}
                                onClick={() => handleOpenUploadModal(part)}  // ✅ ปุ่มนี้
                              >
                                🖼️
                              </Button>

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
                              {/* {showUploadModal && (
                                <Upimage
                                  onClose={() => setShowUploadModal(false)}
                                  defaultPartNum={selectedPartForUpload}  // ✅ ส่งไป Upimage
                                />
                              )} */}

                            </div>
                          </td>

                          {/* //img */}
                          <td>
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => showImageModal(part.part_num)}
                              style={{
                                borderRadius: "6px",
                                backgroundColor: "#28a745",
                                borderColor: "#28a745"
                              }}
                              title="แสดงรูปภาพ"
                            >
                              <Plus size={16} />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  )}
                </Table>
                <PartImageModal
                  partNum={selectedPartNum}
                  show={showModal}
                  onClose={hideImageModal}
                />
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

      {/* Modal สำหรับอัปโหลดรูปภาพ - แก้ไขเพื่อไม่ให้ซ้อนกัน */}
      <Modal
        show={showUploadModal}
        onHide={handleCloseUploadModal}
        centered
        size="lg"
        backdrop="static"
        keyboard={true}
        style={{ zIndex: 1055 }}
      >
        <Modal.Header closeButton style={{ backgroundColor: "#2a2a2a", color: "#e0e0e0", border: "none" }}>
          <Modal.Title style={{ fontSize: "1.25rem", fontWeight: "600" }}>
            อัปโหลดรูปภาพ
            {selectedPartForUpload && (
              <span className="text-muted ms-2" style={{ fontSize: "0.9rem" }}>
                - {selectedPartForUpload.part_name} ({selectedPartForUpload.part_num})
              </span>
            )}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: "#2a2a2a", padding: "0" }}>
          <Upimage
            defaultPartNum={selectedPartForUpload}
            // selectedPart={selectedPartForUpload}
            onUploadSuccess={handleUploadSuccess}
            onClose={handleCloseUploadModal}
          />
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default ManageSerialPage;