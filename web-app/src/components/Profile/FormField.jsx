import React from "react";

const FormField = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  readOnly,
  options, // For select dropdown
}) => {
  // If options provided, render select dropdown
  if (options) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
        <select
          name={name}
          value={value || ""}
          onChange={onChange}
          disabled={readOnly}
          className={`w-full px-4 py-2.5 border rounded-lg transition
            ${
              readOnly
                ? "bg-gray-100 text-gray-600 cursor-not-allowed"
                : "border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            }`}
        >
          <option value="">-- Chọn {label} --</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  // Regular input field
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly}
        className={`w-full px-4 py-2.5 border rounded-lg transition
          ${
            readOnly
              ? "bg-gray-100 text-gray-600 cursor-not-allowed"
              : "border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          }`}
      />
    </div>
  );
};

export default FormField;
