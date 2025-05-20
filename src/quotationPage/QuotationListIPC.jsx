import React, { useEffect, useState, useContext } from "react";
import { useLocation, Link } from "react-router-dom";
import { Table, Button, Card } from "react-bootstrap";

import { UserContext } from "../App";

import PaginationComponent from "../components/PaginationComponent";

function QuotationList() {
  const userInfo = useContext(UserContext);

  let location = useLocation();

  let pj_id;
  if (location.state) {
    pj_id = location.state.pj_id;
  }

  /* Get Qo Data */
  const [quotations, setQuotation] = useState([]);
  const getQuotation = async () => {
    try {
      if (pj_id) {
        const res = await fetch(
          `${import.meta.env.VITE_SERVER}/Quotation.php?server=${
            userInfo.server_db
          }&username=${userInfo.username_db}&password=${
            userInfo.password_db
          }&db=${userInfo.name_db}&action=getwherepjid&id=${pj_id}&sort=DESC`,
          {
            method: "GET",
          }
        );
        const data = await res.json();
        //console.log(data);
        if (data === null) {
          console.log("No Data A");
          setQuotation([]);
        } else {
          setQuotation(data);
        }
      } else {
        const res = await fetch(
          `${import.meta.env.VITE_SERVER}/Quotation.php?server=${
            userInfo.server_db
          }&username=${userInfo.username_db}&password=${
            userInfo.password_db
          }&db=${userInfo.name_db}&action=getipc&sort=DESC`,
          {
            method: "GET",
          }
        );
        const data = await res.json();
        //console.log(data);
        if (data === null) {
          console.log("No Data B");
          setQuotation([]);
        } else {
          setQuotation(data);
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  /* End Get Qo Data */
  /* Get project data */
  const [projects, setProjects] = useState([]);
  const getProject = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER}/Project.php?server=${
          userInfo.server_db
        }&username=${userInfo.username_db}&password=${
          userInfo.password_db
        }&db=${userInfo.name_db}&action=get&sort=ASC&status=all&salesId=all`,
        {
          method: "GET",
        }
      );
      const data = await res.json();
      console.log(data);
      if (data === null) {
        console.log("No Data PJ");
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
      const project = projects.find((c) => c.pj_id === id);
      console.log("id pj", id);

      return project ? project.pj_name : "";
    }
    return "";
  };
  const getProjectCompany = (id) => {
    if (projects && projects.length > 0) {
      const project = projects.find((c) => c.pj_id === id);
      //console.log(customer.cus_name);
      return project ? project.co_id : "";
    }
    return "";
  };
  const getProjectCustomer = (id) => {
    if (projects && projects.length > 0) {
      const project = projects.find((c) => c.pj_id === id);
      ////console.log(project.cus_id);
      return project ? project.cus_id : "";
    }
    return "";
  };
  /* Get project data */
  /* Get customer data */
  const [customers, setCustomers] = useState([]);
  const getCustomer = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER}/Customer.php?server=${
          userInfo.server_db
        }&username=${userInfo.username_db}&password=${
          userInfo.password_db
        }&db=${userInfo.name_db}&action=get&sort=ASC`,
        {
          method: "GET",
        }
      );
      const data = await res.json();
      //console.log(data);
      if (data === null) {
        console.log("No Data");
        setCustomers([]);
      } else {
        setCustomers(data);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const getCustomerName = (id) => {
    if (customers && customers.length > 0) {
      const customer = customers.find((c) => c.cus_id === id);
      //console.log(customer.cus_name);
      return customer ? customer.cus_name : "";
    }
    return "";
  };
  /* Get customer data */
  /* Get company data */
  const [companies, setCompanies] = useState([]);
  const getCompany = async () => {
    try {
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
        console.log("No Data");
        setCompanies([]);
      } else {
        setCompanies(data.data);
      }
    } catch (err) {
      console.log(err);
    }
  };
  const getCompanyName = (id) => {
    if (companies && companies.length > 0) {
      const company = companies.find((c) => c.co_id === id);
      //console.log(company.cus_name);
      return company ? company.co_name : "";
    }
    return "";
  };
  /* Get company data */

  const handleApprove = async (qo_id) => {
    if (window.confirm("Do you to approve this Quotation ?")) {
    }
  };

  const handleDelete = async (qo_id) => {
    if (window.confirm("Are you sure for delete this Quotaton ?")) {
      ////console.log(qo_id);
      try {
        const res = await fetch(
          `${import.meta.env.VITE_SERVER}/Quotation.php?server=${
            userInfo.server_db
          }&username=${userInfo.username_db}&password=${
            userInfo.password_db
          }&db=${userInfo.name_db}&action=delete&id=${qo_id}`,
          {
            method: "GET",
          }
        );

        const data = await res.json();
        ////console.log(data);
        if (data === "ok") {
          alert("Delete Success!!");
          window.location.reload();
        } else {
          console.log(data);
        }
      } catch (err) {
        console.log(err);
      }
    }
  };

  //pagination
  const [currentPageData, setCurrentPageData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1); // เพิ่มตัวแปร currentPage และสร้างฟังก์ชัน setCurrentPage เพื่อใช้ในการเปลี่ยนหน้า

  const itemsPerPage = 10; // กำหนดจำนวนรายการต่อหน้า

  const paginate = (pageNumber) => {
    const startIndex = (pageNumber - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setCurrentPageData(quotations.slice(startIndex, endIndex));
    setCurrentPage(pageNumber); // เมื่อเปลี่ยนหน้าใหม่ ให้เปลี่ยน currentPage ให้ตรงกับหน้าใหม่
  };
  // End Pagination

  useEffect(() => {
    if (userInfo) {
      getQuotation();
      getProject();
      getCustomer();
      getCompany();
    }
  }, [userInfo]);

  useEffect(() => {
    paginate(currentPage);
  }, [quotations]);

  return (
    <>
      <div className="mx-5">
        <h1>QuotationList For IPC</h1>
        {pj_id ? (
          <Link
            to="/Quotation"
            state={{
              pj_id: pj_id,
              cus_id: getProjectCustomer(pj_id),
              co_id: getProjectCompany(pj_id),
            }}
          >
            <div className="d-flex justify-content-end">
              <Button
                variant="success"
                className="mt-3 mb-1 px-5"
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
            </div>
          </Link>
        ) : (
          <div className="d-flex justify-content-end ">
            {/* <Link to="/Quotation">
              <Button
                variant="success"
                className="mt-3 mb-1 px-5"
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
            </Link> */}

            <Link to="/Quotation2">
              <Button
                variant="info"
                className="mt-3 mb-1 px-5 m-3"
                data-bs-toggle="tooltip"
                data-bs-placement="top"
                title="create quotation for IPC"
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
          </div>
        )}

        {/* data table */}
        <Table responsive striped bordered hover variant="dark">
          <thead>
            <tr className="text-center">
              <th>#</th>
              <th>Quotation ID</th>
              <th>Project </th>
              <th>Customer</th>
              <th>Company</th>
              <th>Datetime</th>
              <th>Status</th>
              <th>comment</th>
              <th>Action</th>
            </tr>
          </thead>
          {quotations.length == 0 ? (
            <tbody>
              <tr>
                <td colSpan={12} className="fw-bold text-center">
                  No Data
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody>
              {currentPageData.map((qo, index) => (
                <tr key={index + 1} className="text-center">
                  <td>{index + 1}</td>
                  <td>{qo.qo_id}</td>
                  <td>{getProjectName(qo.pj_id)}</td>
                  <td>{getCustomerName(qo.cus_id)}</td>
                  <td>{getCompanyName(qo.co_id)}</td>
                  <td>{qo.qo_dt}</td>
                  {qo.qo_status_approve == "approve" ? (
                    <td>
                      <Card
                        className="p-1 text-dark fw-bold text-uppercase"
                        style={{ backgroundColor: "lime" }}
                      >
                        {qo.qo_status_approve}
                      </Card>
                    </td>
                  ) : qo.qo_status_approve == "reject" ? (
                    <td>
                      <Card className="p-1 text-dark fw-bold bg-warning text-uppercase">
                        {qo.qo_status_approve}
                      </Card>
                    </td>
                  ) : qo.qo_status_approve == "cancel" ? (
                    <td>
                      <Card className="p-1 text-dark fw-bold bg-danger text-uppercase">
                        {qo.qo_status_approve}
                      </Card>
                    </td>
                  ) : (
                    <td>{qo.qo_status_approve}</td>
                  )}
                  <td>{qo.qo_comment}</td>

                  <td>
                    <div className="d-flex justify-content-center gap-1">
                      {/* <Link to="/QuotationView" target="_blank">
                        <Button
                          onClick={() => {
                            localStorage.setItem("qo_id", qo.qo_id);
                            localStorage.setItem("pj_id", qo.pj_id);
                            localStorage.setItem("cus_id", qo.cus_id);
                            localStorage.setItem("co_id", qo.co_id);

                            // state={{
                            //   pj_id: project.pj_id,
                            //   cus_id: project.cus_id,
                            //   co_id: project.co_id,
                            // }}
                          }}
                          data-bs-toggle="tooltip"
                          data-bs-placement="top"
                          title="view quotation"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            fill="currentColor"
                            class="bi bi-clipboard-fill"
                            viewBox="0 0 16 16"
                          >
                            <path
                              fill-rule="evenodd"
                              d="M10 1.5a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5zm-5 0A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5v1A1.5 1.5 0 0 1 9.5 4h-3A1.5 1.5 0 0 1 5 2.5zm-2 0h1v1A2.5 2.5 0 0 0 6.5 5h3A2.5 2.5 0 0 0 12 2.5v-1h1a2 2 0 0 1 2 2V14a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V3.5a2 2 0 0 1 2-2"
                            />
                          </svg>
                        </Button>
                      </Link> */}
                      <Link to="/QuotationPdfIPC" target="_blank">
                        <Button
                          onClick={() => {
                            localStorage.setItem("qo_id", qo.qo_id);
                          }}
                          data-bs-toggle="tooltip"
                          data-bs-placement="top"
                          title="pdf quotation ipc"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            fill="currentColor"
                            className="bi bi-file-earmark-pdf-fill"
                            viewBox="0 0 16 16"
                          >
                            <path d="M5.523 12.424c.14-.082.293-.162.459-.238a7.878 7.878 0 0 1-.45.606c-.28.337-.498.516-.635.572a.266.266 0 0 1-.035.012.282.282 0 0 1-.026-.044c-.056-.11-.054-.216.04-.36.106-.165.319-.354.647-.548zm2.455-1.647c-.119.025-.237.05-.356.078a21.148 21.148 0 0 0 .5-1.05 12.045 12.045 0 0 0 .51.858c-.217.032-.436.07-.654.114zm2.525.939a3.881 3.881 0 0 1-.435-.41c.228.005.434.022.612.054.317.057.466.147.518.209a.095.095 0 0 1 .026.064.436.436 0 0 1-.06.2.307.307 0 0 1-.094.124.107.107 0 0 1-.069.015c-.09-.003-.258-.066-.498-.256zM8.278 6.97c-.04.244-.108.524-.2.829a4.86 4.86 0 0 1-.089-.346c-.076-.353-.087-.63-.046-.822.038-.177.11-.248.196-.283a.517.517 0 0 1 .145-.04c.013.03.028.092.032.198.005.122-.007.277-.038.465z" />
                            <path
                              fillRule="evenodd"
                              d="M4 0h5.293A1 1 0 0 1 10 .293L13.707 4a1 1 0 0 1 .293.707V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2zm5.5 1.5v2a1 1 0 0 0 1 1h2l-3-3zM4.165 13.668c.09.18.23.343.438.419.207.075.412.04.58-.03.318-.13.635-.436.926-.786.333-.401.683-.927 1.021-1.51a11.651 11.651 0 0 1 1.997-.406c.3.383.61.713.91.95.28.22.603.403.934.417a.856.856 0 0 0 .51-.138c.155-.101.27-.247.354-.416.09-.181.145-.37.138-.563a.844.844 0 0 0-.2-.518c-.226-.27-.596-.4-.96-.465a5.76 5.76 0 0 0-1.335-.05 10.954 10.954 0 0 1-.98-1.686c.25-.66.437-1.284.52-1.794.036-.218.055-.426.048-.614a1.238 1.238 0 0 0-.127-.538.7.7 0 0 0-.477-.365c-.202-.043-.41 0-.601.077-.377.15-.576.47-.651.823-.073.34-.04.736.046 1.136.088.406.238.848.43 1.295a19.697 19.697 0 0 1-1.062 2.227 7.662 7.662 0 0 0-1.482.645c-.37.22-.699.48-.897.787-.21.326-.275.714-.08 1.103z"
                            />
                          </svg>
                        </Button>
                      </Link>

                      {/* <Button
                        variant="danger"
                        onClick={() => {
                          handleDelete(qo.qo_id);
                        }}
                        data-bs-toggle="tooltip"
                        data-bs-placement="top"
                        title="delete quotation"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="25"
                          height="25"
                          fill="currentColor"
                          className="bi bi-trash-fill"
                          viewBox="0 0 16 16"
                        >
                          <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z" />
                        </svg>
                      </Button> */}

                      {userInfo.level === "admin" &&
                      qo.qo_status_approve == "wait" ? (
                        <Link
                          to="/QuotationApproveIPC"
                          state={{ qo_id: `${qo.qo_id}` }}
                        >
                          <Button
                            variant="success"
                            onClick={() => {
                              // handleApprove(qo.qo_id);
                            }}
                            data-bs-toggle="tooltip"
                            data-bs-placement="top"
                            title="approve quotation for IPC"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="18"
                              height="18"
                              fill="currentColor"
                              className="bi bi-shield-fill-check"
                              viewBox="0 0 16 16"
                            >
                              <path
                                fillRule="evenodd"
                                d="M8 0c-.69 0-1.843.265-2.928.56-1.11.3-2.229.655-2.887.87a1.54 1.54 0 0 0-1.044 1.262c-.596 4.477.787 7.795 2.465 9.99a11.777 11.777 0 0 0 2.517 2.453c.386.273.744.482 1.048.625.28.132.581.24.829.24s.548-.108.829-.24a7.159 7.159 0 0 0 1.048-.625 11.775 11.775 0 0 0 2.517-2.453c1.678-2.195 3.061-5.513 2.465-9.99a1.541 1.541 0 0 0-1.044-1.263 62.467 62.467 0 0 0-2.887-.87C9.843.266 8.69 0 8 0zm2.146 5.146a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 7.793l2.646-2.647z"
                              />
                            </svg>
                          </Button>
                        </Link>
                      ) : qo.qo_status_approve == "reject" ? (
                        <Link
                          to="/QuotationRevise"
                          state={{
                            qo_id: `${qo.qo_id}`,
                            co_id: `${qo.co_id}`,
                            cus_id: `${qo.cus_id}`,
                            pj_id: `${qo.pj_id}`,
                          }}
                        >
                          <Button
                            variant="warning"
                            data-bs-toggle="tooltip"
                            data-bs-placement="top"
                            title="revise quotation"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="18"
                              height="18"
                              fill="currentColor"
                              className="bi bi-pencil-fill"
                              viewBox="0 0 16 16"
                            >
                              <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11l.178-.178z" />
                            </svg>
                          </Button>
                        </Link>
                      ) : (
                        <></>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          )}
        </Table>
        {/* end data table */}
        {/* Pagination */}
        <PaginationComponent
          itemsPerPage={itemsPerPage}
          totalItems={quotations.length}
          paginate={paginate}
          currentPage={currentPage} // ส่งตัวแปร currentPage ไปให้ Pagination
          setCurrentPage={setCurrentPage}
        />
      </div>
    </>
  );
}

export default QuotationList;
