import React, { useState, useEffect, useRef } from "react";
import { FormControl, Button, Table, Card, Container } from "react-bootstrap";
import PaginationComponent from "../components/PaginationComponent";
import ReturnItem from "../Stockpage/Returnaction"; 
import Swal from "sweetalert2";
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  BoxSeamFill,
  GeoAltFill,
  CalendarDate,
  ArrowReturnLeft,
  PersonFill
} from "react-bootstrap-icons";


function BorrowPage() {
  const userInfo = localStorage.getItem("fullname");
  const searchRef = useRef(null);
  const [searchParams] = useSearchParams();
  
  // สถานะสำหรับรายการที่ยืม
  const [borrowedItems, setBorrowedItems] = useState([]);
  const [currentPageData, setCurrentPageData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "ascending" });


  const itemsPerPage = 15;

  // ฟังก์ชันดึงข้อมูลรายการยืม
  const fetchBorrowedItems = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_SERVER}/Store.php?action=getBorrowedParts`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setBorrowedItems(data);
        // เซ็ตข้อมูลหน้าแรกทันทีหลังจากได้ข้อมูล
        paginate(1, data);
      }
    } catch (error) {
      console.error("Error fetching borrowed items:", error);
      setBorrowedItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSearch = (location) => {
    // เซ็ตค่าในช่องค้นหาเป็น Location ที่เลือก
    if (searchRef.current) {
      searchRef.current.value = location;
    }

    // กรองข้อมูลตาม Location
    const filteredData = borrowedItems.filter(item =>
      item.location?.toLowerCase() === location.toLowerCase()
    );

    // อัพเดทข้อมูลที่แสดงและกลับไปหน้าแรก
    paginate(1, filteredData);
  };

  const handleUserSearch = (user) => {
    // เซ็ตค่าในช่องค้นหาเป็นชื่อผู้ใช้ที่เลือก
    if (searchRef.current) {
      searchRef.current.value = user;
    }

    // กรองข้อมูลตามชื่อผู้ใช้
    const filteredData = borrowedItems.filter(item =>
      item.user?.toLowerCase() === user.toLowerCase()
    );

    // อัพเดทข้อมูลที่แสดงและกลับไปหน้าแรก
    paginate(1, filteredData);
  };

  const handleSort = (key) => {
  let direction = 'ascending';
  if (sortConfig.key === key && sortConfig.direction === 'ascending') {
    direction = 'descending';
  }
  setSortConfig({ key, direction });

  const sortedData = [...borrowedItems].sort((a, b) => {
    let aValue = a[key];
    let bValue = b[key];

    // กรณีวันที่
    if (key === 'datetime') {
      const aDate = new Date(aValue);
      const bDate = new Date(bValue);
      return direction === 'ascending' ? aDate - bDate : bDate - aDate;
    }

    const aNum = parseFloat(aValue);
    const bNum = parseFloat(bValue);
    const bothNumbers = !isNaN(aNum) && !isNaN(bNum);

    if (bothNumbers) {
      return direction === 'ascending' ? aNum - bNum : bNum - aNum;
    } else {
      const aStr = (aValue || '').toString().toLowerCase();
      const bStr = (bValue || '').toString().toLowerCase();
      if (aStr < bStr) return direction === 'ascending' ? -1 : 1;
      if (aStr > bStr) return direction === 'ascending' ? 1 : -1;
      return 0;
    }
  });

  setBorrowedItems(sortedData);
  paginate(1, sortedData);
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

  // ฟังก์ชัน pagination
  const paginate = (pageNumber, data = borrowedItems) => {
    const startIndex = (pageNumber - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setCurrentPageData(data.slice(startIndex, endIndex));
    setCurrentPage(pageNumber);
  };

  // ฟังก์ชันหลังจากคืนสินค้า
  const handleReturn = () => {
    fetchBorrowedItems(); // โหลดข้อมูลใหม่หลังจากคืนสินค้า
  };

  // ฟังก์ชันค้นหา
  const handleSearch = () => {
    const searchTerm = searchRef.current.value.toLowerCase().trim();

    const filteredData = borrowedItems.filter(item =>
      item.part_name?.toLowerCase().includes(searchTerm) ||
      item.part_num?.toLowerCase().includes(searchTerm) ||
      item.store_name?.toLowerCase().includes(searchTerm) ||
      item.location?.toLowerCase().includes(searchTerm) ||
      item.user?.toLowerCase().includes(searchTerm) ||
      item.serial_num?.toLowerCase().includes(searchTerm) ||
      item.supplier?.toLowerCase().includes(searchTerm) ||
      item.sup_serial?.toLowerCase().includes(searchTerm) ||
      item.sup_barcode?.toLowerCase().includes(searchTerm) ||
      item.note?.toLowerCase().includes(searchTerm)
    );
    paginate(1, filteredData);
  };

  useEffect(() => {
    if (userInfo) {
      fetchBorrowedItems();
    }
  }, [userInfo]);

  // อัปเดตข้อมูลหน้าเมื่อข้อมูลรายการยืมเปลี่ยนแปลง
  useEffect(() => {
    paginate(currentPage);
  }, [borrowedItems]);

  useEffect(() => {
    const searchQuery = searchParams.get('search');
    if (searchQuery && searchRef.current) {
      // ถ้ามีพารามิเตอร์ search ให้เซ็ตค่าในช่องค้นหาและทำการค้นหา
      searchRef.current.value = searchQuery;

      // ทำการค้นหาหลังจากที่ข้อมูลโหลดเสร็จแล้ว
      if (borrowedItems.length > 0) {
        handleSearch();
      }
    }
  }, [searchParams, borrowedItems]);

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
                <h5 className="m-0 fw-bold" style={{ color: "#ff6b6b" }}>
                  <BoxSeamFill className="me-2" size={22} />
                  Borrowed Items
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
                      placeholder="Search borrowed items..."
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
                      backgroundColor: "#ff6b6b",
                      borderColor: "#ff6b6b",
                      borderRadius: "6px"
                    }}
                    onClick={handleSearch}
                  >
                    <Search size={18} className="me-1" /> Search
                  </Button>

                  <div className="d-flex gap-2">
                    {/* แก้ไขจาก handleSave เป็น handleReturn */}
                    <ReturnItem onSave={handleReturn} Username={userInfo}>
                      <div className="d-flex align-items-center fw-bold">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-arrow-return-left me-2" viewBox="0 0 16 16">
                          <path fillRule="evenodd" d="M14.5 1.5a.5.5 0 0 1 .5.5v4.8a2.5 2.5 0 0 1-2.5 2.5H2.707l3.347 3.346a.5.5 0 0 1-.708.708l-4.2-4.2a.5.5 0 0 1 0-.708l4-4a.5.5 0 1 1 .708.708L2.707 8.3H12.5A1.5 1.5 0 0 0 14 6.8V2a.5.5 0 0 1 .5-.5z"/>
                        </svg>
                        Return
                      </div>
                    </ReturnItem>
                  </div>
                </div>
              </div>

              <div className="table-responsive">
                <Table hover className="align-middle border table-dark" style={{ borderRadius: "8px", overflow: "hidden" }}>
                  <thead style={{ backgroundColor: "#333333" }}>
  <tr className="text-center">
    {[
      { label: "User", key: "user" },
      { label: "Serial Number", key: "serial_num" },
      { label: "Location", key: "location" },
      { label: "Part Name", key: "part_name" },
      { label: "Part Number", key: "part_num" },
      { label: "Qty", key: "borrowed_qty" },
      { label: "Store Name", key: "store_name" },
      { label: "Supplier", key: "supplier" },
      { label: "Supplier Serial", key: "sup_serial" },
      { label: "Supplier Barcode", key: "sup_barcode" },
      { label: "Borrow Date", key: "datetime" },
      { label: "Note", key: "note" },
    ].map((col) => (
      <th key={col.key} className="py-3" style={{ color: "#e0e0e0" }}>
        <div className="d-flex justify-content-center align-items-center gap-1">
          {col.label}
          <span
            onClick={() => handleSort(col.key)}
            style={{
              cursor: "pointer",
              userSelect: "none",
              fontSize: "0.9em",
              color: sortConfig.key === col.key ? "#00e676" : "#aaa",
            }}
          >
            {sortConfig.key === col.key
              ? sortConfig.direction === "ascending"
                ? "▲"
                : "▼"
              : "△"}
          </span>
        </div>
      </th>
    ))}
  </tr>
</thead>



                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={12} className="text-center py-5" style={{ color: "#bdbdbd" }}>
                          <div className="d-flex flex-column align-items-center">
                            <div className="spinner-border text-light mb-2" role="status">
                              <span className="visually-hidden">Loading...</span>
                            </div>
                            <span className="fw-medium">Loading...</span>
                          </div>
                        </td>
                      </tr>
                    ) : currentPageData.length === 0 ? (
                      <tr>
                        <td colSpan={12} className="text-center py-5" style={{ color: "#bdbdbd" }}>
                          <div className="d-flex flex-column align-items-center">
                            <BoxSeamFill size={40} className="mb-2 text-muted" />
                            <span className="fw-medium">No Borrowed Items</span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      currentPageData.map((item, index) => (
                        <tr key={index} className="text-center text-white">
                          <td>
                            <Button
                              variant="link"
                              className="p-0 text-white text-decoration-none d-flex align-items-center justify-content-center"
                              onClick={() => handleUserSearch(item.user)}
                            >
                              <PersonFill size={14} className="me-1 text-info" />
                              {item.user}
                            </Button>
                          </td>
                          <td>{item.serial_num || '-'}</td>
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
                            <div className="d-flex align-items-center justify-content-center">
                              <BoxSeamFill className="me-2 text-danger" size={14} />
                              {item.part_name}
                            </div>
                          </td>
                          <td>{item.part_num}</td>
                          <td className="fw-bold text-danger">{item.borrowed_qty || item.qty}</td>
                          <td>{item.store_name}</td>
                          <td>{item.supplier || '-'}</td>
                          <td>{item.sup_serial || '-'}</td>
                          <td>{item.sup_barcode || '-'}</td>
                          <td>
                            <small className="text-muted d-flex align-items-center justify-content-center">
                              <CalendarDate size={12} className="me-1" />
                              {formatDate(item.datetime)}
                            </small>
                          </td>
                          <td>{item.note || '-'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>

              <div className="mt-3 d-flex justify-content-center">
                <PaginationComponent
                  itemsPerPage={itemsPerPage}
                  totalItems={borrowedItems.length}
                  paginate={paginate}
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

export default BorrowPage;