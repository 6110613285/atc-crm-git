import React, { useState, useEffect, useRef } from "react";
import { FormControl, Button, Table, Card, Badge } from "react-bootstrap";
import PaginationComponent from "../components/PaginationComponent";
import TypeEdit from "../Stockpage/Addtype";
import { Search, XCircle, Trash, Plus, FileEarmarkText } from "react-bootstrap-icons";

function TypeList() {
  const searchRef = useRef(null);
  const [types, setTypes] = useState([]);
  const [currentTypePageData, setCurrentTypePageData] = useState([]);
  const [currentTypePage, setCurrentTypePage] = useState(1);
  const itemsPerPage = 15;
  
  // ฟังก์ชันดึงข้อมูลประเภท
  const getTypes = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER}/Store.php?action=getType`,
        {
          method: "GET",
        }
      );
      const data = await res.json();
      if (data === null) {
        setTypes([]);
      } else {
        setTypes(data);
      }
    } catch (err) {
      console.log(err);
      setTypes([]);
    }
  };
  
  // ฟังก์ชันค้นหาประเภท
  const searchTypes = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER}/Store.php?action=searchType&search=${
          searchRef.current.value || ""
        }`,
        {
          method: "GET",
        }
      );
      const data = await res.json();
      if (data === null) {
        setTypes([]);
      } else {
        setTypes(data);
      }
    } catch (err) {
      console.log(err);
      setTypes([]);
    }
  };

  const deleteType = async (typeId) => {
    if (window.confirm("คุณต้องการลบข้อมูลประเภทนี้หรือไม่?")) {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_SERVER}/Store.php?action=deleteType&type_id=${typeId}`,
          {
            method: "DELETE",
          }
        );
        const data = await res.json();
        if (data.status === "success") {
          alert("ลบข้อมูลสำเร็จ");
          getTypes(); // โหลดข้อมูลใหม่หลังลบ
        } else {
          alert("ไม่สามารถลบข้อมูลได้: " + data.message);
        }
      } catch (err) {
        console.log(err);
        alert("เกิดข้อผิดพลาดในการลบข้อมูล");
      }
    }
  };

  // ฟังก์ชันแบ่งหน้าสำหรับข้อมูลประเภท
  const paginateTypes = (pageNumber) => {
    const startIndex = (pageNumber - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setCurrentTypePageData(types.slice(startIndex, endIndex));
    setCurrentTypePage(pageNumber);
  };

  // ดึงข้อมูลเมื่อโหลดคอมโพเนนต์
  useEffect(() => {
    getTypes();
  }, []);

  // อัปเดตข้อมูลหน้าเมื่อข้อมูลประเภทเปลี่ยนแปลง
  useEffect(() => {
    paginateTypes(currentTypePage);
  }, [types]);

  // ฟังก์ชันจัดการการบันทึก
  const handleSave = () => {
    getTypes();
  };

  // ฟังก์ชันจัดการการกดปุ่ม Enter
  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      searchTypes();
      paginateTypes(1);
    }
  };

  return (
    <div className="min-vh-100" style={{ 
      fontFamily: "'Inter', 'Prompt', sans-serif",
      backgroundColor: "#1a1a1a",
      color: "#e0e0e0"
    }}>
      {/* ส่วนหัวข้อ */}
      <div className="w-100">
        <div className="px-4 py-3" style={{ 
          background: 'linear-gradient(90deg, #007e33, #e0e0e0)', 
          color: 'white',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <h4 className="m-0 d-flex align-items-center">
            <FileEarmarkText className="me-2" /> 
            Types Manage
          </h4>
        </div>
      </div>

      <div className="px-4 py-4">
        <Card className="border-0 shadow-sm" style={{ backgroundColor: "#2a2a2a" }}>
          <Card.Body className="p-4">
            <div className="d-flex flex-column">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="m-0 fw-bold" style={{ color: "#00c853" }}>Types</h5>
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
                      placeholder="Type search..."
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
                        await getTypes();
                      } else {
                        await searchTypes();
                      }
                      paginateTypes(1);
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
                      await getTypes();
                      paginateTypes(1);
                    }}
                  >
                    <XCircle size={18} className="me-1" /> Clear
                  </Button>
                  <TypeEdit onSave={handleSave}>
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
                  </TypeEdit>
                </div>
              </div>

              <div className="table-responsive">
                <Table hover className="align-middle border table-dark" style={{ borderRadius: "8px", overflow: "hidden" }}>
                  <thead style={{ backgroundColor: "#333333" }}>
                    <tr className="text-center">
                      <th className="py-3" style={{ color: "#e0e0e0" }}>No.</th>
                      <th className="py-3" style={{ color: "#e0e0e0" }}>Type Name</th>
                      <th className="py-3" style={{ color: "#e0e0e0" }}>Type Prefix</th>
                      <th className="py-3" style={{ color: "#e0e0e0" }}>Detail</th>
                      <th className="py-3" style={{ color: "#e0e0e0" }}>Action</th>
                    </tr>
                  </thead>

                  {types.length === 0 ? (
                    <tbody>
                      <tr>
                        <td colSpan={6} className="text-center py-5" style={{ color: "#bdbdbd" }}>
                          <div className="d-flex flex-column align-items-center">
                            <FileEarmarkText size={40} className="mb-2 text-muted" />
                            <span className="fw-medium">No Data</span>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  ) : (
                    <tbody>
                      {currentTypePageData.map((type, index) => (
                        <tr key={type.type_id} className="text-center text-white">
                          <td>{(currentTypePage - 1) * itemsPerPage + index + 1}</td>
                          <td className="fw-medium text-white">
                            <FileEarmarkText className="me-2 text-success" size={14} />
                            {type.type_name}
                          </td>
                          <td>
                            <Badge bg="primary" style={{ 
                              fontWeight: "500", 
                              backgroundColor: "#4361ee",
                              padding: "6px 10px",
                              borderRadius: "4px",
                              fontSize: "0.85rem"
                            }}>
                              {type.type_prefix}
                            </Badge>
                          </td>
                          <td>{type.type_detail || "-"}</td>
                          <td>
                            <Button
                              variant="danger"
                              size="sm"
                              style={{ 
                                borderRadius: "6px",
                                backgroundColor: "#e53935",
                                borderColor: "#e53935"
                              }}
                              onClick={() => deleteType(type.type_id)}
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
                  totalItems={types.length}
                  paginate={paginateTypes}
                  currentPage={currentTypePage}
                  setCurrentPage={setCurrentTypePage}
                />
              </div>
            </div>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
}

export default TypeList;