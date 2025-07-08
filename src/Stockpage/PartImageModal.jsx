import React, { useState, useEffect } from "react";
import { Modal, Spinner } from "react-bootstrap";
import { Camera } from "lucide-react";

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

    const modalStyle = {
        backgroundColor: '#2a2a2a',
        color: 'white',
        border: '1px solid #4a5568'
    };

    const headerStyle = {
        backgroundColor: '#2a2a2a',
        borderBottom: '1px solid #4a5568',
        color: 'white'
    };

    const bodyStyle = {
        backgroundColor: '#2a2a2a',
        color: 'white'
    };

    const spinnerStyle = {
        color: '#198754'
    };

    const imageContainerStyle = {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '15px',
        justifyContent: 'center',
        marginTop: '20px'
    };

    const imageStyle = {
        width: '200px',
        height: '150px',
        objectFit: 'cover',
        borderRadius: '8px',
        border: '2px solid #4a5568',
        transition: 'transform 0.2s ease, border-color 0.2s ease'
    };

    const imageHoverStyle = {
        transform: 'scale(1.05)',
        borderColor: '#198754'
    };

    const noImageStyle = {
        textAlign: 'center',
        color: '#a0aec0',
        fontSize: '16px',
        padding: '40px 20px'
    };

    return (
        <Modal 
            show={show} 
            onHide={onClose} 
            centered 
            size="lg"
            contentClassName="dark-modal"
        >
            <div style={modalStyle}>
                <Modal.Header closeButton style={headerStyle}>
                    <Modal.Title style={{ color: '#198754', fontSize: '18px' }}>
                        รูปภาพของชิ้นส่วน {partNum}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body style={bodyStyle}>
                    {loading && (
                        <div style={{ textAlign: 'center', padding: '40px' }}>
                            <Spinner 
                                animation="border" 
                                style={spinnerStyle}
                                size="lg"
                            />
                            <div style={{ marginTop: '15px', color: '#a0aec0' }}>
                                กำลังโหลดรูปภาพ...
                            </div>
                        </div>
                    )}
                    {!loading && imageUrls.length === 0 && (
                        <div style={noImageStyle}>
                            <div style={{ marginBottom: '15px', opacity: 0.5 }}>
                                <Camera size={48} color="#a0aec0" />
                            </div>
                            <p>ยังไม่มีรูปภาพสำหรับชิ้นส่วนนี้</p>
                        </div>
                    )}
                    {!loading && imageUrls.length > 0 && (
                        <div style={imageContainerStyle}>
                            {imageUrls.map((img, index) => (
                                <img 
                                    key={index} 
                                    src={img} 
                                    alt={`รูปที่ ${index + 1}`} 
                                    style={imageStyle}
                                    onMouseEnter={(e) => {
                                        e.target.style.transform = imageHoverStyle.transform;
                                        e.target.style.borderColor = imageHoverStyle.borderColor;
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.transform = 'scale(1)';
                                        e.target.style.borderColor = '#4a5568';
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </Modal.Body>
            </div>
            
            <style jsx>{`
                .dark-modal .modal-content {
                    background-color: #2a2a2a !important;
                    border: 1px solid #4a5568 !important;
                }
                
                .dark-modal .btn-close {
                    filter: invert(1) !important;
                }
                
                .dark-modal .modal-header .btn-close:hover {
                    opacity: 0.8 !important;
                }
            `}</style>
        </Modal>
    );
}

export default PartImageModal;