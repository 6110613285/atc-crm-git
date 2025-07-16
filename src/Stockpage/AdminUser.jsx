import React, { useEffect, useState, useRef, createContext, useContext } from "react";
import { FormControl, Button, Table, Tabs, Tab, Card, Badge, Container } from "react-bootstrap";
import PaginationComponent from "../components/PaginationComponent";
import Swal from "sweetalert2";
import AddUser from "./Adduser"; // Path อาจจะต้องปรับตามโครงสร้างโปรเจกต์ของคุณ
import EditUser from "./EditUser"; // Path อาจจะต้องปรับตามโครงสร้างโปรเจกต์ของคุณ

// นำเข้า ROLE_PERMISSIONS และ helper functions
import { ROLE_PERMISSIONS, getPermissionCodes, getPermissionNames } from './permissions'; // <--- แก้ไขตรงนี้

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
  Plus,
  Eye,
  EyeSlash,
  Lock,
  Unlock
} from "react-bootstrap-icons";

// AuthContext สำหรับจัดการ authentication และ permissions (ยังคงอยู่ใน AdminUser หรือแยกไปไฟล์ AuthContext.js)
const AuthContext = createContext();

// Hook สำหรับใช้ AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// AuthProvider Component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userPermissions, setUserPermissions] = useState([]); // Stores permission names (e.g., 'Crm System')
  const [loading, setLoading] = useState(true);

  const hasPageAccess = (pageName) => {
    if (!currentUser) return false;
    
    if (currentUser.level === 'admin') return true;
    
    const rolePermissions = ROLE_PERMISSIONS[currentUser.level];
    if (!rolePermissions) return false;
    
    const requiredPage = rolePermissions.pages.find(page => page.name === pageName && page.required);
    if (requiredPage) return true;
    
    // Check if the user has this permission name
    return userPermissions.includes(pageName);
  };

  const login = async (userData) => {
    try {
      setCurrentUser(userData);
      let permissionsAsNames = [];
      if (userData.Roleuser) { // Use Roleuser field
        const codes = userData.Roleuser.split(',').filter(code => code.trim() !== '');
        permissionsAsNames = getPermissionNames(codes); // Convert codes to names
      }
      setUserPermissions(permissionsAsNames);
      localStorage.setItem('currentUser', JSON.stringify(userData));
      localStorage.setItem('userPermissions', JSON.stringify(permissionsAsNames)); // Store names
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setUserPermissions([]);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userPermissions');
  };

  useEffect(() => {
    const checkAuth = () => {
      try {
        const savedUser = localStorage.getItem('currentUser');
        const savedPermissions = localStorage.getItem('userPermissions'); // These are already names

        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          setCurrentUser(parsedUser);
          // If savedPermissions exists and is valid, use it. Otherwise, derive from Roleuser.
          if (savedPermissions) {
            setUserPermissions(JSON.parse(savedPermissions));
          } else if (parsedUser.Roleuser) {
            const codes = parsedUser.Roleuser.split(',').filter(code => code.trim() !== '');
            setUserPermissions(getPermissionNames(codes));
          } else {
            setUserPermissions([]);
          }
        } else {
          // หากไม่มีข้อมูลผู้ใช้ใน localStorage, กำหนดเป็นผู้ใช้จำลองเพื่อทดสอบ
          // ลบส่วนนี้ออกในการใช้งานจริง และ implement ระบบ login
          const mockUser = {
            id: 'admin1',
            username: 'admin',
            fname: 'Admin',
            lname: 'User',
            fnameth: 'ผู้ดูแลระบบ',
            lnameth: 'หลัก',
            level: 'admin', // กำหนดเป็น 'admin' เพื่อให้มีสิทธิ์เต็ม
            // Mock Roleuser with codes
            Roleuser: '01,02,03' // Example codes for Crm System, Warehouse, Product
          };
          setCurrentUser(mockUser);
          setUserPermissions(getPermissionNames(mockUser.Roleuser.split(',')));
        }
      } catch (error) {
        console.error('Error loading auth data:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const value = {
    currentUser,
    userPermissions,
    loading,
    login,
    logout,
    hasPageAccess
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

function Usertable() {
  const { currentUser, hasPageAccess } = useAuth();
  const searchRef = useRef(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [currentUserPageData, setCurrentUserPageData] = useState([]);
  const [currentUserPage, setCurrentUserPage] = useState(1);
  const itemsPerPage = 15;

  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("");

  const updateUserPermissions = async (userId, newPermissionsAsNames) => {
    try {
      // Convert permission names back to codes for saving
      const newPermissionsAsCodes = getPermissionCodes(newPermissionsAsNames).join(',');

      const response = await fetch(`${import.meta.env.VITE_SERVER}/User.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'updateUser', // Use updateUser action to save Roleuser
          id: userId,
          Roleuser: newPermissionsAsCodes // Send Roleuser with codes
        })
      });

      const data = await response.json();
      
      if (data.success) {
        Swal.fire({
          position: "center",
          icon: "success",
          title: "อัปเดตสิทธิ์สำเร็จ", // Changed message
          showConfirmButton: false,
          timer: 1500,
        });
        await getUsers(); // Refresh user list
      } else {
        throw new Error(data.message || 'ไม่สามารถอัปเดตสิทธิ์ได้'); // Changed message
      }
    } catch (error) {
      Swal.fire({
        position: "center",
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: error.message,
        showConfirmButton: true,
      });
    }
  };

  const getUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER}/User.php?action=getUsers`,
        { method: "GET" }
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

  const searchUsers = async () => {
  setLoading(true);
  try {
    const searchTerm = searchRef.current.value.trim();

    if (!searchTerm) {
      setUsers([]);
      setLoading(false);
      return;
    }

    const res = await fetch(`${import.meta.env.VITE_SERVER}/User.php?action=searchUser`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ search: searchTerm }),
    });

    const data = await res.json();

    if (Array.isArray(data)) {
      setUsers(data);
    } else {
      setUsers([]);
    }
  } catch (error) {
    console.error(error);
    setUsers([]);
  } finally {
    setLoading(false);
  }
};


  const deleteUser = async (id) => {
    if (!hasPageAccess('adminuser') || currentUser?.level !== 'admin') {
      Swal.fire({
        position: "center",
        icon: "error",
        title: "ไม่มีสิทธิ์",
        text: "เฉพาะ Administrator เท่านั้นที่สามารถลบผู้ใช้ได้",
        showConfirmButton: true,
      });
      return;
    }

    if (currentUser && currentUser.id === id) {
      Swal.fire({
        position: "center",
        icon: "error",
        title: "ไม่สามารถลบผู้ใช้นี้ได้",
        text: "คุณไม่สามารถลบบัญชีผู้ใช้ของคุณเองได้",
        showConfirmButton: true,
      });
      return;
    }

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
            id: id
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

  // ฟังก์ชันแสดงและแก้ไข permissions ของ user (ปรับแก้ให้ใช้ Roleuser)
  const showUserPermissions = (user) => {
    let permissionsAsNames = [];
    if (user.Roleuser) {
      const codes = user.Roleuser.split(',').filter(code => code.trim() !== '');
      permissionsAsNames = getPermissionNames(codes); // Convert codes to names
    }

    const roleInfo = ROLE_PERMISSIONS[user.level] || ROLE_PERMISSIONS.user;

    const permissionsHTML = roleInfo.pages.map(page => {
      const isRequired = page.required;
      const isAllowed = permissionsAsNames.includes(page.name) || isRequired; // Check against names
      const checkboxId = `perm-${page.name}`;
      
      return `
        <div style="display: flex; align-items: center; padding: 8px; margin: 4px 0; background: ${isAllowed ? '#e8f5e8' : '#f5f5f5'}; border-radius: 6px; border: 1px solid ${isAllowed ? '#4caf50' : '#ddd'};">
          <input type="checkbox" 
                 id="${checkboxId}" 
                 ${isAllowed ? 'checked' : ''} 
                 ${isRequired ? 'disabled' : ''}
                 style="margin-right: 10px; transform: scale(1.2);" />
          <label for="${checkboxId}" style="flex: 1; cursor: ${isRequired ? 'not-allowed' : 'pointer'}; color: ${isRequired ? '#666' : '#333'};">
            <strong>${page.label}</strong>
            ${isRequired ? '<span style="color: #d32f2f; font-size: 12px;"> (จำเป็น)</span>' : ''}
          </label>
          <span style="color: ${isAllowed ? '#2e7d32' : '#666'}; font-size: 18px;">
            ${isAllowed ? '✓' : '✗'}
          </span>
        </div>
      `;
    }).join('');

    Swal.fire({
      title: `<strong>จัดการสิทธิ์: ${user.fnameth || user.fname} ${user.lnameth || user.lname}</strong>`,
      html: `
        <div style="text-align: left;">
          <div style="margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px; color: #333;">
            <strong>ตำแหน่ง:</strong> ${roleInfo.label}<br>
            <small style="color: #666;">${roleInfo.description}</small>
          </div>
          <div style="margin-bottom: 15px; color: #333;">
            <strong>สิทธิ์การเข้าถึงหน้าเว็บ:</strong>
          </div>
          <div id="permissions-list">
            ${permissionsHTML}
          </div>
          <div style="font-size: 12px; color: #666; border-top: 1px solid #eee; padding-top: 15px; margin-top: 15px;">
            <strong>หมายเหตุ:</strong> หน้าที่มีป้าย "จำเป็น" จะไม่สามารถยกเลิกได้
          </div>
        </div>
      `,
      width: '600px',
      showCancelButton: true,
      confirmButtonText: 'บันทึกการเปลี่ยนแปลง',
      cancelButtonText: 'ปิด',
      confirmButtonColor: '#00c853',
      cancelButtonColor: '#6c757d',
      preConfirm: () => {
        const newPermissions = []; // This will store permission names
        roleInfo.pages.forEach(page => {
          const checkbox = document.getElementById(`perm-${page.name}`);
          if (checkbox && (checkbox.checked || page.required)) {
            newPermissions.push(page.name);
          }
        });
        return newPermissions;
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        updateUserPermissions(user.id, result.value); // Pass names to update function
      }
    });
  };

  const paginateUsers = (pageNumber) => {
    const startIndex = (pageNumber - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setCurrentUserPageData(users.slice(startIndex, endIndex));
    setCurrentUserPage(pageNumber);
  };

  useEffect(() => {
    getUsers();
  }, []);

  useEffect(() => {
    paginateUsers(currentUserPage);
  }, [users]);

  const handleSave = () => {
    getUsers();
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      searchUsers();
      paginateUsers(1);
    }
  };

  const getLevelBadgeColor = (level) => {
    return ROLE_PERMISSIONS[level?.toLowerCase()]?.color || "#757575";
  };

  const getLevelIcon = (level) => {
    switch (level?.toLowerCase()) {
      case 'admin': return <Shield size={14} />;
      case 'user': return <ShieldCheck size={14} />;
      default: return <PersonCheck size={14} />;
    }
  };

  const getStatusBadgeColor = (status) => {
    const colors = {
      active: "#00c853",
      activation: "#fb8c00",
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
                  {hasPageAccess('adminuser') && (
                    <AddUser onSave={handleSave}>
                      <Button
                        variant="success"
                        style={{
                          borderRadius: "6px",
                          backgroundColor: "#007e33",
                          borderColor: "#007e33"
                        }}
                      >
                        <Plus size={18} className="me-1" /> Add User
                      </Button>
                    </AddUser>
                  )}
                </div>
              </div>

              {currentUser && (
                <div className="mb-3 p-3 rounded" style={{ backgroundColor: "#333333" }}>
                  <small style={{ color: "#bdbdbd" }}>
                    เข้าสู่ระบบในฐานะ: <strong style={{ color: "#00c853" }}>
                      {currentUser.fnameth || currentUser.fname} {currentUser.lnameth || currentUser.lname}
                    </strong> 
                    ({ROLE_PERMISSIONS[currentUser.level]?.label || currentUser.level})
                  </small>
                </div>
              )}

              <div className="table-responsive">
                <Table hover className="align-middle border table-dark" style={{ borderRadius: "8px", overflow: "hidden" }}>
                  <thead style={{ backgroundColor: "#333333" }}>
                    <tr className="text-center">
                      <th className="py-3" style={{ color: "#e0e0e0" }}>No.</th>
                      <th className="py-3" style={{ color: "#e0e0e0" }}>ผู้ใช้</th>
                      <th className="py-3 d-none d-md-table-cell" style={{ color: "#e0e0e0" }}>ข้อมูลติดต่อ</th>
                      <th className="py-3 d-none d-lg-table-cell" style={{ color: "#e0e0e0" }}>แผนก/ตำแหน่ง</th>
                      <th className="py-3 d-none d-sm-table-cell" style={{ color: "#e0e0e0" }}>ระดับ</th>
                      <th className="py-3 d-none d-xl-table-cell" style={{ color: "#e0e0e0" }}>Permissions</th>
                      <th className="py-3 d-none d-lg-table-cell" style={{ color: "#e0e0e0" }}>Action</th>
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
                        <React.Fragment key={user.id ? `id-${user.id}` : `temp-${index}`}>
                          <tr className="text-center">
                            <td>{(currentUserPage - 1) * itemsPerPage + index + 1}</td>
                            <td className="text-start">
                              <div className="d-flex align-items-center">
                                <div
                                  className="rounded-circle d-flex align-items-center justify-content-center me-2 me-md-3"
                                  style={{
                                    width: "35px",
                                    height: "35px",
                                    backgroundColor: getLevelBadgeColor(user.level),
                                    color: "white",
                                    fontSize: "12px",
                                    fontWeight: "bold"
                                  }}
                                >
                                  {user.fnameth ? user.fnameth.charAt(0).toUpperCase() :
                                    user.fname ? user.fname.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <div className="flex-grow-1">
                                  <div className="fw-medium text-white" style={{ fontSize: "14px" }}>
                                    {user.fnameth && user.lnameth
                                      ? `${user.fnameth} ${user.lnameth}`
                                      : user.fname && user.lname
                                        ? `${user.fname} ${user.lname}`
                                        : 'ไม่ระบุชื่อ'
                                    }
                                  </div>
                                  {(user.fname && user.lname) && (
                                    <div className="small d-none d-md-block" style={{ color: "#bdbdbd" }}>
                                      {user.fname} {user.lname}
                                    </div>
                                  )}
                                  <div className="small" style={{ color: "#bdbdbd" }}>
                                    @{user.username}
                                  </div>
                                  
                                  {/* Mobile info - แสดงข้อมูลสำคัญในหน้าจอเล็ก */}
                                  <div className="d-md-none mt-2">
                                    <div className="d-flex flex-wrap gap-2 mb-2">
                                      {user.level && (
                                        <Badge
                                          style={{
                                            backgroundColor: getLevelBadgeColor(user.level),
                                            color: "white",
                                            padding: "4px 6px",
                                            borderRadius: "3px",
                                            fontSize: "10px",
                                            fontWeight: "normal"
                                          }}
                                        >
                                          <span className="d-flex align-items-center">
                                            {getLevelIcon(user.level)}
                                            <span className="ms-1">{ROLE_PERMISSIONS[user.level]?.label || user.level}</span>
                                          </span>
                                        </Badge>
                                      )}
                                      
                                    </div>
                                    
                                    {/* Mobile contact info */}
                                    <div style={{ fontSize: "11px" }}>
                                      {user.email && (
                                        <div className="d-flex align-items-center mb-1">
                                          <Envelope size={12} className="me-2" style={{ color: "#bdbdbd" }} />
                                          <span className="text-truncate" style={{ maxWidth: "150px" }}>{user.email}</span>
                                        </div>
                                      )}
                                      {user.tel && (
                                        <div className="d-flex align-items-center mb-1">
                                          <Telephone size={12} className="me-2" style={{ color: "#bdbdbd" }} />
                                          <span>{user.tel}</span>
                                        </div>
                                      )}
                                      {user.department && (
                                        <div className="d-flex align-items-center mb-1">
                                          <Building size={12} className="me-2" style={{ color: "#bdbdbd" }} />
                                          <span className="text-truncate" style={{ maxWidth: "120px" }}>{user.department}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="text-start d-none d-md-table-cell">
                              <div style={{ fontSize: "13px" }}>
                                {user.email && (
                                  <div className="d-flex align-items-center mb-1">
                                    <Envelope size={14} className="me-2" style={{ color: "#bdbdbd" }} />
                                    <span className="text-truncate" style={{ maxWidth: "180px" }}>{user.email}</span>
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
                            <td className="text-start d-none d-lg-table-cell">
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
                            <td className="d-none d-sm-table-cell">
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
                                    <span className="ms-1">{ROLE_PERMISSIONS[user.level]?.label || user.level}</span>
                                  </span>
                                </Badge>
                              )}
                            </td>
                            
                            <td className="d-none d-xl-table-cell">
                              <Button
                                variant="info"
                                size="sm"
                                style={{
                                  borderRadius: "6px",
                                  backgroundColor: "#17a2b8",
                                  borderColor: "#17a2b8"
                                }}
                                onClick={() => showUserPermissions(user)}
                                title="จัดการสิทธิ์การเข้าถึง"
                              >
                                <Eye size={16} />
                              </Button>
                            </td>
                            <td className="d-none d-lg-table-cell">
                              <div className="d-flex justify-content-center gap-1">
                                {(hasPageAccess('adminuser') || currentUser?.id === user.id) && (
                                  <EditUser user={user} onSave={handleSave}>
                                    <Button
                                      variant="warning"
                                      size="sm"
                                      style={{
                                        borderRadius: "6px",
                                        backgroundColor: "#fb8c00",
                                        borderColor: "#fb8c00"
                                      }}
                                      title="แก้ไขข้อมูลผู้ใช้"
                                    >
                                      <PencilSquare size={16} />
                                    </Button>
                                  </EditUser>
                                )}
                                {(currentUser?.level === 'admin' && currentUser?.id !== user.id) && (
                                  <Button
                                    variant="danger"
                                    size="sm"
                                    style={{
                                      borderRadius: "6px",
                                      backgroundColor: "#e53935",
                                      borderColor: "#e53935"
                                    }}
                                    onClick={() => deleteUser(user.id)}
                                    title="ลบผู้ใช้"
                                  >
                                    <Trash size={16} />
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                          
                          {/* Mobile action buttons - แสดงเฉพาะในหน้าจอเล็ก */}
                          <tr className="d-lg-none">
                            <td colSpan={8} className="py-2" style={{ backgroundColor: "#2a2a2a", borderTop: "1px solid #444" }}>
                              <div className="d-flex justify-content-center gap-2 flex-wrap">
                                <Button
                                  variant="info"
                                  size="sm"
                                  style={{
                                    borderRadius: "6px",
                                    backgroundColor: "#17a2b8",
                                    borderColor: "#17a2b8",
                                    minWidth: "80px"
                                  }}
                                  onClick={() => showUserPermissions(user)}
                                  title="จัดการสิทธิ์การเข้าถึง"
                                >
                                  <Eye size={14} className="me-1" />
                                  <span className="d-none d-sm-inline">สิทธิ์</span>
                                </Button>
                                {(hasPageAccess('adminuser') || currentUser?.id === user.id) && (
                                  <EditUser user={user} onSave={handleSave}>
                                    <Button
                                      variant="warning"
                                      size="sm"
                                      style={{
                                        borderRadius: "6px",
                                        backgroundColor: "#fb8c00",
                                        borderColor: "#fb8c00",
                                        minWidth: "80px"
                                      }}
                                      title="แก้ไขข้อมูลผู้ใช้"
                                    >
                                      <PencilSquare size={14} className="me-1" />
                                      <span className="d-none d-sm-inline">แก้ไข</span>
                                    </Button>
                                  </EditUser>
                                )}
                                {(currentUser?.level === 'admin' && currentUser?.id !== user.id) && (
                                  <Button
                                    variant="danger"
                                    size="sm"
                                    style={{
                                      borderRadius: "6px",
                                      backgroundColor: "#e53935",
                                      borderColor: "#e53935",
                                      minWidth: "80px"
                                    }}
                                    onClick={() => deleteUser(user.id)}
                                    title="ลบผู้ใช้"
                                  >
                                    <Trash size={14} className="me-1" />
                                    <span className="d-none d-sm-inline">ลบ</span>
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        </React.Fragment>
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

export const withAuth = (Component) => {
  return function AuthenticatedComponent(props) {
    return (
      <AuthProvider>
        <Component {...props} />
      </AuthProvider>
    );
  };
};

export default withAuth(Usertable);