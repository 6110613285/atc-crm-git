import React, { useState, useEffect, useRef, useContext } from "react";
import { Button, Modal, Form, Row, Col, InputGroup } from "react-bootstrap";
import Swal from "sweetalert2";
import { Typeahead } from "react-bootstrap-typeahead";
import "react-bootstrap-typeahead/css/Typeahead.css";

import { UserContext } from "../App";

function AddAppointment(props) {
  const userInfo = useContext(UserContext);

  const [validated, setValidated] = useState(false);
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  /* Get Customer Data */
  const [customers, setCustomers] = useState([]);
  const getCustomer = async () => {
    ////console.log(id);
    try {
      if (userInfo.position == "Newsale") {
        const res = await fetch(
          `${import.meta.env.VITE_SERVER}/Customer.php?server=${
            userInfo.server_db
          }&username=${userInfo.username_db}&password=${
            userInfo.password_db
          }&db=${userInfo.name_db}&action=getnewsale&search=&userId=${
            userInfo.user_id
          }&sort=ASC`,
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
      } else {
        const res = await fetch(
          `${import.meta.env.VITE_SERVER}/Customer.php?server=${
            userInfo.server_db
          }&username=${userInfo.username_db}&password=${
            userInfo.password_db
          }&db=${userInfo.name_db}&action=get&search=&sort=ASC`,
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
      if (id) {
        const res = await fetch(
          `${import.meta.env.VITE_SERVER}/Project.php?server=${
            userInfo.server_db
          }&username=${userInfo.username_db}&password=${
            userInfo.password_db
          }&db=${userInfo.name_db}&action=getwherecusid&id=${id}status=all`,
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
          console.log("Get projet have ID" + data);
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
            }&action=getnewsale&sort=DESC&status=all&userId=${
              userInfo.user_id
            }`,
            {
              method: "GET",
            }
          );
          const data = await res.json();
          console.log("Get project => " + data);
          if (data === null) {
            setProjects([]);
          } else {
            setProjects(data);
            console.log("Get project => " + data);
          }
        } else {
          const res = await fetch(
            `${import.meta.env.VITE_SERVER}/Project.php?server=${
              userInfo.server_db
            }&username=${userInfo.username_db}&password=${
              userInfo.password_db
            }&db=${userInfo.name_db}&action=get&sort=DESC&status=all`,
            {
              method: "GET",
            }
          );
          const data = await res.json();
          console.log("Get project => " + data);
          if (data === null) {
            setProjects([]);
          } else {
            setProjects(data);
            console.log("Get project => " + data);
          }
        }
      }
    } catch (err) {
      console.log(err);
    }
  };
  const getProjectName = (id) => {
    if (projects && projects.length > 0) {
      const project = projects.find((p) => p.pj_id === id);
      return project ? project.pj_name : "";
    }
    return "";
  };
  /* Get Project Data */

  const handleSubmit = (event) => {
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    } else {
      event.preventDefault();
      event.stopPropagation();

      addAppointment();
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

    let id = `APP${yy}${month}${day}`;
    do {
      i++;
      let fullId = `${id}${i.toString().padStart(4, "0")}`;
      //console.log(fullId);
      try {
        const res = await fetch(
          `${import.meta.env.VITE_SERVER}/Appointment.php?server=${
            userInfo.server_db
          }&username=${userInfo.username_db}&password=${
            userInfo.password_db
          }&db=${userInfo.name_db}&action=getwhereappid&id=${fullId}`,
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
  const addAppointment = async () => {
    const id = await genId();
    try {
      if (props.cal_id && props.pj_id) {
        /* console.log(cal_id);
        console.log(pj_id); */
        const res = await fetch(
          `${import.meta.env.VITE_SERVER}/Appointment.php?server=${
            userInfo.server_db
          }&username=${userInfo.username_db}&password=${
            userInfo.password_db
          }&db=${userInfo.name_db}&action=insert&appointmentId=${id}&date=${
            dateRef.current.value
          }&time=${timeRef.current.value}&customerId=${
            customerRef.current.value
          }&callId=${callIdRef.current.value}&detail=${
            detailRef.current.value
          }&status=not&projectId=${props.pj_id}&user=${userInfo.user_id}`,
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
        }
      } else if (!props.cal_id && !props.pj_id && props.cus_id) {
        //console.log(projectRef.current.value);
        const res = await fetch(
          `${import.meta.env.VITE_SERVER}/Appointment.php?server=${
            userInfo.server_db
          }&username=${userInfo.username_db}&password=${
            userInfo.password_db
          }&db=${userInfo.name_db}&action=insert&appointmentId=${id}&date=${
            dateRef.current.value
          }&time=${timeRef.current.value}&customerId=${
            customerRef.current.value
          }&callId=nocall&customerId=${customerRef.current.value}&detail=${
            detailRef.current.value
          }&status=not&projectId=${
            noProject ? projectRef.current.value : project[0].pj_id
          }&user=${userInfo.user_id}`,
          {
            method: "POST",
          }
        );

        const data = await res.json();

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
      } else {
        const res = await fetch(
          `${import.meta.env.VITE_SERVER}/Appointment.php?server=${
            userInfo.server_db
          }&username=${userInfo.username_db}&password=${
            userInfo.password_db
          }&db=${userInfo.name_db}&action=insert&appointmentId=${id}&date=${
            dateRef.current.value
          }&time=${timeRef.current.value}&customerId=${
            noProject ? customer[0].cus_id : customerRef.current.value
          }&callId=nocall&&detail=${
            detailRef.current.value
          }&status=not&projectId=${
            noProject ? projectRef.current.value : project[0].pj_id
          }&user=${userInfo.user_id}`,
          {
            method: "POST",
          }
        );

        const data = await res.json();

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

  const callIdRef = useRef(null);
  const customerRef = useRef(null);
  const [cusid, setCusid] = useState("");
  console.log("SHOW  CUST  ID => " + cusid);
  const dateRef = useRef(null);
  const timeRef = useRef(null);
  const detailRef = useRef(null);

  const projectRef = useRef(null);

  const [project, setProject] = useState([]);
  const [noProject, setNoProject] = useState(false);

  const [customer, setCustomer] = useState([]);

  useEffect(() => {
    if (userInfo) {
      if (!props.cal_id) {
        getProject(props.cus_id);
      }
      if (!props.pj_id) {
        setNoProject(true);
        getCustomer();
      }
    }
  }, [props.onSave]);

  return (
    <>
      <Button
        className="fw-bold"
        variant="success"
        onClick={handleShow}
        data-bs-toggle="tooltip"
        data-bs-placement="top"
        title="add appointment data"
      >
        Add Appointment
      </Button>

      <Modal size="xl" show={show} onHide={handleClose}>
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>
              <b>Add Appointment</b>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row className="mb-1">
              {props.cal_id ? (
                <Form.Group as={Col} md="6" className="mb-3">
                  <Form.Label>
                    <b>Call</b>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={props.cal_id}
                    readOnly
                    ref={callIdRef}
                  />
                </Form.Group>
              ) : (
                <Form.Group as={Col} md="6">
                  <Form.Label>
                    <b>Project</b>
                  </Form.Label>
                  <div className="d-flex">
                    <div className="w-100 me-auto">
                      <InputGroup>
                        {noProject ? (
                          <Form.Control
                            ref={projectRef}
                            readOnly
                            type="text"
                            value={`No Project`}
                          />
                        ) : (
                          <Typeahead
                            required
                            id="basic-typeahead-single"
                            labelKey="pj_name"
                            onChange={(select) => {
                              setProject(select);
                              setCusid(
                                select.length > 0 ? select[0].cus_id : ""
                              );
                            }}
                            options={projects}
                            selected={project}
                          />
                        )}

                        {noProject ? (
                          <Button
                            variant="danger"
                            onClick={() => {
                              setNoProject((prevValue) => !prevValue);
                            }}
                          >
                            <b>X</b>
                          </Button>
                        ) : (
                          <Button
                            variant="primary"
                            onClick={() => {
                              setNoProject((prevValue) => !prevValue);

                              getCustomer();
                            }}
                          >
                            <b>No Project</b>
                          </Button>
                        )}
                      </InputGroup>
                    </div>
                  </div>
                </Form.Group>
              )}

              <Form.Group as={Col} md="6" className="mb-3">
                <Form.Label>
                  <b>Customer</b>
                </Form.Label>
                {!props.cus_id && noProject ? (
                  <Typeahead
                    required
                    id="basic-typeahead-single"
                    labelKey="cus_name"
                    onChange={async (select) => {
                      await setCustomer(select);
                    }}
                    options={customers}
                    selected={customer}
                  />
                ) : (
                  <Form.Control
                    type="text"
                    value={props.cus_id ? props.cus_id : cusid}
                    readOnly
                    ref={customerRef}
                  />
                )}
              </Form.Group>

              <Form.Group as={Col} md="3" className="mb-3">
                <Form.Label>
                  <b>Appoint Date</b>
                </Form.Label>
                <Form.Control
                  required
                  type="date"
                  placeholder=""
                  ref={dateRef}
                />
              </Form.Group>
              <Form.Group as={Col} md="3" className="mb-3">
                <Form.Label>
                  <b>Appoint Time</b>
                </Form.Label>
                <Form.Control
                  required
                  type="time"
                  placeholder=""
                  ref={timeRef}
                />
              </Form.Group>

              <Form.Group as={Col} md="6">
                <Form.Label>
                  <b>Before visit Detail</b>
                </Form.Label>
                <Form.Control
                  required
                  as="textarea"
                  type="text"
                  placeholder="Detail"
                  ref={detailRef}
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

export default AddAppointment;
