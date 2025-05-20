import React, { useState, useEffect, useRef, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Button,
  Form,
  Row,
  Col,
  Table,
  Card,
  InputGroup,
} from "react-bootstrap";
import Swal from "sweetalert2";
import { Typeahead } from "react-bootstrap-typeahead";

import { UserContext } from "../App";

function QuotationView() {
  const userInfo = useContext(UserContext);

  const location = useLocation();
  const navigate = useNavigate();

  let qo_id = localStorage.getItem("qo_id");
  let pj_id = localStorage.getItem("pj_id");
  let cus_id = localStorage.getItem("cus_id");
  let co_id = localStorage.getItem("co_id");
  // if (location.state) {

  //   pj_id = location.state.pj_id;
  //   cus_id = location.state.cus_id;
  //   co_id = location.state.co_id;
  // }
  ////console.log(co_id);

  useEffect(() => {
    if (userInfo) {
      getQuotation();
      getProject();
      getCustomer();
      getCompany();
      getQoProduct();
      getSales();
    }
  }, [location, userInfo]);
  /* Get Quotation Data */
  const [quotation, setQuotation] = useState([]);
  const getQuotation = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER}/Quotation.php?server=${
          userInfo.server_db
        }&username=${userInfo.username_db}&password=${
          userInfo.password_db
        }&db=${userInfo.name_db}&action=getwhereqoid&id=${qo_id}`,
        {
          method: "GET",
        }
      );
      const data = await res.json();
      //console.log(data);
      if (data === null) {
        setQuotation([]);
      } else {
        setQuotation(data);

        //currencyRef.current.value = data[0].currency;
        dateRef.current.value = data[0].qo_issue_date;
        quotationvalidunitRef.current.value = data[0].qo_validunit;
        quotationvalidunitunitRef.current.value = data[0].qo_validunit_unit;
        credittermRef.current.value = data[0].qo_creditterm;
        leadTimeRef.current.value = data[0].qo_leadtime;
        timeunitRef.current.value = data[0].qo_timeunit;
        totalPriceRef.current.value = data[0].qo_totalprice;
        percentDiscountRef.current.value = data[0].qo_percentdiscount;
        discountRef.current.value = data[0].qo_discount;
        priceAfterDiscountRef.current.value = data[0].qo_priceafterdiscount;
        // checkVatRef.current.value = data[0].qo_vat;
        if (data[0].qo_vat > 0) {
          setIsCheckVat(true);
        }
        if (data[0].qo_withholding > 0) {
          setIsCheckWithHolding(true);
        }
        //[isCheckVat, setIsCheckVat] = useState(true);
        vatRef.current.value = data[0].qo_vat;
        // [isCheckWithHolding, setIsCheckWithHolding] = useState(true);
        withHoldingRef.current.value = data[0].qo_withholding;
        overallRef.current.value = data[0].qo_overall;
        setSaler(data[0].qo_saler);
      }
    } catch (err) {
      console.log(err);
    }
  };
  /* Get Product Data */
  /* Get Customer Data */
  const [customers, setCustomers] = useState([]);
  const getCustomer = async (co_id) => {
    try {
      if (cus_id) {
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
          setCustomers([]);
        } else {
          setCustomers(data);
          customerRef.current.value = data[0].cus_id;
          customerNameRef.current.value = data[0].cus_name;
          customerEmailRef.current.value = data[0].cus_email;
          customerTelRef.current.value = data[0].cus_tel;
        }
      } else if (co_id) {
        const res = await fetch(
          `${import.meta.env.VITE_SERVER}/Customer.php?server=${
            userInfo.server_db
          }&username=${userInfo.username_db}&password=${
            userInfo.password_db
          }&db=${userInfo.name_db}&action=getwherecoid&id=${co_id}`,
          {
            method: "GET",
          }
        );
        const data = await res.json();
        //console.log(data);
        if (data === null) {
          setCompanies([]);
        } else {
          setCustomers(data);
        }
      }
    } catch (err) {
      console.log(err);
    }
  };
  /* Get Customer Data */
  /* Get Company Data */
  const [companies, setCompanies] = useState([]);
  const getCompany = async () => {
    try {
      if (co_id) {
        const res = await fetch(
          `${import.meta.env.VITE_SERVER}/Company.php?server=${
            userInfo.server_db
          }&username=${userInfo.username_db}&password=${
            userInfo.password_db
          }&db=${userInfo.name_db}&action=getwherecoid&id=${co_id}`,
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
          companyRef.current.value = data[0].co_id;
          companyNameRef.current.value = data[0].co_name;
          companyTaxRef.current.value = data[0].co_tax;
          companyAddressRef.current.value = data[0].co_address;
          companyTelRef.current.value = data[0].co_tel;
        }
      } else {
        const res = await fetch(
          `${import.meta.env.VITE_SERVER}/Company.php?server=${
            userInfo.server_db
          }&username=${userInfo.username_db}&password=${
            userInfo.password_db
          }&db=${userInfo.name_db}&action=get&sort=DESC`,
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
  /* Get Project Data */
  const [projects, setProjects] = useState([]);
  const getProject = async (cus_id) => {
    try {
      if (pj_id) {
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
          setProjects([]);
        } else {
          setProjects(data);

          projectRef.current.value = data[0].pj_id;
          projectNameRef.current.value = data[0].pj_name;
          projectDescriptionRef.current.value = data[0].pj_description;
        }
      } else if (cus_id) {
        const res = await fetch(
          `${import.meta.env.VITE_SERVER}/Project.php?server=${
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
          setProjects([]);
        } else {
          setProjects(data);
        }
      }
    } catch (err) {
      console.log(err);
    }
  };
  /* Get Project Data */
  /* Get Product Data */
  const [qoProducts, setQoProducts] = useState([]);
  const getQoProduct = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER}/Product.php?server=${
          userInfo.server_db
        }&username=${userInfo.username_db}&password=${
          userInfo.password_db
        }&db=${userInfo.name_db}&action=getqoitem&id=${qo_id}`,
        {
          method: "GET",
        }
      );
      const data = await res.json();
      console.log("ffff" + data);
      if (data === null) {
        setQoProducts([]);
      } else {
        setQoProducts(data);
      }
    } catch (err) {
      console.log(err);
    }
  };
  /* Get Product Data */

  const [validated, setValidated] = useState(false);

  const handleSubmit = (event) => {
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    } else {
      event.preventDefault();
      event.stopPropagation();

      addQuotation();
    }
    setValidated(true);
  };

  const [customer, setCustomer] = useState([]);
  const customerRef = useRef(null);

  const customerNameRef = useRef(null);
  const customerEmailRef = useRef(null);
  const customerTelRef = useRef(null);

  const [saler, setSaler] = useState("");

  const [company, setCompany] = useState([]);
  const companyRef = useRef(null);
  const companyNameRef = useRef(null);
  const companyTaxRef = useRef(null);
  const companyAddressRef = useRef(null);
  const companyTelRef = useRef(null);

  const [project, setProject] = useState([]);
  const projectRef = useRef(null);
  const projectNameRef = useRef(null);
  const projectDescriptionRef = useRef(null);

  ////const currencyRef = useRef(null);
  const [currency, setCurrency] = useState("THB");
  const dateRef = useRef(null);
  const quotationvalidunitRef = useRef(null);
  const quotationvalidunitunitRef = useRef(null);
  const credittermRef = useRef(null);
  const leadTimeRef = useRef(null);
  const timeunitRef = useRef(null);

  const totalPriceRef = useRef(null);
  const percentDiscountRef = useRef(0);
  const discountRef = useRef(null);
  const priceAfterDiscountRef = useRef(null);
  // const checkVatRef = useRef(true);
  const [isCheckVat, setIsCheckVat] = useState(false);
  const vatRef = useRef(0.0);

  const [isCheckWithHolding, setIsCheckWithHolding] = useState(false);
  const withHoldingRef = useRef(null);

  const overallRef = useRef(null);

  /* Get Customer Data */
  const [sales, setSales] = useState([]);
  const getSales = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER}/User.php?server=${
          userInfo.server_db
        }&username=${userInfo.username_db}&password=${
          userInfo.password_db
        }&db=${userInfo.name_db}&action=getall&sort=ASC`,
        {
          method: "GET",
        }
      );
      const data = await res.json();
      //console.log(data);
      if (data === null) {
        setSales([]);
      } else {
        setSales(data);
      }
    } catch (err) {
      console.log(err);
    }
  };
  const getSalename = (id) => {
    if (sales && sales.length > 0) {
      const sale = sales.find((c) => c.user_id === id);
      console.log("Seler ID ==> " + sales[0].fname);
      return sale ? sale.fname + " " + sale.lname : "";
    }
    return "";
  };
  const getSaleTel = (id) => {
    if (sales && sales.length > 0) {
      const sale = sales.find((c) => c.user_id === id);
      //console.log(customer.cus_name);
      return sale ? sale.tel : "";
    }
    return "";
  };
  const getSaleEmail = (id) => {
    if (sales && sales.length > 0) {
      const sale = sales.find((c) => c.user_id === id);
      //console.log(customer.cus_name);
      return sale ? sale.email : "";
    }
    return "";
  };

  const calOverall = async () => {
    //cal discount
    //console.log(percentDiscountRef.current.value);
    if (percentDiscountRef.current.value === 0) {
      priceAfterDiscountRef.current.value = totalPriceRef.current.value;
    } else {
      await handleDiscount();
    }

    //cal vat
    if (isCheckVat) {
      calVat();
    } else {
      vatRef.current.value = 0.0;
    }

    //cal withholding
    if (isCheckWithHolding) {
      calWithHolding();
    } else {
      if (withHoldingRef.current === null) {
      } else {
        withHoldingRef.current.value = 0.0;
      }
    }

    //cal overall
    if (priceAfterDiscountRef.current === null) {
    } else {
      const floatPrice = parseFloat(priceAfterDiscountRef.current.value);
      const floatVat = parseFloat(vatRef.current.value);

      const floatWithholding = parseFloat(withHoldingRef.current.value);

      //console.log(floatPrice + floatVat);
      overallRef.current.value = (
        floatPrice +
        floatVat -
        floatWithholding
      ).toFixed(2);
    }
  };

  const sumToTotalPrice = async () => {
    let totalPrice = 0;
    rows.map((row) => {
      totalPrice = totalPrice + row.sumprice;
    });
    totalPriceRef.current.value = totalPrice;
    //console.log(totalPriceRef.current.value);
  };

  const handleDiscount = async () => {
    if (totalPriceRef.current === null) {
    } else {
      const sumDiscount =
        totalPriceRef.current.value * (percentDiscountRef.current.value / 100); //percent of total price
      discountRef.current.value = sumDiscount.toFixed(2);

      priceAfterDiscountRef.current.value =
        totalPriceRef.current.value - sumDiscount;
    }
  };

  const calVat = async () => {
    if (priceAfterDiscountRef.current === null) {
    } else {
      //console.log(checkVatRef.current.checked);
      const vat = priceAfterDiscountRef.current.value * (7 / 100);
      const vatPrice = vat.toFixed(2);
      vatRef.current.value = vatPrice;
    }
  };

  const calWithHolding = async () => {
    if (priceAfterDiscountRef.current === null) {
    } else {
      //console.log(checkVatRef.current.checked);
      const withholding = priceAfterDiscountRef.current.value * (3 / 100);
      const withholdingPrice = withholding.toFixed(2);
      withHoldingRef.current.value = withholdingPrice;
    }
  };

  /* Dynamic rows */
  const [rows, setRows] = useState([
    /* { id: 0, name: '', des: '', price: '', qty: '', sumprice: ''}, */
  ]);

  const addRow = () => {
    if (rows == []) {
      setRows({ id: 0, name: "", des: "", price: "", qty: "", sumprice: "" });
    } else {
      const newRow = {
        id: rows.length,
        name: "",
        des: "",
        price: "",
        qty: "",
        sumprice: "",
      };
      setRows([...rows, newRow]);
    }
    //console.log(rows);
  };

  const deleteTableRows = async (idToRemove) => {
    const updatedRows = rows.filter((row) => row.id != idToRemove);
    await setRows(updatedRows);
  };

  const handleRowChange = (value, rowIndex, colName) => {
    //const value = e.target.value;
    const newRows = [...rows];
    newRows[rowIndex][colName] = value;
    setRows(newRows);

    //console.log(rows);
  };
  const handlecheckedVat = async (e) => {
    setIsCheckVat(e.target.checked);
  };

  const handlecheckedWithHolding = async (e) => {
    setIsCheckWithHolding(e.target.checked);
  };

  const renderRow = (row, rowIndex) => (
    <tr key={rowIndex + 1}>
      <td className="text-center">{rowIndex + 1}</td>
      <td>
        <Form.Group as={Col} md="12">
          <Form.Select
            required
            onChange={async (e) => {
              const split = e.target.value.split("|");
              //console.log(split[1]);
              await handleRowChange(split[0], rowIndex, "name");
              await handleRowChange(split[1], rowIndex, "des"); //add description product
              await handleRowChange(split[2], rowIndex, "price"); //add sell price product
            }}
          >
            <option value={""}>--Select Product--</option>
            {qoProducts.map((product, index) => (
              <option
                className="fw-bold"
                key={index + 1}
                value={`${product.pd_id}-${product.pd_name}|${product.pd_description}|${product.pd_sellprice}`}
              >{`${product.pd_id}-${product.pd_name}`}</option>
            ))}
          </Form.Select>
        </Form.Group>
      </td>

      <td>
        <Form.Group as={Col} md="12">
          <Form.Control required readOnly type="text" value={row.des} />
        </Form.Group>
      </td>
      <td>
        <Form.Group as={Col} md="12">
          <Form.Control required readOnly type="number" value={row.price} />
        </Form.Group>
      </td>
      <td>
        <Form.Group as={Col} md="12">
          <Form.Control
            required
            type="number"
            value={row.qty}
            onChange={async (e) => {
              await handleRowChange(e.target.value, rowIndex, "qty");
              await handleRowChange(
                row.price * e.target.value,
                rowIndex,
                "sumprice"
              );
              await sumToTotalPrice();

              await calOverall();
            }}
          />
        </Form.Group>
      </td>
      <td>
        <Form.Group as={Col} md="12">
          <Form.Control
            required
            readOnly
            type="number"
            defaultValue={row.sumprice}
          />
        </Form.Group>
      </td>
      <td className="d-flex justify-content-center">
        <button
          type="button"
          className="btn btn-danger "
          onClick={async (e) => {
            await handleRowChange(e.target.value, rowIndex, "qty");
            await handleRowChange(
              row.price * e.target.value,
              rowIndex,
              "sumprice"
            );
            await sumToTotalPrice();

            await calOverall();
            deleteTableRows(row.id);
          }}
        >
          X
        </button>
      </td>
    </tr>
  );

  /* Dynamic rows */
  calOverall();
  return (
    <>
      <div className="m-5">
        <h1 className="mb-3">View Quotation</h1>

        <Card body>
          <Form noValidate validated={validated} onSubmit={handleSubmit}>
            <div className="d-flex align-items-center justify-content-between ">
              <h1 className="text-info fw-bold mb-3">{qo_id}</h1>
            </div>
            <Row className="justify-content-center gap-3">
              <Card
                style={{ width: "25rem" }}
                body
                className="mb-3"
                as={Col}
                md="6"
              >
                <h4 className="text-success">Company Detail</h4>
                <Form.Group as={Col} md="12">
                  <Form.Label>
                    <b>Company </b>
                  </Form.Label>
                  {co_id ? (
                    <Form.Group as={Col} md="12">
                      <Form.Control
                        required
                        readOnly
                        type="text"
                        placeholder=""
                        ref={companyRef}
                      />
                    </Form.Group>
                  ) : (
                    <Typeahead
                      required
                      id="basic-typeahead-single"
                      onChange={async (select) => {
                        ////console.log(select);
                        await setCompany(select);
                        if (select != []) {
                          companyTaxRef.current.value = select[0].co_tax;
                          companyAddressRef.current.value =
                            select[0].co_address;
                          companyTelRef.current.value = select[0].co_tel;
                          await getCustomer(select[0].co_id);
                        }
                      }}
                      labelKey="co_name"
                      options={companies}
                      selected={company}
                    />
                  )}
                </Form.Group>
                {co_id ? (
                  <Form.Group as={Col} md="12">
                    <Form.Label>
                      <b>Company Name</b>
                    </Form.Label>
                    <Form.Control
                      required
                      readOnly
                      type="text"
                      placeholder=""
                      ref={companyNameRef}
                    />
                  </Form.Group>
                ) : (
                  <></>
                )}

                <Form.Group as={Col} md="12">
                  <Form.Label>
                    <b>Tax ID</b>
                  </Form.Label>
                  <Form.Control
                    required
                    readOnly
                    type="text"
                    placeholder=""
                    ref={companyTaxRef}
                  />
                </Form.Group>
                <Form.Group as={Col} md="12">
                  <Form.Label>
                    <b>Address</b>
                  </Form.Label>
                  <Form.Control
                    required
                    readOnly
                    type="text"
                    placeholder=""
                    ref={companyAddressRef}
                  />
                </Form.Group>
                <Form.Group as={Col} md="12">
                  <Form.Label>
                    <b>Tel.</b>
                  </Form.Label>
                  <Form.Control
                    required
                    readOnly
                    type="text"
                    placeholder=""
                    ref={companyTelRef}
                  />
                </Form.Group>
              </Card>

              <Card
                style={{ width: "25rem" }}
                body
                className="mb-3"
                as={Col}
                md="6"
              >
                <h4 className="text-success">Customer Detail</h4>
                {cus_id ? (
                  <Form.Group as={Col} md="12">
                    <Form.Label>
                      <b>Customer ID</b>
                    </Form.Label>
                    <Form.Control
                      required
                      readOnly
                      type="text"
                      placeholder=""
                      ref={customerRef}
                    />
                  </Form.Group>
                ) : (
                  <Form.Group as={Col} md="12">
                    <Form.Label>
                      <b>Customer</b>
                    </Form.Label>
                    <Typeahead
                      required
                      id="basic-typeahead-single"
                      onChange={async (select) => {
                        await setCustomer(select);
                        customerEmailRef.current.value = select[0].cus_email;
                        customerTelRef.current.value = select[0].cus_tel;
                        getProject(select[0].cus_id);
                      }}
                      labelKey="cus_name"
                      options={customers}
                      selected={customer}
                    />

                    <Form.Control.Feedback type="invalid">
                      <b>Please Select Customer.</b>
                    </Form.Control.Feedback>
                  </Form.Group>
                )}
                {cus_id ? (
                  <Form.Group as={Col} md="12">
                    <Form.Label>
                      <b>Name</b>
                    </Form.Label>
                    <Form.Control
                      required
                      readOnly
                      type="text"
                      placeholder=""
                      ref={customerNameRef}
                    />
                  </Form.Group>
                ) : (
                  <></>
                )}
                <Form.Group as={Col} md="12">
                  <Form.Label>
                    <b>email</b>
                  </Form.Label>
                  <Form.Control
                    required
                    readOnly
                    type="text"
                    placeholder=""
                    ref={customerEmailRef}
                  />
                </Form.Group>
                <Form.Group as={Col} md="12">
                  <Form.Label>
                    <b>Tel.</b>
                  </Form.Label>
                  <Form.Control
                    required
                    readOnly
                    type="text"
                    placeholder=""
                    ref={customerTelRef}
                  />
                </Form.Group>
              </Card>

              <Card
                style={{ width: "25rem" }}
                body
                className="mb-3"
                as={Col}
                md="6"
              >
                <h4 className="text-success">Project Detail</h4>
                {pj_id ? (
                  <Form.Group as={Col} md="12">
                    <Form.Label>
                      <b>Project ID</b>
                    </Form.Label>
                    <Form.Control
                      required
                      readOnly
                      type="text"
                      placeholder=""
                      ref={projectRef}
                    />
                  </Form.Group>
                ) : (
                  <Form.Group as={Col} md="12">
                    <Form.Label>
                      <b>Project</b>
                    </Form.Label>
                    <Typeahead
                      required
                      id="basic-typeahead-single"
                      onChange={async (select) => {
                        await setProject(select);
                        projectDescriptionRef.current.value =
                          select[0].pj_description;

                        //getProject(cus_id);
                      }}
                      labelKey="pj_name"
                      options={projects}
                      selected={project}
                    />
                    <Form.Control.Feedback type="invalid">
                      <b>Please Select Project.</b>
                    </Form.Control.Feedback>
                  </Form.Group>
                )}
                {pj_id ? (
                  <Form.Group as={Col} md="12">
                    <Form.Label>
                      <b>Project Name</b>
                    </Form.Label>
                    <Form.Control
                      required
                      readOnly
                      type="text"
                      placeholder=""
                      ref={projectNameRef}
                    />
                  </Form.Group>
                ) : (
                  <></>
                )}

                <Form.Group as={Col} md="12">
                  <Form.Label>
                    <b>Description</b>
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    required
                    readOnly
                    type="text"
                    placeholder=""
                    ref={projectDescriptionRef}
                  />
                </Form.Group>
              </Card>

              <Card
                style={{ width: "25rem" }}
                body
                className="mb-3"
                as={Col}
                md="6"
              >
                <Form.Group as={Col} md="12">
                  <Form.Label>
                    <b>Currency</b>
                  </Form.Label>
                  <Form.Select
                    required
                    disabled
                    onChange={(e) => {
                      setCurrency(e.target.value);
                    }}
                  >
                    <option value={"THB"}>THB</option>
                    <option value={"USD"}>USD</option>
                    <option value={"EUR"}>EUR</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    <b>Please Select Currency.</b>
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group as={Col} md="12">
                  <Form.Label>
                    <b>Date</b>
                  </Form.Label>
                  <Form.Control
                    required
                    disabled
                    type="date"
                    placeholder=""
                    ref={dateRef}
                  />
                  <Form.Control.Feedback type="invalid">
                    <b>Please Select Date.</b>
                  </Form.Control.Feedback>
                </Form.Group>
                <div className="d-flex gap-1">
                  <Form.Group as={Col} md="6">
                    <Form.Label>
                      <b>Quotation valid unit</b>
                    </Form.Label>
                    <Form.Control
                      required
                      readOnly
                      type="number"
                      placeholder=""
                      ref={quotationvalidunitRef}
                    />
                    <Form.Control.Feedback type="invalid">
                      <b>Please Enter Quotation valid unit.</b>
                    </Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group as={Col} md="6" className="mt-2">
                    <Form.Label></Form.Label>
                    <Form.Select
                      ref={quotationvalidunitunitRef}
                      required
                      disabled
                    >
                      <option value={""}>--Select unit--</option>
                      <option value={"day"}>Day</option>
                      <option value={"week"}>Week</option>
                      <option value={"month"}>Month</option>
                      <option value={"year"}>Year</option>
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      <b>Please Select Time Unit.</b>
                    </Form.Control.Feedback>
                  </Form.Group>
                </div>

                <Form.Group as={Col} md="12">
                  <Form.Label>
                    <b>Credit Term</b>
                  </Form.Label>
                  <Form.Control
                    required
                    readOnly
                    type="number"
                    placeholder=""
                    ref={credittermRef}
                  />
                  <Form.Control.Feedback type="invalid">
                    <b>Please Enter Credit Term.</b>
                  </Form.Control.Feedback>
                </Form.Group>

                <div className="d-flex gap-1">
                  <Form.Group as={Col} md="6">
                    <Form.Label>
                      <b>Lead Time</b>
                    </Form.Label>
                    <Form.Control
                      required
                      readOnly
                      type="number"
                      placeholder=""
                      ref={leadTimeRef}
                    />
                    <Form.Control.Feedback type="invalid">
                      <b>Please Enter Lead Time.</b>
                    </Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group as={Col} md="6" className="mt-2">
                    <Form.Label></Form.Label>
                    <Form.Select ref={timeunitRef} required disabled>
                      <option value={""}>--Select unit--</option>
                      <option value={"day"}>Day</option>
                      <option value={"week"}>Week</option>
                      <option value={"month"}>Month</option>
                      <option value={"year"}>Year</option>
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      <b>Please Select Time Unit.</b>
                    </Form.Control.Feedback>
                  </Form.Group>
                </div>
                <hr></hr>
                <Form.Group as={Col} md="12">
                  <Form.Label>
                    <b>Sale Name</b>
                  </Form.Label>
                  <Form.Control
                    readOnly
                    type="text"
                    placeholder=""
                    value={getSalename(saler)}
                  />
                  <Form.Control.Feedback type="invalid">
                    <b>Please Enter Sale Name.</b>
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group as={Col} md="12">
                  <Form.Label>
                    <b>Sale Tel</b>
                  </Form.Label>
                  <Form.Control
                    readOnly
                    type="text"
                    placeholder=""
                    value={getSaleTel(saler)}
                  />
                  <Form.Control.Feedback type="invalid">
                    <b>Please Enter Sale Tel.</b>
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group as={Col} md="12">
                  <Form.Label>
                    <b>Sale Email</b>
                  </Form.Label>
                  <Form.Control
                    readOnly
                    type="text"
                    placeholder=""
                    value={getSaleEmail(saler)}
                  />
                  <Form.Control.Feedback type="invalid">
                    <b>Please Enter Sale Email.</b>
                  </Form.Control.Feedback>
                </Form.Group>
              </Card>
            </Row>
            <hr />

            <div>
              <Row>
                <Col md={10}>
                  {/* data table */}
                  <Table bordered hover responsive className="mt-3">
                    <thead className="bg-dark text-light text-center">
                      <tr>
                        <th>#</th>
                        <th>Part No.</th>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Price</th>
                        <th>QTY</th>
                        <th>Sum Price</th>
                        {/* <th>
                          <button
                            className="btn btn-success"
                            type="button"
                            onClick={addRow}
                          >
                            <b>+</b>
                          </button>
                        </th> */}
                      </tr>
                    </thead>
                    <tbody>
                      {qoProducts.map((item, index) => (
                        <tr key={item.id}>
                          <td>{index + 1}</td>
                          <td>{item.pd_id}</td>
                          <td>{item.pd_name}</td>
                          <td>{item.pd_description}</td>
                          <td>{(item.pd_price * 1).toLocaleString()}</td>
                          <td>{(item.item_qty * 1).toLocaleString()}</td>
                          <td>
                            {(item.pd_price * item.item_qty).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                  {/* data table */}
                </Col>

                <Col md={2}>
                  <Row className="mt-3 px-3">
                    {/* <Button size="lg" variant="success" type="submit">
                      <b>Save Quotation</b>
                    </Button> */}
                  </Row>
                  <Card className="mt-3 p-3">
                    <Form.Group as={Col} md="12">
                      <Form.Label>
                        <b>Total Price</b>
                      </Form.Label>
                      <InputGroup>
                        <Form.Control required readOnly ref={totalPriceRef} />
                        <InputGroup.Text>
                          <b>{currency}</b>
                        </InputGroup.Text>
                      </InputGroup>
                      <Form.Control.Feedback type="invalid">
                        <b>Please Enter Total Price.</b>
                      </Form.Control.Feedback>
                    </Form.Group>

                    <b className="mt-2 mb-1">Discount</b>
                    <div className="d-flex justify-content-center align-items-center mb-3">
                      <Row md={12}>
                        {/* <Col className="pe-1"> */}
                        <InputGroup>
                          <Form.Control
                            ref={percentDiscountRef}
                            //required
                            readOnly
                            type="number"
                            onChange={async () => {
                              calOverall();
                            }}
                          />
                          <InputGroup.Text>
                            <b>%</b>
                          </InputGroup.Text>
                        </InputGroup>
                        {/* </Col> */}
                        {/*  <Col className="ps-0"> */}
                        <Form.Group>
                          <InputGroup>
                            <Form.Control
                              readOnly
                              required
                              type="text"
                              ref={discountRef}
                            />
                            <InputGroup.Text>
                              <b>{currency}</b>
                            </InputGroup.Text>
                          </InputGroup>
                          <Form.Control.Feedback type="invalid">
                            <b>Please Enter Discount.</b>
                          </Form.Control.Feedback>
                        </Form.Group>
                        {/*  </Col> */}
                      </Row>
                    </div>

                    <Form.Group as={Col} md="12" className="mb-2">
                      <Form.Label>
                        <b>Price After Discount</b>
                      </Form.Label>
                      <InputGroup>
                        <Form.Control
                          readOnly
                          type="text"
                          placeholder=""
                          ref={priceAfterDiscountRef}
                        />
                        <InputGroup.Text>
                          <b>{currency}</b>
                        </InputGroup.Text>
                      </InputGroup>
                      <Form.Control.Feedback type="invalid">
                        <b>Please Enter Price After Discount.</b>
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group as={Col} md="12" className="mb-2">
                      <Row>
                        <Col md={6}>
                          <Form.Check
                            className="fw-bold"
                            label="Vat 7%"
                            type="checkbox"
                            checked={isCheckVat}
                            disabled
                            onChange={handlecheckedVat}
                          />
                        </Col>
                      </Row>
                      <InputGroup>
                        <Form.Control
                          readOnly
                          required
                          type="number"
                          placeholder=""
                          ref={vatRef}
                        />
                        <InputGroup.Text>
                          <b>{currency}</b>
                        </InputGroup.Text>
                      </InputGroup>
                    </Form.Group>

                    <Form.Group as={Col} md="12" className="mb-2">
                      <Row>
                        <Col md={12}>
                          <Form.Check
                            className="fw-bold"
                            label="Withholding 3%"
                            checked={isCheckWithHolding}
                            disabled
                            ref={withHoldingRef}
                            onChange={handlecheckedWithHolding}
                          />
                        </Col>
                      </Row>
                      <InputGroup>
                        <Form.Control
                          readOnly
                          required
                          type="number"
                          placeholder=""
                          ref={withHoldingRef}
                        />
                        <InputGroup.Text>
                          <b>{currency}</b>
                        </InputGroup.Text>
                      </InputGroup>
                    </Form.Group>

                    <Form.Group as={Col} md="12">
                      <Form.Label>
                        <b>Overall</b>
                      </Form.Label>
                      <InputGroup>
                        <Form.Control readOnly type="text" ref={overallRef} />
                        <InputGroup.Text>
                          <b>{currency}</b>
                        </InputGroup.Text>
                      </InputGroup>
                      <Form.Control.Feedback type="invalid">
                        <b>Please Enter Overall.</b>
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Card>
                </Col>
              </Row>
            </div>
          </Form>
        </Card>
      </div>
    </>
  );
}

export default QuotationView;
