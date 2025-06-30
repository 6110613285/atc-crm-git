import React, { useState, useEffect, useRef } from "react";
import { FormControl, Button, Table, Tabs, Tab, Card, Badge, Container, Alert, ListGroup } from "react-bootstrap";
import PaginationComponent from "../components/PaginationComponent";
import AddBucket from "../Stockpage/addbucket";
import Swal from "sweetalert2";
import { Basket } from "react-bootstrap-icons";


import EditModal from "../Stockpage/EditModal";
import { Bucket, Pencil } from "react-bootstrap-icons"; //เรียกใช้ react-bootstrap-icons
import {
  Search,
  XCircle,
  Trash,
  Plus,
  Tools
} from "react-bootstrap-icons";

// ============= SEARCH HOOK =============
const useSearch = (stockParts = []) => {
  // ============= STATE VARIABLES สำหรับ Search =============
  const searchRef = useRef(null);
  const searchContainerRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [filteredData, setFilteredData] = useState([]); // ข้อมูลที่กรองแล้ว

  // ============= SEARCH FUNCTIONS =============

  // ฟังก์ชันสร้าง suggestions
  const generateSuggestions = (input) => {
    if (!input || input.length < 1) {
      setSuggestions([]);
      return;
    }

    const searchInput = input.toLowerCase();
    const allSuggestions = [];

    // เก็บคำที่ไม่ซ้ำ
    const uniqueItems = new Set();

    stockParts.forEach(item => {
      // ตรวจสอบ PO
      if (item.PO?.toLowerCase().includes(searchInput) && !uniqueItems.has(item.PO)) {
        allSuggestions.push({
          text: item.PO,
          type: 'PO Number',
          icon: '📄'
        });
        uniqueItems.add(item.PO);
      }

      // ตรวจสอบ CUSTOMER
      if (item.CUSTOMER?.toLowerCase().includes(searchInput) && !uniqueItems.has(item.CUSTOMER)) {
        allSuggestions.push({
          text: item.CUSTOMER,
          type: 'Customer',
          icon: '👤'
        });
        uniqueItems.add(item.CUSTOMER);
      }

      // ตรวจสอบ BucketID
      if (item.BucketID?.toLowerCase().includes(searchInput) && !uniqueItems.has(item.BucketID)) {
        allSuggestions.push({
          text: item.BucketID,
          type: 'Bucket ID',
          icon: '🪣'
        });
        uniqueItems.add(item.BucketID);
      }

      // ตรวจสอบ USERNAME
      if (item.USERNAME?.toLowerCase().includes(searchInput) && !uniqueItems.has(item.USERNAME)) {
        allSuggestions.push({
          text: item.USERNAME,
          type: 'Username',
          icon: '👨‍💼'
        });
        uniqueItems.add(item.USERNAME);
      }

      // ตรวจสอบ Partname
      if (item.Partname?.toLowerCase().includes(searchInput) && !uniqueItems.has(item.Partname)) {
        allSuggestions.push({
          text: item.Partname,
          type: 'Part Name',
          icon: '🔧'
        });
        uniqueItems.add(item.Partname);
      }

      // ตรวจสอบ status
      if (item.status?.toLowerCase().includes(searchInput) && !uniqueItems.has(item.status)) {
        allSuggestions.push({
          text: item.status,
          type: 'Status',
          icon: '📊'
        });
        uniqueItems.add(item.status);
      }
    });

    // จำกัดจำนวน suggestions เป็น 8 รายการ
    setSuggestions(allSuggestions.slice(0, 8));
  };

  // ฟังก์ชันจัดการการเปลี่ยนแปลงใน input
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

  // ฟังก์ชันเลือก suggestion
  const selectSuggestion = (suggestion, onSearchCallback) => {
    setSearchTerm(suggestion.text);
    if (searchRef.current) {
      searchRef.current.value = suggestion.text;
    }
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);

    // ทำการค้นหาทันทีเมื่อเลือก suggestion
    const filtered = stockParts.filter(item =>
      item.PO?.toLowerCase().includes(suggestion.text.toLowerCase()) ||
      item.CUSTOMER?.toLowerCase().includes(suggestion.text.toLowerCase()) ||
      item.BucketID?.toLowerCase().includes(suggestion.text.toLowerCase()) ||
      item.USERNAME?.toLowerCase().includes(suggestion.text.toLowerCase()) ||
      item.Partname?.toLowerCase().includes(suggestion.text.toLowerCase()) ||
      item.status?.toLowerCase().includes(suggestion.text.toLowerCase())
    );
    setFilteredData(filtered);

    // เรียก callback function ถ้ามี (เช่น paginate)
    if (onSearchCallback) {
      onSearchCallback(1, filtered);
    }
  };

  // ฟังก์ชันจัดการการกดปุ่ม keyboard
  const handleKeyDown = (e, onSearchCallback) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter') {
        handleSearch(onSearchCallback);
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
          selectSuggestion(suggestions[selectedSuggestionIndex], onSearchCallback);
        } else {
          handleSearch(onSearchCallback);
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

  // ฟังก์ชันค้นหาหลัก
  const handleSearch = (onSearchCallback) => {
    const searchTermValue = searchRef.current?.value?.toLowerCase().trim() || "";
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);

    if (searchTermValue === '') {
      setFilteredData(stockParts);
      if (onSearchCallback) {
        onSearchCallback(1, stockParts);
      }
      return;
    }

    const filtered = stockParts.filter(item =>
      item.PO?.toLowerCase().includes(searchTermValue) ||
      item.CUSTOMER?.toLowerCase().includes(searchTermValue) ||
      item.BucketID?.toLowerCase().includes(searchTermValue) ||
      item.USERNAME?.toLowerCase().includes(searchTermValue) ||
      item.Partname?.toLowerCase().includes(searchTermValue) ||
      item.status?.toLowerCase().includes(searchTermValue)
    );
    setFilteredData(filtered);
    if (onSearchCallback) {
      onSearchCallback(1, filtered);
    }
  };

  // ฟังก์ชันล้างการค้นหา
  const clearSearch = (onSearchCallback) => {
    setSearchTerm("");
    if (searchRef.current) {
      searchRef.current.value = "";
    }
    setShowSuggestions(false);
    setFilteredData(stockParts); // รีเซ็ตเป็นข้อมูลทั้งหมด
    if (onSearchCallback) {
      onSearchCallback(1, stockParts);
    }
  };

  // ============= useEffect สำหรับ Search =============

  // useEffect สำหรับปิด suggestions เมื่อคลิกข้างนอก
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

  // useEffect สำหรับอัปเดต filteredData เมื่อ stockParts เปลี่ยนแปลง
  useEffect(() => {
    if (stockParts.length > 0 && filteredData.length === 0) {
      setFilteredData(stockParts);
    }
  }, [stockParts]);

  return {
    // State
    searchTerm,
    suggestions,
    showSuggestions,
    selectedSuggestionIndex,
    filteredData,

    // Refs
    searchRef,
    searchContainerRef,

    // Functions
    handleInputChange,
    selectSuggestion,
    handleKeyDown,
    handleSearch,
    clearSearch,

    // Setters (for manual control if needed)
    setSearchTerm,
    setFilteredData,
    setShowSuggestions
  };
};

// ============= SEARCH UI COMPONENT =============
const SearchComponent = ({
  searchRef,
  searchContainerRef,
  searchTerm,
  suggestions,
  showSuggestions,
  selectedSuggestionIndex,
  handleInputChange,
  handleKeyDown,
  selectSuggestion,
  clearSearch,
  placeholder = "ค้นหา PO, Customer, Bucket ID, Username...",
  onSearchCallback
}) => (
  <div className="position-relative flex-grow-1" ref={searchContainerRef} style={{ minWidth: "300px", maxWidth: "800px" }}>
    <FormControl
      className="ps-4"
      style={{
        borderRadius: "6px",
        boxShadow: "none",
        width: "100%",
        backgroundColor: "#333333",
        color: "#e0e0e0",
        border: "1px solid #444444"
      }}
      type="text"
      placeholder={placeholder}
      ref={searchRef}
      value={searchTerm}
      onChange={handleInputChange}
      onKeyDown={(e) => handleKeyDown(e, onSearchCallback)}
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
        onClick={() => clearSearch(onSearchCallback)}
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
          left: "0px",
          right: "0px",
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
            onClick={() => selectSuggestion(suggestion, onSearchCallback)}
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
);


const filterBucketsBySearch = (buckets, searchTerm) => {
  const term = (searchTerm || '').toString().trim();

  if (!term) {
    return Object.keys(buckets); // แก้ไข: return bucket IDs แทน buckets
  }

  const searchLower = term.toLowerCase();
  const filteredBucketIds = [];

  Object.entries(buckets).forEach(([bucketId, bucketItems]) => {
    // ตรวจสอบ bucket ID
    if (bucketId.toLowerCase().includes(searchLower)) {
      filteredBucketIds.push(bucketId);
      return;
    }

    // ตรวจสอบข้อมูลภายใน bucket
    const hasMatch = bucketItems.some(item =>
      item.PO?.toLowerCase().includes(searchLower) ||
      item.CUSTOMER?.toLowerCase().includes(searchLower) ||
      item.USERNAME?.toLowerCase().includes(searchLower) ||
      item.Partname?.toLowerCase().includes(searchLower) ||
      item.status?.toLowerCase().includes(searchLower)
    );

    if (hasMatch) {
      filteredBucketIds.push(bucketId);
    }
  });

  return filteredBucketIds;
};

// ✅ แก้ไข function declaration (ลบช่องว่างเกิน)
function ManageBucketPage() {
  const [parts, setParts] = useState([]);
  const [currentPartPageData, setCurrentPartPageData] = useState([]);
  const [currentPartPage, setCurrentPartPage] = useState(1);
  const itemsPerPage = 15;

  // ใช้ search hook
  const {
    searchTerm,
    suggestions,
    showSuggestions,
    selectedSuggestionIndex,
    filteredData,
    searchRef,
    searchContainerRef,
    handleInputChange,
    selectSuggestion,
    handleKeyDown,
    handleSearch,
    clearSearch,
    setFilteredData
  } = useSearch(parts);// ✅ ถูก - ส่งข้อมูล parts ทั้งหมด

  // ===== ฟังก์ชันจัดการ Parts =====
  // ดึงข้อมูล part แยกตะกร้า
  const [groupedBuckets, setGroupedBuckets] = useState({});
  // ฟังก์ชัน getBucket
  const getBucket = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER}/Store.php?action=getBucket`,
        { method: "GET" }
      );
      const data = await res.json();
      if (data === null) {
        setParts([]);
        setGroupedBuckets({});
      } else {
        setParts(data);
        // จัดกลุ่มข้อมูลตาม BucketID
        const grouped = data.reduce((acc, item) => {
          if (!acc[item.BucketID]) {
            acc[item.BucketID] = [];
          }
          acc[item.BucketID].push(item);
          return acc;
        }, {});
        setGroupedBuckets(grouped);
      }
    } catch (err) {
      console.log(err);
      setParts([]);
      setGroupedBuckets({});
    }
  };

  const handleSave = async (bucketData) => {
    try {
      // บันทึกข้อมูลไปยัง state หรือ API
      setBuckets(prevBuckets => [...prevBuckets, {
        ...bucketData,
        id: generateNextBucketID(),
        createdAt: new Date().toISOString()
      }]);

      // แสดงข้อความสำเร็จ
      console.log('บันทึก bucket สำเร็จ');

      // ปิด modal หรือ reset form (ถ้ามี)
      // setShowAddBucket(false);

    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการบันทึก:', error);
    }
  };

  // ลบ part
  const deletePart = async (uid) => {
  if (window.confirm("คุณต้องการลบข้อมูลชิ้นส่วนนี้หรือไม่?")) {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER}/Store.php?action=deleteBucket&uid=${uid}`,
        { method: "DELETE" }
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
        
        // ✅ แก้ไข: อัปเดตทั้ง parts และ groupedBuckets
        setParts(prevParts => {
          const updatedParts = prevParts.filter(part => part.UID !== uid);
          
          // อัปเดต groupedBuckets พร้อมกับ parts
          const newGrouped = updatedParts.reduce((acc, item) => {
            if (!acc[item.BucketID]) {
              acc[item.BucketID] = [];
            }
            acc[item.BucketID].push(item);
            return acc;
          }, {});
          
          setGroupedBuckets(newGrouped);
          
          // อัปเดต filteredData ด้วยถ้ามีการค้นหา
          setFilteredData(updatedParts);
          
          return updatedParts;
        });
        
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
  // เพิ่มฟังก์ชันสร้าง BucketID ถัดไป
  const generateNextBucketID = () => {
    const bucketIds = Object.keys(groupedBuckets);
    if (bucketIds.length === 0) {
      return "01"; // ถ้าไม่มีข้อมูลเลย เริ่มจาก 01
    }

    // หา ID สูงสุดจาก bucketIds ที่มีอยู่
    const maxId = Math.max(...bucketIds.map(id => {
      const numId = parseInt(id);
      return isNaN(numId) ? 0 : numId;
    }));

    // เพิ่ม 1 และใส่ 0 ข้างหน้าถ้าต้องการ
    return String(maxId + 1).padStart(2, '0');
  };

  // ===== ฟังก์ชันแบ่งหน้า =====
  // แบ่งหน้าสำหรับข้อมูล parts (ใช้กับ filteredData แทน parts)
  const paginateBuckets = (pageNumber, dataToUse = null) => {
    // ใช้ filteredData หรือ groupedBuckets
    const sourceData = dataToUse || groupedBuckets;
    const bucketIds = Object.keys(sourceData);

    const startIndex = (pageNumber - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentBucketIds = bucketIds.slice(startIndex, endIndex);

    // สร้างข้อมูลสำหรับหน้าปัจจุบัน
    const currentBucketsData = {};
    currentBucketIds.forEach(bucketId => {
      currentBucketsData[bucketId] = sourceData[bucketId];
    });

    setCurrentPartPageData(currentBucketsData);
    setCurrentPartPage(pageNumber);
  };

  // เพิ่มฟังก์ชันนี้หลังจาก paginateBuckets
  const handleSearchWithFilter = (pageNumber, filteredData) => {
    if (filteredData && filteredData.length > 0) {
      // สร้าง groupedBuckets จาก filteredData
      const filteredGrouped = filteredData.reduce((acc, item) => {
        if (!acc[item.BucketID]) {
          acc[item.BucketID] = [];
        }
        acc[item.BucketID].push(item);
        return acc;
      }, {});

      paginateBuckets(pageNumber, filteredGrouped);
    } else {
      paginateBuckets(pageNumber, groupedBuckets);
    }
  };

  // ดึงข้อมูลเมื่อโหลดคอมโพเนนต์
  useEffect(() => {
    getBucket();
  }, []);

  // อัปเดตข้อมูลหน้าเมื่อข้อมูล groupedBuckets เปลี่ยนแปลง
  useEffect(() => {
    if (Object.keys(groupedBuckets).length > 0) {
      paginateBuckets(1); // เริ่มจากหน้า 1
    }
  }, [groupedBuckets]);

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
                <div className="d-flex gap-2 flex-wrap align-items-center">
                  {/* ใช้ SearchComponent แทนช่องค้นหาเดิม */}
                  <SearchComponent
                    searchRef={searchRef}
                    searchContainerRef={searchContainerRef}
                    searchTerm={searchTerm}
                    suggestions={suggestions}
                    showSuggestions={showSuggestions}
                    selectedSuggestionIndex={selectedSuggestionIndex}
                    handleInputChange={handleInputChange}
                    handleKeyDown={handleKeyDown}
                    selectSuggestion={selectSuggestion}
                    clearSearch={clearSearch}
                    placeholder="ค้นหา PO, Customer, Bucket ID, Username..."
                    onSearchCallback={handleSearchWithFilter}
                  />

                  <Button
                    variant="primary"
                    style={{
                      backgroundColor: "#00c853",
                      borderColor: "#00c853",
                      borderRadius: "6px",
                      whiteSpace: "nowrap"
                    }}
                    onClick={() => handleSearch(handleSearchWithFilter)}
                  >
                    <Search size={18} className="me-1" /> Search
                  </Button>

                  <AddBucket
                    onSave={handleSave}
                    nextBucketID={generateNextBucketID()}
                  >
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
                {Object.keys(currentPartPageData).length === 0 ? (
                  <div className="text-center py-5" style={{ color: "#bdbdbd" }}>
                    <div className="d-flex flex-column align-items-center">
                      <Tools size={40} className="mb-2 text-muted" />
                      <span className="fw-medium">No Data</span>
                    </div>
                  </div>
                ) : (
                  Object.entries(currentPartPageData).map(([bucketId, bucketItems]) => (
                    <div key={bucketId} className="mb-4">

                      {/* หัวข้อ BucketID */}
                      <div className="d-flex justify-content-between align-items-center mb-3 p-3"
                        style={{ backgroundColor: "#333333", borderRadius: "6px" }}>
                        <div className="d-flex align-items-center gap-3">
                          <h6 className="m-0 fw-bold" style={{ color: "#00c853" }}>
                            <Basket className="me-2" size={18} />
                            Bucket ID: {bucketId}
                          </h6>
                          <span className="fw-medium">PO: {bucketItems[0]?.PO || '-'}</span>
                          <span className="fw-medium">QO: {bucketItems[0]?.QO || '-'}</span>
                          <span className="fw-medium">CUSTOMER:
                            <Badge bg="success" className="ms-1" style={{
                              fontWeight: "normal",
                              backgroundColor: "#00c853",
                              padding: "5px 8px",
                              borderRadius: "4px",
                              fontSize: "0.85rem"
                            }}>
                              {bucketItems[0]?.CUSTOMER || '-'}
                            </Badge>
                          </span>
                        </div>
                        <Badge bg="info">{bucketItems.length} รายการ</Badge>
                      </div>

                      {/* ตารางสำหรับ BucketID นี้ */}
                      <Table hover className="align-middle border table-dark mb-0"
                        style={{ borderRadius: "8px", overflow: "hidden" }}>
                        <thead style={{ backgroundColor: "#333333" }}>
                          <tr className="text-center">
                            <th className="py-3" style={{ color: "#e0e0e0" }}>No.</th>
                            {/* <th className="py-3" style={{ color: "#e0e0e0" }}>USERID</th> */}
                            <th className="py-3" style={{ color: "#e0e0e0" }}>USERNAME</th>
                            <th className="py-3" style={{ color: "#e0e0e0" }}>Partname</th>
                            <th className="py-3" style={{ color: "#e0e0e0" }}>QTY</th>
                            <th className="py-3" style={{ color: "#e0e0e0" }}>Status</th>
                            <th className="py-3" style={{ color: "#e0e0e0" }}>Datetime</th>
                            <th className="py-3" style={{ color: "#e0e0e0" }}>Note</th>
                            <th className="py-3" style={{ color: "#e0e0e0" }}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bucketItems.map((part, index) => (
                            <tr key={part.UID} className="text-center">
                              <td>{index + 1}</td>


                              {/* <td>{part.USERID || "-"}</td> */}
                              <td>{part.USERNAME}</td>
                              <td>{part.Partname || "-"}</td>
                              <td>{part.QTY || "-"}</td>
                              <td>
                                <Badge
                                  bg={part.status === 'approve' ? 'success' : part.status === 'cancel' ? 'danger' : 'warning'}
                                  style={{
                                    fontWeight: "normal",
                                    padding: "5px 8px",
                                    borderRadius: "4px",
                                    fontSize: "0.85rem"
                                  }}
                                >
                                  {part.status || "-"}
                                </Badge>
                              </td>
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
                                  onClick={() => deletePart(part.UID)}>
                                    
                                  <Trash size={16} />
                                </Button>
                
                              
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  ))
                )}
              </div>
              <div className="mt-3 d-flex justify-content-center">
                <PaginationComponent
                  itemsPerPage={itemsPerPage}
                  totalItems={filteredData.length > 0 ?
                    Object.keys(filteredData.reduce((acc, item) => {
                      acc[item.BucketID] = true;
                      return acc;
                    }, {})).length :
                    Object.keys(groupedBuckets).length
                  }
                  paginate={handleSearchWithFilter}
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