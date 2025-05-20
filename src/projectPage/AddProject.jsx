import React, { useState, useEffect, useRef, useContext } from "react";
import { Button, Modal, Form, Row, Col } from "react-bootstrap";
import Swal from "sweetalert2";
import { Typeahead } from "react-bootstrap-typeahead";
import "react-bootstrap-typeahead/css/Typeahead.css";

import { UserContext } from "../App";
import { CloudFog, CloudSlash } from "react-bootstrap-icons";

function AddProject({ cus_id, co_id, onSave }) {
  const [company, setCompany] = useState([]);
  const [customer, setCustomer] = useState([]);
  const [customer2, setCustomer2] = useState([]);
  const [productType, setProductType] = useState("");
  const customerRef = useRef(null);
  const projectNameRef = useRef(null);
  const projectDescriptionRef = useRef(null);
  const projectBudgetRef = useRef(null);
  const projectStatusRef = useRef(null);
  const projectEstPoDateRef = useRef(null);
  const projectProductTypeRef = useRef(null);
  const projectForecastMonthRef = useRef(null);
  const userInfo = useContext(UserContext);

  const [validated, setValidated] = useState(false);
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

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
          }&db=${userInfo.name_db}&action=getnewsale&userId=${
            userInfo.user_id
          }&sort=ASC`,
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
  /* Get Company Data */

  /* Get Customer Data */
  const [customers, setCustomers] = useState([]);
  const [customers2, setCustomers2] = useState([]);
  const getCustomer = async (id) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER}/Customer.php?server=${
          userInfo.server_db
        }&username=${userInfo.username_db}&password=${
          userInfo.password_db
        }&db=${userInfo.name_db}&action=getwherecoid&id=${id}`,
        {
          method: "GET",
        }
      );
      const data = await res.json();
      /////console.log(data);
      if (data === null) {
        // console.log("No Data");
        setCustomers([]);
      } else {
        setCustomers(data);
        setCustomers2(data);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const getCustomerCompany = (id) => {
    if (customers && customers.length > 0) {
      const customer = customers.find((c) => c.cus_id === id);
      //console.log(customer.cus_name);
      return customer ? customer.co_id : "";
    }
    return "";
  };
  /* Get Customer Data */

  /* Get Product Type Data */
  const [productTypes, setProductTypes] = useState([]);
  const getProductTypes = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER}/Project.php?server=${
          userInfo.server_db
        }&username=${userInfo.username_db}&password=${
          userInfo.password_db
        }&db=${userInfo.name_db}&action=getpjtype`,
        {
          method: "GET",
        }
      );
      const data = await res.json();
      // console.log("data222 ", data);
      if (data === null) {
        setProductTypes([]);
      } else {
        setProductTypes(data);
      }
    } catch (err) {
      console.log(err);
    }
  };
  /* Get Product Type Data  */

  const genId = async () => {
    let date = new Date();
    let day = String(date.getDate()).padStart(2, "0");
    let month = String(date.getMonth() + 1).padStart(2, "0"); //January is 0!
    let year = `${date.getFullYear()}`;

    const ySplit = year.split("", 4);
    const yy = ySplit[2] + ySplit[3];

    let i = 0;
    let data;
    let num;

    let id = `PJ${yy}${month}${day}`;
    do {
      i++;
      let fullId = `${id}${i.toString().padStart(4, "0")}`;
      //console.log(fullId);
      try {
        const res = await fetch(
          `${import.meta.env.VITE_SERVER}/Project.php?server=${
            userInfo.server_db
          }&username=${userInfo.username_db}&password=${
            userInfo.password_db
          }&db=${userInfo.name_db}&action=getwherepjid&id=${fullId}`,
          {
            method: "GET",
          }
        );
        data = await res.json();
        //console.log("data: " + JSON.stringify(data));
      } catch (err) {
        console.log(err);
      }

      if (data == [] || data == null || data == "") {
        //console.log(0);
        num = 0;
      } else {
        //console.log(1);
        num = 1;
      }
    } while (num == 1);
    //console.log("data: " + data)
    if (data != [] || data != null || data != "") {
      let pj_id = id + i.toString().padStart(4, "0");
      return pj_id;
    } else {
      let pj_id = id + "0001";
      return pj_id;
    }
  };

  const addProject = async () => {
    const id = await genId();
    //console.log(projectStatusRef.current.value);
    try {
      if (cus_id) {
        const res = await fetch(
          `${import.meta.env.VITE_SERVER}/Project.php?server=${
            userInfo.server_db
          }&username=${userInfo.username_db}&password=${
            userInfo.password_db
          }&db=${userInfo.name_db}&action=insert&projectId=${id}&name=${
            projectNameRef.current.value
          }&description=${projectDescriptionRef.current.value}&status=${
            projectStatusRef.current.value
          }&user=${userInfo.user_id}&customer=${cus_id}&company=${
            co_id /* getCustomerCompany(cus_id) */
          }&budget=${
            projectBudgetRef.current.value /* add budget */
          }&estpodate=${
            projectEstPoDateRef.current.value
          }&productType=${productType}&forecastMonth=${
            projectForecastMonthRef.current.value
          }`,
          {
            method: "POST",
          }
        );
        const data = await res.json();
        //console.log(data);
        if (data === "ok") {
          //alert("Save Success!!");
          //window.location.reload();
          Swal.fire({
            position: "center",
            icon: "success",
            title: "Saved Success",
            showConfirmButton: false,
            timer: 1500,
          });
          setShow(false);
        } else {
          Swal.fire({
            position: "center",
            icon: "error",
            title: "Some thing went wrong!!!",
            showConfirmButton: false,
            timer: 2000,
          });
        }
      } else {
        const res = await fetch(
          `${import.meta.env.VITE_SERVER}/Project.php?server=${
            userInfo.server_db
          }&username=${userInfo.username_db}&password=${
            userInfo.password_db
          }&db=${userInfo.name_db}&action=insert&projectId=${id}&name=${
            projectNameRef.current.value
          }&description=${projectDescriptionRef.current.value}&status=${
            projectStatusRef.current.value
          }&user=${userInfo.user_id}&customer=${customer[0].cus_id}&company=${
            co_id ? co_id : company[0].co_id
          }&budget=${projectBudgetRef.current.value}&estpodate=${
            projectEstPoDateRef.current.value
          }&productType=${productType}&forecastMonth=${
            projectForecastMonthRef.current.value
          }`,
          {
            method: "POST",
          }
        );
        const data = await res.json();
        //console.log(data);
        if (data === "ok") {
          //--------------------Start customer2-----------------------------------------------------------------------------

          for (let i = 0; i < customer2.length; i++) {
            const selectedCustomer = customer2[i];
            if (selectedCustomer.cus_id != customer.cus_id) {
              const res_customer2 = await fetch(
                `${import.meta.env.VITE_SERVER}/Customer.php?server=${
                  userInfo.server_db
                }&username=${userInfo.username_db}&password=${
                  userInfo.password_db
                }&db=${
                  userInfo.name_db
                }&action=insertcustomerpj&projectId=${id}&customer=${
                  selectedCustomer.cus_id
                }`,
                {
                  method: "POST",
                }
              );
              const data_customer2 = await res_customer2.json();
            }
          }

          //--------------------End customer2-----------------------------------------------------------------------------
          //alert("Save Success!!");
          Swal.fire({
            position: "center",
            icon: "success",
            title: "Saved Success",
            showConfirmButton: false,
            timer: 1500,
          });
          //window.location.reload();
          setShow(false);
          onSave(true);
        } else {
          console.log(data);
        }
      }
    } catch (err) {
      console.log(err);
      Swal.fire({
        position: "center",
        icon: "error",
        title: "Some thing went wrong!!!",
        showConfirmButton: false,
        timer: 2000,
      });
      onSave(false);
    }
    setCustomer2([]);
  };

  const handleSubmit = (event) => {
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    } else {
      event.preventDefault();
      event.stopPropagation();

      addProject();
    }
    setValidated(true);
  };

  useEffect(() => {
    if (userInfo) {
      getProductTypes();

      if (!cus_id) {
        getCompany();
      }
      if (co_id) {
        getCustomer(co_id);
      }
    }
    // console.log({ productTypes });
  }, [show]);
  //---------------------------------Dynamic Input Fields----------------------------------
  const [inputFields, setInputFields] = useState([{ value: "" }]);
  const [showFieldCustomer2, setShowFieldCustomer2] = useState(true);

  // Function to add a new input field
  const handleAddFields = () => {
    setInputFields([...inputFields, { value: "" }]);
    setShowFieldCustomer2(false);
  };
  // Define the handleCustomerChange function
  const handleCustomerChange = (index, selected) => {
    // Create a copy of the existing customer state
    const updatedCustomers = [...customer2];

    // Update the selected customer for the specified index
    updatedCustomers[index] = selected[0]; // Assuming only one customer can be selected

    // Set the updated state
    setCustomer2(updatedCustomers);
  };
  // Function to remove an input field by index
  const handleRemoveFields = (index) => {
    const newInputFields = [...inputFields];
    newInputFields.splice(index, 1);
    setInputFields(newInputFields);
  };

  // Function to update the value of an input field
  const handleValueChange = (index, event) => {
    const values = [...inputFields];
    values[index].value = event.target.value;
    setInputFields(values);
  };
  //---------------------------------End Dynamic Input Fields----------------------------------
  // console.log({ productType });
  return (
    <>
      <Button
        className="fw-bold"
        variant="success"
        onClick={handleShow}
        data-bs-toggle="tooltip"
        data-bs-placement="top"
        title="add project data"
      >
        Add Project
      </Button>

      <Modal size="lg" show={show} onHide={handleClose}>
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>
              <b>Add Project </b>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row>
              {!cus_id && !co_id ? (
                <Form.Group as={Col} md="6" className="mb-3">
                  <Form.Label>
                    <b>Company</b>
                  </Form.Label>
                  <Typeahead
                    required
                    id="basic-typeahead-single"
                    labelKey="co_name"
                    onChange={(select) => {
                      try {
                        if (select) {
                          setCompany(select);
                          getCustomer(select[0].co_id);
                        }
                      } catch (err) {}
                    }}
                    options={companies}
                    selected={company}
                  />
                </Form.Group>
              ) : co_id ? (
                <Form.Group as={Col} md="6" className="mb-3">
                  <Form.Label>
                    <b>Company</b>
                  </Form.Label>
                  <Form.Control
                    readOnly
                    required
                    type="text"
                    placeholder="Project Name"
                    value={co_id}
                  />
                </Form.Group>
              ) : (
                <></>
              )}

              {cus_id ? (
                <Form.Group as={Col} md="6" className="mb-3">
                  <Form.Label>
                    <b>Customer</b>
                  </Form.Label>
                  <Form.Control
                    readOnly
                    required
                    type="text"
                    placeholder="Project Name"
                    value={cus_id}
                    ref={customerRef}
                  />
                </Form.Group>
              ) : (
                <Form.Group as={Col} md="6" className="mb-3">
                  <Form.Label>
                    <b>Customer</b>
                  </Form.Label>
                  <Typeahead
                    required
                    id="basic-typeahead-single"
                    labelKey="cus_name"
                    onChange={setCustomer}
                    options={customers}
                    selected={customer}
                  />

                  <button className="btn btn-success" onClick={handleAddFields}>
                    <b>Add Field Customer</b>
                  </button>
                </Form.Group>
              )}
              {showFieldCustomer2 === false ? (
                inputFields.map((inputField, index) => (
                  <Form.Group
                    as={Col}
                    md="6"
                    className="mb-3"
                    key={index}
                    hidden={showFieldCustomer2}
                  >
                    <Form.Label>
                      <b>Customer {index + 2}</b>
                    </Form.Label>
                    <Typeahead
                      required
                      id={`typeahead-${index}`}
                      labelKey="cus_name"
                      onChange={(selected) =>
                        handleCustomerChange(index, selected)
                      }
                      options={customers2}
                      value={customer2[index]} // Make sure to use the selected value for the corresponding index
                    />
                    <button
                      className="btn btn-danger"
                      onClick={() => handleRemoveFields(index)}
                    >
                      <b className="material-symbols-outlined delete-icon">
                        delete
                      </b>
                    </button>
                  </Form.Group>
                ))
              ) : (
                <></>
              )}
              <Form.Group as={Col} md="6" className="mb-3">
                <Form.Label>
                  <b>Project Name</b>
                </Form.Label>
                <Form.Control
                  required
                  type="text"
                  placeholder="Project Name"
                  ref={projectNameRef}
                />
              </Form.Group>

              <Form.Group as={Col} md="6">
                <Form.Label>
                  <b>Description</b>
                </Form.Label>
                <Form.Control
                  as="textarea"
                  type="text"
                  placeholder="Description"
                  ref={projectDescriptionRef}
                />
              </Form.Group>

              <Form.Group as={Col} md="6">
                <Form.Label>
                  <b>Budget</b>
                </Form.Label>
                <Form.Control
                  required
                  type="number"
                  placeholder="Budget"
                  ref={projectBudgetRef}
                />
              </Form.Group>

              <Form.Group as={Col} md="6" className="mb-3">
                <Form.Label>
                  <b>Status</b>
                </Form.Label>
                <Form.Select ref={projectStatusRef} required>
                  <option value={""}>--Select Status--</option>
                  <option value={"สนใจ"}>สนใจ</option>
                  <option value={"มีโปรเจค/follow-up"}>
                    มีโปรเจค/follow-up
                  </option>
                  <option value={"ขอBudget"}>ขอBudget</option>
                  <option value={"กำลังเปรียบเทียบราคา"}>
                    กำลังเปรียบเทียบราคา
                  </option>
                  <option value={"รออนุมัติ"}>รออนุมัติ</option>
                  <option value={"ปิดโปรเจค"}>ปิดโปรเจค</option>
                  <option value={"เสียโปรเจค"}>เสียโปรเจค</option>
                  <option value={"PO Received"}>PO Received</option>
                  <option value={"Delivered"}>Delivered</option>
                </Form.Select>
              </Form.Group>

              <Form.Group as={Col} md="6">
                <Form.Label>
                  <b>Est PO Date</b>
                </Form.Label>
                <Form.Control
                  type="date"
                  placeholder="Est PO Date"
                  ref={projectEstPoDateRef}
                />
              </Form.Group>

              {/* <Form.Group as={Col} md="6" className="mb-3">
                <Form.Label>
                  <b>Product Type</b>
                </Form.Label>
                <Form.Control
                  // required
                  type="text"
                  placeholder="Product Type"
                  ref={projectProductTypeRef}
                />
              </Form.Group> */}

              <Form.Group as={Col} md="6" className="mb-3">
                <Form.Label>
                  <b>Product Type</b>
                </Form.Label>
                <Typeahead
                  //required
                  id="basic-typeahead-single"
                  labelKey="product-type"
                  onChange={setProductType}
                  options={productTypes.map((v) => v.product_type)}
                  selected={productType}
                  ref={projectProductTypeRef}
                />
              </Form.Group>
              {/* {productTypes.length === 0 ? (
                <Form.Group as={Col} md="6" className="mb-3">
                  <Form.Label>
                    <b>Pj type</b>
                  </Form.Label>
                  <Form.Control
                    //required
                    type="text"
                    placeholder="Project Type"
                    // value={cus_id}
                    ref={projectProductTypeRef}
                  />
                </Form.Group>
              ) : (
                <Form.Group as={Col} md="6" className="mb-3">
                  <Form.Label>
                    <b>PJ type</b>
                  </Form.Label>
                  <Typeahead
                    //required
                    id="basic-typeahead-single"
                    labelKey="product type"
                    // onChange={setProductType}
                    options={productTypes}
                    // selected={productType}
                  />
                </Form.Group>
              )} */}

              <Form.Group as={Col} md="6" className="mb-3">
                <Form.Label>
                  <b>Forecast Month</b>
                </Form.Label>
                <Form.Control
                  // required
                  type="month"
                  placeholder="Select Month and Year"
                  ref={projectForecastMonthRef}
                />
              </Form.Group>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              <b>Close</b>
            </Button>
            <Button variant="success" type="submit">
              <b>Save</b>
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
}

export default AddProject;
