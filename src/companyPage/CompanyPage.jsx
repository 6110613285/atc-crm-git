import React, { useContext, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FormControl, Button, Table } from "react-bootstrap";

import AddCompany from "./AddCompany";
import EditCompany from "./EditCompany";

import { UserContext } from "../App";
import PaginationComponent from "../components/PaginationComponent";

function CompanyPage() {
  const userInfo = useContext(UserContext);

  let navigate = useNavigate();

  const searchRef = useRef(null);

  /* Get Company Data */
  const [companies, setCompanies] = useState([]);
  const getCompany = async () => {
    try {
      if (userInfo.position == "Newsale") {
        const res = await fetch(
          `${import.meta.env.VITE_SERVER}/Company.php?server=${
            userInfo.server_db
          }&username=${userInfo.username_db}&password=${
            userInfo.password_db
          }&db=${userInfo.name_db}&action=getnewsale&search=${
            searchRef.current.value
          }&userId=${userInfo.user_id}&sort=ASC`,
          {
            method: "GET",
          }
        );
        const data = await res.json();
        console.log("A");
        if (data.data === null) {
          setCompanies([]);
        } else {
          setCompanies(data.data);
        }
      } else {
        const res = await fetch(
          `${import.meta.env.VITE_SERVER}/Company.php?server=${
            userInfo.server_db
          }&username=${userInfo.username_db}&password=${
            userInfo.password_db
          }&db=${userInfo.name_db}&action=get&search=${
            searchRef.current.value
          }&sort=ASC`,
          {
            method: "GET",
          }
        );
        const data = await res.json();
        console.log("B" + userInfo.position);
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
  /* Get Company Data */
  //pagination
  const [currentPageData, setCurrentPageData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1); // เพิ่มตัวแปร currentPage และสร้างฟังก์ชัน setCurrentPage เพื่อใช้ในการเปลี่ยนหน้า

  const itemsPerPage = 200; // กำหนดจำนวนรายการต่อหน้า

  const paginate = (pageNumber) => {
    const startIndex = (pageNumber - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setCurrentPageData(companies.slice(startIndex, endIndex));
    setCurrentPage(pageNumber); // เมื่อเปลี่ยนหน้าใหม่ ให้เปลี่ยน currentPage ให้ตรงกับหน้าใหม่
  };
  // End Pagination

  //get call back add
  const handleSave = (callback) => {
    if (callback) {
      getCompany();
    }
  };

  useEffect(() => {
    if (userInfo) {
      getCompany();
    }
  }, [userInfo]);

  useEffect(() => {
    paginate(currentPage);
  }, [companies]);

  return (
    <>
      <div className="mx-5">
        <h1 className="mb-3">Company</h1>
        <div className="d-flex flex-column">
          <div className="d-flex justify-content-end gap-1 mb-1">
            <FormControl
              className="w-25"
              type="text"
              placeholder="&#x1F50D; Search..."
              ///value={search}
              ref={searchRef}
              //  onChange={async () => {
              //   await getCompany();
              //   paginate(1);
              // }}
            />
            <Button
              variant="info"
              onClick={async () => {
                await getCompany();
                paginate(1);
              }}
            >
              Search
            </Button>
            <AddCompany onSave={handleSave} />
          </div>

          <Table striped bordered hover responsive variant="dark">
            <thead>
              <tr className="text-center">
                <th>#</th>
                <th>Company ID</th>
                <th>Company Name</th>
                <th>Company Name TH</th>
                <th>Tax ID</th>
                <th>Branch</th>
                <th>Company Address</th>
                <th>Maps</th>
                <th>Company Tel</th>
                <th>Employee</th>
                <th>Action</th>
              </tr>
            </thead>

            {companies.length == 0 ? (
              <tbody>
                <tr>
                  <td colSpan={12} className="fw-bold text-center">
                    No Data
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody>
                {currentPageData.map((company, index) => (
                  <tr key={index + 1} className="text-center">
                    <td>{index + 1}</td>
                    <td>{company.co_id}</td>
                    <td>{company.co_name}</td>
                    <td>{company.co_name_th}</td>
                    <td>{company.co_tax}</td>
                    <td>{company.co_branch}</td>
                    <td>{`${company.co_address} ${company.co_subdistrict},${company.co_district} ${company.co_province} ${company.co_zipcode}`}</td>
                    <td>
                      {company.co_map ? (
                        <a
                          className="btn btn-light"
                          href={company.co_map}
                          target="_blank"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            fill="currentColor"
                            className="bi bi-geo-alt-fill"
                            viewBox="0 0 16 16"
                          >
                            <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z" />
                          </svg>
                        </a>
                      ) : (
                        <></>
                      )}
                    </td>
                    <td>{company.co_tel}</td>
                    <td>{company.amount_cus}</td>
                    <td>
                      <div className="d-flex gap-1 justify-content-center align-items-center">
                        <Button
                          variant="info"
                          onClick={() => {
                            navigate("/SelectedCompany", {
                              state: `${company.co_id}`,
                            });
                          }}
                          data-bs-toggle="tooltip"
                          data-bs-placement="top"
                          title="company profile"
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
                        <EditCompany
                          co_id={company.co_id}
                          onSave={handleSave}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            )}
          </Table>
        </div>

        {/* Pagination */}
        <PaginationComponent
          itemsPerPage={itemsPerPage}
          totalItems={companies.length}
          paginate={paginate}
          currentPage={currentPage} // ส่งตัวแปร currentPage ไปให้ Pagination
          setCurrentPage={setCurrentPage}
        />
        {/* data table */}
      </div>
    </>
  );
}

export default CompanyPage;
