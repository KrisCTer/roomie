import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import Sidebar from "../../components/layout/layoutUser/Sidebar.jsx";
import Header from "../../components/layout/layoutUser/Header.jsx";
import Footer from "../../components/layout/layoutUser/Footer.jsx";
import PageTitle from "../../components/common/PageTitle.jsx";

// Import custom components
import ContractHeader from "../../components/Contracts/signing/ContractHeader.jsx";
import OTPModal from "../../components/Contracts/signing/OTPModal.jsx";
import SignModal from "../../components/Contracts/signing/SignModal.jsx";
import PropertyInfoCard from "../../components/Contracts/signing/PropertyInfoCard.jsx";
import PaymentTermsCard from "../../components/Contracts/signing/PaymentTermsCard.jsx";
import PDFViewer from "../../components/Contracts/signing/PDFViewer.jsx";
import SignatureStatusCard from "../../components/Contracts/signing/SignatureStatusCard.jsx";
import ActionsCard from "../../components/Contracts/signing/ActionsCard.jsx";
import ContractInfoCard from "../../components/Contracts/signing/ContractInfoCard.jsx";

// Import custom hook
import { useContractSigning } from "../../hooks/useContractSigning.js";

// Import utilities
import { getStatusConfig } from "../../utils/statusConfig.js";

const ContractSigning = () => {
  const navigate = useNavigate();

  // Layout state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState("Contracts");

  // Use custom hook for all signing logic
  const {
    contract,
    property,
    tenantData,
    landlordData,
    loading,
    signing,
    showSignModal,
    showOTPModal,
    otpCode,
    otpSent,
    sendingOTP,
    otpError,
    otpSuccess,
    countdown,
    canResend,
    isCurrentUserTenant,
    isCurrentUserLandlord,
    canCurrentUserSign,
    getCurrentUserParty,
    setOtpCode,
    handleRequestOTP,
    handleVerifyAndSign,
    handleResendOTP,
    handleCloseOTPModal,
    handleOpenSignModal,
    handleContinueToOTP,
    handleCloseSignModal,
    formatCurrency,
    formatDate,
    formatDateTime,
    formatCountdown,
  } = useContractSigning();

  // Loading state
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

  // Error state
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

  // Get status config and party
  const statusConfig = getStatusConfig(contract.status);
  const party = getCurrentUserParty;
  const isSigned = isCurrentUserTenant
    ? contract.tenantSigned
    : contract.landlordSigned;
  const otherPartySigned = isCurrentUserTenant
    ? contract.landlordSigned
    : contract.tenantSigned;
  const pdfUrl = contract.pdfUrl;

  // Main render
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Main Content */}
      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-0"
        }`}
      >
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <PageTitle title="Ký hợp đồng" subtitle="Xem và ký hợp đồng của bạn" />
        <main className="p-6">
          {/* Header */}
          <ContractHeader
            contract={contract}
            statusConfig={statusConfig}
            party={party}
          />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Property Info */}
              <PropertyInfoCard property={property} />

              {/* Payment Terms */}
              <PaymentTermsCard
                property={property}
                contract={contract}
                formatCurrency={formatCurrency}
                formatDate={formatDate}
              />

              {/* PDF Viewer */}
              <PDFViewer pdfUrl={pdfUrl} />
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Signature Status */}
              <SignatureStatusCard contract={contract} />

              {/* Actions */}
              <ActionsCard
                contract={contract}
                canSign={canCurrentUserSign}
                isSigned={isSigned}
                otherPartySigned={otherPartySigned}
                party={party}
                pdfUrl={pdfUrl}
                onSignClick={handleOpenSignModal}
              />

              {/* Contract Info */}
              <ContractInfoCard
                contract={contract}
                tenant={tenantData}
                landlord={landlordData}
                formatDateTime={formatDateTime}
              />
            </div>
          </div>
        </main>

        <Footer />
      </div>

      {/* Modals */}
      <SignModal
        show={showSignModal}
        onClose={handleCloseSignModal}
        onContinue={handleContinueToOTP}
      />

      <OTPModal
        show={showOTPModal}
        onClose={handleCloseOTPModal}
        otpSent={otpSent}
        otpCode={otpCode}
        setOtpCode={setOtpCode}
        otpError={otpError}
        otpSuccess={otpSuccess}
        countdown={countdown}
        canResend={canResend}
        sendingOTP={sendingOTP}
        signing={signing}
        onRequestOTP={handleRequestOTP}
        onVerifyAndSign={handleVerifyAndSign}
        onResendOTP={handleResendOTP}
        formatCountdown={formatCountdown}
      />
    </div>
  );
};

export default ContractSigning;
