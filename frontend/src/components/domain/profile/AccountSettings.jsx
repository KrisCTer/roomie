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
        <div className="border border-gray-200 dark:border-dark-primary rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-primary">
                Thay đổi mật khẩu
              </h3>
              <p className="text-sm text-gray-600 dark:text-dark-secondary">
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
        <div className="border border-gray-200 dark:border-dark-primary rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-primary">
                Thông tin tài khoản
              </h3>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-tertiary rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-dark-primary">
                  Tên đăng nhập
                </p>
                <p className="text-sm text-gray-600 dark:text-dark-secondary">
                  {formData.username}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-tertiary rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-dark-primary">
                  Trạng thái tài khoản
                </p>
                <p className="text-sm text-green-600 dark:text-green-400">
                  Hoạt động
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="border-2 border-red-200 dark:border-red-800 rounded-xl p-6 bg-red-50 dark:bg-red-900/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-red-900 dark:text-red-400">
                Vùng nguy hiểm
              </h3>
              <p className="text-sm text-red-700 dark:text-red-500">
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
