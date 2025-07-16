import React, { useState, useRef, useEffect } from "react";
import { Button, Modal, Form, Row, Col, Table, Badge, Card, Alert } from "react-bootstrap";
import { BoxSeam, XCircle, Calendar, PersonFill, FileText, CreditCard, Search, Display, Check, Trash } from "react-bootstrap-icons";
import Swal from "sweetalert2";

function ProductOutModal({ show, onHide, product, onSave, products }) {
  const [validated, setValidated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]); // เปลี่ยนเป็น array
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
  const statusRef = useRef(null); 

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
        setSelectedProducts([]); // รีเซ็ตสินค้าที่เลือก
      } else if (product) {
        setSelectedProducts([product]); // ใส่สินค้าที่ส่งมาใน array
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

  // ฟังก์ชันเลือก/ยกเลิกเลือกสินค้า
  const handleToggleProduct = (product) => {
    setSelectedProducts(prev => {
      const isSelected = prev.find(p => p.AT_SN === product.AT_SN);
      if (isSelected) {
        // ยกเลิกเลือก
        return prev.filter(p => p.AT_SN !== product.AT_SN);
      } else {
        // เลือกเพิ่ม
        return [...prev, product];
      }
    });
  };

  // ฟังก์ชันลบสินค้าที่เลือก
  const handleRemoveSelectedProduct = (productSN) => {
    setSelectedProducts(prev => prev.filter(p => p.AT_SN !== productSN));
  };

  // ฟังก์ชันไปที่หน้าฟอร์ม
  const handleProceedToForm = () => {
    if (selectedProducts.length === 0) {
      Swal.fire({
        position: "center",
        icon: "warning",
        title: "กรุณาเลือกสินค้าที่ต้องการขาย",
        showConfirmButton: true,
      });
      return;
    }
    setShowProductList(false);
  };

  // ฟังก์ชันกลับไปเลือกสินค้าใหม่
  const handleBackToSelection = () => {
    setShowProductList(true);
  };

  // ฟังก์ชันเลือกทั้งหมด
  const handleSelectAll = () => {
    setSelectedProducts([...availableProducts]);
  };

  // ฟังก์ชันยกเลิกเลือกทั้งหมด
  const handleDeselectAll = () => {
    setSelectedProducts([]);
  };

  const handleSubmit = async (event) => {
    const form = event.currentTarget;
    event.preventDefault();
    event.stopPropagation();

    console.log('Form submitted!'); // Debug log
    console.log('Selected Products:', selectedProducts); // Debug log

    if (form.checkValidity() === false || selectedProducts.length === 0) {
      console.log('Form validation failed'); // Debug log
      setValidated(true);
      if (selectedProducts.length === 0) {
        Swal.fire({
          position: "center",
          icon: "warning",
          title: "กรุณาเลือกสินค้าที่ต้องการขาย",
          showConfirmButton: true,
        });
      }
      return;
    }

    if (!statusRef.current?.value) {
      Swal.fire({
        position: "center",
        icon: "warning",
        title: "กรุณาเลือกสถานะสินค้าที่ต้องการขาย",
        showConfirmButton: true,
      });
      return;
    }

    // ยืนยันการขายสินค้าหลายรายการ
    const confirmResult = await Swal.fire({
      title: 'ยืนยันการขายสินค้า',
      text: `คุณต้องการขายสินค้า ${selectedProducts.length} รายการ ใช่หรือไม่?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'ยืนยัน',
      cancelButtonText: 'ยกเลิก'
    });

    if (!confirmResult.isConfirmed) {
      return;
    }

    console.log('Starting sale process...'); // Debug log
    setLoading(true);
    
    try {
      // ตรวจสอบ environment variable
      if (!import.meta.env.VITE_SERVER) {
        throw new Error('VITE_SERVER environment variable is not set');
      }

      let successCount = 0;
      let errorCount = 0;
      const errors = [];

      // ขายสินค้าทีละรายการ
      for (const selectedProduct of selectedProducts) {
        try {
          // รวบรวมข้อมูลจากฟอร์ม
          const outData = {
            product_id: selectedProduct.AT_SN,
            customer: customerRef.current?.value || '',
            quatation_no: qoRef.current?.value || '',
            po_number: poRef.current?.value || '',
            dateout: dateoutRef.current?.value || '',
            note: noteRef.current?.value || '',
            product_status: statusRef.current?.value || ''
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
            successCount++;
            
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
          } else {
            errorCount++;
            errors.push(`${selectedProduct.AT_SN}: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
          }
        } catch (err) {
          errorCount++;
          errors.push(`${selectedProduct.AT_SN}: ${err.message}`);
        }
      }

      // แสดงผลการขาย
      if (successCount > 0 && errorCount === 0) {
        // สำเร็จทั้งหมด
        Swal.fire({
          position: "center",
          icon: "success",
          title: "ขายสินค้าสำเร็จ",
          text: `ขายสินค้า ${successCount} รายการ ให้ ${customerRef.current?.value} แล้ว`,
          showConfirmButton: false,
          timer: 2000,
        });
        
        resetForm();
        onHide();
        onSave(true);
      } else if (successCount > 0 && errorCount > 0) {
        // สำเร็จบางส่วน
        Swal.fire({
          position: "center",
          icon: "warning",
          title: "ขายสินค้าสำเร็จบางส่วน",
          html: `
            <div class="text-left">
              <p>สำเร็จ: ${successCount} รายการ</p>
              <p>ไม่สำเร็จ: ${errorCount} รายการ</p>
              <hr>
              <p><strong>รายการที่ไม่สำเร็จ:</strong></p>
              <ul style="text-align: left;">
                ${errors.map(error => `<li>${error}</li>`).join('')}
              </ul>
            </div>
          `,
          showConfirmButton: true,
        });
        
        if (successCount > 0) {
          onSave(true);
        }
      } else {
        // ไม่สำเร็จทั้งหมด
        Swal.fire({
          position: "center",
          icon: "error",
          title: "ไม่สามารถขายสินค้าได้",
          html: `
            <div class="text-left">
              <p><strong>รายการที่ไม่สำเร็จ:</strong></p>
              <ul style="text-align: left;">
                ${errors.map(error => `<li>${error}</li>`).join('')}
              </ul>
            </div>
          `,
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
    const refs = [customerRef, qoRef, poRef, dateoutRef, noteRef, searchRef, statusRef];
    
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
    setSelectedProducts([]);
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
            {showProductList ? 'เลือกสินค้าที่จะขาย' : `ขายสินค้า - ${selectedProducts.length} รายการ`}
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
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="text-info mb-0">เลือกสินค้าที่ต้องการขาย</h6>
                <div>
                  <Badge bg="info" className="me-2">เลือกแล้ว: {selectedProducts.length}</Badge>
                  <Button
                    variant="outline-success"
                    size="sm"
                    onClick={handleSelectAll}
                    className="me-2"
                  >
                    เลือกทั้งหมด
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={handleDeselectAll}
                  >
                    ยกเลิกทั้งหมด
                  </Button>
                </div>
              </div>
              
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

              {/* แสดงรายการสินค้าที่เลือกแล้ว */}
              {selectedProducts.length > 0 && (
                <Alert variant="info" className="mb-3">
                  <h6>สินค้าที่เลือกแล้ว ({selectedProducts.length} รายการ):</h6>
                  <div className="d-flex flex-wrap gap-2">
                    {selectedProducts.map((product, index) => (
                      <Badge 
                        key={product.AT_SN} 
                        bg="success" 
                        className="d-flex align-items-center gap-1"
                        style={{ fontSize: "0.9rem" }}
                      >
                        {product.AT_Model} ({product.AT_SN})
                        <Button
                          variant="link"
                          size="sm"
                          className="p-0 text-white"
                          onClick={() => handleRemoveSelectedProduct(product.AT_SN)}
                        >
                          <XCircle size={14} />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </Alert>
              )}

              {/* ตารางสินค้า */}
              <div className="table-responsive" style={{ maxHeight: "400px", overflowY: "auto" }}>
                <Table hover className="table-dark">
                  <thead style={{ backgroundColor: "#1e1e1e", position: "sticky", top: 0 }}>
                    <tr>
                      <th>Select</th>
                      <th>AT Model</th>
                      <th>S/N</th>
                      <th>Supplier</th>
                      <th>Size</th>
                      <th>Status</th>
                      <th>Location</th>
                      <th>Date In</th>
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
                      availableProducts.map((prod, index) => {
                        const isSelected = selectedProducts.find(p => p.AT_SN === prod.AT_SN);
                        return (
                          <tr key={prod.id || index} className={isSelected ? "bg-success bg-opacity-25" : ""}>
                            <td>
                              <Button
                                variant={isSelected ? "success" : "outline-success"}
                                size="sm"
                                onClick={() => handleToggleProduct(prod)}
                              >
                                {isSelected ? <Check /> : "เลือก"}
                              </Button>
                            </td>
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
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </Table>
              </div>
            </div>
          ) : selectedProducts.length > 0 ? (
            // แสดงฟอร์มขายสินค้า
            <div>
              {/* แสดงข้อมูลสินค้าที่เลือก */}
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="text-info mb-0">สินค้าที่จะขาย ({selectedProducts.length} รายการ)</h6>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={handleBackToSelection}
                  >
                    เปลี่ยนสินค้า
                  </Button>
                </div>
                
                <div className="row">
                  {selectedProducts.map((product, index) => (
                    <div key={product.AT_SN} className="col-md-6 mb-3">
                      <Card className="bg-secondary text-light">
                        <Card.Body className="p-3">
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <h6 className="text-info mb-1">{product.AT_Model}</h6>
                              <p className="mb-1"><strong>S/N:</strong> {product.AT_SN}</p>
                              <p className="mb-1"><strong>Supplier:</strong> {product.Sup_name}</p>
                              <p className="mb-1"><strong>Size:</strong> {product.displaysize}"</p>
                              <p className="mb-0"><strong>Status:</strong> {getStatusBadge(product.Product_status)}</p>
                            </div>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleRemoveSelectedProduct(product.AT_SN)}
                            >
                              <Trash size={16} />
                            </Button>
                          </div>
                        </Card.Body>
                      </Card>
                    </div>
                  ))}
                </div>
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
                    <FileText className="me-1" />
                    <b>Status *</b>
                  </Form.Label>
                  <Form.Select
                    ref={statusRef}
                    required
                    style={{
                      backgroundColor: "#333",
                      color: "#fff",
                      border: "1px solid #444"
                    }}
                  >
                    <option value="">-- เลือกสถานะ --</option>
                    <option value="borrow">Borrow</option>
                    <option value="out">Out</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    <b>กรุณาเลือกสถานะ</b>
                  </Form.Control.Feedback>
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

                <Form.Group as={Col} md="6" className="mb-3">
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
          
          {showProductList && selectedProducts.length > 0 && (
            <Button
              variant="info"
              onClick={handleProceedToForm}
              style={{
                backgroundColor: "#17a2b8",
                borderColor: "#17a2b8",
                borderRadius: "6px"
              }}
            >
              <BoxSeam className="me-1" size={18} />
              Submit ({selectedProducts.length} รายการ)
            </Button>
          )}
          
          {!showProductList && selectedProducts.length > 0 && (
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
                  ขายสินค้า ({selectedProducts.length} รายการ)
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