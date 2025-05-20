import React, { useState, useEffect, useRef, useContext } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  Button,
  Form,
  Row,
  Col,
  Table,
  Card,
  InputGroup,
} from "react-bootstrap";
import Swal from "sweetalert2";

import { UserContext } from "../App";
import QuotationPage from "./QuotationPage";

function QuotationCreate() {
  const userInfo = useContext(UserContext);

  const location = useLocation();
  //const navigate = useNavigate();

  let pj_id = "";
  let cus_id = "";
  let co_id = "";
  let qo_id = "";
  let checkRevise = false;

  if (location.state) {
    pj_id = location.state.pj_id;
    cus_id = location.state.cus_id;
    co_id = location.state.co_id;
    qo_id = location.state.qo_id;
  }
  const [companySearch, setCompanySearch] = useState([]);
  const [customerSearch, setCustomerSearch] = useState([]);
  const [projectSearch, setProjectSearch] = useState([]);

  const handleCopy = (qo) => {
    pj_id = qo.pj_id;
    cus_id = qo.cus_id;
    co_id = qo.co_id;
    qo_id = qo.qo_id;
    checkRevise = true;
  };
  const handleCompanyChange = (e) => {
    setCompanySearch(e.target.value);
    getCustomerSearch(e.target.value);
  };

  const handleCustomerChange = (e) => {
    getProjectSearch(e.target.value);
  };

  const handleProjectChange = (e) => {
    pj_id = e.target.value;
    getQuotation();
  };
  const getCustomerSearch = async (companyId) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER}/Customer.php?server=${
          userInfo.server_db
        }&username=${userInfo.username_db}&password=${
          userInfo.password_db
        }&db=${
          userInfo.name_db
        }&action=getcustomercoid&coid=${companyId}&sort=ASC`,
        {
          method: "GET",
        }
      );
      const data = await res.json();

      if (data === null) {
        setCustomerSearch([]);
      } else {
        setCustomerSearch(data);
      }
    } catch (err) {
      console.log(err);
    }
  };
  const getProjectSearch = async (cusID) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER}/Customer.php?server=${
          userInfo.server_db
        }&username=${userInfo.username_db}&password=${
          userInfo.password_db
        }&db=${userInfo.name_db}&action=getcusid&cusid=${cusID}&sort=ASC`,
        {
          method: "GET",
        }
      );
      const data = await res.json();
      //console.log(data);
      if (data === null) {
        console.log("No Data");
        setProjectSearch([]);
      } else {
        setProjectSearch(data);
      }
    } catch (err) {
      console.log(err);
    }
  };
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
          }&db=${userInfo.name_db}&action=get&sort=DESC`,
          {
            method: "GET",
          }
        );
        const data = await res.json();
        //console.log(data);
        if (data === null) {
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
  /* Get Sale data */
  const [sales, setSale] = useState([]);
  const getSale = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER}/User.php?server=${
          userInfo.server_db
        }&username=${userInfo.username_db}&password=${
          userInfo.password_db
        }&db=${userInfo.name_db}&action=getall&sort=ASC`,
        {
          method: "GET",
        }
      );
      const data = await res.json();
      //console.log(data.data);
      if (data.data === null) {
        setSale([]);
      } else {
        setSale(data);
      }
    } catch (err) {
      console.log(err);
    }
  };
  const getSaleName = (id) => {
    if (sales && sales.length > 0) {
      const salesName = sales.find((c) => c.user_id === id);
      console.log(salesName.fname);
      return salesName ? salesName.fname + " " + salesName.lname : "";
    }
    return "";
  };
  /* Get Sale data */
  const [countQtys, setCountQtys] = useState({});

  const getCountQty = async (id) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER}/Quotation.php?server=${
          userInfo.server_db
        }&username=${userInfo.username_db}&password=${
          userInfo.password_db
        }&db=${userInfo.name_db}&action=getcount&sort=ASC`,
        { method: "GET" }
      );
      const data = await res.json();
      //console.log(data.data);
      if (data.data === null) {
        setSale([]);
      } else {
        setCountQtys(data);
      }
    } catch (err) {
      console.log(err);
    }
  };
  const getCountQtyData = (id) => {
    if (countQtys && countQtys.length > 0) {
      const countQtysX = countQtys.find((c) => c.qo_id === id);
      return countQtysX ? countQtysX.qty : "-";
    }
    return "-";
  };
  const getCountQtyListData = (id) => {
    if (countQtys && countQtys.length > 0) {
      const countQtysX = countQtys.find((c) => c.qo_id === id);
      return countQtysX ? countQtysX.qtylist : "-";
    }
    return "-";
  };
  useEffect(() => {
    if (userInfo) {
      getQuotation();
      getProject();
      getCustomer();
      getCompany();
      getSale();
      getCountQty();
    }
  }, [userInfo]);

  return (
    <>
      <div className="m-5">
        <h1 className="mb-3">Quotation</h1>
        <Card body>
          <div className="d-flex justify-content-end align-items-center gap-1">
            <div className="btn-group justify-content-end gap-3">
              <Form.Group as={Col} md="3" className="w-100 mb-3">
                <Form.Select
                  className="fw-bold"
                  onChange={handleCompanyChange}
                  data-bs-toggle="tooltip"
                  data-bs-placement="top"
                  title="select company"
                >
                  <option value="all Company">-- Select Company --</option>
                  {companies.length > 0 &&
                    companies.map((company, index) => {
                      return (
                        <option className="fw-bold" value={company.co_id}>
                          {company.co_name}
                        </option>
                      );
                    })}
                </Form.Select>
              </Form.Group>
            </div>
            <div className="btn-group justify-content-end gap-3">
              <Form.Group as={Col} md="3" className="w-100 mb-3">
                <Form.Select
                  className="fw-bold"
                  onChange={handleCustomerChange}
                  data-bs-toggle="tooltip"
                  data-bs-placement="top"
                  title="select customer"
                >
                  <option value="all Company">-- Select Customer --</option>
                  {/* Populate this with actual customer data */}
                  {customerSearch.length > 0 &&
                    customerSearch.map((cus, index) => {
                      return (
                        <option className="fw-bold" value={cus.cus_id}>
                          {cus.cus_name}
                        </option>
                      );
                    })}
                </Form.Select>
              </Form.Group>
            </div>
            <div className="btn-group justify-content-end gap-3">
              <Form.Group as={Col} md="3" className="w-100 mb-3">
                <Form.Select
                  className="fw-bold"
                  onChange={handleProjectChange}
                  data-bs-toggle="tooltip"
                  data-bs-placement="top"
                  title="select project"
                >
                  <option value="all Company">-- Select Project --</option>
                  {projectSearch.length > 0 &&
                    projectSearch.map((pj, index) => {
                      return (
                        <option className="fw-bold" value={pj.pj_id}>
                          {pj.pj_name}
                        </option>
                      );
                    })}
                </Form.Select>
              </Form.Group>
            </div>
          </div>
          <Table
            className="mt-1"
            responsive
            striped
            bordered
            hover
            variant="dark"
          >
            <thead>
              <tr className="text-center">
                <th>#</th>
                <th>Qotation ID</th>
                <th>Project Name</th>
                <th>Description</th>
                <th>Sale Name</th>
                <th>Discount</th>
                <th>Date</th>
                <th>Company</th>
                <th>Customer</th>
                <th>Qty list</th>
                <th>Qty</th>
                <th>Create by</th>
                <th>Action</th>
              </tr>
            </thead>
            {quotations.length == 0 ? (
              <tbody>
                <tr>
                  <td colSpan={13} className="fw-bold text-center">
                    No Data
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody>
                {quotations.map((qo, index) => (
                  <tr key={index} className="text-center">
                    <td>{index + 1}</td>
                    <td>{qo.qo_id}</td>
                    <td>{getProjectName(qo.pj_id)}</td>
                    <td>{qo.qo_comment}</td>
                    <td>{getSaleName(qo.qo_saler)}</td>
                    <td>
                      {qo.qo_discount === ""
                        ? 0 + " " + qo.qo_currency
                        : qo.qo_discount + " " + qo.qo_currency}
                    </td>
                    <td>{qo.qo_issue_date}</td>
                    <td>{getCompanyName(qo.co_id)}</td>
                    <td>{getCustomerName(qo.cus_id)}</td>
                    <td>{getCountQtyListData(qo.qo_id)}</td>
                    <td>{getCountQtyData(qo.qo_id)}</td>
                    <td>{getSaleName(qo.qo_saler)}</td>
                    <td>
                      <Link
                        to="/QuotationCopy"
                        state={{
                          qo_id: `${qo.qo_id}`,
                          qo_totalprice: `${qo.qo_totalprice}`,
                        }}
                      >
                        <Button
                          title="copy"
                          variant="success"
                          // onClick={}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            fill="currentColor"
                            class="bi bi-copy"
                            viewBox="0 0 16 16"
                          >
                            <path
                              fill-rule="evenodd"
                              d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1z"
                            />
                          </svg>
                        </Button>
                      </Link>
                      <Link
                        to="/QuotationRevise"
                        state={{
                          pj_id: `${qo.pj_id}`,
                          cus_id: `${qo.cus_id}`,
                          co_id: `${qo.co_id}`,
                          qo_id: `${qo.qo_id}`,
                          qo_totalprice: `${qo.qo_totalprice}`,
                        }}
                      >
                        <Button title="Revise Quotation" variant="warning">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            fill="Revise"
                            variant="info"
                            class="bi bi-reply-all"
                            viewBox="0 0 16 16"
                          >
                            <path d="M8.098 5.013a.144.144 0 0 1 .202.134V6.3a.5.5 0 0 0 .5.5c.667 0 2.013.005 3.3.822.984.624 1.99 1.76 2.595 3.876-1.02-.983-2.185-1.516-3.205-1.799a8.7 8.7 0 0 0-1.921-.306 7 7 0 0 0-.798.008h-.013l-.005.001h-.001L8.8 9.9l-.05-.498a.5.5 0 0 0-.45.498v1.153c0 .108-.11.176-.202.134L4.114 8.254l-.042-.028a.147.147 0 0 1 0-.252l.042-.028zM9.3 10.386q.102 0 .223.006c.434.02 1.034.086 1.7.271 1.326.368 2.896 1.202 3.94 3.08a.5.5 0 0 0 .933-.305c-.464-3.71-1.886-5.662-3.46-6.66-1.245-.79-2.527-.942-3.336-.971v-.66a1.144 1.144 0 0 0-1.767-.96l-3.994 2.94a1.147 1.147 0 0 0 0 1.946l3.994 2.94a1.144 1.144 0 0 0 1.767-.96z" />
                            <path d="M5.232 4.293a.5.5 0 0 0-.7-.106L.54 7.127a1.147 1.147 0 0 0 0 1.946l3.994 2.94a.5.5 0 1 0 .593-.805L1.114 8.254l-.042-.028a.147.147 0 0 1 0-.252l.042-.028 4.012-2.954a.5.5 0 0 0 .106-.699" />
                          </svg>
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            )}
            ;
          </Table>
        </Card>
      </div>
      <hr className="mx-5 my-5"></hr>

      <QuotationPage
        pj_id={pj_id}
        cus_id={cus_id}
        co_id={co_id}
        qo_id={qo_id}
        checkRevise={checkRevise}
      />
    </>
  );
}

export default QuotationCreate;
