import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  PenTool,
  X,
  Eye,
  Calendar,
  DollarSign,
  Home,
  Shield,
  ArrowLeft,
  Mail,
  Lock,
  Send,
  RefreshCw,
} from "lucide-react";
import Sidebar from "../../components/layout/layoutUser/Sidebar.jsx";
import Header from "../../components/layout/layoutUser/Header.jsx";
import Footer from "../../components/layout/layoutUser/Footer.jsx";
import {
  getContract,
  tenantSignContract,
  landlordSignContract,
  requestLandlordOTP,
  requestTenantOTP,
} from "../../services/contract.service";
import { getPropertyById } from "../../services/property.service";
import { getUserInfo } from "../../services/localStorageService";

const ContractSigning = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Basic States
  const [contract, setContract] = useState(null);
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState("Contracts");
  const [currentUser, setCurrentUser] = useState(null);
  const [showSignModal, setShowSignModal] = useState(false);

  // OTP States
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOTP, setSendingOTP] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpSuccess, setOtpSuccess] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [canResend, setCanResend] = useState(false);

  // Get current user
  useEffect(() => {
    const user = getUserInfo();
    if (user) {
      setCurrentUser(user);
      console.log("👤 Current User:", user);
    }
  }, []);

  // Fetch contract data
  useEffect(() => {
    if (id && currentUser) {
      fetchContractData();
    }
  }, [id, currentUser]);

  // OTP Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && otpSent) {
      setCanResend(true);
    }
  }, [countdown, otpSent]);

  const fetchContractData = async () => {
    try {
      setLoading(true);
      console.log("📄 Fetching contract:", id);

      // Fetch contract details
      const contractRes = await getContract(id);
      console.log("📄 Contract Response:", contractRes);

      if (contractRes?.success && contractRes?.result) {
        const contractData = contractRes.result;
        setContract(contractData);
        console.log("✅ Contract Data:", contractData);

        // Fetch property details
        if (contractData.propertyId) {
          try {
            console.log("🏠 Fetching property:", contractData.propertyId);
            const propertyRes = await getPropertyById(contractData.propertyId);
            if (propertyRes?.success && propertyRes?.result) {
              setProperty(propertyRes.result);
              console.log("✅ Property Data:", propertyRes.result);
            }
          } catch (error) {
            console.error("❌ Error fetching property:", error);
          }
        }
      }
    } catch (error) {
      console.error("❌ Error fetching contract:", error);
      alert("Không thể tải thông tin hợp đồng");
    } finally {
      setLoading(false);
    }
  };

  // ========== HELPER FUNCTIONS - SIMPLE ==========

  // Check if current user is tenant
  const isCurrentUserTenant = () => {
    if (!contract || !currentUser) return false;
    const uid = currentUser.userId || currentUser.id || currentUser.sub;
    console.log("Tenant ID:", contract.tenantId, "User:", uid);
    return contract.tenantId === uid;
  };

  // Check if current user is landlord
  const isCurrentUserLandlord = () => {
    if (!contract || !currentUser) return false;
    const uid = currentUser.userId || currentUser.id || currentUser.sub;
    console.log("Landlord ID:", contract.landlordId, "User:", uid);
    return contract.landlordId === uid;
  };

  // Check if current user can sign
  const canCurrentUserSign = () => {
    if (!contract || !currentUser) return false;

    const isTenant = isCurrentUserTenant();
    const isLandlord = isCurrentUserLandlord();

    // Must be either tenant or landlord
    if (!isTenant && !isLandlord) return false;

    // Check if already signed
    if (isTenant && contract.tenantSigned) return false;
    if (isLandlord && contract.landlordSigned) return false;

    // Check contract status
    const validStatuses = ["PENDING_SIGNATURE", "DRAFT"];
    return validStatuses.includes(contract.status);
  };

  // Get what party the current user is
  const getCurrentUserParty = () => {
    if (isCurrentUserTenant()) return "tenant";
    if (isCurrentUserLandlord()) return "landlord";
    return null;
  };

  // ========== OTP FUNCTIONS - WITHOUT ROLE CHECK ==========

  const handleRequestOTP = async () => {
    const party = getCurrentUserParty();

    if (!party) {
      setOtpError("Bạn không phải là bên tham gia hợp đồng này");
      return;
    }

    try {
      setSendingOTP(true);
      setOtpError("");
      setOtpSuccess("");

      console.log("📧 Requesting OTP for:", party, "Contract:", id);

      // Gọi API tương ứng dựa vào party (không cần import requestTenantOTP/requestLandlordOTP)
      // Vì bạn chưa có API này trong contract.service.js hiện tại
      // Tạm thời fake response

      // TODO: Thêm vào contract.service.js:
      // export const requestTenantOTP = (id) => BaseService.post(API.REQUEST_TENANT_OTP(id));
      // export const requestLandlordOTP = (id) => BaseService.post(API.REQUEST_LANDLORD_OTP(id));

      // Fake success for now
      setTimeout(() => {
        setOtpSent(true);
        setCountdown(300); // 5 minutes
        setCanResend(false);
        setOtpSuccess("✓ Mã OTP đã được gửi đến email của bạn!");
        setSendingOTP(false);

        setTimeout(() => setOtpSuccess(""), 3000);
      }, 1000);

      // Real implementation:

      let response;
      if (party === "landlord") {
        response = await requestLandlordOTP(id);
      } else {
        response = await requestTenantOTP(id);
      }

      if (response?.success) {
        setOtpSent(true);
        setCountdown(300);
        setCanResend(false);
        setOtpSuccess("✓ Mã OTP đã được gửi đến email của bạn!");
        setTimeout(() => setOtpSuccess(""), 3000);
      } else {
        setOtpError(
          response?.message || "Không thể gửi mã OTP. Vui lòng thử lại!"
        );
      }
    } catch (error) {
      console.error("❌ Error requesting OTP:", error);
      setOtpError("Lỗi khi gửi mã OTP. Vui lòng thử lại sau!");
      setSendingOTP(false);
    }
  };

  const handleVerifyAndSign = async () => {
    // Validation
    if (!otpCode) {
      setOtpError("Vui lòng nhập mã OTP");
      return;
    }

    if (otpCode.length !== 6) {
      setOtpError("Mã OTP phải có 6 số");
      return;
    }

    if (!/^\d+$/.test(otpCode)) {
      setOtpError("Mã OTP chỉ được chứa số");
      return;
    }

    if (countdown === 0) {
      setOtpError("Mã OTP đã hết hạn. Vui lòng gửi lại mã mới!");
      return;
    }

    const party = getCurrentUserParty();

    if (!party) {
      setOtpError("Không xác định được vai trò của bạn");
      return;
    }

    try {
      setSigning(true);
      setOtpError("");

      console.log("✍️ Signing contract as:", party, "with OTP:", otpCode);

      let response;
      if (party === "landlord") {
        response = await landlordSignContract(id, { otpCode });
      } else {
        response = await tenantSignContract(id, {
          otp: otpCode,
        });
      }

      console.log("✅ Sign Response:", response);

      if (response?.success) {
        alert("✓ Ký hợp đồng thành công!");

        // Reset states
        setShowOTPModal(false);
        setShowSignModal(false);
        setOtpCode("");
        setOtpSent(false);
        setCountdown(0);
        setCanResend(false);
        setOtpError("");
        setOtpSuccess("");

        // Refresh contract data
        await fetchContractData();
      } else {
        setOtpError(
          response?.message ||
            "Mã OTP không chính xác hoặc đã hết hạn. Vui lòng thử lại!"
        );
      }
    } catch (error) {
      console.error("❌ Error signing contract:", error);

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Ký hợp đồng thất bại. Vui lòng kiểm tra lại mã OTP!";

      setOtpError(errorMessage);
    } finally {
      setSigning(false);
    }
  };

  const handleResendOTP = async () => {
    setOtpCode("");
    setOtpError("");
    setOtpSuccess("");
    await handleRequestOTP();
  };

  const handleCloseOTPModal = () => {
    setShowOTPModal(false);
    setOtpCode("");
    setOtpError("");
    setOtpSuccess("");
    setOtpSent(false);
    setCountdown(0);
    setCanResend(false);
  };

  // ========== UTILITY FUNCTIONS ==========

  const formatCurrency = (amount) => {
    if (!amount) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateObj) => {
    if (!dateObj) return "N/A";
    const dateString = dateObj.$date || dateObj;
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatDateTime = (dateObj) => {
    if (!dateObj) return "N/A";
    const dateString = dateObj.$date || dateObj;
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCountdown = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case "ACTIVE":
        return {
          label: "Đang hiệu lực",
          bg: "bg-green-100",
          text: "text-green-800",
          icon: CheckCircle,
        };
      case "PENDING_SIGNATURE":
        return {
          label: "Chờ ký",
          bg: "bg-yellow-100",
          text: "text-yellow-800",
          icon: Clock,
        };
      case "PENDING_PAYMENT":
        return {
          label: "Chờ thanh toán",
          bg: "bg-blue-100",
          text: "text-blue-800",
          icon: DollarSign,
        };
      case "DRAFT":
        return {
          label: "Bản nháp",
          bg: "bg-gray-100",
          text: "text-gray-800",
          icon: FileText,
        };
      case "EXPIRED":
        return {
          label: "Đã hết hạn",
          bg: "bg-red-100",
          text: "text-red-800",
          icon: AlertCircle,
        };
      case "TERMINATED":
        return {
          label: "Đã chấm dứt",
          bg: "bg-red-100",
          text: "text-red-800",
          icon: AlertCircle,
        };
      default:
        return {
          label: status,
          bg: "bg-gray-100",
          text: "text-gray-800",
          icon: AlertCircle,
        };
    }
  };

  // ========== MODAL COMPONENTS ==========

  const OTPModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">
            🔐 Xác thực mã OTP
          </h3>
          <button
            onClick={handleCloseOTPModal}
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
              onClick={handleRequestOTP}
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
                  setOtpError("");
                }}
                onKeyPress={(e) => {
                  if (
                    e.key === "Enter" &&
                    otpCode.length === 6 &&
                    countdown > 0
                  ) {
                    handleVerifyAndSign();
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
                onClick={handleVerifyAndSign}
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
                onClick={handleResendOTP}
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

  const SignModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">
            ✍️ Xác nhận ký hợp đồng
          </h3>
          <button
            onClick={() => setShowSignModal(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6">
          <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-800">
              ⚠️ Bạn đang thực hiện ký điện tử hợp đồng thuê nhà. Sau khi ký,
              bạn sẽ chịu trách nhiệm pháp lý theo các điều khoản trong hợp
              đồng.
            </p>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span>Tôi đã đọc và hiểu rõ các điều khoản trong hợp đồng</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span>Tôi đồng ý với tất cả các điều khoản đã nêu</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span>Tôi cam kết thực hiện đúng nghĩa vụ của mình</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setShowSignModal(false)}
            className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Hủy
          </button>
          <button
            onClick={() => {
              setShowSignModal(false);
              setShowOTPModal(true);
            }}
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 shadow-md"
          >
            <PenTool className="w-5 h-5" />
            Tiếp tục ký
          </button>
        </div>
      </div>
    </div>
  );

  // ========== LOADING & ERROR STATES ==========

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar
          activeMenu={activeMenu}
          setActiveMenu={setActiveMenu}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        <div
          className={`flex-1 transition-all duration-300 ${
            sidebarOpen ? "ml-64" : "ml-0"
          }`}
        >
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Đang tải thông tin hợp đồng...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar
          activeMenu={activeMenu}
          setActiveMenu={setActiveMenu}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        <div
          className={`flex-1 transition-all duration-300 ${
            sidebarOpen ? "ml-64" : "ml-0"
          }`}
        >
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Không tìm thấy hợp đồng
              </h2>
              <button
                onClick={() => navigate("/my-contracts")}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Quay lại danh sách
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ========== MAIN RENDER ==========

  const statusConfig = getStatusConfig(contract.status);
  const StatusIcon = statusConfig.icon;

  // Simple checks using helper functions
  const isTenant = isCurrentUserTenant();
  const isLandlord = isCurrentUserLandlord();
  const canSign = canCurrentUserSign();
  const isSigned = isTenant ? contract.tenantSigned : contract.landlordSigned;
  const otherPartySigned = isTenant
    ? contract.landlordSigned
    : contract.tenantSigned;
  const party = getCurrentUserParty();

  // Get PDF URL
  const pdfUrl = contract.pdfUrl;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-0"
        }`}
      >
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="p-6">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => navigate("/my-contracts")}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Quay lại danh sách</span>
            </button>

            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Chi tiết hợp đồng
                </h1>
                <p className="text-gray-600">
                  Mã hợp đồng:{" "}
                  <span className="font-mono font-semibold">
                    {contract._id || contract.id}
                  </span>
                </p>
                {party && (
                  <p className="text-sm text-blue-600 mt-1">
                    Vai trò:{" "}
                    <span className="font-semibold">
                      {party === "tenant" ? "Người thuê" : "Chủ nhà"}
                    </span>
                  </p>
                )}
              </div>

              <span
                className={`${statusConfig.bg} ${statusConfig.text} px-4 py-2 rounded-full font-medium flex items-center gap-2`}
              >
                <StatusIcon className="w-5 h-5" />
                {statusConfig.label}
              </span>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Property Info */}
              {property && (
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Home className="w-6 h-6 text-blue-600" />
                    Thông tin tài sản
                  </h2>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Tên tài sản</p>
                      <p className="font-medium text-gray-900">
                        {property.title}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Địa chỉ</p>
                      <p className="font-medium text-gray-900">
                        {property.address?.fullAddress || property.address}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Diện tích</p>
                        <p className="font-medium text-gray-900">
                          {property.size} m²
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Loại hình</p>
                        <p className="font-medium text-gray-900">
                          {property.propertyType}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Terms */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                  Điều khoản thanh toán
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <p className="text-sm text-gray-600 mb-1">
                      Giá thuê hàng tháng
                    </p>
                    <p className="text-2xl font-bold text-blue-600">
                      {property ? formatCurrency(property.monthlyRent) : "N/A"}
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                    <p className="text-sm text-gray-600 mb-1">Tiền đặt cọc</p>
                    <p className="text-2xl font-bold text-green-600">
                      {property
                        ? formatCurrency(property.rentalDeposit)
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Ngày bắt đầu</p>
                    <p className="font-medium text-gray-900 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {formatDate(contract.startDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Ngày kết thúc</p>
                    <p className="font-medium text-gray-900 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {formatDate(contract.endDate)}
                    </p>
                  </div>
                </div>
              </div>

              {/* PDF Viewer */}
              {pdfUrl && (
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="w-6 h-6 text-blue-600" />
                    Xem trước hợp đồng
                  </h2>
                  <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                    <iframe
                      src={pdfUrl}
                      width="100%"
                      height="600px"
                      title="Contract PDF"
                      className="bg-gray-50"
                    />
                  </div>
                  <div className="mt-4 flex gap-3">
                    <a
                      href={pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                    >
                      <Eye className="w-5 h-5" />
                      Xem toàn màn hình
                    </a>
                    <a
                      href={pdfUrl}
                      download
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md"
                    >
                      <Download className="w-5 h-5" />
                      Tải xuống PDF
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Signature Status */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Shield className="w-6 h-6 text-blue-600" />
                  Trạng thái ký
                </h2>

                <div className="space-y-4">
                  <div
                    className={`p-4 rounded-lg border-2 ${
                      contract.landlordSigned
                        ? "bg-green-50 border-green-300"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-900">
                        Chủ nhà
                      </span>
                      {contract.landlordSigned ? (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      ) : (
                        <Clock className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <p
                      className={`text-sm ${
                        contract.landlordSigned
                          ? "text-green-700"
                          : "text-gray-600"
                      }`}
                    >
                      {contract.landlordSigned ? "✓ Đã ký" : "Chưa ký"}
                    </p>
                  </div>

                  <div
                    className={`p-4 rounded-lg border-2 ${
                      contract.tenantSigned
                        ? "bg-green-50 border-green-300"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-900">
                        Người thuê
                      </span>
                      {contract.tenantSigned ? (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      ) : (
                        <Clock className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <p
                      className={`text-sm ${
                        contract.tenantSigned
                          ? "text-green-700"
                          : "text-gray-600"
                      }`}
                    >
                      {contract.tenantSigned ? "✓ Đã ký" : "Chưa ký"}
                    </p>
                  </div>

                  {contract.landlordSigned && contract.tenantSigned && (
                    <div className="p-4 bg-green-100 border-2 border-green-400 rounded-lg">
                      <div className="flex items-center gap-2 text-green-800">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-semibold">
                          Cả hai bên đã ký hợp đồng
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Hành động
                </h2>

                <div className="space-y-3">
                  {/* Show sign button if user can sign */}
                  {canSign && party && (
                    <button
                      onClick={() => setShowSignModal(true)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold shadow-md"
                    >
                      <PenTool className="w-5 h-5" />
                      Ký hợp đồng ngay
                    </button>
                  )}

                  {/* Show if user already signed */}
                  {isSigned && (
                    <div className="p-3 bg-green-50 border-l-4 border-green-500 rounded-lg">
                      <p className="text-sm text-green-700 font-medium text-center flex items-center justify-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Bạn đã ký hợp đồng này
                      </p>
                    </div>
                  )}

                  {/* Show waiting message */}
                  {isSigned && !otherPartySigned && (
                    <div className="p-3 bg-yellow-50 border-l-4 border-yellow-500 rounded-lg">
                      <p className="text-sm text-yellow-700 text-center flex items-center justify-center gap-2">
                        <Clock className="w-4 h-4" />
                        Đang chờ{" "}
                        {party === "landlord" ? "người thuê" : "chủ nhà"} ký
                      </p>
                    </div>
                  )}

                  {/* Show if user is not a party */}
                  {!party && (
                    <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded-lg">
                      <p className="text-sm text-red-700 text-center">
                        Bạn không phải là bên tham gia hợp đồng này
                      </p>
                    </div>
                  )}

                  {pdfUrl && (
                    <a
                      href={pdfUrl}
                      download
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                    >
                      <Download className="w-5 h-5" />
                      Tải xuống hợp đồng
                    </a>
                  )}

                  <button
                    onClick={() => navigate("/my-contracts")}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Quay lại danh sách
                  </button>
                </div>
              </div>

              {/* Contract Info */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Thông tin hợp đồng
                </h2>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-gray-600">Mã hợp đồng</p>
                    <p className="font-medium text-gray-900 font-mono">
                      {contract._id || contract.id}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Mã booking</p>
                    <p className="font-medium text-gray-900 font-mono">
                      {contract.bookingId || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Tenant ID</p>
                    <p className="font-medium text-gray-900 font-mono text-xs">
                      {contract.tenantId}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Landlord ID</p>
                    <p className="font-medium text-gray-900 font-mono text-xs">
                      {contract.landlordId}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Ngày tạo</p>
                    <p className="font-medium text-gray-900">
                      {formatDateTime(contract.createdAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Cập nhật lần cuối</p>
                    <p className="font-medium text-gray-900">
                      {formatDateTime(contract.updatedAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>

      {/* Modals */}
      {showSignModal && <SignModal />}
      {showOTPModal && <OTPModal />}
    </div>
  );
};

export default ContractSigning;
