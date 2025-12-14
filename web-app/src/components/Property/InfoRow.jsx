import React from "react";

const InfoRow = ({ label, value }) => (
  <div>
    <span className="text-gray-600">{label}:</span>{" "}
    <span className="font-medium">{value || "N/A"}</span>
  </div>
);

export default InfoRow;
