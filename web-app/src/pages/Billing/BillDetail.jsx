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
import PageTitle from "../../components/common/PageTitle.jsx";
import { useTranslation } from "react-i18next";

// Import components
import PropertyInfoCard from "../../components/Billing/PropertyInfoCard";
import BillBreakdown from "../../components/Billing/BillBreakdown";
import BillDetailInfo from "../../components/Billing/BillDetailInfo";
// import BillActions from "../../components/Billing/BillActions";
import PaymentModal from "../../components/Billing/PaymentModal";
import StatusBanner from "../../components/Billing/StatusBanner";
import BillActions from "../../components/Billing/BillActionsEnhanced";

// Import hook
import { useBillDetail } from "../../hooks/useBillDetail";

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
    setShowPaymentModal,
    setSelectedPaymentMethod,
    handlePayment,
    goBack,
  } = useBillDetail();

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
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
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
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
      <div className="flex min-h-screen bg-gray-50">
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
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
    <div className="flex min-h-screen bg-gray-50">
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
        <PageTitle
          title={t("bill.billDetails")}
          subtitle={t("bill.billSubtitle")}
        />

        <main className="p-6">
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
              <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
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
          onClose={() => setShowPaymentModal(false)}
          onPay={handlePayment}
          paying={paying}
        />
      )}
    </div>
  );
};

export default BillDetail;
