import React, { useState, useEffect, useRef, useContext } from "react";
import { Button, Modal, Form, Row, Col } from "react-bootstrap";

import { Typeahead } from "react-bootstrap-typeahead";
import "react-bootstrap-typeahead/css/Typeahead.css";
import Swal from "sweetalert2";
import { UserContext } from "../App";

function AddCustomer({ co_id, onSave }) {
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

  const [company, setCompany] = useState([]);
  const customerNameRef = useRef(null);
  const customerNameThRef = useRef(null);
  const customerLastNameRef = useRef(null);
  const customerLastNameThRef = useRef(null);
  const customerEmailRef = useRef(null);
  const customerTelRef = useRef(null);
  const customerPositionRef = useRef(null);
  const customerTypeRef = useRef(null);

  const handleSubmit = (event) => {
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    } else {
      event.preventDefault();
      event.stopPropagation();

      //console.log(companyRef.current.value);
      addCustomer();
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

    let id = `CUS${yy}${month}${day}`;

    do {
      i++;
      let fullId = `${id}${i.toString().padStart(4, "0")}`;
      //console.log(fullId);
      try {
        const res = await fetch(
          `${import.meta.env.VITE_SERVER}/Customer.php?server=${
            userInfo.server_db
          }&username=${userInfo.username_db}&password=${
            userInfo.password_db
          }&db=${userInfo.name_db}&action=getwherecusid&id=${fullId}`,
          {
            method: "GET",
          }
        );
        data = await res.json();
        //console.log("data: " + JSON.stringify(data));
      } catch (err) {
        console.log();
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

  const addCustomer = async () => {
    const id = await genId();
    //console.log(id);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER}/Customer.php?server=${
          userInfo.server_db
        }&username=${userInfo.username_db}&password=${
          userInfo.password_db
        }&db=${userInfo.name_db}&action=insert&company=${
          co_id ? co_id : company[0].co_id
        }&user=${userInfo.user_id}&customerId=${id}&name=${
          customerNameRef.current.value
        }&nameth=${customerNameThRef.current.value}&lastname=${
          customerLastNameRef.current.value
        }&lastnameth=${customerLastNameThRef.current.value}&email=${
          customerEmailRef.current.value
        }&tel=${customerTelRef.current.value}&position=${
          customerPositionRef.current.value
        }&type=${customerTypeRef.current.value}`,
        {
          method: "POST",
        }
      );

      const data = await res.json();
      //console.log(data);
      if (data === "ok") {
        ///alert("Save Success!!");
        //window.location.reload();
        Swal.fire({
          position: "center",
          icon: "success",
          title: "Saved Success",
          showConfirmButton: false,
          timer: 1500,
        });
        setShow(false);
        onSave(true);
      } else {
        console.log(data);
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

  useEffect(() => {
    if (userInfo) {
      getCompany();
    }
  }, [onSave]);

  return (
    <>
      <Button
        className="fw-bold"
        variant="success"
        onClick={handleShow}
        data-bs-toggle="tooltip"
        data-bs-placement="top"
        title="add customer data"
      >
        Add Customer
      </Button>

      <Modal size="xl" show={show} onHide={handleClose}>
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>
              <b>Add Customer</b>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row className="mb-1">
              <Form.Group as={Col} md="6" className="mb-3">
                <Form.Label>
                  <b>Company</b>
                </Form.Label>
                {co_id ? (
                  <Form.Control required readOnly type="text" value={co_id} />
                ) : (
                  <Typeahead
                    required
                    id="basic-typeahead-single"
                    labelKey="co_name"
                    onChange={setCompany}
                    options={companies}
                    selected={company}
                  />
                )}
              </Form.Group>

              <Form.Group as={Col} md="3" className="mb-3">
                <Form.Label>
                  <b>Customer Name</b>
                </Form.Label>
                <Form.Control
                  required
                  type="text"
                  placeholder="Customer Name"
                  ref={customerNameRef}
                />
              </Form.Group>

              <Form.Group as={Col} md="3" className="mb-3">
                <Form.Label>
                  <b>Customer Last Name</b>
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Customer Last Name"
                  ref={customerLastNameRef}
                />
              </Form.Group>

              <Form.Group as={Col} md="3" className="mb-3">
                <Form.Label>
                  <b>Customer Name TH</b>
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Customer Name TH"
                  ref={customerNameThRef}
                />
              </Form.Group>

              <Form.Group as={Col} md="3" className="mb-3">
                <Form.Label>
                  <b>Customer Last Name TH</b>
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Customer Last Name TH"
                  ref={customerLastNameThRef}
                />
              </Form.Group>

              <Form.Group as={Col} md="6" className="mb-3">
                <Form.Label>
                  <b>Customer Email</b>
                </Form.Label>
                <Form.Control
                  required
                  type="text"
                  placeholder="Customer Email"
                  ref={customerEmailRef}
                />
              </Form.Group>

              <Form.Group as={Col} md="6">
                <Form.Label>
                  <b>Customer Tel</b>
                </Form.Label>
                <Form.Control
                  required
                  type="text"
                  placeholder="Customer Tel"
                  ref={customerTelRef}
                />
              </Form.Group>

              <Form.Group as={Col} md="3">
                <Form.Label>
                  <b>Customer Position</b>
                </Form.Label>
                <Form.Control
                  required
                  type="text"
                  placeholder="Position"
                  ref={customerPositionRef}
                />
              </Form.Group>

              <Form.Group as={Col} md="3" className="mb-3">
                <Form.Label>
                  <b>Customer Type</b>
                </Form.Label>
                <Form.Select ref={customerTypeRef} required>
                  <option value={""}>--Select Customer Type--</option>
                  <option value={"Dicision Maker"}>Dicision Maker</option>
                  <option value={"Key Person"}>Key Person</option>
                  <option value={"Competitor"}>Competitor</option>
                  <option value={"Current Customer"}>Current Customer</option>
                  <option value={"Focus"}>Focus</option>
                  <option value={"Resigned"}>Resigned</option>
                  <option value={"Other"}>Other</option>
                </Form.Select>
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

export default AddCustomer;
