import React from "react";
import {
  X,
  Mail,
  Send,
  Lock,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

const OTPModal = ({
  show,
  onClose,
  otpSent,
  otpCode,
  setOtpCode,
  otpError,
  otpSuccess,
  countdown,
  canResend,
  sendingOTP,
  signing,
  onRequestOTP,
  onVerifyAndSign,
  onResendOTP,
  formatCountdown,
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">
            🔐 Xác thực mã OTP
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center animate-pulse">
            <Mail className="w-10 h-10 text-blue-600" />
          </div>
        </div>

        {!otpSent ? (
          // REQUEST OTP
          <div className="text-center">
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              Gửi mã xác thực
            </h4>
            <p className="text-gray-600 mb-6">
              Chúng tôi sẽ gửi mã OTP gồm 6 số đến email của bạn để xác thực chữ
              ký điện tử.
            </p>

            {otpSuccess && (
              <div className="mb-4 p-3 bg-green-50 border-l-4 border-green-500 rounded-lg">
                <p className="text-sm text-green-700 flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  {otpSuccess}
                </p>
              </div>
            )}

            {otpError && (
              <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 rounded-lg">
                <p className="text-sm text-red-700">{otpError}</p>
              </div>
            )}

            <button
              onClick={onRequestOTP}
              disabled={sendingOTP}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sendingOTP ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Đang gửi...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Gửi mã OTP</span>
                </>
              )}
            </button>
          </div>
        ) : (
          // VERIFY OTP
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2 text-center">
              Nhập mã xác thực
            </h4>
            <p className="text-gray-600 mb-6 text-center text-sm">
              Mã OTP đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư.
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mã OTP (6 số)
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength="6"
                value={otpCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  setOtpCode(value);
                }}
                onKeyPress={(e) => {
                  if (
                    e.key === "Enter" &&
                    otpCode.length === 6 &&
                    countdown > 0
                  ) {
                    onVerifyAndSign();
                  }
                }}
                placeholder="000000"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-2xl tracking-widest font-mono"
                autoFocus
                autoComplete="off"
              />
              <p className="text-xs text-gray-500 mt-1 text-center">
                Nhấn Enter để xác thực
              </p>
            </div>

            {countdown > 0 && (
              <div className="mb-4 flex items-center justify-center gap-2 text-sm bg-orange-50 py-2 px-4 rounded-lg border border-orange-200">
                <Clock className="w-4 h-4 text-orange-500" />
                <span className="text-gray-700">
                  Mã hết hạn sau:{" "}
                  <span className="font-mono font-bold text-orange-600">
                    {formatCountdown(countdown)}
                  </span>
                </span>
              </div>
            )}

            {countdown === 0 && otpSent && (
              <div className="mb-4 p-3 bg-yellow-50 border-l-4 border-yellow-500 rounded-lg">
                <p className="text-sm text-yellow-700 text-center flex items-center justify-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Mã OTP đã hết hạn. Vui lòng gửi lại mã mới.
                </p>
              </div>
            )}

            {otpSuccess && (
              <div className="mb-4 p-3 bg-green-50 border-l-4 border-green-500 rounded-lg">
                <p className="text-sm text-green-700 flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  {otpSuccess}
                </p>
              </div>
            )}

            {otpError && (
              <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 rounded-lg">
                <p className="text-sm text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{otpError}</span>
                </p>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={onVerifyAndSign}
                disabled={signing || otpCode.length !== 6 || countdown === 0}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {signing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Đang xác thực...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    <span>Xác thực và ký</span>
                  </>
                )}
              </button>

              <button
                onClick={onResendOTP}
                disabled={sendingOTP || !canResend}
                className="w-full px-6 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 border border-blue-200"
              >
                <RefreshCw
                  className={`w-4 h-4 ${sendingOTP ? "animate-spin" : ""}`}
                />
                {sendingOTP
                  ? "Đang gửi..."
                  : canResend
                  ? "Gửi lại mã OTP"
                  : `Gửi lại sau ${formatCountdown(countdown)}`}
              </button>
            </div>

            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                Không nhận được email? Kiểm tra hộp thư spam.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OTPModal;
