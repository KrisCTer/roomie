import React from "react";
import {
  CreditCard,
  Smartphone,
  Wallet,
  CheckCircle,
  DollarSign,
} from "lucide-react";
import {
  formatCurrency,
  getPaymentMethods,
} from "../../utils/billDetailHelpers";

const PaymentModal = ({
  bill,
  selectedMethod,
  setSelectedMethod,
  onClose,
  onPay,
  paying,
}) => {
  const paymentMethods = getPaymentMethods();

  const getIcon = (methodId) => {
    const icons = {
      VNPAY: CreditCard,
      MOMO: Smartphone,
      CASH: Wallet,
    };
    return icons[methodId] || CreditCard;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 rounded-t-xl z-10">
          <h2 className="text-2xl font-bold text-gray-900">
            Chọn phương thức thanh toán
          </h2>
        </div>

        <div className="p-6">
          {/* Amount */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white mb-6">
            <p className="text-blue-100 mb-2">Số tiền cần thanh toán</p>
            <p className="text-4xl font-bold">
              {formatCurrency(bill.totalAmount)}
            </p>
          </div>

          {/* Payment Methods */}
          <div className="space-y-3 mb-6">
            {paymentMethods.map((method) => {
              const Icon = getIcon(method.id);
              const isSelected = selectedMethod === method.id;

              return (
                <button
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id)}
                  className={`w-full p-4 rounded-lg border-2 transition ${
                    isSelected
                      ? `${method.border} ${method.bg}`
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        isSelected ? method.bg : "bg-gray-50"
                      }`}
                    >
                      <Icon className={`w-6 h-6 ${method.color}`} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-gray-900">
                        {method.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {method.description}
                      </p>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        isSelected
                          ? "border-blue-600 bg-blue-600"
                          : "border-gray-300"
                      }`}
                    >
                      {isSelected && (
                        <CheckCircle className="w-5 h-5 text-white" />
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>Lưu ý:</strong> Sau khi chọn phương thức thanh toán và
              nhấn "Thanh toán", bạn sẽ được chuyển đến trang thanh toán tương
              ứng.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={paying}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              onClick={onPay}
              disabled={!selectedMethod || paying}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {paying ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Đang xử lý...
                </>
              ) : (
                <>
                  <DollarSign className="w-5 h-5" />
                  Thanh toán
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
