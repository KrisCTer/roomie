import React from "react";
import {
  Home,
  User,
  Zap,
  Droplet,
  Wifi,
  Car,
  Wrench,
  X,
  Calendar,
  DollarSign,
} from "lucide-react";
import { useCreateBillForm } from "../../hooks/useCreateBillForm";
import { formatCurrency } from "../../utils/billHelpers";

const CreateBillModal = ({
  bill,
  properties,
  contracts,
  tenants,
  onClose,
  onSuccess,
}) => {
  const {
    formData,
    loading,
    selectedProperty,
    selectedContract,
    previousBill,
    activeProperties,
    availableContracts,
    handlePropertyChange,
    setSelectedContract,
    handleChange,
    calculateTotal,
    handleSubmit,
  } = useCreateBillForm(bill, properties, contracts, onSuccess);

  const selectedPropertyData = properties.find(
    (p) => p.propertyId === selectedProperty
  );

  const selectedTenant = selectedContract
    ? tenants[contracts.find((c) => c.id === selectedContract)?.tenantId]
    : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-5xl w-full my-8 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5 rounded-t-2xl z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">
                {bill ? "Update the invoice" : "Create a new invoice"}
              </h2>
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
          {/* Step 1: Property & Contract Selection */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center text-sm font-bold">
                1
              </div>
              Contract information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Property Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Choose a property <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedProperty}
                  onChange={(e) => handlePropertyChange(e.target.value)}
                  disabled={!!bill}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 transition"
                >
                  <option value="">-- Choose a property --</option>
                  {activeProperties.map((property) => (
                    <option
                      key={property.propertyId}
                      value={property.propertyId}
                    >
                      {property.title} - {property.address?.district}
                    </option>
                  ))}
                </select>

                {activeProperties.length === 0 && (
                  <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                    ⚠️ No ACTIVE contracts available
                  </p>
                )}
              </div>

              {/* Contract Selection */}
              {selectedProperty && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Choose a contract <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedContract}
                    onChange={(e) => setSelectedContract(e.target.value)}
                    disabled={!!bill}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 transition"
                  >
                    <option value="">-- Choose a contract --</option>
                    {availableContracts.map((contract) => {
                      const tenant = tenants[contract.tenantId];
                      return (
                        <option key={contract.id} value={contract.id}>
                          {contract.id.substring(0, 8)}... -{" "}
                          {tenant
                            ? `${tenant.firstName} ${tenant.lastName}`
                            : "N/A"}
                        </option>
                      );
                    })}
                  </select>
                  {availableContracts.length === 0 && (
                    <p className="text-sm text-red-600 mt-2">
                      ⚠️ No ACTIVE contracts available
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Property Info Banner */}
            {selectedPropertyData && (
              <div className="mt-4 bg-white rounded-xl p-4 border border-blue-200 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Home className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">
                      {selectedPropertyData.title}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedPropertyData.address?.fullAddress}
                    </p>
                    <p className="text-sm font-semibold text-blue-600 mt-2">
                      💰 Rent Price:{" "}
                      {formatCurrency(selectedPropertyData.monthlyRent)}/month
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tenant Info Banner */}
            {selectedTenant && (
              <div className="mt-4 bg-white rounded-xl p-4 border border-green-200 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">
                      {selectedTenant.firstName} {selectedTenant.lastName}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      📱 {selectedTenant.phoneNumber}
                    </p>
                    <p className="text-sm text-gray-600">
                      ✉️ {selectedTenant.email}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Step 2: Billing Period */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-600 text-white rounded-lg flex items-center justify-center text-sm font-bold">
                2
              </div>
              Payment Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Billing Month <span className="text-red-500">*</span>
                </label>
                <input
                  type="month"
                  name="billingMonth"
                  value={formData.billingMonth}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Rent Price <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="monthlyRent"
                  value={formData.monthlyRent}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                  placeholder="5000000"
                />
              </div>
            </div>
          </div>

          {/* Step 3: Utilities */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <div className="w-8 h-8 bg-green-600 text-white rounded-lg flex items-center justify-center text-sm font-bold">
                3
              </div>
              Utilities
            </h3>

            {/* Electricity */}
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-5 border-2 border-yellow-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-bold text-gray-900 text-lg">Electricity</h4>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">
                    Old Index
                  </label>
                  <input
                    type="number"
                    name="electricityOld"
                    value={formData.electricityOld}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-sm"
                    readOnly={!!previousBill}
                    placeholder="50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">
                    New Index <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="electricityNew"
                    value={formData.electricityNew}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-sm"
                    placeholder="100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">
                    Unit Price (VND/kWh)
                  </label>
                  <input
                    type="number"
                    name="electricityUnitPrice"
                    value={formData.electricityUnitPrice}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-sm"
                    placeholder="3500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">
                    Total Amount
                  </label>
                  <div className="w-full px-3 py-2 bg-yellow-100 border-2 border-yellow-300 rounded-lg font-bold text-yellow-800 text-sm flex items-center">
                    {formatCurrency(
                      (parseFloat(formData.electricityNew || 0) -
                        parseFloat(formData.electricityOld || 0)) *
                        parseFloat(formData.electricityUnitPrice || 0)
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Water */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-5 border-2 border-blue-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-400 rounded-lg flex items-center justify-center">
                  <Droplet className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-bold text-gray-900 text-lg">Water</h4>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">
                    Old Index
                  </label>
                  <input
                    type="number"
                    name="waterOld"
                    value={formData.waterOld}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    readOnly={!!previousBill}
                    placeholder="10"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">
                    New Index <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="waterNew"
                    value={formData.waterNew}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="15"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">
                    Unit Price (VND/m³)
                  </label>
                  <input
                    type="number"
                    name="waterUnitPrice"
                    value={formData.waterUnitPrice}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="15000"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">
                    Total Amount
                  </label>
                  <div className="w-full px-3 py-2 bg-blue-100 border-2 border-blue-300 rounded-lg font-bold text-blue-800 text-sm flex items-center">
                    {formatCurrency(
                      (parseFloat(formData.waterNew || 0) -
                        parseFloat(formData.waterOld || 0)) *
                        parseFloat(formData.waterUnitPrice || 0)
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Other Services */}
            <div className="bg-gray-50 rounded-xl p-5 border-2 border-gray-200">
              <h4 className="font-bold text-gray-900 mb-4">Other Services</h4>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 text-sm"
                    placeholder="200000"
                  />
                </div>

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
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 text-sm"
                    placeholder="100000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Cleaning
                  </label>
                  <input
                    type="number"
                    name="cleaningPrice"
                    value={formData.cleaningPrice}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 text-sm"
                    placeholder="50000"
                  />
                </div>

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
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 text-sm"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* Other Fees */}
            <div className="bg-orange-50 rounded-xl p-5 border-2 border-orange-200">
              <h4 className="font-bold text-gray-900 mb-4">Other Fees</h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    name="otherDescription"
                    value={formData.otherDescription}
                    onChange={handleChange}
                    placeholder="VD: Sửa chữa, thay thế..."
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Amount
                  </label>
                  <input
                    type="number"
                    name="otherPrice"
                    value={formData.otherPrice}
                    onChange={handleChange}
                    placeholder="0"
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Total */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm mb-1">TOTAL</p>
                <p className="text-4xl font-bold">
                  {formatCurrency(calculateTotal())}
                </p>
              </div>
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <DollarSign className="w-8 h-8" />
              </div>
            </div>
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
              disabled={loading || !selectedProperty || !selectedContract}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </span>
              ) : bill ? (
                "Update Bill"
              ) : (
                "Create Bill"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBillModal;
