import React from "react";

export default function SortDateTime({ props }) {
  const split = props.split(" ");
  const splitDate = split[0].split("-");

  const result = `${splitDate[2]}/${splitDate[1]}/${splitDate[0]} ${split[1]}`;

  

  return <div>{result}</div>;
}
