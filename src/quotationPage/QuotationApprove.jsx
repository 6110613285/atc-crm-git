import React, { useEffect, useState, useContext } from "react";
import { Card, Container, Table, Image, Button } from "react-bootstrap";
import logo from "../assets/fullLogo.png";
import { useLocation } from "react-router-dom";

import { UserContext } from "../App";
import QuotationUpdateStatus from "./QuotationUpdateStatus";

function QuotationApprove() {
  const location = useLocation();
  //console.log(location.state.qo_id);
  const qo_id = location.state.qo_id;

  const userInfo = useContext(UserContext);

  /* Get Qo data */
  const [quotations, setQuotation] = useState([]);
  const getQuotation = async () => {
    const res = await fetch(
      `${import.meta.env.VITE_SERVER}/Quotation.php?server=${
        userInfo.server_db
      }&username=${userInfo.username_db}&password=${userInfo.password_db}&db=${
        userInfo.name_db
      }&action=getwhereqoid&id=${qo_id}`,
      {
        method: "GET",
      }
    );
    const data = await res.json();
    ////console.log(data);
    if (data === null) {
      setQuotation([]);
    } else {
      setQuotation(data);

      getCustomer(data[0].cus_id);
      getCompany(data[0].co_id);
      getUser();
      getProject(data[0].pj_id);
      getItem(qo_id);
    }
  };
  /* End Get Qo data */
  /* Get QO Item data */
  const [items, setItem] = useState([]);
  const getItem = async (id) => {
    const res = await fetch(
      `${import.meta.env.VITE_SERVER}/Quotation.php?server=${
        userInfo.server_db
      }&username=${userInfo.username_db}&password=${userInfo.password_db}&db=${
        userInfo.name_db
      }&action=getitemwhereqoid&id=${id}`,
      {
        method: "GET",
      }
    );
    const data = await res.json();
    //console.log(data);
    if (data === null) {
      getProduct([]);
    } else {
      setItem(data);

      getProduct();
    }
  };
  /* End Get QO Item data */
  /* Get customer data */
  const [customers, setCustomers] = useState([]);
  const getCustomer = async (id) => {
    const res = await fetch(
      `${import.meta.env.VITE_SERVER}/Customer.php?server=${
        userInfo.server_db
      }&username=${userInfo.username_db}&password=${userInfo.password_db}&db=${
        userInfo.name_db
      }&action=getwherecusid&id=${id}`,
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
  };
  /* Get customer data */
  /* Get company data */
  const [companies, setCompanies] = useState([]);
  const getCompany = async (id) => {
    const res = await fetch(
      `${import.meta.env.VITE_SERVER}/Company.php?server=${
        userInfo.server_db
      }&username=${userInfo.username_db}&password=${userInfo.password_db}&db=${
        userInfo.name_db
      }&action=getwherecoid&id=${id}`,
      {
        method: "GET",
      }
    );
    const data = await res.json();
    //console.log(data);
    if (data === null) {
      setCompanies([]);
    } else {
      setCompanies(data);
    }
  };
  /* Get company data */
  /* Get project data */
  const [projects, setProjects] = useState([]);
  const getProject = async (id) => {
    const res = await fetch(
      `${import.meta.env.VITE_SERVER}/Project.php?server=${
        userInfo.server_db
      }&username=${userInfo.username_db}&password=${userInfo.password_db}&db=${
        userInfo.name_db
      }&action=getwherepjid&id=${id}`,
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
  };
  /* Get project data */
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
      const user = users.find((c) => c.user_id === id);
      //console.log(users);
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
  const getUserTel = (id) => {
    if (users && users.length > 0) {
      const user = users.find((c) => c.user_id === id);
      //console.log(customer.cus_name);
      return user ? user.tel : "";
    }
    return "";
  };
  const getUserEmail = (id) => {
    if (users && users.length > 0) {
      const user = users.find((c) => c.user_id === id);
      //console.log(customer.cus_name);
      return user ? user.email : "";
    }
    return "";
  };
  const getUserPosition = (id) => {
    if (users && users.length > 0) {
      const user = users.find((c) => c.user_id === id);
      //console.log(customer.cus_name);
      return user ? user.position : "";
    }
    return "";
  };
  /* End Get User data */
  /* Get Product data */
  const [products, setProduct] = useState([]);
  const getProduct = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER}/Product.php?server=${
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
        setProduct([]);
      } else {
        setProduct(data);
      }
    } catch (err) {
      console.log(err);
    }
  };
  const getProductName = (id) => {
    if (products && products.length > 0) {
      const product = products.find((c) => c.pd_id === id);
      //console.log(customer.cus_name);
      return product ? product.pd_name : "";
    }
    return "";
  };
  const getProductDescription = (id) => {
    if (products && products.length > 0) {
      const product = products.find((c) => c.pd_id === id);
      //console.log(customer.cus_name);
      return product ? product.pd_description : "";
    }
    return "";
  };
  const getProductSellPrice = (id) => {
    if (products && products.length > 0) {
      const product = products.find((c) => c.pd_id === id);
      //console.log(customer.cus_name);
      return product ? product.pd_sellprice : "";
    }
    return "";
  };
  /* End Get Product data */

  const changeDate = (date) => {
    const newFormatDate = date.split("-");
    const newDate = `${newFormatDate[2]}/${newFormatDate[1]}/${newFormatDate[0]}`;
    return newDate;
  };

  useEffect(() => {
    if (userInfo) {
      getQuotation();
    }
  }, [location, userInfo]);

  return (
    <div className="mx-5">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h1>QuotationApprove</h1>
        <QuotationUpdateStatus qo_id={qo_id} />
      </div>
      {quotations.map((qo, index) => (
        <Container key={index}>
          <Card className="p-5">
            <div className="d-flex justify-content-between mb-3 flex-wrap">
              <Image src={logo} className="w-25"></Image>
              <h1>Quote</h1>
            </div>
            <div className="d-flex justify-content-between flex-wrap mb-3">
              <div className="d-flex flex-column">
                <h4>Aliantechnology Co.,Ltd. (HQ)</h4>
                <h6>Tax ID: 0305562006859</h6>
                <h6>Address: 87 moo 15, Pudsa, MoungNakhonratchasima,</h6>
                <h6>Nakhonratchasima 30000</h6>
                <h6>Tel: 062-950-5874</h6>
              </div>
              <div className="d-flex flex-column gap-0">
                <h4>Aliantechnology Co.,Ltd. (HQ)</h4>
                <h6>Tax ID: 0305562006859</h6>
                <h6>Address: 87 moo 15, Pudsa, MoungNakhonratchasima,</h6>
                <h6>Nakhonratchasima 30000</h6>
                <h6>Tel: 062-950-5874</h6>
              </div>
              <div>
                <h6>Date: {changeDate(qo.qo_issue_date)}</h6>
                <h6>Quotation No. #: {qo.qo_id}</h6>
                <h6>Customer ID: {qo.qo_saler}</h6>
              </div>
            </div>
            <div className="d-flex justify-content-between flex-wrap mb-2">
              <div>
                {customers.length > 0 ? (
                  <h6>To: {customers[0].cus_name}</h6>
                ) : (
                  <></>
                )}
                {companies.length > 0 ? (
                  <div className="ms-4">
                    <h6>{companies[0].co_name}</h6>
                    <h6>
                      {companies[0].co_address} {companies[0].co_subdistrict},{" "}
                      {companies[0].co_district} {companies[0].co_province}{" "}
                      {companies[0].co_zipcode}
                    </h6>
                  </div>
                ) : (
                  <></>
                )}
              </div>
              <div>
                <h6>Quote valid unit: {changeDate(qo.qo_issue_date)}</h6>
                {users.length > 0 ? (
                  <div>
                    <h6>
                      Prepared by: {getUserFName(qo.qo_saler)}{" "}
                      {getUserLName(qo.qo_saler)}
                    </h6>
                    <h6>Mobile: {getUserTel(qo.qo_saler)} </h6>
                    <h6>Email: {getUserEmail(qo.qo_saler)}</h6>
                  </div>
                ) : (
                  <></>
                )}
              </div>
            </div>
            <Table bordered hover>
              <thead>
                <tr>
                  <th>Job</th>
                  <th>Delivery Terms</th>
                  <th>Payment Terms</th>
                  <th>Due Date</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  {projects.length > 0 ? (
                    <>
                      <td>{projects[0].pj_name}</td>
                    </>
                  ) : (
                    <></>
                  )}
                  {companies.length > 0 ? (
                    <td>
                      {qo.qo_leadtime} {qo.qo_timeunit}{" "}
                      {companies[0].co_delivery_condition}
                    </td>
                  ) : (
                    <></>
                  )}
                  <td>{qo.qo_creditterm} Days credits</td>
                  <td></td>
                </tr>
              </tbody>
            </Table>

            <Table bordered hover>
              <thead>
                <tr>
                  <th>No.</th>
                  <th>Part No.</th>
                  <th>Description</th>
                  <th className="text-center">Qty</th>
                  <th className="text-center">Unit</th>
                  <th className="text-center">Unit Price({qo.qo_currency})</th>
                  <th className="text-center">Total({qo.qo_currency})</th>
                </tr>
              </thead>
              <tbody>
                {items &&
                  items.map((item, index) => (
                    <tr key={index + 1}>
                      <td>{index + 1}</td>
                      <td>{item.pd_id}</td>
                      <td>
                        {getProductName(item.pd_id)}{" "}
                        {getProductDescription(item.pd_id)}
                      </td>
                      <td>{item.item_qty}</td>
                      <td>ea</td>
                      <td>{getProductSellPrice(item.pd_id)}</td>
                      <td className="text-end">
                        {item.item_qty * getProductSellPrice(item.pd_id)}
                      </td>
                    </tr>
                  ))}
                <tr>
                  <td colSpan={6} height={40}></td>
                  <td></td>
                </tr>
                <tr>
                  <td colSpan={6} className="text-danger fw-bold text-center">
                    Discount
                  </td>
                  <td className="text-danger fw-bold text-end">
                    {qo.qo_discount}
                  </td>
                </tr>
                <tr>
                  <td colSpan={6} className="fw-bold text-center">
                    Net Total
                  </td>
                  <td className="fw-bold text-end">{qo.qo_totalprice}</td>
                </tr>
                <tr>
                  <td colSpan={6} className="text-center">
                    Vat 7%
                  </td>
                  <td className="text-end">{qo.qo_vat}</td>
                </tr>
                <tr>
                  <td colSpan={6} className="text-center">
                    Withholding 3%
                  </td>
                  <td className="text-end">{qo.qo_withholding}</td>
                </tr>
                <tr>
                  <td colSpan={6} className="fw-bold text-center">
                    Grand Total
                  </td>
                  <td className="text-end fw-bold">{qo.qo_overall}</td>
                </tr>
              </tbody>
            </Table>
            <div className="d-flex justify-content-between mt-5">
              <div className="text-center">
                <h6>Accepted by ..................................</h6>
                <h6>
                  (To accepted this quotation please sign and return to us :)
                </h6>
              </div>

              <div className="text-center">
                <h6>Qoute by .......................................</h6>
                <p>()</p>
              </div>
            </div>
          </Card>
        </Container>
      ))}
    </div>
  );
}

export default QuotationApprove;
