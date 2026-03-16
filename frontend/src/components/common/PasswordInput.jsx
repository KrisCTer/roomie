import React, { useState } from "react";
export default function PasswordInput({
  label = "Password",
  value,
  onChange,
  placeholder,
  name,
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="field">
      <label className="label" htmlFor={name}>
        {label}
      </label>
      <div className="password-wrap">
        <input
          id={name}
          name={name}
          className="input"
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
        <button
          type="button"
          className="toggle"
          onClick={() => setShow((s) => !s)}
        >
          {show ? "Hide" : "Show"}
        </button>
      </div>
    </div>
  );
}
