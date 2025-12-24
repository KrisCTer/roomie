import React, { useState } from "react";
import { FileText, CheckCircle, Clock, AlertCircle } from "lucide-react";
import Sidebar from "../../components/layout/layoutUser/Sidebar.jsx";
import Header from "../../components/layout/layoutUser/Header.jsx";
import Footer from "../../components/layout/layoutUser/Footer.jsx";
import PageTitle from "../../components/common/PageTitle.jsx";
import { useTranslation } from "react-i18next";

// Import custom components
import ContractTabs from "../../components/Contracts/ContractTabs.jsx";
import StatsCard from "../../components/Contracts/StatsCard.jsx";
import ContractsList from "../../components/Contracts/ContractsList.jsx";
import LoadingState from "../../components/Contracts/LoadingState.jsx";
import EmptyState from "../../components/Contracts/EmptyState.jsx";

// Import custom hook
import { useContractOperations } from "../../hooks/useContractOperations.js";

const MyContracts = () => {
  // Layout state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState("Contracts");
  const { t } = useTranslation();

  // Use custom hook for contract operations
  const {
    activeTab,
    contracts,
    currentContracts,
    propertyCache,
    userCache,
    loading,
    stats,
    currentUserId,
    handleContractClick,
    handleTabChange,
  } = useContractOperations();

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

        <PageTitle
          title={t("contract.myContracts")}
          subtitle={t("contract.myContractsSubtitle")}
        />

        {/* Content */}
        <div className="p-6">
          {/* Tabs */}
          <ContractTabs
            activeTab={activeTab}
            onTabChange={handleTabChange}
            landlordCount={contracts.asLandlord.length}
            tenantCount={contracts.asTenant.length}
          />

          {/* Loading State */}
          {loading ? (
            <LoadingState />
          ) : (
            <>
              {/* Statistics */}
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

              {/* Contracts List */}
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
            </>
          )}
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default MyContracts;
