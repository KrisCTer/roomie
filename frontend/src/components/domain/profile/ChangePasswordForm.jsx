/* aria-label */
import React, { useState } from "react";
import PasswordField from "./PasswordField";

const ChangePasswordForm = ({ passwords, onChange, onSubmit, loading }) => {
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="home-glass-soft rounded-2xl p-5 border border-white/55">
      <h2 className="text-xl font-bold text-[#2B2A28] mb-6">
        Thay đổi mật khẩu
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <PasswordField
          label="Mật khẩu cũ"
          name="oldPassword"
          value={passwords.oldPassword}
          onChange={onChange}
          show={showOldPassword}
          onToggle={() => setShowOldPassword(!showOldPassword)}
        />

        <PasswordField
          label="Mật khẩu mới"
          name="newPassword"
          value={passwords.newPassword}
          onChange={onChange}
          show={showNewPassword}
          onToggle={() => setShowNewPassword(!showNewPassword)}
        />

        <PasswordField
          label="Xác nhận mật khẩu"
          name="confirmPassword"
          value={passwords.confirmPassword}
          onChange={onChange}
          show={showConfirmPassword}
          onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
        />
      </div>

      <button
        type="button"
        disabled={loading}
        onClick={onSubmit}
        className="mt-6 bg-[#CC6F4A] text-white px-8 py-3 rounded-xl hover:bg-[#B5604B] transition disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
      </button>
    </div>
  );
};

export default ChangePasswordForm;
