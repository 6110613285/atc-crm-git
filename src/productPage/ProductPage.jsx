import React, { useContext, useState, useEffect, useRef } from "react";
import { FormControl, Button, Table, Tabs, Tab } from "react-bootstrap";
import { UserContext } from "../App";
import PaginationComponent from "../components/PaginationComponent";
import UpdateProduct from "./AddProduct";

function LogStock() {
  const userInfo = useContext(UserContext);
  const searchRef = useRef(null);

  // เพิ่มตัวแปรสำหรับแท็บที่แสดงผล
  const [activeTab, setActiveTab] = useState("stock");

  // สถานะสำหรับ stock items
  const [stockParts, setStockParts] = useState([]);
  const [currentPageData, setCurrentPageData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  
  // เพิ่มสถานะสำหรับ borrowed items
  const [borrowedItems, setBorrowedItems] = useState([]);
  const [currentBorrowPageData, setCurrentBorrowPageData] = useState([]);
  const [currentBorrowPage, setCurrentBorrowPage] = useState(1);
  
  const itemsPerPage = 200;

  // ฟังก์ชันดึงข้อมูล stock parts (คงเดิม)
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

  // เพิ่มฟังก์ชันดึงข้อมูลรายการที่ถูกยืม
  const fetchBorrowedItems = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SERVER}/Store.php?action=getBorrowedParts`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setBorrowedItems(data);
        // เซ็ตข้อมูลหน้าแรกทันทีหลังจากได้ข้อมูล
        paginateBorrow(1, data);
      }
    } catch (error) {
      console.error("Error fetching borrowed items:", error);
      setBorrowedItems([]);
    }
  };

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

  // เพิ่มฟังก์ชัน pagination สำหรับ borrowed items
  const paginateBorrow = (pageNumber, data = borrowedItems) => {
    const startIndex = (pageNumber - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setCurrentBorrowPageData(data.slice(startIndex, endIndex));
    setCurrentBorrowPage(pageNumber);
  };

  const handleSave = () => {
    fetchStockParts(); // โหลดข้อมูลใหม่หลังจากอัพเดท
    fetchBorrowedItems(); // โหลดข้อมูลยืมใหม่หลังจากอัพเดท
  };

  const handleSearch = () => {
    const searchTerm = searchRef.current.value.toLowerCase().trim();
    
    if (activeTab === "stock") {
      const filteredData = stockParts.filter(item => 
        item.part_name?.toLowerCase().includes(searchTerm) ||
        item.part_num?.toLowerCase().includes(searchTerm) ||
        item.store_name?.toLowerCase().includes(searchTerm) ||
        item.location?.toLowerCase().includes(searchTerm)
      );
      paginate(1, filteredData);
    } else if (activeTab === "borrowed") {
      const filteredData = borrowedItems.filter(item => 
        item.part_name?.toLowerCase().includes(searchTerm) ||
        item.part_num?.toLowerCase().includes(searchTerm) ||
        item.store_name?.toLowerCase().includes(searchTerm) ||
        item.location?.toLowerCase().includes(searchTerm) ||
        item.supplier?.toLowerCase().includes(searchTerm)
      );
      paginateBorrow(1, filteredData);
    }
  };

  // เพิ่มฟังก์ชันคืนอุปกรณ์
  const handleReturn = (item) => {
    // แสดง dialog ยืนยันการคืนอุปกรณ์
    if (window.confirm(`ต้องการคืนอุปกรณ์ ${item.part_name} จำนวน ${item.borrowed_qty} ${item.part_unit || ''} หรือไม่?`)) {
      alert("กำลังพัฒนาฟังก์ชันคืนอุปกรณ์");
      // TODO: เพิ่มการเรียก API เพื่อคืนอุปกรณ์
      // ตัวอย่างโค้ดที่อาจใช้:
      /*
      const returnItem = async () => {
        try {
          const formData = new FormData();
          formData.append("action", "updateStock");
          formData.append("status", "RETURN");
          formData.append("partnum", item.part_num);
          formData.append("partname", item.part_name);
          formData.append("supplier", item.supplier || '');
          formData.append("unit", item.part_unit || '');
          formData.append("qty", item.borrowed_qty);
          formData.append("location", item.location);
          formData.append("storename", item.store_name || '');
          formData.append("note", "คืนจากการยืม");
          formData.append("date", new Date().toISOString());

          const response = await fetch(`${import.meta.env.VITE_SERVER}/Store.php`, {
            method: "POST",
            body: formData
          });

          const data = await response.json();
          if (data === "ok") {
            alert("คืนอุปกรณ์สำเร็จ");
            fetchBorrowedItems(); // รีเฟรชข้อมูลการยืม
            fetchStockParts(); // รีเฟรชข้อมูล stock
          } else {
            alert("เกิดข้อผิดพลาด: " + data);
          }
        } catch (error) {
          console.error("Error returning item:", error);
          alert("เกิดข้อผิดพลาดในการคืนอุปกรณ์");
        }
      };
      returnItem();
      */
    }
  };

  useEffect(() => {
    if (userInfo) {
      fetchStockParts();
      fetchBorrowedItems();
    }
  }, [userInfo]);

  return (
    <>
      {/* เพิ่มแท็บสำหรับเลือกดูข้อมูล */}
      <div className="w-100 p-0 mb-3">
        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k)}
          className="mb-3"
          variant="pills"
          fill
          style={{ 
            backgroundColor: "#000", 
            width: "100%", 
            margin: 0,
            padding: 0
          }}
        >
          <Tab 
            eventKey="stock" 
            title="Stock Items"
            style={{ width: "100%" }}
          />
          <Tab 
            eventKey="borrowed" 
            title="Borrowed Items"
            style={{ width: "100%" }}
          />
        </Tabs>
      </div>

      <div className="mx-5">
        {/* แสดงข้อมูล Stock Items */}
        {activeTab === "stock" && (
          <div className="d-flex flex-column">
            <div className="d-flex justify-content-between align-items-center mb-3">
            <h2>Stock Items</h2>
            <div className="d-flex justify-content-end gap-1 mb-1">
              <UpdateProduct onSave={handleSave} />
              <FormControl
                className="w-25"
                type="text"
                placeholder="🔍 ค้นหา..."
                ref={searchRef}
              />
              <Button variant="info" onClick={handleSearch}>
                ค้นหา
              </Button>
            </div>
            </div>

            <Table striped bordered hover responsive variant="dark">
              <thead>
                <tr className="text-center">
                  <th>#</th>
                  <th>Part Name</th>
                  <th>Part Number</th>
                  <th>Unit</th>
                  <th>Stock Quantity</th>
                  <th>Location</th>
                  <th>Store Name</th>
                  <th>Supplier</th>
                  <th>Date Update</th>
                </tr>
              </thead>

              <tbody>
                {currentPageData.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="fw-bold text-center">
                      ไม่พบข้อมูล
                    </td>
                  </tr>
                ) : (
                  currentPageData.map((item, index) => (
                    <tr key={index} className="text-center">
                      <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                      <td>{item.part_name}</td>
                      <td>{item.part_num}</td>
                      <td>{item.part_unit}</td>
                      <td>{item.stock_qty}</td>
                      <td>{item.location}</td>
                      <td>{item.store_name}</td>
                      <td>{item.supplier || '-'}</td>
                      <td>{formatDate(item.datetime)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>

            <PaginationComponent
              itemsPerPage={itemsPerPage}
              totalItems={stockParts.length}
              paginate={paginate}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
            />
          </div>
        )}

        {/* แสดงข้อมูล Borrowed Items */}
        {activeTab === "borrowed" && (
          <div className="d-flex flex-column">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2>Borrowed items</h2>
              <div className="d-flex gap-1">
                <FormControl
                  className="w-100"
                  type="text"
                  placeholder="🔍 ค้นหา..."
                  ref={searchRef}
                />
                <Button variant="info" onClick={handleSearch}>
                  Search
                </Button>
              </div>
            </div>

            <Table striped bordered hover responsive variant="dark">
              <thead>
              <tr className="text-center">
                  <th>No.</th>
                  <th>Borrow Date</th>
                  <th>Part Number</th>
                  <th>Part Name</th>
                  <th>Supplier</th>
                  <th>Unit</th>
                  <th>Quantity</th>
                  <th>Location</th>
                  <th>Store Name</th>
                  <th>Note</th>
                  {/* <th>Action</th> */}
                </tr>
              </thead>

              <tbody>
                {currentBorrowPageData.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="fw-bold text-center">
                      No data
                    </td>
                  </tr>
                ) : (
                  currentBorrowPageData.map((item, index) => (
                    <tr key={index} className="text-center">
                      <td>{(currentBorrowPage - 1) * itemsPerPage + index + 1}</td>
                      <td>{formatDate(item.datetime)}</td>
                      <td>{item.part_num}</td>
                      <td>{item.part_name}</td>
                      <td>{item.supplier || '-'}</td>
                      <td>{item.part_unit || '-'}</td>
                      <td>{item.borrowed_qty || item.qty}</td>
                      <td>{item.location}</td>
                      <td>{item.store_name}</td>
                      <td>{item.note || "-"}</td>
                      {/* <td>
                        <div className="d-flex gap-1 justify-content-center align-items-center">
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => handleReturn(item)}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              fill="currentColor"
                              className="bi bi-arrow-return-left"
                              viewBox="0 0 16 16"
                            >
                              <path fillRule="evenodd" d="M14.5 1.5a.5.5 0 0 1 .5.5v4.8a2.5 2.5 0 0 1-2.5 2.5H2.707l3.347 3.346a.5.5 0 0 1-.708.708l-4.2-4.2a.5.5 0 0 1 0-.708l4-4a.5.5 0 1 1 .708.708L2.707 8.3H12.5A1.5 1.5 0 0 0 14 6.8V2a.5.5 0 0 1 .5-.5z"/>
                            </svg>
                            {" "}คืน
                          </Button>
                        </div>
                      </td> */}
                    </tr>
                  ))
                )}
              </tbody>
            </Table>

            <PaginationComponent
              itemsPerPage={itemsPerPage}
              totalItems={borrowedItems.length}
              paginate={paginateBorrow}
              currentPage={currentBorrowPage}
              setCurrentPage={setCurrentBorrowPage}
            />
          </div>
        )}
      </div>
    </>
  );
}

export default LogStock;