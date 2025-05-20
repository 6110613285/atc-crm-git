import React, { useState, useEffect, useContext } from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  PDFViewer,
  Image,
  Font,
} from "@react-pdf/renderer";

import { UserContext } from "../App";

import Logo from "../assets/fullLogo.png";

import fontBold from "/public/font/SukhumvitSet-Bold.ttf";
import fontMedium from "/public/font/SukhumvitSet-Medium.ttf";

const QutationPdf = () => {
  const userInfo = useContext(UserContext);

  let qo_id = localStorage.getItem("qo_id");

  //console.log(qo_id);

  /* Get Qo data */
  const [quotations, setQuotation] = useState([]);
  const getQuotation = async () => {
    const res = await fetch(
      `${import.meta.env.VITE_SERVER}/Quotation.php?server=${
        userInfo.server_db
      }&username=${userInfo.username_db}&password=${userInfo.password_db}&db=${
        userInfo.name_db
      }&action=getwhereqoidipc&id=${qo_id}`,
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
      }&action=getitemwhereqoidipc&id=${id}`,
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
        }&db=${userInfo.name_db}&action=getmodelipc&sort=ASC`,
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
      const product = products.find((c) => c.model_id === id);
      //console.log(customer.cus_name);
      return product ? product.model_name : "";
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

  Font.register({
    family: "SukhumvitSet-Bold",
    src: `${fontBold}`,
  });
  Font.register({
    family: "SukhumvitSet",
    src: `${fontMedium}`,
  });

  const styles = StyleSheet.create({
    page: {
      flexDirection: "column",
      padding: "20 25 10 25",
    },
  });

  useEffect(() => {
    if (userInfo) {
      getQuotation();
    }
  }, [userInfo]);

  return (
    <>
      {quotations.map((qo, index) => (
        <PDFViewer key={index} width="100%" height="927">
          <Document>
            <Page size="A4" style={styles.page}>
              {/* Header */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Image src={Logo} style={{ width: "180" }} />

                <Text style={{ fontSize: "40px", color: "#cccaca" }}>
                  Quote
                </Text>
              </View>
              {/* End Header */}
              {/* 2nd section */}
              <View
                style={{
                  marginTop: "10px",
                  flexDirection: "row",
                  flexWrap: "wrap",
                  justifyContent: "space-between",
                  gap: "1",
                }}
              >
                <View
                  style={{
                    /* backgroundColor: "lime", */
                    width: "180",
                    flexDirection: "column",
                    /* flexWrap: "wrap", */
                    fontSize: "7",
                    /* gap: "1", */
                    flexGrow: "1",
                    /* backgroundColor: "#232", */
                  }}
                >
                  <Text
                    style={{ fontSize: "9", fontFamily: "SukhumvitSet-Bold" }}
                  >
                    Alian Technology Co.,Ltd. (HQ)
                  </Text>
                  <Text
                    style={{
                      /* fontSize: "8", */ fontFamily: "SukhumvitSet",
                    }}
                  >
                    Tax ID: 0305561006859
                  </Text>
                  <Text style={{ fontFamily: "SukhumvitSet" }}>
                    Address: 87 moo 15, Pudsa, MoungNakhonratchsima,
                  </Text>
                  <Text style={{ fontFamily: "SukhumvitSet" }}>
                    Nakhonratchasima 30000
                  </Text>
                  <Text style={{ fontFamily: "SukhumvitSet" }}>
                    Tel: 062-950-5874
                  </Text>
                </View>
                <View
                  style={{
                    /* backgroundColor: "red", */
                    width: "200",
                    flexDirection: "column",
                    flexWrap: "wrap",
                    fontSize: "7",
                    flexGrow: "1",

                    /* backgroundColor: "#555", */
                  }}
                >
                  <Text
                    style={{ fontSize: "9", fontFamily: "SukhumvitSet-Bold" }}
                  >
                    Alian Technology Co.,Ltd. (Branch 01)
                  </Text>
                  <Text style={{ fontFamily: "SukhumvitSet" }}>
                    Tax ID: 0305561006859
                  </Text>
                  <Text style={{ fontFamily: "SukhumvitSet" }}>
                    Address: 85/134 Moo3, Bang Rak Phatthana, Bang Bua Thong,
                  </Text>
                  <Text style={{ fontFamily: "SukhumvitSet" }}>
                    Nonthaburi, 11110
                  </Text>
                  <Text style={{ fontFamily: "SukhumvitSet" }}>
                    Tel: 085-827-8731
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: "column",
                    flexWrap: "wrap",
                    fontSize: "7",
                    gap: "1",
                    flexGrow: "1",
                    /* backgroundColor: "#7787", */
                  }}
                >
                  <Text style={{ fontFamily: "SukhumvitSet" }}>
                    Date: {changeDate(qo.qo_issue_date)}
                  </Text>
                  <Text style={{ fontFamily: "SukhumvitSet" }}>
                    Quotation No. #: {qo.qo_id}
                  </Text>
                  <Text style={{ fontFamily: "SukhumvitSet" }}>
                    Customer ID: {qo.cus_id}
                  </Text>
                </View>
              </View>
              {/* End 2nd section */}
              {/* End 3rd section */}
              {companies.map((co, index) => (
                <View
                  key={index}
                  style={{
                    marginTop: "5",
                    flexDirection: "row",
                    flexWrap: "wrap",
                    /* justifyContent: "space-between", */
                    /* gap: "10px", */
                  }}
                >
                  <View
                    style={{
                      flexDirection: "column",
                      flexWrap: "wrap",
                      gap: "1",
                      fontSize: "6",
                      width: "425",
                    }}
                  >
                    {customers.map((cus, index) => (
                      <Text
                        key={index}
                        style={{
                          fontSize: "7",
                          fontFamily: "SukhumvitSet-Bold",
                        }}
                      >
                        To: K.{cus.cus_name}
                      </Text>
                    ))}
                    <Text
                      style={{
                        fontSize: "7",
                        paddingLeft: "10",
                        fontFamily: "SukhumvitSet-Bold",
                      }}
                    >
                      {co.co_name}
                    </Text>

                    <Text
                      style={{
                        paddingLeft: "9px",
                        fontFamily: "SukhumvitSet",
                      }}
                    >
                      {co.co_address} {co.co_subdistrict}, {co.co_district}{" "}
                      {co.co_province} {co.co_zipcode}
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: "column",
                      fontSize: "7",
                      gap: "1",
                      fontFamily: "SukhumvitSet",
                    }}
                  >
                    <Text>
                      Quote valid unit: {qo.qo_validunit} {qo.qo_validunit_unit}
                    </Text>

                    <Text>
                      Prepared by: {getUserFName(qo.qo_saler)}{" "}
                      {getUserLName(qo.qo_saler)}
                    </Text>

                    <Text>Mobile: {getUserTel(qo.qo_saler)} </Text>
                    <Text>Email: {getUserEmail(qo.qo_saler)}</Text>
                  </View>
                </View>
              ))}
              {/* End 3rd section */}
              {/* Table1 section */}
              <View
                style={{
                  margin: "5 0 0 0",
                  fontSize: "7",
                  flexDirection: "row",
                  fontFamily: "SukhumvitSet-Bold",
                }}
              >
                <Text style={{ width: "150px" }}>Job</Text>
                <Text style={{ width: "150px" }}>Delivery Terms</Text>
                <Text style={{ width: "150px" }}>Payment Terms</Text>
                <Text style={{ width: "100px" }}>Due Date</Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                {projects.map((pj, index) => (
                  <Text
                    key={index}
                    style={{
                      textAlign: "center",
                      padding: "2px",
                      borderLeft: "1px solid #a19f9f",
                      borderTop: "1px solid #a19f9f",
                      borderBottom: "1px solid #a19f9f",
                      width: "150px",
                      fontSize: "7",
                      fontFamily: "SukhumvitSet",
                    }}
                  >
                    {pj.pj_name}
                  </Text>
                ))}

                {companies.length > 0 ? (
                  <Text
                    style={{
                      padding: "2px",
                      borderLeft: "1px solid #a19f9f",
                      borderTop: "1px solid #a19f9f",
                      borderBottom: "1px solid #a19f9f",
                      width: "150px",
                      fontSize: "7",
                      fontFamily: "SukhumvitSet",
                    }}
                  >
                    with in {qo.qo_leadtime} {qo.qo_timeunit}{" "}
                    {companies[0].co_delivery_condition}
                  </Text>
                ) : (
                  <></>
                )}

                <Text
                  style={{
                    padding: "2px",
                    borderLeft: "1px solid #a19f9f",
                    borderTop: "1px solid #a19f9f",
                    borderBottom: "1px solid #a19f9f",
                    width: "150px",
                    fontSize: "7",
                    fontFamily: "SukhumvitSet",
                  }}
                >
                  {qo.qo_creditterm} Days credits
                </Text>
                <Text
                  style={{
                    padding: "2px",
                    borderLeft: "1px solid #a19f9f",
                    borderTop: "1px solid #a19f9f",
                    borderBottom: "1px solid #a19f9f",
                    borderRight: "1px solid #a19f9f",
                    width: "100px",
                    fontSize: "7",
                    fontFamily: "SukhumvitSet",
                  }}
                ></Text>
              </View>
              {/* End Table1 section */}
              {/* Table2 section */}
              <View
                style={{
                  margin: "5 0 0 0",
                  fontSize: "6",
                  flexDirection: "row",
                  fontFamily: "SukhumvitSet-Bold",
                }}
              >
                <Text style={{ width: "30px" }}>No.</Text>
                <Text style={{ width: "55px" }}>Part No.</Text>
                <Text style={{ width: "250px" }}>Description</Text>
                <Text style={{ textAlign: "center", width: "30px" }}>QTY</Text>
                <Text style={{ textAlign: "center", width: "30px" }}>Unit</Text>
                <Text style={{ textAlign: "center", width: "100px" }}>
                  Unit Price ({qo.qo_currency})
                </Text>
                <Text style={{ textAlign: "center", width: "100px" }}>
                  Total ({qo.qo_currency})
                </Text>
              </View>
              {items.map((item, index) => (
                <View
                  key={index}
                  style={{
                    fontSize: "6",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    fontFamily: "SukhumvitSet",
                  }}
                >
                  <Text
                    style={{
                      textAlign: "center",
                      padding: "2px",
                      borderLeft: "1px solid #a19f9f",
                      borderTop: "1px solid #a19f9f",
                      /* borderBottom: "1px solid #a19f9f", */
                      width: "30px",
                    }}
                  >
                    {index + 1}
                  </Text>
                  <Text
                    style={{
                      textAlign: "center",
                      /* textAlignLast: "centen", */
                      padding: "2px",
                      borderLeft: "1px solid #a19f9f",
                      borderTop: "1px solid #a19f9f",
                      /*borderBottom: "1px solid #a19f9f", */
                      width: "55px",
                    }}
                  >
                    {getProductName(item.model_id)}
                  </Text>
                  <Text
                    style={{
                      padding: "2px",
                      borderLeft: "1px solid #a19f9f",
                      borderTop: "1px solid #a19f9f",
                      /* borderBottom: "1px solid #a19f9f", */
                      width: "250px",
                    }}
                  >
                    {item.adapter +
                      " / " +
                      item.model_type +
                      " / " +
                      item.size_screen +
                      " / " +
                      item.mainboard +
                      " / "}
                    {item.cpu + " / " + item.storage + " / " + item.ram}
                    {" / "}
                    {item.comport +
                      " / " +
                      item.hdmi_vga_qty +
                      " / " +
                      item.rj45_qty +
                      " / " +
                      item.usb_qty +
                      " / " +
                      item.wifi +
                      " / " +
                      item.warranty +
                      " / " +
                      item.detail}
                  </Text>

                  <Text
                    style={{
                      textAlign: "center",
                      padding: "2px",
                      borderLeft: "1px solid #a19f9f",
                      borderTop: "1px solid #a19f9f",
                      /* borderBottom: "1px solid #a19f9f", */
                      width: "30px",
                    }}
                  >
                    {Number(item.item_qty).toLocaleString(undefined, {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 2,
                    })}
                  </Text>
                  <Text
                    style={{
                      textAlign: "center",
                      padding: "2px",
                      borderLeft: "1px solid #a19f9f",
                      borderTop: "1px solid #a19f9f",
                      /* borderBottom: "1px solid #a19f9f", */
                      width: "30px",
                    }}
                  >
                    ea
                  </Text>
                  <Text
                    style={{
                      textAlign: "right",
                      padding: "2px",
                      borderLeft: "1px solid #a19f9f",
                      borderTop: "1px solid #a19f9f",
                      /* borderBottom: "1px solid #a19f9f", */
                      width: "100px",
                    }}
                  >
                    {/* {getProductSellPrice(item.pd_id)} */}
                    {Number(item.item_price).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </Text>
                  <Text
                    style={{
                      textAlign: "right",
                      padding: "2px",
                      borderLeft: "1px solid #a19f9f",
                      borderTop: "1px solid #a19f9f",
                      /* borderBottom: "1px solid #a19f9f", */
                      borderRight: "1px solid #a19f9f",
                      width: "100px",
                    }}
                  >
                    {(item.item_price * item.item_qty).toLocaleString()}
                  </Text>
                </View>
              ))}
              {/* End Table2 section */}
              {/* Empty section */}
              <View
                style={{
                  fontSize: "6px",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  height: "10",
                }}
              >
                <Text
                  style={{
                    textAlign: "center",
                    padding: "2px",
                    borderLeft: "1px solid #a19f9f",
                    borderTop: "1px solid #a19f9f",
                    /* borderBottom: "1px solid #a19f9f", */
                    width: "30px",
                  }}
                ></Text>
                <Text
                  style={{
                    textAlign: "center",
                    /* textAlignLast: "centen", */
                    padding: "2px",
                    borderLeft: "1px solid #a19f9f",
                    borderTop: "1px solid #a19f9f",
                    /*borderBottom: "1px solid #a19f9f", */
                    width: "55px",
                  }}
                ></Text>
                <Text
                  style={{
                    padding: "2px",
                    borderLeft: "1px solid #a19f9f",
                    borderTop: "1px solid #a19f9f",
                    /* borderBottom: "1px solid #a19f9f", */
                    width: "250px",
                  }}
                ></Text>
                <Text
                  style={{
                    textAlign: "center",
                    padding: "2px",
                    borderLeft: "1px solid #a19f9f",
                    borderTop: "1px solid #a19f9f",
                    /* borderBottom: "1px solid #a19f9f", */
                    width: "30px",
                  }}
                ></Text>
                <Text
                  style={{
                    textAlign: "center",
                    padding: "2px",
                    borderLeft: "1px solid #a19f9f",
                    borderTop: "1px solid #a19f9f",
                    /* borderBottom: "1px solid #a19f9f", */
                    width: "30px",
                  }}
                ></Text>
                <Text
                  style={{
                    textAlign: "right",
                    padding: "2px",
                    borderLeft: "1px solid #a19f9f",
                    borderTop: "1px solid #a19f9f",
                    /* borderBottom: "1px solid #a19f9f", */
                    width: "100px",
                  }}
                ></Text>
                <Text
                  style={{
                    textAlign: "right",
                    padding: "2px",
                    borderLeft: "1px solid #a19f9f",
                    borderTop: "1px solid #a19f9f",
                    /* borderBottom: "1px solid #a19f9f", */
                    borderRight: "1px solid #a19f9f",
                    width: "100px",
                  }}
                ></Text>
              </View>
              <View
                style={{
                  fontSize: "6px",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  height: "10",
                }}
              >
                <Text
                  style={{
                    textAlign: "center",
                    padding: "2px",
                    borderLeft: "1px solid #a19f9f",
                    borderTop: "1px solid #a19f9f",
                    /* borderBottom: "1px solid #a19f9f", */
                    width: "30px",
                  }}
                ></Text>
                <Text
                  style={{
                    textAlign: "center",
                    /* textAlignLast: "centen", */
                    padding: "2px",
                    borderLeft: "1px solid #a19f9f",
                    borderTop: "1px solid #a19f9f",
                    /*borderBottom: "1px solid #a19f9f", */
                    width: "55px",
                  }}
                ></Text>
                <Text
                  style={{
                    padding: "2px",
                    borderLeft: "1px solid #a19f9f",
                    borderTop: "1px solid #a19f9f",
                    /* borderBottom: "1px solid #a19f9f", */
                    width: "250px",
                  }}
                ></Text>
                <Text
                  style={{
                    textAlign: "center",
                    padding: "2px",
                    borderLeft: "1px solid #a19f9f",
                    borderTop: "1px solid #a19f9f",
                    /* borderBottom: "1px solid #a19f9f", */
                    width: "30px",
                  }}
                ></Text>
                <Text
                  style={{
                    textAlign: "center",
                    padding: "2px",
                    borderLeft: "1px solid #a19f9f",
                    borderTop: "1px solid #a19f9f",
                    /* borderBottom: "1px solid #a19f9f", */
                    width: "30px",
                  }}
                ></Text>
                <Text
                  style={{
                    textAlign: "right",
                    padding: "2px",
                    borderLeft: "1px solid #a19f9f",
                    borderTop: "1px solid #a19f9f",
                    /* borderBottom: "1px solid #a19f9f", */
                    width: "100px",
                  }}
                ></Text>
                <Text
                  style={{
                    textAlign: "right",
                    padding: "2px",
                    borderLeft: "1px solid #a19f9f",
                    borderTop: "1px solid #a19f9f",
                    /* borderBottom: "1px solid #a19f9f", */
                    borderRight: "1px solid #a19f9f",
                    width: "100px",
                  }}
                ></Text>
              </View>

              {/* End Empty section */}
              {/* Total */}
              <View
                style={{
                  fontSize: "6",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  fontFamily: "SukhumvitSet-Bold",
                }}
              >
                <Text
                  style={{
                    textAlign: "center",
                    padding: "2px",
                    borderLeft: "1px solid #a19f9f",
                    borderTop: "1.5px solid black",
                    /* borderBottom: "1px solid #a19f9f", */
                    width: "495px",
                  }}
                ></Text>
                <Text
                  style={{
                    textAlign: "right",
                    padding: "2px",
                    borderLeft: "1px solid #a19f9f",
                    borderTop: "1.5px solid #black",
                    /* borderBottom: "1px solid #a19f9f", */
                    borderRight: "1px solid #a19f9f",
                    width: "100px",
                  }}
                >
                  {qo.qo_totalprice
                    ? Number(qo.qo_totalprice).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })
                    : "-"}
                </Text>
              </View>
              {/* End Total */}
              {/* Discount */}
              <View
                style={{
                  fontSize: "6px",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  fontFamily: "SukhumvitSet",
                }}
              >
                <Text
                  style={{
                    color: "red",
                    textAlign: "center",
                    padding: "2px",
                    borderLeft: "1px solid #a19f9f",
                    borderTop: "1px solid #a19f9f",
                    /* borderBottom: "1px solid #a19f9f", */
                    width: "495px",
                  }}
                >
                  Discount
                </Text>
                <Text
                  style={{
                    color: "red",
                    textAlign: "right",
                    padding: "2px",
                    borderLeft: "1px solid #a19f9f",
                    borderTop: "1px solid #a19f9f",
                    /* borderBottom: "1px solid #a19f9f", */
                    borderRight: "1px solid #a19f9f",
                    width: "100px",
                  }}
                >
                  {qo.qo_discount
                    ? Number(qo.qo_discount).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })
                    : "-"}
                </Text>
              </View>
              {/* End Discount */}
              {/* Net Total */}
              <View
                style={{
                  fontSize: "6px",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  fontFamily: "SukhumvitSet-Bold",
                }}
              >
                <Text
                  style={{
                    textAlign: "center",
                    padding: "2px",
                    borderLeft: "1px solid #a19f9f",
                    borderTop: "1px solid #a19f9f",
                    /* borderBottom: "1px solid #a19f9f", */
                    width: "495px",
                  }}
                >
                  Net Total
                </Text>
                <Text
                  style={{
                    textAlign: "right",
                    padding: "2px",
                    borderLeft: "1px solid #a19f9f",
                    borderTop: "1px solid #a19f9f",
                    /* borderBottom: "1px solid #a19f9f", */
                    borderRight: "1px solid #a19f9f",
                    width: "100px",
                  }}
                >
                  {qo.qo_priceafterdiscount
                    ? Number(qo.qo_priceafterdiscount).toLocaleString(
                        undefined,
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )
                    : "-"}
                </Text>
              </View>
              {/* End Net Total */}
              {/* Vat */}
              <View
                style={{
                  fontSize: "6px",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  fontFamily: "SukhumvitSet",
                }}
              >
                <Text
                  style={{
                    textAlign: "center",
                    padding: "2px",
                    borderLeft: "1px solid #a19f9f",
                    borderTop: "1px solid #a19f9f",
                    /* borderBottom: "1px solid #a19f9f", */
                    width: "495",
                  }}
                >
                  Vat 7%
                </Text>
                <Text
                  style={{
                    textAlign: "right",
                    padding: "2px",
                    borderLeft: "1px solid #a19f9f",
                    borderTop: "1px solid #a19f9f",
                    /* borderBottom: "1px solid #a19f9f", */
                    borderRight: "1px solid #a19f9f",
                    width: "100px",
                  }}
                >
                  {qo.qo_vat
                    ? Number(qo.qo_vat).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })
                    : "-"}
                </Text>
              </View>
              {/* End Vat */}
              {/* withholding */}
              <View
                style={{
                  fontSize: "6px",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  fontFamily: "SukhumvitSet",
                }}
              >
                <Text
                  style={{
                    textAlign: "center",
                    padding: "2px",
                    borderLeft: "1px solid #a19f9f",
                    borderTop: "1px solid #a19f9f",
                    /* borderBottom: "1px solid #a19f9f", */
                    width: "495",
                  }}
                >
                  Withholding 3%
                </Text>
                <Text
                  style={{
                    textAlign: "right",
                    padding: "2px",
                    borderLeft: "1px solid #a19f9f",
                    borderTop: "1px solid #a19f9f",
                    /* borderBottom: "1px solid #a19f9f", */
                    borderRight: "1px solid #a19f9f",
                    width: "100px",
                  }}
                >
                  {qo.qo_withholding
                    ? Number(qo.qo_withholding).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })
                    : "-"}
                </Text>
              </View>
              {/* End withholding */}
              {/* Grand Total */}
              <View
                style={{
                  fontSize: "6px",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  fontFamily: "SukhumvitSet-Bold",
                }}
              >
                <Text
                  style={{
                    textAlign: "center",
                    padding: "2px",
                    borderLeft: "1px solid #a19f9f",
                    borderTop: "1px solid #a19f9f",
                    borderBottom: "1px solid #a19f9f",
                    width: "495",
                  }}
                >
                  Grand Total
                </Text>
                <Text
                  style={{
                    textAlign: "right",
                    padding: "2px",
                    borderLeft: "1px solid #a19f9f",
                    borderTop: "1px solid #a19f9f",
                    borderBottom: "1px solid #a19f9f",
                    borderRight: "1px solid #a19f9f",
                    width: "100px",
                  }}
                >
                  {qo.qo_overall
                    ? Number(qo.qo_overall).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })
                    : "-"}
                </Text>
              </View>
              {/* End Grand Total */}
              {/* footer */}
              <View
                style={{
                  margin: "30 0 0 0",
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <View
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "2",
                  }}
                >
                  <Text
                    style={{ fontSize: "8", fontFamily: "SukhumvitSet-Bold" }}
                  >
                    Accepted by ..................................
                  </Text>
                  <Text style={{ fontSize: "6" }}>
                    (To accepted this quotation please sign and return to us :)
                  </Text>
                </View>
                {qo.qo_status_approve == "approve" ? (
                  <View
                    style={{
                      fontSize: "8",

                      justifyContent: "center",
                      alignItems: "center",
                      gap: "1",
                    }}
                  >
                    <View
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "start",
                      }}
                    >
                      <Text style={{ fontFamily: "SukhumvitSet-Bold" }}>
                        Approve by{"   "}
                      </Text>
                      <Text style={{ fontFamily: "SukhumvitSet" }}>
                        {getUserFName(qo.qo_user_approve)}{" "}
                        {getUserLName(qo.qo_user_approve)}{" "}
                      </Text>
                    </View>
                    <Text style={{ fontSize: "6", fontFamily: "SukhumvitSet" }}>
                      ({getUserPosition(qo.qo_user_approve)})
                    </Text>
                  </View>
                ) : (
                  <View
                    style={{
                      color: "red",
                      fontSize: "18",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: "10",
                    }}
                  >
                    <Text style={{ fontFamily: "SukhumvitSet-Bold" }}>
                      {" "}
                      Not Approve{" "}
                    </Text>
                  </View>
                )}

                <View
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "1",
                  }}
                >
                  <Text
                    style={{ fontSize: "8", fontFamily: "SukhumvitSet-Bold" }}
                  >
                    Qoute by ...................................{" "}
                  </Text>
                  <Text style={{ fontSize: "6", fontFamily: "SukhumvitSet" }}>
                    (Sales Engineer)
                  </Text>
                </View>
              </View>
              {/* End footer */}
            </Page>
          </Document>
        </PDFViewer>
      ))}
    </>
  );
};

export default QutationPdf;
