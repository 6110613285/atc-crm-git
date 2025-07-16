import React, { useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";

const QrScanner = ({ onScan, buttonOnly = false, readerId = "reader" }) => {
  const readerRef = useRef(null);
  const html5QrCodeRef = useRef(null);

  const startScanner = () => {
    const qrRegionId = readerId;
    if (!html5QrCodeRef.current) {
      html5QrCodeRef.current = new Html5Qrcode(qrRegionId);
    }

    html5QrCodeRef.current
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        (decodedText) => {
          if (onScan) {
            onScan(decodedText);
          }
          html5QrCodeRef.current.stop();
        },
        (errorMessage) => {
          console.warn("สแกนไม่สำเร็จ", errorMessage);
        }
      )
      .catch((err) => {
        console.error("เกิดข้อผิดพลาด", err);
      });
  };

  if (buttonOnly) {
    return (
      <button
        type="button"
        onClick={startScanner}
        className="btn btn-outline-primary btn-sm"
        title="สแกน QR Code"
      >
        📷
      </button>
    );
  }

  return (
    <div className="p-1 text-center">
      <button
        onClick={startScanner}
        className="btn btn-outline-primary btn-sm"
      >
        📷
      </button>

      <div id={readerId} className="mx-auto mt-4" style={{ width: "300px" }} ref={readerRef}></div>
    </div>
  );
};

export default QrScanner;