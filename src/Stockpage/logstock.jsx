import React, { useContext, useState, useEffect, useRef } from "react";
import { FormControl, Button, Table, Card, Container } from "react-bootstrap";
import { UserContext } from "../App";
import PaginationComponent from "../components/PaginationComponent";
import ItemDetailModal from "./ItemDetailModal";
import Swal from "sweetalert2";
import LoadIn from "../Stockpage/loadin";
import LoadOut from "../Stockpage/loadout";
import Borrowaction from "../Stockpage/Borrowaction";
import ReturnItem from "../Stockpage/Returnaction";
import { useSearchParams } from 'react-router-dom';
import { Cart } from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";
import {
  Search,
  XCircle,
  GeoAltFill,
  BoxSeamFill,
  CalendarDate
} from "react-bootstrap-icons";

function LogStock() {
  const userInfo = localStorage.getItem("fullname");
  const searchRef = useRef(null);
  const [searchParams] = useSearchParams();
  // สถานะสำหรับ stock items
  const [stockParts, setStockParts] = useState([]);
  const [currentPageData, setCurrentPageData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  // สถานะสำหรับ modal รายละเอียดสินค้า
  const [showItemDetail, setShowItemDetail] = useState(false);
  const [selectedItemDetail, setSelectedItemDetail] = useState({ partNum: "", locationName: "" });

  const itemsPerPage = 15;

  // ฟังก์ชันดึงข้อมูล stock parts
  const fetchStockParts = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SERVER}/Store.php?action=getStockParts`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setStockParts(data);
        // เซ็ตข้อมูลหน้าแรกทันทีหลังจากได้ข้อมูล
        paginate(1, data);
      }
    } catch (error) {
      console.error("Error fetching stock parts:", error);
      setStockParts([]);
    }
  };

  const handleLocationSearch = (location) => {
    // เซ็ตค่าในช่องค้นหาเป็น Location ที่เลือก
    if (searchRef.current) {
      searchRef.current.value = location;
    }

    // กรองข้อมูลตาม Location
    const filteredData = stockParts.filter(item =>
      item.location?.toLowerCase() === location.toLowerCase()
    );

    // อัพเดทข้อมูลที่แสดงและกลับไปหน้าแรก
    paginate(1, filteredData);
  };

  // ฟังก์ชันแสดงรายละเอียดสินค้า
  const handlePartNameClick = (partNum, locationName) => {
    setSelectedItemDetail({ partNum, locationName });
    setShowItemDetail(true);
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

  // ฟังก์ชัน pagination สำหรับ stock parts
  const paginate = (pageNumber, data = stockParts) => {
    const startIndex = (pageNumber - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setCurrentPageData(data.slice(startIndex, endIndex));
    setCurrentPage(pageNumber);
  };

  // ฟังก์ชันหลังจากบันทึกข้อมูล
  const handleSave = () => {
    fetchStockParts(); // โหลดข้อมูลใหม่หลังจากอัพเดท
  };

  // ฟังก์ชันค้นหา
  const handleSearch = () => {
    const searchTerm = searchRef.current.value.toLowerCase().trim();

    const filteredData = stockParts.filter(item =>
      item.part_name?.toLowerCase().includes(searchTerm) ||
      item.part_num?.toLowerCase().includes(searchTerm) ||
      item.store_name?.toLowerCase().includes(searchTerm) ||
      item.location?.toLowerCase().includes(searchTerm)
    );
    paginate(1, filteredData);
  };

  useEffect(() => {
    if (userInfo) {
      fetchStockParts();
    }
  }, [userInfo]);

  // อัปเดตข้อมูลหน้าเมื่อข้อมูล parts เปลี่ยนแปลง
  useEffect(() => {
    paginate(currentPage);
  }, [stockParts]);

  useEffect(() => {
    const searchQuery = searchParams.get('search');
    if (searchQuery && searchRef.current) {
      // ถ้ามีพารามิเตอร์ search ให้เซ็ตค่าในช่องค้นหาและทำการค้นหา
      searchRef.current.value = searchQuery;

      // ทำการค้นหาหลังจากที่ข้อมูลโหลดเสร็จแล้ว
      if (stockParts.length > 0) {
        handleSearch();
      }
    }
  }, [searchParams, stockParts]);


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
        <Button
          variant="success"
          style={{
            position: "fixed",
            bottom: "50px",
            right: "50px",
            zIndex: 9999,
            borderRadius: "50%",
            width: "60px",
            height: "60px",
            boxShadow: "0 4px 12px rgba(0, 200, 83, 0.5)",
            backgroundColor: "#377eec",
            borderColor: "#00c853",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
          onClick={() => navigate("/bucket")}
        >
          {/* icon ตะกร้า importของตัวicon อยู่ด้านบน */}
          <Cart size={24} />
        </Button>

        <Card className="border-0 shadow-sm" style={{ backgroundColor: "#2a2a2a", color: "#e0e0e0" }}>
          <Card.Body className="p-4">
            <div className="d-flex flex-column">
              <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
                <h5 className="m-0 fw-bold" style={{ color: "#00c853" }}>
                  <BoxSeamFill className="me-2" size={22} />
                  Stock Items
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
                      placeholder="Search items..."
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

                  <div className="d-flex gap-2">
                    <LoadIn onSave={handleSave} Username={userInfo?.username}>
                      <div className="d-flex align-items-center fw-bold">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-box-arrow-in-down me-2" viewBox="0 0 16 16">
                          <path fillRule="evenodd" d="M3.5 6a.5.5 0 0 0-.5.5v8a.5.5 0 0 0 .5.5h9a.5.5 0 0 0 .5-.5v-8a.5.5 0 0 0-.5-.5h-2a.5.5 0 0 1 0-1h2A1.5 1.5 0 0 1 14 6.5v8a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 14.5v-8A1.5 1.5 0 0 1 3.5 5h2a.5.5 0 0 1 0 1h-2z" />
                          <path fillRule="evenodd" d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z" />
                        </svg>
                        IN
                      </div>
                    </LoadIn>

                    <LoadOut onSave={handleSave} Username={userInfo?.username}>
                      <div className="d-flex align-items-center fw-bold">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-box-arrow-up me-2" viewBox="0 0 16 16">
                          <path fillRule="evenodd" d="M3.5 6a.5.5 0 0 0-.5.5v8a.5.5 0 0 0 .5.5h9a.5.5 0 0 0 .5-.5v-8a.5.5 0 0 0-.5-.5h-2a.5.5 0 0 1 0-1h2A1.5 1.5 0 0 1 14 6.5v8a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 14.5v-8A1.5 1.5 0 0 1 3.5 5h2a.5.5 0 0 1 0 1h-2z" />
                          <path fillRule="evenodd" d="M7.646 4.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 5.707V14.5a.5.5 0 0 1-1 0V5.707L5.354 7.854a.5.5 0 1 1-.708-.708l3-3z" />
                        </svg>
                        OUT
                      </div>
                    </LoadOut>

                    <Borrowaction onSave={handleSave} Username={userInfo?.username}>
                      <div className="d-flex align-items-center fw-bold">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-hand-index-thumb me-2" viewBox="0 0 16 16">
                          <path d="M6.75 1a.75.75 0 0 1 .75.75V8a.5.5 0 0 0 1 0V5.467l.086-.004c.317-.012.637-.008.816.027.134.027.294.096.448.182.077.042.15.147.15.314V8a.5.5 0 0 0 1 0V6.435l.106-.01c.316-.024.584-.01.708.04.118.046.3.207.486.43.081.096.15.19.2.259V8.5a.5.5 0 1 0 1 0v-1h.342a1 1 0 0 1 .995 1.1l-.271 2.715a2.5 2.5 0 0 1-.317.991l-1.395 2.442a.5.5 0 0 1-.434.252H6.118a.5.5 0 0 1-.447-.276l-1.232-2.465-2.512-4.185a.517.517 0 0 1 .809-.631l2.41 2.41A.5.5 0 0 0 6 9.5V1.75A.75.75 0 0 1 6.75 1z" />
                        </svg>
                        Borrow
                      </div>
                    </Borrowaction>

                    {/* <ReturnItem onSave={handleSave} Username={userInfo?.username}>
                      <div className="d-flex align-items-center fw-bold">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-arrow-return-left me-2" viewBox="0 0 16 16">
                          <path fillRule="evenodd" d="M14.5 1.5a.5.5 0 0 1 .5.5v4.8a2.5 2.5 0 0 1-2.5 2.5H2.707l3.347 3.346a.5.5 0 0 1-.708.708l-4.2-4.2a.5.5 0 0 1 0-.708l4-4a.5.5 0 1 1 .708.708L2.707 8.3H12.5A1.5 1.5 0 0 0 14 6.8V2a.5.5 0 0 1 .5-.5z"/>
                        </svg>
                        Return
                      </div>
                    </ReturnItem> */}
                  </div>
                </div>
              </div>

              <div className="table-responsive">
                <Table hover className="align-middle border table-dark" style={{ borderRadius: "8px", overflow: "hidden" }}>
                  <thead style={{ backgroundColor: "#333333" }}>
                    <tr className="text-center">
                      {/* <th className="py-3" style={{ color: "#e0e0e0" }}>No.</th> */}
                      <th className="py-3" style={{ color: "#e0e0e0" }}>Location</th>
                      <th className="py-3" style={{ color: "#e0e0e0" }}>Part Name</th>
                      <th className="py-3" style={{ color: "#e0e0e0" }}>Part Number</th>
                      <th className="py-3" style={{ color: "#e0e0e0" }}>Stock Qty</th>
                      <th className="py-3" style={{ color: "#e0e0e0" }}>Store Name</th>
                      <th className="py-3" style={{ color: "#e0e0e0" }}>Supplier</th>
                      <th className="py-3" style={{ color: "#e0e0e0" }}>Date Update</th>
                    </tr>
                  </thead>

                  <tbody>
                    {currentPageData.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-5" style={{ color: "#bdbdbd" }}>
                          <div className="d-flex flex-column align-items-center">
                            <BoxSeamFill size={40} className="mb-2 text-muted" />
                            <span className="fw-medium">No Data</span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      currentPageData.map((item, index) => (
                        <tr key={index} className="text-center text-white">
                          {/* <td>{(currentPage - 1) * itemsPerPage + index + 1}</td> */}
                          <td>
                            <Button
                              variant="link"
                              className="p-0 text-white text-decoration-none d-flex align-items-center justify-content-center"
                              onClick={() => handleLocationSearch(item.location)}
                            >
                              <GeoAltFill size={14} className="me-1 text-secondary" />
                              {item.location}
                            </Button>
                          </td>
                          <td className="fw-medium">
                            <Button
                              variant="link"
                              className="p-0 text-white text-decoration-none"
                              onClick={() => handlePartNameClick(item.part_num, item.location)}
                            >
                              <BoxSeamFill className="me-2 text-success" size={14} />
                              {item.part_name}
                            </Button>
                          </td>
                          <td>{item.part_num}</td>
                          <td>{item.stock_qty || item.qty}</td>
                          <td>{item.store_name}</td>
                          <td>{item.supplier || '-'}</td>
                          <td>
                            <small className="text-muted d-flex align-items-center justify-content-center">
                              <CalendarDate size={12} className="me-1" />
                              {formatDate(item.datetime)}
                            </small>

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
                  totalItems={stockParts.length}
                  paginate={paginate}
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                />
              </div>
            </div>
          </Card.Body>
        </Card>
      </Container>
      <ItemDetailModal
        show={showItemDetail}
        onHide={() => setShowItemDetail(false)}
        partNum={selectedItemDetail.partNum}
        locationName={selectedItemDetail.locationName}
      />
    </div>
  );
}

export default LogStock;