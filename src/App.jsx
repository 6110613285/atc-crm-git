import React, { createContext, useEffect, useState } from "react";

import NavbarComponent from "./components/NavbarComponent";
import HomePage from "./homePage/HomePage";
import Dashboard from "./homePage/Dashboard";
import ProjectPage from "./projectPage/ProjectPage";
import CompanyPage from "./companyPage/CompanyPage";
import CustomerPage from "./customerPage/CustomerPage";
import CallRecordPage from "./callRecordPage/CallRecordPage";
import AppointmentPage from "./appointmentPage/AppointmentPage";
import QuotationPage from "./quotationPage/QuotationPage";
import QuotationPage2 from "./quotationPage/QuotationPage2";
import ProductPage from "./productPage/ProductPage";
import CompanySelectedPage from "./companyPage/CompanySelectedPage";
import ManagePage from "./manage/ManagePage";
import QuotationList from "./quotationPage/QuotationList";
import QuotationApprove from "./quotationPage/quotationApprove";
import QuotationApproveIPC from "./quotationPage/QuotationApproveIPC";
import QuotationView from "./quotationPage/QuotationView";
import QuotationPdf from "./quotationPage/QuotationPdf";
import QuotationPdfIPC from "./quotationPage/QuotationPdfIPC";
import QuotationCreate from "./quotationPage/QuotationCreate";
import QuotationCopy from "./quotationPage/QuotationCopy";
import QuotationRevise from "./quotationPage/QuotationRevise";
import QuotationListIPC from "./quotationPage/QuotationListIPC";
import Selectpage from "./Stockpage/Selectpage";
import Managepart from "./Stockpage/managepart";
import LogStock from "./Stockpage/logstock";
import TypePage from "./Stockpage/typePage";
import Locationmanage from "./Stockpage/locationmanage";
import ReceivePart from "./Stockpage/Receivepart";
import LogHistory from "./Stockpage/log";
import BorrowPage from "./Stockpage/borrowpage";
import Bucket from "./Stockpage/Bucket";
import FixListPage from "./productPage/Fixlist";
import PcLog from "./productPage/Pclog";
import AdminUser from "./Stockpage/AdminUser";
import SNproduct from "./productPage/CreateSerial";

import "./app.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

export const UserContext = createContext();

function App() {
  const [userInfo, setUserInfo] = useState([]);

  const getUser = async () => {
    const res = await fetch(
      `${import.meta.env.VITE_SERVER}/User.php?server=${
        userInfo.server_db
      }&username=${userInfo.username_db}&password=${userInfo.password_db}&db=${
        userInfo.name_db
      }&action=getwheretoken&token=${localStorage.getItem("token")}`,
      {
        method: "GET",
      }
    );
    const data = await res.json();
    ////console.log(data);
    if (data === null) {
      localStorage.clear();
      location.reload();
    } else {
      setUserInfo(data);

      if (data[0].status === 0 || data[0].status === "0") {
        localStorage.clear();
        location.reload();
      }
    }
  };

  useEffect(() => {
    //setInterval(() => {

    getUser();

    //}, 3600000);
  }, []);

  return (
    <>
      {/* <BrowserRouter basename="/store">
          {window.location.pathname != "/store/QuotationPdf" ? ( */}

      <UserContext.Provider value={userInfo[0]}>
        <BrowserRouter basename="/ERP">
          {window.location.pathname != "/ERP/QuotationPdf" ? (
            <NavbarComponent />
          ) : (
            <></>
          )}
          <Routes>
            <Route path="/Dashboard" element={<Dashboard />}></Route>
            <Route path="/Home" element={<HomePage />}></Route>
            <Route path="/Project" element={<ProjectPage />}></Route>
            <Route path="/Company" element={<CompanyPage />}></Route>
            <Route path="/Customer" element={<CustomerPage />}></Route>
            <Route path="/Callrecord" element={<CallRecordPage />}></Route>
            <Route path="/Appointment" element={<AppointmentPage />}></Route>
            <Route path="/Quotation" element={<QuotationPage />}></Route>
            <Route path="/Quotation2" element={<QuotationPage2 />}></Route>
            <Route path="/QuotationView" element={<QuotationView />}></Route>
            <Route path="/Product" element={<ProductPage />}></Route>
            <Route path="/Selectpage" element={<Selectpage />}></Route>
            <Route path="/Stock" element={<LogStock />}></Route>
            <Route path="/TypePage" element={<TypePage />}></Route>
            <Route path="/Managepart" element={<Managepart />}></Route>
            <Route path="/LocationPage" element={<Locationmanage />}></Route>
            <Route path="/Receive" element={<ReceivePart />}></Route>
            <Route path="/logs" element={<LogHistory />}></Route>
            <Route path="/Borrow" element={<BorrowPage />}></Route>
            <Route path="/Bucket" element={<Bucket />}></Route>
            <Route path="/Fix" element={<FixListPage />}></Route>
            <Route path="/AdminUser" element={<AdminUser />}></Route>
            <Route path="/pc-log" element={<PcLog />} />
            <Route path="/SNproduct" element={<SNproduct />}></Route>
            
            <Route
              path="/SelectedCompany"
              element={<CompanySelectedPage />}
            ></Route>
            <Route path="/Manage" element={<ManagePage />}></Route>
            <Route path="/QuotationList" element={<QuotationList />}></Route>
            <Route
              path="/QuotationListIPC"
              element={<QuotationListIPC />}
            ></Route>
            <Route path="/QuotationPdf" element={<QuotationPdf />}></Route>
            <Route
              path="/QuotationPdfIPC"
              element={<QuotationPdfIPC />}
            ></Route>
            <Route
              path="/QuotationApprove"
              element={<QuotationApprove />}
            ></Route>
            <Route
              path="/QuotationApproveIPC"
              element={<QuotationApproveIPC />}
            ></Route>
            <Route
              path="/QuotationCreate"
              element={<QuotationCreate />}
            ></Route>
            <Route path="/QuotationCopy" element={<QuotationCopy />}></Route>
            <Route
              path="/QuotationRevise"
              element={<QuotationRevise />}
            ></Route>
          </Routes>
        </BrowserRouter>
      </UserContext.Provider>
    </>
  );
}

export default App;
