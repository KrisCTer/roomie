import React from "react";
export default function Button({
  children,
  type = "button",
  onClick,
  disabled,
  full = false,
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`btn ${full ? "btn--full" : ""}`}
    >
      {children}
    </button>
  );
}
