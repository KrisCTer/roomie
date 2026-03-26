import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, XCircle, Clock3, ArrowRight, Receipt, List } from "lucide-react";
import { getPayment } from "../../services/paymentService";

const PaymentResult = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const status = (searchParams.get("status") || "failed").toLowerCase();
  const paymentId = searchParams.get("paymentId");

  const [loading, setLoading] = useState(false);
  const [payment, setPayment] = useState(null);

  useEffect(() => {
    const loadPayment = async () => {
      if (!paymentId) return;

      try {
        setLoading(true);
        const res = await getPayment(paymentId);
        const paymentData = res?.result || res?.data?.result || null;
        setPayment(paymentData);
      } catch (error) {
        console.error("Failed to load payment result:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPayment();
  }, [paymentId]);

  const ui = useMemo(() => {
    if (status === "success") {
      return {
        icon: CheckCircle,
        title: "Thanh toán thành công!",
        description: "Giao dịch của bạn đã được ghi nhận và xử lý thành công.",
        colorClass: "text-green-600",
        bgClass: "bg-green-50 border-green-100",
        iconContainerClass: "bg-green-100",
        buttonClass: "bg-green-600 hover:bg-green-700 shadow-green-200",
      };
    }

    return {
      icon: XCircle,
      title: "Thanh toán thất bại",
      description: "Đã có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại sau.",
      colorClass: "text-red-600",
      bgClass: "bg-red-50 border-red-100",
      iconContainerClass: "bg-red-100",
      buttonClass: "bg-red-600 hover:bg-red-700 shadow-red-200",
    };
  }, [status]);

  const handleGoDetail = () => {
    if (payment?.billId) {
      navigate(`/bill-detail/${payment.billId}`);
      return;
    }

    navigate("/unified-bills");
  };

  const Icon = ui.icon;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative backgrounds */}
      <div className="absolute top-0 left-0 w-full h-64 bg-slate-900 -skew-y-3 -translate-y-32"></div>
      
      <div className="max-w-md w-full relative z-10">
        <div className="bg-white rounded-[32px] shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-500">
          {/* Status Header */}
          <div className={`pt-12 pb-8 px-8 text-center`}>
            <div className={`w-24 h-24 ${ui.iconContainerClass} rounded-[32px] flex items-center justify-center mx-auto mb-6 transition-transform hover:rotate-12 duration-300`}>
              <Icon className={`w-12 h-12 ${ui.colorClass}`} />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">{ui.title}</h1>
            <p className="text-slate-500 leading-relaxed">{ui.description}</p>
          </div>

          {/* Transaction Info */}
          <div className="px-8 pb-8 space-y-4">
            <div className={`rounded-2xl border p-5 ${ui.bgClass} space-y-3`}>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Mã giao dịch</span>
                    <span className="font-mono font-medium text-slate-700">{paymentId || "N/A"}</span>
                </div>
                <div className="h-px bg-white/50"></div>
                {payment?.amount != null && (
                    <div className="flex justify-between items-center">
                        <span className="text-slate-500 text-sm">Số tiền</span>
                        <span className="font-bold text-slate-900">{Number(payment.amount).toLocaleString("vi-VN")} VND</span>
                    </div>
                )}
                {payment?.method && (
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500">Phương thức</span>
                        <span className="font-medium text-slate-700 uppercase tracking-wider">{payment.method}</span>
                    </div>
                )}
            </div>

            {loading && (
              <div className="flex items-center justify-center gap-2 text-sm text-slate-400 py-2">
                <Clock3 className="w-4 h-4 animate-spin" />
                Đang tải thông tin chi tiết...
              </div>
            )}

            {/* Actions */}
            <div className="pt-4 space-y-3">
              <button
                onClick={handleGoDetail}
                className={`w-full py-4 ${ui.buttonClass} text-white rounded-2xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 group`}
              >
                <Receipt className="w-5 h-5" />
                Xem hóa đơn chi tiết
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => navigate("/unified-bills")}
                className="w-full py-4 border-2 border-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
              >
                <List className="w-5 h-5" />
                Về danh sách hóa đơn
              </button>
            </div>
          </div>
        </div>
        
        <p className="text-center mt-8 text-slate-400 text-sm">
          Cảm ơn bạn đã sử dụng dịch vụ của <span className="font-bold text-slate-600">Roomie</span>
        </p>
      </div>
    </div>
  );
};

export default PaymentResult;
