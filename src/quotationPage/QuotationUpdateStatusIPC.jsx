import React, { useContext, useState } from "react";
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

import { UserContext } from "../App";

import Swal from "sweetalert2";

function QuotationUpdateStatusIPC({ qo_id }) {
  const userInfo = useContext(UserContext);

  const navigate = useNavigate();

  const handleApprove = async (e) => {
    if (e.target.name == "approve") {
      Swal.fire({
        input: "textarea",
        title: "Are you sure?",
        inputPlaceholder: "Enter your comment",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#198754",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Approve",
      }).then((result) => {
        if (result.isConfirmed) {
          updateStatusQo("approve", result.value);
        }
      });
    } else if (e.target.name == "reject") {
      Swal.fire({
        input: "textarea",
        title: "Are you sure?",
        inputPlaceholder: "Enter your comment",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#ffc107",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Reject",
      }).then((result) => {
        if (result.isConfirmed) {
          updateStatusQo("reject", result.value);
        }
      });
    } else if (e.target.name == "cancel") {
      Swal.fire({
        input: "textarea",
        title: "Are you sure?",
        inputPlaceholder: "Enter your comment",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#dc3545",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Cancel QO",
      }).then((result) => {
        if (result.isConfirmed) {
          updateStatusQo("cancel", result.value);
        }
      });
    }
  };

  const updateStatusQo = async (status, comment) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER}/Quotation.php?server=${
          userInfo.server_db
        }&username=${userInfo.username_db}&password=${
          userInfo.password_db
        }&db=${
          userInfo.name_db
        }&action=updateipc&qoid=${qo_id}&statusapprove=${status}&comment=${comment}&user=${
          userInfo.user_id
        }`,
        {
          method: "GET",
        }
      );
      const data = await res.json();

      if (data === "ok") {
        Swal.fire({
          position: "center",
          icon: "success",
          title: "Update Success",
          showConfirmButton: false,
          timer: 1500,
        });

        navigate("/QuotationListIPC");
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

  return (
    <div>
      <div className="d-flex justify-content-end gap-1 mb-2">
        <Button
          variant="success fw-bold text-dark"
          name="approve"
          onClick={handleApprove}
        >
          Approve
        </Button>
        <Button variant="warning fw-bold" name="reject" onClick={handleApprove}>
          Reject
        </Button>
        <Button
          variant="danger fw-bold text-dark"
          name="cancel"
          onClick={handleApprove}
        >
          Cancel QO
        </Button>
      </div>
    </div>
  );
}

export default QuotationUpdateStatusIPC;
