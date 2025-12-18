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
            🔐 OTP Verification
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
              Send Verification Code
            </h4>
            <p className="text-gray-600 mb-6">
              We will send a 6-digit OTP code to your email to verify your
              electronic signature.
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
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Send OTP</span>
                </>
              )}
            </button>
          </div>
        ) : (
          // VERIFY OTP
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2 text-center">
              Enter Verification Code
            </h4>
            <p className="text-gray-600 mb-6 text-center text-sm">
              The OTP has been sent to your email. Please check your inbox.
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                OTP Code (6 digits)
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
                Press Enter to verify
              </p>
            </div>

            {countdown > 0 && (
              <div className="mb-4 flex items-center justify-center gap-2 text-sm bg-orange-50 py-2 px-4 rounded-lg border border-orange-200">
                <Clock className="w-4 h-4 text-orange-500" />
                <span className="text-gray-700">
                  Code expires in:{" "}
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
                  The OTP has expired. Please request a new code.
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
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    <span>Verify and Sign</span>
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
                  ? "Sending..."
                  : canResend
                  ? "Resend OTP"
                  : `Resend in ${formatCountdown(countdown)}`}
              </button>
            </div>

            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                Didn’t receive the email? Please check your spam folder.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OTPModal;
