// web-app/src/components/common/VerificationGuard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, AlertCircle, Loader } from "lucide-react";
import { getProfile } from "../../services/user.service";

const VerificationGuard = ({ children }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    checkVerificationStatus();
  }, []);

  const checkVerificationStatus = async () => {
    try {
      setLoading(true);
      const res = await getProfile();
      const userData = res?.data?.result || res?.result;

      // Check if user has idCardNumber (verified)
      if (userData?.idCardNumber) {
        setIsVerified(true);
        setShowWarning(false);
      } else {
        setIsVerified(false);
        setShowWarning(true);
        // Auto redirect after 3 seconds
        setTimeout(() => {
          navigate("/identity-verification");
        }, 3000);
      }
    } catch (err) {
      console.error("Verification check error:", err);
      setShowWarning(true);
      setTimeout(() => {
        navigate("/identity-verification");
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-primary flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-dark-secondary">
            Checking verification status...
          </p>
        </div>
      </div>
    );
  }

  // Not verified - show warning
  if (showWarning && !isVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-dark-primary dark:to-dark-secondary flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-dark-secondary rounded-2xl shadow-xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full mb-6">
              <AlertCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-primary mb-4">
              Verification Required
            </h1>

            <p className="text-gray-600 dark:text-dark-secondary mb-6">
              You must verify your identity before accessing this feature. This
              helps us maintain a secure and trusted community.
            </p>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-left">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-1">
                    Why do we need this?
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-400">
                    Identity verification helps protect you and other users from
                    fraud and ensures everyone on our platform is who they say
                    they are.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => navigate("/identity-verification")}
                className="w-full py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg hover:from-red-600 hover:to-pink-700 transition-all font-semibold"
              >
                Verify Identity Now
              </button>

              <button
                onClick={() => navigate("/")}
                className="w-full py-3 bg-gray-100 dark:bg-dark-tertiary text-gray-700 dark:text-dark-primary rounded-lg hover:bg-gray-200 dark:hover:bg-dark-hover transition-colors"
              >
                Go Home
              </button>
            </div>

            <p className="text-xs text-gray-500 dark:text-dark-tertiary mt-6">
              Redirecting to verification in{" "}
              <span className="font-semibold">3 seconds</span>...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Verified - render children
  return <>{children}</>;
};

export default VerificationGuard;
