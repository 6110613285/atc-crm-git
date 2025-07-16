import React, { useState, useEffect } from "react";
import { Modal, Button, Table, Badge, Row, Col, Card, Spinner } from "react-bootstrap";
import { 
  Display, Calendar, PersonFill, FileText, Cpu, Hdd, 
  XCircle, Wifi, UsbSymbol, HddStack, Monitor, 
  PersonCheckFill, CreditCard, TelephoneFill, GeoAltFill 
} from "react-bootstrap-icons";

function ProductSerialDetailModal({ show, onHide, serialNumber }) {
  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (show && serialNumber) {
      fetchProductDetails();
    }
  }, [show, serialNumber]);

  const fetchProductDetails = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SERVER}/Store.php?action=getProductBySerial&serial=${encodeURIComponent(serialNumber)}`
      );
      const data = await response.json();
      
      if (data && !data.status) {
        setProductData(data);
      } else {
        setError(data.message || 'ไม่พบข้อมูลสินค้า');
        setProductData(null);
      }
    } catch (error) {
      console.error("Error fetching product details:", error);
      setError('เกิดข้อผิดพลาดในการดึงข้อมูล');
      setProductData(null);
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
    const statusConfig = {
      'OK': { bg: 'success', text: 'OK' },
      'NG': { bg: 'danger', text: 'NG' },
      'ขายแล้ว': { bg: 'warning', text: 'ขายแล้ว' },
      'Demo': { bg: 'info', text: 'Demo' },
      'ยืม': { bg: 'secondary', text: 'ยืม' }
    };
    
    const config = statusConfig[status] || { bg: 'secondary', text: status || 'Unknown' };
    
    return (
      <Badge bg={config.bg} style={{
        fontWeight: "500",
        padding: "8px 12px",
        borderRadius: "6px",
        fontSize: "0.9rem"
      }}>
        {config.text}
      </Badge>
    );
  };

  const renderValue = (value) => {
    return value || '-';
  };

  const renderConnectivityInfo = (product) => {
    const connections = [];
    
    if (product.HDMI > 0) connections.push(`HDMI: ${product.HDMI}`);
    if (product.VGA > 0) connections.push(`VGA: ${product.VGA}`);
    if (product.DVI > 0) connections.push(`DVI: ${product.DVI}`);
    if (product.DisplayPort > 0) connections.push(`DisplayPort: ${product.DisplayPort}`);
    if (product['USB2.0'] > 0) connections.push(`USB 2.0: ${product['USB2.0']}`);
    if (product['USB3.0'] > 0) connections.push(`USB 3.0: ${product['USB3.0']}`);
    if (product.LAN > 0) connections.push(`LAN: ${product.LAN}`);
    if (product.Speaker > 0) connections.push(`Speaker: ${product.Speaker}`);
    if (product.Headphone > 0) connections.push(`Headphone: ${product.Headphone}`);
    if (product.RS232 > 0) connections.push(`RS232: ${product.RS232}`);
    if (product.RS485 > 0) connections.push(`RS485: ${product.RS485}`);

    return connections.length > 0 ? connections.join(', ') : 'ไม่มีข้อมูล';
  };

  return (
    <Modal 
      size="xl" 
      show={show} 
      onHide={onHide} 
      backdrop="static" 
      keyboard={false}
      contentClassName="bg-dark text-light border-secondary"
    >
      <Modal.Header style={{ backgroundColor: "#2a2a2a", color: "#e0e0e0", borderBottom: "1px solid #444" }}>
        <Modal.Title>
          <Display className="me-2" size={22} /> 
          Product Details: {serialNumber}
        </Modal.Title>
        <Button
          variant="link"
          onClick={onHide}
          className="text-light p-0 border-0"
          style={{ fontSize: "1.5rem" }}
        >
          <XCircle />
        </Button>
      </Modal.Header>
      
      <Modal.Body style={{ backgroundColor: "#2a2a2a", color: "#e0e0e0" }}>
        {loading ? (
          <div className="text-center p-4">
            <Spinner animation="border" variant="light" />
            <p className="mt-2">กำลังโหลดข้อมูล...</p>
          </div>
        ) : error ? (
          <div className="text-center p-4">
            <XCircle size={40} className="mb-2 text-danger" />
            <p className="text-danger">{error}</p>
          </div>
        ) : productData ? (
          <div>
            {/* ข้อมูลพื้นฐาน */}
            <Card className="mb-4" style={{ backgroundColor: "#333333", border: "1px solid #444444" }}>
              <Card.Header style={{ backgroundColor: "#444444", color: "#e0e0e0" }}>
                <Display className="me-2" size={16} />
                ข้อมูลพื้นฐาน
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <Table borderless className="text-light mb-0">
                      <tbody>
                        <tr>
                          <td width="40%" className="fw-bold">วันที่รับเข้า:</td>
                          <td>
                            <Calendar size={14} className="me-1 text-secondary" />
                            {formatDate(productData.Datein)}
                          </td>
                        </tr>
                        <tr>
                          <td className="fw-bold">AT Model:</td>
                          <td className="text-success fw-bold">{renderValue(productData.AT_Model)}</td>
                        </tr>
                        <tr>
                          <td className="fw-bold">AT Serial Number:</td>
                          <td>
                            <Badge bg="dark" style={{ fontFamily: "monospace", fontSize: "0.9rem" }}>
                              {renderValue(productData.AT_SN)}
                            </Badge>
                          </td>
                        </tr>
                        <tr>
                          <td className="fw-bold">Supplier:</td>
                          <td>{renderValue(productData.Sup_name)}</td>
                        </tr>
                        <tr>
                          <td className="fw-bold">Supplier Model:</td>
                          <td>{renderValue(productData.Supplier_Model)}</td>
                        </tr>
                        <tr>
                          <td className="fw-bold">Supplier S/N:</td>
                          <td>{renderValue(productData.Supplier_SN)}</td>
                        </tr>
                      </tbody>
                    </Table>
                  </Col>
                  <Col md={6}>
                    <Table borderless className="text-light mb-0">
                      <tbody>
                        <tr>
                          <td width="40%" className="fw-bold">สถานะ:</td>
                          <td>{getStatusBadge(productData.Product_status)}</td>
                        </tr>
                        <tr>
                          <td className="fw-bold">ขนาดจอ:</td>
                          <td>
                            <Monitor size={14} className="me-1 text-info" />
                            {renderValue(productData.displaysize)}"
                          </td>
                        </tr>
                        <tr>
                          <td className="fw-bold">Touch Type:</td>
                          <td>{renderValue(productData.touchtype)}</td>
                        </tr>
                        <tr>
                          <td className="fw-bold">Location:</td>
                          <td>
                            <GeoAltFill size={14} className="me-1 text-warning" />
                            {renderValue(productData.location)}
                          </td>
                        </tr>
                        <tr>
                          <td className="fw-bold">CPU:</td>
                          <td>
                            <Cpu size={14} className="me-1 text-info" />
                            {renderValue(productData.CPU)}
                          </td>
                        </tr>
                        <tr>
                          <td className="fw-bold">RAM:</td>
                          <td>{renderValue(productData.Ram)}</td>
                        </tr>
                      </tbody>
                    </Table>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* ข้อมูลระบบ */}
            <Card className="mb-4" style={{ backgroundColor: "#333333", border: "1px solid #444444" }}>
              <Card.Header style={{ backgroundColor: "#444444", color: "#e0e0e0" }}>
                <HddStack className="me-2" size={16} />
                ข้อมูลระบบ
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <Table borderless className="text-light mb-0">
                      <tbody>
                        <tr>
                          <td width="40%" className="fw-bold">ระบบปฏิบัติการ:</td>
                          <td>{renderValue(productData.OS_TYPE)}</td>
                        </tr>
                        <tr>
                          <td className="fw-bold">Windows License:</td>
                          <td>{renderValue(productData.Windows_license)}</td>
                        </tr>
                        <tr>
                          <td className="fw-bold">SSD/HDD:</td>
                          <td>
                            <Hdd size={14} className="me-1 text-warning" />
                            {renderValue(productData['SSD/HDD'])}
                          </td>
                        </tr>
                      </tbody>
                    </Table>
                  </Col>
                  <Col md={6}>
                    <Table borderless className="text-light mb-0">
                      <tbody>
                        <tr>
                          <td width="40%" className="fw-bold">SSD Serial Number:</td>
                          <td>{renderValue(productData.SSD_SN)}</td>
                        </tr>
                        <tr>
                          <td className="fw-bold">WiFi:</td>
                          <td>
                            {productData.WIFI ? (
                              <span>
                                <Wifi size={14} className="me-1 text-success" />
                                Yes {productData.WIFIBRAND && `(${productData.WIFIBRAND})`}
                              </span>
                            ) : 'No'}
                          </td>
                        </tr>
                        <tr>
                          <td className="fw-bold">WiFi Model:</td>
                          <td>{renderValue(productData.WIFIMODEL)}</td>
                        </tr>
                      </tbody>
                    </Table>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* ข้อมูลการเชื่อมต่อ */}
            <Card className="mb-4" style={{ backgroundColor: "#333333", border: "1px solid #444444" }}>
              <Card.Header style={{ backgroundColor: "#444444", color: "#e0e0e0" }}>
                <UsbSymbol className="me-2" size={16} />
                ข้อมูลการเชื่อมต่อ
              </Card.Header>
              <Card.Body>
                <p className="mb-0">{renderConnectivityInfo(productData)}</p>
              </Card.Body>
            </Card>

            {/* ข้อมูลลูกค้า (ถ้ามี) */}
            {(productData.Customer || productData.Quatation_No || productData.PO_number) && (
              <Card className="mb-4" style={{ backgroundColor: "#333333", border: "1px solid #444444" }}>
                <Card.Header style={{ backgroundColor: "#444444", color: "#e0e0e0" }}>
                  <PersonCheckFill className="me-2" size={16} />
                  ข้อมูลลูกค้า
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <Table borderless className="text-light mb-0">
                        <tbody>
                          <tr>
                            <td width="40%" className="fw-bold">ลูกค้า:</td>
                            <td>
                              {productData.Customer ? (
                                <span>
                                  <PersonFill size={14} className="me-1 text-success" />
                                  {productData.Customer}
                                </span>
                              ) : '-'}
                            </td>
                          </tr>
                          <tr>
                            <td className="fw-bold">วันที่ส่งออก:</td>
                            <td>
                              {productData.Dateout ? (
                                <span>
                                  <Calendar size={14} className="me-1 text-secondary" />
                                  {formatDate(productData.Dateout)}
                                </span>
                              ) : '-'}
                            </td>
                          </tr>
                        </tbody>
                      </Table>
                    </Col>
                    <Col md={6}>
                      <Table borderless className="text-light mb-0">
                        <tbody>
                          <tr>
                            <td width="40%" className="fw-bold">QO Number:</td>
                            <td>
                              {productData.Quatation_No ? (
                                <Badge bg="info" style={{ fontSize: '0.8rem' }}>
                                  {productData.Quatation_No}
                                </Badge>
                              ) : '-'}
                            </td>
                          </tr>
                          <tr>
                            <td className="fw-bold">PO Number:</td>
                            <td>
                              {productData.PO_number ? (
                                <Badge bg="success" style={{ fontSize: '0.8rem' }}>
                                  {productData.PO_number}
                                </Badge>
                              ) : '-'}
                            </td>
                          </tr>
                        </tbody>
                      </Table>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            )}

            {/* หมายเหตุ */}
            {productData.Note && (
              <Card style={{ backgroundColor: "#333333", border: "1px solid #444444" }}>
                <Card.Header style={{ backgroundColor: "#444444", color: "#e0e0e0" }}>
                  <FileText className="me-2" size={16} />
                  หมายเหตุ
                </Card.Header>
                <Card.Body>
                  <pre className="text-light mb-0" style={{ whiteSpace: "pre-wrap" }}>
                    {productData.Note}
                  </pre>
                </Card.Body>
              </Card>
            )}
          </div>
        ) : (
          <div className="text-center p-4">
            <Display size={40} className="mb-2 text-muted" />
            <span className="fw-medium">ไม่พบข้อมูลสินค้า</span>
          </div>
        )}
      </Modal.Body>
      
      <Modal.Footer style={{ backgroundColor: "#2a2a2a", color: "#e0e0e0", borderTop: "1px solid #444" }}>
        <Button variant="secondary" onClick={onHide}>
          ปิด
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ProductSerialDetailModal;