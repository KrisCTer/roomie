/* aria-label */
// web-app/src/components/Profile/AccountSettings.jsx
import React from "react";
import { Lock, Shield, Trash2 } from "lucide-react";
import ChangePasswordForm from "./ChangePasswordForm";

const AccountSettings = ({
  passwords,
  onChange,
  onSubmit,
  formData,
  updatingPassword,
  onDeleteAccount,
  deletingAccount,
}) => {
  return (
    <div>
      {/* Security Section */}
      <div className="space-y-6">
        {/* Change Password */}
        <div className="home-glass-soft rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-white/65 rounded-lg flex items-center justify-center">
              <Lock className="w-5 h-5 text-[#CC6F4A]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Thay đổi mật khẩu
              </h3>
              <p className="text-sm text-gray-600">
                Cập nhật mật khẩu của bạn thường xuyên để giữ an toàn cho tài
                khoản
              </p>
            </div>
          </div>

          <ChangePasswordForm
            passwords={passwords}
            onChange={onChange}
            onSubmit={onSubmit}
            loading={updatingPassword}
          />
        </div>

        {/* Account Info */}
        <div className="home-glass-soft rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-white/65 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-[#256B6F]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Thông tin tài khoản
              </h3>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/50 border border-white/55 rounded-xl">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Tên đăng nhập
                </p>
                <p className="text-sm text-gray-600">{formData.username}</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-white/50 border border-white/55 rounded-xl">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Trạng thái tài khoản
                </p>
                <p className="text-sm text-green-700">Hoạt động</p>
              </div>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="home-glass-soft rounded-2xl p-6 border border-red-200/70 bg-red-50/35">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-white/60 rounded-lg flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-red-900">
                Vùng nguy hiểm
              </h3>
              <p className="text-sm text-red-700">
                Hành động không thể hoàn tác
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={deletingAccount}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            onClick={async () => {
              if (
                window.confirm(
                  "Are you sure you want to delete your account? This action cannot be undone.",
                )
              ) {
                await onDeleteAccount?.();
              }
            }}
          >
            {deletingAccount ? "Đang xóa..." : "Xóa tài khoản"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
