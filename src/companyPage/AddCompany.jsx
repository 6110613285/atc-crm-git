import React, { useState, useRef, useEffect, useContext } from "react";
import { Button, Modal, Form, Row, Col, InputGroup } from "react-bootstrap";

import { Typeahead } from "react-bootstrap-typeahead";
import "react-bootstrap-typeahead/css/Typeahead.css";
import Swal from "sweetalert2";

import { UserContext } from "../App";

function AddCompany({ onSave }) {
  const userInfo = useContext(UserContext);

  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const [validated, setValidated] = useState(false);

  const [newAddress, setNewAddress] = useState(false);

  const companyNameRef = useRef(null);
  const companyNameThRef = useRef(null);
  const taxIdRef = useRef(null);
  const [branch, setBranch] = useState("สาขาใหญ่");
  const companyAddressRef = useRef(null);
  const companyDeliveryConditionRef = useRef(null);
  const companyTelRef = useRef(null);
  const mapRef = useRef(null);

  //Get province data
  const [provinceData, setProvinceData] = useState([]);
  const getProvince = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER}/Address.php?server=${
          userInfo.server_db
        }&username=${userInfo.username_db}&password=${
          userInfo.password_db
        }&db=${userInfo.name_db}&action=getprovince`,
        {
          method: "GET",
        }
      );
      const data = await res.json();
      //console.log(data);
      if (data === null) {
      } else {
        setProvinceData(data);
      }
    } catch (err) {
      console.log(err);
    }
  };
  //for set province in input autocomplete
  const [province, setProvince] = useState([]);
  const handleSelectedProvince = async (select) => {
    try {
      setProvince(select);
      ////console.log(select);
      if (select[0].customOption && select[0].customOption === true) {
        setNewAddress(true);
        setProvinceThData([]);
        setDistrictData([]);
        setDistrictThData([]);
        setSubDistrictData([]);
        setSubDistrictThData([]);
        setZipCodeData([]);
      } else {
        setNewAddress(false);
        await getProvinceTh(select[0].ads_province);
        await getDistriict(select[0].ads_province);
      }
    } catch (err) {
      console.log(err);
    }
  };
  //Get province TH data
  const [provinceThData, setProvinceThData] = useState([]);
  const getProvinceTh = async (province) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER}/Address.php?server=${
          userInfo.server_db
        }&username=${userInfo.username_db}&password=${
          userInfo.password_db
        }&db=${userInfo.name_db}&action=getprovinceth&where=${province}`,
        {
          method: "GET",
        }
      );
      const data = await res.json();
      //console.log(data);
      if (data === null) {
      } else {
        setProvinceThData(data);
      }
    } catch (err) {
      console.log(err);
    }
  };
  //for set province TH in input autocomplete
  const [provinceTh, setProvinceTh] = useState([]);
  const handleSelectedProvinceTh = async (select) => {
    setProvinceTh(select);
  };
  //Get district data
  const [districtData, setDistrictData] = useState([]);
  const getDistriict = async (province) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER}/Address.php?server=${
          userInfo.server_db
        }&username=${userInfo.username_db}&password=${
          userInfo.password_db
        }&db=${userInfo.name_db}&action=getdistrict&where=${province}`,
        {
          method: "GET",
        }
      );
      const data = await res.json();
      //console.log(data);
      if (data === null) {
      } else {
        setDistrictData(data);
      }
    } catch (err) {
      console.log(err);
    }
  };
  //for set district in input autocomplete
  const [district, setDistrict] = useState([]);
  const handleSelectedDistrict = async (select) => {
    setDistrict(select);
    if (select[0].customOption === true) {
      setNewAddress(true);
      setDistrictThData([]);
      setSubDistrictData([]);
      setSubDistrictThData([]);
      setZipCodeData([]);
    } else {
      setNewAddress(false);
      getDistriictTh(select[0].ads_district);
      getSubDistriict(select[0].ads_district);
    }
  };
  //Get district TH data
  const [districtThData, setDistrictThData] = useState([]);
  const getDistriictTh = async (province) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER}/Address.php?server=${
          userInfo.server_db
        }&username=${userInfo.username_db}&password=${
          userInfo.password_db
        }&db=${userInfo.name_db}&action=getdistrictth&where=${province}`,
        {
          method: "GET",
        }
      );
      const data = await res.json();
      //console.log(data);
      if (data === null) {
      } else {
        setDistrictThData(data);
      }
    } catch (err) {
      console.log(err);
    }
  };
  //for set district TH in input autocomplete
  const [districtTh, setDistrictTh] = useState([]);
  const handleSelectedDistrictTH = async (select) => {
    setDistrictTh(select);
  };
  //Get subdistrict data
  const [subDistrictData, setSubDistrictData] = useState([]);
  const getSubDistriict = async (district) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER}/Address.php?server=${
          userInfo.server_db
        }&username=${userInfo.username_db}&password=${
          userInfo.password_db
        }&db=${userInfo.name_db}&action=getsubdistrict&where=${district}`,
        {
          method: "GET",
        }
      );
      const data = await res.json();
      //console.log(data);
      if (data === null) {
      } else {
        setSubDistrictData(data);
      }
    } catch (err) {
      console.log(err);
    }
  };
  //for set subdistrict in input autocomplete
  const [subDistrict, setSubDistrict] = useState([]);
  const handleSelectedSubDistrict = async (select) => {
    setSubDistrict(select);
    if (select[0].customOption === true) {
      setNewAddress(true);
      setSubDistrictThData([]);
      setZipCodeData([]);
    } else {
      setNewAddress(false);
      getSubDistriictTh(select[0].ads_subdistrict);
      getZipcode(select[0].ads_subdistrict);
    }
  };
  //Get subdistrict TH data
  const [subDistrictThData, setSubDistrictThData] = useState([]);
  const getSubDistriictTh = async (subdistrict) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER}/Address.php?server=${
          userInfo.server_db
        }&username=${userInfo.username_db}&password=${
          userInfo.password_db
        }&db=${userInfo.name_db}&action=getsubdistrictth&where=${subdistrict}`,
        {
          method: "GET",
        }
      );
      const data = await res.json();
      //console.log(data);
      if (data === null) {
      } else {
        setSubDistrictThData(data);
      }
    } catch (err) {
      console.log(err);
    }
  };
  //for set subdistrict TH in input autocomplete
  const [subDistrictTh, setSubDistrictTh] = useState([]);
  const handleSelectedSubDistrictTh = async (select) => {
    setSubDistrictTh(select);
  };
  //Get Zipcode data
  const [zipCodeData, setZipCodeData] = useState([]);
  const getZipcode = async (subdistrict) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER}/Address.php?server=${
          userInfo.server_db
        }&username=${userInfo.username_db}&password=${
          userInfo.password_db
        }&db=${userInfo.name_db}&action=getzipcode&where=${subdistrict}`,
        {
          method: "GET",
        }
      );
      const data = await res.json();
      //console.log(data);
      if (data === null) {
      } else {
        setZipCodeData(data);
      }
    } catch (err) {
      console.log(err);
    }
  };
  //for set zipcode in input autocomplete
  const [zipCode, setZipCode] = useState([]);
  const handleSelectedZipCode = async (select) => {
    setZipCode(select);
  };

  const handleSubmit = (event) => {
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    } else {
      event.preventDefault();
      event.stopPropagation();

      addCompany();
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

    let id = `CO${yy}${month}${day}`;
    do {
      i++;
      let fullId = `${id}${i.toString().padStart(4, "0")}`;
      ////console.log(fullId);
      try {
        const res = await fetch(
          `${import.meta.env.VITE_SERVER}/Company.php?server=${
            userInfo.server_db
          }&username=${userInfo.username_db}&password=${
            userInfo.password_db
          }&db=${userInfo.name_db}&action=getwherecoid&id=${fullId}`,
          {
            method: "GET",
          }
        );
        data = await res.json();
      } catch (err) {
        console.log(err);
      }
      ////console.log("data: " + JSON.stringify(data));

      if (data == [] || data == null || data == "") {
        ////console.log(0);
        num = 0;
      } else {
        ////console.log(1);
        num = 1;
      }
    } while (num == 1);
    ////console.log("data: " + data);
    if (data != [] || data != null || data != "") {
      let co_id = id + i.toString().padStart(4, "0");
      return co_id;
    } else {
      let co_id = id + "0001";
      return co_id;
    }
  };

  const addCompany = async () => {
    const id = await genId();
    ////onsole.log(id);

    /* console.log(province[0].ads_province);
    console.log(provinceTh[0].ads_province_th);
    console.log(district[0].ads_district);
    console.log(districtTh[0].ads_district_th);
    console.log(subDistrict[0].ads_subdistrict);
    console.log(subDistrictTh[0].ads_subdistrict_th);
    console.log(zipCode); */
    try {
      if (newAddress === true) {
        alert("Insert New Address");

        const res = await fetch(
          `${import.meta.env.VITE_SERVER}/Address.php?server=${
            userInfo.server_db
          }&username=${userInfo.username_db}&password=${
            userInfo.password_db
          }&db=${userInfo.name_db}&action=insert&subdistrict=${
            subDistrict[0].ads_subdistrict
          }&subdistrictth=${subDistrictTh[0].ads_subdistrict_th}&district=${
            district[0].ads_district
          }&districtth=${districtTh[0].ads_district_th}&province=${
            province[0].ads_province
          }&provinceth=${provinceTh[0].ads_province_th}&zipcode=${
            zipCode[0].ads_zipcode
          }&user=${userInfo.user_id}`,
          {
            method: "POST",
          }
        );
        const data = await res.json();
        //console.log("insert new address success!!");
      }

      const res = await fetch(
        `${import.meta.env.VITE_SERVER}/Company.php?server=${
          userInfo.server_db
        }&username=${userInfo.username_db}&password=${
          userInfo.password_db
        }&db=${userInfo.name_db}&action=insert&companyId=${id}&name=${
          companyNameRef.current.value
        }&nameth=${companyNameThRef.current.value}&address=${
          companyAddressRef.current.value
        }&tax=${taxIdRef.current.value}&branch=${branch}&deliverycondition=${
          companyDeliveryConditionRef.current.value
        }&tel=${companyTelRef.current.value}&map=${mapRef.current.value}&user=${
          userInfo.user_id
        }&subdistrict=${subDistrict[0].ads_subdistrict}&subdistrictth=${
          subDistrictTh[0].ads_subdistrict_th
        }&district=${district[0].ads_district}&districtth=${
          districtTh[0].ads_district_th
        }&province=${province[0].ads_province}&provinceth=${
          provinceTh[0].ads_province_th
        }&zipcode=${zipCode[0].ads_zipcode}`,
        {
          method: "POST",
        }
      );
      const data = await res.json();
      ////console.log(data);

      if (data === "ok") {
        Swal.fire({
          position: "center",
          icon: "success",
          title: "Saved Success",
          showConfirmButton: false,
          timer: 1500,
        });
        //alert("Save Success!!");
        //window.location.reload();
        setShow(false);
        setProvince([]);
        setProvinceTh([]);
        setDistrict([]);
        setDistrictTh([]);
        setSubDistrict([]);
        setSubDistrictTh([]);
        setZipCode([]);
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
      getProvince();
    }
  }, [onSave]);

  return (
    <div>
      <Button
        className="fw-bold"
        variant="success"
        onClick={handleShow}
        data-bs-toggle="tooltip"
        data-bs-placement="top"
        title="add company data"
      >
        Add Company
      </Button>

      <Modal size="xl" show={show} onHide={handleClose}>
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>
              <b>Add Company</b>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row className="mb-1">
              <Form.Group as={Col} md="6" className="mb-3">
                <Form.Label>
                  <b>Commpany Name</b>
                </Form.Label>
                <Form.Control
                  required
                  type="text"
                  placeholder="Company Name"
                  ref={companyNameRef}
                />
                {/* <Form.Control.Feedback type="invalid">
                  <b>Please Enter Company Name.</b>
                </Form.Control.Feedback> */}
              </Form.Group>

              <Form.Group as={Col} md="6" className="mb-3">
                <Form.Label>
                  <b>Commpany Name TH</b>
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Company Name TH"
                  ref={companyNameThRef}
                />
              </Form.Group>

              <Form.Group as={Col} md="3" className="mb-3">
                <Form.Label>
                  <b>TAX ID.</b>
                </Form.Label>
                <Form.Control
                  ////required
                  type="number"
                  placeholder="Tax ID"
                  ref={taxIdRef}
                />
              </Form.Group>

              {branch === "สาขาใหญ่" ? (
                <Form.Group as={Col} md="3" className="mb-3">
                  <Form.Label>
                    <b>Branch</b>
                  </Form.Label>
                  <Form.Select
                    value={branch}
                    required
                    onChange={(e) => {
                      setBranch(e.target.value);
                    }}
                  >
                    <option value={"สาขาใหญ่"}>สาขาใหญ่</option>
                    <option value={"อื่นๆ"}>อื่นๆ</option>
                  </Form.Select>
                </Form.Group>
              ) : (
                <Form.Group as={Col} md="3" className="mb-3">
                  <Form.Label>
                    <b>Branch</b>
                  </Form.Label>
                  <InputGroup>
                    <Form.Control
                      onChange={(e) => {
                        setBranch(e.target.value);
                      }}
                      required
                      type="text"
                      placeholder="Company Branch"
                    />
                    <Button
                      variant="danger"
                      onClick={() => {
                        setBranch("สาขาใหญ่");
                      }}
                    >
                      X
                    </Button>
                  </InputGroup>
                </Form.Group>
              )}

              <Form.Group as={Col} md="3" className="mb-3">
                <Form.Label>
                  <b>Delivery Condition</b>
                </Form.Label>
                <Form.Select ref={companyDeliveryConditionRef} required>
                  <option value={""}>--Select Delivery Condition--</option>
                  <option value={"After PO"}>After PO</option>
                  <option value={"After Payment"}>After Payment</option>
                </Form.Select>
              </Form.Group>

              <Form.Group as={Col} md="3" className="mb-3">
                <Form.Label>
                  <b>Company Address</b>
                </Form.Label>
                <Form.Control
                  required
                  type="text"
                  placeholder="Company Address"
                  ref={companyAddressRef}
                />
              </Form.Group>

              <Form.Group as={Col} md="3" className="mb-3">
                <Form.Label>
                  <b>Province</b>
                </Form.Label>
                <Typeahead
                  id="basic-typeahead-single"
                  labelKey="ads_province"
                  onChange={handleSelectedProvince}
                  options={provinceData}
                  selected={province}
                  allowNew
                />
              </Form.Group>
              <Form.Group as={Col} md="3" className="mb-3">
                <Form.Label>
                  <b>จังหวัด</b>
                </Form.Label>
                <Typeahead
                  id="basic-typeahead-single"
                  labelKey="ads_province_th"
                  onChange={handleSelectedProvinceTh}
                  options={provinceThData}
                  selected={provinceTh}
                  allowNew
                />
              </Form.Group>

              <Form.Group as={Col} md="3" className="mb-3">
                <Form.Label>
                  <b>District</b>
                </Form.Label>
                <Typeahead
                  id="basic-typeahead-single"
                  labelKey="ads_district"
                  onChange={handleSelectedDistrict}
                  options={districtData}
                  selected={district}
                  allowNew
                />
              </Form.Group>
              <Form.Group as={Col} md="3" className="mb-3">
                <Form.Label>
                  <b>อำเภอ/เขต</b>
                </Form.Label>
                <Typeahead
                  id="basic-typeahead-single"
                  labelKey="ads_district_th"
                  onChange={handleSelectedDistrictTH}
                  options={districtThData}
                  selected={districtTh}
                  allowNew
                />
              </Form.Group>

              <Form.Group as={Col} md="3" className="mb-3">
                <Form.Label>
                  <b>Sub District</b>
                </Form.Label>
                <Typeahead
                  id="basic-typeahead-single"
                  labelKey="ads_subdistrict"
                  onChange={handleSelectedSubDistrict}
                  options={subDistrictData}
                  selected={subDistrict}
                  allowNew
                />
              </Form.Group>
              <Form.Group as={Col} md="3" className="mb-3">
                <Form.Label>
                  <b>ตำบล/แขวง</b>
                </Form.Label>
                <Typeahead
                  id="basic-typeahead-single"
                  labelKey="ads_subdistrict_th"
                  onChange={handleSelectedSubDistrictTh}
                  options={subDistrictThData}
                  selected={subDistrictTh}
                  allowNew
                />
              </Form.Group>

              <Form.Group as={Col} md="3" className="mb-3">
                <Form.Label>
                  <b>Zip Code</b>
                </Form.Label>
                <Typeahead
                  id="basic-typeahead-single"
                  labelKey="ads_zipcode"
                  onChange={handleSelectedZipCode}
                  options={zipCodeData}
                  selected={zipCode}
                  allowNew
                />
              </Form.Group>

              <Form.Group as={Col} md="3" className="mb-3">
                <Form.Label>
                  <b>Company Tel</b>
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Company Tel"
                  ref={companyTelRef}
                />
              </Form.Group>

              <Form.Group as={Col} md="6" className="mb-3">
                <Form.Label>
                  <b>Maps</b>
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Maps link"
                  ref={mapRef}
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
    </div>
  );
}

export default AddCompany;
