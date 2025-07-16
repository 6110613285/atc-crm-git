import React, { useState, useEffect } from "react";
import { Modal, Table, Button, Badge, Spinner } from "react-bootstrap";
import { CalendarDate, Pencil } from "react-bootstrap-icons";
import Swal from "sweetalert2";

function FixlistModal({ show, onHide, fixID }) {
  const userLevel = localStorage.getItem("level");
  const [fixDetails, setFixDetails] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (show && fixID) {
      fetchFixDetails();
    }
  }, [show, fixID]);

  const fetchFixDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SERVER}/Store.php?action=fixlistmodal&fixID=${fixID}`
      );
      const data = await response.json();
      if (Array.isArray(data)) {
        setFixDetails(data);
      } else {
        setFixDetails([]);
      }
    } catch (error) {
      console.error("Error fetching fix details:", error);
      setFixDetails([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="xl"
      centered
      contentClassName="bg-dark text-light border-secondary"
    >
      <Modal.Header closeButton style={{ backgroundColor: "#2a2a2a", color: "#e0e0e0" }}>
        <Modal.Title>
          รายละเอียดงานซ่อม - Fix ID: {fixID}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ backgroundColor: "#1a1a1a", color: "#e0e0e0" }}>
        {loading ? (
          <div className="text-center p-4">
            <Spinner animation="border" variant="light" />
            <p className="mt-3">กำลังโหลดข้อมูล...</p>
          </div>
        ) : fixDetails.length > 0 ? (
          <div className="table-responsive">
            <Table hover className="align-middle table-dark">
              <thead style={{ backgroundColor: "#333333" }}>
                <tr className="text-center">
                  <th>#</th>
                  <th>Date</th>
                  <th>DID</th>
                  <th>Model</th>
                  
                </tr>
              </thead>
              <tbody>
                {fixDetails.map((item, index) => (
                  <tr key={index} className="text-center">
                    <td>
                      <Badge
                        bg="dark"
                        style={{
                          backgroundColor: "#424242",
                          padding: "6px 8px",
                          borderRadius: "4px",
                        }}
                      >
                        {index + 1}
                      </Badge>
                    </td>
                    <td>
                      <small className="d-flex align-items-center justify-content-center text-muted">
                        <CalendarDate size={12} className="me-1" />
                        {formatDate(item.date)}
                      </small>
                    </td>
                    <td>
                      <Badge
                        bg="secondary"
                        style={{
                          backgroundColor: "#555555",
                          padding: "5px 8px",
                          borderRadius: "4px",
                        }}
                      >
                        {item.did || "-"}
                      </Badge>
                    </td>
                    <td className="fw-medium text-white">
                      {item.Modal || "-"}
                    </td>
                   
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        ) : (
          <div className="text-center p-4">
            <p className="text-muted">ไม่พบข้อมูลรายการซ่อม</p>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer style={{ backgroundColor: "#2a2a2a", color: "#e0e0e0" }}>
        <Button variant="secondary" onClick={onHide}>
          ปิด
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default FixlistModal;
