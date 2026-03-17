import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, XCircle, Clock3 } from "lucide-react";
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
        title: "Thanh toan thanh cong",
        description: "Giao dich MoMo da duoc ghi nhan.",
        colorClass: "text-green-600",
        bgClass: "bg-green-50 border-green-200",
      };
    }

    return {
      icon: XCircle,
      title: "Thanh toan that bai",
      description: "Giao dich chua hoan tat. Ban co the thu lai.",
      colorClass: "text-red-600",
      bgClass: "bg-red-50 border-red-200",
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className={`rounded-xl border p-4 ${ui.bgClass}`}>
          <div className="flex items-center gap-3">
            <Icon className={`w-8 h-8 ${ui.colorClass}`} />
            <div>
              <h1 className="text-xl font-bold text-gray-900">{ui.title}</h1>
              <p className="text-sm text-gray-600">{ui.description}</p>
            </div>
          </div>
        </div>

        <div className="mt-5 space-y-2 text-sm text-gray-700">
          <p>
            <span className="font-semibold">Payment ID:</span>{" "}
            {paymentId || "N/A"}
          </p>
          <p>
            <span className="font-semibold">Status:</span>{" "}
            {status === "success" ? "SUCCESS" : "FAILED"}
          </p>
          {payment?.amount != null && (
            <p>
              <span className="font-semibold">Amount:</span>{" "}
              {Number(payment.amount).toLocaleString("vi-VN")} VND
            </p>
          )}
          {payment?.method && (
            <p>
              <span className="font-semibold">Method:</span> {payment.method}
            </p>
          )}
        </div>

        {loading && (
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
            <Clock3 className="w-4 h-4 animate-spin" />
            Dang tai thong tin giao dich...
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <button
            onClick={handleGoDetail}
            className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Xem hoa don
          </button>
          <button
            onClick={() => navigate("/unified-bills")}
            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Ve danh sach hoa don
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentResult;
