import React, { useState, useRef, useEffect } from "react";
import { Button, Modal, Form, Row, Col, Table, Badge } from "react-bootstrap";
import { BoxSeam, XCircle, Calendar, PersonFill, FileText, CreditCard, Search, Display } from "react-bootstrap-icons";
import Swal from "sweetalert2";

function ProductOutModal({ show, onHide, product, onSave, products }) {
  const [validated, setValidated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(product);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showProductList, setShowProductList] = useState(!product);

  // Form refs
  const customerRef = useRef(null);
  const qoRef = useRef(null);
  const poRef = useRef(null);
  const dateoutRef = useRef(null);
  const noteRef = useRef(null);
  const searchRef = useRef(null);

  // ตั้งค่าวันที่ปัจจุบันและดึงสินค้าที่สามารถขายได้เมื่อเปิด Modal
  useEffect(() => {
    if (show) {
      const today = new Date().toISOString().split('T')[0];
      if (dateoutRef.current) {
        dateoutRef.current.value = today;
      }
      
      // ถ้าไม่มีสินค้าที่เลือกไว้ ให้แสดงรายการสินค้าที่สามารถขายได้
      if (!product && products) {
        const sellableProducts = products.filter(p => 
          p.Product_status !== 'ขายแล้ว' && 
          p.Product_status !== 'ซ่อม'
        );
        setAvailableProducts(sellableProducts);
        setShowProductList(true);
      } else {
        setSelectedProduct(product);
        setShowProductList(false);
      }
      
      // Reset form validation
      setValidated(false);
    }
  }, [show, product, products]);

  // ฟังก์ชันค้นหาสินค้า
  const handleSearch = () => {
    const term = searchRef.current?.value.toLowerCase() || '';
    setSearchTerm(term);
    
    if (!term) {
      const sellableProducts = products.filter(p => 
        p.Product_status !== 'ขายแล้ว' && 
        p.Product_status !== 'ซ่อม'
      );
      setAvailableProducts(sellableProducts);
      return;
    }

    const filtered = products.filter(p => 
      (p.Product_status !== 'ขายแล้ว' && p.Product_status !== 'ซ่อม') &&
      (p.AT_Model?.toLowerCase().includes(term) ||
       p.AT_SN?.toLowerCase().includes(term) ||
       p.Sup_name?.toLowerCase().includes(term) ||
       p.CPU?.toLowerCase().includes(term) ||
       p.location?.toLowerCase().includes(term))
    );
    setAvailableProducts(filtered);
  };

  // ฟังก์ชันเลือกสินค้า
  const handleSelectProduct = (selectedProd) => {
    setSelectedProduct(selectedProd);
    setShowProductList(false);
  };

  // ฟังก์ชันกลับไปเลือกสินค้าใหม่
  const handleBackToSelection = () => {
    setSelectedProduct(null);
    setShowProductList(true);
  };

  const handleSubmit = async (event) => {
    const form = event.currentTarget;
    event.preventDefault();
    event.stopPropagation();

    console.log('Form submitted!'); // Debug log
    console.log('Selected Product:', selectedProduct); // Debug log

    if (form.checkValidity() === false || !selectedProduct) {
      console.log('Form validation failed'); // Debug log
      setValidated(true);
      if (!selectedProduct) {
        Swal.fire({
          position: "center",
          icon: "warning",
          title: "กรุณาเลือกสินค้าที่ต้องการขาย",
          showConfirmButton: true,
        });
      }
      return;
    }

    console.log('Starting sale process...'); // Debug log
    setLoading(true);
    
    try {
      // ตรวจสอบ environment variable
      if (!import.meta.env.VITE_SERVER) {
        throw new Error('VITE_SERVER environment variable is not set');
      }

      // รวบรวมข้อมูลจากฟอร์ม
      const outData = {
        product_id: selectedProduct.AT_SN,
        customer: customerRef.current?.value || '',
        quatation_no: qoRef.current?.value || '',
        po_number: poRef.current?.value || '',
        dateout: dateoutRef.current?.value || '',
        note: noteRef.current?.value || '',
        product_status: 'ขายแล้ว'
      };

      console.log('OUT Data:', outData);

      // สร้าง query string
      const queryParams = new URLSearchParams(outData).toString();
      console.log('Query params:', queryParams); // Debug log
      
      const url = `${import.meta.env.VITE_SERVER}/Store.php?action=outProduct&${queryParams}`;
      console.log('Request URL:', url); // Debug log
      
      const res = await fetch(url, {
        method: "POST",
      });
      
      const responseText = await res.text();
      console.log('Raw response:', responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.error('Response text:', responseText);
        
        // ถ้า response เป็น "ok" ให้ถือว่าสำเร็จ
        if (responseText.trim() === '"ok"' || responseText.trim() === 'ok') {
          data = "ok";
        } else {
          throw new Error('Invalid JSON response');
        }
      }
      
      if (data === "ok" || (data && data.status === "success")) {
        // เพิ่ม log การขายสินค้า
        try {
          const logParams = new URLSearchParams({
            action: 'addPcLog',
            atc_modal: selectedProduct.AT_Model,
            sn: selectedProduct.AT_SN,
            status: 'OUT',
            date: outData.dateout,
            user: 'System' // หรือใช้ชื่อผู้ใช้จริง
          });

          await fetch(
            `${import.meta.env.VITE_SERVER}/Store.php?${logParams}`,
            { method: "POST" }
          );
        } catch (logError) {
          console.error('Error adding log:', logError);
          // ไม่แสดง error เพราะการขายสำเร็จแล้ว แค่ log ไม่ได้
        }

        Swal.fire({
          position: "center",
          icon: "success",
          title: "ขายสินค้าสำเร็จ",
          text: `${selectedProduct.AT_SN} ขายให้ ${outData.customer} แล้ว`,
          showConfirmButton: false,
          timer: 2000,
        });
        
        resetForm();
        onHide();
        onSave(true);
      } else {
        console.log('Error response:', data);
        Swal.fire({
          position: "center",
          icon: "error",
          title: "ไม่สามารถขายสินค้าได้",
          text: typeof data === 'string' ? data : JSON.stringify(data),
          showConfirmButton: true,
        });
      }
    } catch (err) {
      console.error('OUT product error:', err);
      Swal.fire({
        position: "center",
        icon: "error",
        title: "เกิดข้อผิดพลาด!",
        text: err.message,
        showConfirmButton: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    const refs = [customerRef, qoRef, poRef, dateoutRef, noteRef, searchRef];
    
    refs.forEach(ref => {
      if (ref.current) {
        ref.current.value = '';
      }
    });
    
    // ตั้งค่าวันที่ปัจจุบันใหม่
    const today = new Date().toISOString().split('T')[0];
    if (dateoutRef.current) {
      dateoutRef.current.value = today;
    }
    
    setValidated(false);
    setSelectedProduct(null);
    setShowProductList(!product);
    setSearchTerm('');
  };

  const handleClose = () => {
    resetForm();
    onHide();
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'OK':
        return <Badge bg="success">OK</Badge>;
      case 'NG':
        return <Badge bg="danger">NG</Badge>;
      case 'พร้อมขาย':
        return <Badge bg="info">พร้อมขาย</Badge>;
      case 'Demo':
        return <Badge bg="warning">Demo</Badge>;
      default:
        return <Badge bg="secondary">{status || 'Unknown'}</Badge>;
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

  return (
    <Modal
      show={show}
      onHide={handleClose}
      size="xl"
      backdrop="static"
      keyboard={false}
      centered
      contentClassName="bg-dark text-light border-secondary"
    >
      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Modal.Header
          style={{ borderBottom: "1px solid #444" }}
          className="bg-dark text-light"
        >
          <Modal.Title>
            <BoxSeam className="me-2 text-warning" />
            {selectedProduct ? `ขายสินค้า - ${selectedProduct.AT_Model}` : 'เลือกสินค้าที่จะขาย'}
          </Modal.Title>
          <Button
            variant="link"
            onClick={handleClose}
            className="text-light p-0 border-0"
            style={{ fontSize: "1.5rem" }}
          >
            <XCircle />
          </Button>
        </Modal.Header>
        
        <Modal.Body className="bg-dark text-light">
          {showProductList ? (
            // แสดงรายการสินค้าให้เลือก
            <div>
              <h6 className="text-info mb-3">เลือกสินค้าที่ต้องการขาย</h6>
              
              {/* ช่องค้นหา */}
              <div className="mb-3">
                <div className="position-relative">
                  <Form.Control
                    type="text"
                    placeholder="ค้นหาสินค้า (AT Model, S/N, Supplier, CPU, Location...)"
                    ref={searchRef}
                    onChange={handleSearch}
                    style={{
                      backgroundColor: "#333",
                      color: "#fff",
                      border: "1px solid #444",
                      paddingLeft: "35px"
                    }}
                  />
                  <Search className="position-absolute" style={{
                    left: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#999"
                  }} size={16} />
                </div>
              </div>

              {/* ตารางสินค้า */}
              <div className="table-responsive" style={{ maxHeight: "400px", overflowY: "auto" }}>
                <Table hover className="table-dark">
                  <thead style={{ backgroundColor: "#1e1e1e", position: "sticky", top: 0 }}>
                    <tr>
                      <th>AT Model</th>
                      <th>S/N</th>
                      <th>Supplier</th>
                      <th>Size</th>
                      <th>Status</th>
                      <th>Location</th>
                      <th>Date In</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {availableProducts.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-3">
                          <Display size={30} className="mb-2 text-muted" />
                          <div>ไม่พบสินค้าที่สามารถขายได้</div>
                        </td>
                      </tr>
                    ) : (
                      availableProducts.map((prod, index) => (
                        <tr key={prod.id || index}>
                          <td className="fw-bold text-info">{prod.AT_Model}</td>
                          <td>
                            <Badge bg="dark" style={{ fontFamily: "monospace" }}>
                              {prod.AT_SN}
                            </Badge>
                          </td>
                          <td>{prod.Sup_name}</td>
                          <td>{prod.displaysize}"</td>
                          <td>{getStatusBadge(prod.Product_status)}</td>
                          <td>
                            <Badge bg="secondary">{prod.location}</Badge>
                          </td>
                          <td>{formatDate(prod.Datein)}</td>
                          <td>
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => handleSelectProduct(prod)}
                            >
                              เลือก
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>
            </div>
          ) : selectedProduct ? (
            // แสดงฟอร์มขายสินค้า
            <div>
              {/* แสดงข้อมูลสินค้าที่เลือก */}
              <div className="mb-4 p-3 rounded" style={{ backgroundColor: "#333", border: "1px solid #555" }}>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="text-info mb-0">ข้อมูลสินค้าที่จะขาย</h6>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={handleBackToSelection}
                  >
                    เปลี่ยนสินค้า
                  </Button>
                </div>
                <Row>
                  <Col md={6}>
                    <p className="mb-1"><strong>AT Model:</strong> {selectedProduct.AT_Model}</p>
                    <p className="mb-1"><strong>AT S/N:</strong> {selectedProduct.AT_SN}</p>
                    <p className="mb-1"><strong>Supplier:</strong> {selectedProduct.Sup_name}</p>
                  </Col>
                  <Col md={6}>
                    <p className="mb-1"><strong>Display Size:</strong> {selectedProduct.displaysize}"</p>
                    <p className="mb-1"><strong>CPU:</strong> {selectedProduct.CPU || '-'}</p>
                    <p className="mb-1"><strong>Status:</strong> {getStatusBadge(selectedProduct.Product_status)}</p>
                  </Col>
                </Row>
              </div>

              {/* ฟอร์มกรอกข้อมูลการขาย */}
              <Row className="mb-3">
                <Form.Group as={Col} md="12" className="mb-3">
                  <Form.Label>
                    <PersonFill className="me-1" />
                    <b>ลูกค้า (ขายให้ใคร) *</b>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    ref={customerRef}
                    required
                    placeholder="ระบุชื่อลูกค้าหรือบริษัท"
                    style={{
                      backgroundColor: "#333",
                      color: "#fff",
                      border: "1px solid #444"
                    }}
                  />
                  <Form.Control.Feedback type="invalid">
                    <b>กรุณาระบุชื่อลูกค้า</b>
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group as={Col} md="6" className="mb-3">
                  <Form.Label>
                    <FileText className="me-1" />
                    <b>QO Number</b>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    ref={qoRef}
                    placeholder="เลขที่ใบเสนอราคา"
                    style={{
                      backgroundColor: "#333",
                      color: "#fff",
                      border: "1px solid #444"
                    }}
                  />
                </Form.Group>

                <Form.Group as={Col} md="6" className="mb-3">
                  <Form.Label>
                    <CreditCard className="me-1" />
                    <b>PO Number</b>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    ref={poRef}
                    placeholder="เลขที่ใบสั่งซื้อ"
                    style={{
                      backgroundColor: "#333",
                      color: "#fff",
                      border: "1px solid #444"
                    }}
                  />
                </Form.Group>

                <Form.Group as={Col} md="12" className="mb-3">
                  <Form.Label>
                    <Calendar className="me-1" />
                    <b>วันที่ส่งสินค้า *</b>
                  </Form.Label>
                  <Form.Control
                    type="date"
                    ref={dateoutRef}
                    required
                    style={{
                      backgroundColor: "#333",
                      color: "#fff",
                      border: "1px solid #444"
                    }}
                  />
                  <Form.Control.Feedback type="invalid">
                    <b>กรุณาเลือกวันที่ส่งสินค้า</b>
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group as={Col} md="12" className="mb-3">
                  <Form.Label>
                    <FileText className="me-1" />
                    <b>หมายเหตุ</b>
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    ref={noteRef}
                    placeholder="หมายเหตุเพิ่มเติม (ถ้ามี)"
                    style={{
                      backgroundColor: "#333",
                      color: "#fff",
                      border: "1px solid #444"
                    }}
                  />
                </Form.Group>
              </Row>
            </div>
          ) : null}
        </Modal.Body>
        
        <Modal.Footer className="bg-dark text-light" style={{ borderTop: "1px solid #444" }}>
          <Button
            variant="secondary"
            onClick={handleClose}
            disabled={loading}
            style={{
              backgroundColor: "#555",
              borderColor: "#555",
              borderRadius: "6px"
            }}
          >
            <XCircle className="me-1" size={18} /> ยกเลิก
          </Button>
          {selectedProduct && !showProductList && (
            <Button
              variant="warning"
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
              style={{
                backgroundColor: "#f39c12",
                borderColor: "#f39c12",
                borderRadius: "6px",
                color: "#000"
              }}
            >
              {loading ? (
                "กำลังดำเนินการ..."
              ) : (
                <>
                  <BoxSeam className="me-1" size={18} />
                  ขายสินค้า
                </>
              )}
            </Button>
          )}
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default ProductOutModal;