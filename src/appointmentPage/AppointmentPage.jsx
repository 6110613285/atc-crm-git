import React, { useState, useEffect, useContext, useRef } from "react";
import { Card, Modal, Button, Form, Row, Col, Table } from "react-bootstrap";

import { useLocation } from "react-router-dom";

import { UserContext } from "../App";
import Swal from "sweetalert2";

import AddAppointment from "./AddAppointment";
import SortDateTime from "../components/SortDateTime";

import PaginationComponent from "../components/PaginationComponent";

function AppointmentPage() {
  const userInfo = useContext(UserContext);

  const location = useLocation();

  let cal_id = "";
  let cus_id = "";
  let co_name = "";
  let co_branch = "";
  let pj_id = "";
  let pj_name = "";

  if (location.state) {
    cal_id = location.state.cal_id;
    cus_id = location.state.cus_id;
    co_name = location.state.co_name;
    co_branch = location.state.co_branch;
    pj_id = location.state.pj_id;
    pj_name = location.state.pj_name;
  }

  /* Get Appointment Data */
  const [appointments, setAppointments] = useState([]);
  const getAppointment = async () => {
    const dtStart = `${startDate.current.value} ${startTime.current.value}`;
    const dtEnd = `${endDate.current.value} ${endTime.current.value}`;

    try {
      if (cal_id) {
        const res = await fetch(
          `${import.meta.env.VITE_SERVER}/Appointment.php?server=${userInfo.server_db
          }&username=${userInfo.username_db}&password=${userInfo.password_db
          }&db=${userInfo.name_db
          }&action=getwherecalidcusid&callRecordId=${cal_id}&customerId=${cus_id}&sort=DESC&start=${dtStart}&end=${dtEnd}`,
          {
            method: "GET",
          }
        );
        //console.log(res.url);
        const data = await res.json();
        //console.log(data);
        if (data === null) {
          setAppointments([]);
        } else {
          setAppointments(data);
        }
      } else if (cus_id) {
        const res = await fetch(
          `${import.meta.env.VITE_SERVER}/Appointment.php?server=${userInfo.server_db
          }&username=${userInfo.username_db}&password=${userInfo.password_db
          }&db=${userInfo.name_db
          }&action=getwherecusid&customerId=${cus_id}&sort=DESC&start=${dtStart}&end=${dtEnd}`,
          {
            method: "GET",
          }
        );
        //console.log(res.url);
        const data = await res.json();
        ////console.log(data);
        if (data === null) {
          setAppointments([]);
        } else {
          setAppointments(data);
        }
      } else {
        if (userInfo.position == "Newsale") {
          const res = await fetch(
            `${import.meta.env.VITE_SERVER}/Appointment.php?server=${userInfo.server_db
            }&username=${userInfo.username_db}&password=${userInfo.password_db
            }&db=${userInfo.name_db}&action=getnewsale&userId=${userInfo.user_id
            }&sort=DESC&start=${dtStart}&end=${dtEnd}`,
            {
              method: "GET",
            }
          );
          //console.log(res.url);
          const data = await res.json();
          //console.log(data);
          if (data === null) {
            setAppointments([]);
          } else {
            setAppointments(data);
          }
        } else {
          const res = await fetch(
            `${import.meta.env.VITE_SERVER}/Appointment.php?server=${userInfo.server_db
            }&username=${userInfo.username_db}&password=${userInfo.password_db
            }&db=${userInfo.name_db
            }&action=get&sort=DESC&start=${dtStart}&end=${dtEnd}`,
            {
              method: "GET",
            }
          );
          //console.log(res.url);
          const data = await res.json();
          //console.log(data);
          if (data === null) {
            setAppointments([]);
          } else {
            setAppointments(data);
          }
        }
      }
    } catch (err) {
      console.log(err);
    }
  };
  /* Get Appointment Data */
  /* Get Customer Data */
  const [customers, setCustomers] = useState([]);
  const getCustomer = async () => {
    //console.log(id);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER}/Customer.php?server=${userInfo.server_db
        }&username=${userInfo.username_db}&password=${userInfo.password_db
        }&db=${userInfo.name_db}&action=get&sort=DESC`,
        {
          method: "GET",
        }
      );
      const data = await res.json();
      //console.log(data);
      if (data === null) {
        setCustomers([]);
      } else {
        setCustomers(data);
      }
    } catch (err) {
      console.log(err);
    }
  };
  // const getCustomerName = (id) => {
  //   if (customers && customers.length > 0) {
  //     const customer = customers.find((c) => c.cus_id === id);
  //     return customer ? customer.cus_name : "";
  //   }
  //   return "";
  // };
  const getCustomerName = (ids) => {
    console.log("name ==> : " + { ids });
    let customerName = [];
    if (
      Array.isArray(ids) &&
      ids.length > 0 &&
      customers &&
      customers.length > 0
    ) {
      // const customer = customers.filter((c) => c.cus_id === ids);
      customerName = ids.map((id) => {
        return customers.find((c) => c.cus_id === id).cus_name + " ";
      });
      // console.log("customer.cus_name => ", customerName);
      // return customer ? customer.cus_name : "";
    }
    return customerName;
  };
  const getCustomerTel = (id) => {
    if (customers && customers.length > 0) {
      const customer = customers.find((c) => c.cus_id === id);
      return customer ? customer.cus_tel : "";
    }
    return "";
  };
  const getCustomerCompany = (id) => {
    if (customers && customers.length > 0) {
      const customer = customers.find((c) => c.cus_id === id);
      return customer ? customer.co_id : "";
    }
    return "";
  };
  /* Get End Customer Data */
  /* Get Company Data */
  const [companies, setCompanies] = useState([]);
  const getCompany = async () => {
    /* if (co_id) {
      const res = await fetch(
        `${
          import.meta.env.VITE_SERVER
        }/Company.php?action=getwherecoid&id=${co_id}`,
        {
          method: "GET",
        }
      );
      const data = await res.json();
      //console.log(data);
      if (data === null) {
        console.log("No Data");
      } else {
        await setCompanies(data);
        //console.log(data[0].co_id);
      }
    } else { */
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER}/Company.php?server=${userInfo.server_db
        }&username=${userInfo.username_db}&password=${userInfo.password_db
        }&db=${userInfo.name_db}&action=get&sort=ASC`,
        {
          method: "GET",
        }
      );
      const data = await res.json();
      //console.log(data);
      if (data.data === null) {
        setCompanies([]);
      } else {
        setCompanies(data.data);
      }
      /* } */
    } catch (err) {
      console.log(err);
    }
  };
  const getCompanyName = (id) => {
    if (companies && companies.length > 0) {
      const company = companies.find((c) => c.co_id === id);
      return company ? company.co_name : "";
    }
    return "";
  };
  const getCompanyAddress = (id) => {
    if (companies && companies.length > 0) {
      const company = companies.find((c) => c.co_id === id);
      return company
        ? `${company.co_address} ${company.co_subdistrict}, ${company.co_district} ${company.co_province} ${company.co_zipcode}`
        : "";
    }
    return "";
  };
  /* Get End Company Data */
  /* Get Project Data */
  const [projects, setProjects] = useState([]);
  const getProject = async (id) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER}/Project.php?server=${userInfo.server_db
        }&username=${userInfo.username_db}&password=${userInfo.password_db
        }&db=${userInfo.name_db}&action=getwherecusid&id=${id}`,
        {
          method: "GET",
        }
      );
      const data = await res.json();
      //console.log(data);
      if (data === null) {
        setProjects([]);
      } else {
        setProjects(data);
      }
    } catch (err) {
      console.log(err);
    }
  };
  const getProjectName = (id) => {
    if (projects && projects.length > 0) {
      const project = projects.find((p) => p.pj_id === id);
      return project ? project.pj_name : "";
    }
    return "";
  };
  /* Get Project Data */

  const [validated, setValidated] = useState(false);

  const [appointmentId, setAppointmentId] = useState("");
  const [afterVisitDetail, setAfterVisitDetail] = useState("");

  /* Modal */
  const [showModalAfterVisit, setShowModalAfterVisit] = useState(false);

  const handleCloseModalAfterVisit = () => setShowModalAfterVisit(false);
  //const handleShowModalEdit = () => setShowModalEdit(true);

  const handleAfterVisitSubmit = async (event) => {
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    } else {
      event.preventDefault();
      event.stopPropagation();

      addAfterVisitDetailAppointment();
    }
    setValidated(true);
  };

  const addAfterVisitDetailAppointment = async () => {
    /* Date Time Now */
    const today = new Date();
    const date = `${today.getFullYear()}-${today.getMonth() + 1
      }-${today.getDate()}`;
    const time = `${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`;
    const dt = `${date} ${time}`;

    //console.log(dt);
    /* Date Time Now */
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER}/Appointment.php?server=${userInfo.server_db
        }&username=${userInfo.username_db}&password=${userInfo.password_db
        }&db=${userInfo.name_db
        }&action=updateaftervisitdetail&id=${appointmentId}&aftervisitdetail=${afterVisitDetail}&dtvisit=${dt}`,
        {
          method: "POST",
        }
      );

      const data = await res.json();
      //console.log(data);
      if (data === "ok") {
        //alert("Save Success!!");
        //window.location.reload();
        Swal.fire({
          position: "center",
          icon: "success",
          title: "Saved Success",
          showConfirmButton: false,
          timer: 1500,
        });
        setShowModalAfterVisit(false);
        getAppointment();
      }
    } catch (err) {
      console.log(err);
      Swal.fire({
        position: "center",
        icon: "error",
        title: "Some thing went wrong!!!",
        showConfirmButton: false,
        timer: 2000,
      });
    }
  };
  /* End Modal */

  //pagination
  const [currentPageData, setCurrentPageData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1); // เพิ่มตัวแปร currentPage และสร้างฟังก์ชัน setCurrentPage เพื่อใช้ในการเปลี่ยนหน้า

  const itemsPerPage = 10; // กำหนดจำนวนรายการต่อหน้า

  const paginate = (pageNumber) => {
    const startIndex = (pageNumber - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setCurrentPageData(appointments.slice(startIndex, endIndex));
    setCurrentPage(pageNumber); // เมื่อเปลี่ยนหน้าใหม่ ให้เปลี่ยน currentPage ให้ตรงกับหน้าใหม่
  };
  // End Pagination

  //get call back add
  const handleSave = (callback) => {
    if (callback) {
      getAppointment();
    }
  };

  const startDate = useRef(null);
  const startTime = useRef(null);
  const endDate = useRef(null);
  const endTime = useRef(null);

  useEffect(() => {
    startDate.current.value = new Date().toISOString().split("T")[0];
    startTime.current.value = "00:00";
    endDate.current.value = new Date().toISOString().split("T")[0];
    endTime.current.value = "23:59";
  }, []);

  useEffect(() => {
    if (userInfo) {
      getAppointment();
      getCustomer();
      getCompany();
      if (!cal_id) {
        getProject(cus_id);
      }
    }
  }, [location, userInfo]);

  useEffect(() => {
    paginate(currentPage);
  }, [appointments]);

  return (
    <>
      <div className="mx-5">
        <div className="d-flex justify-content-between align-items-center">
          <h1 className="mb-3">Appointment Page</h1>

          {cus_id ? (
            cal_id ? (
              pj_id ? (
                <AddAppointment
                  cus_id={cus_id}
                  cal_id={cal_id}
                  pj_id={pj_id}
                  onSave={handleSave}
                />
              ) : (
                <AddAppointment
                  cus_id={cus_id}
                  cal_id={cal_id}
                  onSave={handleSave}
                />
              )
            ) : (
              <AddAppointment cus_id={cus_id} onSave={handleSave} />
            )
          ) : (
            <AddAppointment onSave={handleSave} />
          )}
        </div>
        {cus_id ? (
          <Card className="py-3 px-5 mb-3 gap-2">
            <h2>
              <b>{co_name} </b> ({co_branch})
            </h2>
            <h3 className="ms-5">
              <b>Customer:</b> {getCustomerName(cus_id)}
            </h3>
            <h3 className="ms-5">
              <b>Tel:</b> {getCustomerTel(cus_id)}
            </h3>
            <h3 className="ms-5">
              <b>Project:</b> {pj_name ? pj_name : `No Project`}
            </h3>
          </Card>
        ) : (
          <></>
        )}

        <Row className="d-flex justify-content-center my-3">
          <Col sm={12} md={6} lg={2}>
            <Form.Group
              as={Col}
              md="3"
              className="w-100"
              onChange={getAppointment}
            >
              <Form.Control type="date" ref={startDate} />
            </Form.Group>
          </Col>
          <Col sm={12} md={6} lg={2}>
            <Form.Group
              as={Col}
              md="3"
              className="w-100"
              onChange={getAppointment}
            >
              <Form.Control type="time" ref={startTime} />
            </Form.Group>
          </Col>

          <Col sm={12} md={6} lg={2}>
            <Form.Group
              as={Col}
              md="3"
              className="w-100"
              onChange={getAppointment}
            >
              <Form.Control type="date" ref={endDate} />
            </Form.Group>
          </Col>
          <Col sm={12} md={6} lg={2}>
            <Form.Group
              as={Col}
              md="3"
              className="w-100"
              onChange={getAppointment}
            >
              <Form.Control type="time" ref={endTime} />
            </Form.Group>
          </Col>
        </Row>

        {/* data table */}
        <Table
          responsive
          striped
          hover
          bordered
          variant="dark" /* style={{fontSize: "14px"}} */
        >
          <thead /* className="bg-dark text-white" */>
            <tr className="text-center">
              <th>#</th>
              <th>Company</th>
              <th>Address</th>
              <th>Customer</th>
              <th>Call</th>
              <th>Appointment DateTime</th>
              <th>Before visit Detail</th>
              <th>Status</th>
              <th>After Visit Detail</th>
              <th>Last Update</th>
              <th>Action</th>
            </tr>
          </thead>

          {appointments.length == 0 ? (
            <tbody>
              <tr>
                <td colSpan={12} className="fw-bold text-center">
                  No Data
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody>
              {currentPageData.map((appointment, index) => (
                <tr key={index + 1} className="text-center">
                  <td>{index + 1}</td>
                  <td>
                    {getCompanyName(
                      getCustomerCompany(appointment.cus_id.split(",")[0])
                    )}
                  </td>
                  <td>
                    {getCompanyAddress(
                      getCustomerCompany(appointment.cus_id.split(",")[0])
                    )}
                  </td>
                  <td>{getCustomerName(appointment.cus_id.split(","))}</td>
                  <td>
                    {appointment.cal_id === "nocall"
                      ? `No Call`
                      : appointment.cal_id}
                  </td>
                  <td>
                    <SortDateTime
                      props={`${appointment.app_date} ${appointment.app_time}`}
                    />
                  </td>
                  <td>{appointment.app_detail}</td>
                  {appointment.app_status == "visited" ? (
                    <td className=" fw-bold text-dark">
                      <Card className="p-2" style={{ backgroundColor: "lime" }}>
                        {appointment.app_status.toUpperCase()}
                      </Card>
                    </td>
                  ) : (
                    <td className="fw-bold text-dark">
                      <Card className="bg-warning p-2">
                        {appointment.app_status.toUpperCase()}
                      </Card>
                    </td>
                  )}

                  <td>{appointment.app_aftervisit_detail}</td>
                  <td>{appointment.app_dt_visit}</td>
                  <td>
                    <Button
                      onClick={() => {
                        setShowModalAfterVisit(true);
                        setAfterVisitDetail(
                          appointment.app_aftervisit_detail
                            ? appointment.app_aftervisit_detail
                            : ""
                        );
                        setAppointmentId(appointment.app_id);
                      }}
                      style={{
                        backgroundColor: "orange",
                        borderColor: "orange",
                      }}
                      data-bs-toggle="tooltip"
                      data-bs-placement="top"
                      title="after visit"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="22"
                        height="22"
                        fill="currentColor"
                        className="bi bi-calendar-check-fill "
                        viewBox="0 0 16 16"
                      >
                        <path d="M4 .5a.5.5 0 0 0-1 0V1H2a2 2 0 0 0-2 2v1h16V3a2 2 0 0 0-2-2h-1V.5a.5.5 0 0 0-1 0V1H4V.5zM16 14V5H0v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2zm-5.146-5.146-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 0 1 .708-.708L7.5 10.793l2.646-2.647a.5.5 0 0 1 .708.708z" />
                      </svg>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          )}
        </Table>
        {/* data table */}
        {/* Modal */}
        <Modal
          size="lg"
          show={showModalAfterVisit}
          onHide={handleCloseModalAfterVisit}
        >
          <Form
            noValidate
            validated={validated}
            onSubmit={handleAfterVisitSubmit}
          >
            <Modal.Header closeButton>
              <Modal.Title>After Visit</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Row>
                <Form.Group as={Col} md="12" className="mb-3">
                  <Form.Label>
                    <b>After Visit Detail</b>
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    type="text"
                    placeholder="After Visit Detail"
                    onChange={(e) => {
                      setAfterVisitDetail(e.target.value);
                    }}
                  />
                  <Form.Control.Feedback type="invalid">
                    <b>Please Enter After Visit Detail</b>
                  </Form.Control.Feedback>
                </Form.Group>
              </Row>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseModalAfterVisit}>
                <b>Close</b>
              </Button>
              <Button type="submit" variant="warning">
                <b>Save Changes</b>
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
        {/* End Modal */}
        {/* Pagination */}
        <PaginationComponent
          itemsPerPage={itemsPerPage}
          totalItems={appointments.length}
          paginate={paginate}
          currentPage={currentPage} // ส่งตัวแปร currentPage ไปให้ Pagination
          setCurrentPage={setCurrentPage}
        />
      </div>
    </>
  );
}

export default AppointmentPage;
