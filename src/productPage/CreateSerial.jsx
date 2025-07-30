import React, { useState } from "react";
import { Button } from "react-bootstrap";
import { Plus } from "react-bootstrap-icons";
import CreateSerialModal from "./CreateSerialModal"; // ✅ แก้ชื่อ import ให้ตรงกับไฟล์

function CreateSerial() {
  const [showItemDetail, setShowItemDetail] = useState(false);

  const handleAdd = () => {
    setShowItemDetail(true);
  };

  const handleSave = (success) => {
    if (success) {
      // รีเฟรชข้อมูล / แสดง toast / ทำอย่างอื่น
      console.log("Saved successfully!");
    }
    setShowItemDetail(false); // ปิด modal
  };

  return (
    <>
      <Button
        variant="success"
        style={{
          borderRadius: "6px",
          backgroundColor: "#007e33",
          borderColor: "#007e33",
        }}
        onClick={handleAdd}
      >
        <Plus size={18} className="me-1" /> Create Serial
      </Button>

      {/* ✅ เรียก Modal โดยควบคุมจาก state */}
      <CreateSerialModal show={showItemDetail} onHide={() => setShowItemDetail(false)} onSave={handleSave} />
    </>
  );
}

export default CreateSerial;
