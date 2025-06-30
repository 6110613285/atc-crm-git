import React, { useState } from "react";
import { FaUpload } from "react-icons/fa";

const Upimage = () => {
  const [file, setFile] = useState(null);
  const [partNum, setPartNum] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file || !partNum) {
      return alert("กรุณาเลือกรูปและกรอกรหัส part_num");
    }

    const formData = new FormData();
    formData.append("image", file);
    formData.append("part_num", partNum);

    try {
      const response = await fetch(`${import.meta.env.VITE_SERVER}/Upload.php`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.status === "success") {
        alert("อัปโหลดสำเร็จ!");
        setFile(null);
        setPartNum("");
      } else {
        alert("เกิดข้อผิดพลาด: " + result.message);
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("เกิดข้อผิดพลาดในการอัปโหลด");
    }
  };

  return (
    <div className="bg-gray-900 p-6 rounded-2xl text-white w-full max-w-md mx-auto shadow-lg">
      <h5 className="text-xl font-bold mb-4 text-green-400">📷 อัปโหลดรูปภาพ</h5>

      <div className="mb-3">
        <label className="block mb-1">รหัส Part Number</label>
        <input
          type="text"
          placeholder="กรอกรหัส part_num"
          value={partNum}
          onChange={(e) => setPartNum(e.target.value)}
          className="w-full p-2 rounded-md bg-gray-800 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-400"
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1">เลือกรูปภาพ</label>
        <input type="file" onChange={handleFileChange} className="text-white" />
      </div>

      <button
        onClick={handleUpload}
        className="flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-md transition duration-300"
      >
        <FaUpload />
        อัปโหลด
      </button>
    </div>
  );
};

export default Upimage;
