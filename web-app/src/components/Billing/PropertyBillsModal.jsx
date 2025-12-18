import React, { useState, useEffect } from "react";
import { X, Plus, ArrowLeft, Home } from "lucide-react";
import BillHistoryList from "./BillHistoryList";
import CreateBillModal from "./CreateBillModal";
import { getBillsByContract } from "../../services/billing.service";
import { formatCurrency } from "../../utils/billHelpers";

const PropertyBillsModal = ({
  property,
  contracts,
  tenants,
  onClose,
  onSuccess,
  onView,
  onEdit,
  onSend,
  onDelete,
}) => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateBill, setShowCreateBill] = useState(false);

  useEffect(() => {
    if (property) {
      loadBills();
    }
  }, [property]);

  const loadBills = async () => {
    try {
      setLoading(true);

      // Get all contracts for this property
      const propertyContracts = contracts.filter(
        (c) => c.propertyId === property.propertyId
      );

      // Load bills for each contract
      const allBills = [];
      for (const contract of propertyContracts) {
        try {
          const res = await getBillsByContract(contract.id);
          if (res?.success && res?.result) {
            allBills.push(...res.result);
          }
        } catch (error) {
          console.error(
            `Error loading bills for contract ${contract.id}:`,
            error
          );
        }
      }

      // Sort by billing month (newest first)
      allBills.sort(
        (a, b) => new Date(b.billingMonth) - new Date(a.billingMonth)
      );

      setBills(allBills);
    } catch (error) {
      console.error("Error loading bills:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBillClick = () => {
    setShowCreateBill(true);
  };

  const handleCreateBillClose = () => {
    setShowCreateBill(false);
  };

  const handleCreateBillSuccess = () => {
    setShowCreateBill(false);
    loadBills();
    onSuccess();
  };

  if (showCreateBill) {
    return (
      <CreateBillModal
        bill={null}
        properties={[property]}
        contracts={contracts}
        tenants={tenants}
        onClose={handleCreateBillClose}
        onSuccess={handleCreateBillSuccess}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="w-8 h-8 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg flex items-center justify-center transition"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <Home className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {property.title}
                  </h2>
                  <p className="text-sm text-blue-100">
                    {property.address?.district}
                  </p>
                </div>
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

        {/* Property Info Banner */}
        <div className="bg-blue-50 border-b border-blue-100 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Rental Price</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(property.monthlyRent)}/month
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Bills</p>
              <p className="text-2xl font-bold text-gray-900">{bills.length}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-250px)]">
          {/* Create Bill Button */}
          <button
            onClick={handleCreateBillClick}
            className="w-full mb-4 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition shadow-lg font-semibold"
          >
            <Plus className="w-5 h-5" />
            Create New Bill
          </button>

          {/* Bills History */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Bill History
            </h3>

            {loading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-gray-600">Loading...</p>
              </div>
            ) : (
              <BillHistoryList
                bills={bills}
                onView={onView}
                onEdit={onEdit}
                onSend={onSend}
                onDelete={onDelete}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyBillsModal;
