import React, { useState, useEffect } from "react";
import { Modal, Button, Spinner } from "react-bootstrap";

function PartImageModal({ partNum, show, onClose }) {
    const [imageUrls, setImageUrls] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (show && partNum) {
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
        } else {
            setImageUrls([]);
        }
    }, [show, partNum]);

    return (
        <Modal show={show} onHide={onClose} centered size="lg">
            <Modal.Header closeButton>
                <Modal.Title>รูปภาพของชิ้นส่วน {partNum}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {loading && <Spinner animation="border" />}
                {!loading && imageUrls.length === 0 && <p>ยังไม่มีรูปภาพสำหรับชิ้นส่วนนี้</p>}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                    {imageUrls.map((img, index) => (
                        <img key={index} src={img} alt={`รูปที่ ${index + 1}`} style={{ width: '150px', margin: '10px' }} />
                    ))}
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onClose}>
                    ปิด
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default PartImageModal;
