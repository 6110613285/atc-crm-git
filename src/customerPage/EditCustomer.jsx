import React, { useState, useEffect, useRef, useContext } from "react";
import { Button, Modal, Form, Row, Col } from "react-bootstrap";
import Swal from "sweetalert2";
import { UserContext } from "../App";

function EditCustomer({ cus_id, onSave }) {
  const userInfo = useContext(UserContext);

  const [validated, setValidated] = useState(false);
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  /* Get Customer Data */

  const getCustomer = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER}/Customer.php?server=${
          userInfo.server_db
        }&username=${userInfo.username_db}&password=${
          userInfo.password_db
        }&db=${userInfo.name_db}&action=getwherecusid&id=${cus_id}`,
        {
          method: "GET",
        }
      );
      const data = await res.json();
      ////console.log(data);
      if (data === null) {
      } else {
        setDataEdit(data);
      }
    } catch (err) {
      console.log(err);
    }
  };
  /* Get Customer Data */

  const handleEditCompanySubmit = (event) => {
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    } else {
      event.preventDefault();
      event.stopPropagation();

      updateCustomer();
    }
    setValidated(true);
  };

  const updateCustomer = async () => {
    //console.log("update");
    //console.log(customerNameThEdit);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER}/Customer.php?server=${
          userInfo.server_db
        }&username=${userInfo.username_db}&password=${
          userInfo.password_db
        }&db=${
          userInfo.name_db
        }&action=update&id=${cus_id}&name=${customerNameEdit}&lastname=${customerLastNameEdit}&nameth=${customerNameThEdit}&lastnameth=${customerLastNameThEdit}&email=${customerEmailEdit}&tel=${customerTelEdit}&type=${customerTypeEdit}&position=${positionEdit}`,
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
        onSave(true);
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

  const [customerNameEdit, setCustomerNameEdit] = useState("");
  const [customerNameThEdit, setCustomerNameThEdit] = useState("");
  const [customerLastNameEdit, setCustomerLastNameEdit] = useState("");
  const [customerLastNameThEdit, setCustomerLastNameThEdit] = useState("");
  const [customerEmailEdit, setCustomerEmailEdit] = useState("");
  const [customerTelEdit, setCustomerTelEdit] = useState("");
  const [customerTypeEdit, setCustomerTypeEdit] = useState("");
  const [positionEdit, setPositionEdit] = useState("");

  const setDataEdit = async (data) => {
    setCustomerNameEdit(data[0].cus_name);
    setCustomerNameThEdit(data[0].cus_name_th);
    setCustomerLastNameEdit(data[0].cus_lastname);
    setCustomerLastNameThEdit(data[0].cus_lastname_th);
    setCustomerEmailEdit(data[0].cus_email);
    setCustomerTelEdit(data[0].cus_tel);
    setCustomerTypeEdit(data[0].cus_type);
    setPositionEdit(data[0].cus_position);
  };

  useEffect(() => {
    getCustomer();
  }, [onSave]);

  return (
    <>
      <Button
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
          onSubmit={handleEditCompanySubmit}
        >
          <Modal.Header closeButton>
            <Modal.Title>Edit Customer ( {cus_id} )</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row>
              <Form.Group as={Col} md="3" className="mb-3">
                <Form.Label>
                  <b>Customer Name</b>
                </Form.Label>
                <Form.Control
                  required
                  type="text"
                  placeholder="Customer Name"
                  value={customerNameEdit}
                  onChange={(e) => {
                    setCustomerNameEdit(e.target.value);
                  }}
                />
              </Form.Group>

              <Form.Group as={Col} md="3" className="mb-3">
                <Form.Label>
                  <b>Customer last Name</b>
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Customer Name"
                  value={customerLastNameEdit}
                  onChange={(e) => {
                    setCustomerLastNameEdit(e.target.value);
                  }}
                />
              </Form.Group>

              <Form.Group as={Col} md="3" className="mb-3">
                <Form.Label>
                  <b>Customer Name TH</b>
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Customer Name TH"
                  value={customerNameThEdit}
                  onChange={(e) => {
                    setCustomerNameThEdit(e.target.value);
                  }}
                />
              </Form.Group>
              <Form.Group as={Col} md="3" className="mb-3">
                <Form.Label>
                  <b>Customer Last Name TH</b>
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Customer Name TH"
                  value={customerLastNameThEdit}
                  onChange={(e) => {
                    setCustomerLastNameThEdit(e.target.value);
                  }}
                />
              </Form.Group>

              <Form.Group as={Col} md="6" className="mb-3">
                <Form.Label>
                  <b>Email</b>
                </Form.Label>
                <Form.Control
                  required
                  type="email"
                  placeholder="Email"
                  value={customerEmailEdit}
                  onChange={(e) => {
                    setCustomerEmailEdit(e.target.value);
                  }}
                />
              </Form.Group>

              <Form.Group as={Col} md="6" className="mb-3">
                <Form.Label>
                  <b>Tel</b>
                </Form.Label>
                <Form.Control
                  required
                  type="text"
                  placeholder="Tel"
                  value={customerTelEdit}
                  onChange={(e) => {
                    setCustomerTelEdit(e.target.value);
                  }}
                />
              </Form.Group>

              <Form.Group as={Col} md="6" className="mb-3">
                <Form.Label>
                  <b>Position</b>
                </Form.Label>
                <Form.Control
                  required
                  type="text"
                  placeholder="Position"
                  value={positionEdit}
                  onChange={(e) => {
                    setPositionEdit(e.target.value);
                  }}
                />
              </Form.Group>

              <Form.Group as={Col} md="6" className="mb-3">
                <Form.Label>
                  <b>Customer Type</b>
                </Form.Label>
                <Form.Select
                  value={customerTypeEdit}
                  required
                  onChange={(e) => {
                    setCustomerTypeEdit(e.target.value);
                  }}
                >
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
            <Button variant="warning" type="submit">
              <b>Save</b>
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
}

export default EditCustomer;
