import React, { useState, useEffect, useRef } from "react";
import { FormControl, Button, Table, Card, Badge, Container } from "react-bootstrap";
import PaginationComponent from "../components/PaginationComponent";
import ProductAdd from "./ProductAdd";
import ProductDetailModal from "./ProductDetailModal";
import ProductOutModal from "./ProductOutModal";
import { Search, XCircle, Trash, Plus, Display, Pencil, BoxArrowRight } from "react-bootstrap-icons";
import { useSearchParams } from "react-router-dom";

function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchRef = useRef(null);
  const [products, setProducts] = useState([]);
  const [groupedProducts, setGroupedProducts] = useState([]);
  const [currentProductPageData, setCurrentProductPageData] = useState([]);
  const [currentProductPage, setCurrentProductPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

  
  // สำหรับ Modal รายละเอียด
  const [showProductDetail, setShowProductDetail] = useState(false);
  const [selectedProductDetail, setSelectedProductDetail] = useState({ 
    atModel: "", 
    displaySize: "",
    location: ""
  });

  // สำหรับ Modal ขายสินค้า
  const [showProductOut, setShowProductOut] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const itemsPerPage = 15;

  // สถานะทั้งหมดที่รองรับ
  const statusTypes = ['OK', 'NG', 'พร้อมขาย', 'รอลงwindow', 'ขายแล้ว', 'Demo', 'ซ่อม', 'ยืม' ,'borrow', 'out'];
  
  // ฟังก์ชันดึงข้อมูลสินค้าทั้งหมด
  const getProducts = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER}/Store.php?action=getProducts`,
        { method: "GET" }
      );
      const data = await res.json();
      if (data === null) {
        setProducts([]);
        setGroupedProducts([]);
      } else {
        setProducts(data);
        groupProductsByModel(data);
      }
    } catch (err) {
      console.log(err);
      setProducts([]);
      setGroupedProducts([]);
    }
  };

  const updateProductInList = (updatedProduct) => {
  setProducts(prev =>
    prev.map(item =>
      item.AT_SN === updatedProduct.original_AT_SN
        ? { ...item, ...updatedProduct }
        : item
    )
  );
};

  // ฟังก์ชันจัดกลุ่มสินค้าตาม AT Model, ขนาดจอ และ Location
  const groupProductsByModel = (productList) => {
    const grouped = productList.reduce((acc, product) => {
      const key = `${product.AT_Model || 'Unknown'}_${product.displaysize || '0'}_${product.location || 'No Location'}`;
      
      if (!acc[key]) {
        acc[key] = {
          at_model: product.AT_Model || 'Unknown',
          display_size: product.displaysize || '0',
          location: product.location || 'No Location',
          supplier: product.Sup_name || '-',
          cpu: product.CPU || '-',
          ram: product.Ram || '-',
          storage: product['SSD/HDD'] || '-',
          total_qty: 0,
          // สร้างการนับสำหรับสถานะใหม่ทั้งหมด
          status_counts: {
            'OK': 0,
            'NG': 0,
            'พร้อมขาย': 0,
            'รอลงwindow': 0,
            'ขายแล้ว': 0,
            'Demo': 0,
            'ซ่อม': 0,
            'ยืม': 0,
            'borrow': 0,
            'out': 0,
            'Other': 0
          },
          latest_date: product.Datein,
          sample_customer: product.Customer || '-',
          items: []
        };
      }
      
      acc[key].total_qty += 1;
      
      // นับสถานะใหม่
      const status = product.Product_status;
      if (statusTypes.includes(status)) {
        acc[key].status_counts[status] += 1;
      } else {
        acc[key].status_counts['Other'] += 1;
      }
      
      // เก็บวันที่ล่าสุด
      const latestDate = [product.Datein, product.Dateout]
  .filter(date => date) // กรองเอาเฉพาะที่มีค่า
  .sort((a, b) => new Date(b) - new Date(a))[0]; // เรียงจากใหม่ไปเก่า เอาตัวแรก

if (new Date(latestDate) > new Date(acc[key].latest_date)) {
  acc[key].latest_date = latestDate;
}
      acc[key].items.push(product);
      return acc;
    }, {});

    setGroupedProducts(Object.values(grouped));
  };
  
  // ฟังก์ชันค้นหาสินค้า
  const searchProducts = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER}/Store.php?action=searchProducts&search=${
          searchRef.current.value || ""
        }`,
        { method: "GET" }
      );
      const data = await res.json();
      if (data === null) {
        setProducts([]);
        setGroupedProducts([]);
      } else {
        setProducts(data);
        groupProductsByModel(data);
      }
    } catch (err) {
      console.log(err);
      setProducts([]);
      setGroupedProducts([]);
    }
  };

  // ฟังก์ชันแสดงรายละเอียดสินค้า
  const handleProductClick = (atModel, displaySize, location) => {
    setSelectedProductDetail({ atModel, displaySize, location });
    setShowProductDetail(true);
  };

  // ฟังก์ชันเปิด Modal ขายสินค้า
  const handleOpenOutModal = () => {
    // สร้าง modal สำหรับเลือกสินค้าที่จะขาย
    setShowProductOut(true);
  };

  // ฟังก์ชันเลือกสินค้าเฉพาะเจาะจงเพื่อขาย
  const handleSelectProductForSale = (product) => {
    setSelectedProduct(product);
    setShowProductOut(true);
  };

  // ฟังก์ชันลบสินค้า (ใช้กับรายการเดี่ยว)
  const deleteProduct = async (productId) => {
    if (window.confirm("คุณต้องการลบข้อมูลสินค้านี้หรือไม่?")) {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_SERVER}/Store.php?action=deleteProduct&product_id=${productId}`,
          { method: "DELETE" }
        );
        const data = await res.json();
        if (data.status === "success") {
          alert("ลบข้อมูลสำเร็จ");
          getProducts();
        } else {
          alert("ไม่สามารถลบข้อมูลได้: " + data.message);
        }
      } catch (err) {
        console.log(err);
        alert("เกิดข้อผิดพลาดในการลบข้อมูล");
      }
    }
  };

   const getSortIcon = (columnKey) => {
  if (sortConfig.key !== columnKey) {
    return (
      <span style={{ color: "#888" }}>△</span>
    );
  }
  return sortConfig.direction === 'ascending' ? (
    <span style={{ color: "#00e676" }}>▲</span>
  ) : (
    <span style={{ color: "#00e676" }}>▼</span>
  );
};

  const sortGroupedProducts = (key) => {
  let direction = 'ascending';
  if (sortConfig.key === key && sortConfig.direction === 'ascending') {
    direction = 'descending';
  }

  const sorted = [...groupedProducts].sort((a, b) => {
    if (a[key] === null) return 1;
    if (b[key] === null) return -1;

    if (typeof a[key] === 'string') {
      return direction === 'ascending' 
        ? a[key].localeCompare(b[key]) 
        : b[key].localeCompare(a[key]);
    } else if (typeof a[key] === 'number') {
      return direction === 'ascending' ? a[key] - b[key] : b[key] - a[key];
    } else {
      // กรณีอื่น ๆ เช่นวันที่
      return direction === 'ascending' 
        ? new Date(a[key]) - new Date(b[key]) 
        : new Date(b[key]) - new Date(a[key]);
    }
  });

  setSortConfig({ key, direction });
  setGroupedProducts(sorted);
  paginateProducts(1, sorted);
};

  // ฟังก์ชันแบ่งหน้าสำหรับข้อมูลที่จัดกลุ่มแล้ว
  const paginateProducts = (pageNumber, data = groupedProducts) => {
    const startIndex = (pageNumber - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setCurrentProductPageData(data.slice(startIndex, endIndex));
    setCurrentProductPage(pageNumber);
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

  // ฟังก์ชันกำหนดสีและสไตล์ของ Badge ตามสถานะ
  const getStatusBadgeStyle = (status) => {
    const baseStyle = {
      fontSize: '0.65rem',
      padding: '2px 6px',
      borderRadius: '3px',
      fontWeight: '500',
      margin: '1px',
      display: 'inline-block',
      whiteSpace: 'nowrap'
    };

    switch (status) {
      case 'OK':
        return { ...baseStyle, backgroundColor: '#28a745', color: '#fff' };
      case 'NG':
        return { ...baseStyle, backgroundColor: '#dc3545', color: '#fff' };
      case 'พร้อมขาย':
        return { ...baseStyle, backgroundColor: '#007bff', color: '#fff' };
      case 'รอลงwindow':
        return { ...baseStyle, backgroundColor: '#ffc107', color: '#000' };
      case 'ขายแล้ว':
        return { ...baseStyle, backgroundColor: '#6f42c1', color: '#fff' };
      case 'Demo':
        return { ...baseStyle, backgroundColor: '#fd7e14', color: '#fff' };
      case 'ซ่อม':
        return { ...baseStyle, backgroundColor: '#e83e8c', color: '#fff' };
      case 'ยืม':
        return { ...baseStyle, backgroundColor: '#20c997', color: '#fff' };
      case 'borrow':
        return { ...baseStyle, backgroundColor: '#17a2b8', color: '#fff' }; 
      case 'out':
        return { ...baseStyle, backgroundColor: '#6610f2', color: '#fff' };
        return { ...baseStyle, backgroundColor: '#6c757d', color: '#fff' };
    }
  };

  // ฟังก์ชันแสดงสถานะในรูปแบบใหม่ - ปรับให้ responsive
  const getStatusSummary = (statusCounts, totalQty) => {
    // แสดงเฉพาะสถานะที่มีจำนวน > 0
    const activeStatuses = Object.entries(statusCounts).filter(([status, count]) => count > 0);
    
    if (activeStatuses.length === 0) {
      return <Badge style={getStatusBadgeStyle('Other')}>No Status</Badge>;
    }

    return (
      <div 
        className="d-flex flex-wrap align-items-start justify-content-start" 
        style={{ 
          gap: '2px',
          lineHeight: '1.2',
          maxWidth: '100%'
        }}
      >
        {activeStatuses.map(([status, count]) => (
          <Badge 
            key={status} 
            style={getStatusBadgeStyle(status)}
            title={`${status}: ${count} เครื่อง`}
          >
            {status}: {count}
          </Badge>
        ))}
      </div>
    );
  };

  // ฟังก์ชันค้นหาในกลุ่มที่จัดแล้ว
  const handleSearch = () => {
    const searchTerm = searchRef.current.value.toLowerCase().trim();
    
    if (!searchTerm) {
      groupProductsByModel(products);
      return;
    }

    const filteredProducts = products.filter(product =>
      product.AT_Model?.toLowerCase().includes(searchTerm) ||
      product.Sup_name?.toLowerCase().includes(searchTerm) ||
      product.AT_SN?.toLowerCase().includes(searchTerm) ||
      product.CPU?.toLowerCase().includes(searchTerm) ||
      product.Customer?.toLowerCase().includes(searchTerm) ||
      product.location?.toLowerCase().includes(searchTerm) ||
      product.Product_status?.toLowerCase().includes(searchTerm)
    );
    
    groupProductsByModel(filteredProducts);
    paginateProducts(1);
  };

  // ดึงข้อมูลเมื่อโหลดคอมโพเนนต์
  useEffect(() => {
    getProducts();
    
    // ตรวจสอบว่ามี search parameter หรือไม่
    const searchTerm = searchParams.get('search');
    if (searchTerm && searchRef.current) {
      searchRef.current.value = searchTerm;
      // ค้นหาหลังจากโหลดข้อมูลเสร็จ
      setTimeout(() => {
        handleSearch();
      }, 500);
    }
  }, [searchParams]);

  // อัปเดตข้อมูลหน้าเมื่อข้อมูลกลุ่มเปลี่ยนแปลง - แก้ไข currentPage เป็น currentProductPage
  useEffect(() => {
    paginateProducts(currentProductPage);
  }, [groupedProducts]);

  // ฟังก์ชันจัดการการบันทึก
  const handleSave = async () => {
    await getProducts();
  };

  // ฟังก์ชันจัดการการขายสำเร็จ
  const handleOutSuccess = () => {
    setShowProductOut(false);
    setSelectedProduct(null);
    getProducts();
  };

  // ฟังก์ชันจัดการการกดปุ่ม Enter
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
                  <Display className="me-2" size={22} />
                  Products
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
                      placeholder="Search products..."
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
                      await getProducts();
                      paginateProducts(1);
                    }}
                  >
                    <XCircle size={18} className="me-1" /> Clear
                  </Button>
                  <Button
                    variant="warning"
                    style={{ 
                      borderRadius: "6px",
                      backgroundColor: "#f39c12",
                      borderColor: "#f39c12",
                      color: "#000"
                    }}
                    onClick={handleOpenOutModal}
                  >
                    <BoxArrowRight size={18} className="me-1" /> Out Product
                  </Button>
                  <ProductAdd onSave={handleSave}>
                    <Button
                      variant="success"
                      style={{ 
                        borderRadius: "6px",
                        backgroundColor: "#007e33",
                        borderColor: "#007e33"
                      }}
                    >
                      <Plus size={18} className="me-1" /> Add Product
                    </Button>
                  </ProductAdd>
                </div>
              </div>

              <div className="table-responsive">
                <Table hover className="align-middle border table-dark" style={{ borderRadius: "8px", overflow: "hidden" }}>
                    <thead style={{ backgroundColor: "#333333" }}>
      <tr className="text-center">
        <th
          className="py-3"
          style={{ color: "#e0e0e0", width: "20%", cursor: "pointer" }}
          onClick={() => sortGroupedProducts('at_model')}
        >
          AT Model {getSortIcon('at_model')}
        </th>
        <th
          className="py-3"
          style={{ color: "#e0e0e0", width: "10%", cursor: "pointer" }}
          onClick={() => sortGroupedProducts('display_size')}
        >
          Display Size {getSortIcon('display_size')}
        </th>
        <th
          className="py-3"
          style={{ color: "#e0e0e0", width: "12%", cursor: "pointer" }}
          onClick={() => sortGroupedProducts('location')}
        >
          Location {getSortIcon('location')}
        </th>
        <th
          className="py-3"
          style={{ color: "#e0e0e0", width: "8%", cursor: "pointer" }}
          onClick={() => sortGroupedProducts('total_qty')}
        >
          Total Qty {getSortIcon('total_qty')}
        </th>
        <th
          className="py-3"
          style={{ color: "#e0e0e0", width: "35%", cursor: "pointer" }}
          onClick={() => sortGroupedProducts('status_summary')}
        >
          Status Summary
        </th>
        <th
          className="py-3"
          style={{ color: "#e0e0e0", width: "15%", cursor: "pointer" }}
          onClick={() => sortGroupedProducts('latest_date')}
        >
          Latest Update {getSortIcon('latest_date')}
        </th>
      </tr>
    </thead>
                  <tbody>
                    {currentProductPageData.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-5" style={{ color: "#bdbdbd" }}>
                          <div className="d-flex flex-column align-items-center">
                            <Display size={40} className="mb-2 text-muted" />
                            <span className="fw-medium">No Products Found</span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      currentProductPageData.map((group, index) => (
                        <tr key={index} className="text-center text-white">
                          <td className="fw-medium">
                            <Button
                              variant="link"
                              className="p-0 text-white text-decoration-none"
                              onClick={() => handleProductClick(group.at_model, group.display_size, group.location)}
                            >
                              <Display className="me-2 text-success" size={14} />
                              {group.at_model}
                            </Button>
                          </td>
                          <td>
                            <Badge bg="info" style={{ 
                              fontWeight: "normal", 
                              backgroundColor: "#17a2b8",
                              padding: "5px 8px",
                              borderRadius: "4px"
                            }}>
                              {group.display_size}"
                            </Badge>
                          </td>
                          <td>
                            <Badge bg="secondary" style={{ 
                              fontWeight: "normal", 
                              backgroundColor: "#6c757d",
                              padding: "5px 8px",
                              borderRadius: "4px"
                            }}>
                              {group.location}
                            </Badge>
                          </td>
                          <td className="fw-bold text-warning">{group.total_qty}</td>
                          <td className="text-start">
                            {getStatusSummary(group.status_counts, group.total_qty)}
                          </td>
                          <td>
                            <small className="text-muted">
                              {formatDate(group.latest_date)}
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
                  totalItems={groupedProducts.length}
                  paginate={paginateProducts}
                  currentPage={currentProductPage}
                  setCurrentPage={setCurrentProductPage}
                />
              </div>
            </div>
          </Card.Body>
        </Card>
      </Container>

      {/* Modal แสดงรายละเอียดสินค้า */}
      <ProductDetailModal
        show={showProductDetail}
        onHide={() => setShowProductDetail(false)}
        atModel={selectedProductDetail.atModel}
        displaySize={selectedProductDetail.displaySize}
        location={selectedProductDetail.location}
        products={products}
        onSelectForSale={handleSelectProductForSale}
        updateProductInList={updateProductInList} // เพิ่ม prop นี้
      />

      {/* Modal ขายสินค้า */}
      <ProductOutModal
        show={showProductOut}
        onHide={() => {
          setShowProductOut(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
        onSave={handleOutSuccess}
        products={products} // ส่งรายการสินค้าทั้งหมดไปด้วย
      />
    </div>
  );
}

export default ProductList;