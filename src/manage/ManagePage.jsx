import React from "react";
import { Container, Card, Form, Col, Row } from "react-bootstrap";
import { useRef, useEffect, useState } from "react";

function ManagePage() {
  const [validated, setValidated] = useState(false);
  ////console.log(localStorage.token);
  useEffect(() => {
    getUser();
  }, []);

  /* Get User Data */
  const getUser = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER}/User.php?action=getwheretoken&token=${
          localStorage.token
        }`,
        {
          method: "GET",
        }
      );
      const data = await res.json();
      //console.log(data);
      if (data === null) {
      } else {
        nameRef.current.value = data[0].fname;
        surNameRef.current.value = data[0].lname;
        nameThRef.current.value = data[0].fnameth;
        surNameThRef.current.value = data[0].lnameth;
        departmentRef.current.value = data[0].department;
        positionRef.current.value = data[0].position;
        telRef.current.value = data[0].tel;
      }
    } catch (err) {
      console.log(err);
    }
  };
  /* End Get User Data */

  const nameRef = useRef(null);
  const surNameRef = useRef(null);
  const nameThRef = useRef(null);
  const surNameThRef = useRef(null);
  const departmentRef = useRef(null);
  const positionRef = useRef(null);
  const telRef = useRef(null);

  const [readonly, setReadonly] = useState(true);

  const handleSubmit = (event) => {
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    } else {
      event.preventDefault();
      event.stopPropagation();

      updateUserInfo();
    }
    setValidated(true);
  };

  const updateUserInfo = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER}/User.php?action=update&name=${
          nameRef.current.value
        }&surname=${surNameRef.current.value}&nameth=${
          nameThRef.current.value
        }&surnameth=${surNameThRef.current.value}&department=${
          departmentRef.current.value
        }&position=${positionRef.current.value}&tel=${
          telRef.current.value
        }&token=${localStorage.token}`,
        {
          method: "POST",
        }
      );

      const data = await res.json();
      //console.log(data);
      if (data === "ok") {
        alert("Save Success!!");
        window.location.reload();
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <Container>
        <h1>Manage Page</h1>
        <Card id="card" className="mt-5 px-5 py-3">
          <div className="d-flex justify-content-between mb-3">
            <h3>User Info</h3>
            <div className="d-flex justify-content-end align-items-center">
              <button
                id="buttonEdit"
                className="fw-bold btn btn-warning"
                onClick={() => {
                  setReadonly((prevState) => !prevState);
                  if (readonly) {
                    document.getElementById("card").style.backgroundColor =
                      "gold";
                    document.getElementById("buttonEdit").textContent = "X";
                  } else {
                    document.getElementById("card").style.backgroundColor =
                      "white";
                    document.getElementById("buttonEdit").textContent = "Edit";
                  }
                }}
              >
                Edit
              </button>
            </div>
          </div>
          <Form noValidate validated={validated} onSubmit={handleSubmit}>
            <Row>
              <Form.Group as={Col} md="6" className="mb-3">
                <Form.Label>
                  <b>Name</b>
                </Form.Label>
                {readonly ? (
                  <Form.Control
                    readOnly
                    required
                    type="text"
                    placeholder="Name"
                    ref={nameRef}
                  />
                ) : (
                  <Form.Control
                    required
                    type="text"
                    placeholder="Name"
                    ref={nameRef}
                  />
                )}

                <Form.Control.Feedback type="invalid">
                  <b>Please Enter Name.</b>
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group as={Col} md="6" className="mb-3">
                <Form.Label>
                  <b>Surname</b>
                </Form.Label>
                {readonly ? (
                  <Form.Control
                    readOnly
                    required
                    type="text"
                    placeholder="Surname"
                    ref={surNameRef}
                  />
                ) : (
                  <Form.Control
                    required
                    type="text"
                    placeholder="Surname"
                    ref={surNameRef}
                  />
                )}
                <Form.Control.Feedback type="invalid">
                  <b>Please Enter Surname.</b>
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group as={Col} md="6" className="mb-3">
                <Form.Label>
                  <b>Name TH</b>
                </Form.Label>
                {readonly ? (
                  <Form.Control
                    readOnly
                    required
                    type="text"
                    placeholder="Name TH"
                    ref={nameThRef}
                  />
                ) : (
                  <Form.Control
                    required
                    type="text"
                    placeholder="Name TH"
                    ref={nameThRef}
                  />
                )}

                <Form.Control.Feedback type="invalid">
                  <b>Please Enter Name TH</b>
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group as={Col} md="6" className="mb-3">
                <Form.Label>
                  <b>Surname TH</b>
                </Form.Label>
                {readonly ? (
                  <Form.Control
                    readOnly
                    required
                    type="text"
                    placeholder="Surname TH"
                    ref={surNameThRef}
                  />
                ) : (
                  <Form.Control
                    required
                    type="text"
                    placeholder="Surname TH"
                    ref={surNameThRef}
                  />
                )}

                <Form.Control.Feedback type="invalid">
                  <b>Please Enter Surname TH</b>
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group as={Col} md="6" className="mb-3">
                <Form.Label>
                  <b>Department</b>
                </Form.Label>
                {readonly ? (
                  <Form.Control
                    readOnly
                    required
                    type="text"
                    placeholder="Department"
                    ref={departmentRef}
                  />
                ) : (
                  <Form.Control
                    required
                    type="text"
                    placeholder="Department"
                    ref={departmentRef}
                  />
                )}
                <Form.Control.Feedback type="invalid">
                  <b>Please Enter Department</b>
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group as={Col} md="6" className="mb-3">
                <Form.Label>
                  <b>Position</b>
                </Form.Label>
                {readonly ? (
                  <Form.Control
                    readOnly
                    required
                    type="text"
                    placeholder="Position"
                    ref={positionRef}
                  />
                ) : (
                  <Form.Control
                    required
                    type="text"
                    placeholder="Position"
                    ref={positionRef}
                  />
                )}

                <Form.Control.Feedback type="invalid">
                  <b>Please Enter Position</b>
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group as={Col} md="6" className="mb-3">
                <Form.Label>
                  <b>Tel</b>
                </Form.Label>
                {readonly ? (
                  <Form.Control
                    readOnly
                    required
                    type="text"
                    placeholder="Tel"
                    ref={telRef}
                  />
                ) : (
                  <Form.Control
                    required
                    type="number"
                    placeholder="Tel"
                    ref={telRef}
                  />
                )}

                <Form.Control.Feedback type="invalid">
                  <b>Please Enter Tel</b>
                </Form.Control.Feedback>
              </Form.Group>
              <Col className="d-flex align-items-center mt-3">
                {readonly ? (
                  <></>
                ) : (
                  <button className="btn btn-success" type="submit">
                    Save
                  </button>
                )}
              </Col>
            </Row>
          </Form>
        </Card>
      </Container>
    </>
  );
}

export default ManagePage;
