import React, { useState, useEffect, useRef } from "react";
import { FormControl, Button, Table, Card, Container, Badge, Form, Row, Col, InputGroup } from "react-bootstrap";
import PaginationComponent from "../components/PaginationComponent";
import Swal from "sweetalert2";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
    Search,
    XCircle,
    CalendarDate,
    PersonFill,
    BoxSeamFill,
    GeoAltFill,
    FileText,
    BoxArrowInDown,
    BoxArrowUp,
    Building,
    Filter,
    ArrowRepeat,
    ArrowReturnLeft
} from "react-bootstrap-icons";

function LogHistory() {
    const userInfo = localStorage.getItem("fullname");
    const searchRef = useRef(null);

    // สถานะสำหรับ logs
    const [logs, setLogs] = useState([]);
    const [currentPageData, setCurrentPageData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [filterStatus, setFilterStatus] = useState("all");
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const itemsPerPage = 20;

    // ฟังก์ชันดึงข้อมูล logs
    const fetchLogs = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_SERVER}/Store.php?action=getLogs`);
            const data = await response.json();
            if (Array.isArray(data)) {
                setLogs(data);
                // เซ็ตข้อมูลหน้าแรกทันทีหลังจากได้ข้อมูล
                paginate(1, data);
            } else {
                setLogs([]);
                setCurrentPageData([]);
            }
        } catch (error) {
            console.error("Error fetching logs:", error);
            setLogs([]);
            setCurrentPageData([]);
        } finally {
            setIsLoading(false);
        }
    };

    // ฟังก์ชันสำหรับค้นหา logs
    const searchLogs = async () => {
        setIsLoading(true);
        try {
            const searchTerm = searchRef.current.value.trim();
            let queryParams = `search=${encodeURIComponent(searchTerm)}`;

            // เพิ่มพารามิเตอร์ status หากมีการกรอง
            if (filterStatus !== "all") {
                queryParams += `&status=${encodeURIComponent(filterStatus)}`;
            }

            // เพิ่มพารามิเตอร์ date range หากมีการกรอง
            if (startDate) {
                const formattedStartDate = formatDateForQuery(startDate);
                queryParams += `&start_date=${encodeURIComponent(formattedStartDate)}`;
            }

            if (endDate) {
                const formattedEndDate = formatDateForQuery(endDate);
                queryParams += `&end_date=${encodeURIComponent(formattedEndDate)}`;
            }

            const response = await fetch(
                `${import.meta.env.VITE_SERVER}/Store.php?action=searchLogs&${queryParams}`
            );

            const data = await response.json();
            if (Array.isArray(data)) {
                setLogs(data);
                paginate(1, data);
            } else {
                setLogs([]);
                setCurrentPageData([]);
            }
        } catch (error) {
            console.error("Error searching logs:", error);
            Swal.fire({
                position: "center",
                icon: "error",
                title: "เกิดข้อผิดพลาดในการค้นหาข้อมูล",
                showConfirmButton: false,
                timer: 2000,
            });
        } finally {
            setIsLoading(false);
        }
    };

    // ฟังก์ชันฟอร์แมตวันที่สำหรับการค้นหา (YYYY-MM-DD)
    const formatDateForQuery = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // ฟังก์ชันฟอร์แมตวันที่สำหรับการแสดงผล (DD/MM/YYYY HH:MM)
    const formatDateForDisplay = (dateString) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');

        return `${day}/${month}/${year} ${hours}:${minutes}`;
    };

    // ฟังก์ชัน pagination สำหรับ logs
    const paginate = (pageNumber, data = logs) => {
        const startIndex = (pageNumber - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        setCurrentPageData(data.slice(startIndex, endIndex));
        setCurrentPage(pageNumber);
    };

    // ฟังก์ชันสำหรับแสดงไอคอนตามสถานะ
    const renderStatusIcon = (status) => {
        switch (status) {
            case 'IN':
                return <BoxArrowInDown className="me-1" />;
            case 'OUT':
                return <BoxArrowUp className="me-1" />;
            case 'Receive':
                return <BoxSeamFill className="me-1" />;
            case 'Borrow':
                return <ArrowRepeat className="me-1" />;
            case 'Return':
            case 'Give Back':
                return <ArrowReturnLeft className="me-1" />;
            default:
                return <BoxSeamFill className="me-1" />;
        }
    };

    // ฟังก์ชันสำหรับแสดงสีของ Badge ตามสถานะ
    const getStatusBadgeStyle = (status) => {
        // สไตล์พื้นฐานที่ใช้ร่วมกัน
        const baseStyle = {
            color: "#fff",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "6px 12px",
            borderRadius: "20px",
            fontWeight: "500",
            fontSize: "0.8rem"
        };
        switch (status) {
            case 'In':
                return {
                    backgroundColor: "#00c853",
                    color: "#fff",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "6px 12px",
                    borderRadius: "20px",
                    fontWeight: "500",
                    fontSize: "0.8rem"
                };
            case 'Out':
                return {
                    backgroundColor: "#f44336",
                    color: "#fff",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "6px 12px",
                    borderRadius: "20px",
                    fontWeight: "500",
                    fontSize: "0.8rem"
                };
            case 'Receive':
                return {
                    backgroundColor: "#2196f3",
                    color: "#fff",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "6px 12px",
                    borderRadius: "20px",
                    fontWeight: "500",
                    fontSize: "0.8rem"
                };
            case 'Return':
                return {
                    backgroundColor: "#8bc34a",
                    color: "#fff",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "6px 12px",
                    borderRadius: "20px",
                    fontWeight: "500",
                    fontSize: "0.8rem"
                }; case 'Borrow':
                return {
                    backgroundColor: "#ffc107",
                    color: "#fff",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "6px 12px",
                    borderRadius: "20px",
                    fontWeight: "500",
                    fontSize: "0.8rem"
                };
            default:
                return {
                    backgroundColor: "#757575",
                    color: "#fff",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "6px 12px",
                    borderRadius: "20px",
                    fontWeight: "500",
                    fontSize: "0.8rem"
                };
        }
    };

    // โหลดข้อมูลเมื่อโหลดคอมโพเนนต์
    useEffect(() => {
        if (userInfo) {
            fetchLogs();
        }
    }, [userInfo]);

    // อัปเดตข้อมูลหน้าเมื่อข้อมูล logs เปลี่ยนแปลง
    useEffect(() => {
        paginate(currentPage);
    }, [logs]);

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            searchLogs();
        }
    };

    const customDatePickerStyles = {
        input: {
            backgroundColor: "#333333",
            color: "#e0e0e0",
            border: "1px solid #444444",
            borderRadius: "6px",
            padding: "8px 12px",
            width: "100%"
        }
    };

    return (
        <div className="min-vh-100" style={{
            fontFamily: "'Inter', 'Prompt', sans-serif",
            backgroundColor: "#1a1a1a",
            color: "#e0e0e0"
        }}>
            <Container fluid className="px-4 py-4">
                {/* ส่วนหัวของหน้า Log History - แบบบรรทัดเดียว */}
                <Card.Body className="p-3">
                    <div className="d-flex align-items-center justify-content-between">
                        {/* หัวข้อ Log History (ชิดซ้าย) */}
                        <div className="d-flex align-items-center">
                            <FileText className="me-2" size={24} style={{ color: "#00c853" }} />
                            <h5 className="m-0 fw-bold" style={{ color: "#00c853" }}>Log History</h5>
                        </div>

                        {/* ส่วนของฟอร์มค้นหาและตัวกรอง (ชิดขวา) */}
                        <div className="d-flex align-items-center flex-wrap justify-content-end">
                            {/* From Date */}
                            <div className="d-flex align-items-center me-2 mb-2 mb-md-0">
                                <div className="d-flex align-items-center me-1">
                                    <CalendarDate size={14} className="me-1" />
                                    <span>From:</span>
                                </div>
                                <DatePicker
                                    selected={startDate}
                                    onChange={(date) => setStartDate(date)}
                                    placeholderText="Select start date"
                                    dateFormat="dd/MM/yyyy"
                                    className="form-control form-control-sm"
                                    style={{ maxWidth: "120px" }}
                                    customInput={
                                        <Form.Control
                                            size="sm"
                                            style={{
                                                backgroundColor: "#333333",
                                                color: "#e0e0e0",
                                                border: "1px solid #444444",
                                                width: "130px"
                                            }}
                                        />
                                    }
                                />
                            </div>

                            {/* To Date */}
                            <div className="d-flex align-items-center me-2 mb-2 mb-md-0">
                                <div className="d-flex align-items-center me-1">
                                    <CalendarDate size={14} className="me-1" />
                                    <span>To:</span>
                                </div>
                                <DatePicker
                                    selected={endDate}
                                    onChange={(date) => setEndDate(date)}
                                    placeholderText="Select end date"
                                    dateFormat="dd/MM/yyyy"
                                    minDate={startDate}
                                    className="form-control form-control-sm"
                                    style={{ maxWidth: "120px" }}
                                    customInput={
                                        <Form.Control
                                            size="sm"
                                            style={{
                                                backgroundColor: "#333333",
                                                color: "#e0e0e0",
                                                border: "1px solid #444444",
                                                width: "130px"
                                            }}
                                        />
                                    }
                                />
                            </div>

                            {/* Status Filter */}
                            <div className="d-flex align-items-center me-2 mb-2 mb-md-0">
                                <div className="d-flex align-items-center me-1">
                                    <Filter size={14} className="me-1" />
                                    <span>Status:</span>
                                </div>
                                <Form.Select
                                    size="sm"
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    style={{
                                        backgroundColor: "#333333",
                                        color: "#e0e0e0",
                                        border: "1px solid #444444",
                                        width: "100px"
                                    }}
                                >
                                    <option value="all">ทั้งหมด</option>
                                    <option value="IN">IN</option>
                                    <option value="OUT">OUT</option>
                                    <option value="Receive">Receive</option>
                                    <option value="Borrow">Borrow</option>
                                    <option value="Give Back">Give Back</option>
                                </Form.Select>
                            </div>

                            {/* Search Box */}
                            <div className="d-flex mb-2 mb-md-0" style={{ maxWidth: "250px" }}>
                                <InputGroup size="sm">
                                    <FormControl
                                        size="sm"
                                        style={{
                                            backgroundColor: "#333333",
                                            color: "#e0e0e0",
                                            border: "1px solid #444444"
                                        }}
                                        placeholder="ค้นหาประวัติ..."
                                        ref={searchRef}
                                        onKeyPress={handleKeyPress}
                                    />
                                    <Button
                                        variant="success"
                                        size="sm"
                                        style={{
                                            backgroundColor: "#00c853",
                                            borderColor: "#00c853",
                                        }}
                                        onClick={searchLogs}
                                    >
                                        ค้นหา
                                    </Button>
                                </InputGroup>
                            </div>
                        </div>
                    </div>
                </Card.Body>

                <Card className="border-0 shadow-sm" style={{ backgroundColor: "#2a2a2a", color: "#e0e0e0" }}>
                    <Card.Body className="p-0">
                        <div className="table-responsive">
                            <Table hover className="m-0 align-middle table-dark">
                                <thead style={{ backgroundColor: "#1e1e1e" }}>
                                    <tr className="text-center">
                                        <th className="py-3 px-4" style={{ color: "#e0e0e0", borderBottom: "1px solid #444" }}>No.</th>
                                        <th className="py-3 px-4" style={{ color: "#e0e0e0", borderBottom: "1px solid #444" }}>Date/Time</th>
                                        <th className="py-3 px-4" style={{ color: "#e0e0e0", borderBottom: "1px solid #444" }}>User</th>
                                        <th className="py-3 px-4" style={{ color: "#e0e0e0", borderBottom: "1px solid #444" }}>Status</th>
                                        <th className="py-3 px-4" style={{ color: "#e0e0e0", borderBottom: "1px solid #444" }}>Part Number</th>
                                        <th className="py-3 px-4" style={{ color: "#e0e0e0", borderBottom: "1px solid #444" }}>Part Name</th>
                                        <th className="py-3 px-4" style={{ color: "#e0e0e0", borderBottom: "1px solid #444" }}>Serial Number</th>
                                        <th className="py-3 px-4" style={{ color: "#e0e0e0", borderBottom: "1px solid #444" }}>Location</th>
                                        <th className="py-3 px-4" style={{ color: "#e0e0e0", borderBottom: "1px solid #444" }}>Store Name</th>
                                        <th className="py-3 px-4" style={{ color: "#e0e0e0", borderBottom: "1px solid #444" }}>Qty</th>
                                        <th className="py-3 px-4" style={{ color: "#e0e0e0", borderBottom: "1px solid #444" }}>Supplier</th>
                                        <th className="py-3 px-4" style={{ color: "#e0e0e0", borderBottom: "1px solid #444" }}>Note</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan={12} className="text-center py-5">
                                                <div className="d-flex flex-column align-items-center">
                                                    <div className="spinner-border text-success mb-3" role="status">
                                                        <span className="visually-hidden">Loading...</span>
                                                    </div>
                                                    <span className="text-muted">กำลังโหลดข้อมูล...</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : currentPageData.length === 0 ? (
                                        <tr>
                                            <td colSpan={12} className="text-center py-5" style={{ color: "#bdbdbd" }}>
                                                <div className="d-flex flex-column align-items-center">
                                                    <FileText size={40} className="mb-2 text-muted" />
                                                    <span className="fw-medium">ไม่พบข้อมูลประวัติการทำงาน</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        currentPageData.map((log, index) => (
                                            <tr key={index} className="text-center" style={{ borderBottom: "1px solid #333" }}>
                                                <td className="py-3 px-4">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                                <td className="py-3 px-4">
                                                    <div className="d-flex align-items-center justify-content-center text-muted">
                                                        <CalendarDate size={12} className="me-1" />
                                                        {formatDateForDisplay(log.date)}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="d-flex align-items-center justify-content-center">
                                                        <PersonFill size={14} className="me-1 text-info" />
                                                        {log.User}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div style={getStatusBadgeStyle(log.status)}>
                                                        {renderStatusIcon(log.status)}
                                                        {log.status}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 fw-medium">{log.part_num}</td>
                                                <td className="py-3 px-4">{log.part_name}</td>
                                                <td className="py-3 px-4">
                                                    {log.serial_num ? (
                                                        <Badge bg="dark" style={{
                                                            backgroundColor: "#424242",
                                                            padding: "5px 8px",
                                                            borderRadius: "4px"
                                                        }}>
                                                            {log.serial_num}
                                                        </Badge>
                                                    ) : "-"}
                                                </td>
                                                <td className="py-3 px-4">
                                                    {log.location ? (
                                                        <div className="d-flex align-items-center justify-content-center">
                                                            <GeoAltFill size={12} className="me-1 text-secondary" />
                                                            {log.location}
                                                        </div>
                                                    ) : "-"}
                                                </td>
                                                <td className="py-3 px-4">{log.store_name || "-"}</td>
                                                <td className="py-3 px-4 fw-medium">{log.part_qty || "-"}</td>
                                                <td className="py-3 px-4">
                                                    {log.supplier ? (
                                                        <div className="d-flex align-items-center justify-content-center">
                                                            <Building size={12} className="me-1 text-secondary" />
                                                            {log.supplier}
                                                        </div>
                                                    ) : "-"}
                                                </td>
                                                <td className="py-3 px-4">{log.note || "-"}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </Table>
                        </div>

                        <div className="d-flex justify-content-between align-items-center bg-dark py-3 px-4">
                            <div className="text-muted">
                                แสดง {currentPageData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} ถึง {Math.min(currentPage * itemsPerPage, logs.length)} จากทั้งหมด {logs.length} รายการ
                            </div>
                            <PaginationComponent
                                itemsPerPage={itemsPerPage}
                                totalItems={logs.length}
                                paginate={paginate}
                                currentPage={currentPage}
                                setCurrentPage={setCurrentPage}
                            />
                        </div>
                    </Card.Body>
                </Card>
            </Container>
        </div>
    );
}

export default LogHistory;