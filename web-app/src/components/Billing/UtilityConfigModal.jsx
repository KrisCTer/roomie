// src/components/Billing/UtilityConfigModal.jsx
import React, { useState, useEffect } from "react";
import {
  X,
  Zap,
  Droplet,
  Wifi,
  Car,
  Wrench,
  DollarSign,
  Save,
  Home,
} from "lucide-react";
import { formatCurrency } from "../../utils/billHelpers";

/**
 * UtilityConfigModal
 * Modal for creating/editing utility price configurations
 */
const UtilityConfigModal = ({
  config,
  property,
  contract,
  onClose,
  onSave,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    propertyId: "",
    contractId: null,

    // Electricity
    electricityUnitPrice: 3500,
    electricityMeterNumber: "",

    // Water
    waterUnitPrice: 15000,
    waterMeterNumber: "",

    // Fixed services
    internetPrice: 200000,
    parkingPrice: 100000,
    cleaningPrice: 50000,
    maintenancePrice: 0,

    active: true,
  });

  useEffect(() => {
    // Edit mode
    if (config) {
      setFormData({
        propertyId: config.propertyId || "",
        contractId: config.contractId || null,
        electricityUnitPrice: config.electricityUnitPrice || 3500,
        electricityMeterNumber: config.electricityMeterNumber || "",
        waterUnitPrice: config.waterUnitPrice || 15000,
        waterMeterNumber: config.waterMeterNumber || "",
        internetPrice: config.internetPrice || 200000,
        parkingPrice: config.parkingPrice || 100000,
        cleaningPrice: config.cleaningPrice || 50000,
        maintenancePrice: config.maintenancePrice || 0,
        active: config.active !== undefined ? config.active : true,
      });
    }
    // Create mode
    else {
      setFormData((prev) => ({
        ...prev,
        propertyId: property?.propertyId || "",
        contractId: contract?.id || null,
      }));
    }
  }, [config, property, contract]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error("Error saving utility config:", error);
      alert("❌ Không thể lưu cấu hình!");
    } finally {
      setLoading(false);
    }
  };

  const configLevel = formData.contractId ? "Contract-level" : "Property-level";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full my-8 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-5 rounded-t-2xl z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {config ? "Update Utility Config" : "Create Utility Config"}
                </h2>
                <p className="text-purple-100 text-sm">{configLevel}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg flex items-center justify-center transition"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-6 max-h-[70vh] overflow-y-auto"
        >
          {/* Property Info Banner */}
          {property && (
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Home className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900">{property.title}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {property.address?.fullAddress}
                  </p>
                  <p className="text-sm font-semibold text-blue-600 mt-2">
                    💰 Rent: {formatCurrency(property.monthlyRent)}/month
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Electricity */}
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-5 border-2 border-yellow-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg">Electricity</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Unit Price (VND/kWh) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="electricityUnitPrice"
                  value={formData.electricityUnitPrice}
                  onChange={handleChange}
                  required
                  min="0"
                  step="100"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  placeholder="3500"
                />
                <p className="text-xs text-gray-600 mt-1">
                  Current: {formatCurrency(formData.electricityUnitPrice)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Meter Number (Optional)
                </label>
                <input
                  type="text"
                  name="electricityMeterNumber"
                  value={formData.electricityMeterNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  placeholder="e.g., EVN-12345678"
                />
              </div>
            </div>
          </div>

          {/* Water */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-5 border-2 border-blue-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-400 rounded-lg flex items-center justify-center">
                <Droplet className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg">Water</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Unit Price (VND/m³) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="waterUnitPrice"
                  value={formData.waterUnitPrice}
                  onChange={handleChange}
                  required
                  min="0"
                  step="100"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="15000"
                />
                <p className="text-xs text-gray-600 mt-1">
                  Current: {formatCurrency(formData.waterUnitPrice)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Meter Number (Optional)
                </label>
                <input
                  type="text"
                  name="waterMeterNumber"
                  value={formData.waterMeterNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., SAWACO-87654321"
                />
              </div>
            </div>
          </div>

          {/* Fixed Services */}
          <div className="bg-gray-50 rounded-xl p-5 border-2 border-gray-200">
            <h3 className="font-bold text-gray-900 text-lg mb-4">
              Fixed Services (Monthly)
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Internet */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Wifi className="w-4 h-4 text-purple-600" />
                  Internet
                </label>
                <input
                  type="number"
                  name="internetPrice"
                  value={formData.internetPrice}
                  onChange={handleChange}
                  min="0"
                  step="10000"
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                  placeholder="200000"
                />
                <p className="text-xs text-gray-600 mt-1">
                  {formatCurrency(formData.internetPrice)}
                </p>
              </div>

              {/* Parking */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Car className="w-4 h-4 text-green-600" />
                  Parking
                </label>
                <input
                  type="number"
                  name="parkingPrice"
                  value={formData.parkingPrice}
                  onChange={handleChange}
                  min="0"
                  step="10000"
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                  placeholder="100000"
                />
                <p className="text-xs text-gray-600 mt-1">
                  {formatCurrency(formData.parkingPrice)}
                </p>
              </div>

              {/* Cleaning */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Cleaning
                </label>
                <input
                  type="number"
                  name="cleaningPrice"
                  value={formData.cleaningPrice}
                  onChange={handleChange}
                  min="0"
                  step="10000"
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                  placeholder="50000"
                />
                <p className="text-xs text-gray-600 mt-1">
                  {formatCurrency(formData.cleaningPrice)}
                </p>
              </div>

              {/* Maintenance */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-orange-600" />
                  Maintenance
                </label>
                <input
                  type="number"
                  name="maintenancePrice"
                  value={formData.maintenancePrice}
                  onChange={handleChange}
                  min="0"
                  step="10000"
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                  placeholder="0"
                />
                <p className="text-xs text-gray-600 mt-1">
                  {formatCurrency(formData.maintenancePrice)}
                </p>
              </div>
            </div>
          </div>

          {/* Info Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>💡 Note:</strong> These prices will be automatically
              applied when creating new bills. You can still override them
              manually when needed.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  {config ? "Update Config" : "Create Config"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UtilityConfigModal;
