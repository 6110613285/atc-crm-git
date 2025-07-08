import React, { useState,useEffect, useRef } from "react";
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

  // อัปโหลด
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
  const containerStyle = {
    background: 'rgba(17, 24, 39, 0.95)',
    padding: '32px',
    borderRadius: '16px',
    color: '#ffffff',
    width: '100%',
    maxWidth: '500px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    alignItems: 'center',
    minHeight: '600px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
    border: '1px solid rgba(34, 197, 94, 0.2)'
  };

  const titleStyle = {
    fontSize: '28px',
    fontWeight: '700',
    color: '#22c55e',
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
    color: '#d1d5db'
  };

  const inputStyle = {
    width: '100%',
    padding: '14px 16px',
    borderRadius: '8px',
    background: '#374151',
    border: '1px solid #4b5563',
    outline: 'none',
    color: '#ffffff',
    fontSize: '16px',
    transition: 'all 0.3s ease',
    boxSizing: 'border-box'
  };

  const fileInputStyle = {
    width: '100%',
    padding: '14px 16px',
    borderRadius: '8px',
    background: '#374151',
    border: '1px solid #4b5563',
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
    borderRadius: '12px',
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
    border: '2px solid #22c55e',
    display: cameraOn ? 'block' : 'none',
    backgroundColor: '#000000',
    objectFit: 'cover'
  };

  const primaryButtonStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: cameraOn ? '#ef4444' : '#22c55e',
    color: '#ffffff',
    fontWeight: '600',
    padding: '12px 24px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'all 0.3s ease',
    boxShadow: cameraOn ? '0 4px 12px rgba(239, 68, 68, 0.3)' : '0 4px 12px rgba(34, 197, 94, 0.3)',
    minWidth: '160px',
    justifyContent: 'center'
  };

  const captureButtonStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: '#10b981',
    color: '#ffffff',
    fontWeight: '600',
    padding: '12px 24px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
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
    borderRadius: '8px',
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
    color: '#22c55e',
    fontSize: '16px'
  };

  const previewImageStyle = {
    borderRadius: '12px',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
    width: '100%',
    maxWidth: '400px',
    border: '2px solid #22c55e',
    backgroundColor: '#000000',
    objectFit: 'cover'
  };

  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>
        <Camera size={32} />
        📷 อัปโหลดหรือถ่ายรูป
      </h2>

      {/* <div style={inputContainerStyle}>
        <label style={labelStyle}>รหัส Part Number</label>
        <input
          type="text"
          placeholder="กรอกรหัส part_num"
          value={partNum}
          onChange={(e) => setPartNum(e.target.value)}
          style={inputStyle}
          onFocus={(e) => {
            e.target.style.borderColor = '#22c55e';
            e.target.style.boxShadow = '0 0 0 2px rgba(34, 197, 94, 0.1)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#4b5563';
            e.target.style.boxShadow = 'none';
          }}
        />
      </div> */}

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

      <div style={buttonContainerStyle}>
        {/* ✅ <video> Render ตลอด ไม่โดนลบ */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          style={videoStyle}
        />

        <button
          onClick={handleToggleCamera}
          style={{
            ...primaryButtonStyle,
            ...(hoveredButton === 'camera' ? {
              transform: 'translateY(-2px)',
              boxShadow: cameraOn ? '0 6px 16px rgba(239, 68, 68, 0.4)' : '0 6px 16px rgba(34, 197, 94, 0.4)'
            } : {})
          }}
          onMouseEnter={() => setHoveredButton('camera')}
          onMouseLeave={() => setHoveredButton(null)}
        >
          {cameraOn ? <VideoOff size={20} /> : <Video size={20} />}
          {cameraOn ? "ปิดกล้อง" : "เปิดกล้อง"}
        </button>

        {cameraOn && (
          <button
            onClick={handleTakePhoto}
            style={{
              ...captureButtonStyle,
              ...(hoveredButton === 'capture' ? {
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 16px rgba(16, 185, 129, 0.4)'
              } : {})
            }}
            onMouseEnter={() => setHoveredButton('capture')}
            onMouseLeave={() => setHoveredButton(null)}
          >
            <Camera size={20} />
            ถ่ายรูป
          </button>
        )}
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
        อัปโหลด
      </button>

      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
};

export default Upimage;