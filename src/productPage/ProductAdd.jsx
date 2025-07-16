import React, { useState, useRef, useEffect } from "react";
import { Button, Modal, Form, Row, Col, Tab, Tabs } from "react-bootstrap";
import Swal from "sweetalert2";

function ProductAdd({ onSave, children }) {
  const [validated, setValidated] = useState(false);
  const [show, setShow] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  
  const handleClose = () => setShow(false);
  const handleShow = () => {
    setShow(true);
    // ตั้งค่าวันที่ปัจจุบันเมื่อเปิด Modal
    const today = new Date().toISOString().split('T')[0];
    if (dateinRef.current) {
      dateinRef.current.value = today;
    }
  };

  // ตั้งค่าวันที่ปัจจุบันเมื่อ component mount
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    if (dateinRef.current) {
      dateinRef.current.value = today;
    }
  }, [show]);

  const handleSubmit = async (event) => {
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    } else {
      event.preventDefault();
      event.stopPropagation();
      saveProduct();
    }
    setValidated(true);
  };

  const saveProduct = async () => {
    try {
      // รวบรวมข้อมูลจากฟอร์ม
      const formData = {
        // Basic Info
        datein: dateinRef.current?.value || '',
        supplier_model: supplierModelRef.current?.value || '',
        sup_name: supNameRef.current?.value || '',
        supplier_sn: supplierSNRef.current?.value || '',
        at_model: atModelRef.current?.value || '',
        at_sn: atSNRef.current?.value || '',
        location: location.current?.value || '',
        
        // Display Info
        displaysize: displaysizeRef.current?.value || '0',
        touchtype: touchtypeRef.current?.value || '',
        cap: capRef.current?.checked ? '1' : '0',
        resis: resisRef.current?.checked ? '1' : '0',
        
        // Connectivity
        hdmi: hdmiRef.current?.value || '0',
        vga: vgaRef.current?.value || '0',
        dvi: dviRef.current?.value || '0',
        displayport: displayportRef.current?.value || '0',
        usb20: usb20Ref.current?.value || '0',
        usb30: usb30Ref.current?.value || '0',
        wifi: wifiRef.current?.checked ? '1' : '0',
        wifibrand: wifibrandRef.current?.value || '',
        wifimodel: wifimodelRef.current?.value || '',
        lan: lanRef.current?.value || '0',
        lanbrand: lanbrandRef.current?.value || '',
        lanmodel: lanmodelRef.current?.value || '',
        
        // Audio
        speaker: speakerRef.current?.value || '0',
        headphone: headphoneRef.current?.value || '0',
        rs232: rs232Ref.current?.value || '0',
        rs485: rs485Ref.current?.value || '0',
        
        // System
        os_type: osTypeRef.current?.value || '',
        windows_license: windowsLicenseRef.current?.value || '',
        cpu: cpuRef.current?.value || '',
        ssd_hdd: ssdHddRef.current?.value || '',
        ssd_sn: ssdSNRef.current?.value || '',
        ram: ramRef.current?.value || '',
        
        // Status & Info (เหลือแค่สถานะสินค้า)
        product_status: productStatusRef.current?.value || '',
        note: noteRef.current?.value || ''
      };

      console.log('Form data:', formData); // Debug log

      // สร้าง query string
      const queryParams = new URLSearchParams(formData).toString();
      console.log('Query params:', queryParams); // Debug log
      
      const res = await fetch(
        `${import.meta.env.VITE_SERVER}/Store.php?action=addProduct&${queryParams}`,
        {
          method: "POST",
        }
      );
      
      const responseText = await res.text();
      console.log('Raw response:', responseText); // Debug log
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.error('Response text:', responseText);
        throw new Error('Invalid JSON response');
      }
      
      if (data === "ok") {
        // เพิ่ม log การเพิ่มสินค้าใหม่
        try {
          const logParams = new URLSearchParams({
            action: 'addPcLog',
            atc_modal: formData.at_model,
            sn: formData.at_sn,
            status: 'IN',
            date: formData.datein,
            user: 'System' // หรือใช้ชื่อผู้ใช้จริง
          });

          await fetch(
            `${import.meta.env.VITE_SERVER}/Store.php?${logParams}`,
            { method: "POST" }
          );
        } catch (logError) {
          console.error('Error adding log:', logError);
          // ไม่แสดง error เพราะการเพิ่มสินค้าสำเร็จแล้ว แค่ log ไม่ได้
        }

        Swal.fire({
          position: "center",
          icon: "success",
          title: "เพิ่มสินค้าสำเร็จ",
          showConfirmButton: false,
          timer: 1500,
        });
        setShow(false);
        resetForm();
        onSave(true);
      } else {
        console.log('Error response:', data);
        Swal.fire({
          position: "center",
          icon: "error",
          title: "ไม่สามารถเพิ่มสินค้าได้",
          text: typeof data === 'string' ? data : JSON.stringify(data),
          showConfirmButton: true,
        });
      }
    } catch (err) {
      console.error('Save product error:', err);
      Swal.fire({
        position: "center",
        icon: "error",
        title: "เกิดข้อผิดพลาด!",
        text: err.message,
        showConfirmButton: true,
      });
      onSave(false);
    }
  };

  const resetForm = () => {
    // Reset all form fields (ลบฟิลด์ที่เอาออกแล้ว)
    const refs = [
      dateinRef, supplierModelRef, supNameRef, supplierSNRef, atModelRef, atSNRef,
      displaysizeRef, touchtypeRef, hdmiRef, vgaRef, dviRef, displayportRef,
      usb20Ref, usb30Ref, wifibrandRef, wifimodelRef, lanRef, lanbrandRef, lanmodelRef,
      speakerRef, headphoneRef, rs232Ref, rs485Ref, osTypeRef, windowsLicenseRef,
      cpuRef, ssdHddRef, ssdSNRef, ramRef, productStatusRef, noteRef, location
    ];
    
    refs.forEach(ref => {
      if (ref.current) {
        if (ref.current.type === 'checkbox') {
          ref.current.checked = false;
        } else {
          ref.current.value = '';
        }
      }
    });
    
    // ตั้งค่าวันที่ปัจจุบันใหม่หลัง reset
    const today = new Date().toISOString().split('T')[0];
    if (dateinRef.current) {
      dateinRef.current.value = today;
    }
    
    setValidated(false);
    setActiveTab("basic");
  };

  // Refs for all form fields (ลบ refs ที่ไม่ใช้แล้ว)
  const dateinRef = useRef(null);
  const supplierModelRef = useRef(null);
  const supNameRef = useRef(null);
  const location = useRef(null);
  const supplierSNRef = useRef(null);
  const atModelRef = useRef(null);
  const atSNRef = useRef(null);
  const displaysizeRef = useRef(null);
  const touchtypeRef = useRef(null);
  const capRef = useRef(null);
  const resisRef = useRef(null);
  const hdmiRef = useRef(null);
  const vgaRef = useRef(null);
  const dviRef = useRef(null);
  const displayportRef = useRef(null);
  const usb20Ref = useRef(null);
  const usb30Ref = useRef(null);
  const wifiRef = useRef(null);
  const wifibrandRef = useRef(null);
  const wifimodelRef = useRef(null);
  const lanRef = useRef(null);
  const lanbrandRef = useRef(null);
  const lanmodelRef = useRef(null);
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
    <>
      {React.cloneElement(children, { onClick: handleShow })}

      <Modal show={show} onHide={handleClose} size="xl">
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>
              <b>เพิ่มสินค้าใหม่</b>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-3">
              
              {/* Tab 1: Basic Information */}
              <Tab eventKey="basic" title="ข้อมูลพื้นฐาน">
                <Row className="mb-3">
                  <Form.Group as={Col} md="6" className="mb-3">
                    <Form.Label><b>วันที่รับเข้า</b></Form.Label>
                    <Form.Control 
                      required 
                      type="date" 
                      ref={dateinRef}
                    />
                    <Form.Control.Feedback type="invalid">
                      <b>กรุณาเลือกวันที่รับเข้า</b>
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group as={Col} md="6" className="mb-3">
                    <Form.Label><b>รุ่นของซัพพลายเออร์</b></Form.Label>
                    <Form.Control  
                      type="text" 
                      ref={supplierModelRef}
                      maxLength={50} 
                    />
                    <Form.Control.Feedback type="invalid">
                      <b>กรุณาใส่รุ่นของซัพพลายเออร์</b>
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group as={Col} md="6" className="mb-3">
                    <Form.Label><b>ชื่อซัพพลายเออร์</b></Form.Label>
                    <Form.Control 
                      type="text" 
                      ref={supNameRef}
                      maxLength={50} 
                    />
                    <Form.Control.Feedback type="invalid">
                      <b>กรุณาใส่ชื่อซัพพลายเออร์</b>
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group as={Col} md="6" className="mb-3">
                    <Form.Label><b>Serial Number ซัพพลายเออร์</b></Form.Label>
                    <Form.Control 
                      type="text" 
                      ref={supplierSNRef}
                      maxLength={50} 
                    />
                  </Form.Group>

                  <Form.Group as={Col} md="6" className="mb-3">
                    <Form.Label><b>รุ่น ATC</b></Form.Label>
                    <Form.Control 
                      required 
                      type="text" 
                      ref={atModelRef}
                      maxLength={50} 
                    />
                    <Form.Control.Feedback type="invalid">
                      <b>กรุณาใส่รุ่น ATC</b>
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group as={Col} md="6" className="mb-3">
                    <Form.Label><b>Serial Number ATC</b></Form.Label>
                    <Form.Control 
                      required 
                      type="text" 
                      ref={atSNRef}
                      maxLength={50} 
                    />
                    <Form.Control.Feedback type="invalid">
                      <b>กรุณาใส่ Serial Number ATC</b>
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group as={Col} md="6" className="mb-3">
                    <Form.Label><b>location</b></Form.Label>
                    <Form.Control 
                      required 
                      type="text" 
                      ref={location}
                      maxLength={10} 
                    />
                    <Form.Control.Feedback type="invalid">
                      <b>เก็บที่ location ไหน</b>
                    </Form.Control.Feedback>
                  </Form.Group>
                </Row>
              </Tab>

              {/* Tab 2: Display & Input */}
              <Tab eventKey="display" title="จอแสดงผล">
                <Row className="mb-3">
                  <Form.Group as={Col} md="6" className="mb-3">
                    <Form.Label><b>ขนาดจอ</b></Form.Label>
                    <Form.Control 
                      type="text" 
                      ref={displaysizeRef}
                    />
                  </Form.Group>

                  <Form.Group as={Col} md="6" className="mb-3">
                    <Form.Label><b>ประเภทการสัมผัส</b></Form.Label>
                    <Form.Select ref={touchtypeRef}>
                      <option value="">เลือกประเภท</option>
                      <option value="cap">Capacitive</option>
                      <option value="resis">Resistive</option>
                      <option value="none">None</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group as={Col} md="6" className="mb-3">
                    <Form.Check 
                      type="checkbox"
                      label="Capacitive Touch"
                      ref={capRef}
                    />
                  </Form.Group>

                  <Form.Group as={Col} md="6" className="mb-3">
                    <Form.Check 
                      type="checkbox"
                      label="Resistive Touch"
                      ref={resisRef}
                    />
                  </Form.Group>
                </Row>
              </Tab>

              {/* Tab 3: Connectivity */}
              <Tab eventKey="connectivity" title="การเชื่อมต่อ">
                <Row className="mb-3">
                  <Form.Group as={Col} md="3" className="mb-3">
                    <Form.Label><b>HDMI</b></Form.Label>
                    <Form.Control 
                      type="number" 
                      ref={hdmiRef}
                      min="0"
                      max="10"
                      defaultValue="0"
                    />
                  </Form.Group>

                  <Form.Group as={Col} md="3" className="mb-3">
                    <Form.Label><b>VGA</b></Form.Label>
                    <Form.Control 
                      type="number" 
                      ref={vgaRef}
                      min="0"
                      max="10"
                      defaultValue="0"
                    />
                  </Form.Group>

                  <Form.Group as={Col} md="3" className="mb-3">
                    <Form.Label><b>DVI</b></Form.Label>
                    <Form.Control 
                      type="number" 
                      ref={dviRef}
                      min="0"
                      max="10"
                      defaultValue="0"
                    />
                  </Form.Group>

                  <Form.Group as={Col} md="3" className="mb-3">
                    <Form.Label><b>Display Port</b></Form.Label>
                    <Form.Control 
                      type="number" 
                      ref={displayportRef}
                      min="0"
                      max="10"
                      defaultValue="0"
                    />
                  </Form.Group>

                  <Form.Group as={Col} md="6" className="mb-3">
                    <Form.Label><b>USB 2.0</b></Form.Label>
                    <Form.Control 
                      type="number" 
                      ref={usb20Ref}
                      min="0"
                      max="20"
                      defaultValue="0"
                    />
                  </Form.Group>

                  <Form.Group as={Col} md="6" className="mb-3">
                    <Form.Label><b>USB 3.0</b></Form.Label>
                    <Form.Control 
                      type="number" 
                      ref={usb30Ref}
                      min="0"
                      max="20"
                      defaultValue="0"
                    />
                  </Form.Group>
                </Row>
              </Tab>

              {/* Tab 4: Network & Audio */}
              <Tab eventKey="network" title="เครือข่าย & เสียง">
                <Row className="mb-3">
                  <Form.Group as={Col} md="4" className="mb-3">
                    <Form.Check 
                      type="checkbox"
                      label="มี WiFi"
                      ref={wifiRef}
                    />
                  </Form.Group>

                  <Form.Group as={Col} md="4" className="mb-3">
                    <Form.Label><b>ยี่ห้อ WiFi</b></Form.Label>
                    <Form.Control 
                      type="text" 
                      ref={wifibrandRef}
                      maxLength={50} 
                    />
                  </Form.Group>

                  <Form.Group as={Col} md="4" className="mb-3">
                    <Form.Label><b>รุ่น WiFi</b></Form.Label>
                    <Form.Control 
                      type="text" 
                      ref={wifimodelRef}
                      maxLength={50} 
                    />
                  </Form.Group>

                  <Form.Group as={Col} md="4" className="mb-3">
                    <Form.Label><b>LAN Port</b></Form.Label>
                    <Form.Control 
                      type="number" 
                      ref={lanRef}
                      min="0"
                      max="10"
                      defaultValue="0"
                    />
                  </Form.Group>

                  <Form.Group as={Col} md="4" className="mb-3">
                    <Form.Label><b>ยี่ห้อ LAN</b></Form.Label>
                    <Form.Control 
                      type="text" 
                      ref={lanbrandRef}
                      maxLength={50} 
                    />
                  </Form.Group>

                  <Form.Group as={Col} md="4" className="mb-3">
                    <Form.Label><b>รุ่น LAN</b></Form.Label>
                    <Form.Control 
                      type="text" 
                      ref={lanmodelRef}
                      maxLength={50} 
                    />
                  </Form.Group>

                  <Form.Group as={Col} md="3" className="mb-3">
                    <Form.Label><b>Speaker</b></Form.Label>
                    <Form.Control 
                      type="number" 
                      ref={speakerRef}
                      min="0"
                      max="10"
                      defaultValue="0"
                    />
                  </Form.Group>

                  <Form.Group as={Col} md="3" className="mb-3">
                    <Form.Label><b>Headphone</b></Form.Label>
                    <Form.Control 
                      type="number" 
                      ref={headphoneRef}
                      min="0"
                      max="10"
                      defaultValue="0"
                    />
                  </Form.Group>

                  <Form.Group as={Col} md="3" className="mb-3">
                    <Form.Label><b>RS232</b></Form.Label>
                    <Form.Control 
                      type="number" 
                      ref={rs232Ref}
                      min="0"
                      max="10"
                      defaultValue="0"
                    />
                  </Form.Group>

                  <Form.Group as={Col} md="3" className="mb-3">
                    <Form.Label><b>RS485</b></Form.Label>
                    <Form.Control 
                      type="number" 
                      ref={rs485Ref}
                      min="0"
                      max="10"
                      defaultValue="0"
                    />
                  </Form.Group>
                </Row>
              </Tab>

              {/* Tab 5: System Specifications & Status */}
              <Tab eventKey="system" title="ระบบ & สถานะ">
                <Row className="mb-3">
                  <Form.Group as={Col} md="6" className="mb-3">
                    <Form.Label><b>ระบบปฏิบัติการ</b></Form.Label>
                    <Form.Control 
                      type="text" 
                      ref={osTypeRef}
                      maxLength={50} 
                      placeholder="เช่น Windows 11, Ubuntu 20.04"
                    />
                  </Form.Group>

                  <Form.Group as={Col} md="6" className="mb-3">
                    <Form.Label><b>Windows License</b></Form.Label>
                    <Form.Control 
                      type="text" 
                      ref={windowsLicenseRef}
                      maxLength={50} 
                    />
                  </Form.Group>

                  <Form.Group as={Col} md="12" className="mb-3">
                    <Form.Label><b>CPU</b></Form.Label>
                    <Form.Control 
                      type="text" 
                      ref={cpuRef}
                      maxLength={50} 
                      placeholder="เช่น Intel Core i5-12400, AMD Ryzen 5 5600X"
                    />
                  </Form.Group>

                  <Form.Group as={Col} md="6" className="mb-3">
                    <Form.Label><b>SSD/HDD</b></Form.Label>
                    <Form.Control 
                      type="text" 
                      ref={ssdHddRef}
                      maxLength={50} 
                      placeholder="เช่น SSD 256GB, HDD 1TB"
                    />
                  </Form.Group>

                  <Form.Group as={Col} md="6" className="mb-3">
                    <Form.Label><b>SSD Serial Number</b></Form.Label>
                    <Form.Control 
                      type="text" 
                      ref={ssdSNRef}
                      maxLength={50} 
                    />
                  </Form.Group>

                  <Form.Group as={Col} md="6" className="mb-3">
                    <Form.Label><b>RAM</b></Form.Label>
                    <Form.Control 
                      type="text" 
                      ref={ramRef}
                      maxLength={50} 
                      placeholder="เช่น DDR4 8GB, DDR5 16GB"
                    />
                  </Form.Group>

                  <Form.Group as={Col} md="6" className="mb-3">
                    <Form.Label><b>สถานะสินค้า</b></Form.Label>
                    <Form.Select ref={productStatusRef}>
                      <option value="">เลือกสถานะ</option>
                      <option value="OK">OK</option>
                      <option value="NG">NG</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group as={Col} md="12" className="mb-3">
                    <Form.Label><b>หมายเหตุ</b></Form.Label>
                    <Form.Control 
                      as="textarea"
                      rows={3}
                      ref={noteRef}
                      maxLength={1000} 
                    />
                  </Form.Group>
                </Row>
              </Tab>

            </Tabs>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              <b>ยกเลิก</b>
            </Button>
            <Button type="submit" variant="success">
              <b>บันทึก</b>
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
}

export default ProductAdd;