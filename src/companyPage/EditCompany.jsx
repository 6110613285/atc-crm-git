import React, { useEffect, useState, useRef, useContext } from "react";
import { Modal, Button, Form, Row, Col, InputGroup } from "react-bootstrap";

import { Typeahead } from "react-bootstrap-typeahead";
import "react-bootstrap-typeahead/css/Typeahead.css";

import { UserContext } from "../App";
import Swal from "sweetalert2";

function EditCompany({ co_id, onSave }) {
  const [show, setShow] = useState(false);

  const userInfo = useContext(UserContext);

  const [validated, setValidated] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  /* Get Company Data */
  //const [companies, setCompanies] = useState([]);
  const getCompany = async () => {
    try {
      ////console.log(userInfo.name_db);
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
        //setCompanies(data);
        setDataEdit(data);
      }
    } catch (err) {
      console.log(err);
    }
  };
  /* Get Company Data */

  //Auto complete
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
  }; //Get Zipcode data
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
  //End Auto complete

  const companyIdEditRef = useRef(null);
  const [companyNameEdit, setCompanyNameEdit] = useState("");
  const [companyNameThEdit, setCompanyNameThEdit] = useState("");
  const [companyTaxEdit, setCompanyTaxEdit] = useState("");
  const [companyTelEdit, setCompanyTelEdit] = useState("");
  const [companyBranchEdit, setCompanyBranchEdit] = useState("");
  const [companyDeliveryConditionEdit, setCompanyDeliveryConditionEdit] =
    useState("");
  const [companyAddressEdit, setCompanyAddressEdit] = useState("");
  const [companySubDistrictEdit, setCompanySubDistrictEdit] = useState([]);
  const [companySubDistrictThEdit, setCompanySubDistrictThEdit] = useState([]);
  const [companyDistrictEdit, setCompanyDistrictEdit] = useState([]);
  const [companyDistrictThEdit, setCompanyDistrictThEdit] = useState([]);
  const [companyProvinceEdit, setCompanyProvinceEdit] = useState([]);
  const [companyProvinceThEdit, setCompanyProvinceThEdit] = useState([]);
  const [companyZipcodeEdit, setCompanyZipcodeEdit] = useState([]);
  const [companyMapsEdit, setCompanyMapsEdit] = useState();

  const handleEditCompanySubmit = (event) => {
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    } else {
      event.preventDefault();
      event.stopPropagation();

      updateCompany();
    }
    setValidated(true);
  };

  const updateCompany = async () => {
    //console.log("update");
    //console.log(companyNameEdit);
    try {
      let subdistrict;
      let subdistrictth;
      let district;
      let districtth;
      let province;
      let provinceth;
      let zipcode;

      //subdistrict
      if (companySubDistrictEdit[0].ads_subdistrict) {
        subdistrict = companySubDistrictEdit[0].ads_subdistrict;
      } else {
        subdistrict = companySubDistrictEdit[0];
      }
      if (companySubDistrictThEdit[0].ads_subdistrict_th) {
        subdistrictth = companySubDistrictThEdit[0].ads_subdistrict_th;
      } else {
        subdistrictth = companySubDistrictThEdit[0];
      }
      //district
      if (companyDistrictEdit[0].ads_district) {
        district = companyDistrictEdit[0].ads_district;
      } else {
        district = companyDistrictEdit[0];
      }
      if (companyDistrictThEdit[0].ads_district_th) {
        districtth = companyDistrictThEdit[0].ads_district_th;
      } else {
        districtth = companyDistrictThEdit[0];
      }
      //province
      if (companyProvinceEdit[0].ads_province) {
        province = companyProvinceEdit[0].ads_province;
      } else {
        province = companyProvinceEdit[0];
      }
      if (companyProvinceThEdit[0].ads_province_th) {
        provinceth = companyProvinceThEdit[0].ads_province_th;
      } else {
        provinceth = companyProvinceThEdit[0];
      }
      //zipcode
      if (companyZipcodeEdit[0].ads_zipcode) {
        zipcode = companyZipcodeEdit[0].ads_zipcode;
      } else {
        zipcode = companyZipcodeEdit[0];
      }
      const res = await fetch(
        `${import.meta.env.VITE_SERVER}/Company.php?server=${
          userInfo.server_db
        }&username=${userInfo.username_db}&password=${
          userInfo.password_db
        }&db=${
          userInfo.name_db
        }&action=update&id=${co_id}&name=${companyNameEdit}&nameth=${companyNameThEdit}&tax=${companyTaxEdit}&tel=${companyTelEdit}&branch=${companyBranchEdit}&deliverycondition=${companyDeliveryConditionEdit}&address=${companyAddressEdit}&subdistrict=${subdistrict}&subdistrictth=${subdistrictth}&district=${district}&districtth=${districtth}&province=${province}&provinceth=${provinceth}&zipcode=${zipcode}&map=${companyMapsEdit}`,
        {
          method: "POST",
        }
      );

      const data = await res.json();
      /////console.log(res);
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
      } else {
        console.log("fail");
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

  const handleSelectedProvinceEdit = async (select) => {
    setCompanyProvinceEdit(select);
    await getProvinceTh(select[0].ads_province);
    await getDistriict(select[0].ads_province);

    setCompanyProvinceThEdit([]);
    setCompanyDistrictEdit([]);
    setCompanyDistrictThEdit([]);
    setCompanySubDistrictEdit([]);
    setCompanySubDistrictThEdit([]);
    setCompanyZipcodeEdit([]);
  };
  const handleSelectedProvinceThEdit = async (select) => {
    setCompanyProvinceThEdit(select);
  };
  const handleSelectedDistrictEdit = async (select) => {
    setCompanyDistrictEdit(select);
    /* if (select[0].customOption === true) {
      setNewAddress(true);
      setDistrictThData([]);
      setSubDistrictData([]);
      setSubDistrictThData([]);
      setZipCodeData([]);
    } else { */

    getDistriictTh(select[0].ads_district);
    getSubDistriict(select[0].ads_district);
    /* } */
  };
  const handleSelectedDistrictThEdit = async (select) => {
    setCompanyDistrictThEdit(select);
  };
  const handleSelectedSubDistrictEdit = async (select) => {
    setCompanySubDistrictEdit(select);
    /* if (select[0].customOption === true) {
      setNewAddress(true);
      setSubDistrictThData([]);
      setZipCodeData([]);
    } else { */

    getSubDistriictTh(select[0].ads_subdistrict);
    getZipcode(select[0].ads_subdistrict);
    /* } */
  };
  const handleSelectedSubDistrictThEdit = async (select) => {
    setCompanySubDistrictThEdit(select);
  };
  const handleSelectedZipcodeEdit = async (select) => {
    setCompanyZipcodeEdit(select);
  };

  const setDataEdit = async (data) => {
    ////console.log(data);
    setCompanyNameEdit(data[0].co_name);
    setCompanyNameThEdit(data[0].co_name_th);
    setCompanyTaxEdit(data[0].co_tax);
    setCompanyTelEdit(data[0].co_tel);
    setCompanyBranchEdit(data[0].co_branch);
    setCompanyDeliveryConditionEdit(data[0].co_delivery_condition);
    setCompanyAddressEdit(data[0].co_address);
    setCompanyProvinceEdit([data[0].co_province]);
    setCompanyProvinceThEdit([data[0].co_province_th]);
    setCompanyDistrictEdit([data[0].co_district]);
    setCompanyDistrictThEdit([data[0].co_district_th]);
    setCompanySubDistrictEdit([data[0].co_subdistrict]);
    setCompanySubDistrictThEdit([data[0].co_subdistrict_th]);
    setCompanyZipcodeEdit([data[0].co_zipcode]);
    setCompanyMapsEdit(data[0].co_map);
  };

  useEffect(() => {
    getCompany();
    getProvince();
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
          onSubmit={handleEditCompanySubmit}
        >
          <Modal.Header closeButton>
            <Modal.Title>
              <b>Edit Company ( {co_id} )</b>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row>
              <Form.Group as={Col} md="6" className="mb-3">
                <Form.Label>
                  <b>Company Name</b>
                </Form.Label>
                <Form.Control
                  required
                  type="text"
                  placeholder="Company Name"
                  value={companyNameEdit}
                  onChange={(e) => {
                    setCompanyNameEdit(e.target.value);
                  }}
                />
              </Form.Group>

              <Form.Group as={Col} md="6" className="mb-3">
                <Form.Label>
                  <b>Company Name TH</b>
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Company Name TH"
                  value={companyNameThEdit}
                  onChange={(e) => {
                    setCompanyNameThEdit(e.target.value);
                  }}
                />
              </Form.Group>

              <Form.Group as={Col} lg="3" md="6" className="mb-3">
                <Form.Label>
                  <b>Tax</b>
                </Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Tax"
                  value={companyTaxEdit}
                  onChange={(e) => {
                    setCompanyTaxEdit(e.target.value);
                  }}
                />
              </Form.Group>

              <Form.Group as={Col} lg="3" md="6" className="mb-3">
                <Form.Label>
                  <b>Tel</b>
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Tel"
                  value={companyTelEdit}
                  onChange={(e) => {
                    setCompanyTelEdit(e.target.value);
                  }}
                />
              </Form.Group>

              {companyBranchEdit === "สาขาใหญ่" ? (
                <Form.Group as={Col} lg="3" md="6" className="mb-3">
                  <Form.Label>
                    <b>Branch</b>
                  </Form.Label>
                  <Form.Select
                    value={companyBranchEdit}
                    required
                    onChange={(e) => {
                      setCompanyBranchEdit(e.target.value);
                    }}
                  >
                    <option value={"สาขาใหญ่"}>สาขาใหญ่</option>
                    <option value={"อื่นๆ"}>อื่นๆ</option>
                  </Form.Select>
                </Form.Group>
              ) : (
                <Form.Group as={Col} lg="3" md="6" className="mb-3">
                  <Form.Label>
                    <b>Branch</b>
                  </Form.Label>
                  <InputGroup>
                    <Form.Control
                      value={companyBranchEdit}
                      onChange={(e) => {
                        setCompanyBranchEdit(e.target.value);
                      }}
                      required
                      type="text"
                      placeholder="Company Branch"
                    />
                    <Button
                      variant="danger"
                      onClick={() => {
                        setCompanyBranchEdit("สาขาใหญ่");
                      }}
                    >
                      X
                    </Button>
                  </InputGroup>
                </Form.Group>
              )}

              <Form.Group as={Col} lg="3" md="6" className="mb-3">
                <Form.Label>
                  <b>Delivery Condition</b>
                </Form.Label>
                <Form.Select
                  required
                  value={companyDeliveryConditionEdit}
                  onChange={(e) => {
                    setCompanyDeliveryConditionEdit(e.target.value);
                  }}
                >
                  <option value={""}>--Select Delivery Condition--</option>
                  <option value={"After PO"}>After PO</option>
                  <option value={"After Payment"}>After Payment</option>
                </Form.Select>
              </Form.Group>

              <Form.Group as={Col} md="6" className="mb-3">
                <Form.Label>
                  <b>Address</b>
                </Form.Label>
                <Form.Control
                  required
                  type="text"
                  placeholder="Address"
                  value={companyAddressEdit}
                  onChange={(e) => {
                    setCompanyAddressEdit(e.target.value);
                  }}
                />
              </Form.Group>

              <Form.Group as={Col} md="6" className="mb-3">
                <Form.Label>
                  <b>Province</b>
                </Form.Label>
                <Typeahead
                  id="basic-typeahead-single"
                  labelKey="ads_province"
                  onChange={handleSelectedProvinceEdit}
                  options={provinceData}
                  selected={companyProvinceEdit}
                />
              </Form.Group>

              <Form.Group as={Col} md="6" className="mb-3">
                <Form.Label>
                  <b>จังหวัด</b>
                </Form.Label>
                <Typeahead
                  id="basic-typeahead-single"
                  labelKey="ads_province_th"
                  onChange={handleSelectedProvinceThEdit}
                  options={provinceThData}
                  selected={companyProvinceThEdit}
                />
              </Form.Group>

              <Form.Group as={Col} md="6" className="mb-3">
                <Form.Label>
                  <b>Districk</b>
                </Form.Label>
                <Typeahead
                  id="basic-typeahead-single"
                  labelKey="ads_district"
                  onChange={handleSelectedDistrictEdit}
                  options={districtData}
                  selected={companyDistrictEdit}
                />
              </Form.Group>

              <Form.Group as={Col} md="6" className="mb-3">
                <Form.Label>
                  <b>อำเภอ</b>
                </Form.Label>
                <Typeahead
                  id="basic-typeahead-single"
                  labelKey="ads_district_th"
                  onChange={handleSelectedDistrictThEdit}
                  options={districtThData}
                  selected={companyDistrictThEdit}
                />
              </Form.Group>

              <Form.Group as={Col} md="6" className="mb-3">
                <Form.Label>
                  <b>Sub Districk</b>
                </Form.Label>
                <Typeahead
                  id="basic-typeahead-single"
                  labelKey="ads_subdistrict"
                  onChange={handleSelectedSubDistrictEdit}
                  options={subDistrictData}
                  selected={companySubDistrictEdit}
                />
              </Form.Group>

              <Form.Group as={Col} md="6" className="mb-3">
                <Form.Label>
                  <b>ตำบล</b>
                </Form.Label>
                <Typeahead
                  id="basic-typeahead-single"
                  labelKey="ads_subdistrict_th"
                  onChange={handleSelectedSubDistrictThEdit}
                  options={subDistrictThData}
                  selected={companySubDistrictThEdit}
                />
              </Form.Group>

              <Form.Group as={Col} md="6" className="mb-3">
                <Form.Label>
                  <b>Zipcode</b>
                </Form.Label>
                <Typeahead
                  id="basic-typeahead-single"
                  labelKey="ads_zipcode"
                  onChange={handleSelectedZipcodeEdit}
                  options={zipCodeData}
                  selected={companyZipcodeEdit}
                />
              </Form.Group>
              <Form.Group as={Col} md="6" className="mb-3">
                <Form.Label>
                  <b>Maps</b>
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Maps Link"
                  value={companyMapsEdit}
                  onChange={(e) => {
                    setCompanyMapsEdit(e.target.value);
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

export default EditCompany;
