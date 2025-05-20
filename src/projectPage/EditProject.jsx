import React, { useState, useEffect, useRef, useContext } from "react";
import { Button, Form, Row, Col, Table } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";
import Swal from "sweetalert2";
import "react-bootstrap-typeahead/css/Typeahead.css";
import SortDateTime from "../components/SortDateTime";
import { UserContext } from "../App";

function EditProject({ pj_id, onSave }) {
  const userInfo = useContext(UserContext);

  const [validated, setValidated] = useState(false);
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  // const handleShow = () => {setShow(true)};

  /* Get Project Data */
  const getProject = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER}/Project.php?server=${
          userInfo.server_db
        }&username=${userInfo.username_db}&password=${
          userInfo.password_db
        }&db=${userInfo.name_db}&action=getwherepjid&id=${pj_id}`,
        {
          method: "GET",
        }
      );
      const data = await res.json();
      //console.log(data);
      if (data === null) {
        console.log("No Data");
      } else {
        setDataEdit(data);
      }
    } catch (err) {
      console.log(err);
    }
  };
  /* Get Project Data */
  /* Get Project History Data */
  const [projectHistory, setProjectHistory] = useState([]);
  const getprojectHistory = async () => {
    try {
      // if (pj_id) {
      //console.log({ cus_id });
      const res = await fetch(
        `${import.meta.env.VITE_SERVER}/Project.php?server=${
          userInfo.server_db
        }&username=${userInfo.username_db}&password=${
          userInfo.password_db
        }&db=${userInfo.name_db}&action=getpjhistory&id=${pj_id}`,
        {
          method: "GET",
        }
      );

      const data = await res.json();
      ////console.log(data);
      if (data === null) {
        setProjectHistory([]);
      } else {
        setProjectHistory(data);
      }

      // const data = await res.json();
      // ////console.log(data);
      // if (data === null) {
      //   setProjects([]);
      // } else {
      //   setProjects(data);
      // }
    } catch (err) {
      console.log(err);
    }
  };
  /* Get Project History Data */
  const handleShow = () => {
    setShow(true);
    getprojectHistory();
  };

  const handleEditProjectSubmit = (event) => {
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    } else {
      event.preventDefault();
      event.stopPropagation();

      updateProject();
    }
    setValidated(true);
  };

  const updateProject = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER}/Project.php?server=${
          userInfo.server_db
        }&username=${userInfo.username_db}&password=${
          userInfo.password_db
        }&db=${
          userInfo.name_db
        }&action=update&id=${pj_id}&name=${projectNameEdit}&description=${projectDescriptionEdit}&status=${projectStatusEdit}&budget=${projectBudgetEdit}&estpodate=${projectEstPoDateEdit}&producttype=${projectProductTypeEdit}&forecastmonth=${projectForecastMonthEdit}&editor=${
          userInfo.user_id
        }`,
        {
          method: "POST",
        }
      );

      const data = await res.json();
      //console.log(data);
      if (data === "ok") {
        //alert("Save Success!!");
        Swal.fire({
          position: "center",
          icon: "success",
          title: "Saved Success",
          showConfirmButton: false,
          timer: 1500,
        });
        setShow(false);
        onSave(true);
        //window.location.reload();
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
  };

  const [projectNameEdit, setProjectNameEdit] = useState("");
  const [projectDescriptionEdit, setProjectDescriptionEdit] = useState("");
  const [projectStatusEdit, setProjectStatusEdit] = useState("");
  const [projectBudgetEdit, setProjectBudgetEdit] = useState("");
  const [projectEstPoDateEdit, setProjectEstPoDateEdit] = useState("");
  const [projectProductTypeEdit, setProjectProductTypeEdit] = useState("");
  const [projectForecastMonthEdit, setProjectForecastMonthEdit] = useState("");

  //const [projectPjUserRef, setProjectPjUserRef] = useState("");

  const setDataEdit = async (data) => {
    setProjectNameEdit(data[0].pj_name);
    setProjectDescriptionEdit(data[0].pj_description);
    setProjectStatusEdit(data[0].pj_status);
    setProjectBudgetEdit(data[0].budget);
    setProjectEstPoDateEdit(data[0].est_po_date);
    setProjectProductTypeEdit(data[0].product_type);
    setProjectForecastMonthEdit(data[0].forecast_month);

    //setProjectPjUserRef(data[0].pj_user);
  };

  useEffect(() => {
    if (userInfo) {
      getProject();

      //console.log({ projectHistory });
      // projectHistory
    }
  }, [onSave]);

  return (
    <>
      <Button
        className="fw-bold"
        variant="warning"
        onClick={handleShow}
        data-bs-toggle="tooltip"
        data-bs-placement="top"
        title="edit"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          fill="currentColor"
          className="bi bi-pencil-fill"
          viewBox="0 0 16 16"
        >
          <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11l.178-.178z" />
        </svg>
      </Button>

      <Modal size="xl" show={show} onHide={handleClose}>
        <Form
          noValidate
          validated={validated}
          onSubmit={handleEditProjectSubmit}
        >
          <Modal.Header closeButton>
            <Modal.Title>
              <b> Edit Project ( {pj_id} ) </b>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row>
              <h3>history Edit project</h3>
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
                    <th>Edit time</th>
                    <th>Editor</th>
                    <th>Username</th>
                    {/* <th>Project ID</th> */}
                    <th>Project Name</th>
                    <th>Description</th>
                    <th>Status</th>
                    {/* <th>Customer</th>
                    <th>Company</th> */}
                    <th>Budget</th>
                    <th>Est PO Date</th>
                    <th>Product Type</th>
                    <th>Forecast Month</th>
                  </tr>
                </thead>
                {projectHistory.length === 0 ? (
                  <tbody>
                    <tr>
                      <td colSpan={13} className="fw-bold text-center">
                        No Data
                      </td>
                    </tr>
                  </tbody>
                ) : (
                  <tbody>
                    {projectHistory.map((pj_history, index) => (
                      <tr key={index + 1} className="text-center">
                        <td>{index + 1}</td>
                        <td>
                          <SortDateTime props={pj_history.pj_history_dt} />
                        </td>
                        <td>
                          <div>
                            {pj_history.fname} {pj_history.lname}{" "}
                          </div>
                          <div>
                            {pj_history.fnameth} {pj_history.lnameth}{" "}
                          </div>
                        </td>
                        <td>{pj_history.username}</td>
                        {/* <td>{pj_history.pj_id}</td> */}
                        <td>{pj_history.pj_name}</td>
                        <td>{pj_history.pj_description}</td>
                        <td>{pj_history.pj_status}</td>
                        {/* <td>{pj_history.cus_id}</td>
                        <td>{pj_history.co_id}</td> */}
                        <td>{pj_history.budget}</td>
                        <td>{pj_history.est_po_date}</td>
                        <td>{pj_history.product_type}</td>
                        <td>{pj_history.forecast_month}</td>
                      </tr>
                    ))}
                  </tbody>
                )}
              </Table>
              <hr />
            </Row>
            <Row>
              <Form.Group as={Col} md="6" className="mb-3">
                <Form.Label>
                  <b>Project Name</b>
                </Form.Label>
                <Form.Control
                  required
                  type="text"
                  placeholder="Project Name"
                  value={projectNameEdit}
                  onChange={(e) => {
                    setProjectNameEdit(e.target.value);
                  }}
                />
              </Form.Group>

              <Form.Group as={Col} md="6" className="mb-3">
                <Form.Label>
                  <b>Description</b>
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Description"
                  value={projectDescriptionEdit}
                  onChange={(e) => {
                    setProjectDescriptionEdit(e.target.value);
                  }}
                />
              </Form.Group>

              <Form.Group as={Col} md="6" className="mb-3">
                <Form.Label>
                  <b>Budget</b>
                </Form.Label>
                <Form.Control
                  // required
                  type="number"
                  placeholder="budget"
                  value={projectBudgetEdit}
                  onChange={(e) => {
                    setProjectBudgetEdit(e.target.value);
                  }}
                />
              </Form.Group>

              <Form.Group as={Col} md="6" className="mb-3">
                <Form.Label>
                  <b>Status</b>
                </Form.Label>
                <Form.Select
                  value={projectStatusEdit}
                  required
                  onChange={(e) => {
                    setProjectStatusEdit(e.target.value);
                  }}
                >
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
                  value={projectEstPoDateEdit}
                  onChange={(e) => {
                    setProjectEstPoDateEdit(e.target.value);
                  }}
                />
              </Form.Group>

              <Form.Group as={Col} md="6" className="mb-3">
                <Form.Label>
                  <b>Product Type</b>
                </Form.Label>
                <Form.Control
                  // required
                  type="text"
                  placeholder="Product Type"
                  value={projectProductTypeEdit}
                  onChange={(e) => {
                    setProjectProductTypeEdit(e.target.value);
                  }}
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
                  value={projectForecastMonthEdit}
                  onChange={(e) => {
                    setProjectForecastMonthEdit(e.target.value);
                  }}
                />
              </Form.Group>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              <b>Close</b>
            </Button>
            <Button variant="warning" type="submit">
              <b>Save</b>
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
}

export default EditProject;
