/* SEO_META: title="Roomie"; name="description"; property="og:title"; property="og:description"; property="og:type" */
/* aria-label */
import React, { useState } from "react";
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import Sidebar from "../../components/layout/layoutUser/Sidebar.jsx";
import Header from "../../components/layout/layoutUser/Header.jsx";
import Footer from "../../components/layout/layoutUser/Footer.jsx";
import { useTranslation } from "react-i18next";
import "../../styles/apple-glass-dashboard.css";
import "../../styles/home-redesign.css";

// Import components
import PropertyInfoCard from "../../components/domain/billing/PropertyInfoCard";
import BillBreakdown from "../../components/domain/billing/BillBreakdown";
import BillDetailInfo from "../../components/domain/billing/BillDetailInfo";
// import BillActions from "../../components/domain/billing/BillActions";
import PaymentModal from "../../components/domain/billing/PaymentModal";
import StatusBanner from "../../components/domain/billing/StatusBanner";
import BillActions from "../../components/domain/billing/BillActionsEnhanced";

// Import hook
import { useBillDetail } from "../../hooks/billing/useBillDetail";

// Import helpers
import { getStatusConfig } from "../../utils/billDetailHelpers";

const BillDetail = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState("Bills");
  const { t } = useTranslation();

  const statusIconMap = {
    PENDING: Clock,
    OVERDUE: AlertTriangle,
    PAID: CheckCircle,
    FAILED: XCircle,
  };

  const {
    bill,
    contract,
    property,
    tenant,
    landlord,
    loading,
    paying,
    showPaymentModal,
    selectedPaymentMethod,
    momoPaymentUrl,
    paymentCompleted,
    setShowPaymentModal,
    setSelectedPaymentMethod,
    setMomoPaymentUrl,
    handlePayment,
    goBack,
  } = useBillDetail();

  // Loading state
  if (loading) {
    return (
      <div className="home-v2 home-shell-bg min-h-screen">
        <Sidebar
          activeMenu={activeMenu}
          setActiveMenu={setActiveMenu}
          sidebarOpen={sidebarOpen}
        />
        <div
          className={`flex-1 transition-all duration-300 ${
            sidebarOpen ? "ml-64" : "ml-0"
          }`}
        >
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-[#CC6F4A] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">{t("bill.loadingBill")}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Not found state
  if (!bill) {
    return (
      <div className="home-v2 home-shell-bg min-h-screen">
        <Sidebar
          activeMenu={activeMenu}
          setActiveMenu={setActiveMenu}
          sidebarOpen={sidebarOpen}
        />
        <div
          className={`flex-1 transition-all duration-300 ${
            sidebarOpen ? "ml-64" : "ml-0"
          }`}
        >
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {t("bill.billNotFound")}
              </h2>
              <button
                onClick={goBack}
                className="mt-4 px-6 py-2 bg-[#CC6F4A] text-white rounded-lg hover:bg-[#B5604B]"
              >
                {t("bill.backToList")}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(bill.status);
  const StatusIcon = statusIconMap[bill.status] || Clock;

  const isOverdue = bill.status === "OVERDUE";
  const isPaid = bill.status === "PAID";
  const canPay = bill.status === "PENDING" || bill.status === "OVERDUE";

  return (
    <div className="home-v2 home-shell-bg min-h-screen">
      <Sidebar
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        sidebarOpen={sidebarOpen}
      />

      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-0"
        }`}
      >
        <Header
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          pageTitle={t("bill.billDetails")}
          pageSubtitle={t("bill.billSubtitle")}
        />

        <main className="w-full px-4 pb-8 pt-4 md:px-8">
          {/* Status Banner */}
          <StatusBanner bill={bill} isOverdue={isOverdue} isPaid={isPaid} />

          {/* Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              <PropertyInfoCard property={property} />
              <BillBreakdown bill={bill} />
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div className="apple-glass-panel p-4">
                <div
                  className={`${statusConfig.bg} ${statusConfig.text}
                  w-full px-4 py-3 rounded-lg
                  font-semibold flex items-center justify-center gap-2`}
                >
                  <StatusIcon className="w-5 h-5" />
                  {statusConfig.label}
                </div>
              </div>

              <BillDetailInfo
                bill={bill}
                isOverdue={isOverdue}
                isPaid={isPaid}
                tenant={tenant}
                landlord={landlord}
              />
              <BillActions
                bill={bill}
                canPay={canPay}
                onPayment={() => setShowPaymentModal(true)}
                onBack={goBack}
              />
            </div>
          </div>
        </main>

        <Footer />
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          bill={bill}
          selectedMethod={selectedPaymentMethod}
          setSelectedMethod={setSelectedPaymentMethod}
          onClose={() => {
            setShowPaymentModal(false);
            setMomoPaymentUrl(null);
          }}
          onPay={handlePayment}
          paying={paying}
          momoPaymentUrl={momoPaymentUrl}
          paymentCompleted={paymentCompleted}
        />
      )}
    </div>
  );
};

export default BillDetail;
