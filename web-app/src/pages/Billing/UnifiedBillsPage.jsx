import React, { useState } from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/layout/layoutUser/Sidebar.jsx";
import Header from "../../components/layout/layoutUser/Header.jsx";
import Footer from "../../components/layout/layoutUser/Footer.jsx";
import PageTitle from "../../components/common/PageTitle.jsx";

// Import custom components
import BillTabs from "../../components/Billing/BillTabs";
import LandlordStats from "../../components/Billing/LandlordStats";
import TenantStats from "../../components/Billing/TenantStats";
import BillFilters from "../../components/Billing/BillFilters";
import LandlordBillTable from "../../components/Billing/LandlordBillTable";
import TenantBillCards from "../../components/Billing/TenantBillCards";
import BillsEmptyState from "../../components/Billing/BillsEmptyState";
import BillsLoadingState from "../../components/Billing/BillsLoadingState";
import CreateBillModal from "../../components/Billing/CreateBillModal";

// Import custom hook
import { useBillOperations } from "../../hooks/useBillOperations";

const UnifiedBillsPage = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState("Bills");

  // Use custom hook for all operations
  const {
    activeTab,
    billsData,
    properties,
    contracts,
    tenants,
    loading,
    showCreateModal,
    selectedBill,
    filterStatus,
    filterProperty,
    searchTerm,
    stats,
    setActiveTab,
    setFilterStatus,
    setFilterProperty,
    setSearchTerm,
    handleCreateBill,
    handleEditBill,
    handleSendBill,
    handleDeleteBill,
    handleCloseModal,
    handleModalSuccess,
  } = useBillOperations();

  // Get current data based on tab
  const currentBills =
    activeTab === "landlord" ? billsData.asLandlord : billsData.asTenant;

  const currentContracts =
    activeTab === "landlord" ? contracts.asLandlord : contracts.asTenant;

  // Filter bills
  const filteredBills = currentBills.filter((bill) => {
    const matchStatus = !filterStatus || bill.status === filterStatus;

    let matchProperty = true;
    if (filterProperty) {
      const contract = currentContracts.find((c) => c.id === bill.contractId);
      matchProperty = contract?.propertyId === filterProperty;
    }

    const matchSearch =
      !searchTerm ||
      bill.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.contractId?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchStatus && matchProperty && matchSearch;
  });

  // Handlers
  const handleViewBill = (bill) => {
    navigate(`/bill-detail/${bill.id}`);
  };

  const handlePayBill = (bill) => {
    navigate(`/bill-detail/${bill.id}`);
  };

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
          title="Bill Management"
          subtitle="Manage rental bills and tenant payments"
        />

        <main className="p-6">
          {/* Tabs */}
          <BillTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            landlordCount={stats.landlord.total}
            tenantCount={stats.tenant.total}
          />

          {/* Stats */}
          {activeTab === "landlord" ? (
            <LandlordStats stats={stats.landlord} />
          ) : (
            <TenantStats stats={stats.tenant} />
          )}

          {/* Filters */}
          <BillFilters
            filterStatus={filterStatus}
            filterProperty={filterProperty}
            searchTerm={searchTerm}
            properties={properties}
            activeTab={activeTab}
            onStatusChange={setFilterStatus}
            onPropertyChange={setFilterProperty}
            onSearchChange={setSearchTerm}
          />

          {/* Bills List */}
          <div className="bg-white rounded-xl shadow-sm">
            {/* List header + Create bill button */}
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                Bills List ({filteredBills.length})
              </h2>

              {/* Create bill button - landlord only */}
              {activeTab === "landlord" && (
                <button
                  onClick={handleCreateBill}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-md font-medium"
                >
                  <Plus className="w-5 h-5" />
                  Create New Bill
                </button>
              )}
            </div>

            {loading ? (
              <BillsLoadingState />
            ) : filteredBills.length === 0 ? (
              <BillsEmptyState />
            ) : activeTab === "landlord" ? (
              <LandlordBillTable
                bills={filteredBills}
                properties={properties}
                contracts={currentContracts}
                tenants={tenants}
                onView={handleViewBill}
                onEdit={handleEditBill}
                onSend={handleSendBill}
                onDelete={handleDeleteBill}
              />
            ) : (
              <TenantBillCards
                bills={filteredBills}
                properties={properties}
                contracts={currentContracts}
                onView={handleViewBill}
                onPay={handlePayBill}
              />
            )}
          </div>
        </main>

        <Footer />
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && activeTab === "landlord" && (
        <CreateBillModal
          bill={selectedBill}
          properties={properties}
          contracts={contracts.asLandlord}
          tenants={tenants}
          onClose={handleCloseModal}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
};

export default UnifiedBillsPage;
