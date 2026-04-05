/* SEO_META: title="Roomie"; name="description"; property="og:title"; property="og:description"; property="og:type" */
/* aria-label */
// web-app/src/pages/Contracts/MyContracts.jsx
import React, { useState, useEffect } from "react";
import { FileText, CheckCircle, Clock, AlertCircle } from "lucide-react";
import Sidebar from "../../components/layout/layoutUser/Sidebar.jsx";
import Header from "../../components/layout/layoutUser/Header.jsx";
import Footer from "../../components/layout/layoutUser/Footer.jsx";
import PageTitle from "../../components/common/PageTitle.jsx";
import { useTranslation } from "react-i18next";
import { useRole } from "../../contexts/RoleContext";
import { useRefresh } from "../../contexts/RefreshContext";
import "../../styles/apple-glass-dashboard.css";
import "../../styles/home-redesign.css";

// Import custom components
import StatsCard from "../../components/domain/contract/StatsCard.jsx";
import ContractsList from "../../components/domain/contract/ContractsList.jsx";
import LoadingState from "../../components/domain/contract/LoadingState.jsx";
import EmptyState from "../../components/domain/contract/EmptyState.jsx";

// Import custom hook
import { useContractOperations } from "../../hooks/contract/useContractOperations.js";

const MyContracts = () => {
  // Layout state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState("Contracts");
  const { t } = useTranslation();

  // Contexts
  const { activeRole } = useRole();
  const { registerRefreshCallback, unregisterRefreshCallback } = useRefresh();

  // Contract operations
  const {
    activeTab,
    contracts,
    currentContracts,
    propertyCache,
    userCache,
    loading,
    stats,
    currentUserId,
    toast,
    handleContractClick,
    setToast,
    refetch, // ✅ Now available!
  } = useContractOperations(activeRole);

  // ✅ Register refresh callback
  useEffect(() => {
    registerRefreshCallback("my-contracts", refetch);

    return () => {
      unregisterRefreshCallback("my-contracts");
    };
  }, [registerRefreshCallback, unregisterRefreshCallback, refetch]);

  return (
    <div className="home-v2 home-shell-bg min-h-screen">
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
        {/* Header */}
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <PageTitle
          title={t("contract.myContracts")}
          subtitle={t("contract.myContractsSubtitle")}
        />

        {/* Toast Notification */}
        {toast && (
          <div className="fixed top-20 right-6 z-50 animate-slide-in">
            <div
              className={`px-6 py-4 rounded-lg shadow-lg ${
                toast.type === "success"
                  ? "bg-green-500 text-white"
                  : "bg-red-500 text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                {toast.type === "success" ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
                <p className="font-medium">{toast.message}</p>
                <button
                  onClick={() => setToast(null)}
                  className="ml-4 hover:opacity-75"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="w-full px-4 pb-8 md:px-8">
          {/* Loading State */}
          {loading ? (
            <LoadingState />
          ) : (
            <>
              {/* Statistics */}
              <div className="apple-glass-panel p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <StatsCard
                  icon={FileText}
                  label={t("contract.stats.total")}
                  value={stats.total}
                  bgColor="bg-blue-100"
                  textColor="text-blue-600"
                />
                <StatsCard
                  icon={CheckCircle}
                  label={t("contract.stats.active")}
                  value={stats.active}
                  bgColor="bg-green-100"
                  textColor="text-green-600"
                />
                <StatsCard
                  icon={Clock}
                  label={t("contract.stats.pending")}
                  value={stats.pending}
                  bgColor="bg-yellow-100"
                  textColor="text-yellow-600"
                />
                <StatsCard
                  icon={AlertCircle}
                  label={t("contract.stats.expired")}
                  value={stats.expired}
                  bgColor="bg-gray-100"
                  textColor="text-gray-600"
                />
              </div>
              </div>

              {/* Contracts List */}
              <div className="apple-glass-panel p-6">
                {currentContracts.length > 0 ? (
                  <ContractsList
                    contracts={currentContracts}
                    role={activeTab}
                    onContractClick={handleContractClick}
                    propertyCache={propertyCache}
                    userCache={userCache}
                    currentUserId={currentUserId}
                  />
                ) : (
                  <EmptyState activeTab={activeTab} />
                )}
              </div>
            </>
          )}
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default MyContracts;


