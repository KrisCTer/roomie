/* SEO_META: title="Roomie"; name="description"; property="og:title"; property="og:description"; property="og:type" */
/* aria-label */
// web-app/src/pages/Contracts/MyContracts.jsx
import React, { useState, useEffect } from "react";
import { FileText, CheckCircle, Clock, AlertCircle } from "lucide-react";
import Sidebar from "../../components/layout/layoutUser/Sidebar.jsx";
import Header from "../../components/layout/layoutUser/Header.jsx";
import Footer from "../../components/layout/layoutUser/Footer.jsx";
import { useTranslation } from "react-i18next";
import { useRole } from "../../contexts/RoleContext";
import { useRefresh } from "../../contexts/RefreshContext";
import "../../styles/apple-glass-dashboard.css";
import "../../styles/home-redesign.css";

// Import custom components
import StatsCard from "../../components/domain/contract/StatsCard.jsx";
import ContractFilters from "../../components/domain/contract/ContractFilters.jsx";
import ContractsList from "../../components/domain/contract/ContractsList.jsx";
import LoadingState from "../../components/domain/contract/LoadingState.jsx";
import EmptyState from "../../components/domain/contract/EmptyState.jsx";

// Import custom hook
import { useContractOperations } from "../../hooks/contract/useContractOperations.js";

const MyContracts = () => {
  // Layout state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState("Contracts");
  const [contractStatus, setContractStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
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

  // Filter contracts based on status and search term
  const filteredContracts = currentContracts.filter((contract) => {
    const statusMatch = !contractStatus || contract.status === contractStatus;

    const searchLower = searchTerm.toLowerCase();
    const propertyData = propertyCache[contract.propertyId];
    const tenantData = userCache[contract.tenantId];
    const landlordData = userCache[contract.landlordId];

    const searchMatch =
      !searchTerm ||
      propertyData?.address?.toLowerCase().includes(searchLower) ||
      propertyData?.title?.toLowerCase().includes(searchLower) ||
      tenantData?.fullName?.toLowerCase().includes(searchLower) ||
      landlordData?.fullName?.toLowerCase().includes(searchLower) ||
      contract.id?.toLowerCase().includes(searchLower);

    return statusMatch && searchMatch;
  });

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
        <Header
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          pageTitle={
            activeRole === "landlord"
              ? t("contract.landlordTitle")
              : t("contract.tenantTitle")
          }
          pageSubtitle={
            activeRole === "landlord"
              ? t("contract.landlordSubtitle")
              : t("contract.tenantSubtitle")
          }
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
        <main className="w-full px-4 pb-8 pt-6 md:px-8">
          {loading ? (
            <LoadingState />
          ) : (
            <section className="space-y-5">
              {/* Statistics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatsCard
                  icon={FileText}
                  label={t("contract.stats.total")}
                  value={stats.total}
                  color="blue"
                />
                <StatsCard
                  icon={CheckCircle}
                  label={t("contract.stats.active")}
                  value={stats.active}
                  color="green"
                />
                <StatsCard
                  icon={Clock}
                  label={t("contract.stats.pending")}
                  value={stats.pending}
                  color="yellow"
                />
                <StatsCard
                  icon={AlertCircle}
                  label={t("contract.stats.expired")}
                  value={stats.expired}
                  color="gray"
                />
              </div>

              {/* Filters */}
              <div className="home-glass-soft sticky top-24 z-20 rounded-2xl p-4">
                <ContractFilters
                  contractStatus={contractStatus}
                  onStatusChange={setContractStatus}
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                />
              </div>

              {/* Contracts List */}
              {filteredContracts.length > 0 ? (
                <ContractsList
                  contracts={filteredContracts}
                  role={activeTab}
                  onContractClick={handleContractClick}
                  propertyCache={propertyCache}
                  userCache={userCache}
                  currentUserId={currentUserId}
                />
              ) : (
                <EmptyState activeTab={activeTab} />
              )}
            </section>
          )}
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default MyContracts;
