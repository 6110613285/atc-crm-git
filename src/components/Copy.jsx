import React from "react";
import Swal from "sweetalert2";
import clipboardCopy from "clipboard-copy";

function Copy(text) {
  clipboardCopy(text);
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 1000,
    timerProgressBar: false,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer)
      toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
  })
  
  Toast.fire({
    icon: 'success',
    title: 'Copied to clipboard'
  })
}

export default Copy;
