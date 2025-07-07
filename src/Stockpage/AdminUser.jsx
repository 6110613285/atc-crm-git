import React, { useEffect, useState, useRef } from "react";
import { FormControl, Button, Table, Tabs, Tab, Card, Badge, Container } from "react-bootstrap";
import PaginationComponent from "../components/PaginationComponent";
import Swal from "sweetalert2";
import AddUser from "../Stockpage/AddUser";
import EditUser from "./EditUser";
import { 
  Search, 
  PersonPlus, 
  PencilSquare, 
  PeopleFill,
  Building, 
  ArrowRepeat,
  ExclamationCircle,
  Trash, 
  Shield, 
  ShieldCheck, 
  PersonCheck,
  Envelope,
  Telephone,
  GeoAlt,
  XCircle,
  Plus
} from "react-bootstrap-icons";

function Usertable() {
  const searchRef = useRef(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // สถานะสำหรับการแบ่งหน้า
  const [currentUserPageData, setCurrentUserPageData] = useState([]);
  const [currentUserPage, setCurrentUserPage] = useState(1);
  const itemsPerPage = 15;

  // สถานะสำหรับการกรอง
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("");

  // ===== ฟังก์ชันจัดการ Users =====
  // ดึงข้อมูล users
  const getUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER}/User.php?action=getall`,
        {
          method: "GET",
        }
      );
      const data = await res.json();
      
      if (Array.isArray(data)) {
        setUsers(data);
      } else if (data === null) {
        setUsers([]);
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.log(err);
      setError("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // ค้นหา users
  const searchUsers = async () => {
    setLoading(true);
    try {
      const searchTerm = searchRef.current.value || "";
      const res = await fetch(
        `${import.meta.env.VITE_SERVER}/User.php?action=search&search=${searchTerm}`,
        {
          method: "GET",
        }
      );
      const data = await res.json();
      
      if (Array.isArray(data)) {
        setUsers(data);
      } else if (data === null) {
        setUsers([]);
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.log(err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // ลบ user
 // ฟังก์ชันลบ user ที่ปรับปรุงแล้ว
const deleteUser = async (id) => {
  console.log('Attempting to delete user ID:', id);

  if (!id) {
    Swal.fire({
      position: "center",
      icon: "error",
      title: "ไม่พบ ID",
      text: "กรุณาระบุ ID ที่ต้องการลบ",
      showConfirmButton: false,
      timer: 2000,
    });
    return;
  }

  const result = await Swal.fire({
    title: 'ยืนยันการลบ',
    text: `คุณต้องการลบผู้ใช้ที่มี ID "${id}" หรือไม่?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#e53935',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'ลบ',
    cancelButtonText: 'ยกเลิก'
  });

  if (result.isConfirmed) {
    try {
      const deleteUrl = `${import.meta.env.VITE_SERVER}/User.php`;

      const res = await fetch(deleteUrl, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          action: 'delete',
          id: id   // ✅ ใช้ id แทน user_id
        })
      });

      const responseText = await res.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        throw new Error(`Invalid JSON response: ${responseText}`);
      }

      if (data.success) {
        Swal.fire({
          position: "center",
          icon: "success",
          title: "ลบข้อมูลสำเร็จ",
          text: data.message,
          showConfirmButton: false,
          timer: 1500,
        });

        await getUsers();
        paginateUsers(1);
      } else {
        throw new Error(data.message || 'ไม่สามารถลบข้อมูลได้');
      }
    } catch (err) {
      Swal.fire({
        position: "center",
        icon: "error",
        title: "เกิดข้อผิดพลาดในการลบข้อมูล",
        text: err.message,
        showConfirmButton: true,
      });
    }
  }
};

   const getSortIcon = (columnKey) => {
  if (sortField !== columnKey) {
    return (
      <span style={{ color: "#888" }}>△</span>
    );
  }
  return sortOrder === 'asc' ? (
    <span style={{ color: "#00e676" }}>▲</span>
  ) : (
    <span style={{ color: "#00e676" }}>▼</span>
  );
};


    const handleSort = (field) => {
  let order = "asc";
  if (sortField === field && sortOrder === "asc") {
    order = "desc";
  }
  setSortField(field);
  setSortOrder(order);

  const sortedLogs = [...logs].sort((a, b) => {
    let aField = a[field] || "";
    let bField = b[field] || "";

    // ถ้าเป็นวันที่ ให้เทียบเป็น date object
    if (field === "date") {
      aField = new Date(aField);
      bField = new Date(bField);
    }

    if (aField < bField) return order === "asc" ? -1 : 1;
    if (aField > bField) return order === "asc" ? 1 : -1;
    return 0;
  });

  setLogs(sortedLogs);
  paginate(1, sortedLogs);
};


  // ===== ฟังก์ชันแบ่งหน้า =====
  // แบ่งหน้าสำหรับข้อมูล users
  const paginateUsers = (pageNumber) => {
    const startIndex = (pageNumber - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setCurrentUserPageData(users.slice(startIndex, endIndex));
    setCurrentUserPage(pageNumber);
  };

  // ดึงข้อมูลเมื่อโหลดคอมโพเนนต์
  useEffect(() => {
    getUsers();
  }, []);

  // อัปเดตข้อมูลหน้าเมื่อข้อมูล users เปลี่ยนแปลง
  useEffect(() => {
    paginateUsers(currentUserPage);
  }, [users]);

  // ฟังก์ชันจัดการการบันทึก
  const handleSave = () => {
    getUsers();
  };

  // ฟังก์ชันจัดการการกดปุ่ม Enter
  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      searchUsers();
      paginateUsers(1);
    }
  };

  // Get unique values for filter dropdowns
  const departments = [...new Set(users.map(user => user.department).filter(Boolean))];
  const positions = [...new Set(users.map(user => user.position).filter(Boolean))];
  const levels = [...new Set(users.map(user => user.level).filter(Boolean))];

  // Get level badge color and icon
  const getLevelBadgeColor = (level) => {
    const colors = {
      admin: "#e53935",
      manager: "#8e24aa", 
      supervisor: "#1e88e5",
      staff: "#00c853",
      user: "#757575"
    };
    return colors[level?.toLowerCase()] || colors.user;
  };

  const getLevelIcon = (level) => {
    switch(level?.toLowerCase()) {
      case 'admin': return <Shield size={14} />;
      case 'manager': return <ShieldCheck size={14} />; 
      default: return <PersonCheck size={14} />;
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    const colors = {
      active: "#00c853",
      inactive: "#757575",
      pending: "#fb8c00",
      suspended: "#e53935"
    };
    return colors[status?.toLowerCase()] || colors.pending;
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ 
        fontFamily: "'Inter', 'Prompt', sans-serif",
        backgroundColor: "#1a1a1a",
        color: "#e0e0e0"
      }}>
        <div className="text-center">
          <ArrowRepeat className="mb-3" size={48} style={{ color: "#00c853" }} />
          <p className="h5">กำลังโหลดข้อมูลผู้ใช้...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ 
        fontFamily: "'Inter', 'Prompt', sans-serif",
        backgroundColor: "#1a1a1a",
        color: "#e0e0e0"
      }}>
        <Card style={{ backgroundColor: "#2a2a2a", color: "#e0e0e0", maxWidth: "400px" }}>
          <Card.Body className="text-center p-5">
            <ExclamationCircle className="mb-3" size={64} style={{ color: "#e53935" }} />
            <h4 className="mb-3">เกิดข้อผิดพลาด</h4>
            <p className="mb-4" style={{ color: "#bdbdbd" }}>{error}</p>
            <Button
              style={{ 
                backgroundColor: "#00c853", 
                borderColor: "#00c853",
                borderRadius: "6px"
              }}
              onClick={() => getUsers()}
            >
              ลองใหม่อีกครั้ง
            </Button>
          </Card.Body>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-vh-100" style={{ 
        fontFamily: "'Inter', 'Prompt', sans-serif",
        backgroundColor: "#1a1a1a",
        color: "#e0e0e0"
      }}>
      {/* ส่วนแท็บการจัดการ */}
      <Tabs
        activeKey="users"
        className="mb-0 nav-fill"
        style={{ 
          backgroundColor: "#2a2a2a",
          borderBottom: "1px solid #333333",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
        }}
      >
        <Tab 
          eventKey="users" 
          title={
            <div className="d-flex align-items-center py-3" style={{ color: "#00c853" }}>
              <PeopleFill className="me-2" /> 
              <span className="fw-medium">User Management</span>
            </div>
          }
        />
      </Tabs>

      <Container fluid className="px-4 py-4">
        <Card className="border-0 shadow-sm" style={{ backgroundColor: "#2a2a2a", color: "#e0e0e0" }}>
          <Card.Body className="p-4">
            <div className="d-flex flex-column">
              <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
                <h5 className="m-0 fw-bold" style={{ color: "#00c853" }}>
                  <PeopleFill className="me-2" size={22} />
                  จัดการผู้ใช้งาน ({users.length} คน)
                </h5>
                <div className="d-flex gap-2 flex-wrap">
                  <div className="position-relative">
                    <FormControl
                      className="ps-4"
                      style={{ 
                        borderRadius: "6px",
                        boxShadow: "none",
                        minWidth: "250px",
                        backgroundColor: "#333333",
                        color: "#e0e0e0",
                        border: "1px solid #444444"
                      }}
                      type="text"
                      placeholder="ค้นหาผู้ใช้..."
                      ref={searchRef}
                      onKeyPress={handleKeyPress}
                    />
                    <Search className="position-absolute" style={{ 
                      left: "10px", 
                      top: "50%", 
                      transform: "translateY(-50%)",
                      color: "#999999"
                    }} />
                  </div>
                  <Button
                    variant="primary"
                    style={{ 
                      backgroundColor: "#00c853", 
                      borderColor: "#00c853",
                      borderRadius: "6px"
                    }}
                    onClick={async () => {
                      if (searchRef.current.value.trim() === '') {
                        await getUsers();
                      } else {
                        await searchUsers();
                      }
                      paginateUsers(1);
                    }}
                  >
                    <Search size={18} className="me-1" /> Search
                  </Button>
                  <Button
                    variant="light"
                    style={{ 
                      borderRadius: "6px",
                      border: "1px solid #444444",
                      backgroundColor: "#333333",
                      color: "#e0e0e0"
                    }}
                    onClick={async () => {
                      searchRef.current.value = '';
                      await getUsers();
                      paginateUsers(1);
                    }}
                  >
                    <XCircle size={18} className="me-1" /> Clear
                  </Button>
                  <AddUser onSave={handleSave}>
                                      <Button
                                        variant="success"
                                        style={{ 
                                          borderRadius: "6px",
                                          backgroundColor: "#007e33",
                                          borderColor: "#007e33"
                                        }}
                                      >
                                        <Plus size={18} className="me-1" />
                                      </Button>
                                    </AddUser>
                </div>
              </div>
              <div className="table-responsive">
                <Table hover className="align-middle border table-dark" style={{ borderRadius: "8px", overflow: "hidden" }}>
                  <thead style={{ backgroundColor: "#333333" }}>
                    <tr className="text-center">
                      <th className="py-3" style={{ color: "#e0e0e0" }}>No.</th>
                      <th className="py-3" style={{ color: "#e0e0e0" }}>ผู้ใช้</th>
                      <th className="py-3" style={{ color: "#e0e0e0" }}>ข้อมูลติดต่อ</th>
                      <th className="py-3" style={{ color: "#e0e0e0" }}>แผนก/ตำแหน่ง</th>
                      <th className="py-3" style={{ color: "#e0e0e0" }}>ระดับ</th>
                      <th className="py-3" style={{ color: "#e0e0e0" }}>สถานะ</th>
                      <th className="py-3" style={{ color: "#e0e0e0" }}>เขต</th>
                      <th className="py-3" style={{ color: "#e0e0e0" }}>Action</th>
                    </tr>
                  </thead>

                  {users.length === 0 ? (
                    <tbody>
                      <tr>
                        <td colSpan={8} className="text-center py-5" style={{ color: "#bdbdbd" }}>
                          <div className="d-flex flex-column align-items-center">
                            <PeopleFill size={40} className="mb-2 text-muted" />
                            <span className="fw-medium">ไม่พบข้อมูลผู้ใช้</span>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  ) : (
                    <tbody>
                      {currentUserPageData.map((user, index) => (
                        <tr key={user.id ? `id-${user.id}` : `temp-${index}`} className="text-center">
                          <td>{(currentUserPage - 1) * itemsPerPage + index + 1}</td>
                          <td className="text-start">
                            <div className="d-flex align-items-center">
                              <div 
                                className="rounded-circle d-flex align-items-center justify-content-center me-3"
                                style={{ 
                                  width: "40px", 
                                  height: "40px", 
                                  backgroundColor: "#00c853",
                                  color: "white",
                                  fontSize: "14px",
                                  fontWeight: "bold"
                                }}
                              >
                                {user.fnameth ? user.fnameth.charAt(0).toUpperCase() : 
                                 user.fname ? user.fname.charAt(0).toUpperCase() : 'U'}
                              </div>
                              <div>
                                <div className="fw-medium text-white">
                                  {user.fnameth && user.lnameth 
                                    ? `${user.fnameth} ${user.lnameth}`
                                    : user.fname && user.lname 
                                      ? `${user.fname} ${user.lname}`
                                      : 'ไม่ระบุชื่อ'
                                  }
                                </div>
                                {(user.fname && user.lname) && (
                                  <div className="small" style={{ color: "#bdbdbd" }}>
                                    {user.fname} {user.lname}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="text-start">
                            <div style={{ fontSize: "13px" }}>
                              {user.email && (
                                <div className="d-flex align-items-center mb-1">
                                  <Envelope size={14} className="me-2" style={{ color: "#bdbdbd" }} />
                                  <span>{user.email}</span>
                                </div>
                              )}
                              {user.tel && (
                                <div className="d-flex align-items-center">
                                  <Telephone size={14} className="me-2" style={{ color: "#bdbdbd" }} />
                                  <span>{user.tel}</span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="text-start">
                            <div style={{ fontSize: "13px" }}>
                              {user.department && (
                                <div className="d-flex align-items-center mb-1">
                                  <Building size={14} className="me-2" style={{ color: "#bdbdbd" }} />
                                  <span className="fw-medium">{user.department}</span>
                                </div>
                              )}
                              {user.position && (
                                <div style={{ color: "#bdbdbd", paddingLeft: "20px" }}>
                                  {user.position}
                                </div>
                              )}
                            </div>
                          </td>
                          <td>
                            {user.level && (
                              <Badge 
                                style={{ 
                                  backgroundColor: getLevelBadgeColor(user.level),
                                  color: "white",
                                  padding: "6px 10px",
                                  borderRadius: "4px",
                                  fontSize: "12px",
                                  fontWeight: "normal"
                                }}
                              >
                                <span className="d-flex align-items-center">
                                  {getLevelIcon(user.level)}
                                  <span className="ms-1">{user.level}</span>
                                </span>
                              </Badge>
                            )}
                          </td>
                          <td>
                            {user.status && (
                              <Badge 
                                style={{ 
                                  backgroundColor: getStatusBadgeColor(user.status),
                                  color: "white",
                                  padding: "5px 8px",
                                  borderRadius: "4px",
                                  fontSize: "11px"
                                }}
                              >
                                {user.status === 'active' ? 'ใช้งาน' : 
                                 user.status === 'inactive' ? 'ไม่ใช้งาน' : 
                                 user.status === 'pending' ? 'รอการอนุมัติ' : user.status}
                              </Badge>
                            )}
                          </td>
                          <td>
                            {user.zone && (
                              <div className="d-flex align-items-center justify-content-center" style={{ fontSize: "13px", color: "#bdbdbd" }}>
                                <GeoAlt size={14} className="me-1" />
                                {user.zone}
                              </div>
                            )}
                          </td>
                          <td>
                            <div className="d-flex justify-content-center gap-1">
                              <EditUser user={user} onSave={handleSave}>
  <Button
    variant="warning"
    size="sm"
    style={{
      borderRadius: "6px",
      backgroundColor: "#fb8c00",
      borderColor: "#fb8c00"
    }}
  >
    <PencilSquare size={16} />
  </Button>
</EditUser>
                              <Button
                                variant="danger"
                                size="sm"
                                style={{ 
                                  borderRadius: "6px",
                                  backgroundColor: "#e53935",
                                  borderColor: "#e53935"
                                }}
                                onClick={() => deleteUser(user.id)}
                              >
                                <Trash size={16} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  )}
                </Table>
              </div>
              <div className="mt-3 d-flex justify-content-center">
                <PaginationComponent
                  itemsPerPage={itemsPerPage}
                  totalItems={users.length}
                  paginate={paginateUsers}
                  currentPage={currentUserPage}
                  setCurrentPage={setCurrentUserPage}
                />
              </div>
            </div>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}

export default Usertable;