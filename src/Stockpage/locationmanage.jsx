import React, { useState, useEffect, useRef } from "react";
import { FormControl, Button, Table, Tabs, Tab, Card, Badge, Container, Alert } from "react-bootstrap";
import PaginationComponent from "../components/PaginationComponent";
import Addlo from "../Stockpage/Addlocation";
import Addstore from "../Stockpage/addstore";
import { 
  Search, 
  XCircle, 
  Trash, 
  Plus, 
  GeoAltFill, 
  BoxSeamFill, 
  CalendarDate, 
  InfoCircle, 
  Building
} from "react-bootstrap-icons";

function Locationmanage() {
  const searchRef = useRef(null);
  const [locations, setLocations] = useState([]);
  const [stores, setStores] = useState([]);
  const [activeTab, setActiveTab] = useState("locations");
  
  // สถานะสำหรับตาราง Location
  const [currentLocationPageData, setCurrentLocationPageData] = useState([]);
  const [currentLocationPage, setCurrentLocationPage] = useState(1);
  
  // สถานะสำหรับตาราง Store
  const [currentStorePageData, setCurrentStorePageData] = useState([]);
  const [currentStorePage, setCurrentStorePage] = useState(1);
  
  const itemsPerPage = 15;
  
  // ฟังก์ชันดึงข้อมูลสถานที่
  const getLocations = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER}/Store.php?action=getLo`,
        {
          method: "GET",
        }
      );
      const data = await res.json();
      if (data === null) {
        setLocations([]);
      } else {
        const processedData = data.map(location => ({
          ...location,
          location_id: location.location_id || "-",
          location_name: location.location_name || "-",
          location_detail: location.location_detail || "-",
          datetime: location.datetime || "-",
          store_id: location.store_id || "-",
          store_name: location.store_name || "-"
        }));
        setLocations(processedData);
      }
    } catch (err) {
      console.log(err);
      setLocations([]);
    }
  };

  // ฟังก์ชันดึงข้อมูลคลัง
  const getStores = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER}/Store.php?action=getStores`,
        {
          method: "GET",
        }
      );
      const data = await res.json();
      if (data === null) {
        setStores([]);
      } else {
        const processedData = data.map(store => ({
          ...store,
          store_id: store.store_id || "-",
          store_name: store.store_name || "-",
          store_address: store.store_address || "-",
          store_detail: store.store_detail || "-",
          datetime: store.datetime || "-"
        }));
        setStores(processedData);
      }
    } catch (err) {
      console.log(err);
      setStores([]);
    }
  };
  
  // ฟังก์ชันค้นหาสถานที่
  const searchLocations = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER}/Store.php?action=searchLo&search=${
          searchRef.current.value || ""
        }`,
        {
          method: "GET",
        }
      );
      const data = await res.json();
      if (data === null) {
        setLocations([]);
      } else {
        const processedData = data.map(location => ({
          ...location,
          location_id: location.location_id || "-",
          location_name: location.location_name || "-",
          location_detail: location.location_detail || "-",
          datetime: location.datetime || "-",
          store_id: location.store_id || "-",
          store_name: location.store_name || "-"
        }));
        setLocations(processedData);
      }
    } catch (err) {
      console.log(err);
      setLocations([]);
    }
  };

  // ฟังก์ชันค้นหาคลัง
  const searchStores = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER}/Store.php?action=searchStore&search=${
          searchRef.current.value || ""
        }`,
        {
          method: "GET",
        }
      );
      const data = await res.json();
      if (data === null) {
        setStores([]);
      } else {
        const processedData = data.map(store => ({
          ...store,
          store_id: store.store_id || "-",
          store_name: store.store_name || "-",
          store_address: store.store_address || "-",
          store_detail: store.store_detail || "-",
          datetime: store.datetime || "-"
        }));
        setStores(processedData);
      }
    } catch (err) {
      console.log(err);
      setStores([]);
    }
  };

  // ฟังก์ชันลบสถานที่
  const deleteLocation = async (locationId) => {
    if (window.confirm("คุณต้องการลบข้อมูลสถานที่นี้หรือไม่?")) {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_SERVER}/Store.php?action=deleteLocation&location_id=${locationId}`,
          {
            method: "GET",
          }
        );
        const data = await res.json();
        if (data.status === "success") {
          alert("ลบข้อมูลสำเร็จ");
          getLocations();
        } else {
          alert("ไม่สามารถลบข้อมูลได้: " + data.message);
        }
      } catch (err) {
        console.log(err);
        alert("เกิดข้อผิดพลาดในการลบข้อมูล");
      }
    }
  };
  
  // ฟังก์ชันลบคลัง
  const deleteStore = async (storeId) => {
    if (window.confirm("คุณต้องการลบข้อมูลคลังนี้หรือไม่?")) {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_SERVER}/Store.php?action=deleteStore&store_id=${storeId}`,
          {
            method: "GET",
          }
        );
        const data = await res.json();
        if (data.status === "success") {
          alert("ลบข้อมูลสำเร็จ");
          getStores();
        } else {
          alert("ไม่สามารถลบข้อมูลได้: " + data.message);
        }
      } catch (err) {
        console.log(err);
        alert("เกิดข้อผิดพลาดในการลบข้อมูล");
      }
    }
  };

  // ฟังก์ชันแบ่งหน้าข้อมูลสถานที่
  const paginateLocations = (pageNumber) => {
    const startIndex = (pageNumber - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setCurrentLocationPageData(locations.slice(startIndex, endIndex));
    setCurrentLocationPage(pageNumber);
  };

  // ฟังก์ชันแบ่งหน้าข้อมูลคลัง
  const paginateStores = (pageNumber) => {
    const startIndex = (pageNumber - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setCurrentStorePageData(stores.slice(startIndex, endIndex));
    setCurrentStorePage(pageNumber);
  };

  // ดึงข้อมูลเมื่อโหลดคอมโพเนนต์
  useEffect(() => {
    getLocations();
    getStores();
  }, []);

  // อัปเดตข้อมูลเมื่อมีการเปลี่ยนแปลง
  useEffect(() => {
    paginateLocations(currentLocationPage);
  }, [locations]);

  useEffect(() => {
    paginateStores(currentStorePage);
  }, [stores]);

  // ฟังก์ชันจัดการการบันทึก
  const handleSave = () => {
    getLocations();
    getStores();
  };

  // ฟังก์ชันจัดการการกดปุ่ม Enter
  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      if (activeTab === "locations") {
        searchLocations();
        paginateLocations(1);
      } else if (activeTab === "stores") {
        searchStores();
        paginateStores(1);
      }
    }
  };

  // แปลง timestamp เป็นรูปแบบวันที่ที่อ่านง่าย
  const formatDate = (dateString) => {
    if (!dateString || dateString === "-") return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleString('th-TH');
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="min-vh-100" style={{ 
        fontFamily: "'Inter', 'Prompt', sans-serif",
        backgroundColor: "#1a1a1a",
        color: "#e0e0e0"
      }}>
      {/* ส่วนแท็บการจัดการ */}
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => {
          setActiveTab(k);
          searchRef.current.value = '';
        }}
        className="mb-0 nav-fill"
        style={{ 
          backgroundColor: "#2a2a2a",
          borderBottom: "1px solid #333333",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
        }}
      >
        <Tab 
          eventKey="locations" 
          title={
            <div className="d-flex align-items-center py-3" style={{ color: activeTab === "locations" ? "#00c853" : "#e0e0e0" }}>
              <GeoAltFill className="me-2" /> 
              <span className="fw-medium">Locations Page</span>
            </div>
          }
        />
        <Tab 
          eventKey="stores" 
          title={
            <div className="d-flex align-items-center py-3" style={{ color: activeTab === "stores" ? "#00c853" : "#e0e0e0" }}>
              <Building className="me-2" /> 
              <span className="fw-medium">Stores Page</span>
            </div>
          }
        />
      </Tabs>

      <Container fluid className="px-4 py-4">
        <Card className="border-0 shadow-sm" style={{ backgroundColor: "#2a2a2a", color: "#e0e0e0" }}>
          <Card.Body className="p-4">
            {/* ส่วนจัดการคลังสินค้า */}
            {activeTab === "stores" && (
              <div className="d-flex flex-column">
                <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
                  <h5 className="m-0 fw-bold" style={{ color: "#00c853" }}>
                    Stores
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
                        placeholder="ค้นหาคลังสินค้า..."
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
                          await getStores();
                        } else {
                          await searchStores();
                        }
                        paginateStores(1);
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
                        await getStores();
                        paginateStores(1);
                      }}
                    >
                      <XCircle size={18} className="me-1" /> Clear
                    </Button>
                    <Addstore onSave={handleSave}>
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
                    </Addstore>
                  </div>
                </div>

                <div className="table-responsive">
                  <Table hover className="align-middle border table-dark" style={{ borderRadius: "8px", overflow: "hidden" }}>
                    <thead style={{ backgroundColor: "#333333" }}>
                      <tr className="text-center">
                        <th className="py-3" style={{ color: "#e0e0e0" }}>No.</th>
                        <th className="py-3" style={{ color: "#e0e0e0" }}>Store Name</th>
                        <th className="py-3" style={{ color: "#e0e0e0" }}>Address</th>
                        <th className="py-3" style={{ color: "#e0e0e0" }}>Detail</th>
                        <th className="py-3" style={{ color: "#e0e0e0" }}>Action</th>
                      </tr>
                    </thead>

                    {stores.length === 0 ? (
                      <tbody>
                        <tr>
                          <td colSpan={5} className="text-center py-5" style={{ color: "#bdbdbd" }}>
                            <div className="d-flex flex-column align-items-center">
                              <BoxSeamFill size={40} className="mb-2 text-muted" />
                              <span className="fw-medium">No Data</span>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    ) : (
                      <tbody>
                        {currentStorePageData.map((store, index) => (
                          <tr key={store.store_id || index} className="text-center">
                            <td>{(currentStorePage - 1) * itemsPerPage + index + 1}</td>
                            <td className="fw-medium text-white">
                              <BoxSeamFill className="me-2 text-success" size={14} />
                              {store.store_name || "-"}
                            </td>
                            <td>
                              {store.store_address ? (
                                <span className="d-inline-flex align-items-center">
                                  <GeoAltFill size={14} className="me-1 text-secondary" />
                                  {store.store_address}
                                </span>
                              ) : "-"}
                            </td>
                            <td>{store.store_detail || "-"}</td>
                            <td>
                              <Button
                                variant="danger"
                                size="sm"
                                style={{ 
                                  borderRadius: "6px",
                                  backgroundColor: "#e53935",
                                  borderColor: "#e53935"
                                }}
                                onClick={() => deleteStore(store.store_id)}
                              >
                                <Trash size={16} />
                              </Button>
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
                    totalItems={stores.length}
                    paginate={paginateStores}
                    currentPage={currentStorePage}
                    setCurrentPage={setCurrentStorePage}
                  />
                </div>
              </div>
            )}

            {/* ส่วนจัดการสถานที่ */}
            {activeTab === "locations" && (
              <div className="d-flex flex-column">
                <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
                  <h5 className="m-0 fw-bold" style={{ color: "#00c853" }}>
                    Locations
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
                        placeholder="ค้นหาตำแหน่งจัดเก็บ..."
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
                          await getLocations();
                        } else {
                          await searchLocations();
                        }
                        paginateLocations(1);
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
                        await getLocations();
                        paginateLocations(1);
                      }}
                    >
                      <XCircle size={18} className="me-1" /> Clear
                    </Button>
                    <Addlo onSave={handleSave}>
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
                    </Addlo>
                  </div>
                </div>

                <div className="table-responsive">
                  <Table hover className="align-middle border table-dark" style={{ borderRadius: "8px", overflow: "hidden" }}>
                    <thead style={{ backgroundColor: "#333333" }}>
                      <tr className="text-center">
                        <th className="py-3" style={{ color: "#e0e0e0" }}>No.</th>
                        <th className="py-3" style={{ color: "#e0e0e0" }}>Location</th>
                        <th className="py-3" style={{ color: "#e0e0e0" }}>Store Name</th>
                        <th className="py-3" style={{ color: "#e0e0e0" }}>Detail</th>
                        <th className="py-3" style={{ color: "#e0e0e0" }}>Date Create</th>
                        <th className="py-3" style={{ color: "#e0e0e0" }}>Action</th>
                      </tr>
                    </thead>

                    {locations.length === 0 ? (
                      <tbody>
                        <tr>
                          <td colSpan={6} className="text-center py-5" style={{ color: "#bdbdbd" }}>
                            <div className="d-flex flex-column align-items-center">
                              <GeoAltFill size={40} className="mb-2 text-muted" />
                              <span className="fw-medium">No data</span>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    ) : (
                      <tbody>
                        {currentLocationPageData.map((location, index) => (
                          <tr key={location.location_id || index} className="text-center">
                            <td>{(currentLocationPage - 1) * itemsPerPage + index + 1}</td>
                            <td className="fw-medium text-white">
                              <GeoAltFill className="me-2 text-success" size={14} />
                              {location.location_name || "-"}
                            </td>
                            <td>
                              <Badge bg="dark" text="light" style={{ 
                                fontWeight: "normal", 
                                backgroundColor: "#333333",
                                padding: "6px 10px",
                                borderRadius: "4px",
                                fontSize: "0.85rem",
                                border: "1px solid #444444"
                              }}>
                                <BoxSeamFill className="me-1" size={12} />
                                {location.store_name || "-"}
                              </Badge>
                            </td>
                            <td>{location.location_detail || "-"}</td>
                            <td>
                              <small className="text-muted d-flex align-items-center justify-content-center">
                                <CalendarDate size={12} className="me-1" />
                                {formatDate(location.datetime)}
                              </small>
                            </td>
                            <td>
                              <Button
                                variant="danger"
                                size="sm"
                                style={{ 
                                  borderRadius: "6px",
                                  backgroundColor: "#e53935",
                                  borderColor: "#e53935"
                                }}
                                onClick={() => deleteLocation(location.location_id)}
                              >
                                <Trash size={16} />
                              </Button>
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
                    totalItems={locations.length}
                    paginate={paginateLocations}
                    currentPage={currentLocationPage}
                    setCurrentPage={setCurrentLocationPage}
                  />
                </div>
              </div>
            )}
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}

export default Locationmanage;