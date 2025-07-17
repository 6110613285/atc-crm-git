import React, { useState, useEffect, useRef } from "react";
import { Camera, Upload, X, CheckCircle, Video, VideoOff } from "lucide-react";

const Upimage = ({ onClose, defaultPartNum = "" }) => {
  const [file, setFile] = useState(null);
  const [partNum, setPartNum] = useState(defaultPartNum);
  const [imagePreview, setImagePreview] = useState(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [hoveredButton, setHoveredButton] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  console.log(defaultPartNum);

  // เปิดหรือปิดกล้อง
  const handleToggleCamera = async () => {
    if (cameraOn) {
      handleCloseCamera();
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },  // กล้องหลัง
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
          setCameraOn(true);
        } else {
          console.error("Video element not ready");
          alert("เกิดข้อผิดพลาด: Video ไม่พร้อม");
        }
      } catch (error) {
        console.error("ไม่สามารถเปิดกล้องได้:", error.name, error.message);
        alert(`ไม่สามารถเปิดกล้องได้: ${error.name}`);
      }
    }
  };

  // ปิดกล้อง
  const handleCloseCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraOn(false);
  };

  // ถ่ายรูปและปิดกล้อง
  const handleTakePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageDataURL = canvas.toDataURL("image/png");
    setImagePreview(imageDataURL);

    fetch(imageDataURL)
      .then((res) => res.blob())
      .then((blob) => {
        const newFile = new File([blob], `photo_${Date.now()}.png`, { type: "image/png" });
        setFile(newFile);
        handleCloseCamera();
      });
  };

  const handleUpload = async () => {
    if (!file || !defaultPartNum) {
      console.log(defaultPartNum);
      return alert("กรุณาเลือกรูปหรือถ่ายรูป และกรอกรหัส part_num");
    }

    const formData = new FormData();
    formData.append("image", file);
    formData.append("part_num", defaultPartNum);

    try {
      const response = await fetch(`${import.meta.env.VITE_SERVER}/Upload.php`, {
        method: "POST",
        body: formData,
      });
      const result = await response.json();

      if (result.status === "success") {
        alert("✅ อัปโหลดสำเร็จ!");
        setFile(null);
        setImagePreview(null);
        setPartNum("");
        // ปิดป็อบอัพหลังอัปโหลดสำเร็จ (ถ้ามี onClose prop)
        if (onClose) {
          onClose();
        }
      } else {
        alert("❌ เกิดข้อผิดพลาด: " + result.message);
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("❌ เกิดข้อผิดพลาดในการอัปโหลด");
    }
  };

  // ใช้สไตล์จากชุดโค้ดที่ 1
  const containerStyle = {
    background: 'transparent',
    padding: '32px',
    borderRadius: '12px',
    border: '2px solid #22c55e', // เพิ่มเส้นขอบสีเขียว
    color: '#ffffff',
    width: '100%',
    maxWidth: '700px', // เพิ่มขนาดจาก 500px เป็น 600px
    // marginTop: '20px',    // ระยะห่างจากขอบบน
    // marginBottom: '200x', // ระยะห่างจากขอบล่าง
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    alignItems: 'center',
    minHeight: '600px'
  };

  const titleStyle = {
    fontSize: '28px',
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  };

  const inputContainerStyle = {
    width: '100%',
    marginBottom: '8px'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#cccccc'
  };

  const inputStyle = {
    width: '100%',
    padding: '14px 16px',
    borderRadius: '6px',
    background: '#2a2a2a',
    border: '1px solid #444444',
    outline: 'none',
    color: '#ffffff',
    fontSize: '16px',
    transition: 'all 0.3s ease',
    boxSizing: 'border-box'
  };

  const fileInputStyle = {
    width: '100%',
    padding: '14px 16px',
    borderRadius: '6px',
    background: '#2a2a2a',
    border: '1px solid #444444',
    color: '#ffffff',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxSizing: 'border-box'
  };

  const buttonContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
    marginTop: '16px',
    width: '100%'
  };

  const videoStyle = {
    borderRadius: '8px',
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
    border: '1px solid #444444',
    display: cameraOn ? 'block' : 'none',
    backgroundColor: '#000000',
    objectFit: 'cover'
  };

  const primaryButtonStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: cameraOn ? '#ef4444' : '#6b7280',
    color: '#ffffff',
    fontWeight: '600',
    padding: '12px 24px',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'all 0.3s ease',
    boxShadow: cameraOn ? '0 2px 8px rgba(239, 68, 68, 0.3)' : '0 2px 8px rgba(107, 114, 128, 0.3)',
    minWidth: '160px',
    justifyContent: 'center'
  };

  const captureButtonStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: '#f59e0b',
    color: '#ffffff',
    fontWeight: '600',
    padding: '12px 24px',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)',
    minWidth: '160px',
    justifyContent: 'center'
  };

  const uploadButtonStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: '100%',
    background: '#22c55e',
    color: '#ffffff',
    fontWeight: '600',
    padding: '16px 24px',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '18px',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)',
    marginTop: '16px'
  };

  const previewContainerStyle = {
    marginTop: '16px',
    textAlign: 'center',
    width: '100%'
  };

  const previewTitleStyle = {
    fontWeight: '600',
    marginBottom: '12px',
    color: '#cccccc',
    fontSize: '16px'
  };

  const previewImageStyle = {
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
    width: '100%',
    maxWidth: '400px',
    border: '1px solid #444444',
    backgroundColor: '#000000',
    objectFit: 'cover'
  };

  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>
        <Camera size={32} />
        อัปโหลดหรือถ่ายรูป
      </h2>
      <div style={buttonContainerStyle}>
        {/* ✅ <video> Render ตลอด ไม่โดนลบ */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          style={videoStyle}
        />
        {cameraOn && (
          <button
            onClick={handleTakePhoto}
            style={{
              ...captureButtonStyle,
              ...(hoveredButton === 'capture' ? { transform: 'translateY(-2px)' } : {})
            }}
            onMouseEnter={() => setHoveredButton('capture')}
            onMouseLeave={() => setHoveredButton(null)}
          >
            <Camera size={20} />
            take a photo
          </button>
        )}
        <button
          onClick={handleToggleCamera}
          style={{
            ...primaryButtonStyle,
            ...(hoveredButton === 'camera' ? { transform: 'translateY(-2px)' } : {})
          }}
          onMouseEnter={() => setHoveredButton('camera')}
          onMouseLeave={() => setHoveredButton(null)}
        >
          {cameraOn ? <VideoOff size={20} /> : <Video size={20} />}
          {cameraOn ? "Close" : "Open"}
        </button>

        
      </div>

      <div style={inputContainerStyle}>
        <label style={labelStyle}>เลือกรูปจากเครื่อง</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const selectedFile = e.target.files[0];
            if (selectedFile) {
              setFile(selectedFile);
              setImagePreview(URL.createObjectURL(selectedFile));
            }
          }}
          style={fileInputStyle}
        />
      </div>

      

      {imagePreview && (
        <div style={previewContainerStyle}>
          <h3 style={previewTitleStyle}>ภาพที่เลือกหรือถ่ายไว้:</h3>
          <img src={imagePreview} alt="Preview" style={previewImageStyle} />
        </div>
      )}

      <button
        onClick={handleUpload}
        style={{
          ...uploadButtonStyle,
          ...(hoveredButton === 'upload' ? {
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 16px rgba(34, 197, 94, 0.4)'
          } : {})
        }}
        onMouseEnter={() => setHoveredButton('upload')}
        onMouseLeave={() => setHoveredButton(null)}
      >
        <Upload size={20} />
        Uplode
      </button>

      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
};

export default Upimage;