import React, { useState, useEffect } from "react";
import { Modal, Button, Table, Badge, Row, Col, Card } from "react-bootstrap";
import { Display, Calendar, PersonFill, FileText, Cpu, Hdd, Trash, Pencil } from "react-bootstrap-icons";

function ProductDetailModal({ show, onHide, atModel, displaySize, products }) {
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (show && atModel && displaySize && products) {
      filterProductDetails();
    }
  }, [show, atModel, displaySize, products]);

  const filterProductDetails = () => {
    setLoading(true);
    try {
      // กรองสินค้าที่มี AT Model และขนาดจอเหมือนกัน
      const filtered = products.filter(product => 
        product.AT_Model === atModel && 
        product.displaysize === displaySize
      );
      
      setFilteredProducts(filtered);
    } catch (error) {
      console.error("Error filtering product details:", error);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
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

  const getStatusBadge = (status) => {
    switch(status) {
      case 'OK':
        return <Badge bg="success">OK</Badge>;
      case 'NG':
        return <Badge bg="danger">NG</Badge>;
      case 'ยืม':
        return <Badge bg="warning">ยืม</Badge>;
      default:
        return <Badge bg="secondary">{status || 'Unknown'}</Badge>;
    }
  };

  const deleteProduct = async (productId) => {
    if (window.confirm("คุณต้องการลบสินค้านี้หรือไม่?")) {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_SERVER}/Store.php?action=deleteProduct&product_id=${productId}`,
          { method: "DELETE" }
        );
        const data = await res.json();
        if (data.status === "success") {
          alert("ลบข้อมูลสำเร็จ");
          // รีเฟรชข้อมูลหลังลบ
          filterProductDetails();
        } else {
          alert("ไม่สามารถลบข้อมูลได้: " + data.message);
        }
      } catch (err) {
        console.log(err);
        alert("เกิดข้อผิดพลาดในการลบข้อมูล");
      }
    }
  };

  return (
    <Modal size="xl" show={show} onHide={onHide} backdrop="static" keyboard={false}>
      <Modal.Header closeButton style={{ backgroundColor: "#2a2a2a", color: "#e0e0e0" }}>
        <Modal.Title>
          <Display className="me-2" size={22} /> 
          Product Details: {atModel} ({displaySize}")
        </Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ backgroundColor: "#2a2a2a", color: "#e0e0e0" }}>
        {loading ? (
          <div className="text-center p-4">
            <div className="spinner-border text-light" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div>
            {/* สรุปข้อมูลรวม */}
            <Row className="mb-4">
              <Col md={12}>
                <Card style={{ backgroundColor: "#333333", border: "1px solid #444444" }}>
                  <Card.Body>
                    <Row>
                      <Col md={3}>
                        <div className="text-center">
                          <h5 className="text-warning mb-1">{filteredProducts.length}</h5>
                          <small className="text-muted">Total Items</small>
                        </div>
                      </Col>
                      <Col md={3}>
                        <div className="text-center">
                          <h5 className="text-success mb-1">
                            {filteredProducts.filter(p => p.Product_status === 'OK').length}
                          </h5>
                          <small className="text-muted">OK Status</small>
                        </div>
                      </Col>
                      <Col md={3}>
                        <div className="text-center">
                          <h5 className="text-danger mb-1">
                            {filteredProducts.filter(p => p.Product_status === 'NG').length}
                          </h5>
                          <small className="text-muted">NG Status</small>
                        </div>
                      </Col>
                      <Col md={3}>
                        <div className="text-center">
                          <h5 className="text-info mb-1">
                            {filteredProducts.filter(p => p.Product_status === 'ยืม').length}
                          </h5>
                          <small className="text-muted">With Customer</small>
                        </div>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* ตารางรายละเอียด */}
            <div className="table-responsive">
              <Table hover className="align-middle table-dark">
                <thead style={{ backgroundColor: "#1e1e1e" }}>
                  <tr className="text-center">
                    <th className="py-3">No.</th>
                    <th className="py-3">Date In</th>
                    <th className="py-3">AT S/N</th>
                    <th className="py-3">Supplier</th>
                    <th className="py-3">Supplier Model</th>
                    <th className="py-3">Supplier S/N</th>
                    <th className="py-3">CPU</th>
                    <th className="py-3">RAM</th>
                    <th className="py-3">Storage</th>
                    <th className="py-3">OS</th>
                    <th className="py-3">Status</th>
                    <th className="py-3">Customer</th>
                    <th className="py-3">PO Number</th>
                    <th className="py-3">Location</th>
                    <th className="py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product, index) => (
                    <tr key={product.id || index} className="text-center">
                      <td>{index + 1}</td>
                      <td>
                        <div className="d-flex align-items-center justify-content-center">
                          <Calendar size={12} className="me-1 text-secondary" />
                          <small>{formatDate(product.Datein)}</small>
                        </div>
                      </td>
                      <td>
                        <Badge bg="dark" style={{
                          backgroundColor: "#424242",
                          padding: "5px 8px",
                          borderRadius: "4px",
                          fontFamily: "monospace"
                        }}>
                          {product.AT_SN || '-'}
                        </Badge>
                      </td>
                      <td>{product.Sup_name || '-'}</td>
                      <td>{product.Supplier_model || '-'}</td>
                      <td>
                        <Badge bg="secondary" style={{
                          backgroundColor: "#6c757d",
                          padding: "4px 6px",
                          borderRadius: "3px",
                          fontSize: "0.75rem"
                        }}>
                          {product.Supplier_SN || '-'}
                        </Badge>
                      </td>
                      <td>
                        <div className="d-flex align-items-center justify-content-center">
                          <Cpu size={12} className="me-1 text-info" />
                          <small>{product.CPU || '-'}</small>
                        </div>
                      </td>
                      <td>{product.Ram || '-'}</td>
                      <td>
                        <div className="d-flex align-items-center justify-content-center">
                          <Hdd size={12} className="me-1 text-warning" />
                          <small>{product['SSD/HDD'] || '-'}</small>
                        </div>
                      </td>
                      <td>{product.OS_type || '-'}</td>
                      <td>{getStatusBadge(product.Product_status)}</td>
                      <td>
                        {product.Customer ? (
                          <div className="d-flex align-items-center justify-content-center">
                            <PersonFill size={12} className="me-1 text-success" />
                            <small>{product.Customer}</small>
                          </div>
                        ) : '-'}
                      </td>
                      <td>
                        {product.PO_number ? (
                          <Badge bg="info" style={{ fontSize: '0.75rem' }}>
                            {product.PO_number}
                          </Badge>
                        ) : '-'}
                      </td>
                      <td>{product.location || '-'}</td>
                      <td>
                        <div className="d-flex justify-content-center gap-1">
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => deleteProduct(product.id)}
                            style={{
                              borderRadius: "4px",
                              padding: "4px 8px"
                            }}
                          >
                            <Trash size={14} />
                          </Button>
                          <Button
                            variant="warning"
                            size="sm"
                            style={{
                              borderRadius: "4px",
                              padding: "4px 8px"
                            }}
                          >
                            <Pencil size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>

            {/* ข้อมูลเพิ่มเติม */}
            <Row className="mt-4">
              <Col md={12}>
                <Card style={{ backgroundColor: "#333333", border: "1px solid #444444" }}>
                  <Card.Header style={{ backgroundColor: "#444444", color: "#e0e0e0" }}>
                    <FileText className="me-2" size={16} />
                    Additional Information
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={6}>
                        <h6 className="text-info mb-2">Hardware Specifications</h6>
                        <ul className="list-unstyled small">
                          <li><strong>Display Size:</strong> {displaySize}"</li>
                          <li><strong>Touch Type:</strong> {filteredProducts[0]?.touchtype || 'Not specified'}</li>
                          <li><strong>HDMI Ports:</strong> {filteredProducts[0]?.HDMI || 0}</li>
                          <li><strong>USB 2.0 Ports:</strong> {filteredProducts[0]?.['USB2.0'] || 0}</li>
                          <li><strong>USB 3.0 Ports:</strong> {filteredProducts[0]?.['USB3.0'] || 0}</li>
                        </ul>
                      </Col>
                      <Col md={6}>
                        <h6 className="text-warning mb-2">Connectivity</h6>
                        <ul className="list-unstyled small">
                          <li><strong>WiFi:</strong> {filteredProducts[0]?.WIFI ? 'Yes' : 'No'}</li>
                          <li><strong>LAN Ports:</strong> {filteredProducts[0]?.LAN || 0}</li>
                          <li><strong>RS232:</strong> {filteredProducts[0]?.RS232 || 0}</li>
                          <li><strong>RS485:</strong> {filteredProducts[0]?.RS485 || 0}</li>
                        </ul>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </div>
        ) : (
          <div className="text-center p-4">
            <div className="d-flex flex-column align-items-center">
              <Display size={40} className="mb-2 text-muted" />
              <span className="fw-medium">No product details found</span>
            </div>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer style={{ backgroundColor: "#2a2a2a", color: "#e0e0e0" }}>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ProductDetailModal;