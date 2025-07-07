import React, { useState, useContext } from "react";
import { Container, Row, Col, Form, Button, InputGroup } from "react-bootstrap";
import Swal from "sweetalert2";
import svgLogo from "../assets/atc-logo.svg";

const LoginPage = () => {
  const [validated, setValidated] = useState(false);

  const [formData, setFormData] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.preventDefault();
      e.stopPropagation();
    } else {
      e.preventDefault();
      setLoading(true);

      try {
        const response = await fetch(
          `${import.meta.env.VITE_SERVER}/Login.php`,
          {
            method: "POST",
            //headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
          }
        );
        const data = await response.json();
        console.log({ data });
        if (data && data.login === true && data.status === "activation") {
          localStorage.setItem("isLoggedIn", data.login);
          localStorage.setItem("token", data.data.token);
          localStorage.setItem("fullname", data.data.fullname);
          localStorage.setItem("level", data.data.level);
          localStorage.setItem("Roleuser" , data.data.Roleuser);
          /* localStorage.setItem("id", data.data.user_id);
          localStorage.setItem("tel", data.data.tel);
          localStorage.setItem("email", data.data.email);
          localStorage.setItem("status", data.data.status); */
          //localStorage.setItem("fullnameth", data.data.fullnameth);
          //localStorage.setItem("department", data.data.department);
          //localStorage.setItem("position", data.data.position);
          //console.log(localStorage);

          window.location = "/ERP/Selectpage";
          //window.location = "/Home";

          setLoading(false);
        } else {
          //console.log(data);
          setLoading(false);

          if (data === "0") {
            //alert("You don't have permission to login.");
            Swal.fire({
              position: "center",
              icon: "error",
              title: "You don't have permission to login.",
              confirmButtonColor: "#0d6efd",
              showConfirmButton: true,
              //timer: 2000,
            });
          } else {
            //alert("Something went wrong");
            Swal.fire({
              position: "center",
              icon: "error",
              title: "Some thing went wrong!!!\nPlease check and try again",
              confirmButtonColor: "#0d6efd",
              showConfirmButton: true,
              //timer: 2000,
            });
          }
        }
      } catch (error) {
        console.error(error);
        Swal.fire({
          position: "center",
          icon: "error",
          title: "Some thing went wrong!!!\nPlease check and try again",
          confirmButtonColor: "#0d6efd",
          showConfirmButton: true,
          //timer: 2000,
        });
        setLoading(false);
      }
    }
    setValidated(true);
  };

  const [showPass, setShowPass] = useState(false);

  return (
    <>
      <Container fluid className="bg-dark">
        <Row className="justify-content-center align-items-center vh-100">
          <Col lg={3} md={10} sm={8}>
            {/* <Card className="p-5 bg-dark"> */}
            <div className="text-center mb-5">
              <img src={svgLogo} className="img-fluid" />
            </div>

            <Form noValidate validated={validated} onSubmit={handleSubmit}>
              <Form.Group as={Col} md="12" className="mb-3">
                <Form.Label>
                  <b className="text-light">Username</b>
                </Form.Label>
                <Form.Control
                  required
                  type="text"
                  placeholder="Username"
                  name="username"
                  onChange={handleChange}
                />
                <Form.Control.Feedback type="invalid">
                  <b>Please Enter Username.</b>
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group as={Col} md="12" className="mb-3">
                <Form.Label>
                  <b className="text-light">Password</b>
                </Form.Label>
                {showPass ? (
                  <InputGroup className="mb-3">
                    <Form.Control
                      required
                      type="text"
                      placeholder="Password"
                      name="password"
                      onChange={handleChange}
                    />
                    <InputGroup.Text
                      onClick={() => {
                        setShowPass((prevValue) => !prevValue);
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="26"
                        height="26"
                        fill="currentColor"
                        className="bi bi-eye-slash-fill"
                        viewBox="0 0 16 16"
                      >
                        <path d="m10.79 12.912-1.614-1.615a3.5 3.5 0 0 1-4.474-4.474l-2.06-2.06C.938 6.278 0 8 0 8s3 5.5 8 5.5a7.029 7.029 0 0 0 2.79-.588zM5.21 3.088A7.028 7.028 0 0 1 8 2.5c5 0 8 5.5 8 5.5s-.939 1.721-2.641 3.238l-2.062-2.062a3.5 3.5 0 0 0-4.474-4.474L5.21 3.089z" />
                        <path d="M5.525 7.646a2.5 2.5 0 0 0 2.829 2.829l-2.83-2.829zm4.95.708-2.829-2.83a2.5 2.5 0 0 1 2.829 2.829zm3.171 6-12-12 .708-.708 12 12-.708.708z" />
                      </svg>
                    </InputGroup.Text>
                  </InputGroup>
                ) : (
                  <InputGroup className="mb-3">
                    <Form.Control
                      required
                      type="password"
                      placeholder="Password"
                      name="password"
                      onChange={handleChange}
                    />
                    <InputGroup.Text
                      onClick={() => {
                        setShowPass((prevValue) => !prevValue);
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="26"
                        height="26"
                        fill="currentColor"
                        className="bi bi-eye-fill"
                        viewBox="0 0 16 16"
                      >
                        <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z" />
                        <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" />
                      </svg>
                    </InputGroup.Text>
                  </InputGroup>
                )}

                <Form.Control.Feedback type="invalid">
                  <b>Please Enter Password.</b>
                </Form.Control.Feedback>
              </Form.Group>
              <Col md="12">
                <Button className="w-100" type="submit" disabled={loading}>
                  {loading ? "Loading..." : <b>Login</b>}
                </Button>
              </Col>
            </Form>
            {/*   </Card> */}
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default LoginPage;
