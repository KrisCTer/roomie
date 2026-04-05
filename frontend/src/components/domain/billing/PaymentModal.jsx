import React, { useState } from "react";
import {
  CreditCard,
  Smartphone,
  Wallet,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Info,
} from "lucide-react";
import {
  formatCurrency,
  getPaymentMethods,
} from "../../../utils/billDetailHelpers";

const PaymentModal = ({
  bill,
  selectedMethod,
  setSelectedMethod,
  onClose,
  onPay,
  paying,
}) => {
  const [step, setStep] = useState(1);
  const paymentMethods = getPaymentMethods();

  const getIcon = (methodId) => {
    const icons = {
      VNPAY: CreditCard,
      MOMO: Smartphone,
      CASH: Wallet,
    };
    return icons[methodId] || CreditCard;
  };

  const currentMethod = paymentMethods.find((m) => m.id === selectedMethod);

  const handleNext = () => {
    if (selectedMethod) setStep(2);
  };

  const handleBack = () => {
    setStep(1);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
      <div className="bg-white rounded-[24px] max-w-lg w-full shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="px-8 pt-8 pb-4 flex justify-between items-center bg-white">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 leading-tight">
              {step === 1 ? "Phương thức thanh toán" : "Xác nhận thanh toán"}
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              {step === 1
                ? "Chọn cách thức thanh toán phù hợp với bạn"
                : "Vui lòng kiểm tra lại thông tin giao dịch"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-8 pb-8 pt-2">
          {step === 1 ? (
            <div className="space-y-4">
              {/* Amount Summary */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Tổng cộng cần trả
                  </p>
                  <p className="text-2xl font-bold text-slate-900">
                    {formatCurrency(bill.totalAmount)}
                  </p>
                </div>
                <div className="h-10 w-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-blue-600" />
                </div>
              </div>

              {/* Methods Grid */}
              <div className="space-y-3">
                {paymentMethods.map((method) => {
                  const Icon = getIcon(method.id);
                  const isSelected = selectedMethod === method.id;

                  return (
                    <button
                      key={method.id}
                      onClick={() => setSelectedMethod(method.id)}
                      className={`w-full group relative flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 ${
                        isSelected
                          ? `${method.border} ${method.bg} shadow-md`
                          : "border-slate-100 hover:border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <div
                        className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 ${
                          isSelected ? "bg-white shadow-sm" : "bg-slate-100"
                        }`}
                      >
                        <Icon className={`w-7 h-7 ${method.iconColor}`} />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-bold text-slate-900 text-lg">
                          {method.name}
                        </p>
                        <p className="text-xs text-slate-500 line-clamp-1">
                          {method.description}
                        </p>
                      </div>
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          isSelected
                            ? "border-slate-900 bg-slate-900 scale-110"
                            : "border-slate-200"
                        }`}
                      >
                        {isSelected && (
                          <CheckCircle className="w-4 h-4 text-white" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={handleNext}
                disabled={!selectedMethod}
                className="w-full mt-4 bg-slate-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed group shadow-lg shadow-slate-200"
              >
                Tiếp tục
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          ) : (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              {/* Method Detail Card */}
              <div className="text-center py-4 px-6 rounded-3xl bg-slate-50 border border-slate-100 relative overflow-hidden">
                 <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-10 ${currentMethod?.iconColor?.replace('text-', 'bg-')}`}></div>
                
                <div className="flex justify-center mb-4">
                  <div className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg bg-white`}>
                    {(() => {
                        const Icon = getIcon(currentMethod.id);
                        return <Icon className={`w-10 h-10 ${currentMethod.iconColor}`} />;
                    })()}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  Thanh toán qua {currentMethod.name}
                </h3>
                <p className="text-slate-500 text-sm mt-1 max-w-xs mx-auto">
                   Mã hoá đơn: <span className="font-semibold text-slate-700">#{bill.id.slice(-8).toUpperCase()}</span>
                </p>
              </div>

              {/* Amount Detail */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-slate-600">
                  <span className="text-sm">Tổng số tiền</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(bill.totalAmount)}</span>
                </div>
                 <div className="h-px bg-slate-100 my-2"></div>
                <div className="flex justify-between items-center font-bold text-lg text-slate-900">
                  <span>Cần thanh toán</span>
                  <span className="text-blue-600">{formatCurrency(bill.totalAmount)}</span>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 flex gap-3 text-sm text-blue-800 leading-relaxed">
                <Info className="w-5 h-5 shrink-0 mt-0.5" />
                <p>{currentMethod.instructions}</p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleBack}
                  disabled={paying}
                  className="flex-1 px-6 py-4 border-2 border-slate-100 text-slate-600 rounded-2xl hover:bg-slate-50 transition font-bold flex items-center justify-center gap-2 group"
                >
                  <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                  Quay lại
                </button>
                <button
                  onClick={onPay}
                  disabled={paying}
                  className={`flex-[2] py-4 rounded-2xl text-white font-bold transition-all flex items-center justify-center gap-3 shadow-lg ${currentMethod.color} hover:brightness-110 disabled:opacity-50`}
                >
                  {paying ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Đang kết nối...
                    </>
                  ) : (
                    <>
                      Thanh toán ngay
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;


