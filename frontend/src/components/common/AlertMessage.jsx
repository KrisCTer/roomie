import React from "react";

const AlertMessage = ({ type = "error", message, onClose }) => {
  if (!message) return null;

  const config = {
    success: {
      bg: "bg-green-50",
      border: "border-green-400",
      text: "text-green-700",
      icon: "✔",
      title: "Success",
    },
    error: {
      bg: "bg-red-50",
      border: "border-red-400",
      text: "text-red-700",
      icon: "⚠",
      title: "Error",
    },
  };

  const c = config[type];

  return (
    <div
      className={`border ${c.border} ${c.bg} ${c.text} px-4 py-3 rounded-lg mb-6 flex items-start gap-3`}
    >
      <span className="text-lg">{c.icon}</span>

      <div className="flex-1">
        <p className="font-semibold">{c.title}</p>
        <p className="text-sm">{message}</p>
      </div>

      {onClose && (
        <button
          onClick={onClose}
          className="text-sm opacity-70 hover:opacity-100"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default AlertMessage;
