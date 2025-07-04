import React, { useState, useRef, useEffect } from "react";
import { Button, Modal, Form, Row, Col, ListGroup, Table, Badge, Pagination, FormControl, InputGroup } from "react-bootstrap";
import { BoxSeamFill, GeoAltFill, CalendarDate, UpcScan, Box } from "react-bootstrap-icons";
import Swal from "sweetalert2";
import {
  Search,
  XCircle,
  Plus,
  Tools,
  Trash3,
  CheckCircle
} from "react-bootstrap-icons";

function addBucket({ onSave, nextBucketID, children }) {




  //✅ แก้ไข: เพิ่ม missing state variables
  const [selectedType, setSelectedType] = useState(null);
  const [selectedTypeId, setSelectedTypeId] = useState(null);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [filteredTypes, setFilteredTypes] = useState([]);

  const Username = localStorage.getItem("fullname");
  const [validated, setValidated] = useState(false);
  const [show, setShow] = useState(false);
  const [types, setTypes] = useState([]);
  const [typeInput, setTypeInput] = useState("");

  // ฟังก์ชันของตารางเพิ่ม state สำหรับตาราง
  const [stockParts, setStockParts] = useState([]);
  const [originalStockParts, setOriginalStockParts] = useState([]);
  const [currentPageData, setCurrentPageData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // State สำหรับสินค้าที่เลือก
  const [selectedItems, setSelectedItems] = useState([]);

  const typeInputRef = useRef(null);

  // ============= STATE VARIABLES สำหรับ Search =============
  const searchRef = useRef(null);
  const searchContainerRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [filteredData, setFilteredData] = useState([]); // ข้อมูลที่กรองแล้ว

  //location
  const [selectedItemDetail, setSelectedItemDetail] = useState({ partNum: "", locationName: "" });
  // เรียกใช้ bucket
  const [bucketID, setBucketID] = useState(nextBucketID || "01");

  // ย้าย Refs มาไว้ด้านบน
  const uidRef = useRef(null);
  const poRef = useRef(null);
  const qoRef = useRef(null);
  const customerRef = useRef(null);
  const noteRef = useRef(null);

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
      // ตรวจสอบ part_name
      if (item.part_name?.toLowerCase().includes(searchInput) && !uniqueItems.has(item.part_name)) {
        allSuggestions.push({
          text: item.part_name,
          type: 'Part Name',
          icon: '📦'
        });
        uniqueItems.add(item.part_name);
      }

      // ตรวจสอบ serial_num
      if (item.serial_num?.toLowerCase().includes(searchInput) && !uniqueItems.has(item.serial_num)) {
        allSuggestions.push({
          text: item.serial_num,
          type: 'Serial Number',
          icon: '🔢'
        });
        uniqueItems.add(item.serial_num);
      }

      // ตรวจสอบ location
      if (item.location?.toLowerCase().includes(searchInput) && !uniqueItems.has(item.location)) {
        allSuggestions.push({
          text: item.location,
          type: 'Location',
          icon: '📍'
        });
        uniqueItems.add(item.location);
      }

      // ตรวจสอบ store_name ถ้ามี
      if (item.store_name?.toLowerCase().includes(searchInput) && !uniqueItems.has(item.store_name)) {
        allSuggestions.push({
          text: item.store_name,
          type: 'Store',
          icon: '🏪'
        });
        uniqueItems.add(item.store_name);
      }

      // ตรวจสอบ supplier ถ้ามี
      if (item.supplier?.toLowerCase().includes(searchInput) && !uniqueItems.has(item.supplier)) {
        allSuggestions.push({
          text: item.supplier,
          type: 'Supplier',
          icon: '🏭'
        });
        uniqueItems.add(item.supplier);
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
  const selectSuggestion = (suggestion) => {
    setSearchTerm(suggestion.text);
    if (searchRef.current) {
      searchRef.current.value = suggestion.text;
    }
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);

    // ทำการค้นหาทันทีเมื่อเลือก suggestion
    const filtered = stockParts.filter(item =>
      item.part_name?.toLowerCase().includes(suggestion.text.toLowerCase()) ||
      item.serial_num?.toLowerCase().includes(suggestion.text.toLowerCase()) ||
      item.store_name?.toLowerCase().includes(suggestion.text.toLowerCase()) ||
      item.location?.toLowerCase().includes(suggestion.text.toLowerCase()) ||
      item.supplier?.toLowerCase().includes(suggestion.text.toLowerCase())
    );
    setFilteredData(filtered);
    paginate(1, filtered);
  };

  // ฟังก์ชันจัดการการกดปุ่ม keyboard
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

  // ฟังก์ชันค้นหาหลัก
  const handleSearch = () => {
    const searchTermValue = searchRef.current?.value?.toLowerCase().trim() || "";
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);

    if (searchTermValue === '') {
      setFilteredData(stockParts);
      paginate(1, stockParts);
      return;
    }

    const filtered = stockParts.filter(item =>
      item.part_name?.toLowerCase().includes(searchTermValue) ||
      item.serial_num?.toLowerCase().includes(searchTermValue) ||
      item.store_name?.toLowerCase().includes(searchTermValue) ||
      item.location?.toLowerCase().includes(searchTermValue) ||
      item.supplier?.toLowerCase().includes(searchTermValue)
    );
    setFilteredData(filtered);
    paginate(1, filtered);
  };

  // ฟังก์ชันล้างการค้นหา
  const clearSearch = () => {
    setSearchTerm("");
    if (searchRef.current) {
      searchRef.current.value = "";
    }
    setShowSuggestions(false);
    setFilteredData(stockParts); // รีเซ็ตเป็นข้อมูลทั้งหมด
    paginate(1, stockParts);
  };

  // ฟังก์ชันค้นหาตาม Location (พิเศษ)
  const handleLocationSearch = (location) => {
    // เซ็ตค่าในช่องค้นหาเป็น Location ที่เลือก
    if (searchRef.current) {
      searchRef.current.value = location;
    }
    setSearchTerm(location);

    // กรองข้อมูลตาม Location
    const filtered = stockParts.filter(item =>
      item.location?.toLowerCase() === location.toLowerCase()
    );

    setFilteredData(filtered);
    // อัพเดทข้อมูลที่แสดงและกลับไปหน้าแรก
    paginate(1, filtered);
    setShowSuggestions(false);
  };



  // ฟังก์ชันเพิ่มสินค้าที่เลือก
  const addSelectedItem = (item) => {
    // ตรวจสอบว่าสินค้านี้ถูกเลือกแล้วหรือไม่
    const existingIndex = selectedItems.findIndex(selected =>
      selected.part_name === item.part_name && selected.serial_num === item.serial_num
    );

    if (existingIndex === -1) {
      // ถ้ายังไม่มี ให้เพิ่มเข้าไป
      const newItem = {
        ...item,
        quantity: 1, // จำนวนเริ่มต้น
        id: Date.now() + Math.random() // สร้าง unique id
      };
      setSelectedItems([...selectedItems, newItem]);

      // แสดงข้อความยืนยัน
      Swal.fire({
        icon: "success",
        title: "เพิ่มสินค้าสำเร็จ",
        text: `เพิ่ม ${item.part_name} แล้ว`,
        timer: 1000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });
    } else {
      // ถ้ามีแล้ว ให้แสดงข้อความแจ้งเตือน
      Swal.fire({
        icon: "warning",
        title: "สินค้าถูกเลือกแล้ว",
        text: `${item.part_name} อยู่ในรายการแล้ว`,
        timer: 1500,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });
    }
  };

  // ฟังก์ชันลบสินค้าที่เลือก
  const removeSelectedItem = (itemId) => {
    setSelectedItems(selectedItems.filter(item => item.id !== itemId));
  };

  // ฟังก์ชันอัพเดทจำนวนสินค้า
  const updateQuantity = (itemId, newQuantity) => {
    // ตรวจสอบให้จำนวนไม่ต่ำกว่า 1
    const quantity = Math.max(1, parseInt(newQuantity) || 1);

    setSelectedItems(selectedItems.map(item =>
      item.id === itemId
        ? { ...item, quantity: quantity }
        : item
    ));
  };

  // ฟังก์ชันตรวจสอบว่าสินค้าถูกเลือกแล้วหรือไม่
  const isItemSelected = (item) => {
    return selectedItems.some(selected =>
      selected.part_name === item.part_name && selected.serial_num === item.serial_num
    );
  };

  // ฟังก์ชันดึงข้อมูล stock parts
  const fetchStockParts = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SERVER}/Store.php?action=getStock`);
      const data = await response.json();
      console.log("Raw API Response:", data);
      if (Array.isArray(data)) {
        console.log("Stock Parts Data:", data);
        setStockParts(data);
        setOriginalStockParts(data);
        setFilteredData(data);
        paginate(1, data);
      }
    } catch (error) {
      console.error("Error fetching stock parts:", error);
      setStockParts([]);
      setOriginalStockParts([]);
      setFilteredData([]);
      setCurrentPageData([]);
    }
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

  // ฟังก์ชัน paginate - ปรับปรุงให้ใช้ filteredData
  const paginate = (page, data = filteredData.length > 0 ? filteredData : stockParts) => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setCurrentPageData(data.slice(startIndex, endIndex));
    setCurrentPage(page);
  };

  // คำนวณจำนวนหน้าทั้งหมด - ปรับปรุงให้ใช้ filteredData
  const totalPages = Math.ceil((filteredData.length > 0 ? filteredData : stockParts).length / itemsPerPage);

  const handleClose = () => {
    setShow(false);
    resetForm();
  };

  const handleShow = () => {
    setShow(true);
    resetForm();
    fetchStockParts();
  };

  const resetForm = () => {
    setValidated(false);
    setSelectedType(null);
    setSelectedTypeId(null);
    setTypeInput("");
    setShowTypeDropdown(false);
    setFilteredTypes(types);
    setCurrentPage(1);
    setSelectedItems([]); // ล้างสินค้าที่เลือก
    // ล้างค่าช่องค้นหา
    setSearchTerm("");
    setFilteredData([]);
    if (searchRef.current) {
      searchRef.current.value = '';
    }
  };

  useEffect(() => {
    fetchTypes();
  }, []);

  useEffect(() => {
    if (typeInput) {
      const filtered = types.filter(type =>
        type.type_name.toLowerCase().includes(typeInput.toLowerCase()) ||
        type.type_prefix.toLowerCase().includes(typeInput.toLowerCase())
      );
      setFilteredTypes(filtered);
    } else {
      setFilteredTypes(types);
    }
  }, [typeInput, types]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (typeInputRef.current && !typeInputRef.current.contains(event.target)) {
        setShowTypeDropdown(false);
      }
    }

    if (show) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [show]);

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

  // useEffect สำหรับอัปเดต pagination เมื่อ stockParts เปลี่ยนแปลง
  useEffect(() => {
    if (stockParts.length > 0 && filteredData.length === 0) {
      setFilteredData(stockParts);
      paginate(1, stockParts);
    }
  }, [stockParts]);

  const fetchTypes = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SERVER}/Store.php?action=getType`);
      const data = await response.json();
      if (data) {
        setTypes(data);
        setFilteredTypes(data);
      }
    } catch (error) {
      console.error("Error fetching types:", error);
    }
  };

  // เมื่อ props เปลี่ยน ให้อัปเดต bucketID
  useEffect(() => {
    if (nextBucketID) {
      setBucketID(nextBucketID);
    }
  }, [nextBucketID]);

  const handleTypeInputChange = (e) => {
    setTypeInput(e.target.value);
    setSelectedType(null);
    setSelectedTypeId(null);
    setShowTypeDropdown(true);
  };

  const handleTypeInputFocus = () => {
    setShowTypeDropdown(true);
  };

  const handleTypeInputClick = () => {
    setShowTypeDropdown(true);
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    const options = {
      timeZone: 'Asia/Bangkok',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    };

    const thailandTime = now.toLocaleString('en-US', options);
    const [date, time] = thailandTime.split(', ');
    const [month, day, year] = date.split('/');
    return `${year}-${month}-${day} ${time}`;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;


    if (form.checkValidity() === false) {
      event.stopPropagation();
      setValidated(true);
      return;
    }

    // ตรวจสอบว่ามีสินค้าที่เลือกหรือไม่
    if (selectedItems.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "กรุณาเลือกสินค้า",
        text: "กรุณาเลือกสินค้าอย่างน้อย 1 รายการ",
      });
      return;
    }

    await saveBucketEntry();
    setValidated(true);
  };

  const saveBucketEntry = async () => {
    try {
      // สร้างข้อมูลสำหรับส่งไปยัง API สำหรับแต่ละสินค้าที่เลือก
      const savePromises = selectedItems.map(async (item) => {
        try {
          // บันทึกข้อมูล Bucket
          const bucketRes = await fetch(
            `${import.meta.env.VITE_SERVER}/Store.php?action=saveBucket` +
            `&UID=${encodeURIComponent(uidRef.current?.value || '')}` +
            `&PO=${encodeURIComponent(poRef.current?.value || '')}` +
            `&QO=${encodeURIComponent(qoRef.current?.value || '')}` +
            `&CUSTOMER=${encodeURIComponent(customerRef.current?.value || '')}` +
            `&BucketID=${encodeURIComponent(bucketID)}` + 
            `&USERID=${encodeURIComponent(localStorage.getItem("userID") || "5555")}` + 
            `&USERNAME=${encodeURIComponent(Username || '')}` +
            `&Partname=${encodeURIComponent(item.part_name || '')}` +
            `&SerialNum=${encodeURIComponent(item.serial_num || '')}` +
            `&QTY=${encodeURIComponent(item.quantity)}` +
            `&status=${encodeURIComponent("napprove")}` +
            `&datetime=${encodeURIComponent(getCurrentDateTime())}` +
            `&Note=${encodeURIComponent(noteRef.current?.value || '')}`,
            {
              method: "POST",
            }
          );

          if (!bucketRes.ok) {
            throw new Error(`HTTP error! status: ${bucketRes.status}`);
          }

          const bucketResult = await bucketRes.json();
          console.log('Bucket result for item', item.part_name, ':', bucketResult);

          // ตรวจสอบผลลัพธ์
          let resultStatus = "error";
          if (bucketResult) {
            if (bucketResult.status === "success") {
              resultStatus = "success";
            } else if (bucketResult === "ok") { // สำรองไว้ในกรณีที่มีการเปลี่ยนแปลง
              resultStatus = "success";
            }
          }

          return {
            bucket: {
              status: resultStatus,
              message: bucketResult?.message || bucketResult || "Unknown error",
              data: bucketResult
            },
            item: item
          };

        } catch (error) {
          console.error('Error saving item:', item.part_name, error);
          return {
            bucket: {
              status: "error",
              message: error.message || "Network error"
            },
            item: item
          };
        }
      });

      // รอให้การบันทึกทั้งหมดเสร็จสิ้น
      const results = await Promise.all(savePromises);
      console.log('All results:', results);

      // ตรวจสอบผลลัพธ์ - add safety check
      const hasError = results.some(result => {
        // Add null/undefined checks
        if (!result || !result.bucket) {
          console.warn('Invalid result structure:', result);
          return true;
        }
        return result.bucket.status !== "success";
      });

      if (!hasError) {
        Swal.fire({
          icon: "success",
          title: "บันทึกข้อมูลสำเร็จ",
          text: `บันทึกสินค้า ${selectedItems.length} รายการแล้ว`,
          timer: 2000,
          showConfirmButton: false,
        });
        handleClose();
        if (onSave) onSave();

        // รีเฟรชข้อมูล Stock Parts หลังจากอัพเดท
        fetchStockParts();
      } else {
        // แสดงรายละเอียดข้อผิดพลาด
        const errorItems = results.filter(result =>
          !result || !result.bucket || result.bucket.status !== "success"
        );

        let errorMessage = "เกิดข้อผิดพลาดในการบันทึก:\n";
        errorItems.forEach(error => {
          const itemName = error?.item?.part_name || 'Unknown item';
          const errorMsg = error?.bucket?.message || 'Unknown error';
          errorMessage += `- ${itemName}: ${errorMsg}\n`;
        });

        Swal.fire({
          icon: "error",
          title: "ไม่สามารถบันทึกได้",
          text: errorMessage,
          width: '500px'
        });
      }
    } catch (error) {
      console.error("Error saving bucket:", error);
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: error.message,
      });
    }
  };

  // ============= SEARCH UI COMPONENT =============
  // 4. อัปเดต SearchComponent ให้ใช้ placeholder ภาษาไทย
  const SearchComponent = () => (
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
        placeholder="ค้นหาชิ้นส่วน, Serial Number, Location..."
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
          onClick={clearSearch}
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
  );
  return (
    <div className="d-flex justify-content-end">
      <Button
        className="fw-bold"
        variant="success"
        style={{
          borderRadius: "6px",
          backgroundColor: "#007e33",
          borderColor: "#007e33"
        }}
        onClick={handleShow}
      >
        <Plus size={18} className="me-1" />
        Add Bucket
      </Button>

      <Modal
        size="xl"
        show={show}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
        aria-labelledby="modal-title"
        aria-hidden={!show}
        role="dialog"
        dialogClassName="custom-modal-width"
        style={{
          '--bs-modal-width': '90vw',
          '--bs-modal-max-width': '1200px'
        }}
        contentClassName="bg-dark text-light"
      >
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Modal.Header
            closeButton
            style={{
              backgroundColor: "#2a2a2a",
              borderBottom: "1px solid #333333",
              color: "#e0e0e0"
            }}
            className="border-dark"
          >
            <Modal.Title id="modal-title" style={{ color: "#00c853" }}>
              <Plus className="me-2" size={22} />
              <b>Add Bucket</b>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body
            style={{
              minHeight: '400px',
              padding: '2rem',
              backgroundColor: "#1a1a1a",
              color: "#e0e0e0"
            }}
          >
            <Row className="mb-3">
              {/* Form Fields */}
              <Form.Group as={Col} md="4" className="mb-3">
                <Form.Label style={{ color: "#e0e0e0" }}><b>PO</b></Form.Label>
                <Form.Control
                  required
                  type="text"
                  ref={poRef}
                  style={{
                    backgroundColor: "#333333",
                    color: "#e0e0e0",
                    border: "1px solid #444444",
                    borderRadius: "6px"
                  }}
                />
              </Form.Group>

              <Form.Group as={Col} md="4" className="mb-3">
                <Form.Label style={{ color: "#e0e0e0" }}><b>QO</b></Form.Label>
                <Form.Control
                  required
                  type="text"
                  ref={qoRef}
                  style={{
                    backgroundColor: "#333333",
                    color: "#e0e0e0",
                    border: "1px solid #444444",
                    borderRadius: "6px"
                  }}
                />
              </Form.Group>

              <Form.Group as={Col} md="4" className="mb-3">
                <Form.Label style={{ color: "#e0e0e0" }}><b>CUSTOMER</b></Form.Label>
                <Form.Control
                  required
                  type="text"
                  ref={customerRef}
                  style={{
                    backgroundColor: "#333333",
                    color: "#e0e0e0",
                    border: "1px solid #444444",
                    borderRadius: "6px"
                  }}
                />
              </Form.Group>



              {/* ตารางซ้าย - เลือกชิ้นส่วน */}
              <Col md="6" className="mb-3">
                <div className="mb-3">
                  <h6 className="mb-2" style={{ color: "#00c853" }}>
                    <Box className="me-2" size={18} />
                    เลือกชิ้นส่วน
                  </h6>
                  {/* ส่วนช่องค้นหา */}
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
                      placeholder="Search items..."
                      ref={searchRef}
                      value={searchTerm}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      onFocus={() => {
                        if (suggestions.length > 0) setShowSuggestions(true);
                      }}
                    />
                    <Search className="position-absolute" style={{
                      left: "5px",
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
                        onClick={clearSearch}
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
                            onClick={() => selectSuggestion(suggestion)}
                            className={`d-flex align-items-center ${index === selectedSuggestionIndex ? 'active' : ''
                              }`}
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
                </div>
                <FormControl
                  className="ps-4"
                  style={{
                    borderRadius: "6px",
                    boxShadow: "none",
                    width: "9",
                    backgroundColor: "#333333",
                    color: "#00c853",
                    border: "1px solid #444444",
                    marginBottom: "16px"
                    
                  }}
                  type="text"
                  value={`BucketID : ${bucketID}`} //กำหนดรหัสตะกร้า
                  onChange={(e) => setBucketID(e.target.value.replace('Bucket ', ''))}
                  placeholder="Bucket ID"
                  readOnly/>  
                  {/* // ทำให้อ่านอย่างเดียว หรือลบออกถ้าต้องการให้แก้ไขได้        */}

                  <div className="table-responsive">
                  <Table hover className="align-middle border table-dark" style={{ borderRadius: "8px", overflow: "hidden" }}>
                    <thead style={{ backgroundColor: "#333333" }}>
                      <tr className="text-center">
                        <th className="py-3" style={{ color: "#e0e0e0", fontSize: "0.8rem" }}>Location</th>
                        <th className="py-3" style={{ color: "#e0e0e0", fontSize: "0.8rem" }}>Part Name</th>
                        <th className="py-3" style={{ color: "#e0e0e0", fontSize: "0.8rem" }}>Serial Number</th>
                        <th className="py-3" style={{ color: "#e0e0e0", fontSize: "0.8rem" }}>Stock Qty</th>
                        <th className="py-3" style={{ color: "#e0e0e0", fontSize: "0.8rem" }}>Date Update</th>
                        <th className="py-3" style={{ color: "#e0e0e0", fontSize: "0.8rem" }}>Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {currentPageData.length === 0 ? (
                        <tr>
                          <td colSpan="3" className="text-center py-5" style={{ color: "#bdbdbd" }}>
                            <div className="d-flex flex-column align-items-center">
                              <Tools size={40} className="mb-2 text-muted" />
                              <span className="fw-medium">
                                {searchRef?.current?.value ? 'ไม่พบข้อมูลที่ค้นหา' : 'No Data'}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        currentPageData.map((item, index) => {
                          const selected = isItemSelected(item);
                          return (
                            <tr key={index} className="text-center text-white">
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
                              <td className="fw-medium text-white">{item.part_name || 'N/A'}</td>
                              <td>
                                <Badge bg="dark" text="light"
                                  style={{
                                    fontWeight: "medium",
                                    backgroundColor: "#424242",
                                    padding: "6px 8px",
                                    borderRadius: "4px"
                                  }}>
                                  <UpcScan className="me-1" size={14} />
                                  {item.serial_num || '-'}
                                </Badge>
                              </td>
                              <td>{item.stock_qty || item.qty}</td>
                              <td>
                                <small className="text-muted d-flex align-items-center justify-content-center">
                                  <CalendarDate size={12} className="me-1" />
                                  {formatDate(item.datetime)}
                                </small>

                              </td>
                              <td>
                                <Button
                                  variant={selected ? "outline-success" : "success"}
                                  size="sm"
                                  disabled={selected}
                                  style={{
                                    borderRadius: "4px",                    // ลด border radius
                                    backgroundColor: selected ? "transparent" : "#00c853",
                                    borderColor: "#00c853",
                                    padding: "4px 6px",                     // ลด padding
                                    minWidth: "12px"                        // กำหนดความกว้าง
                                  }}
                                  onClick={() => addSelectedItem(item)}
                                >
                                  {selected ? (
                                    <>
                                      <CheckCircle className="me-1" size={18} />
                                      {/* Selected */}
                                    </>
                                  ) : (
                                    <>
                                      <Plus className="me-1" size={18} />
                                      {/* Select */}
                                    </>
                                  )}
                                </Button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </Table>
                </div>

                {/* การแบ่งหน้า */}
                {totalPages > 1 && (
                  <div className="d-flex justify-content-center mt-3">
                    <Pagination size="sm" variant="dark">
                      <Pagination.First
                        onClick={() => paginate(1)}
                        disabled={currentPage === 1}
                        style={{ backgroundColor: "#333333", borderColor: "#444444" }}
                      />
                      <Pagination.Prev
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        style={{ backgroundColor: "#333333", borderColor: "#444444" }}
                      />

                      {[...Array(totalPages)].map((_, index) => {
                        const pageNumber = index + 1;
                        if (
                          pageNumber === 1 ||
                          pageNumber === totalPages ||
                          (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                        ) {
                          return (
                            <Pagination.Item
                              key={pageNumber}
                              active={pageNumber === currentPage}
                              onClick={() => paginate(pageNumber)}
                              style={{
                                backgroundColor: pageNumber === currentPage ? "#00c853" : "#333333",
                                borderColor: "#444444",
                                color: "#e0e0e0"
                              }}
                            >
                              {pageNumber}
                            </Pagination.Item>
                          );
                        } else if (
                          pageNumber === currentPage - 2 ||
                          pageNumber === currentPage + 2
                        ) {
                          return <Pagination.Ellipsis key={pageNumber} style={{ backgroundColor: "#333333", borderColor: "#444444" }} />;
                        }
                        return null;
                      })}

                      <Pagination.Next
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        style={{ backgroundColor: "#333333", borderColor: "#444444" }}
                      />
                      <Pagination.Last
                        onClick={() => paginate(totalPages)}
                        disabled={currentPage === totalPages}
                        style={{ backgroundColor: "#333333", borderColor: "#444444" }}
                      />
                    </Pagination>
                  </div>
                )}

                {/* Statistics */}
                {stockParts.length > 0 && (
                  <div className="text-center mt-2 small" style={{ color: "#bdbdbd" }}>
                    แสดง {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, stockParts.length)} จาก {stockParts.length} รายการ
                    {searchRef?.current?.value && ` (กรองจาก ${originalStockParts.length} รายการ)`}
                  </div>
                )}
              </Col>

              {/* ตารางที่ 2 - สินค้าที่เลือก */}
              <Col md="6" className="mb-3">
                <div className="mb-3">
                  <h6 className="mb-2" style={{ color: "#00c853" }}>
                    <CheckCircle className="me-2" size={18} />
                    สินค้าที่เลือก
                    {selectedItems.length > 0 && (
                      <Badge bg="success" className="ms-2" style={{ backgroundColor: "#00c853" }}>
                        {selectedItems.length}
                      </Badge>
                    )}
                  </h6>
                </div>

                <div
                  className="border rounded p-3"
                  style={{
                    minHeight: '300px',
                    maxHeight: '500px',
                    overflowY: 'auto',
                    backgroundColor: '#2a2a2a',
                    borderColor: '#444444'
                  }}
                >
                  {/* เช็คว่ารายการสินค้าว่างอยู่หรือไม่ */}
                  {selectedItems.length === 0 ? (
                    <div className="text-center py-5" style={{ color: '#bdbdbd' }}>
                      <CheckCircle size={40} className="mb-2 text-muted" />
                      <p className="mb-0">ยังไม่มีสินค้าที่เลือก</p>
                      <small>กรุณาเลือกสินค้าจากตารางด้านซ้าย</small>
                    </div> //  ) : ( หมายความว่าถ้ามีสินค้า ให้แสดงตารางแทน
                  ) : (
                    <div className="table-responsive">
                      <Table size="sm" className="table-dark" style={{ fontSize: '0.85rem' }}>
                        <thead style={{ backgroundColor: "#333333" }}>
                          <tr>
                            <th style={{ color: "#e0e0e0", padding: '8px' }}>Part Name</th>
                            <th style={{ color: "#e0e0e0", padding: '8px' }}>Serial</th>
                            <th style={{ color: "#e0e0e0", padding: '8px', width: '80px' }}>จำนวน</th>
                            <th style={{ color: "#e0e0e0", padding: '8px', width: '60px' }}>ลบ</th>
                          </tr>
                        </thead>
                        <tbody>

                          {selectedItems.map((item) => (
                            <tr key={item.id}>      {/* วนลูปแสดงรายการสินค้าที่เลือกแต่ละรายการ */}

                              <td style={{ color: "#e0e0e0", padding: '8px' }}>
                                <div className="text-truncate" style={{ maxWidth: '120px' }}> {/* ตัดถ้าข้อความยาวเกิน 120 */}
                                  {item.part_name}
                                </div>
                              </td>

                              {/* แสดง Serial Number ถ้ามี หรือ - ถ้าไม่มี */}
                              <td style={{ color: "#e0e0e0", padding: '8px' }}>
                                <Badge bg="dark" style={{
                                  backgroundColor: "#424242",
                                  fontSize: '0.7rem'
                                }}>
                                  {item.serial_num || '-'}
                                </Badge>
                              </td>

                              {/* ช่องให้กรอกจำนวนสินค้า พร้อมเรียก updateQuantity เมื่อแก้ไขค่า */}
                              <td style={{ padding: '8px' }}>
                                <Form.Control
                                  type="number"
                                  min="1" // ตัวกำหนดขั้นต่ำ
                                  value={item.quantity}
                                  onChange={(e) => updateQuantity(item.id, e.target.value)}
                                  size="sm"
                                  style={{
                                    backgroundColor: "#333333",
                                    color: "#e0e0e0",
                                    border: "1px solid #444444",
                                    borderRadius: "4px",
                                    width: '60px'
                                  }}
                                />
                              </td>

                              {/* ปุ่มลบสินค้าแต่ละรายการ โดยเรียก removeSelectedItem */}
                              <td style={{ padding: '8px' }}>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => removeSelectedItem(item.id)}
                                  style={{
                                    borderColor: "#dc3545",
                                    color: "#dc3545",
                                    borderRadius: "4px",
                                    padding: "2px 6px"
                                  }}
                                >
                                  <Trash3 size={12} />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  )}

                  {/* สรุปจำนวนรวม */}
                  {selectedItems.length > 0 && (
                    <div className="mt-3 p-2 rounded" style={{ backgroundColor: '#333333' }}>
                      <div className="d-flex justify-content-between align-items-center">
                        <span style={{ color: "#e0e0e0" }}>
                          <strong>จำนวนรวม:</strong>
                        </span>
                        <Badge bg="success" style={{
                          backgroundColor: "#00c853",
                          fontSize: "0.8rem",
                          padding: "4px 8px"
                        }}>
                          {selectedItems.reduce((total, item) => total + item.quantity, 0)} ชิ้น
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
              </Col>

              <Form.Group as={Col} md="12" className="mb-3">
                <Form.Label style={{ color: "#e0e0e0" }}><b>Note</b></Form.Label>
                <Form.Control
                  type="text"
                  ref={noteRef}
                  as="textarea"
                  rows={4}
                  style={{
                    backgroundColor: "#333333",
                    color: "#e0e0e0",
                    border: "1px solid #444444",
                    borderRadius: "6px"
                  }}
                />
              </Form.Group>

            </Row>
          </Modal.Body>
          <Modal.Footer
            style={{
              padding: '1.5rem 2rem',
              backgroundColor: "#2a2a2a",
              borderTop: "1px solid #333333"
            }}
          >
            <Button
              variant="secondary"
              onClick={handleClose}
              type="button"
              style={{
                backgroundColor: "#6c757d",
                borderColor: "#6c757d",
                borderRadius: "6px"
              }}
            >
              <b>Close</b>
            </Button>
            <Button
              type="submit"
              variant="success"
              style={{
                backgroundColor: "#007e33",
                borderColor: "#007e33",
                borderRadius: "6px"
              }}
            >
              <b>Save ({selectedItems.length} รายการ)</b>
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}

export default addBucket;