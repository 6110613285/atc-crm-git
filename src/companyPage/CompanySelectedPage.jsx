import React from "react";
import { useState, useEffect, useRef, useContext } from "react";
import { useLocation } from "react-router-dom";

import { Card } from "react-bootstrap";

import { UserContext } from "../App";

import CustomerPage from "../customerPage/CustomerPage";
import ProjectPage from "../projectPage/ProjectPage";

function CompanySelectedPage() {
  const userInfo = useContext(UserContext);

  let location = useLocation();

  /* Get Company Data */
  const [companyInfo, setCompanyInfo] = useState([]);
  const getCompany = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER}/Company.php?server=${
          userInfo.server_db
        }&username=${userInfo.username_db}&password=${
          userInfo.password_db
        }&db=${userInfo.name_db}&action=get&sort=DESC`,
        {
          method: "GET",
        }
      );
      const data = await res.json();
      console.log(data.data);
      if (data.data === null) {
      } else {
        const companyInfo = data.data.filter((row) => {
          return row.co_id == location.state;
        });
        setCompanyInfo(companyInfo);
      }
    } catch (err) {
      console.log(err);
    }
  };
  /* Get Company Data */

  useEffect(() => {
    if (userInfo) {
      getCompany();
    }
  }, [location, userInfo]);

  return (
    <>
      <div className="mx-5">
        <h1 className="mb-3">Company Profile</h1>
        <Card className="py-3 px-5 mb-4">
          {companyInfo.map((el, index) => (
            <div key={index}>
              <h2 className="mb-3">
                <b>{el.co_name} </b>{" "}
                {el.co_branch ? `(${el.co_branch})` : <></>}
              </h2>
              <div>
                <div className="d-flex align-items-center gap-2">
                  <h3>
                    <b>Address:</b>
                  </h3>
                  <h4>
                    {el.co_address} {el.co_subdistrict}, {el.co_subdistrict}{" "}
                    {el.co_province} {el.co_zipcode}
                  </h4>
                </div>
                <h3>
                  <b>Tax ID:</b> {el.co_tax}
                </h3>
                <h3>
                  <b>Tel:</b> {el.co_tel}
                </h3>
              </div>
            </div>
          ))}
        </Card>
      </div>
      <CustomerPage co_id={location.state} />
      <hr className="mx-5 my-5"></hr>
      <ProjectPage com_id={location.state} /> {/* แก้ไข */}
    </>
  );
}

export default CompanySelectedPage;
