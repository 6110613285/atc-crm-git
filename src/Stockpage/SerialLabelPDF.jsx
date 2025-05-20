import React, { useEffect, useState } from "react";
import {
  PDFViewer,
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
  Font,
} from "@react-pdf/renderer";
import QRCode from "qrcode";

import logoPath from '../assets/NEWLOGO-04.jpg';

// Import font ภาษาไทย
import fontBold from "/public/font/SukhumvitSet-Bold.ttf";
import fontMedium from "/public/font/SukhumvitSet-Medium.ttf";

// Register the fonts
Font.register({
  family: "SukhumvitSet",
  fonts: [
    { src: fontMedium, fontWeight: "normal" },
    { src: fontBold, fontWeight: "bold" },
  ],
});

// กำหนดหน่วยเป็นเซนติเมตร (cm to pt conversion: 1cm = 28.35pt)
export const cmToPt = (cm) => cm * 28.34;

// สร้าง StyleSheet
const styles = StyleSheet.create({
  page: {
    // width: cmToPt(5),
    // height: cmToPt(2.5),
    padding: 0,
    backgroundColor: "#fff",
    fontSize: 6,
    fontFamily: "SukhumvitSet",
  },
  container: {
    flex: 1,
    flexDirection: "row",
  },
  qrSection: {
    width: "35%",
    alignItems: "center",
    justifyContent: "flex-end", // เปลี่ยนเป็น flex-end เพื่อจัดเรียงจากล่างขึ้นบน
    padding: 2,
  },
  
  logoContainer: {
    // marginBottom: cmToPt(0.03), // เพิ่มระยะห่างระหว่างโลโก้กับ QR code
    alignSelf: "flex-start", // จัดให้อยู่ด้านซ้าย
    left: cmToPt(0.05),
    top : cmToPt(-0.05),
  },
  
  logo: {
    width: cmToPt(1.7),
    height: cmToPt(0.4),
  },
  
  qrContainer: {
    width: cmToPt(1.7),
    height: cmToPt(1.7),
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  qrCode: {
    width: cmToPt(1.5),
    height: cmToPt(1.5),
  },
  
  qrOverlayLogo: {
    position: 'absolute',
    width: cmToPt(1),  
    height: cmToPt(0.3), 
    top: cmToPt(0),    
    left: cmToPt(0.3),  
    opacity: 1.0,
  },
  infoSection: {
    width: "65%",
    padding: 7,
    justifyContent: "center",
    marginLeft: 5,
  },
  serialNumber: {
    fontSize: 7,
    fontWeight: "bold",
    marginBottom: 0.5,
  },
  partInfo: {
    fontSize: 6,
    fontWeight: "bold",
    marginBottom: 0.5,
    
  },
  dateInfo: {
    fontSize: 5,
    fontWeight: "bold",
  },
  packInfo: {
    fontSize: 5,
    fontWeight: "bold",
    marginTop: 0.5,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start', // ปรับให้เริ่มจากซ้าย
    alignItems: 'center',         // จัดให้อยู่กึ่งกลางตามแนวตั้ง
  },
  packInfoInRow: {
    fontSize: 5,
    fontWeight: "bold",
    marginRight: 5,       // ลดระยะห่างลงให้เหลือแค่ 5 จุด
    width: 'auto',        // ปรับให้กว้างตามเนื้อหา ไม่กำหนดตายตัว
  },
  dateInfoInRow: {
    fontSize: 5,
    fontWeight: "bold",
    width: 'auto',        // ปรับให้กว้างตามเนื้อหา ไม่กำหนดตายตัว
  },
  multilinePartName: {
    fontSize: 6,
    fontWeight: "bold",
    marginBottom: 0.5,
    marginRight: 5,   
  }
});

// คอมโพเนนต์สำหรับเนื้อหาป้าย
export const SerialLabelContent = ({ data }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState("");

  useEffect(() => {
    // Generate QR code จาก serial number
    if (data && data.serial) {
      QRCode.toDataURL(data.serial)
        .then((url) => setQrCodeUrl(url))
        .catch((err) => console.error("QRCode generation error:", err));
    }
  }, [data]);

  // Return null if data is not available
  if (!data) {
    return null;
  }

  const processPartName = (partName, maxLength) => {
    if (!partName) return [""];
    
    // คำนวณความยาวสูงสุดที่จะแสดงในบรรทัดแรก (หลัง "Name: ")
    const prefixLength = "Name: ".length;
    const firstLineMaxLength = maxLength - prefixLength;
    
    // ถ้าข้อความสั้นพอที่จะแสดงในบรรทัดเดียว
    if (partName.length <= firstLineMaxLength) {
      return [partName];
    }
    
    // แยกข้อความเป็นคำ (เพื่อไม่ตัดกลางคำ)
    const words = partName.split(' ');
    
    const lines = [];
    let currentLine = '';
    
    // สำหรับบรรทัดแรก (ที่มีความยาวจำกัดเพราะต้องมี "Name: " นำหน้า)
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      
      // ถ้าเพิ่มคำนี้แล้วยังอยู่ในความยาวที่กำหนด
      if ((currentLine + ' ' + word).trim().length <= firstLineMaxLength) {
        currentLine = currentLine ? `${currentLine} ${word}` : word;
      } else {
        // ถ้าเกินความยาว เก็บบรรทัดปัจจุบันและเริ่มบรรทัดใหม่
        lines.push(currentLine.trim());
        
        // ถ้าคำเดียวยาวเกินขนาดบรรทัด ต้องตัดคำ
        if (word.length > maxLength) {
          // ตัดคำยาวและเก็บส่วนที่เหลือไว้บรรทัดถัดไป
          currentLine = word.substring(0, maxLength);
          lines.push(currentLine);
          
          let remaining = word.substring(maxLength);
          while (remaining.length > 0) {
            currentLine = remaining.substring(0, maxLength);
            remaining = remaining.substring(maxLength);
            if (currentLine) lines.push(currentLine);
          }
          currentLine = '';
        } else {
          // ถ้าคำไม่ยาวเกิน เริ่มบรรทัดใหม่ด้วยคำนี้
          currentLine = word;
        }
      }
    }
    
    // อย่าลืมบรรทัดสุดท้าย
    if (currentLine) {
      lines.push(currentLine.trim());
    }
    
    // ตรวจสอบบรรทัดที่ 2 เป็นต้นไป และแบ่งเป็นบรรทัดย่อยถ้ายาวเกินไป
    let result = [lines[0]];  // เริ่มด้วยบรรทัดแรก
    
    // แยกบรรทัดที่เหลือถ้ายาวเกิน maxLength
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (line.length <= maxLength) {
        result.push(line);
      } else {
        // ถ้าบรรทัดยาวเกินไป แบ่งเป็นหลายบรรทัด
        let remaining = line;
        while (remaining.length > 0) {
          result.push(remaining.substring(0, maxLength));
          remaining = remaining.substring(maxLength);
        }
      }
    }
    
    return result;
  };
  // คำนวณวันที่จาก serial (หากมีรูปแบบเฉพาะ)
  const extractDateFromSerial = (serial) => {
    if (serial && serial.length >= 11) {
      const dateStr = serial.substring(2, 10);
      if (/^\d{8}$/.test(dateStr)) {
        const year = dateStr.substring(0, 4);
        const month = dateStr.substring(4, 6);
        const day = dateStr.substring(6, 8);
        return `${day}/${month}/${year}`;
      }
    }
    return "N/A";
  };

  // ตัดข้อความที่ยาวเกินไป
  const truncateText = (text, maxLength) => {
    if (!text) return "";
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  return (
    <View style={styles.container}>
      {/* QR Code Section - ด้านซ้าย - คงเดิม */}
      <View style={styles.qrSection}>
        {/* แยกโลโก้ออกมาเป็นส่วนแยกต่างหาก */}
        <View style={styles.logoContainer}>
          <Image src={logoPath} style={styles.logo} />
        </View>
        
        {/* QR code แยกต่างหาก ไม่มีโลโก้ซ้อนทับ */}
        <View style={styles.qrContainer}>
          {qrCodeUrl && <Image src={qrCodeUrl} style={styles.qrCode} />}
        </View>
      </View>

      {/* Information Section - ด้านขวา */}
      <View style={styles.infoSection}>
        <Text style={styles.serialNumber}>SN: {data.serial}</Text>
        
        
          <Text style={styles.partInfo}>
            Name: {processPartName(data.part_name, 25)[0]}
          </Text>
          {processPartName(data.part_name, 26).slice(1).map((line, index) => (
            <Text key={index} style={styles.multilinePartName}>
              {line}
            </Text>
          ))}
        
        
        <Text style={styles.partInfo}>PN: {truncateText(data.part_num, 20)}</Text>
        
        {/* Pack Size และ Date อยู่บรรทัดเดียวกัน */}
        <View style={styles.rowContainer}>
          {data.packsize && (
            <Text style={styles.packInfoInRow}>Pack Size: {data.packsize}</Text>
          )}
          <Text style={styles.dateInfoInRow}>Date: {extractDateFromSerial(data.serial)}</Text>
        </View>
      </View>
    </View>
  );
};

// คอมโพเนนต์หลัก
export const SerialLabelPDF = ({ data }) => (
  <Document>
    <Page size={[cmToPt(5), cmToPt(2.5)]} style={styles.page}>
      <SerialLabelContent data={data} />
    </Page>
  </Document>
);

// คอมโพเนนต์สำหรับการพิมพ์หลายป้าย
export const MultipleSerialDocument = ({ serialsData }) => {
  // กรองข้อมูลที่ไม่ว่าง
  const validData = serialsData.filter(data => data && data.serial);
  
  return (
    <Document>
      {validData.map((serial, index) => (
        <Page 
          key={index} 
          size={[cmToPt(5), cmToPt(2.5)]} 
          style={styles.page}
          wrap={false}
        >
          <SerialLabelContent data={serial} />
        </Page>
      ))}
    </Document>
  );
};

// PDF Viewer Component สำหรับเรียกใช้ในหน้า React
const SerialLabelPDFViewer = ({ data }) => {
  return (
    <PDFViewer width="100%" height="500px">
      <SerialLabelPDF data={data} />
    </PDFViewer>
  );
};

export default SerialLabelPDFViewer;