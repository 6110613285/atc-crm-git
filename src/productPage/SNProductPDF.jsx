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
export const cmToPt = (cm) => cm * 29.35;

// สร้าง StyleSheet
const styles = StyleSheet.create({
  page: {
    padding: 4,
    backgroundColor: "#fff",
    fontSize: 6,
    fontFamily: "SukhumvitSet",
  },
  container: {
    flex: 1,
    flexDirection: "column",
    height: "100%",
  },
  
  headerSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 3,
  },
  
  logo: {
    width: cmToPt(2.0),
    height: cmToPt(0.5),
  },
  
  passwordInfo: {
    fontSize: 7,
    fontWeight: "bold",
    textAlign: "right",
  },
  
  mainContent: {
    flexDirection: "row",
    flex: 1,
  },
  
  qrSection: {
    width: "35%",
    alignItems: "center",
    justifyContent: "center",
    paddingRight: 4,
  },
  
  qrContainer: {
    width: cmToPt(1.6),
    height: cmToPt(1.6),
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  qrCode: {
    width: cmToPt(1.4),
    height: cmToPt(1.4),
  },
  
  infoSection: {
    width: "65%",
    justifyContent: "center",
    paddingLeft: 4,
  },
  
  specRow: {
    flexDirection: "row",
    marginBottom: 1,
    alignItems: "flex-start",
  },
  
  specLabel: {
    fontSize: 6,
    fontWeight: "bold",
    width: 15,
  },
  
  specValue: {
    fontSize: 6,
    fontWeight: "bold",
    flex: 1,
  },
});

// คอมโพเนนต์สำหรับเนื้อหาป้าย
export const ComputerLabelContent = ({ data }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState("");

  useEffect(() => {
    // Generate QR code จาก serial number
    if (data && data.serial) {
      QRCode.toDataURL(data.serial, {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        width: 200
      })
        .then((url) => setQrCodeUrl(url))
        .catch((err) => console.error("QRCode generation error:", err));
    }
  }, [data]);

  // Return null if data is not available
  if (!data) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Header Section - บรรทัดบน */}
      <View style={styles.headerSection}>
        <Image src={logoPath} style={styles.logo} />
        {/* <Text style={styles.passwordInfo}>password : {data.password || '1234'}</Text> */}
      </View>

      {/* Main Content - บรรทัดล่าง */}
      <View style={styles.mainContent}>
        {/* QR Code Section - ซ้าย */}
        <View style={styles.qrSection}>
          <View style={styles.qrContainer}>
            {qrCodeUrl && <Image src={qrCodeUrl} style={styles.qrCode} />}
          </View>
        </View>

        {/* Information Section - ขวา */}
        <View style={styles.infoSection}>
          <View style={styles.specRow}>
            <Text style={styles.specLabel}>Serial</Text>
            <Text style={styles.specValue}>: {data.serial}</Text>
          </View>
          
          <View style={styles.specRow}>
            <Text style={styles.specLabel}>CPU</Text>
            <Text style={styles.specValue}>: {data.cpu}</Text>
          </View>
          
          <View style={styles.specRow}>
            <Text style={styles.specLabel}>RAM</Text>
            <Text style={styles.specValue}>: {data.ram}</Text>
          </View>
          
          <View style={styles.specRow}>
            <Text style={styles.specLabel}>SSD</Text>
            <Text style={styles.specValue}>: {data.ssd}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

// คอมโพเนนต์หลัก
export const ComputerLabelPDF = ({ data }) => (
  <Document>
    <Page size={[cmToPt(5.0), cmToPt(2.5)]} style={styles.page}>
      <ComputerLabelContent data={data} />
    </Page>
  </Document>
);

// คอมโพเนนต์สำหรับการพิมพ์หลายป้าย
export const MultipleComputerDocument = ({ computersData }) => {
  // กรองข้อมูลที่ไม่ว่าง
  const validData = computersData.filter(data => data && data.serial);
  
  return (
    <Document>
      {validData.map((computer, index) => (
        <Page 
          key={index} 
          size={[cmToPt(5.0), cmToPt(2.5)]} 
          style={styles.page}
          wrap={false}
        >
          <ComputerLabelContent data={computer} />
        </Page>
      ))}
    </Document>
  );
};

// PDF Viewer Component สำหรับเรียกใช้ในหน้า React
const ComputerLabelPDFViewer = ({ data }) => {
  return (
    <PDFViewer width="100%" height="500px">
      <ComputerLabelPDF data={data} />
    </PDFViewer>
  );
};

export default ComputerLabelPDFViewer;