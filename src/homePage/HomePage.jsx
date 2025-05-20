import React, { useState, useEffect, useRef, useContext } from "react";
import {
  Container,
  Card,
  Button,
  Table,
  Form,
  Col,
  Modal,
  Row,
} from "react-bootstrap";
import { useLocation, Link, useNavigate } from "react-router-dom";

import { UserContext } from "../App";
import AddProject from "../projectPage/AddProject";
import EditProject from "../projectPage/EditProject";
import SortDateTime from "../components/SortDateTime";
// import Dashboard from "./Dashboard";
import * as Icon from "react-bootstrap-icons";
import PaginationComponent from "../components/PaginationComponent";

function HomePage() {
  const userInfo = useContext(UserContext);
  let location = useLocation();
  let navigate = useNavigate();

  let cus_id = "";
  let cus_name = "";
  let co_id = "";
  let com_id = "";

  if (location.state) {
    cus_id = location.state.cus_id;
    cus_name = location.state.cus_name;
    co_id = location.state.co_id;
  }
  /*----------------------------------------------------------------------------------------------DashBoard--------------------------------------------------------*/
  const taget_call = 100;
  // const userInfo = useContext(UserContext) || {};

  /* Get Sales */
  const [saleSearch, setSaleSearch] = useState("all");
  const [sales, setSales] = useState([]);
  const getSale = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER}/User.php?server=${
          userInfo.server_db
        }&username=${userInfo.username_db}&password=${
          userInfo.password_db
        }&db=${userInfo.name_db}&action=getsales`,
        {
          method: "GET",
        }
      );
      const data = await res.json();
      ////console.log(data);
      if (data === null) {
        setSales([]);
      } else {
        setSales(data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  /* Get callrecord Data */
  const [callRecord, setCallRecord] = useState([]);
  const [callRecordSearch, setCallRecordSearch] = useState([]);
  const getCallRecord = async () => {
    try {
      let urls;
      if (userInfo.level == "admin") {
        urls = `${import.meta.env.VITE_SERVER}/Home.php?server=${
          userInfo.server_db
        }&username=${userInfo.username_db}&password=${
          userInfo.password_db
        }&db=${userInfo.name_db}&action=getcallrecord&userid=${saleSearch}`;
      } else {
        urls = `${import.meta.env.VITE_SERVER}/Home.php?server=${
          userInfo.server_db
        }&username=${userInfo.username_db}&password=${
          userInfo.password_db
        }&db=${userInfo.name_db}&action=getcallrecord&userid=${
          userInfo.user_id
        }`;
      }
      // console.log("urls", urls);
      const res = await fetch(urls, {
        method: "GET",
      });
      const data = await res.json();
      // console.log("data", data);
      if (data === null) {
        setCallRecord([]);
      } else {
        setCallRecord(data);
      }
    } catch (err) {
      console.log(err);
    }
  };
  /* Get Total count project  call  */
  const [countProjectCall, setCountProjectCall] = useState([]);
  const getCountProjectCall = async () => {
    try {
      let urls;
      if (userInfo.level == "admin") {
        urls = `${import.meta.env.VITE_SERVER}/Home.php?server=${
          userInfo.server_db
        }&username=${userInfo.username_db}&password=${
          userInfo.password_db
        }&db=${
          userInfo.name_db
        }&action=getcountprojectcall&userid=${saleSearch}`;
      } else {
        urls = `${import.meta.env.VITE_SERVER}/Home.php?server=${
          userInfo.server_db
        }&username=${userInfo.username_db}&password=${
          userInfo.password_db
        }&db=${userInfo.name_db}&action=getcountprojectcall&userid=${
          userInfo.user_id
        }`;
      }
      const res = await fetch(urls, {
        method: "GET",
      });
      const data = await res.json();
      if (data === null) {
        setCountProjectCall([]);
      } else {
        setCountProjectCall(data);
      }
    } catch (err) {
      console.log(err);
    }
  };
  /* Get Totalcall Data */
  const [totalCall, setTotalCall] = useState([]);
  const getTotalCall = async () => {
    try {
      let urls;
      if (userInfo.level == "admin") {
        urls = `${import.meta.env.VITE_SERVER}/Home.php?server=${
          userInfo.server_db
        }&username=${userInfo.username_db}&password=${
          userInfo.password_db
        }&db=${userInfo.name_db}&action=getTotalcall&userid=${saleSearch}`;
      } else {
        urls = `${import.meta.env.VITE_SERVER}/Home.php?server=${
          userInfo.server_db
        }&username=${userInfo.username_db}&password=${
          userInfo.password_db
        }&db=${userInfo.name_db}&action=getTotalcall&userid=${
          userInfo.user_id
        }`;
      }
      //console.log("urls", urls);
      const res = await fetch(urls, {
        method: "GET",
      });
      // console.log("res", res);
      const data = await res.json();
      // console.log("datatotal", data);
      if (data === null) {
        setTotalCall([]);
      } else {
        setTotalCall(data);
      }
    } catch (err) {
      console.log(err);
    }
  };
  /* Get count Quotation Data */
  const [totalQuotation, setTotalQuotation] = useState([]);
  const getTotalQuotation = async () => {
    try {
      let urls;
      if (userInfo.level == "admin") {
        urls = `${import.meta.env.VITE_SERVER}/Home.php?server=${
          userInfo.server_db
        }&username=${userInfo.username_db}&password=${
          userInfo.password_db
        }&db=${userInfo.name_db}&action=getTotalQuotation&userid=${saleSearch}`;
      } else {
        urls = `${import.meta.env.VITE_SERVER}/Home.php?server=${
          userInfo.server_db
        }&username=${userInfo.username_db}&password=${
          userInfo.password_db
        }&db=${userInfo.name_db}&action=getTotalQuotation&userid=${
          userInfo.user_id
        }`;
      }

      const res = await fetch(urls, {
        method: "GET",
      });
      const data = await res.json();
      if (data === null) {
        setTotalQuotation([]);
      } else {
        setTotalQuotation(data);
      }
    } catch (err) {
      console.log(err);
    }
  };
  /* Get count project Data */
  const [totalProject, setTotalProject] = useState([]);
  const getTotalProject = async () => {
    try {
      let urls;
      if (userInfo.level == "admin") {
        urls = `${import.meta.env.VITE_SERVER}/Home.php?server=${
          userInfo.server_db
        }&username=${userInfo.username_db}&password=${
          userInfo.password_db
        }&db=${userInfo.name_db}&action=getTotalProject&userid=${saleSearch}`;
      } else {
        urls = `${import.meta.env.VITE_SERVER}/Home.php?server=${
          userInfo.server_db
        }&username=${userInfo.username_db}&password=${
          userInfo.password_db
        }&db=${userInfo.name_db}&action=getTotalProject&userid=${
          userInfo.user_id
        }`;
      }
      //console.log("urls", urls);
      const res = await fetch(urls, {
        method: "GET",
      });
      // console.log("res", res);
      const data = await res.json();
      // console.log("datatotal", data);
      if (data === null) {
        setTotalProject([]);
      } else {
        setTotalProject(data);
      }
    } catch (err) {
      console.log(err);
    }
  };

  /*-------------------------------------------------------------------------------------------------End DashBoard----------------------------------------------------*/
  // /* Get Sale Data */
  // const [sales, setSales] = useState([]);
  // const getSale = async () => {
  //   try {
  //     const res = await fetch(
  //       `${import.meta.env.VITE_SERVER}/User.php?server=${
  //         userInfo.server_db
  //       }&username=${userInfo.username_db}&password=${
  //         userInfo.password_db
  //       }&db=${userInfo.name_db}&action=getsales`,
  //       {
  //         method: "GET",
  //       }
  //     );
  //     const data = await res.json();
  //     ////console.log(data);
  //     if (data === null) {
  //       setSales([]);
  //     } else {
  //       setSales(data);
  //     }
  //   } catch (error) {
  //     console.log(err);
  //   }
  // };

  /* Get Company Data */
  const [companies, setCompanies] = useState([]);
  const getCompany = async () => {
    try {
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
        ////console.log(data.data);
        if (data.data === null) {
          setCompanies([]);
        } else {
          setCompanies(data.data);
        }
      }
    } catch (err) {
      console.log(err);
    }
  };
  const getCompanyName = (id) => {
    if (companies && companies.length > 0) {
      const company = companies.find((c) => c.co_id === id);
      ////console.log(company);
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
  /* Get Company Data */
  // const getCustomerName = (id) => {
  //   if (customers && customers.length > 0) {
  //     const customer = customers.find((c) => c.cus_id === id);
  //     //console.log(customer.cus_name);
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
      //console.log(customer.cus_name);
      return customer ? customer.cus_tel : "";
    }
    return "";
  };

  /* Get Customer Data */

  /* Get Project Data  HOME PAGE*/
  const [projects, setProjects] = useState([]);
  const getProject = async () => {
    try {
      let user_id;
      if (userInfo.level == "admin" && saleSearch.length > 0) {
        user_id = saleSearch;
      } else {
        user_id = userInfo.user_id;
      }

      if (cus_id) {
        // console.log({ cus_id });
        const res = await fetch(
          `${import.meta.env.VITE_SERVER}/Project.php?server=${
            userInfo.server_db
          }&username=${userInfo.username_db}&password=${
            userInfo.password_db
          }&db=${
            userInfo.name_db
          }&action=getwherecusid&id=${cus_id}&status=${statusSearch}&salesId=${
            user_id
            // userInfo.user_id
          }`,
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
        }
      } else if (com_id) {
        // console.log({ com_id });
        const res = await fetch(
          `${import.meta.env.VITE_SERVER}/Project.php?server=${
            userInfo.server_db
          }&username=${userInfo.username_db}&password=${
            userInfo.password_db
          }&db=${
            userInfo.name_db
          }&action=getwherecoid&id=${com_id}&status=${statusSearch}&salesId=${
            user_id
            // userInfo.user_id
          }`,
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
        }
      } else {
        // console.log("else");
        const res = await fetch(
          `${import.meta.env.VITE_SERVER}/Home.php?server=${
            userInfo.server_db
          }&username=${userInfo.username_db}&password=${
            userInfo.password_db
          }&db=${
            userInfo.name_db
          }&action=get&status=${statusSearch}&sort=DESC&userid=${user_id}`,
          {
            method: "GET",
          }
        );
        const data = await res.json();
        ////console.log(data);
        console.log(data + "||||||||" + user_id + "||||||" + saleSearch.length);
        if (data === null) {
          setProjects([]);
        } else {
          setProjects(data);
        }
      }
    } catch (err) {
      console.log(err);
    }
  };
  const [checkbg, setCheckbg] = useState([]);
  const checkbackgroundColor = async () => {
    try {
      let urls = `${import.meta.env.VITE_SERVER}/Home.php?server=${
        userInfo.server_db
      }&username=${userInfo.username_db}&password=${userInfo.password_db}&db=${
        userInfo.name_db
      }&action=checkbgcolo`;
      // }&action=checkbgcolor&userid=${userInfo.user_id}&pj_id=${pj_id}`;

      // console.log("urls", urls);
      const res = await fetch(urls, {
        method: "GET",
      });

      // console.log("res", res);

      const data = await res.json();

      // console.log("datatotalbg", data);

      if (data === null) {
        setCheckbg([]);
      } else {
        setCheckbg(data);
      }
    } catch (err) {
      console.error(err);
      throw err; // Rethrow the error if needed
    }
  };

  const checkBG = (id) => {
    if (checkbg.length > 0) {
      const check_bg = checkbg.find((c) => c.pj_id === id);
      console.log("id pj", id);

      return check_bg ? check_bg.length : "";
    }
    return "";
  };

  //pagination
  const [currentPageData, setCurrentPageData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1); // เพิ่มตัวแปร currentPage และสร้างฟังก์ชัน setCurrentPage เพื่อใช้ในการเปลี่ยนหน้า

  const itemsPerPage = 30; // กำหนดจำนวนรายการต่อหน้า

  const paginate = (pageNumber) => {
    const startIndex = (pageNumber - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setCurrentPageData(projects.slice(startIndex, endIndex));
    setCurrentPage(pageNumber); // เมื่อเปลี่ยนหน้าใหม่ ให้เปลี่ยน currentPage ให้ตรงกับหน้าใหม่
  };
  // End Pagination

  //get call back add
  const handleSave = (callback) => {
    if (callback) {
      getProject();
    }
  };

  const [statusSearch, setStatusSearch] = useState("all");
  // const [saleSearch, setSaleSearch] = useState("all");
  useEffect(() => {
    if (userInfo) {
      getProject();
      getCustomer();
      getCompany();
      getAppointment();
      checkbackgroundColor();
      getCallRecord();
      getTotalCall();
      getTotalQuotation();
      getTotalProject();
      getSale();
      getCountProjectCall();
      getDateFollowUp();
      // if (userInfo.level == "admin") {
      //   getSale();
      // }
      // console.log({ saleSearch });
    }
  }, [location, userInfo, statusSearch, callRecordSearch, saleSearch]);
  // useEffect(() => {
  //   getCallRecord();
  //   getTotalCall();
  //   getTotalQuotation();
  //   getTotalProject();
  //   getSale();
  //   getCountProjectCall();
  // }, [callRecordSearch, saleSearch]);

  //------------------------------------------ Appointments---------------------------------
  const [appointments, setAppointments] = useState([]);
  //--------------MODAL-----------------------
  const [afterVisitDetail, setAfterVisitDetail] = useState("");
  const [showModalAfterVisit, setShowModalAfterVisit] = useState(false);
  const [validated, setValidated] = useState(false);

  const handleCloseModalAfterVisit = () => setShowModalAfterVisit(false);
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

  //--------MODAL----------------
  const getAppointment = async () => {
    const today = new Date();

    // Add 7 days to today's date
    const sevenDaysLater = new Date(today);
    sevenDaysLater.setDate(today.getDate() + 7);

    const year = sevenDaysLater.getFullYear();
    const month = String(sevenDaysLater.getMonth() + 1).padStart(2, "0"); // Month is zero-indexed, so we add 1
    const day = String(sevenDaysLater.getDate()).padStart(2, "0");

    const formattedDate = `${year}-${month}-${day}`;
    //console.log(formattedDate);
    // const dtStart = `${today}`;
    const dtEnd = `${formattedDate}`;
    try {
      let user_id;
      if (userInfo.level == "admin" && saleSearch.length > 0) {
        user_id = saleSearch;
      } else {
        user_id = userInfo.user_id;
      }
      const res = await fetch(
        `${import.meta.env.VITE_SERVER}/Appointment.php?server=${
          userInfo.server_db
        }&username=${userInfo.username_db}&password=${
          userInfo.password_db
        }&db=${userInfo.name_db}&action=getShowHomepage&user_id=${user_id}`,
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
    } catch (err) {
      console.log(err);
    }
  };
  const [customers, setCustomers] = useState([]);
  const getCustomer = async () => {
    //console.log(id);
    try {
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
    } catch (err) {
      console.log(err);
    }
  };
  const getCustomerCompany = (id) => {
    if (customers && customers.length > 0) {
      const customer = customers.find((c) => c.cus_id === id);
      return customer ? customer.co_id : "";
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
  const [dateFollowUp, setDateFollowUp] = useState([]);
  const getDateFollowUp = async () => {
    //console.log(id);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER}/Home.php?server=${
          userInfo.server_db
        }&username=${userInfo.username_db}&password=${
          userInfo.password_db
        }&db=${userInfo.name_db}&action=getdatefollowup&sort=DESC`,
        {
          method: "GET",
        }
      );
      const data = await res.json();
      //console.log(data);
      if (data === null) {
        setDateFollowUp([]);
      } else {
        setDateFollowUp(data);
      }
    } catch (err) {
      console.log(err);
    }
  };
  const getNextFollow = (id) => {
    if (dateFollowUp && dateFollowUp.length > 0) {
      const dateFollowUpX = dateFollowUp.find((c) => c.pj_id === id);
      return dateFollowUpX ? dateFollowUpX.next_followup : "-";
    }
    return "";
  };
  const showNextFollow = (id) => {
    if (dateFollowUp && dateFollowUp.length > 0) {
      const dateFollowUpX = dateFollowUp.find((c) => c.pj_id === id);
      return dateFollowUpX ? true : false;
    }
    return false;
  };
  //pagination
  const [currentPageData_Appointment, setCurrentPageData_Appointment] =
    useState([]);
  const [currentPage_Appointment, setCurrentPage_Appointment] = useState(1); // เพิ่มตัวแปร currentPage และสร้างฟังก์ชัน setCurrentPage เพื่อใช้ในการเปลี่ยนหน้า

  const itemsPerPage_Appointment = 15; // กำหนดจำนวนรายการต่อหน้า

  const paginate_Appointment = (pageNumber) => {
    const startIndex = (pageNumber - 1) * itemsPerPage_Appointment;
    const endIndex = startIndex + itemsPerPage_Appointment;
    setCurrentPageData_Appointment(appointments.slice(startIndex, endIndex));
    setCurrentPage_Appointment(pageNumber); // เมื่อเปลี่ยนหน้าใหม่ ให้เปลี่ยน currentPage ให้ตรงกับหน้าใหม่
  };
  // End Pagination
  // console.log({ sales });
  useEffect(() => {
    paginate(currentPage);
    paginate_Appointment(currentPage_Appointment);
  }, [projects]);
  function getDate() {
    const today = new Date();
    const month = (today.getMonth() + 1).toString().padStart(2, "0"); // Add leading zero if needed
    const year = today.getFullYear();
    const date = today.getDate().toString().padStart(2, "0"); // Add leading zero if needed
    return `${year}-${month}-${date}`;
  }
  function getdatecheck() {
    const today = new Date();

    // Add 7 days to today's date
    const sevenDaysLater = new Date(today);
    sevenDaysLater.setDate(today.getDate() + 7);

    const year = sevenDaysLater.getFullYear();
    const month = String(sevenDaysLater.getMonth() + 1).padStart(2, "0"); // Month is zero-indexed, so we add 1
    const day = String(sevenDaysLater.getDate()).padStart(2, "0");

    const formattedDate = `${year}-${month}-${day}`;
    //console.log(formattedDate);
    // const dtStart = `${today}`;
    const dtEnd = `${formattedDate}`;
    return dtEnd;
  }
  return (
    <>
      <h1 className="mb-3">Home Page</h1>
      {/* ------------------------------------------------------------------------------DashBoard--------------------------------------------------------*/}
      {/* <Dashboard /> */}
      <div className="d-flex justify-content-end align_items_center gap-1">
        <div className="btn-group justify-content-end gap-3">
          {userInfo?.level === "admin" && (
            <Form.Group as={Col} md="3" className="w-100 mb-3">
              <Form.Select
                value={saleSearch}
                className="fw-bold"
                onChange={(e) => {
                  setSaleSearch(e.target.value);
                }}
                data-bs-toggle="tooltip"
                data-bs-placement="top"
                title="select sales"
              >
                <option value={"all"}>-- All Sale --</option>
                {sales.length > 0 &&
                  sales.map((sale, index) => {
                    return (
                      <option
                        className="fw-2222222222222222222222222222222222222222222222222222222222222222222222222222bold"
                        value={sale.user_id}
                      >
                        {sale.fname} {sale.lname}
                      </option>
                    );
                  })}
              </Form.Select>
            </Form.Group>
          )}
        </div>
      </div>
      <div className="flex flex-1 flex-col md:flex-row lg:flex-row mx-2">
        <Row>
          <Col>
            <div className="shadow-lg bg-primary border-l-8 hover:bg-red-vibrant-dark border-red-vibrant-dark mb-2 p-2 md:w-1/4 mx-2">
              <div className="p-4 flex flex-col">
                <div>
                  <Icon.TelephoneOutboundFill color="#fff" size={40} />
                </div>
                <p href="#" className="no-underline text-white text-lg">
                  <b>Number of calls (จำนวนที่โทร)</b>
                  <div style={{ alignSelf: "flex-start", textAlign: "right" }}>
                    <h1>
                      <b>
                        {totalCall?.length > 0 ? (
                          totalCall.map((item, index) => (
                            <b key={index}>{item.countTotal}</b>
                          ))
                        ) : (
                          <b>0</b>
                        )}
                        <b>
                          / {taget_call}
                          {/* {totalProject?.length > 0 ? (
                            totalProject.map((item, index) => (
                              <b key={index}>{item.countpj}</b>
                            ))
                          ) : (
                            <b>0</b>
                          )} */}
                        </b>
                      </b>
                    </h1>
                  </div>
                </p>
              </div>
            </div>
          </Col>
          <Col>
            <div className="shadow bg-info border-l-8 hover:bg-info-dark border-info-dark mb-2 p-2 md:w-1/4 mx-2">
              <div className="p-4 flex flex-col">
                <div>
                  <Icon.TelephoneInboundFill color="#fff" size={40} />
                </div>
                <p href="#" className="no-underline text-white text-lg">
                  <b>Answer the cal (รับสาย)</b>
                  <div style={{ alignSelf: "flex-start", textAlign: "right" }}>
                    <h1>
                      <b>
                        {callRecord.length > 0 &&
                        callRecord.filter((e) => e.cal_status === "รับสาย")
                          .length > 0 ? (
                          callRecord
                            .filter((e) => e.cal_status === "รับสาย")
                            .map((column, index) => (
                              <b key={index}>{column.cnt_cal}</b>
                            ))
                        ) : (
                          <b>0</b>
                        )}
                      </b>
                    </h1>
                  </div>
                </p>
              </div>
            </div>
          </Col>
          <Col>
            <div className="shadow-lg bg-warning border-l-8 hover:bg-red-vibrant-dark border-red-vibrant-dark mb-2 p-2 md:w-1/4 mx-2">
              <div className="p-4 flex flex-col">
                <div>
                  <Icon.TelephoneFill color="#fff" size={40} />
                </div>
                <p href="#" className="no-underline text-white text-lg">
                  <b>follow up project</b>
                  <div style={{ alignSelf: "flex-start", textAlign: "right" }}>
                    <h1>
                      <b>
                        {countProjectCall?.length > 0 ? (
                          countProjectCall.map((item, index) => (
                            <b key={index}>{item.countpjcall}</b>
                          ))
                        ) : (
                          <b>0</b>
                        )}
                        {/* {callRecord.length > 0 &&
                        callRecord.filter(
                          (e) => e.cal_status === "follow up project"
                        ).length > 0 ? (
                          callRecord
                            .filter((e) => e.cal_status === "follow up project")
                            .map((column, index) => (
                              <b key={index}>{column.cnt_cal}</b>
                            ))
                        ) : (
                          <b>0</b>
                        )} */}
                        <b>
                          /
                          {totalProject?.length > 0 ? (
                            totalProject.map((item, index) => (
                              <b key={index}>{item.countpj}</b>
                            ))
                          ) : (
                            <b>0</b>
                          )}
                          {/* {callRecord.length > 0 &&
                          callRecord.filter(
                            (e) => e.cal_status === "มีโปรเจค/follow-up"
                          ).length > 0 ? (
                            callRecord
                              .filter(
                                (e) => e.cal_status === "มีโปรเจค/follow-up"
                              )
                              .map((column, index) => (
                                <b key={index}>{column.cnt_cal}</b>
                              ))
                          ) : (
                            <b>0</b>
                          )}  */}
                        </b>
                      </b>
                    </h1>
                  </div>
                </p>
              </div>
            </div>
          </Col>
        </Row>
        <Row>
          <Col>
            <div className="shadow-lg bg-success border-l-8 hover:bg-red-vibrant-dark border-red-vibrant-dark mb-2 p-2 md:w-1/4 mx-2">
              <div className="p-4 flex flex-col">
                <div>
                  <Icon.TelephoneFill color="#fff" size={40} />
                </div>
                <p href="#" className="no-underline text-white text-lg">
                  <b>New customer</b>
                  <div style={{ alignSelf: "flex-start", textAlign: "right" }}>
                    <h1>
                      <b>
                        {callRecord.length > 0 &&
                        callRecord.filter(
                          (e) => e.cal_status === "New customer"
                        ).length > 0 ? (
                          callRecord
                            .filter((e) => e.cal_status === "New customer")
                            .map((column, index) => (
                              <b key={index}>{column.cnt_cal}</b>
                            ))
                        ) : (
                          <b>0</b>
                        )}
                      </b>
                    </h1>
                  </div>
                </p>
              </div>
            </div>
          </Col>
          <Col>
            <div className="shadow-lg bg-dark border-l-8 hover:bg-red-vibrant-dark border-red-vibrant-dark mb-2 p-2 md:w-1/4 mx-2">
              <div className="p-4 flex flex-col">
                <div>
                  <Icon.PersonLinesFill color="#fff" size={40} />
                </div>
                <p href="#" className="no-underline text-white text-lg">
                  <b>Quotation Qty</b>
                  <div style={{ alignSelf: "flex-start", textAlign: "right" }}>
                    <h1>
                      <b>
                        {totalQuotation.length > 0 ? (
                          totalQuotation.map((item, index) => (
                            <span key={index}>{item.countQuotation}</span>
                          ))
                        ) : (
                          <b>0</b>
                        )}
                      </b>
                    </h1>
                  </div>
                </p>
              </div>
            </div>
          </Col>
        </Row>
        <Row>
          <Col>
            <div className="shadow bg-danger border-l-8 hover:bg-warning-dark border-warning-dark mb-2 p-2 md:w-1/4 mx-2">
              <div className="p-4 flex flex-col">
                <div>
                  <Icon.TelephoneXFill color="#fff" size={40} />
                </div>
                <p href="#" className="no-underline text-white text-lg">
                  <b>ไม่ว่าง</b>
                  <div style={{ alignSelf: "flex-start", textAlign: "right" }}>
                    <h1>
                      <b>
                        {callRecord.length > 0 &&
                        callRecord.filter((e) => e.cal_status === "ไม่ว่าง")
                          .length > 0 ? (
                          callRecord
                            .filter((e) => e.cal_status === "ไม่ว่าง")
                            .map((column, index) => (
                              <b key={index}>{column.cnt_cal}</b>
                            ))
                        ) : (
                          <b>0</b>
                        )}
                      </b>
                    </h1>
                  </div>
                </p>
              </div>
            </div>
          </Col>
          <Col>
            <div className="shadow-lg bg-warning border-l-8 hover:bg-red-vibrant-dark border-red-vibrant-dark mb-2 p-2 md:w-1/4 mx-2">
              <div className="p-4 flex flex-col">
                <div>
                  <Icon.TelephoneXFill color="#fff" size={40} />
                </div>
                <p href="#" className="no-underline text-white text-lg">
                  <b>ติดต่อไม่ได้</b>
                  <div style={{ alignSelf: "flex-start", textAlign: "right" }}>
                    <h1>
                      <b>
                        {callRecord.length > 0 &&
                        callRecord.filter(
                          (e) => e.cal_status === "ติดต่อไม่ได้"
                        ).length > 0 ? (
                          callRecord
                            .filter((e) => e.cal_status === "ติดต่อไม่ได้")
                            .map((column, index) => (
                              <b key={index}>{column.cnt_cal}</b>
                            ))
                        ) : (
                          <b>0</b>
                        )}
                      </b>
                    </h1>
                  </div>
                </p>
              </div>
            </div>
          </Col>
          <Col>
            <div className="shadow bg-danger border-l-8 hover:bg-warning-dark border-warning-dark mb-2 p-2 md:w-1/4 mx-2">
              <div className="p-4 flex flex-col">
                <div>
                  <Icon.TelephoneXFill color="#fff" size={40} />
                </div>
                <p href="#" className="no-underline text-white text-lg">
                  {/* <b>Not answering the phone (ไม่รับสาย)</b> */}
                  <b>ไม่รับสาย</b>
                  <div style={{ alignSelf: "flex-start", textAlign: "right" }}>
                    <h1>
                      <b>
                        {callRecord.length > 0 &&
                        callRecord.filter((e) => e.cal_status === "ไม่รับสาย")
                          .length > 0 ? (
                          callRecord
                            .filter((e) => e.cal_status === "ไม่รับสาย")
                            .map((column, index) => (
                              <b key={index}>{column.cnt_cal}</b>
                            ))
                        ) : (
                          <b>0</b>
                        )}
                      </b>
                    </h1>
                  </div>
                </p>
              </div>
            </div>
          </Col>
          <Col>
            <div className="shadow-lg bg-secondary border-l-8 hover:bg-red-vibrant-dark border-red-vibrant-dark mb-2 p-2 md:w-1/4 mx-2">
              <div className="p-4 flex flex-col">
                <div>
                  <Icon.TelephoneFill color="#fff" size={40} />
                </div>
                <p href="#" className="no-underline text-white text-lg">
                  <b>ลูกค้าเก่าในระบบ</b>
                  <div style={{ alignSelf: "flex-start", textAlign: "right" }}>
                    <h1>
                      <b>
                        {callRecord.length > 0 &&
                        callRecord.filter(
                          (e) => e.cal_status === "ลูกค้าเก่าในระบบ"
                        ).length > 0 ? (
                          callRecord
                            .filter((e) => e.cal_status === "ลูกค้าเก่าในระบบ")
                            .map((column, index) => (
                              <b key={index}>{column.cnt_cal}</b>
                            ))
                        ) : (
                          <b>0</b>
                        )}
                      </b>
                    </h1>
                  </div>
                </p>
              </div>
            </div>
          </Col>
        </Row>
      </div>
      {/* ------------------------------------------------------------------------------End DashBoard--------------------------------------------------------*/}

      <h2 className="mb-3">Follow Up Today</h2>
      <div className="mx-5">
        {cus_id ? (
          <Card className="py-3 px-5 mb-3">
            <h2>
              <b>{getCompanyName(co_id)}</b>{" "}
              {getCompanyBranch(co_id) ? `(${getCompanyBranch(co_id)})` : <></>}
            </h2>
            <h3 className="ms-5">
              <b>Customer:</b> {cus_name}
            </h3>
            <h3 className="ms-5">
              <b>Tel:</b> {getCustomerTel(cus_id)}
            </h3>
          </Card>
        ) : (
          <></>
        )}
        <div className="d-flex justify-content-end align_items_center gap-1">
          <div className="btn-group justify-content-end gap-3">
            <Form.Group as={Col} md="3" className="w-100 mb-3">
              {/*  <Form.Label>
            <b>Status</b>
            </Form.Label> */}
              <Form.Select
                value={statusSearch}
                className="fw-bold"
                onChange={(e) => {
                  setStatusSearch(e.target.value);
                }}
                data-bs-toggle="tooltip"
                data-bs-placement="top"
                title="select status"
              >
                <option value={"all"}>-- All Status --</option>

                <option className="fw-bold" value={"มีโปรเจค/follow-up"}>
                  มีโปรเจค/follow-up
                </option>
                <option className="fw-bold" value={"ขอBudget"}>
                  ขอBudget
                </option>
                <option className="fw-bold" value={"กำลังเปรียบเทียบราคา"}>
                  กำลังเปรียบเทียบราคา
                </option>
                <option className="fw-bold" value={"รออนุมัติ"}>
                  รออนุมัติ
                </option>
              </Form.Select>
            </Form.Group>
          </div>
          <div className="d-flex flex-column align-items-end">
            {cus_id ? (
              <AddProject cus_id={cus_id} co_id={co_id} onSave={handleSave} />
            ) : com_id ? (
              <AddProject cus_id={cus_id} co_id={com_id} onSave={handleSave} />
            ) : (
              <AddProject onSave={handleSave} />
            )}
          </div>
        </div>

        {/* data table */}
        <Table
          className="mt-1"
          responsive
          striped
          bordered
          hover
          // variant="dark"
        >
          <thead>
            <tr className="text-center">
              <th>#{getDate()}</th>
              <th>Project ID</th>
              <th>Project Name</th>
              <th>Description</th>
              <th>Status</th>
              <th>Customer</th>
              <th>Company</th>
              <th>Budget</th>
              <th>Est PO Date</th>
              <th>Product Type</th>
              <th>Forecast Month</th>
              <th>Next follow Up</th>
              {/* <th>Datetime</th> */}
              <th>Action</th>
            </tr>
          </thead>
          {projects.length == 0 ? (
            <tbody>
              <tr>
                <td colSpan={13} className="fw-bold text-center">
                  No Data
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody>
              {/* {currentPageData.map((project, index) => (
                <tr
                  key={index + 1}
                  className="text-center"
                  style={{
                    backgroundColor:
                      checkbackgroundColor(project.pj_id) != null &&
                      "lightgreen",
                  }}
                > */}
              {currentPageData.map((project, index) => (
                <tr
                  key={index + 1}
                  className="text-center"
                  style={{
                    backgroundColor:
                      project.pj_call == getDate() && "lightgreen",
                  }}
                >
                  <td>
                    {index + 1}
                    {/* {checkBG(project.pj_id)} */}
                  </td>
                  <td>{project.pj_id}</td>
                  <td>{project.pj_name}</td>
                  <td>{project.pj_description}</td>
                  {project.pj_status == "มีโปรเจค/follow-up" ||
                  project.pj_status == "ขอBudget" ||
                  project.pj_status == "กำลังเปรียบเทียบราคา" ||
                  project.pj_status == "รออนุมัติ" ? (
                    <td>
                      <Card bg="warning" text="dark" className="p-1">
                        <b>{project.pj_status}</b>
                      </Card>
                    </td>
                  ) : project.pj_status == "ปิดโปรเจค" ? (
                    <td>
                      <Card
                        text="dark"
                        className="p-1"
                        style={{ backgroundColor: "lime" }}
                      >
                        <b>{project.pj_status}</b>
                      </Card>
                    </td>
                  ) : project.pj_status == "เสียโปรเจค" ? (
                    <td>
                      <Card bg="danger" text="dark" className="p-1">
                        <b>{project.pj_status}</b>
                      </Card>
                    </td>
                  ) : (
                    <td>{project.pj_status}</td>
                  )}
                  <td>{getCustomerName(project.cus_id.split(","))}</td>

                  <td>{getCompanyName(project.co_id)}</td>
                  <td>
                    {isNaN(parseInt(project.budget))
                      ? "-"
                      : parseInt(project.budget).toLocaleString()}
                  </td>
                  {/* budget */}
                  {/* <td>
                    <SortDateTime props={project.pj_dt} />
                  </td> */}
                  <td>{project.est_po_date}</td>
                  <td>{project.product_type}</td>
                  <td>{project.forecast_month}</td>
                  <td>
                    {/* {getNextFollow(project.pj_id) === "-" ||
                    getNextFollow(project.pj_id) !== getDate() ? (
                      getNextFollow(project.pj_id)
                    ) : (
                      <Card bg="warning" text="dark" className="p-1">
                        <b>{getNextFollow(project.pj_id)}</b>
                      </Card>
                    )} */}
                    {project.next_followup == null ? (
                      "-"
                    ) : project.next_followup <= getDate() ? (
                      <Card bg="danger" text="dark" className="p-1">
                        <b>{project.next_followup}</b>
                      </Card>
                    ) : (
                      <Card bg="warning" text="dark" className="p-1">
                        <b>{project.next_followup}</b>
                      </Card>
                    )}
                  </td>
                  <td>
                    <div className="d-flex justify-content-center gap-1">
                      <Button
                        variant="info"
                        onClick={() => {
                          navigate("/QuotationList", {
                            state: { pj_id: project.pj_id },
                          });
                        }}
                        data-bs-toggle="tooltip"
                        data-bs-placement="top"
                        title="quotation list"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          fill="currentColor"
                          className="bi bi-info-lg"
                          viewBox="0 0 16 16"
                        >
                          <path d="m9.708 6.075-3.024.379-.108.502.595.108c.387.093.464.232.38.619l-.975 4.577c-.255 1.183.14 1.74 1.067 1.74.72 0 1.554-.332 1.933-.789l.116-.549c-.263.232-.65.325-.905.325-.363 0-.494-.255-.402-.704l1.323-6.208Zm.091-2.755a1.32 1.32 0 1 1-2.64 0 1.32 1.32 0 0 1 2.64 0Z" />
                        </svg>
                      </Button>
                      <Link
                        to="/QuotationCreate"
                        state={{
                          pj_id: project.pj_id,
                          cus_id: project.cus_id,
                          co_id: project.co_id,
                        }}
                      >
                        <Button
                          variant="success"
                          className="d-flex align-items-center gap-1"
                          data-bs-toggle="tooltip"
                          data-bs-placement="top"
                          title="create quotation"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="24"
                            fill="currentColor"
                            className="bi bi-clipboard-plus-fill"
                            viewBox="0 0 16 16"
                          >
                            <path d="M6.5 0A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3Zm3 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3Z" />
                            <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1A2.5 2.5 0 0 1 9.5 5h-3A2.5 2.5 0 0 1 4 2.5v-1Zm4.5 6V9H10a.5.5 0 0 1 0 1H8.5v1.5a.5.5 0 0 1-1 0V10H6a.5.5 0 0 1 0-1h1.5V7.5a.5.5 0 0 1 1 0Z" />
                          </svg>
                        </Button>
                      </Link>
                      <Link
                        to="/Callrecord"
                        state={{
                          pj_id: project.pj_id,
                          pj_name: project.pj_name,
                          pj_description: project.pj_description,
                          cus_id: project.cus_id,
                          co_id: project.co_id,
                        }}
                      >
                        <Button
                          className="fw-bold"
                          data-bs-toggle="tooltip"
                          data-bs-placement="top"
                          title="call record"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            fill="currentColor"
                            className="bi bi-telephone-fill"
                            viewBox="0 0 16 16"
                          >
                            <path
                              fillRule="evenodd"
                              d="M1.885.511a1.745 1.745 0 0 1 2.61.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.678.678 0 0 0 .178.643l2.457 2.457a.678.678 0 0 0 .644.178l2.189-.547a1.745 1.745 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.634 18.634 0 0 1-7.01-4.42 18.634 18.634 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877L1.885.511z"
                            />
                          </svg>
                        </Button>
                      </Link>

                      <EditProject pj_id={project.pj_id} onSave={handleSave} />
                    </div>
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
          totalItems={projects.length}
          paginate={paginate}
          currentPage={currentPage} // ส่งตัวแปร currentPage ไปให้ Pagination
          setCurrentPage={setCurrentPage}
        />
      </div>
      {/*------------------------------------------------APPOINTMENT
      SHOW--------------------------------------------------------*/}
      <h2 className="mb-3">Appointment show</h2>
      <div className="mx-5">
        <Table
          responsive
          striped
          hover
          bordered
          variant="" /* style={{fontSize: "14px"}} */
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
              {currentPageData_Appointment.map((appointment, index) => (
                <tr
                  key={index + 1}
                  className="text-center"
                  style={{
                    backgroundColor:
                      appointment.app_date > getdatecheck() && "#F4D03F",
                  }}
                >
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
                        {appointment.app_status}
                      </Card>
                    </td>
                  )}

                  <td>{appointment.app_aftervisit_detail}</td>
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
                    value={afterVisitDetail}
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

export default HomePage;
