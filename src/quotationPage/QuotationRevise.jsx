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

function QuotationRevise() {
  const userInfo = useContext(UserContext);

  const location = useLocation();
  const navigate = useNavigate();

  let pj_id = "";
  let cus_id = "";
  let co_id = "";
  let qo_id = "";
  let qo_totalprice = 0;

  if (location.state) {
    pj_id = location.state.pj_id;
    cus_id = location.state.cus_id;
    co_id = location.state.co_id;
    qo_id = location.state.qo_id;
    qo_totalprice = location.state.qo_totalprice;
  }

  /* Get Customer Data */
  const [customers, setCustomers] = useState([]);
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
      if (data == null) {
        setCustomers([]);
      } else {
        setCustomers(data);
        customerRef.current.value = data[0].cus_id;
        customerNameRef.current.value = data[0].cus_name;
        customerEmailRef.current.value = data[0].cus_email;
        customerTelRef.current.value = data[0].cus_tel;
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
      if (data == null) {
        setCompanies([]);
      } else {
        setCompanies(data);
        companyRef.current.value = data[0].co_id;
        companyNameRef.current.value = data[0].co_name;
        companyTaxRef.current.value = data[0].co_tax;
        companyAddressRef.current.value = data[0].co_address;
        companyTelRef.current.value = data[0].co_tel;
      }
    } catch (err) {
      console.log(err);
    }
  };

  /* Get Company Data */
  /* Get Project Data */
  const [projects, setProjects] = useState([]);
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
      if (data == null) {
        setProjects([]);
      } else {
        setProjects(data);

        projectRef.current.value = data[0].pj_id;
        projectNameRef.current.value = data[0].pj_name;
        projectDescriptionRef.current.value = data[0].pj_description;
      }
    } catch (err) {
      console.log(err);
    }
  };
  /* Get Project Data */
  /* Get Product Data */
  const [products, setProducts] = useState([]);
  const getProduct = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER}/Product.php?server=${
          userInfo.server_db
        }&username=${userInfo.username_db}&password=${
          userInfo.password_db
        }&db=${userInfo.name_db}&action=get`,
        {
          method: "GET",
        }
      );
      const data = await res.json();
      ////console.log(data);
      if (data == null) {
        setProducts([]);
      } else {
        setProducts(data);
      }
    } catch (err) {
      console.log(err);
    }
  };
  const getProductName = (id) => {
    if (products && products.length > 0) {
      const product = products.find((c) => c.pd_id == id);
      return product ? product.pd_name : "";
    }
    return "";
  };
  const getProductDescription = (id) => {
    if (products && products.length > 0) {
      const product = products.find((c) => c.pd_id == id);
      return product ? product.pd_description : "";
    }
    return "";
  };
  const getProductSellPrice = (id) => {
    if (products && products.length > 0) {
      const product = products.find((c) => c.pd_id == id);
      return product ? product.pd_sellprice : "";
    }
    return "";
  };
  /* Get Product Data */
  /* Get Qo Data */
  const [quotations, setQuotation] = useState([]);
  const getQuotation = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER}/Quotation.php?server=${
          userInfo.server_db
        }&username=${userInfo.username_db}&password=${
          userInfo.password_db
        }&db=${userInfo.name_db}&action=getwhereqoid&id=${qo_id}&sort=DESC`,
        {
          method: "GET",
        }
      );
      const data = await res.json();
      ////console.log(data);
      if (data == null) {
        setQuotation([]);
      } else {
        setQuotation(data);

        setReviseId(data[0].qo_revise_id);

        setCurrency(data[0].qo_currency);

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
        vatRef.current.value = data[0].qo_vat;
        if (vatRef.current.value != 0) {
          setIsCheckVat(true);
        } else {
          setIsCheckVat(false);
        }
        withHoldingRef.current.value = data[0].qo_withholding;
        if (withHoldingRef.current.value != 0) {
          setIsCheckWithHolding(true);
        } else {
          setIsCheckWithHolding(false);
        }
        overallRef.current.value = data[0].qo_overall;

        getItem(data[0].qo_id);
        console.log("OVERALL =>", data[0]);
      }
    } catch (err) {
      console.log(err);
    }
  };

  /* End Get Qo Data */
  /* Get QO Item data */
  const [items, setItem] = useState([]);
  const getItem = async (id) => {
    const res = await fetch(
      `${import.meta.env.VITE_SERVER}/Quotation.php?server=${
        userInfo.server_db
      }&username=${userInfo.username_db}&password=${userInfo.password_db}&db=${
        userInfo.name_db
      }&action=getitemwhereqoid&id=${id}`,
      {
        method: "GET",
      }
    );
    const data = await res.json();
    ////console.log(data);
    if (data == null) {
      getItem([]);
    } else {
      setItem(data);
    }
  };
  /* End Get QO Item data */

  const setOldItem = async () => {
    const updatedRows = items.map((item, index) => ({
      id: index > 0 ? index + 1 : index,
      name: `${item.pd_id}-${getProductName(item.pd_id)}`,
      des: getProductDescription(item.pd_id),
      price: `${getProductSellPrice(item.pd_id)}`,
      qty: item.item_qty,
      sumprice: getProductSellPrice(item.pd_id) * item.item_qty,
    }));

    setRows(updatedRows);
  };

  const [validated, setValidated] = useState(false);

  const handleSubmit = (event) => {
    const form = event.currentTarget;
    if (form.checkValidity() == false) {
      event.preventDefault();
      event.stopPropagation();
    } else {
      event.preventDefault();
      event.stopPropagation();

      addQuotation();
    }
    setValidated(true);
  };

  const copyDatatoHistory = async () => {
    //copy qo data to history
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER}/Quotation.php?server=${
          userInfo.server_db
        }&username=${userInfo.username_db}&password=${
          userInfo.password_db
        }&db=${userInfo.name_db}&action=copyqo&quotationid=${qo_id}`,
        {
          method: "POST",
        }
      );
      const data = await res.json();
      if (data == "ok") {
        //copy item data to history
        const res = await fetch(
          `${import.meta.env.VITE_SERVER}/Quotation.php?server=${
            userInfo.server_db
          }&username=${userInfo.username_db}&password=${
            userInfo.password_db
          }&db=${userInfo.name_db}&action=copyitem&quotationid=${qo_id}`,
          {
            method: "POST",
          }
        );
      }
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  };

  const addQuotation = async () => {
    const statusCopy = await copyDatatoHistory();
    if (statusCopy) {
      const splitDate = dateRef.current.value.split("/");
      const rearrangedDate = splitDate.reverse().join("-");

      const intReviseId = parseInt(reviseId);
      const newIntReviseId = intReviseId + 1;
      const newStrReviseId = String(newIntReviseId).padStart(2, "0");

      try {
        const res = await fetch(
          `${import.meta.env.VITE_SERVER}/Quotation.php?server=${
            userInfo.server_db
          }&username=${userInfo.username_db}&password=${
            userInfo.password_db
          }&db=${
            userInfo.name_db
          }&action=insert&quotationId=${qo_id}&reviseid=${newStrReviseId}&customerId=${
            customerRef.current.value
          }&projectId=${projectRef.current.value}&companyId=${
            companyRef.current.value
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
        if (data == "ok") {
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
              }&action=insertitem&quotationId=${qo_id}&reviseid=${newStrReviseId}&productId=${
                pd_id[0]
              }&item_qty=${el.qty}`,
              {
                method: "POST",
              }
            );

            const data = await res.json();
            ////console.log(data);
          });

          if (data == "ok") {
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
    }
  };

  //const [customer, setCustomer] = useState([]);
  const [reviseId, setReviseId] = useState();
  const customerRef = useRef(null);

  const customerNameRef = useRef(null);
  const customerEmailRef = useRef(null);
  const customerTelRef = useRef(null);

  const companyRef = useRef(null);
  const companyNameRef = useRef(null);
  const companyTaxRef = useRef(null);
  const companyAddressRef = useRef(null);
  const companyTelRef = useRef(null);

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
  const [isCheckVat, setIsCheckVat] = useState(true);
  const vatRef = useRef(0.0);
  const [isCheckWithHolding, setIsCheckWithHolding] = useState(false);
  const withHoldingRef = useRef(null);
  const overallRef = useRef(null);

  const calOverall = async () => {
    if (
      qo_totalprice !== 0 &&
      totalPriceRef.current &&
      totalPriceRef.current.value === ""
    ) {
      totalPriceRef.current.value = qo_totalprice;
      percentDiscountRef.current.value = 0;
      discountRef.current.value = 0;
      priceAfterDiscountRef.current.value = qo_totalprice;
      qo_totalprice = 0;
    }
    //cal discount
    //console.log(percentDiscountRef.current.value);
    if (percentDiscountRef.current.value === 0) {
      priceAfterDiscountRef.current.value = totalPriceRef.current.value;
    } else if (
      totalPriceRef.current &&
      parseFloat(totalPriceRef.current.value) === 0
    ) {
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
    } else if (priceAfterDiscountRef.current.value === null) {
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
      console.log("oveo all => " + overallRef.current.value);
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
    let totalPriceRow = 0;
    rows.map((row) => {
      totalPrice = totalPrice + row.sumprice;
    });
    totalPriceRef.current.value = totalPrice;
    priceAfterDiscountRef.current.value = totalPrice;

    handleDiscountChange(discountRef.current.value);
    //console.log(totalPriceRef.current.value);
  };

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

  /* Get Product Data */

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
      console.log("fffffff" + data);
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

  /* Dynamic rows */
  const [rows, setRows] = useState([
    /* { id: 0, name: '', des: '', price: '', qty: '', sumprice: ''}, */
  ]);

  const addRow = () => {
    if (rows == []) {
      setRows({ id: 0, name: "", des: "", price: "", qty: "", sumprice: "" });
    } else {
      const newRow = {
        id: rows.length + 1,
        name: "",
        des: "",
        price: "",
        qty: "",
        sumprice: "",
      };
      setRows([...rows, newRow]);
    }
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
          <Typeahead
            id={`typeahead-${rowIndex}`}
            labelKey="label"
            defaultSelected={[{ label: row.name }]}
            onChange={async (selected) => {
              if (selected && selected.length > 0) {
                const [idName, description, price] =
                  selected[0].value.split("|");
                await handleRowChange(idName, rowIndex, "name");
                await handleRowChange(description, rowIndex, "des");
                await handleRowChange(price, rowIndex, "price");
              }
            }}
            options={products.map((product) => ({
              value: `${product.pd_id}-${product.pd_name}|${product.pd_description}|${product.pd_sellprice}`,
              label: `${product.pd_id}-${product.pd_name}`,
            }))}
            placeholder="Select Product"
          />
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
      {/* <td>
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
                console.log(row.price * e.target.value);
              );
              await sumToTotalPrice();
              await calOverall();
            }}
          />
        </Form.Group>
      </td> */}
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
        <Button
          variant="danger"
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
        </Button>
      </td>
    </tr>
  );

  /* Dynamic rows */

  useEffect(() => {
    if (userInfo) {
      ////getId();
      getProduct();
    }
  }, [location, userInfo]);

  useEffect(() => {
    if (userInfo) {
      getProject();
      getCustomer();
      getCompany();
      getQuotation();
    }
  }, [products]);

  useEffect(() => {
    setOldItem();
  }, [items]);

  //calOverall();
  return (
    <>
      <div className="m-5">
        <h1 className="mb-3">Revise Quotation</h1>

        <Card body>
          <Form noValidate validated={validated} onSubmit={handleSubmit}>
            <div className="d-flex align-items-center justify-content-between ">
              <h1 className="text-info fw-bold mb-3">
                {qo_id}-{reviseId}
              </h1>
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

                  <Form.Group as={Col} md="12">
                    <Form.Control
                      required
                      readOnly
                      type="text"
                      placeholder=""
                      ref={companyRef}
                    />
                  </Form.Group>
                </Form.Group>

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
                    value={currency}
                    required
                    onChange={(e) => {
                      setCurrency(e.target.value);
                    }}
                  >
                    <option value={"THB"}>THB</option>
                    <option value={"USD"}>USD</option>
                    <option value={"EUR"}>EUR</option>
                  </Form.Select>
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
                  </Form.Group>
                  <Form.Group as={Col} md="6" className="mt-2">
                    <Form.Label></Form.Label>
                    <Form.Select ref={timeunitRef}>
                      <option value={""}>--Select unit--</option>
                      <option value={"day"}>Day</option>
                      <option value={"week"}>Week</option>
                      <option value={"month"}>Month</option>
                      <option value={"year"}>Year</option>
                    </Form.Select>
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
                        <th>#</th>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Price</th>
                        <th>QTY</th>
                        <th>Sum Price</th>
                        <th>
                          <Button variant="success" onClick={addRow}>
                            <b>+</b>
                          </Button>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows != [] &&
                        rows.map((row, rowIndex) => renderRow(row, rowIndex))}
                    </tbody>
                  </Table>
                  {/* data table */}
                </Col>

                <Col md={2}>
                  <Row className="mt-3 px-3">
                    <Button size="lg" variant="warning" type="submit">
                      <b>Revise</b>
                    </Button>
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

export default QuotationRevise;
