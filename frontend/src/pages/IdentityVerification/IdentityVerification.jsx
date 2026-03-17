// web-app/src/pages/IdentityVerification/IdentityVerification.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  CheckCircle,
  Camera,
  Upload,
  AlertCircle,
  X,
  ArrowLeft,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { updateIdCard, getUserProfile } from "../../services/userService";
import CameraModal from "../../components/Profile/CameraModal";

const IdentityVerification = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [currentStep, setCurrentStep] = useState("intro");
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Check if user is already verified
  useEffect(() => {
    checkVerificationStatus();
  }, []);

  const checkVerificationStatus = async () => {
    try {
      const res = await getUserProfile();
      const userData = res?.data?.result || res?.result;

      // Nếu đã có idCard number thì đã xác thực rồi
      if (userData?.idCardNumber) {
        navigate("/profile");
      }
    } catch (err) {
      console.error("Check verification error:", err);
    }
  };

  const handleMethodSelect = (method) => {
    setSelectedMethod(method);

    if (method === "webcam") {
      setCurrentStep("tips");
    } else if (method === "upload") {
      document.getElementById("file-upload")?.click();
    } else if (method === "mobile") {
      setError("Mobile app feature coming soon!");
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return;

    try {
      setLoading(true);
      setError(null);

      const res = await updateIdCard(file);
      const result = res?.data?.result || res?.result;

      if (result) {
        setCapturedImage(URL.createObjectURL(file));
        setSuccess("✅ ID card uploaded successfully!");

        // Redirect to profile after 2 seconds
        setTimeout(() => {
          navigate("/profile");
        }, 2000);
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError("❌ Failed to upload ID card. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCameraCapture = async (file) => {
    setShowCamera(false);
    setCurrentStep("capture");
    setCapturedImage(URL.createObjectURL(file));
    await handleFileUpload(file);
  };

  const handleStartCapture = () => {
    setShowTips(false);
    setShowCamera(true);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-dark-primary flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => {
              if (currentStep === "method") setCurrentStep("intro");
              else if (currentStep === "tips") setCurrentStep("method");
              else navigate("/");
            }}
            className="flex items-center gap-2 text-gray-600 dark:text-dark-secondary hover:text-gray-900 dark:hover:text-dark-primary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Quay lại</span>
          </button>
        </div>

        {/* Step 1: Introduction */}
        {currentStep === "intro" && (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500 to-pink-600 rounded-full mb-6">
              <Shield className="w-10 h-10 text-white" />
            </div>

            <h1 className="text-3xl font-bold text-gray-900 dark:text-dark-primary mb-4">
              Hãy thêm giấy tờ tùy thân do chính phủ cấp
            </h1>

            <p className="text-gray-600 dark:text-dark-secondary mb-4 max-w-xl mx-auto">
              Chúng tôi cần bạn bổ sung giấy tờ tùy thân chính thức do chính phủ
              cấp. Bước này giúp bảo vệ danh tính của bạn.
            </p>

            <p className="text-gray-600 dark:text-dark-secondary mb-8 max-w-xl mx-auto">
              Bạn có thể thêm bằng lái xe, hộ chiếu hoặc chứng minh nhân dân/thẻ
              căn cước công dân tùy thuộc vào quốc gia quê quán của mình.
            </p>

            {/* Privacy Box */}
            <div className="bg-gray-50 dark:bg-dark-secondary rounded-xl p-6 mb-8 text-left max-w-xl mx-auto">
              <h3 className="font-semibold text-gray-900 dark:text-dark-primary mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                Quyền riêng tư của bạn
              </h3>
              <p className="text-sm text-gray-600 dark:text-dark-secondary">
                Chúng tôi muốn đảm bảo sự riêng tư, an toàn và bảo mật cho dữ
                liệu bạn chia sẻ trong quá trình này. Tìm hiểu thêm trong{" "}
                <a
                  href="#"
                  className="text-blue-600 dark:text-blue-400 underline hover:no-underline"
                >
                  Chính sách quyền riêng tư
                </a>{" "}
                của chúng tôi.
              </p>

              <button
                onClick={() => {
                  /* Open privacy modal */
                }}
                className="text-sm text-blue-600 dark:text-blue-400 underline hover:no-underline mt-4"
              >
                Quy trình xác minh danh tính
              </button>
            </div>

            {/* Notifications */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3 max-w-xl mx-auto">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                <p className="text-red-700 dark:text-red-400 text-sm text-left">
                  {error}
                </p>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-3 max-w-xl mx-auto">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                <p className="text-green-700 dark:text-green-400 text-sm text-left">
                  {success}
                </p>
              </div>
            )}

            <button
              onClick={() => setCurrentStep("method")}
              className="w-full max-w-xl mx-auto py-4 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl hover:from-red-600 hover:to-pink-700 transition-all font-semibold text-lg shadow-lg"
            >
              Thêm giấy tờ tùy thân
            </button>
          </div>
        )}

        {/* Step 2: Method Selection */}
        {currentStep === "method" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-primary mb-4 text-center">
              Bạn muốn thêm giấy tờ tùy thân do chính phủ cấp của mình theo cách
              nào?
            </h2>

            <div className="space-y-4 mt-8">
              {/* Upload File Option */}
              <label className="cursor-pointer">
                <input
                  type="file"
                  id="file-upload"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e.target.files[0])}
                  className="hidden"
                  disabled={loading}
                />
                <div
                  onClick={() => handleMethodSelect("upload")}
                  className={`p-6 border-2 rounded-xl transition-all hover:border-gray-400 dark:hover:border-dark-secondary ${
                    selectedMethod === "upload"
                      ? "border-gray-900 dark:border-dark-primary bg-gray-50 dark:bg-dark-secondary"
                      : "border-gray-200 dark:border-dark-primary"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-100 dark:bg-dark-tertiary rounded-lg flex items-center justify-center flex-shrink-0">
                      <Upload className="w-6 h-6 text-gray-700 dark:text-dark-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-dark-primary mb-1">
                        Tải lên ảnh có sẵn
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-dark-secondary">
                        Được đề xuất
                      </p>
                    </div>
                  </div>
                </div>
              </label>

              {/* Webcam Option */}
              <div
                onClick={() => handleMethodSelect("webcam")}
                className={`p-6 border-2 rounded-xl cursor-pointer transition-all hover:border-gray-400 dark:hover:border-dark-secondary ${
                  selectedMethod === "webcam"
                    ? "border-gray-900 dark:border-dark-primary bg-gray-50 dark:bg-dark-secondary"
                    : "border-gray-200 dark:border-dark-primary"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-dark-tertiary rounded-lg flex items-center justify-center flex-shrink-0">
                    <Camera className="w-6 h-6 text-gray-700 dark:text-dark-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-dark-primary mb-1">
                      Chụp ảnh bằng webcam
                    </h3>
                  </div>
                </div>
              </div>

              {/* Mobile App Option */}
              {/* <div
                onClick={() => handleMethodSelect("mobile")}
                className={`p-6 border-2 rounded-xl cursor-pointer transition-all hover:border-gray-400 dark:hover:border-dark-secondary ${
                  selectedMethod === "mobile"
                    ? "border-gray-900 dark:border-dark-primary bg-gray-50 dark:bg-dark-secondary"
                    : "border-gray-200 dark:border-dark-primary"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-dark-tertiary rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">📱</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-dark-primary mb-1">
                      Chụp ảnh bằng ứng dụng di động Airbnb
                    </h3>
                  </div>
                </div>
              </div> */}
            </div>

            {loading && (
              <div className="mt-6 text-center">
                <div className="inline-flex items-center gap-2 text-gray-600 dark:text-dark-secondary">
                  <div className="w-5 h-5 border-2 border-gray-300 dark:border-dark-primary border-t-gray-600 dark:border-t-dark-primary rounded-full animate-spin"></div>
                  <span>Đang xử lý...</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Tips before capture */}
        {currentStep === "tips" && (
          <div className="max-w-lg mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-primary mb-6 text-center">
              Mẹo chụp ảnh rõ nét
            </h2>

            <div className="bg-gray-50 dark:bg-dark-secondary rounded-xl p-6 mb-6">
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-gray-900 dark:bg-dark-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <p className="text-gray-900 dark:text-dark-primary">
                    Đầu tiên, hãy đảm bảo đủ sáng. Giấy tờ tùy thân của bạn phải
                    đủ sáng, không bị lóa.
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-gray-900 dark:bg-dark-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <p className="text-gray-900 dark:text-dark-primary">
                    Giữ giấy tờ tùy thân của bạn ở khoảng cách dễ vừa toàn bộ
                    khung hình.
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-gray-900 dark:bg-dark-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <p className="text-gray-900 dark:text-dark-primary">
                    Để giúp camera lấy nét, bạn có thể sử dụng phông nền đơn
                    sắc, như một bức tường trống hoặc tờ giấy.
                  </p>
                </li>
              </ul>
            </div>

            <p className="text-sm text-gray-600 dark:text-dark-secondary text-center mb-6">
              Bạn cần trợ giúp? Tìm hiểu thêm mẹo hoặc liên hệ với chúng tôi
              trong{" "}
              <a
                href="#"
                className="text-gray-900 dark:text-dark-primary underline hover:no-underline"
              >
                Trung tâm trợ giúp
              </a>
              .
            </p>

            <button
              onClick={handleStartCapture}
              disabled={loading}
              className="w-full py-4 bg-gray-900 dark:bg-dark-primary text-white rounded-xl hover:bg-gray-800 dark:hover:bg-dark-quaternary transition-colors font-semibold disabled:bg-gray-300 dark:disabled:bg-dark-tertiary disabled:cursor-not-allowed"
            >
              Tiếp tục
            </button>
          </div>
        )}

        {/* Step 4: Captured Image Preview */}
        {currentStep === "capture" && capturedImage && (
          <div className="max-w-lg mx-auto text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-primary mb-6">
              Mặt trước của giấy tờ tùy thân
            </h2>

            <div className="mb-6 rounded-xl overflow-hidden border-2 border-gray-200 dark:border-dark-primary">
              <img
                src={capturedImage}
                alt="Captured ID"
                className="w-full h-auto"
              />
            </div>

            <p className="text-sm text-gray-600 dark:text-dark-secondary mb-6">
              Đặt giấy tờ tùy thân của bạn vào chính giữa khung hình và chúng
              tôi sẽ tự động chụp ảnh.
            </p>

            {loading ? (
              <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-dark-secondary">
                <div className="w-5 h-5 border-2 border-gray-300 dark:border-dark-primary border-t-gray-600 dark:border-t-dark-primary rounded-full animate-spin"></div>
                <span>Đang xử lý...</span>
              </div>
            ) : success ? (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-green-700 dark:text-green-400">{success}</p>
              </div>
            ) : null}
          </div>
        )}

        {/* Camera Modal */}
        <CameraModal
          show={showCamera}
          onClose={() => {
            setShowCamera(false);
            setCurrentStep("method");
          }}
          onCapture={handleCameraCapture}
        />

        {/* Tips Modal */}
        {showTips && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-dark-secondary rounded-2xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-dark-primary">
                  Mẹo chụp ảnh rõ nét
                </h3>
                <button
                  onClick={() => setShowTips(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-dark-hover rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600 dark:text-dark-secondary" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-gray-900 dark:bg-dark-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs">•</span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-dark-primary">
                    Đầu tiên, hãy đảm bảo đủ sáng. Giấy tờ tùy thân của bạn phải
                    đủ sáng, không bị lóa.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-gray-900 dark:bg-dark-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs">•</span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-dark-primary">
                    Giữ giấy tờ tùy thân của bạn ở khoảng cách dễ vừa toàn bộ
                    khung hình.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-gray-900 dark:bg-dark-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs">•</span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-dark-primary">
                    Để giúp camera lấy nét, bạn có thể sử dụng phông nền đơn
                    sắc, như một bức tường trống hoặc tờ giấy.
                  </p>
                </div>
              </div>

              <p className="text-xs text-gray-500 dark:text-dark-tertiary mt-4">
                Bạn cần trợ giúp? Tìm hiểu thêm mẹo hoặc liên hệ với chúng tôi
                trong Trung tâm trợ giúp.
              </p>

              <button
                onClick={() => {
                  setShowTips(false);
                  handleStartCapture();
                }}
                className="w-full mt-6 py-3 bg-gray-900 dark:bg-dark-primary text-white rounded-xl hover:bg-gray-800 dark:hover:bg-dark-quaternary transition-colors font-semibold"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IdentityVerification;
