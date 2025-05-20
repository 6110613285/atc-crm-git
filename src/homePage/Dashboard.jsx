import React, { useState, useEffect, useRef, useContext } from "react";
import { UserContext } from "../App";
import {
  Container,
  Row,
  Card,
  Button,
  Table,
  Form,
  Col,
} from "react-bootstrap";
import * as Icon from "react-bootstrap-icons";
function Dashboard() {
  const taget_call = 100;
  const userInfo = useContext(UserContext) || {};

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
  useEffect(() => {
    getCallRecord();
    getTotalCall();
    getTotalQuotation();
    getTotalProject();
    getSale();
    getCountProjectCall();
  }, [callRecordSearch, saleSearch]);
  return (
    <Container>
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
    </Container>
  );
}
export default Dashboard;
