import React, { useState, useRef, useEffect } from "react";
import { Button, Modal, Form, Row, Col, ListGroup, Table } from "react-bootstrap";
import Swal from "sweetalert2";
import { useNavigate } from 'react-router-dom';

function ReturnItem({ onSave, Username = localStorage.getItem("fullname"), children }) {
  const navigate = useNavigate();
  const [validated, setValidated] = useState(false);
  const [show, setShow] = useState(false);
  const [borrowedItems, setBorrowedItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [serialInput, setSerialInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingItem, setFetchingItem] = useState(false);

  const handleClose = () => {
    setShow(false);
    resetForm();
  };

  const handleShow = () => {
    setShow(true);
    resetForm();
    fetchBorrowedItems();
  };

  const resetForm = () => {
    setValidated(false);
    setSelectedItems([]);
    setSerialInput("");
    if (noteRef.current) noteRef.current.value = "";
    if (serialInputRef.current) serialInputRef.current.value = "";
  };

  // ฟังก์ชันดึงข้อมูลรายการที่ยืมทั้งหมด
  // ฟังก์ชันดึงข้อมูลรายการที่ยืมและเบิกทั้งหมด
  const fetchBorrowedItems = async () => {
    setLoading(true);
    try {
      // ดึงข้อมูลจาก 2 แหล่ง
      const [borrowResponse, outResponse] = await Promise.all([
        fetch(`${import.meta.env.VITE_SERVER}/Store.php?action=getBorrowedParts`),
        fetch(`${import.meta.env.VITE_SERVER}/Store.php?action=getOutItems`)
      ]);

      const borrowData = await borrowResponse.json();
      const outData = await outResponse.json();

      // รวมข้อมูลทั้งสอง พร้อมเพิ่ม type
      const combinedData = [
        ...(Array.isArray(borrowData) ? borrowData.map(item => ({
          ...item,
          type: 'BORROW',
          borrowed_qty: item.borrowed_qty || item.qty
        })) : []),
        ...(Array.isArray(outData) ? outData.map(item => ({
          ...item,
          type: 'OUT',
          borrowed_qty: item.qty
        })) : [])
      ];

      // กรองเฉพาะรายการของผู้ใช้ปัจจุบัน ถ้าไม่ใช่ admin
      const userLevel = localStorage.getItem("level");
      if (userLevel !== "admin") {
        const filteredData = combinedData.filter(item => item.user === Username);
        setBorrowedItems(filteredData);
      } else {
        setBorrowedItems(combinedData);
      }
    } catch (error) {
      console.error("Error fetching borrowed items:", error);
      setBorrowedItems([]);
    } finally {
      setLoading(false);
    }
  };
  
  // ฟังก์ชันค้นหาจาก Serial Number
  const handleSerialSearch = async () => {
    if (!serialInput.trim()) return;

    setFetchingItem(true);

    try {
      // ค้นหาจากรายการที่โหลดมาแล้ว
      const matchingItem = borrowedItems.find(item =>
        item.serial_num.toLowerCase() === serialInput.toLowerCase()
      );

      if (matchingItem) {
        // ตรวจสอบว่ามีรายการนี้อยู่ในรายการที่เลือกแล้วหรือไม่
        const isAlreadySelected = selectedItems.some(
          item => item.serial_num === matchingItem.serial_num && item.type === matchingItem.type
        );

        if (!isAlreadySelected) {
          // เพิ่มรายการใหม่ไปยังรายการที่เลือก
          setSelectedItems([...selectedItems, {
            ...matchingItem,
            returnQty: matchingItem.qty || matchingItem.borrowed_qty,
            maxQty: matchingItem.qty || matchingItem.borrowed_qty
          }]);

          // ล้างช่องค้นหา
          setSerialInput("");
          if (serialInputRef.current) serialInputRef.current.value = "";
          serialInputRef.current.focus();
        } else {
          Swal.fire({
            position: "center",
            icon: "warning",
            title: "รายการนี้ถูกเลือกไว้แล้ว",
            showConfirmButton: false,
            timer: 1500,
          });
        }
      } else {
        Swal.fire({
          position: "center",
          icon: "error",
          title: "ไม่พบรายการที่ยืม/เบิกด้วย Serial Number นี้",
          showConfirmButton: false,
          timer: 2000,
        });
      }
    } catch (error) {
      console.error("Error searching for serial:", error);
      Swal.fire({
        position: "center",
        icon: "error",
        title: "เกิดข้อผิดพลาดในการค้นหา",
        showConfirmButton: false,
        timer: 2000,
      });
    } finally {
      setFetchingItem(false);
    }
  };

  // จัดการเมื่อกด Enter ที่ช่องกรอก Serial
  const handleSerialKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSerialSearch();
    }
  };

  // ฟังก์ชันลบรายการที่เลือก
  const removeSelectedItem = (index) => {
    const updatedItems = [...selectedItems];
    updatedItems.splice(index, 1);
    setSelectedItems(updatedItems);
  };

  // ฟังก์ชันอัพเดตจำนวนที่ต้องการคืน
  const updateReturnQuantity = (index, quantity) => {
    const updatedItems = [...selectedItems];
    const maxQty = updatedItems[index].maxQty || 1;
    const newQty = quantity > maxQty ? maxQty : (quantity < 1 ? 1 : quantity);

    updatedItems[index].returnQty = newQty;
    setSelectedItems(updatedItems);
  };

  // ฟังก์ชันอัพเดต Location
  const updateLocation = (index, location) => {
    const updatedItems = [...selectedItems];
    updatedItems[index].location = location;
    setSelectedItems(updatedItems);
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
    event.stopPropagation();

    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      setValidated(true);
      return;
    }

    // ตรวจสอบว่ามีรายการที่เลือกหรือไม่
    if (selectedItems.length === 0) {
      Swal.fire({
        position: "center",
        icon: "error",
        title: "โปรดเลือกรายการที่ต้องการคืนอย่างน้อย 1 รายการ",
        showConfirmButton: false,
        timer: 2000,
      });
      return;
    }

    try {
      // บันทึก Log และอัพเดท Stock สำหรับแต่ละรายการ
      for (const item of selectedItems) {
        await saveLogEntry(item);
        await updateStock(item);
      }

      Swal.fire({
        position: "center",
        icon: "success",
        title: "คืนอุปกรณ์สำเร็จ",
        showConfirmButton: false,
        timer: 1500,
      }).then(() => {
        setShow(false);
        if (onSave) onSave(true);
        // หลังจาก Swal ปิด ให้นำทางไปยังหน้า /Borrow
        navigate('/Borrow');
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        position: "center",
        icon: "error",
        title: "เกิดข้อผิดพลาดในการบันทึกข้อมูล",
        showConfirmButton: false,
        timer: 2000,
      });
    }
  };


  // ฟังก์ชันสำหรับบันทึกลง tb_log_product
  const saveLogEntry = async (item) => {
    try {
      const queryString =
        `${import.meta.env.VITE_SERVER}/Store.php?action=insertLogProduct` +
        `&date=${encodeURIComponent(getCurrentDateTime())}` +
        `&uname=${encodeURIComponent(Username)}` +
        `&partnum=${encodeURIComponent(item.part_num)}` +
        `&partname=${encodeURIComponent(item.part_name)}` +
        `&supplier=${encodeURIComponent(item.supplier || '')}` +
        `&qty=${encodeURIComponent(item.returnQty)}` +
        `&location=${encodeURIComponent(item.location)}` +
        `&storename=${encodeURIComponent(item.store_name || '')}` +
        `&note=${encodeURIComponent(noteRef.current.value || '')}` +
        `&status=${encodeURIComponent("Return")}` + // ใช้ Return สำหรับ Log
        `&serial_num=${encodeURIComponent(item.serial_num || '')}`;

      const res = await fetch(queryString, {
        method: "POST",
      });

      const data = await res.json();
      if (data !== "ok") {
        throw new Error("Failed to save log entry");
      }
    } catch (err) {
      console.error('Error details:', err);
      throw err;
    }
  };


  // ฟังก์ชันสำหรับอัพเดท stock
  const updateStock = async (item) => {
    try {
      const queryString =
        `${import.meta.env.VITE_SERVER}/Store.php?action=updateStock` +
        `&date=${encodeURIComponent(getCurrentDateTime())}` +
        `&uname=${encodeURIComponent(item.user)}` +
        `&partnum=${encodeURIComponent(item.part_num)}` +
        `&partname=${encodeURIComponent(item.part_name)}` +
        `&supplier=${encodeURIComponent(item.supplier || '')}` +
        `&qty=${encodeURIComponent(item.returnQty)}` +
        `&location=${encodeURIComponent(item.location)}` +
        `&storename=${encodeURIComponent(item.store_name || '')}` +
        `&note=${encodeURIComponent(noteRef.current.value || '')}` +
        `&status=${encodeURIComponent("RETURN")}` +
        `&return_type=${encodeURIComponent(item.type)}` + // ส่ง type ไปด้วย
        `&serial_num=${encodeURIComponent(item.serial_num || '')}` +
        `&sup_serial=${encodeURIComponent(item.sup_serial || '')}` +
        `&sup_barcode=${encodeURIComponent(item.sup_barcode || '')}`;

      const res = await fetch(queryString, {
        method: "POST",
      });
      const data = await res.json();
      if (data !== "ok") {
        throw new Error("Failed to update stock");
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  };
  // Refs for form fields
  const noteRef = useRef(null);
  const serialInputRef = useRef(null);

  return (
    <div className="d-flex justify-content-end">
      <Button
        className="fw-bold"
        variant="success"
        onClick={handleShow}
      >
        {children || "Return Items"}
      </Button>

      <Modal size="lg" show={show} onHide={handleClose}>
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>
              <b>Return Items (Borrowed & OUT)</b>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row className="mb-3">
              <Col md="12" className="mb-3">
                <Form.Group>
                  <Form.Label><b>Enter Serial Number</b></Form.Label>
                  <div className="d-flex">
                    <Form.Control
                      type="text"
                      placeholder="Scan or type Serial Number..."
                      ref={serialInputRef}
                      onChange={(e) => setSerialInput(e.target.value)}
                      onKeyPress={handleSerialKeyPress}
                    />
                    <Button
                      variant="primary"
                      onClick={handleSerialSearch}
                      disabled={fetchingItem || !serialInput.trim()}
                      className="ms-2"
                    >
                      {fetchingItem ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                          Searching...
                        </>
                      ) : "Add"}
                    </Button>
                  </div>
                </Form.Group>
              </Col>

              {selectedItems.length > 0 && (
                <Col md="12">
                  <h5 className="mb-3">Selected Items to Return</h5>
                  <Table bordered className="mb-3">
                    <thead>
                      <tr>
                        <th>Type</th>
                        <th>Serial Number</th>
                        <th>Part Name</th>
                        <th>Location</th>
                        <th>Return Qty</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedItems.map((item, index) => (
                        <tr key={`selected-${item.serial_num}-${index}`}>
                          <td>
                            <span
                              className={`badge ${item.type === 'BORROW' ? 'bg-warning' : 'bg-info'}`}
                              style={{
                                padding: '5px 10px',
                                borderRadius: '12px',
                                fontSize: '0.85em'
                              }}
                            >
                              {item.type}
                            </span>
                          </td>
                          <td>{item.serial_num || '-'}</td>
                          <td>{item.part_name}</td>
                          <td>
                            <Form.Control
                              type="text"
                              size="sm"
                              value={item.location}
                              onChange={(e) => updateLocation(index, e.target.value)}
                            />
                          </td>
                          <td>
                            <Form.Control
                              type="number"
                              min="1"
                              max={item.maxQty}
                              value={item.returnQty}
                              onChange={(e) => updateReturnQuantity(index, parseInt(e.target.value))}
                              style={{ width: '80px' }}
                            />
                          </td>
                          <td>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => removeSelectedItem(index)}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-trash" viewBox="0 0 16 16">
                                <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6Z" />
                                <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1ZM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118ZM2.5 3h11V2h-11v1Z" />
                              </svg>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Col>
              )}

              <Col md="12">
                <Form.Group>
                  <Form.Label><b>Note</b></Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    ref={noteRef}
                    placeholder="Enter notes about the return..."
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              <b>Close</b>
            </Button>
            <Button
              type="submit"
              variant="success"
              disabled={selectedItems.length === 0}
            >
              <b>Return Selected Items</b>
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}

export default ReturnItem;