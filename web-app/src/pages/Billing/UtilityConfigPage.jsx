// src/pages/Billing/UtilityConfigPage.jsx
import React, { useState, useEffect } from "react";
import { Settings, Plus, Edit, Trash2, Power } from "lucide-react";
import Sidebar from "../../components/layout/layoutUser/Sidebar.jsx";
import Header from "../../components/layout/layoutUser/Header.jsx";
import Footer from "../../components/layout/layoutUser/Footer.jsx";
import PageTitle from "../../components/common/PageTitle.jsx";
import UtilityConfigModal from "../../components/Billing/UtilityConfigModal";
import { useTranslation } from "react-i18next";

import {
  getMyUtilities,
  createUtilityConfig,
  updateUtilityConfig,
  deactivateUtilityConfig,
  deleteUtilityConfig,
} from "../../services/utility.service";
import { getPropertiesByOwner } from "../../services/property.service";
import { formatCurrency } from "../../utils/billHelpers";

const UtilityConfigPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState("Utilities");

  const [configs, setConfigs] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const { t } = useTranslation();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const [configsRes, propertiesRes] = await Promise.all([
        getMyUtilities(),
        getPropertiesByOwner(),
      ]);

      if (configsRes?.success && configsRes?.result) {
        setConfigs(configsRes.result);
      }

      if (propertiesRes?.success && propertiesRes?.result) {
        setProperties(propertiesRes.result);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = (property) => {
    setSelectedConfig(null);
    setSelectedProperty(property);
    setShowModal(true);
  };

  const handleEdit = (config) => {
    setSelectedConfig(config);
    const property = properties.find((p) => p.propertyId === config.propertyId);
    setSelectedProperty(property);
    setShowModal(true);
  };

  const handleSave = async (formData) => {
    try {
      if (selectedConfig) {
        await updateUtilityConfig(selectedConfig.id, formData);
        alert(t("utility.updateSuccess"));
      } else {
        await createUtilityConfig(formData);
        alert(t("utility.createSuccess"));
      }
      loadData();
      setShowModal(false);
    } catch (error) {
      console.error("Error saving config:", error);
      throw error;
    }
  };

  const handleDeactivate = async (id) => {
    if (window.confirm(t("utility.confirmDeactivate"))) {
      try {
        await deactivateUtilityConfig(id);
        alert(t("utility.deactivateSuccess"));
        loadData();
      } catch (error) {
        console.error("Error deactivating config:", error);
        alert(t("utility.deactivateFailed"));
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(t("utility.confirmDelete"))) {
      try {
        await deleteUtilityConfig(id);
        alert(t("utility.deleteSuccess"));
        loadData();
      } catch (error) {
        console.error("Error deleting config:", error);
        alert(t("utility.deleteFailed"));
      }
    }
  };

  const getPropertyConfigs = (propertyId) => {
    return configs.filter((c) => c.propertyId === propertyId);
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
          title={t("utility.utilityConfig")}
          subtitle={t("utility.utilitySubtitle")}
        />

        <main className="p-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Settings className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">
                    {t("utility.totalConfigs")}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {configs.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Power className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">
                    {t("utility.activeConfigs")}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {configs.filter((c) => c.active).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Settings className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">
                    {t("utility.properties")}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {properties.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Properties List */}
          <div className="space-y-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-gray-600">{t("common.loading")}</p>
              </div>
            ) : properties.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">{t("utility.noProperties")}</p>
              </div>
            ) : (
              properties.map((property) => {
                const propertyConfigs = getPropertyConfigs(property.propertyId);
                const activeConfig = propertyConfigs.find((c) => c.active);

                return (
                  <div
                    key={property.propertyId}
                    className="bg-white rounded-xl shadow-sm overflow-hidden"
                  >
                    {/* Property Header */}
                    <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-white">
                            {property.title}
                          </h3>
                          <p className="text-purple-100 text-sm">
                            {property.address?.district}
                          </p>
                        </div>
                        <button
                          onClick={() => handleCreate(property)}
                          className="flex items-center gap-2 px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-lg transition font-medium"
                        >
                          <Plus className="w-4 h-4" />
                          {t("utility.addConfig")}
                        </button>
                      </div>
                    </div>

                    {/* Configs Table */}
                    <div className="p-6">
                      {propertyConfigs.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">
                          {t("utility.noConfigs")}
                        </p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                  {t("utility.level")}
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                  {t("utility.electricity")}
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                  {t("utility.water")}
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                  {t("utility.internet")}
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                  {t("utility.status")}
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                  {t("utility.actions")}
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {propertyConfigs.map((config) => (
                                <tr
                                  key={config.id}
                                  className="hover:bg-gray-50"
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
                                        ? t("utility.contractLevel")
                                        : t("utility.propertyLevel")}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-900">
                                    {formatCurrency(
                                      config.electricityUnitPrice
                                    )}
                                    /kWh
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-900">
                                    {formatCurrency(config.waterUnitPrice)}/m³
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
                                        ? t("utility.active")
                                        : t("utility.inactive")}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="flex items-center justify-end gap-2">
                                      <button
                                        onClick={() => handleEdit(config)}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                        title={t("utility.edit")}
                                      >
                                        <Edit className="w-4 h-4" />
                                      </button>
                                      {config.active && (
                                        <button
                                          onClick={() =>
                                            handleDeactivate(config.id)
                                          }
                                          className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition"
                                          title={t("utility.deactivate")}
                                        >
                                          <Power className="w-4 h-4" />
                                        </button>
                                      )}
                                      <button
                                        onClick={() => handleDelete(config.id)}
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
                  </div>
                );
              })
            )}
          </div>
        </main>

        <Footer />
      </div>

      {/* Config Modal */}
      {showModal && (
        <UtilityConfigModal
          config={selectedConfig}
          property={selectedProperty}
          contract={null}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default UtilityConfigPage;
