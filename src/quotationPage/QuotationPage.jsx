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

function QuotationPage() {
  const userInfo = useContext(UserContext);

  const location = useLocation();
  const navigate = useNavigate();

  let pj_id = "";
  let cus_id = "";
  let co_id = "";
  let revise = false;
  if (location.state) {
    pj_id = location.state.pj_id;
    cus_id = location.state.cus_id;
    co_id = location.state.co_id;
    revise = location.state.checkRevise;
  }
  ////console.log(co_id);
  const [qoId, setQoId] = useState();
  const getId = async () => {
    const id = await genId();
    setQoId(id);
  };

  useEffect(() => {
    if (userInfo) {
      getId();
      getProject();
      getCustomer();
      getCompany();
      getProduct();
    }
  }, [location, userInfo]);

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

    let id = `QO${yy}${month}${day}`;
    do {
      i++;
      let fullId = `${id}${i.toString().padStart(4, "0")}`;
      //console.log(fullId);

      try {
        const res = await fetch(
          `${import.meta.env.VITE_SERVER}/Quotation.php?server=${
            userInfo.server_db
          }&username=${userInfo.username_db}&password=${
            userInfo.password_db
          }&db=${userInfo.name_db}&action=getwhereqoid&id=${fullId}`,
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
  const getProduct = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER}/Product.php?server=${
          userInfo.server_db
        }&username=${userInfo.username_db}&password=${
          userInfo.password_db
        }&db=db_atc_crm&action=get&table=tb_product`,
        {
          method: "GET",
        }
      );
      const data = await res.json();
      
      if (data === null) {
        setProducts([]);
      } else {
        setProducts(data);
      }
    } catch (err) {
      console.log(err);
    }
  };
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
  const [products, setProducts] = useState([]);
  
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

  const addQuotation = async () => {
    const splitDate = dateRef.current.value.split("/");
    const rearrangedDate = splitDate.reverse().join("-");

    ////const strItem = JSON.stringify(rows);
    const strItem = "";

    /* console.log(qoId);
    console.log(customerRef.current.value);
    console.log(projectRef.current.value);
    console.log(companyRef.current.value);
    console.log(currency);
    console.log(rearrangedDate);
    console.log(credittermRef.current.value);
    console.log(leadTimeRef.current.value);
    console.log(timeunitRef.current.value);
   
    console.log(strItem);
    console.log(totalPriceRef.current.value);
    console.log(percentDiscountRef.current.value);
    console.log(discountRef.current.value);
    console.log(priceAfterDiscountRef.current.value);
    console.log(vatRef.current.value);
    console.log(withHoldingRef.current.value);
    console.log(overallRef.current.value); */
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER}/Quotation.php?server=${
          userInfo.server_db
        }&username=${userInfo.username_db}&password=${
          userInfo.password_db
        }&db=${
          userInfo.name_db
        }&action=insert&quotationId=${qoId}&reviseid=00&customerId=${
          cus_id ? customerRef.current.value : customer[0].cus_id
        }&projectId=${
          pj_id ? projectRef.current.value : project[0].pj_id
        }&companyId=${
          co_id ? companyRef.current.value : company[0].co_id
        }&currency=${currency}&issue_date=${rearrangedDate}&quotationvalidunit=${
          quotationvalidunitRef.current.value
        }&quotationvalidunitunit=${
          quotationvalidunitunitRef.current.value
        }&creditterm=${credittermRef.current.value}&leadtime=${
          leadTimeRef.current.value
        }&timeunit=${timeunitRef.current.value}&saler=${
          userInfo.user_id
        }&totalprice=${totalPriceRef.current.value}&percentdiscount=${
          percentDiscountRef.current.value
        }&discount=${discountRef.current.value}&priceafterdiscount=${
          priceAfterDiscountRef.current.value
        }&vat=${vatRef.current.value}&withholding=${
          withHoldingRef.current.value
        }&overall=${overallRef.current.value}&statusapprove=wait`,
        {
          method: "POST",
        }
      );
      const data = await res.json();
      ////console.log(data);
      if (data === "ok") {
        /* let data; */
        //insert item
        rows.map(async (el) => {
          //console.log(el);

          const pd_id = el.name.split("-");

          const res = await fetch(
            `${import.meta.env.VITE_SERVER}/Quotation.php?server=${
              userInfo.server_db
            }&username=${userInfo.username_db}&password=${
              userInfo.password_db
            }&db=${
              userInfo.name_db
            }&action=insertitem&quotationId=${qoId}&reviseid=00&productId=${
              pd_id[0]
            }&item_qty=${el.qty}`,
            {
              method: "POST",
            }
          );

          const data = await res.json();
          ////console.log(data);
        });

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
          navigate("/QuotationList");
        } else {
          console.log(data);
        }
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
    }
  };

  const [customer, setCustomer] = useState([]);
  const customerRef = useRef(null);

  const customerNameRef = useRef(null);
  const customerEmailRef = useRef(null);
  const customerTelRef = useRef(null);

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
  const discountRef = useRef(0);
  const priceAfterDiscountRef = useRef(null);
  ////const checkVatRef = useRef(true);
  const [isCheckVat, setIsCheckVat] = useState(true);
  const vatRef = useRef(0.0);

  const [isCheckWithHolding, setIsCheckWithHolding] = useState(false);
  const withHoldingRef = useRef(null);

  const overallRef = useRef(null);

  const calOverall = async () => {
    //cal discount
    //console.log(percentDiscountRef.current.value);
    if (percentDiscountRef.current.value === 0) {
      priceAfterDiscountRef.current.value = totalPriceRef.current.value;
    } else if (parseFloat(totalPriceRef.current.value) === 0) {
      priceAfterDiscountRef.current.value = 0.0;
    }
    // else {
    //   await handleDiscount();
    // }

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
    if (
      totalPriceRef.current.value === "" ||
      totalPriceRef.current.value === 0 ||
      totalPriceRef.current.value === null
    ) {
      //console.log(floatPrice + floatVat);
      overallRef.current.value = 0;
    } else if (priceAfterDiscountRef.current.value === "") {
      const floatPrice = parseFloat(totalPriceRef.current.value);
      const floatVat = parseFloat(vatRef.current.value);

      const floatWithholding = parseFloat(withHoldingRef.current.value);

      //console.log(floatPrice + floatVat);
      overallRef.current.value = (
        floatPrice +
        floatVat -
        floatWithholding
      ).toFixed(2);
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
  const handleDiscountChange = async (discountValue) => {
    const totalValue = totalPriceRef.current.value;
    const percentValue = (discountValue / totalValue) * 100;
    percentDiscountRef.current.value = percentValue.toFixed(2);

    priceAfterDiscountRef.current.value =
      totalPriceRef.current.value - discountRef.current.value;
    await calOverall();
  };
  const handlePercentChange = async (percentValue) => {
    const totalValue = totalPriceRef.current.value;
    const sumDiscount = totalValue * (percentValue / 100);
    discountRef.current.value = sumDiscount.toFixed(2);

    priceAfterDiscountRef.current.value =
      totalPriceRef.current.value - sumDiscount;
    await calOverall();
  };

  const sumToTotalPrice = async () => {
    let totalPrice = 0;
    rows.map((row) => {
      totalPrice = totalPrice + row.sumprice;
    });
    totalPriceRef.current.value = totalPrice;
    //console.log(totalPriceRef.current.value);
  };

  // const handleDiscount = async () => {
  //   if (totalPriceRef.current === null) {
  //   } else {
  //     const sumDiscount =
  //       totalPriceRef.current.value * (percentDiscountRef.current.value / 100); //percent of total price
  //     discountRef.current.value = sumDiscount.toFixed(2);

  //     priceAfterDiscountRef.current.value =
  //       totalPriceRef.current.value - sumDiscount;
  //   }
  // };

  const calVat = async () => {
    if (priceAfterDiscountRef.current.value === "") {
      const vat = totalPriceRef.current.value * (7 / 100);
      const vatPrice = vat.toFixed(2);
      vatRef.current.value = vatPrice;
    } else {
      //console.log(checkVatRef.current.checked);
      const vat = priceAfterDiscountRef.current.value * (7 / 100);
      const vatPrice = vat.toFixed(2);
      vatRef.current.value = vatPrice;
    }
  };

  const calWithHolding = async () => {
    if (priceAfterDiscountRef.current.value === "") {
      const withholding = totalPriceRef.current.value * (3 / 100);
      const withholdingPrice = withholding.toFixed(2);
      withHoldingRef.current.value = withholdingPrice;
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
        {/* <Form.Group as={Col} md="12">
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
            <option value={""}>--Select Product--</option>{" "}
           
            {products.map((product, index) => (
              <option
                className="fw-bold"
                key={index + 1}
                value={`${product.pd_id}-${product.pd_name}|${product.pd_description}|${product.pd_sellprice}`}
              >{`${product.pd_id}-${product.pd_name}`}</option>
            ))}
        </td>  </Form.Select>
        </Form.Group> */}
        <Form.Group as={Col} md="12">
          <Typeahead
            id="basic-typeahead-single"
            labelKey="label"
            allowNew={true}
            newSelectionPrefix="Add: "
            onChange={async (selected) => {
              if (selected && selected.length > 0) {
                if (selected[0].customOption) {
                  // Handle custom input
                  await handleRowChange(selected[0].label, rowIndex, "name");
                  await handleRowChange("", rowIndex, "des");
                  await handleRowChange("", rowIndex, "price");
                } else {
                  // Handle selected product
                  const split = selected[0].value.split("|");
                  await handleRowChange(split[0], rowIndex, "name");
                  await handleRowChange(split[1], rowIndex, "des");
                  await handleRowChange(split[2], rowIndex, "price");
                }
              }
            }}
            options={products.map((product) => ({
              value: `${product.pd_id}-${product.pd_name}|${product.pd_description}|${product.pd_sellprice}`,
              label: `${product.pd_id}-${product.pd_name}`,
            }))}
            placeholder="Select or type product name"
          />
        </Form.Group>
        </td>

        <td>
          <Form.Group as={Col} md="12">
            <Form.Control 
              required 
              type="text" 
              value={row.des} 
              onChange={(e) => handleRowChange(e.target.value, rowIndex, "des")}
            />
          </Form.Group>
        </td>
        <td>
          <Form.Group as={Col} md="12">
            <Form.Control 
              required 
              type="number" 
              value={row.price} 
              onChange={(e) => handleRowChange(e.target.value, rowIndex, "price")}
            />
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
                if (discountRef.current.value !== "") {
                  await handleDiscountChange(discountRef.current.value);
                } else if (percentDiscountRef.current.value !== "") {
                  await handlePercentChange(percentDiscountRef.current.value);
                }

                await calOverall();
              }}
            />
          </Form.Group>
        </td>
        <td>
          <Form.Group as={Col} md="12">
            <Form.Control
              required
              type="number"
              value={row.sumprice}
              onChange={(e) => handleRowChange(e.target.value, rowIndex, "sumprice")}
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
        <h1 className="mb-3">
          {!revise ? "Create Quotation" : "Revise Quotation"}
        </h1>

        <Card body>
          <Form noValidate validated={validated} onSubmit={handleSubmit}>
            <div className="d-flex align-items-center justify-content-between ">
              <h1 className="text-info fw-bold mb-3">{qoId}</h1>
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
                    <Form.Select ref={quotationvalidunitunitRef} required>
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
                    <Form.Select ref={timeunitRef} required>
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
                    <b>Sele Name</b>
                  </Form.Label>
                  <Form.Control
                    readOnly
                    type="text"
                    placeholder=""
                    value={`${userInfo?.fname} ${userInfo?.lname}`}
                  />
                  <Form.Control.Feedback type="invalid">
                    <b>Please Enter Sale Name.</b>
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group as={Col} md="12">
                  <Form.Label>
                    <b>Sele Tel</b>
                  </Form.Label>
                  <Form.Control
                    readOnly
                    type="text"
                    placeholder=""
                    value={userInfo?.tel}
                  />
                  <Form.Control.Feedback type="invalid">
                    <b>Please Enter Sale Tel.</b>
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group as={Col} md="12">
                  <Form.Label>
                    <b>Sele Email</b>
                  </Form.Label>
                  <Form.Control
                    readOnly
                    type="text"
                    placeholder=""
                    value={userInfo?.email}
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
                  <Table bordered hover className="mt-3">
                    <thead className="bg-dark text-light text-center">
                      <tr>
                        <th>No.</th>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Price</th>
                        <th>QTY</th>
                        <th>Sum Price</th>
                        <th>
                          <button
                            className="btn btn-success"
                            type="button"
                            onClick={addRow}
                          >
                            <b>+</b>
                          </button>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row, rowIndex) => renderRow(row, rowIndex))}
                    </tbody>
                  </Table>
                  {/* data table */}
                </Col>

                <Col md={2}>
                  <Row className="mt-3 px-3">
                    {!revise ? (
                      <Button size="lg" variant="success" type="submit">
                        <b>Save Quotation</b>
                      </Button>
                    ) : (
                      <Button size="lg" variant="warning" type="submit">
                        <b>Revise Quotation</b>
                      </Button>
                    )}
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
                            type="number"
                            step="0.01"
                            onChange={async (e) => {
                              await handlePercentChange(e.target.value);
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
                              // readOnly
                              //required
                              type="number"
                              ref={discountRef}
                              onChange={async (e) => {
                                await handleDiscountChange(e.target.value);
                              }}
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
                            onChange={handlecheckedVat}
                          />
                        </Col>
                      </Row>
                      <InputGroup>
                        <Form.Control
                          readOnly
                          //required
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
                            ref={withHoldingRef}
                            onChange={handlecheckedWithHolding}
                          />
                        </Col>
                      </Row>
                      <InputGroup>
                        <Form.Control
                          readOnly
                          //required
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

export default QuotationPage;
