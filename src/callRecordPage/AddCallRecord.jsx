import React, { useState, useEffect, useRef, useContext } from "react";
import { Button, Modal, Form, Row, Col, InputGroup } from "react-bootstrap";
import Swal from "sweetalert2";
import { Typeahead } from "react-bootstrap-typeahead";
import "react-bootstrap-typeahead/css/Typeahead.css";

import { UserContext } from "../App";

function AddCallRecord(props) {
  const userInfo = useContext(UserContext);

  /*-------------Add Product-------------*/
  const projectNameRef = useRef(null);
  const projectDescriptionRef = useRef(null);
  const projectBudgetRef = useRef(null);
  const projectStatusRef = useRef(null);
  const projectEstPoDateRef = useRef(null);
  const projectProductTypeRef = useRef(null);
  const projectForecastMonthRef = useRef(null);

  const [showAddProject, setShowAddProject] = useState(true);

  const genProjectId = async () => {
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

  // const addProject = async () => {
  //   //console.log(projectStatusRef.current.value);
  //   try {
  //     if (!showAddProject) {
  //       const id = await genProjectId();
  //       const res = await fetch(
  //         `${import.meta.env.VITE_SERVER}/Project.php?server=${
  //           userInfo.server_db
  //         }&username=${userInfo.username_db}&password=${
  //           userInfo.password_db
  //         }&db=${userInfo.name_db}&action=insert&projectId=${id}&name=${
  //           projectNameRef.current.value
  //         }&description=${projectDescriptionRef.current.value}&status=${
  //           projectStatusRef.current.value
  //         }&user=${userInfo.user_id}&company=${
  //           props.co_id ? companyRef.current.value : company[0].co_id
  //         }&customer=${
  //           props.cus_id ? customerRef.current.value : customer[0].cus_id
  //         }&budget=${
  //           projectBudgetRef.current.value /* add budget */
  //         }&estpodate=${
  //           projectEstPoDateRef.current.value
  //         }&productType=${productType}&forecastMonth=${
  //           projectForecastMonthRef.current.value
  //         }`,
  //         {
  //           method: "POST",
  //         }
  //       );
  //       const data = await res.json();
  //       //console.log(data);
  //       if (data === "ok") {
  //         //alert("Save Success!!");
  //         //window.location.reload();
  //         Swal.fire({
  //           position: "center",
  //           icon: "success",
  //           title: "Saved Success",
  //           showConfirmButton: false,
  //           timer: 1500,
  //         });
  //         setShow(false);
  //       } else {
  //         Swal.fire({
  //           position: "center",
  //           icon: "error",
  //           title: "Some thing went wrong!!!",
  //           showConfirmButton: false,
  //           timer: 2000,
  //         });
  //       }
  //     }
  //   } catch (err) {
  //     console.log(err);
  //     Swal.fire({
  //       position: "center",
  //       icon: "error",
  //       title: "Some thing went wrong!!!",
  //       showConfirmButton: false,
  //       timer: 2000,
  //     });
  //     onSave(false);
  //   }
  //   //setCustomer2([]);
  // };

  /*-------------End Add Product-------------*/
  /* Get Product Type Data */
  const [productType, setProductType] = useState("");
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

  const [validated, setValidated] = useState(false);
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => {
    setShow(true);
    getCallTypes();
  };
  const [callType, setCallType] = useState("");

  /* Get Call Type Data */
  const [callTypes, setCallTypes] = useState([]);
  const getCallTypes = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER}/Callrecord.php?server=${
          userInfo.server_db
        }&username=${userInfo.username_db}&password=${
          userInfo.password_db
        }&db=${userInfo.name_db}&action=getcalltype`,
        {
          method: "GET",
        }
      );
      const data = await res.json();
      console.log("data222 ", data);
      if (data === null) {
        setCallTypes([]);
      } else {
        setCallTypes(data);
      }
    } catch (err) {
      console.log(err);
    }
  };
  /* Get Company Data */
  const [companies, setCompanies] = useState([]);
  const getCompany = async () => {
    try {
      if (props.co_id) {
        const res = await fetch(
          `${import.meta.env.VITE_SERVER}/Company.php?server=${
            userInfo.server_db
          }&username=${userInfo.username_db}&password=${
            userInfo.password_db
          }&db=${userInfo.name_db}&action=getwherecoid&id=${props.co_id}`,
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
          ////console.log(data[0].co_id);
        }
      } else {
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
      }
    } catch (err) {
      console.log(err);
    }
  };
  /* End Get Company Data */
  /* Get Customer Data */
  const [customers, setCustomers] = useState([]);
  const getCustomer = async (id) => {
    ////console.log(id);
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

      if (data === null) {
        setCustomers([]);
      } else {
        setCustomers(data);
        setCustomers2(data);
      }
    } catch (err) {
      console.log(err);
    }
  };
  /* End Get Customer Data */
  /* Get Project Data */
  const [projects, setProjects] = useState([]);
  const getProject = async (id) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER}/Project.php?server=${
          userInfo.server_db
        }&username=${userInfo.username_db}&password=${
          userInfo.password_db
        }&db=${userInfo.name_db}&action=getwherecusid&id=${props.cus_id}`,
        {
          method: "GET",
        }
      );
      const data = await res.json();
      console.log({ data });
      console.log(props.cus_id);
      if (data === null) {
        setProjects([]);
      } else {
        setProjects(data);
      }
    } catch (err) {
      console.log(err);
    }
  };
  const className = (id) => {
    console.log({ projects });
    if (projects || projects.length > 0) {
      const project = projects.find((p) => p.pj_id === id);
      return project ? project.pj_name : "";
    }
    return "";
  };
  /* End Get Project Data */

  const handleSubmit = (event) => {
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    } else {
      event.preventDefault();
      event.stopPropagation();

      addCallRecord();
      // addProject();
    }
    setValidated(true);
  };

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

    let id = `CAL${yy}${month}${day}`;
    do {
      i++;
      let fullId = `${id}${i.toString().padStart(4, "0")}`;
      //console.log(fullId);
      try {
        const res = await fetch(
          `${import.meta.env.VITE_SERVER}/Callrecord.php?server=${
            userInfo.server_db
          }&username=${userInfo.username_db}&password=${
            userInfo.password_db
          }&db=${userInfo.name_db}&action=getwherecalid&id=${fullId}`,
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
    //console.log("data: " + data);
    if (data != [] || data != null || data != "") {
      let cus_id = id + i.toString().padStart(4, "0");
      return cus_id;
    } else {
      let cus_id = id + "0001";
      return cus_id;
    }
  };

  const addCallRecord = async () => {
    const id = await genId();
    /* console.log(id);
    console.log(callDetailRef.current.value);
    console.log(userRef.current.value);
    console.log(companyRef.current.value);
    console.log(projectRef.current.value); */

    try {
      //----------------------------------------Add pro ject-------------------------------------------
      if (!showAddProject) {
        const id = await genProjectId();
        const res = await fetch(
          `${import.meta.env.VITE_SERVER}/Project.php?server=${
            userInfo.server_db
          }&username=${userInfo.username_db}&password=${
            userInfo.password_db
          }&db=${userInfo.name_db}&action=insert&projectId=${id}&name=${
            projectNameRef.current.value
          }&description=${projectDescriptionRef.current.value}&status=${
            projectStatusRef.current.value
          }&user=${userInfo.user_id}&company=${
            props.co_id ? companyRef.current.value : company[0].co_id
          }&customer=${
            props.cus_id ? customerRef.current.value : customer[0].cus_id
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
        //----------------------------------------END Add pro ject-------------------------------------------
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
          const res = await fetch(
            `${import.meta.env.VITE_SERVER}/Callrecord.php?server=${
              userInfo.server_db
            }&username=${userInfo.username_db}&password=${
              userInfo.password_db
            }&db=${
              userInfo.name_db
            }&action=insert&callrecordId=${id}&status=${status}&detail=${
              callDetailRef.current.value
            }&user=${userInfo.user_id}&companyId=${
              props.co_id ? companyRef.current.value : company[0].co_id
            }&customerId=${
              props.cus_id ? customerRef.current.value : customer[0].cus_id
            }&projectId=${id}&calltype=${callType}
            &nextfollowup=${nextFollowRef.current.value}`,
            {
              method: "POST",
            }
          );

          const data = await res.json();
          ////console.log(res);
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
            props.onSave(true);
          } else {
            console.log(data);
          }
          // setShow(false);
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
          `${import.meta.env.VITE_SERVER}/Callrecord.php?server=${
            userInfo.server_db
          }&username=${userInfo.username_db}&password=${
            userInfo.password_db
          }&db=${
            userInfo.name_db
          }&action=insert&callrecordId=${id}&status=${status}&detail=${
            callDetailRef.current.value
          }&user=${userInfo.user_id}&companyId=${
            props.co_id ? companyRef.current.value : company[0].co_id
          }&customerId=${
            props.cus_id ? customerRef.current.value : customer[0].cus_id
          }&projectId=${
            props.pj_id
              ? projectRef.current.value
              : noProject
              ? projectRef.current.value
              : project[0].pj_id
          }&calltype=${callType}
        &nextfollowup=${nextFollowRef.current.value}`,
          {
            method: "POST",
          }
        );

        const data = await res.json();
        ////console.log(res);
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
          props.onSave(true);
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
      props.onSave(false);
    }
  };

  const [noProject, setNoProject] = useState(false);

  const [company, setCompany] = useState([]);
  const [customer, setCustomer] = useState([]);
  const [project, setProject] = useState([]);
  const projectRef = useRef(null);
  const callDetailRef = useRef(null);
  const callTypeRef = useRef(null);
  const nextFollowRef = useRef(null);
  const [status, setStatus] = useState("รับสาย");

  const companyRef = useRef();
  const customerRef = useRef(null);

  useEffect(() => {
    getProductTypes();
    if (userInfo) {
      getCompany();
      if (props.cus_id) {
        getProject(props.cus_id);
      }
    }
  }, [props.onSave]);

  useEffect(() => {
    getCustomer(props.co_id);
  }, []);
  //---------------------------------Dynamic Input Fields----------------------------------
  const [inputFields, setInputFields] = useState([{ value: "" }]);
  const [showFieldCustomer2, setShowFieldCustomer2] = useState(true);
  const [customers2, setCustomers2] = useState([]);
  const [customer2, setCustomer2] = useState([]);

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
  return (
    <>
      <Button
        className="fw-bold"
        variant="success"
        onClick={handleShow}
        data-bs-toggle="tooltip"
        data-bs-placement="top"
        title="add call reacord data"
      >
        Add Call
      </Button>

      <Modal size="xl" show={show} onHide={handleClose}>
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>
              <b>Add Call</b>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row className="mb-1">
              {props.co_id ? (
                <Form.Group as={Col} md="6">
                  <Form.Label>
                    <b>Company</b>
                  </Form.Label>
                  <Form.Control
                    readOnly
                    required
                    type="text"
                    ref={companyRef}
                    value={props.co_id}
                  />
                </Form.Group>
              ) : (
                <Form.Group as={Col} md="6" className="mb-3">
                  <Form.Label>
                    <b>Company</b>
                  </Form.Label>
                  <Typeahead
                    required
                    id="basic-typeahead-single"
                    labelKey="co_name"
                    onChange={async (select) => {
                      setCustomer([]);
                      setProject([]);
                      await setCompany(select);
                      if (!select) {
                        getCustomer();
                      } else {
                        getCustomer(select[0].co_id);
                      }
                    }}
                    options={companies}
                    selected={company}
                  />
                </Form.Group>
              )}

              {props.cus_id ? (
                <Form.Group as={Col} md="6">
                  <Form.Label>
                    <b>Customer</b>
                  </Form.Label>
                  <Form.Control
                    readOnly
                    required
                    type="text"
                    ref={customerRef}
                    value={props.cus_id}
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
                    onChange={async (select) => {
                      await setCustomer(select);

                      if (!select) {
                        getProject();
                      } else {
                        getProject(select[0].cus_id);
                      }
                    }}
                    options={customers}
                    selected={customer}
                  />
                </Form.Group>
              )}

              {props.pj_id ? (
                // Render form elements when pj_id exists
                <>
                  <Form.Group as={Col} md="6">
                    <Form.Label>
                      <b>Project ID</b>
                    </Form.Label>
                    <Form.Control
                      readOnly
                      required
                      type="text"
                      ref={projectRef}
                      value={props.pj_id}
                    />
                  </Form.Group>
                  <Form.Group as={Col} md="6">
                    <Form.Label>
                      <b>Project Name</b>
                    </Form.Label>
                    {/* Assuming className is a function that resolves project names */}
                    <Form.Control
                      readOnly
                      required
                      type="text"
                      value={className(props.pj_id)}
                    />
                  </Form.Group>
                </>
              ) : (
                // Render form elements when pj_id doesn't exist
                <Form.Group as={Col} md="6" className="mb-3">
                  <Form.Label>
                    <b>Project</b>
                  </Form.Label>
                  <InputGroup>
                    {noProject ? (
                      // Render no project input
                      <Form.Control
                        ref={projectRef}
                        readOnly
                        type="text"
                        value={`No Project`}
                      />
                    ) : !showAddProject ? (
                      // Render Typeahead for adding project
                      <Form.Control
                        readOnly
                        type="text"
                        value={`please input filed Add Project`}
                      />
                    ) : (
                      // Render Typeahead for input
                      <Typeahead
                        required
                        id="basic-typeahead-single"
                        labelKey="pj_name"
                        onChange={setProject}
                        options={projects}
                        selected={project}
                      />
                    )}

                    {/* Buttons for toggling project visibility */}
                    {noProject ? (
                      // Render button to revert no project state
                      <Button
                        variant="danger"
                        onClick={() => {
                          setNoProject((prevValue) => !prevValue);
                          setShowAddProject(true);
                        }}
                      >
                        <b>X</b>
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="primary"
                          onClick={() => {
                            setNoProject((prevValue) => !prevValue);
                            setShowAddProject(true);
                          }}
                        >
                          <b>No Project</b>
                        </Button>
                        <Button
                          variant="success"
                          onClick={() => {
                            setShowAddProject(false);
                          }}
                        >
                          <b>Add Project</b>
                        </Button>
                      </>
                    )}
                  </InputGroup>
                </Form.Group>
              )}

              <Form.Group as={Col} md="6">
                <Form.Label>
                  <b>Status</b>
                </Form.Label>
                <Form.Select
                  required
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value);
                  }}
                >
                  <option value={"รับสาย"}>รับสาย</option>
                  <option value={"สายเข้า"}>สายเข้า</option>
                  <option value={"ไม่รับสาย"}>ไม่รับสาย</option>
                  <option value={"ไม่ว่าง"}>ไม่ว่าง</option>
                  <option value={"ติดต่อไม่ได้"}>ติดต่อไม่ได้</option>
                </Form.Select>
              </Form.Group>

              {/* <Form.Group as={Col} md="6">
                <Form.Label>
                  <b>Call Type</b>
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="call type"
                  // value={"follow up"}
                  ref={callTypeRef}
                />
              </Form.Group> */}
              <Form.Group as={Col} md="6" className="mb-3">
                <Form.Label>
                  <b>Call Type</b>
                </Form.Label>
                <Typeahead
                  //required
                  id="basic-typeahead-single"
                  labelKey="call-type"
                  onChange={setCallType}
                  value="follow up project"
                  options={callTypes.map((v) => v.call_type)}
                  selected={callType}
                  ref={callTypeRef}
                />
              </Form.Group>
              <Form.Group as={Col} md="6">
                <Form.Label>
                  <b>Next follow up</b>
                </Form.Label>
                <Form.Control
                  type="date"
                  placeholder="Next follow up"
                  ref={nextFollowRef}
                />
              </Form.Group>
              <Form.Group as={Col} md="6">
                <Form.Label>
                  <b>Call Detail</b>
                </Form.Label>
                <Form.Control
                  as="textarea"
                  type="text"
                  placeholder="Detail"
                  ref={callDetailRef}
                />
              </Form.Group>
            </Row>
            <Row hidden={showAddProject}>
              <Modal.Header>
                <Modal.Title>
                  <b>Add Project</b>
                </Modal.Title>
              </Modal.Header>
              <Row>
                {/* ---------------------------------------------------------------------------- Add Project-------------------------------------------- */}
                <Form.Group as={Col} md="6" className="mb-3">
                  <Form.Label>
                    <b>Project Name</b>
                  </Form.Label>
                  {showAddProject ? (
                    <Form.Control
                      //required
                      type="text"
                      placeholder="Project Name"
                      ref={projectNameRef}
                    />
                  ) : (
                    <Form.Control
                      required
                      type="text"
                      placeholder="Project Name"
                      ref={projectNameRef}
                    />
                  )}
                </Form.Group>

                {/* {!props.co_id ? (
                  <></>
                ) : (
                  <Form.Group as={Col} md="6" className="mb-3">
                    <Form.Label>
                      <b>Customer 2</b>
                    </Form.Label>
                    <Typeahead
                      required
                      id="basic-typeahead-single"
                      labelKey="cus_name"
                      onChange={getCustomer(props.co_id)}
                      options={customers2}
                      selected={customer} // เปลี่ยนตัวแปร
                    />
                    <button className="add-btn" onClick={handleAddFields}>
                      <span className="material-symbols-outlined add-icon">
                        Add Field Customer
                      </span>
                    </button>
                  </Form.Group>
                )} */}

                {inputFields.map((inputField, index) => (
                  <Form.Group as={Col} md="6" className="mb-3" key={index}>
                    <Form.Label>
                      <b>Customer {index === 0 ? 2 : index + 2}</b>
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

                      //     labelKey="call-type"
                      // onChange={setCallType}
                      // value="follow up project"
                      // options={callTypes.map((v) => v.call_type)}
                      // selected={callType}
                      // ref={callTypeRef}
                    />
                    {index === 0 ? (
                      <button className="add-btn" onClick={handleAddFields}>
                        <span className="material-symbols-outlined add-icon">
                          Add Field Customer
                        </span>
                      </button>
                    ) : (
                      <button
                        className="delete-btn"
                        onClick={() => handleRemoveFields(index)}
                      >
                        <span className="material-symbols-outlined delete-icon">
                          delete
                        </span>
                      </button>
                    )}
                  </Form.Group>
                ))}

                <Form.Group as={Col} md="6" className="mb-3">
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
                  {showAddProject ? (
                    <Form.Control
                      //required
                      type="number"
                      placeholder="Budget"
                      ref={projectBudgetRef}
                    />
                  ) : (
                    <Form.Control
                      required
                      type="number"
                      placeholder="Budget"
                      ref={projectBudgetRef}
                    />
                  )}
                </Form.Group>

                <Form.Group as={Col} md="6" className="mb-3">
                  <Form.Label>
                    <b>Status</b>
                  </Form.Label>
                  {showAddProject ? (
                    <Form.Select ref={projectStatusRef}>
                      {" "}
                      {/* required */}
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
                  ) : (
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
                  )}
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
              {/* ----------------------------------------------------------------------------END Add Project-------------------------------------------- */}
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

export default AddCallRecord;
