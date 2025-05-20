import React, { useState, useRef, useContext } from "react";
import { Button, Modal, Card, Form, Row, Col } from "react-bootstrap";
import Swal from "sweetalert2";
import { UserContext } from "../App";

function AddProduct({ onSave }) {
  const userInfo = useContext(UserContext);
  const [validated, setValidated] = useState(false);

  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleSubmit = async (event) => {
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    } else {
      event.preventDefault();
      event.stopPropagation();

      addProduct();
    }
    setValidated(true);
  };

  const genId = async () => {
    let date = new Date();
    let day = String(date.getDate()).padStart(2, "0");
    let month = String(date.getMonth() + 1).padStart(2, "0");
    let year = `${date.getFullYear()}`;

    const ySplit = year.split("", 4);
    const yy = ySplit[2] + ySplit[3];

    let i = 0;
    let data;
    let num;

    let id = `PD${yy}${month}${day}`;
    do {
      i++;
      let fullId = `${id}${i.toString().padStart(4, "0")}`;
      try {
        const res = await fetch(
          `${import.meta.env.VITE_SERVER}/Product.php?server=${
            userInfo.server_db
          }&username=${userInfo.username_db}&password=${
            userInfo.password_db
          }&db=${userInfo.name_db}&action=getwherepdid&id=${fullId}`,
          {
            method: "GET",
          }
        );
        data = await res.json();
      } catch (err) {
        console.log(err);
      }

      if (data === null || (Array.isArray(data) && data.length === 0) || data === "") {
        num = 0;
      } else {
        num = 1;
      }
      } while (num === 1);
      
      if (data !== null && (!Array.isArray(data) || data.length > 0) && data !== "") {
        let pd_id = id + i.toString().padStart(4, "0");
        return pd_id;
      } else {
        let pd_id = id + "0001";
        return pd_id;
      }
  };

  const addProduct = async () => {
    const id = await genId();
    try {
      // สร้าง FormData เพื่อเก็บข้อมูลทั้งหมดจาก refs
      const productData = {
        datein: dateinRef.current.value,
        supplier_model: supplierModelRef.current.value,
        supplier_sn: supplierSNRef.current.value,
        at_model: atModelRef.current.value,
        at_sn: atSNRef.current.value,
        displaysize: displaysizeRef.current.value,
        touchtype: touchtypeRef.current.value,
        hdmi: hdmiRef.current.value,
        vga: vgaRef.current.value,
        dvi: dviRef.current.value,
        displayport: displayPortRef.current.value,
        usb2: usb20Ref.current.value,
        usb3: usb30Ref.current.value,
        wifi: wifiRef.current.value,
        wifibrand: wifiBrandRef.current.value,
        wifimodel: wifiModelRef.current.value,
        lan: lanRef.current.value,
        lanbrand: lanBrandRef.current.value,
        lanmodel: lanModelRef.current.value,
        speaker: speakerRef.current.value,
        headphone: headphoneRef.current.value,
        rs232: rs232Ref.current.value,
        rs485: rs485Ref.current.value,
        os_type: osTypeRef.current.value,
        windows_license: windowsLicenseRef.current.value,
        cpu: cpuRef.current.value,
        ssd_hdd: ssdHddRef.current.value,
        ssd_sn: ssdSNRef.current.value,
        ram: ramRef.current.value,
        product_status: productStatusRef.current.value,
        note: noteRef.current.value
      };

      // แปลง productData เป็น query string
      const queryParams = new URLSearchParams();
      Object.entries(productData).forEach(([key, value]) => {
        queryParams.append(key, value);
      });

      const res = await fetch(
        `${import.meta.env.VITE_SERVER}/Product.php?server=${
          userInfo.server_db
        }&username=${userInfo.username_db}&password=${
          userInfo.password_db
        }&db=${userInfo.name_db}&action=insert&productId=${id}&${queryParams.toString()}&user=${userInfo.user_id}`,
        {
          method: "POST",
        }
      );
      const data = await res.json();
      
      if (data === "ok") {
        Swal.fire({
          position: "center",
          icon: "success",
          title: "บันทึกข้อมูลสำเร็จ",
          showConfirmButton: false,
          timer: 1500,
        });
        setShow(false);
        onSave(true);
      } else {
        console.log(data);
      }
    } catch (err) {
      console.log(err);
      Swal.fire({
        position: "center",
        icon: "error",
        title: "เกิดข้อผิดพลาดในการบันทึกข้อมูล",
        showConfirmButton: false,
        timer: 2000,
      });
      onSave(false);
    }
  };

  // สร้าง Refs สำหรับทุกฟิลด์ตามตาราง
  const dateinRef = useRef(null);
  const supplierModelRef = useRef(null);
  const supplierSNRef = useRef(null);
  const atModelRef = useRef(null);
  const atSNRef = useRef(null);
  const displaysizeRef = useRef(null);
  const touchtypeRef = useRef(null);
  const hdmiRef = useRef(null);
  const vgaRef = useRef(null);
  const dviRef = useRef(null);
  const displayPortRef = useRef(null);
  const usb20Ref = useRef(null);
  const usb30Ref = useRef(null);
  const wifiRef = useRef(null);
  const wifiBrandRef = useRef(null);
  const wifiModelRef = useRef(null);
  const lanRef = useRef(null);
  const lanBrandRef = useRef(null);
  const lanModelRef = useRef(null);
  const speakerRef = useRef(null);
  const headphoneRef = useRef(null);
  const rs232Ref = useRef(null);
  const rs485Ref = useRef(null);
  const osTypeRef = useRef(null);
  const windowsLicenseRef = useRef(null);
  const cpuRef = useRef(null);
  const ssdHddRef = useRef(null);
  const ssdSNRef = useRef(null);
  const ramRef = useRef(null);
  const productStatusRef = useRef(null);
  const noteRef = useRef(null);

  return (
    <div className="d-flex justify-content-end">
      <Button className="fw-bold" variant="success" onClick={handleShow}>
        เพิ่มข้อมูลอุปกรณ์
      </Button>

      <Modal size="lg" show={show} onHide={handleClose}>
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>
              <b>เพิ่มข้อมูลอุปกรณ์</b>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            {/* ข้อมูลทั่วไป */}
            <h5 className="mt-2 mb-3">ข้อมูลทั่วไป</h5>
            <Row className="mb-3">
              <Form.Group as={Col} md="6" className="mb-3">
                <Form.Label><b>วันที่</b></Form.Label>
                <Form.Control
                  required
                  type="date"
                  ref={dateinRef}
                />
                <Form.Control.Feedback type="invalid">
                  <b>กรุณาระบุวันที่</b>
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group as={Col} md="6" className="mb-3">
                <Form.Label><b>สถานะสินค้า</b></Form.Label>
                <Form.Select
                  required
                  ref={productStatusRef}
                >
                  <option value="">เลือกสถานะ</option>
                  <option value="OK">OK</option>
                  <option value="NG">NG</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  <b>กรุณาเลือกสถานะสินค้า</b>
                </Form.Control.Feedback>
              </Form.Group>
            </Row>

            {/* ข้อมูลผู้ผลิต */}
            <h5 className="mt-3 mb-3">ข้อมูลผู้ผลิต</h5>
            <Row className="mb-3">
              <Form.Group as={Col} md="6" className="mb-3">
                <Form.Label><b>รุ่นจากผู้ผลิต (Supplier Model)</b></Form.Label>
                <Form.Control
                  required
                  type="text"
                  maxLength="50"
                  ref={supplierModelRef}
                />
                <Form.Control.Feedback type="invalid">
                  <b>กรุณาระบุรุ่นจากผู้ผลิต</b>
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group as={Col} md="6" className="mb-3">
                <Form.Label><b>หมายเลขซีเรียลจากผู้ผลิต (Supplier SN)</b></Form.Label>
                <Form.Control
                  required
                  type="text"
                  maxLength="50"
                  ref={supplierSNRef}
                />
                <Form.Control.Feedback type="invalid">
                  <b>กรุณาระบุหมายเลขซีเรียลจากผู้ผลิต</b>
                </Form.Control.Feedback>
              </Form.Group>
            </Row>

            {/* ข้อมูล AT */}
            <Row className="mb-3">
              <Form.Group as={Col} md="6" className="mb-3">
                <Form.Label><b>รุ่น AT (AT Model)</b></Form.Label>
                <Form.Control
                  required
                  type="text"
                  maxLength="50"
                  ref={atModelRef}
                />
                <Form.Control.Feedback type="invalid">
                  <b>กรุณาระบุรุ่น AT</b>
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group as={Col} md="6" className="mb-3">
                <Form.Label><b>หมายเลขซีเรียล AT (AT SN)</b></Form.Label>
                <Form.Control
                  required
                  type="text"
                  maxLength="50"
                  ref={atSNRef}
                />
                <Form.Control.Feedback type="invalid">
                  <b>กรุณาระบุหมายเลขซีเรียล AT</b>
                </Form.Control.Feedback>
              </Form.Group>
            </Row>

            {/* ข้อมูลจอแสดงผล */}
            <h5 className="mt-3 mb-3">ข้อมูลจอแสดงผล</h5>
            <Row className="mb-3">
              <Form.Group as={Col} md="6" className="mb-3">
                <Form.Label><b>ขนาดจอ (นิ้ว)</b></Form.Label>
                <Form.Control
                  required
                  type="number"
                  ref={displaysizeRef}
                />
                <Form.Control.Feedback type="invalid">
                  <b>กรุณาระบุขนาดจอ</b>
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group as={Col} md="6" className="mb-3">
                <Form.Label><b>ประเภทการสัมผัส</b></Form.Label>
                <Form.Select
                  required
                  ref={touchtypeRef}
                >
                  <option value="">เลือกประเภท</option>
                  <option value="cap">Capacitive</option>
                  <option value="resis">Resistive</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  <b>กรุณาเลือกประเภทการสัมผัส</b>
                </Form.Control.Feedback>
              </Form.Group>
            </Row>

            {/* ข้อมูลช่องต่อจอภาพ */}
            <h5 className="mt-3 mb-3">ช่องต่อจอภาพ</h5>
            <Row className="mb-3">
              <Form.Group as={Col} md="3" className="mb-3">
                <Form.Label><b>HDMI (จำนวน)</b></Form.Label>
                <Form.Control
                  required
                  type="number"
                  ref={hdmiRef}
                />
                <Form.Control.Feedback type="invalid">
                  <b>กรุณาระบุจำนวน HDMI</b>
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group as={Col} md="3" className="mb-3">
                <Form.Label><b>VGA (จำนวน)</b></Form.Label>
                <Form.Control
                  required
                  type="number"
                  ref={vgaRef}
                />
                <Form.Control.Feedback type="invalid">
                  <b>กรุณาระบุจำนวน VGA</b>
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group as={Col} md="3" className="mb-3">
                <Form.Label><b>DVI (จำนวน)</b></Form.Label>
                <Form.Control
                  required
                  type="number"
                  ref={dviRef}
                />
                <Form.Control.Feedback type="invalid">
                  <b>กรุณาระบุจำนวน DVI</b>
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group as={Col} md="3" className="mb-3">
                <Form.Label><b>DisplayPort (จำนวน)</b></Form.Label>
                <Form.Control
                  required
                  type="number"
                  ref={displayPortRef}
                />
                <Form.Control.Feedback type="invalid">
                  <b>กรุณาระบุจำนวน DisplayPort</b>
                </Form.Control.Feedback>
              </Form.Group>
            </Row>

            {/* ข้อมูลช่อง USB */}
            <h5 className="mt-3 mb-3">ช่อง USB</h5>
            <Row className="mb-3">
              <Form.Group as={Col} md="6" className="mb-3">
                <Form.Label><b>USB 2.0 (จำนวน)</b></Form.Label>
                <Form.Control
                  required
                  type="number"
                  ref={usb20Ref}
                />
                <Form.Control.Feedback type="invalid">
                  <b>กรุณาระบุจำนวน USB 2.0</b>
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group as={Col} md="6" className="mb-3">
                <Form.Label><b>USB 3.0 (จำนวน)</b></Form.Label>
                <Form.Control
                  required
                  type="number"
                  ref={usb30Ref}
                />
                <Form.Control.Feedback type="invalid">
                  <b>กรุณาระบุจำนวน USB 3.0</b>
                </Form.Control.Feedback>
              </Form.Group>
            </Row>

            {/* ข้อมูล WiFi */}
            <h5 className="mt-3 mb-3">ข้อมูล WiFi</h5>
            <Row className="mb-3">
              <Form.Group as={Col} md="4" className="mb-3">
                <Form.Label><b>WiFi (0=ไม่มี, 1=มี)</b></Form.Label>
                <Form.Control
                  required
                  type="number"
                  min="0"
                  max="1"
                  ref={wifiRef}
                />
                <Form.Control.Feedback type="invalid">
                  <b>กรุณาระบุข้อมูล WiFi</b>
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group as={Col} md="4" className="mb-3">
                <Form.Label><b>ยี่ห้อ WiFi</b></Form.Label>
                <Form.Control
                  type="text"
                  maxLength="50"
                  ref={wifiBrandRef}
                />
              </Form.Group>

              <Form.Group as={Col} md="4" className="mb-3">
                <Form.Label><b>รุ่น WiFi</b></Form.Label>
                <Form.Control
                  type="text"
                  maxLength="50"
                  ref={wifiModelRef}
                />
              </Form.Group>
            </Row>

            {/* ข้อมูล LAN */}
            <h5 className="mt-3 mb-3">ข้อมูล LAN</h5>
            <Row className="mb-3">
              <Form.Group as={Col} md="4" className="mb-3">
                <Form.Label><b>LAN (0=ไม่มี, 1=มี)</b></Form.Label>
                <Form.Control
                  required
                  type="number"
                  min="0"
                  max="1"
                  ref={lanRef}
                />
                <Form.Control.Feedback type="invalid">
                  <b>กรุณาระบุข้อมูล LAN</b>
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group as={Col} md="4" className="mb-3">
                <Form.Label><b>ยี่ห้อ LAN</b></Form.Label>
                <Form.Control
                  type="text"
                  maxLength="50"
                  ref={lanBrandRef}
                />
              </Form.Group>

              <Form.Group as={Col} md="4" className="mb-3">
                <Form.Label><b>รุ่น LAN</b></Form.Label>
                <Form.Control
                  type="text"
                  maxLength="50"
                  ref={lanModelRef}
                />
              </Form.Group>
            </Row>

            {/* ข้อมูลเสียง */}
            <h5 className="mt-3 mb-3">ข้อมูลเสียง</h5>
            <Row className="mb-3">
              <Form.Group as={Col} md="6" className="mb-3">
                <Form.Label><b>ลำโพง (0=ไม่มี, 1=มี)</b></Form.Label>
                <Form.Control
                  required
                  type="number"
                  min="0"
                  max="1"
                  ref={speakerRef}
                />
                <Form.Control.Feedback type="invalid">
                  <b>กรุณาระบุข้อมูลลำโพง</b>
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group as={Col} md="6" className="mb-3">
                <Form.Label><b>หูฟัง (0=ไม่มี, 1=มี)</b></Form.Label>
                <Form.Control
                  required
                  type="number"
                  min="0"
                  max="1"
                  ref={headphoneRef}
                />
                <Form.Control.Feedback type="invalid">
                  <b>กรุณาระบุข้อมูลหูฟัง</b>
                </Form.Control.Feedback>
              </Form.Group>
            </Row>

            {/* ข้อมูลพอร์ตเชื่อมต่อ RS232/RS485 */}
            <h5 className="mt-3 mb-3">พอร์ตเชื่อมต่อ</h5>
            <Row className="mb-3">
              <Form.Group as={Col} md="6" className="mb-3">
                <Form.Label><b>RS232 (จำนวน)</b></Form.Label>
                <Form.Control
                  required
                  type="number"
                  ref={rs232Ref}
                />
                <Form.Control.Feedback type="invalid">
                  <b>กรุณาระบุจำนวน RS232</b>
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group as={Col} md="6" className="mb-3">
                <Form.Label><b>RS485 (จำนวน)</b></Form.Label>
                <Form.Control
                  required
                  type="number"
                  ref={rs485Ref}
                />
                <Form.Control.Feedback type="invalid">
                  <b>กรุณาระบุจำนวน RS485</b>
                </Form.Control.Feedback>
              </Form.Group>
            </Row>

            {/* ข้อมูลระบบปฏิบัติการ */}
            <h5 className="mt-3 mb-3">ระบบปฏิบัติการ</h5>
            <Row className="mb-3">
              <Form.Group as={Col} md="6" className="mb-3">
                <Form.Label><b>ประเภท OS</b></Form.Label>
                <Form.Control
                  required
                  type="text"
                  maxLength="50"
                  ref={osTypeRef}
                />
                <Form.Control.Feedback type="invalid">
                  <b>กรุณาระบุประเภท OS</b>
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group as={Col} md="6" className="mb-3">
                <Form.Label><b>ไลเซนส์ Windows</b></Form.Label>
                <Form.Control
                  type="text"
                  maxLength="50"
                  ref={windowsLicenseRef}
                />
              </Form.Group>
            </Row>

            {/* ข้อมูลฮาร์ดแวร์ */}
            <h5 className="mt-3 mb-3">ข้อมูลฮาร์ดแวร์</h5>
            <Row className="mb-3">
              <Form.Group as={Col} md="6" className="mb-3">
                <Form.Label><b>CPU</b></Form.Label>
                <Form.Control
                  required
                  type="text"
                  maxLength="50"
                  ref={cpuRef}
                />
                <Form.Control.Feedback type="invalid">
                  <b>กรุณาระบุข้อมูล CPU</b>
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group as={Col} md="6" className="mb-3">
                <Form.Label><b>RAM</b></Form.Label>
                <Form.Control
                  required
                  type="text"
                  maxLength="50"
                  ref={ramRef}
                />
                <Form.Control.Feedback type="invalid">
                  <b>กรุณาระบุข้อมูล RAM</b>
                </Form.Control.Feedback>
              </Form.Group>
            </Row>

            <Row className="mb-3">
              <Form.Group as={Col} md="6" className="mb-3">
                <Form.Label><b>ประเภทฮาร์ดดิสก์ (SSD/HDD)</b></Form.Label>
                <Form.Control
                  required
                  type="text"
                  maxLength="50"
                  ref={ssdHddRef}
                />
                <Form.Control.Feedback type="invalid">
                  <b>กรุณาระบุประเภทฮาร์ดดิสก์</b>
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group as={Col} md="6" className="mb-3">
                <Form.Label><b>หมายเลขซีเรียลฮาร์ดดิสก์</b></Form.Label>
                <Form.Control
                  required
                  type="text"
                  maxLength="50"
                  ref={ssdSNRef}
                />
                <Form.Control.Feedback type="invalid">
                  <b>กรุณาระบุหมายเลขซีเรียลฮาร์ดดิสก์</b>
                </Form.Control.Feedback>
              </Form.Group>
            </Row>

            {/* หมายเหตุ */}
            <h5 className="mt-3 mb-3">หมายเหตุ</h5>
            <Row className="mb-3">
              <Form.Group as={Col} md="12" className="mb-3">
                <Form.Label><b>หมายเหตุ</b></Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  maxLength="100"
                  ref={noteRef}
                />
              </Form.Group>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              <b>ปิด</b>
            </Button>
            <Button type="submit" variant="success">
              <b>บันทึก</b>
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}

export default AddProduct;