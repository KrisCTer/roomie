import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  getContract,
  tenantSignContract,
  landlordSignContract,
  requestLandlordOTP,
  requestTenantOTP,
} from "../services/contract.service";
import { getPropertyById } from "../services/property.service";
import { getUserInfo } from "../services/localStorageService";
import { getUserProfile } from "../services/user.service";

export const useContractSigning = () => {
  const { id } = useParams();

  // Basic States
  const [contract, setContract] = useState(null);
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showSignModal, setShowSignModal] = useState(false);
  const [tenantData, setTenantData] = useState(null);
  const [landlordData, setLandlordData] = useState(null);

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

      const contractRes = await getContract(id);

      if (contractRes?.success && contractRes?.result) {
        const contractData = contractRes.result;
        setContract(contractData);

        if (contractData.propertyId) {
          try {
            const propertyRes = await getPropertyById(contractData.propertyId);
            if (propertyRes?.success && propertyRes?.result) {
              setProperty(propertyRes.result);
            }
          } catch (error) {
            console.error("❌ Error fetching property:", error);
          }
        }

        // Fetch tenant profile
        if (contractData.tenantId) {
          try {
            const res = await getUserProfile(contractData.tenantId);

            if (res?.result) {
              setTenantData(res.result);
            }
          } catch (e) {
            console.error("❌ Fetch tenant failed", e);
          }
        }

        // Fetch landlord profile
        if (contractData.landlordId) {
          try {
            const res = await getUserProfile(contractData.landlordId);

            if (res?.result) {
              setLandlordData(res.result);
            }
          } catch (e) {
            console.error("❌ Fetch landlord failed", e);
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

  // Check if current user is tenant
  const isCurrentUserTenant = () => {
    if (!contract || !currentUser) return false;
    const uid = currentUser.userId || currentUser.id || currentUser.sub;
    return contract.tenantId === uid;
  };

  // Check if current user is landlord
  const isCurrentUserLandlord = () => {
    if (!contract || !currentUser) return false;
    const uid = currentUser.userId || currentUser.id || currentUser.sub;
    return contract.landlordId === uid;
  };

  // Check if current user can sign
  const canCurrentUserSign = () => {
    if (!contract || !currentUser) return false;

    const isTenant = isCurrentUserTenant();
    const isLandlord = isCurrentUserLandlord();

    if (!isTenant && !isLandlord) return false;

    if (isTenant && contract.tenantSigned) return false;
    if (isLandlord && contract.landlordSigned) return false;

    const validStatuses = ["PENDING_SIGNATURE", "DRAFT"];
    return validStatuses.includes(contract.status);
  };

  // Get what party the current user is
  const getCurrentUserParty = () => {
    if (isCurrentUserTenant()) return "tenant";
    if (isCurrentUserLandlord()) return "landlord";
    return null;
  };

  // Request OTP
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


      let response;
      if (party === "landlord") {
        response = await requestLandlordOTP(id);
      } else {
        response = await requestTenantOTP(id);
      }

      if (response?.success) {
        setOtpSent(true);
        setCountdown(300); // 5 minutes
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
    } finally {
      setSendingOTP(false);
    }
  };

  // ✅ FIXED: Verify OTP and sign with proper validation
  const handleVerifyAndSign = async () => {
    // Clear previous errors
    setOtpError("");

    // Validation
    if (!otpCode || otpCode.trim() === "") {
      setOtpError("Vui lòng nhập mã OTP");
      return;
    }

    const cleanOtpCode = otpCode.trim();

    if (cleanOtpCode.length !== 6) {
      setOtpError("Mã OTP phải có đúng 6 số");
      return;
    }

    if (!/^\d{6}$/.test(cleanOtpCode)) {
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


      // ✅ Prepare correct payload format
      const payload = {
        otpCode: cleanOtpCode
      };


      let response;
      if (party === "landlord") {
        response = await landlordSignContract(id, payload);
      } else {
        response = await tenantSignContract(id, payload);
      }


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
        const errorMsg = response?.message || "Mã OTP không chính xác. Vui lòng thử lại!";
        setOtpError(errorMsg);
        console.error("❌ Sign failed:", errorMsg);
      }
    } catch (error) {
      console.error("❌ Error signing contract:", error);

      let errorMessage = "Ký hợp đồng thất bại. Vui lòng kiểm tra lại mã OTP!";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Check for specific OTP errors
      if (errorMessage.toLowerCase().includes("invalid otp") || 
          errorMessage.toLowerCase().includes("otp")) {
        errorMessage = "Mã OTP không chính xác hoặc đã hết hạn. Vui lòng thử lại!";
      }

      setOtpError(errorMessage);
    } finally {
      setSigning(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    setOtpCode("");
    setOtpError("");
    setOtpSuccess("");
    setOtpSent(false);
    await handleRequestOTP();
  };

  // Close OTP modal
  const handleCloseOTPModal = () => {
    setShowOTPModal(false);
    setOtpCode("");
    setOtpError("");
    setOtpSuccess("");
    setOtpSent(false);
    setCountdown(0);
    setCanResend(false);
  };

  // Open sign flow
  const handleOpenSignModal = () => {
    setShowSignModal(true);
  };

  // Continue to OTP after sign confirmation
  const handleContinueToOTP = () => {
    setShowSignModal(false);
    setShowOTPModal(true);
  };

  // Close sign modal
  const handleCloseSignModal = () => {
    setShowSignModal(false);
  };

  // Format functions
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

  return {
    // State
    contract,
    property,
    loading,
    signing,
    currentUser,
    showSignModal,
    showOTPModal,
    otpCode,
    otpSent,
    sendingOTP,
    otpError,
    otpSuccess,
    countdown,
    canResend,
    tenantData,
    landlordData,
    // User checks
    isCurrentUserTenant: isCurrentUserTenant(),
    isCurrentUserLandlord: isCurrentUserLandlord(),
    canCurrentUserSign: canCurrentUserSign(),
    getCurrentUserParty: getCurrentUserParty(),

    // Handlers
    setOtpCode,
    handleRequestOTP,
    handleVerifyAndSign,
    handleResendOTP,
    handleCloseOTPModal,
    handleOpenSignModal,
    handleContinueToOTP,
    handleCloseSignModal,

    // Format functions
    formatCurrency,
    formatDate,
    formatDateTime,
    formatCountdown,

    // Refresh
    fetchContractData,
  };
};