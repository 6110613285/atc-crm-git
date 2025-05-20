import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import LoginPage from "./loginPage/LoginPage";

import "bootstrap/dist/css/bootstrap.min.css";

function clearLocalStorage() {
  localStorage.clear();
  location.reload();
}
//28800000
setTimeout(clearLocalStorage, 14400000);

if (localStorage.getItem("isLoggedIn") === "true") {
  ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <LoginPage />
    </React.StrictMode>
  );
}

