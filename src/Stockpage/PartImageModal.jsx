import React, { useState, useEffect } from "react";
import { Modal, Spinner, Button } from "react-bootstrap";
import { Camera, Trash2 } from "lucide-react";
import Swal from "sweetalert2";

function PartImageModal({ partNum, show, onClose }) {
    const [imageUrls, setImageUrls] = useState([]);
    const [loading, setLoading] = useState(false);

    // ✅ ฟังก์ชันดึงรูปภาพทั้งหมดของ partNum
    const fetchImages = () => {
        setLoading(true);
        fetch(`${import.meta.env.VITE_SERVER}/Store.php?action=getPartImages&partNum=${encodeURIComponent(partNum)}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.status === "success") {
                    setImageUrls(data.images || []);
                } else {
                    setImageUrls([]);
                }
                setLoading(false);
            })
            .catch(() => {
                setImageUrls([]);
                setLoading(false);
            });
    };

    useEffect(() => {
        if (show && partNum) {
            fetchImages();
        } else {
            setImageUrls([]);
        }
    }, [show, partNum]);

    // ✅ ลบรูปแบบเจาะจง
    const handleDelete = (imgUrl) => {
    const confirm = window.confirm("คุณต้องการลบรูปภาพนี้หรือไม่?");
    if (!confirm) return;
    
    // ตัดเฉพาะ path จริง
    const imagePath = imgUrl.split("/ERP/atc-crm-api/")[1];
    
    const formData = new FormData();
    formData.append("partNum", partNum);
    formData.append("image", imagePath);
    
    fetch(`${import.meta.env.VITE_SERVER}/Store.php?action=deletePartImage`, {
        method: "POST",
        body: formData,
    })
    .then((res) => res.json())
    .then((data) => {
        if (data.status === "success") {
            Swal.fire("สำเร็จ", "ลบรูปภาพเรียบร้อยแล้ว", "success");
            fetchImages(); // รีเฟรชรายการรูป
        } else {
            Swal.fire("ผิดพลาด", data.message || "ไม่สามารถลบรูปได้", "error");
            // แสดงข้อมูล debug ใน console
            console.log("Debug info:", data);
        }
    })
    .catch(() => {
        Swal.fire("ผิดพลาด", "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์", "error");
    });
}; 

    const imageContainerStyle = {
        display: "flex",
        flexWrap: "wrap",
        gap: "20px",
        justifyContent: "center",
        marginTop: "20px",
    };

    return (
        <Modal show={show} onHide={onClose} centered size="lg" contentClassName="dark-modal">
            <div style={{ backgroundColor: "#2a2a2a", color: "white" }}>
                <Modal.Header 
                    closeButton 
                        style={{ 
                            borderBottom: "1px solid #4a5568",
                             borderRadius: "150px 150px 0 0" 
                             }}>
                    <Modal.Title 
                        style={{ 
                            color: "#198754", 
                            fontSize: "18px"
                             }}>
                        รูปภาพของชิ้นส่วน {partNum}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ backgroundColor: "#2a2a2a" }}>
                    {loading && (
                        <div className="text-center p-4">
                            <Spinner animation="border" style={{ color: "#198754" }} />
                            <div className="text-muted mt-2">กำลังโหลดรูปภาพ...</div>
                        </div>
                    )}
                    {!loading && imageUrls.length === 0 && (
                        <div className="text-center text-muted p-4">
                            <Camera size={48} color="#a0aec0" />
                            <p>ยังไม่มีรูปภาพสำหรับชิ้นส่วนนี้</p>
                        </div>
                    )}
                    {!loading && imageUrls.length > 0 && (
                        <div style={imageContainerStyle}>
                            {imageUrls.map((img, index) => (
                                <div key={index} style={{ position: "relative" }}>
                                    <img
                                        src={img}
                                        alt={`รูปที่ ${index + 1}`}
                                        style={{
                                            width: "200px",
                                            height: "150px",
                                            objectFit: "cover",
                                            borderRadius: "8px",
                                            border: "2px solid #4a5568",
                                        }}
                                    />
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        onClick={() => handleDelete(img)}
                                        style={{
                                            position: "absolute",
                                            top: "10px",
                                            right: "10px",
                                            borderRadius: "20%",
                                            padding: "6px",
                                        }}
                                    >
                                        <Trash2 size={16} />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </Modal.Body>
            </div>
            <style>{`
                .dark-modal .modal-content {
                    background-color: #2a2a2a !important;
                    border: 1px solid #4a5568 !important;
                }
                .dark-modal .btn-close {
                    filter: invert(1);
                }
            `}</style>
        </Modal>
    );
}

export default PartImageModal;