import React, { useState, useEffect } from "react";
import { Modal, Button, Table, Badge } from "react-bootstrap";
import { UpcScan, Box, Building, CalendarDate, Printer } from "react-bootstrap-icons";
import { BlobProvider } from '@react-pdf/renderer';
import { SerialLabelPDF } from "./SerialLabelPDF"; // แก้ path ตามโครงสร้างโปรเจคของคุณ

function ItemDetailModal({ show, onHide, partNum, locationName }) {
  const [itemDetails, setItemDetails] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (show && partNum && locationName) {
      fetchItemDetails();
    }
  }, [show, partNum, locationName]);

  const fetchItemDetails = async () => {
    setLoading(true);
    try {
      // API call to fetch detailed items with same part_num and location
      const response = await fetch(
        `${import.meta.env.VITE_SERVER}/Store.php?action=getItemDetails&part_num=${partNum}&location=${locationName}`
      );
      const data = await response.json();
      if (Array.isArray(data)) {
        setItemDetails(data);
      } else {
        setItemDetails([]);
      }
    } catch (error) {
      console.error("Error fetching item details:", error);
      setItemDetails([]);
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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  // เตรียมข้อมูลสำหรับ SerialLabelPDF
  const prepareDataForPDF = (item) => {
    return {
      serial: item.serial_num || 'N/A',
      part_num: item.part_num || partNum,
      part_name: item.part_name || 'Unknown',
      packsize: item.qty || '1',
      supplier: item.supplier || 'N/A',
      brand: item.brand || 'N/A',
      sup_serial: item.sup_serial || '',
      sup_part_number: item.sup_part_number || ''
    };
  };

  return (
    <Modal size="lg" show={show} onHide={onHide} backdrop="static" keyboard={false}>
      <Modal.Header closeButton style={{ backgroundColor: "#2a2a2a", color: "#e0e0e0" }}>
        <Modal.Title>
          <Box className="me-2" size={22} /> Item Details
        </Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ backgroundColor: "#2a2a2a", color: "#e0e0e0" }}>
        {loading ? (
          <div className="text-center p-4">
            <div className="spinner-border text-light" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : itemDetails.length > 0 ? (
          <div className="table-responsive">
            <Table hover className="align-middle table-dark">
              <thead style={{ backgroundColor: "#333333" }}>
                <tr className="text-center">
                  <th>Serial Number</th>
                  <th>Part Name</th>
                  <th>Quantity</th>
                  <th>Supplier</th>
                  <th>Supplier SN</th>
                  <th>Supplier Bar Code</th>
                  <th>Date</th>
                  <th>Note</th>
                  <th>Action</th> {/* เพิ่มคอลัมน์ Action */}
                </tr>
              </thead>
              <tbody>
                {itemDetails.map((item, index) => (
                  <tr key={index} className="text-center">
                    <td>
                      <Badge bg="dark" text="light" style={{ 
                        fontWeight: "medium", 
                        backgroundColor: "#424242",
                        padding: "6px 8px",
                        borderRadius: "4px"
                      }}>
                        <UpcScan className="me-1" size={14} />
                        {item.serial_num || '-'}
                      </Badge>
                    </td>
                    <td className="fw-medium text-white">{item.part_name}</td>
                    <td>
                      <Badge bg="secondary" style={{ 
                        fontWeight: "normal", 
                        backgroundColor: "#555555",
                        padding: "5px 8px",
                        borderRadius: "4px"
                      }}>
                        <Box size={12} className="me-1" />
                        {item.qty}
                      </Badge>
                    </td>
                    <td>
                      <span className="d-inline-flex align-items-center">
                        <Building size={14} className="me-1 text-secondary" />
                        {item.supplier}
                      </span>
                    </td>
                    <td>
                      <Badge bg="dark" text="light" style={{ 
                        fontWeight: "medium", 
                        backgroundColor: "#424242",
                        padding: "6px 8px",
                        borderRadius: "4px"
                      }}>
                        {item.sup_serial || "-"}
                      </Badge>
                    </td>
                    <td><Badge bg="dark" text="light" style={{ 
                        fontWeight: "medium", 
                        backgroundColor: "#424242",
                        padding: "6px 8px",
                        borderRadius: "4px"
                      }}>
                        {item.sup_barcode || "-"}
                      </Badge></td>
                    <td>
                      <small className="text-muted d-flex align-items-center justify-content-center">
                        <CalendarDate size={12} className="me-1" />
                        {formatDate(item.datetime)}
                      </small>
                    </td>
                    <td>{item.note || "-"}</td>
                    <td>
                      {/* ปุ่มพิมพ์ */}
                      <BlobProvider document={<SerialLabelPDF data={prepareDataForPDF(item)} />}>
                        {({ blob, url, loading, error }) => (
                          <Button
                            variant="primary"
                            size="sm"
                            style={{
                              borderRadius: "6px",
                              backgroundColor: "#007bff",
                              borderColor: "#007bff"
                            }}
                            disabled={loading || !!error || !item.serial_num}
                            onClick={() => {
                              if (url) {
                                window.open(url, '_blank');
                              }
                            }}
                          >
                            {loading ? (
                              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            ) : (
                              <Printer size={16} />
                            )}
                          </Button>
                        )}
                      </BlobProvider>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        ) : (
          <div className="text-center p-4">
            <div className="d-flex flex-column align-items-center">
              <Box size={40} className="mb-2 text-muted" />
              <span className="fw-medium">No detailed data found</span>
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

export default ItemDetailModal;