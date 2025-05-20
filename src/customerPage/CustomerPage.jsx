import React, { useState, useEffect, useRef, useContext } from "react";
import { FormControl, Button, Table, Card } from "react-bootstrap";

import { useNavigate, Link } from "react-router-dom";

import { UserContext } from "../App";
import AddCustomer from "./AddCustomer";
import EditCustomer from "./EditCustomer";

import Copy from "../components/Copy";
import PaginationComponent from "../components/PaginationComponent";

function CustomerPage({ co_id }) {
  const userInfo = useContext(UserContext);

  let navigate = useNavigate();

  /* Get Customer Data */
  const [customers, setCustomers] = useState([]);
  const getCustomer = async () => {
    try {
      if (co_id) {
        const res = await fetch(
          `${import.meta.env.VITE_SERVER}/Customer.php?server=${
            userInfo.server_db
          }&username=${userInfo.username_db}&password=${
            userInfo.password_db
          }&db=${userInfo.name_db}&action=getwherecoid&id=${co_id}&search=${
            searchRef.current.value
          }`,
          {
            method: "GET",
          }
        );
        const data = await res.json();
        /////console.log(data);
        if (data === null) {
          setCustomers([]);
        } else {
          setCustomers(data);
        }
      } else {
        if (userInfo.position == "Newsale") {
          const res = await fetch(
            `${import.meta.env.VITE_SERVER}/Customer.php?server=${
              userInfo.server_db
            }&username=${userInfo.username_db}&password=${
              userInfo.password_db
            }&db=${userInfo.name_db}&action=getnewsale&search=${
              searchRef.current.value
            }&userId=${userInfo.user_id}&sort=DESC`,
            {
              method: "GET",
            }
          );
          const data = await res.json();
          ////console.log(data);
          if (data == null) {
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
            }&db=${userInfo.name_db}&action=get&search=${
              searchRef.current.value
            }&sort=DESC`,
            {
              method: "GET",
            }
          );
          const data = await res.json();
          ////console.log(data);
          if (data == null) {
            setCustomers([]);
          } else {
            setCustomers(data);
          }
        }
      }
    } catch (err) {
      console.log(err);
    }
  };
  /* Get Customer Data */

  //pagination
  const [currentPageData, setCurrentPageData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1); // เพิ่มตัวแปร currentPage และสร้างฟังก์ชัน setCurrentPage เพื่อใช้ในการเปลี่ยนหน้า

  const itemsPerPage = 10; // กำหนดจำนวนรายการต่อหน้า

  const paginate = (pageNumber) => {
    const startIndex = (pageNumber - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setCurrentPageData(customers.slice(startIndex, endIndex));
    setCurrentPage(pageNumber); // เมื่อเปลี่ยนหน้าใหม่ ให้เปลี่ยน currentPage ให้ตรงกับหน้าใหม่
  };
  // End Pagination

  //get call back add
  const handleSave = (callback) => {
    if (callback) {
      getCustomer();
    }
  };

  useEffect(() => {
    if (userInfo) {
      getCustomer();
    }
  }, [userInfo]);

  useEffect(() => {
    paginate(currentPage);
  }, [customers]);

  const searchRef = useRef(null);

  return (
    <>
      <div className="mx-5">
        <h1 className="mb-3 text-xxl">
          {co_id ? `Customer Table` : `Customer Page`}
        </h1>

        <div className="d-flex justify-content-end gap-1">
          <div className="w-25">
            <FormControl
              className=""
              type="text"
              placeholder="&#x1F50D; Search..."
              ref={searchRef}
              // onChange={async () => {
              //   await getCustomer();
              //   paginate(1);
              // }}
            />
          </div>
          <div>
            <Button
              variant="info"
              onClick={async () => {
                await getCustomer();
                paginate(1);
              }}
            >
              search
            </Button>
          </div>
          <div>
            <AddCustomer co_id={co_id} onSave={handleSave} />
          </div>
        </div>

        {/* data table */}
        <Table
          responsive
          striped
          bordered
          hover
          variant="dark"
          className="mt-1"
        >
          <thead>
            <tr className="text-center">
              <th>#</th>
              <th>Customer ID</th>
              <th>Company</th>
              <th>Name</th>
              <th>Name TH</th>
              <th>Position</th>
              <th>Type</th>
              <th>Email</th>
              <th>Tel</th>
              <th>Action</th>
            </tr>
          </thead>

          {customers.length == 0 ? (
            <tbody>
              <tr>
                <td colSpan={12} className="fw-bold text-center">
                  No Data
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody>
              {currentPageData.map((customer, index) => (
                <tr key={index + 1} className="text-center">
                  <td>{index + 1}</td>
                  <td>{customer.cus_id}</td>
                  <td>{customer.co_name}</td>
                  <td>
                    {customer.cus_name} {customer.cus_lastname}
                  </td>
                  <td>
                    {customer.cus_name_th} {customer.cus_lastname_th}
                  </td>
                  <td>{customer.cus_position}</td>
                  {customer.cus_type.toLowerCase() == "key person" ? (
                    <td>
                      <Card
                        text="dark"
                        className="p-1"
                        style={{ backgroundColor: "lime" }}
                      >
                        <b>{customer.cus_type}</b>
                      </Card>
                    </td>
                  ) : customer.cus_type.toLowerCase() == "competitor" ? (
                    <td>
                      <Card bg="info" text="dark" className="p-1">
                        <b>{customer.cus_type}</b>
                      </Card>
                    </td>
                  ) : customer.cus_type.toLowerCase() == "resigned" ? (
                    <td>
                      <Card bg="danger" text="dark" className="p-1">
                        <b>{customer.cus_type}</b>
                      </Card>
                    </td>
                  ) : (
                    <td>
                      <Card bg="warning" text="dark" className="p-1">
                        <b>{customer.cus_type}</b>
                      </Card>
                    </td>
                  )}

                  <td
                    onClick={(e) => {
                      Copy(e.target.innerText);
                    }}
                    data-bs-toggle="tooltip"
                    data-bs-placement="top"
                    title="copy email"
                  >
                    {customer.cus_email}
                  </td>
                  <td>{customer.cus_tel}</td>
                  <td>
                    <div className="d-flex justify-content-center gap-1">
                      <Button
                        variant="info"
                        onClick={() => {
                          navigate("/Project", {
                            state: {
                              cus_id: customer.cus_id,
                              cus_name: customer.cus_name,
                              co_id: customer.co_id,
                            },
                          });
                        }}
                        data-bs-toggle="tooltip"
                        data-bs-placement="top"
                        title="project"
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
                        to="/Callrecord"
                        state={{
                          cus_id: customer.cus_id,
                          co_id: customer.co_id,
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
                      <Link
                        to="/Appointment"
                        state={{
                          cus_id: `${customer.cus_id}`,
                          co_name: `${customer.co_name}`,
                          co_branch: `${customer.co_branch}`,
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
                          >
                            <path d="M4 .5a.5.5 0 0 0-1 0V1H2a2 2 0 0 0-2 2v1h16V3a2 2 0 0 0-2-2h-1V.5a.5.5 0 0 0-1 0V1H4V.5zM16 14V5H0v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2zM9.5 7h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5zm3 0h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5zM2 10.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1zm3.5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5z" />
                          </svg>
                        </Button>
                      </Link>

                      <EditCustomer
                        cus_id={customer.cus_id}
                        onSave={handleSave}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          )}
        </Table>

        {/* Pagination */}
        <PaginationComponent
          itemsPerPage={itemsPerPage}
          totalItems={customers.length}
          paginate={paginate}
          currentPage={currentPage} // ส่งตัวแปร currentPage ไปให้ Pagination
          setCurrentPage={setCurrentPage}
        />
      </div>
    </>
  );
}

export default CustomerPage;
