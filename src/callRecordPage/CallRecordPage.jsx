import React, { useContext } from "react";
import { Card, Button, Form, Row, Col, Table } from "react-bootstrap";
import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";

import SortDateTime from "../components/SortDateTime";

import { UserContext } from "../App";

import AddCallRecord from "./AddCallRecord";

import PaginationComponent from "../components/PaginationComponent";

function CallRecordPage() {
  const userInfo = useContext(UserContext);

  const location = useLocation();
  let co_id;
  let cus_id;
  let pj_id;

  if (location.state) {
    co_id = location.state.co_id;
    cus_id = location.state.cus_id;

    if (location.state.pj_id) {
      pj_id = location.state.pj_id;
    }
    console.log("state  => " + co_id, cus_id, pj_id);
  }

  const [caller, setCaller] = useState("all");

  const startDate = useRef(null);
  const startTime = useRef(null);
  const endDate = useRef(null);
  const endTime = useRef(null);

  /* Get Callrecord */
  const [callrecords, setCallrecords] = useState([]);
  const getCallRecord = async () => {
    const dtStart = `${startDate.current.value} ${startTime.current.value}`;
    const dtEnd = `${endDate.current.value} ${endTime.current.value}`;
    //console.log(caller);

    //where pj_id
    if (pj_id && cus_id) {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER}/Callrecord.php?server=${
          userInfo.server_db
        }&username=${userInfo.username_db}&password=${
          userInfo.password_db
        }&db=${
          userInfo.name_db
        }&action=getwherepjid&id=${pj_id}&sort=DESC&start=${dtStart}&end=${dtEnd}&caluser=${caller}`,
        {
          method: "GET",
        }
      );

      const data = await res.json();
      ////console.log(data);
      if (data === null) {
        setCallrecords([]);
      } else {
        setCallrecords(data);
      }
    }
    //where cus_id
    else if (cus_id) {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER}/Callrecord.php?server=${
          userInfo.server_db
        }&username=${userInfo.username_db}&password=${
          userInfo.password_db
        }&db=${
          userInfo.name_db
        }&action=getwherecusid&id=${cus_id}&sort=DESC&start=${dtStart}&end=${dtEnd}&caluser=${caller}`,
        {
          method: "GET",
        }
      );
      const data = await res.json();
      ////console.log(data);
      if (data === null) {
        setCallrecords([]);
      } else {
        setCallrecords(data);
      }
    }
    ///no where
    else {
      if (userInfo.position == "Newsale") {
        const res = await fetch(
          `${import.meta.env.VITE_SERVER}/Callrecord.php?server=${
            userInfo.server_db
          }&username=${userInfo.username_db}&password=${
            userInfo.password_db
          }&db=${
            userInfo.name_db
          }&action=getnewsale&sort=DESC&start=${dtStart}&end=${dtEnd}&userId=${
            userInfo.user_id
          }`,
          {
            method: "GET",
          }
        );
        const data = await res.json();
        if (data === null) {
          setCallrecords([]);
        } else {
          setCallrecords(data);
        }
      } else {
        const res = await fetch(
          `${import.meta.env.VITE_SERVER}/Callrecord.php?server=${
            userInfo.server_db
          }&username=${userInfo.username_db}&password=${
            userInfo.password_db
          }&db=${
            userInfo.name_db
          }&action=get&sort=DESC&start=${dtStart}&end=${dtEnd}&caluser=${caller}`,
          {
            method: "GET",
          }
        );
        const data = await res.json();
        ////console.log(res);
        if (data === null) {
          setCallrecords([]);
        } else {
          setCallrecords(data);
        }
      }
    }
  };

  const [callerList, setCallerList] = useState([]);
  const getCallerList = async () => {
    const res = await fetch(
      `${import.meta.env.VITE_SERVER}/Callrecord.php?server=${
        userInfo.server_db
      }&username=${userInfo.username_db}&password=${userInfo.password_db}&db=${
        userInfo.name_db
      }&action=getcaluser`,
      {
        method: "GET",
      }
    );

    const data = await res.json();
    ////console.log(data);
    if (data === null) {
      setCallerList([]);
    } else {
      setCallerList(data);
    }
  };

  /* End Get Callrecord */

  /* Get Company Data */
  const [companies, setCompanies] = useState([]);
  const getCompany = async () => {
    if (co_id) {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER}/Company.php?server=${
          userInfo.server_db
        }&username=${userInfo.username_db}&password=${
          userInfo.password_db
        }&db=${userInfo.name_db}&action=getwherecoid&id=${co_id}`,
        {
          method: "GET",
        }
      );
      const data = await res.json();
      ////console.log(data);
      if (data === null) {
        setCompanies([]);
      } else {
        setCompanies(data);
        ////console.log(data[0].co_id);
      }
    } else {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER}/Company.php?server=${
          userInfo.server_db
        }&username=${userInfo.username_db}&password=${
          userInfo.password_db
        }&db=${userInfo.name_db}&action=get&sort=ASC`,
        {
          method: "GET",
        }
      );
      const data = await res.json();
      //console.log(data.data);
      if (data.data === null) {
        setCompanies([]);
      } else {
        setCompanies(data.data);
      }
    }
  };
  const getCompanyName = (id) => {
    if (companies && companies.length > 0) {
      const company = companies.find((c) => c.co_id === id);
      return company ? company.co_name : "";
    }
    return "";
  };
  const getCompanyBranch = (id) => {
    if (companies && companies.length > 0) {
      const company = companies.find((c) => c.co_id === id);
      return company ? company.co_branch : "";
    }
    return "";
  };
  /* Get End Company Data */

  /* Get Customer Data */
  const [customers, setCustomers] = useState([]);
  const getCustomer = async (id) => {
    ////console.log(id);

    if (id) {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER}/Customer.php?server=${
          userInfo.server_db
        }&username=${userInfo.username_db}&password=${
          userInfo.password_db
        }&db=${userInfo.name_db}&action=getwherecoid&id=${id}`,
        {
          method: "GET",
        }
      );
      const data = await res.json();
      ////console.log(data);
      if (data === null) {
        setCustomers([]);
      } else {
        setCustomers(data);
      }
    } else {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER}/Customer.php?server=${
          userInfo.server_db
        }&username=${userInfo.username_db}&password=${
          userInfo.password_db
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
    }
  };
  const getCustomerName = (id) => {
    if (customers && customers.length > 0) {
      const customer = customers.find((c) => c.cus_id === id);
      return customer ? customer.cus_name : "";
    }
    return "";
  };
  const getCustomerTel = (id) => {
    if (customers && customers.length > 0) {
      const customer = customers.find((c) => c.cus_id === id);
      return customer ? customer.cus_tel : "";
    }
    return "";
  };
  /* Get Customer Data */
  /* Get Project Data */
  const [projects, setProjects] = useState([]);
  const getProject = async (id) => {
    if (id) {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER}/Project.php?server=${
          userInfo.server_db
        }&username=${userInfo.username_db}&password=${
          userInfo.password_db
        }&db=${userInfo.name_db}&action=getwherecusid&id=${id}`,
        {
          method: "GET",
        }
      );
      const data = await res.json();
      ////console.log(data);
      if (data === null) {
        setProjects([]);
      } else {
        setProjects(data);
        console.log("getproject => :" + data);
      }
    } else {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER}/Project.php?server=${
          userInfo.server_db
        }&username=${userInfo.username_db}&password=${
          userInfo.password_db
        }&db=${userInfo.name_db}&action=get&sort=DESC&status=all&salesId=all`,
        {
          method: "GET",
        }
      );
      const data = await res.json();
      ////console.log(data);
      console.log("No DATA getproject ");
      if (data === null) {
        setProjects([]);
      } else {
        setProjects(data);
      }
    }
  };
  const getProjectName = (id) => {
    if (projects && projects.length > 0) {
      console.log("getproject2 => :" + projects);
      const project = projects.find((p) => p.pj_id === id);
      return project ? project.pj_name : "";
    }
    return "";
  };
  /* Get Project Data */
  /* Get User data */
  const [users, setUser] = useState([]);
  const getUser = async () => {
    const res = await fetch(
      `${import.meta.env.VITE_SERVER}/User.php?server=${
        userInfo.server_db
      }&username=${userInfo.username_db}&password=${userInfo.password_db}&db=${
        userInfo.name_db
      }&action=getall`,
      {
        method: "GET",
      }
    );
    const data = await res.json();
    //console.log(data);
    if (data === null) {
      setUser([]);
    } else {
      setUser(data);
    }
  };
  const getUserFName = (id) => {
    if (users && users.length > 0) {
      const user = users.find((u) => u.user_id === id);
      return user ? user.fname : "";
    }
    return "";
  };
  const getUserLName = (id) => {
    if (users && users.length > 0) {
      const user = users.find((c) => c.user_id === id);
      //console.log(customer.cus_name);
      return user ? user.lname : "";
    }
    return "";
  };

  /* End Get User data */

  //pagination
  const [currentPageData, setCurrentPageData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1); // เพิ่มตัวแปร currentPage และสร้างฟังก์ชัน setCurrentPage เพื่อใช้ในการเปลี่ยนหน้า

  const itemsPerPage = 200; // กำหนดจำนวนรายการต่อหน้า

  const paginate = (pageNumber) => {
    const startIndex = (pageNumber - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setCurrentPageData(callrecords.slice(startIndex, endIndex));
    setCurrentPage(pageNumber); // เมื่อเปลี่ยนหน้าใหม่ ให้เปลี่ยน currentPage ให้ตรงกับหน้าใหม่
  };
  // End Pagination

  //get call back add
  const handleSave = (callback) => {
    if (callback) {
      getCallRecord();
    }
  };

  useEffect(() => {
    const currentDate = new Date();
    currentDate.setFullYear(currentDate.getFullYear());
    startDate.current.value = currentDate.toISOString().split("T")[0];
    //startDate.current.value = new Date().toISOString().split("T")[0];
    startTime.current.value = "00:00";
    endDate.current.value = new Date().toISOString().split("T")[0];
    endTime.current.value = "23:59";
  }, []);

  useEffect(() => {
    if (userInfo) {
      getCallRecord();
      getCompany();
      getCustomer();

      if (co_id && cus_id) {
        if (Array.isArray(cus_id)) {
          getProject(cus_id[0]);
        } else {
          getProject(cus_id);
        }
      } else {
        getProject();
      }

      getUser();
      getCallerList();
    }
  }, [location, userInfo]);

  useEffect(() => {
    paginate(currentPage);
  }, [callrecords]);

  useEffect(() => {
    if (userInfo) {
      getCallRecord();

      paginate(currentPage);
    }
  }, [caller]);

  return (
    <>
      <div className="mx-5">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h1>Call Record Page </h1>

          {co_id && cus_id ? (
            pj_id ? (
              <AddCallRecord
                co_id={co_id}
                cus_id={cus_id}
                pj_id={pj_id}
                onSave={handleSave}
              />
            ) : (
              <AddCallRecord
                co_id={co_id}
                cus_id={cus_id}
                onSave={handleSave}
              />
            )
          ) : (
            <AddCallRecord onSave={handleSave} />
          )}
        </div>
        {cus_id ? (
          <Card className="py-3 px-5 mb-5 gap-2">
            <h2>
              <b>{getCompanyName(co_id)} </b>{" "}
              {getCompanyBranch(co_id) ? `(${getCompanyBranch(co_id)})` : <></>}
            </h2>
            {Array.isArray(cus_id) ? (
              cus_id.length > 1 ? (
                cus_id.map((id, index) => (
                  <div key={index}>
                    <h3 className="ms-5">
                      <b>Customer {index + 1}:</b> {getCustomerName(id)}
                    </h3>
                    <h3 className="ms-5">
                      <b>Tel:</b> {getCustomerTel(id)}
                    </h3>
                  </div>
                ))
              ) : (
                <div>
                  <h3 className="ms-5">
                    <b>Customer:</b> {getCustomerName(cus_id[0])}
                  </h3>
                  <h3 className="ms-5">
                    <b>Tel:</b> {getCustomerTel(cus_id[0])}
                  </h3>
                </div>
              )
            ) : (
              <div>
                <h3 className="ms-5">
                  <b>Customer:</b> {getCustomerName(cus_id)}
                </h3>
                <h3 className="ms-5">
                  <b>Tel:</b> {getCustomerTel(cus_id)}
                </h3>
              </div>
            )}

            {pj_id ? (
              <h3 className="ms-5">
                <b>Project:</b> {getProjectName(pj_id)}
              </h3>
            ) : (
              <></>
            )}
          </Card>
        ) : (
          <></>
        )}
      </div>
      <div className="mx-5 mt-1">
        <Row>
          <Col sm={12} md={6} lg={4}>
            <Form.Group
              as={Col}
              md="3"
              className="w-100"
              onChange={getCallRecord}
            >
              <Form.Control type="date" ref={startDate} />
            </Form.Group>
          </Col>
          <Col sm={12} md={6} lg={2}>
            <Form.Group
              as={Col}
              md="3"
              className="w-100"
              onChange={getCallRecord}
            >
              <Form.Control type="time" ref={startTime} />
            </Form.Group>
          </Col>

          <Col sm={12} md={6} lg={2}>
            <Form.Group
              as={Col}
              md="3"
              className="w-100"
              onChange={getCallRecord}
            >
              <Form.Control type="date" ref={endDate} />
            </Form.Group>
          </Col>
          <Col sm={12} md={6} lg={2}>
            <Form.Group
              as={Col}
              md="3"
              className="w-100"
              onChange={getCallRecord}
            >
              <Form.Control type="time" ref={endTime} />
            </Form.Group>
          </Col>
          {userInfo?.position === "Newsale" ? (
            <></>
          ) : (
            <Col sm={12} md={12} lg={3}>
              <Form.Group>
                <Form.Select
                  value={caller}
                  onChange={async (e) => {
                    setCaller(e.target.value);
                  }}
                  data-bs-toggle="tooltip"
                  data-bs-placement="top"
                  title="select caller"
                >
                  <option className="fw-bold" value={"all"}>
                    All
                  </option>
                  {callerList.map((caller, index) => (
                    <option
                      value={caller.cal_user}
                      className="fw-bold"
                      key={index + 1}
                    >
                      {caller.cal_user}
                      {getUserFName(caller.cal_user)}{" "}
                      {getUserLName(caller.cal_user)}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          )}
        </Row>
      </div>
      {/* data table */}
      <div className="px-5">
        <Table
          responsive
          striped
          bordered
          hover
          variant="dark"
          className="mt-3"
        >
          <thead>
            <tr className="text-center">
              <th>#</th>

              <th>Company</th>
              <th>Customer</th>
              <th>Project ID</th>
              <th>Project</th>
              <th width={400}>Detail</th>
              <th>Status</th>
              <th>Datetime</th>
              <th>User ID</th>
              <th>Caller</th>
              <th>Call Type</th>
              <th>Next Follow up</th>
              <th>Action</th>
            </tr>
          </thead>
          {callrecords == 0 ? (
            <tbody>
              <tr>
                <td colSpan={13} className="fw-bold text-center">
                  No Data
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody>
              {currentPageData.map((callrecord, index) => (
                <tr key={index + 1} className="text-center">
                  <td>{index + 1}</td>

                  <td>
                    {getCompanyName(callrecord.co_id)} (
                    {getCompanyBranch(callrecord.co_id)})
                  </td>
                  <td>{getCustomerName(callrecord.cus_id)}</td>
                  <td>{callrecord.pj_id}</td>
                  <td>{getProjectName(callrecord.pj_id)}</td>
                  <td width={400}>{callrecord.cal_detail}</td>
                  <td>{callrecord.cal_status}</td>
                  <td>{<SortDateTime props={callrecord.cal_dt} />}</td>
                  <td>{callrecord.cal_user}</td>
                  <td>
                    {getUserFName(callrecord.cal_user)}{" "}
                    {getUserLName(callrecord.cal_user)}
                  </td>
                  <td>{callrecord.call_type}</td>
                  <td>{callrecord.next_followup}</td>
                  <td>
                    <Link
                      to="/Appointment"
                      state={{
                        cal_id: `${callrecord.cal_id}`,
                        cus_id: `${callrecord.cus_id}`,
                        co_name: `${getCompanyName(callrecord.co_id)}`,
                        co_branch: `${getCompanyBranch(callrecord.co_id)}`,
                        pj_id: `${callrecord.pj_id}`,
                        pj_name: `${getProjectName(callrecord.pj_id)}`,
                      }}
                    >
                      <Button
                        variant="success"
                        data-bs-toggle="tooltip"
                        data-bs-placement="top"
                        title="appointment"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          fill="currentColor"
                          className="bi bi-calendar-week-fill"
                          viewBox="0 0 16 16"
                          data-bs-toggle="tooltip"
                          data-bs-placement="top"
                          title="appointment"
                        >
                          <path d="M4 .5a.5.5 0 0 0-1 0V1H2a2 2 0 0 0-2 2v1h16V3a2 2 0 0 0-2-2h-1V.5a.5.5 0 0 0-1 0V1H4V.5zM16 14V5H0v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2zM9.5 7h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5zm3 0h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5zM2 10.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1zm3.5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5z" />
                        </svg>
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          )}
        </Table>
        {/* data table */}

        {/* Pagination */}
        <PaginationComponent
          itemsPerPage={itemsPerPage}
          totalItems={callrecords.length}
          paginate={paginate}
          currentPage={currentPage} // ส่งตัวแปร currentPage ไปให้ Pagination
          setCurrentPage={setCurrentPage}
        />
      </div>
    </>
  );
}

export default CallRecordPage;
