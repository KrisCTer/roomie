import React from "react";
import { Eye, EyeOff } from "lucide-react";

const PasswordField = ({ label, name, value, onChange, show, onToggle }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          className="w-full px-4 py-2.5 border border-[#E9DECF] bg-white/65 rounded-xl pr-12 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition"
        />

        <button
          type="button"
          onClick={onToggle}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#CC6F4A] transition"
        >
          {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
};

export default PasswordField;
