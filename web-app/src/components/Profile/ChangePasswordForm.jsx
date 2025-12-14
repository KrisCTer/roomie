import React, { useState } from "react";
import PasswordField from "./PasswordField";

const ChangePasswordForm = ({ passwords, onChange, onSubmit }) => {
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-bold mb-6">Change Password</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <PasswordField
          label="Old Password"
          name="oldPassword"
          value={passwords.oldPassword}
          onChange={onChange}
          show={showOldPassword}
          onToggle={() => setShowOldPassword(!showOldPassword)}
        />

        <PasswordField
          label="New Password"
          name="newPassword"
          value={passwords.newPassword}
          onChange={onChange}
          show={showNewPassword}
          onToggle={() => setShowNewPassword(!showNewPassword)}
        />

        <PasswordField
          label="Confirm Password"
          name="confirmPassword"
          value={passwords.confirmPassword}
          onChange={onChange}
          show={showConfirmPassword}
          onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
        />
      </div>

      <button
        onClick={onSubmit}
        className="mt-6 bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition"
      >
        Update Password
      </button>
    </div>
  );
};

export default ChangePasswordForm;
