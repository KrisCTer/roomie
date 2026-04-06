/* SEO_META: title="Roomie"; name="description"; property="og:title"; property="og:description"; property="og:type" */
/* aria-label */
// web-app/src/pages/Billing/UnifiedBillsPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { Plus, Edit, Trash2, Power, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/layout/layoutUser/Sidebar.jsx";
import Header from "../../components/layout/layoutUser/Header.jsx";
import Footer from "../../components/layout/layoutUser/Footer.jsx";
import { useTranslation } from "react-i18next";
import { useRole } from "../../contexts/RoleContext";
import { useRefresh } from "../../contexts/RefreshContext";
import { useDialog } from "../../contexts/DialogContext";
import "../../styles/apple-glass-dashboard.css";
import "../../styles/home-redesign.css";

// Import custom components
import LandlordStats from "../../components/domain/billing/LandlordStats";
import TenantStats from "../../components/domain/billing/TenantStats";
import BillFilters from "../../components/domain/billing/BillFilters";
import LandlordBillTable from "../../components/domain/billing/LandlordBillTable";
import TenantBillCards from "../../components/domain/billing/TenantBillCards";
import BillsEmptyState from "../../components/domain/billing/BillsEmptyState";
import BillsLoadingState from "../../components/domain/billing/BillsLoadingState";
import CreateBillModal from "../../components/domain/billing/CreateBillModal";
import UtilityConfigModal from "../../components/domain/billing/UtilityConfigModal";

// Import custom hook
import { useBillOperations } from "../../hooks/billing/useBillOperations";
import {
  getMyUtilities,
  createUtilityConfig,
  updateUtilityConfig,
  deactivateUtilityConfig,
  deleteUtilityConfig,
} from "../../services/utilityService";
import { formatCurrency } from "../../utils/billHelpers";

const UnifiedBillsPage = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState("Bills");
  const { t } = useTranslation();
  const { showToast, showConfirm } = useDialog();

  const [utilityConfigs, setUtilityConfigs] = useState([]);
  const [utilityLoading, setUtilityLoading] = useState(false);
  const [showUtilityModal, setShowUtilityModal] = useState(false);
  const [selectedUtilityConfig, setSelectedUtilityConfig] = useState(null);
  const [selectedUtilityProperty, setSelectedUtilityProperty] = useState(null);
  const [createBillPropertyId, setCreateBillPropertyId] = useState("");

  // Contexts
  const { activeRole } = useRole();
  const { registerRefreshCallback, unregisterRefreshCallback } = useRefresh();

  // Use custom hook for all operations
  const {
    activeTab,
    properties,
    contracts,
    tenants,
    loading,
    showCreateModal,
    selectedBill,
    filterStatus,
    filterProperty,
    filterContract,
    searchTerm,
    stats,
    setFilterStatus,
    setFilterProperty,
    setFilterContract,
    setSearchTerm,
    handleCreateBill,
    handleEditBill,
    handleSendBill,
    handleDeleteBill,
    handleDownloadBillPdf,
    handleCloseModal,
    handleModalSuccess,
    getFilteredBills,
    refetch, // ✅ From hook
  } = useBillOperations(activeRole);

  const loadUtilityConfigs = useCallback(async () => {
    try {
      setUtilityLoading(true);
      const res = await getMyUtilities();
      if (res?.success && res?.result) {
        setUtilityConfigs(res.result);
      } else {
        setUtilityConfigs([]);
      }
    } catch (error) {
      console.error("Error loading utility configs:", error);
      setUtilityConfigs([]);
    } finally {
      setUtilityLoading(false);
    }
  }, []);

  // ✅ Register refresh callback
  useEffect(() => {
    registerRefreshCallback("bills", refetch);

    return () => {
      unregisterRefreshCallback("bills");
    };
  }, [registerRefreshCallback, unregisterRefreshCallback, refetch]);

  useEffect(() => {
    registerRefreshCallback("utility-config", loadUtilityConfigs);

    return () => {
      unregisterRefreshCallback("utility-config");
    };
  }, [registerRefreshCallback, unregisterRefreshCallback, loadUtilityConfigs]);

  useEffect(() => {
    if (activeRole === "landlord") {
      loadUtilityConfigs();
    }
  }, [activeRole, loadUtilityConfigs]);

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

  const getPropertyTimestamp = (property) => {
    const rawDate =
      property?.updatedAt ||
      property?.createdAt ||
      property?.createdDate ||
      property?.postedDate ||
      property?.listingDate;

    if (!rawDate) return 0;
    const time = new Date(rawDate).getTime();
    return Number.isNaN(time) ? 0 : time;
  };

  const sortedProperties = [...properties].sort(
    (a, b) => getPropertyTimestamp(b) - getPropertyTimestamp(a),
  );

  const getPropertyConfigs = (propertyId) =>
    utilityConfigs.filter((config) => config.propertyId === propertyId);

  const getPropertyBills = (propertyId) => {
    const contractIds = new Set(
      currentContracts
        .filter((contract) => contract.propertyId === propertyId)
        .map((contract) => contract.id),
    );

    return filteredBills
      .filter((bill) => contractIds.has(bill.contractId))
      .sort(
        (a, b) =>
          new Date(b.billingMonth || b.createdAt || 0).getTime() -
          new Date(a.billingMonth || a.createdAt || 0).getTime(),
      );
  };

  const handleOpenCreateUtility = (property) => {
    setSelectedUtilityConfig(null);
    setSelectedUtilityProperty(property);
    setShowUtilityModal(true);
  };

  const handleOpenEditUtility = (config) => {
    setSelectedUtilityConfig(config);
    const property = properties.find(
      (item) => item.propertyId === config.propertyId,
    );
    setSelectedUtilityProperty(property || null);
    setShowUtilityModal(true);
  };

  const handleSaveUtility = async (formData) => {
    try {
      if (selectedUtilityConfig) {
        await updateUtilityConfig(selectedUtilityConfig.id, formData);
        showToast(t("utility.updateSuccess"), "success");
      } else {
        await createUtilityConfig(formData);
        showToast(t("utility.createSuccess"), "success");
      }

      await loadUtilityConfigs();
      setShowUtilityModal(false);
    } catch (error) {
      console.error("Error saving utility config:", error);
      showToast(t("utility.saveFailed", "Không thể lưu cấu hình"), "error");
      throw error;
    }
  };

  const handleDeactivateUtility = async (configId) => {
    const confirmed = await showConfirm({
      title: t("utility.deactivate"),
      message: t("utility.confirmDeactivate"),
      confirmText: t("utility.deactivate"),
      cancelText: t("common.cancel", "Hủy"),
      type: "warning",
    });

    if (!confirmed) return;

    try {
      await deactivateUtilityConfig(configId);
      showToast(t("utility.deactivateSuccess"), "success");
      await loadUtilityConfigs();
    } catch (error) {
      console.error("Error deactivating utility config:", error);
      showToast(t("utility.deactivateFailed"), "error");
    }
  };

  const handleDeleteUtility = async (configId) => {
    const confirmed = await showConfirm({
      title: t("utility.delete"),
      message: t("utility.confirmDelete"),
      confirmText: t("utility.delete"),
      cancelText: t("common.cancel", "Hủy"),
      type: "danger",
    });

    if (!confirmed) return;

    try {
      await deleteUtilityConfig(configId);
      showToast(t("utility.deleteSuccess"), "success");
      await loadUtilityConfigs();
    } catch (error) {
      console.error("Error deleting utility config:", error);
      showToast(t("utility.deleteFailed"), "error");
    }
  };

  const handleCreateBillForProperty = (propertyId) => {
    setCreateBillPropertyId(propertyId);
    handleCreateBill();
  };

  const handleCloseCreateBillModal = () => {
    setCreateBillPropertyId("");
    handleCloseModal();
  };

  const handleCreateBillSuccess = async () => {
    setCreateBillPropertyId("");
    await handleModalSuccess();
  };

  const handleClearFilters = () => {
    setFilterStatus("");
    setFilterProperty("");
    setFilterContract("");
    setSearchTerm("");
  };

  const hasActiveBillFilters = Boolean(
    filterStatus || filterProperty || filterContract || searchTerm,
  );

  const visiblePropertyGroups = sortedProperties
    .map((property) => ({
      property,
      propertyConfigs: getPropertyConfigs(property.propertyId),
      propertyBills: getPropertyBills(property.propertyId),
    }))
    .filter((group) => {
      if (!hasActiveBillFilters) {
        return true;
      }
      return group.propertyBills.length > 0;
    });

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
          pageTitle={
            activeRole === "landlord"
              ? t("bill.landlordTitle")
              : t("bill.tenantTitle")
          }
          pageSubtitle={
            activeRole === "landlord"
              ? t("bill.landlordSubtitle")
              : t("bill.tenantSubtitle")
          }
        />

        <main className="w-full px-4 pb-8 pt-6 md:px-8">
          <section className="space-y-5">
            {/* Stats */}
            {activeRole === "landlord" ? (
              <LandlordStats stats={stats.landlord} />
            ) : (
              <TenantStats stats={stats.tenant} />
            )}

            {/* Filters - Sticky Glass Panel */}
            <div className="home-glass-soft sticky top-24 z-20 rounded-2xl p-4">
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
            </div>

            {/* Merged Utility + Bills */}
            {activeRole === "landlord" ? (
              loading || utilityLoading ? (
                <BillsLoadingState />
              ) : visiblePropertyGroups.length === 0 ? (
                <BillsEmptyState />
              ) : (
                visiblePropertyGroups.map(
                  ({ property, propertyConfigs, propertyBills }) => {
                    return (
                      <div
                        key={property.propertyId}
                        className="home-glass-soft rounded-2xl overflow-hidden"
                      >
                        <div className="bg-gradient-to-r from-[#CC6F4A] to-[#B5604B] px-6 py-4">
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <h3 className="text-xl font-bold text-white">
                                {property.title}
                              </h3>
                              <p className="text-[#F6EBDD] text-sm">
                                {property.address?.district ||
                                  property.address?.fullAddress}
                              </p>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() =>
                                  handleOpenCreateUtility(property)
                                }
                                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition font-medium"
                              >
                                <Settings className="w-4 h-4" />
                                Cấu hình
                              </button>
                              <button
                                onClick={() =>
                                  handleCreateBillForProperty(
                                    property.propertyId,
                                  )
                                }
                                className="flex items-center gap-2 px-4 py-2 bg-white text-[#CC6F4A] hover:bg-[#FFF4ED] rounded-lg transition font-semibold"
                              >
                                <Plus className="w-4 h-4" />
                                {t("bill.createBill")}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Utility Configs (Top) */}
                        <div className="p-6 border-b border-[#EBDCC8]">
                          <h4 className="text-base font-semibold text-[#2B2A28] mb-3">
                            Cấu hình tiện ích ({propertyConfigs.length})
                          </h4>

                          {propertyConfigs.length === 0 ? (
                            <p className="text-sm text-gray-500 py-4">
                              Chưa có cấu hình cho bất động sản này.
                            </p>
                          ) : (
                            <div className="overflow-x-auto">
                              <table className="w-full">
                                <thead className="bg-white/45 backdrop-blur-sm">
                                  <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                      Cấp áp dụng
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                      Điện
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                      Nước
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                      Internet
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                      Trạng thái
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                      Hành động
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                  {propertyConfigs.map((config) => (
                                    <tr
                                      key={config.id}
                                      className="hover:bg-white/35 transition"
                                    >
                                      <td className="px-4 py-3 text-sm">
                                        <span
                                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            config.contractId
                                              ? "bg-blue-100 text-blue-700"
                                              : "bg-gray-100 text-gray-700"
                                          }`}
                                        >
                                          {config.contractId
                                            ? "Theo hợp đồng"
                                            : "Theo BĐS"}
                                        </span>
                                      </td>
                                      <td className="px-4 py-3 text-sm text-gray-900">
                                        {formatCurrency(
                                          config.electricityUnitPrice,
                                        )}
                                        /kWh
                                      </td>
                                      <td className="px-4 py-3 text-sm text-gray-900">
                                        {formatCurrency(config.waterUnitPrice)}
                                        /m³
                                      </td>
                                      <td className="px-4 py-3 text-sm text-gray-900">
                                        {formatCurrency(config.internetPrice)}
                                      </td>
                                      <td className="px-4 py-3">
                                        <span
                                          className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                                            config.active
                                              ? "bg-green-100 text-green-700"
                                              : "bg-gray-100 text-gray-700"
                                          }`}
                                        >
                                          {config.active
                                            ? "Hoạt động"
                                            : "Ngừng"}
                                        </span>
                                      </td>
                                      <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-2">
                                          <button
                                            onClick={() =>
                                              handleOpenEditUtility(config)
                                            }
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                            title={t("utility.edit")}
                                          >
                                            <Edit className="w-4 h-4" />
                                          </button>
                                          {config.active && (
                                            <button
                                              onClick={() =>
                                                handleDeactivateUtility(
                                                  config.id,
                                                )
                                              }
                                              className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition"
                                              title={t("utility.deactivate")}
                                            >
                                              <Power className="w-4 h-4" />
                                            </button>
                                          )}
                                          <button
                                            onClick={() =>
                                              handleDeleteUtility(config.id)
                                            }
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                            title={t("utility.delete")}
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>

                        {/* Bills (Bottom) */}
                        <div className="p-6">
                          <h4 className="text-base font-semibold text-[#2B2A28] mb-3">
                            {t("bill.billsList")} ({propertyBills.length})
                          </h4>

                          {propertyBills.length === 0 ? (
                            <p className="text-sm text-gray-500 py-4">
                              Chưa có hóa đơn cho bất động sản này.
                            </p>
                          ) : (
                            <LandlordBillTable
                              bills={propertyBills}
                              properties={properties}
                              contracts={currentContracts}
                              tenants={tenants}
                              onView={handleViewBill}
                              onEdit={handleEditBill}
                              onSend={handleSendBill}
                              onDelete={handleDeleteBill}
                              onDownloadPdf={handleDownloadBillPdf}
                              hidePropertyColumn
                              glassStyle
                            />
                          )}
                        </div>
                      </div>
                    );
                  },
                )
              )
            ) : loading ? (
              <BillsLoadingState />
            ) : filteredBills.length === 0 ? (
              <BillsEmptyState />
            ) : (
              <TenantBillCards
                bills={filteredBills}
                properties={properties}
                contracts={currentContracts}
                onView={handleViewBill}
                onPay={handlePayBill}
              />
            )}
          </section>
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
          initialPropertyId={createBillPropertyId}
          onClose={handleCloseCreateBillModal}
          onSuccess={handleCreateBillSuccess}
        />
      )}

      {showUtilityModal && (
        <UtilityConfigModal
          config={selectedUtilityConfig}
          property={selectedUtilityProperty}
          contract={null}
          onClose={() => setShowUtilityModal(false)}
          onSave={handleSaveUtility}
        />
      )}
    </div>
  );
};

export default UnifiedBillsPage;
