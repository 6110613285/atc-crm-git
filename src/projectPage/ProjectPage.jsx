import React, { useState, useEffect, useRef, useContext } from "react";
import { Card, Button, Table, Form, Col } from "react-bootstrap";
import { useLocation, Link, useNavigate } from "react-router-dom";

import { UserContext } from "../App";

import AddProject from "./AddProject";
import EditProject from "./EditProject";
import SortDateTime from "../components/SortDateTime";

import PaginationComponent from "../components/PaginationComponent";

function ProjectPage({ com_id }) {
  const userInfo = useContext(UserContext);

  let location = useLocation();
  let navigate = useNavigate();

  let cus_id = "";
  let cus_name = "";
  let co_id = "";

  if (location.state) {
    cus_id = location.state.cus_id;
    cus_name = location.state.cus_name;
    co_id = location.state.co_id;
  }

  /* Get Sale Data */
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
      console.log(data);
      if (data === null) {
        setSales([]);
      } else {
        setSales(data);
      }
    } catch (error) {
      console.log(err);
    }
  };

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
    return "Nippon Paint";
  };
  const getCompanyBranch = (id) => {
    if (companies && companies.length > 0) {
      const company = companies.find((c) => c.co_id === id);
      return company ? company.co_branch : "";
    }
    return "";
  };
  /* Get Company Data */

  /* Get Customer Data */
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
        setCustomers([]);
      } else {
        setCustomers(data);
      }
    } catch (err) {
      console.log(err);
    }
  };

  //-----------------------------------------Customer2--------------------------
  const [showCustomers2, setShowCustomers2] = useState([]);
  const getShowCustomer2 = async (id) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER}/Customer.php?server=${
          userInfo.server_db
        }&username=${userInfo.username_db}&password=${
          userInfo.password_db
        }&db=${userInfo.name_db}&action=getcustomer2&projectId=${id}&sort=ASC`,
        {
          method: "GET",
        }
      );
      const data = await res.json();
      //console.log(data);
      if (data === null) {
        setShowCustomers2([]);
      } else {
        setShowCustomers2(data);
      }
    } catch (err) {
      console.log(err);
    }
  };
  const getCustomerName2 = (id) => {
    // ต้องลองเขียน sql ใหม่ เพื่อดึง cusName
    // getShowCustomer2(id);
    // if (showCustomers2 && showCustomers2.length > 0) {
    //   for (let i = 0; i < showCustomers2.length; i++) {
    //     const customer = showCustomers2.find(
    //       (c) => c.cus_id === showCustomers2[i].cus_id
    //     );
    //     console.log("แสดงชื่อ คนที่" + i + " : " + customer.cus_name);
    //     return customer ? "," + customer.cus_name : "";
    //   }
    // }
    // return "";
  };
  //-----------------------------------------Customer2-----------------------------
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
    } else {
      const customer = customers.find((c) => c.cus_id === ids);
      return customer ? customer.cus_name : "";
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

  /* Get Project Data */
  const [projects, setProjects] = useState([]);
  const getProject = async () => {
    try {
      if (cus_id) {
        if (userInfo.position == "Newsale") {
          const res = await fetch(
            `${import.meta.env.VITE_SERVER}/Project.php?server=${
              userInfo.server_db
            }&username=${userInfo.username_db}&password=${
              userInfo.password_db
            }&db=${
              userInfo.name_db
            }&action=getwherecusid&id=${cus_id}&status=${statusSearch}&salesId=${saleSearch}`,
            {
              method: "GET",
            }
          );
        } else {
          const res = await fetch(
            `${import.meta.env.VITE_SERVER}/Project.php?server=${
              userInfo.server_db
            }&username=${userInfo.username_db}&password=${
              userInfo.password_db
            }&db=${
              userInfo.name_db
            }&action=getwherecusid&id=${cus_id}&status=${statusSearch}&salesId=${saleSearch}`,
            {
              method: "GET",
            }
          );
        }

        const data = await res.json();
        ////console.log(data);
        if (data === null) {
          setProjects([]);
        } else {
          setProjects(data);
        }
      } else if (com_id) {
        console.log({ com_id });
        const res = await fetch(
          `${import.meta.env.VITE_SERVER}/Project.php?server=${
            userInfo.server_db
          }&username=${userInfo.username_db}&password=${
            userInfo.password_db
          }&db=${
            userInfo.name_db
          }&action=getwherecoid&id=${com_id}&status=${statusSearch}&salesId=${saleSearch}`,
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
        if (userInfo.position == "Newsale") {
          const res = await fetch(
            `${import.meta.env.VITE_SERVER}/Project.php?server=${
              userInfo.server_db
            }&username=${userInfo.username_db}&password=${
              userInfo.password_db
            }&db=${
              userInfo.name_db
            }&action=getnewsale&status=${statusSearch}&sort=DESC&userId=${
              userInfo.user_id
            }`,
            {
              method: "GET",
            }
          );
          const data = await res.json();
          console.log(" GET PROJECT => " + data);
          if (data === null) {
            setProjects([]);
          } else {
            setProjects(data);
          }
        } else {
          const res = await fetch(
            `${import.meta.env.VITE_SERVER}/Project.php?server=${
              userInfo.server_db
            }&username=${userInfo.username_db}&password=${
              userInfo.password_db
            }&db=${
              userInfo.name_db
            }&action=get&status=${statusSearch}&sort=DESC&salesId=${saleSearch}`,
            {
              method: "GET",
            }
          );
          const data = await res.json();
          console.log(" GET PROJECT => " + data);
          if (data === null) {
            setProjects([]);
          } else {
            setProjects(data);
          }
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  console.log({ projects });

  /* Get Project Data */

  //pagination
  const [currentPageData, setCurrentPageData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1); // เพิ่มตัวแปร currentPage และสร้างฟังก์ชัน setCurrentPage เพื่อใช้ในการเปลี่ยนหน้า

  const itemsPerPage = 200; // กำหนดจำนวนรายการต่อหน้า

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
  const [saleSearch, setSaleSearch] = useState("all");
  useEffect(() => {
    if (userInfo) {
      getProject();
      getCustomer();
      getCompany();
      getSale();
      // console.log({ saleSearch });
    }
  }, [location, userInfo, statusSearch, saleSearch]);

  useEffect(() => {
    paginate(currentPage);
  }, [projects]);
  // console.log({ sales });

  return (
    <>
      <div className="mx-5">
        <h1 className="mb-3">Project Page</h1>
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
            {userInfo?.position === "Newsale" ? (
              <></>
            ) : (
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
                        <option className="fw-bold" value={sale.user_id}>
                          {sale.fname} {sale.lname}
                        </option>
                      );
                    })}
                </Form.Select>
              </Form.Group>
            )}
            <Form.Group as={Col} md="3" className="w-100 mb-3">
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
                <option className="fw-bold" value={"สนใจ"}>
                  สนใจ
                </option>
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
                <option className="fw-bold" value={"ปิดโปรเจค"}>
                  ปิดโปรเจค
                </option>
                <option className="fw-bold" value={"เสียโปรเจค"}>
                  เสียโปรเจค
                </option>
                <option className="fw-bold" value={"PO Received"}>
                  PO Received
                </option>
                <option className="fw-bold" value={"Delivered"}>
                  Delivered
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
          variant="dark"
        >
          <thead>
            <tr className="text-center">
              <th>#</th>
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
              {/* <th>Datetime</th> */}
              <th>Action</th>
            </tr>
          </thead>
          {projects.length == 0 ? (
            <tbody>
              <tr>
                <td colSpan={12} className="fw-bold text-center">
                  No Data
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody>
              {currentPageData.map((project, index) => (
                <tr key={index + 1} className="text-center">
                  <td>{index + 1}</td>
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
                  <td>{getCustomerName(project.cus_id)}</td>

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
                          cus_id: project.cus_id[0],
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
    </>
  );
}

export default ProjectPage;
