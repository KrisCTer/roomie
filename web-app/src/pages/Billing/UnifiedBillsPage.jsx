import React, { useState } from "react";
import { Plus, Send, Download, FileSpreadsheet } from "lucide-react";
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
  const [showBulkSelect, setShowBulkSelect] = useState(false);

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
    showBulkSendModal,
    filterStatus,
    filterProperty,
    filterContract,
    searchTerm,
    stats,
    selectedBills,
    setActiveTab,
    setFilterStatus,
    setFilterProperty,
    setFilterContract,
    setSearchTerm,
    setShowBulkSendModal,
    handleCreateBill,
    handleEditBill,
    handleSendBill,
    handleDeleteBill,
    handleDownloadBillPdf,
    handleBulkSend,
    handleExportBills,
    handleToggleSelectBill,
    handleSelectAllBills,
    handleCloseModal,
    handleModalSuccess,
    getFilteredBills,
  } = useBillOperations();

  // Get current data based on tab
  const currentContracts =
    activeTab === "landlord" ? contracts.asLandlord : contracts.asTenant;

  // Get filtered bills
  const filteredBills = getFilteredBills();

  // Handlers
  const handleViewBill = (bill) => {
    navigate(`/bill-detail/${bill.id}`);
  };

  const handlePayBill = (bill) => {
    navigate(`/bill-detail/${bill.id}`);
  };

  const handleClearFilters = () => {
    setFilterStatus("");
    setFilterProperty("");
    setFilterContract("");
    setSearchTerm("");
  };

  const toggleBulkSelect = () => {
    setShowBulkSelect(!showBulkSelect);
    if (showBulkSelect) {
      // Clear selections when disabling bulk select
      handleSelectAllBills([]);
    }
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
          subtitle="Create, manage, and track rental bills and payments"
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
            filterContract={filterContract}
            searchTerm={searchTerm}
            properties={properties}
            contracts={currentContracts}
            activeTab={activeTab}
            onStatusChange={setFilterStatus}
            onPropertyChange={setFilterProperty}
            onContractChange={setFilterContract}
            onSearchChange={setSearchTerm}
            onClearFilters={handleClearFilters}
          />

          {/* Bills List */}
          <div className="bg-white rounded-xl shadow-sm">
            {/* List header with actions */}
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-bold text-gray-900">
                    Bills List ({filteredBills.length})
                  </h2>

                  {/* Bulk Select Toggle (Landlord only) */}
                  {/* {activeTab === "landlord" && filteredBills.length > 0 && (
                    <button
                      onClick={toggleBulkSelect}
                      className={`px-4 py-2 rounded-lg transition font-medium text-sm ${
                        showBulkSelect
                          ? "bg-blue-100 text-blue-700 border-2 border-blue-300"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {showBulkSelect ? "✓ Bulk Select ON" : "Bulk Select"}
                    </button>
                  )} */}
                </div>

                <div className="flex items-center gap-3">
                  {/* Bulk Actions (show when bills are selected) */}
                  {activeTab === "landlord" && selectedBills.length > 0 && (
                    <>
                      <button
                        onClick={() => setShowBulkSendModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                      >
                        <Send className="w-4 h-4" />
                        Send {selectedBills.length} Bill(s)
                      </button>
                      <div className="h-6 w-px bg-gray-300"></div>
                    </>
                  )}

                  {/* Export Buttons */}
                  {/* {activeTab === "landlord" && filteredBills.length > 0 && (
                    <>
                      <button
                        onClick={() => handleExportBills("excel")}
                        className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition font-medium"
                        title="Export to Excel"
                      >
                        <FileSpreadsheet className="w-4 h-4" />
                        Excel
                      </button>
                      <button
                        onClick={() => handleExportBills("csv")}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition font-medium"
                        title="Export to CSV"
                      >
                        <Download className="w-4 h-4" />
                        CSV
                      </button>
                    </>
                  )} */}

                  {/* Create Bill Button (Landlord only) */}
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
              </div>

              {/* Bulk Selection Info */}
              {selectedBills.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>{selectedBills.length}</strong> bill(s) selected.
                    You can send them all at once or perform other bulk actions.
                  </p>
                </div>
              )}
            </div>

            {/* Bills Content */}
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
                selectedBills={selectedBills}
                showBulkSelect={showBulkSelect}
                onToggleSelect={handleToggleSelectBill}
                onSelectAll={handleSelectAllBills}
                onView={handleViewBill}
                onEdit={handleEditBill}
                onSend={handleSendBill}
                onDelete={handleDeleteBill}
                onDownloadPdf={handleDownloadBillPdf}
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

      {/* Bulk Send Confirmation Modal */}
      {showBulkSendModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Confirm Bulk Send
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to send{" "}
              <strong>{selectedBills.length}</strong> bill(s) to tenants? This
              will change their status from DRAFT to PENDING.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowBulkSendModal(false)}
                className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleBulkSend();
                  setShowBulkSendModal(false);
                }}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                Send Bills
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnifiedBillsPage;
