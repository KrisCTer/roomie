import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  FileText,
  Calendar,
  DollarSign,
  Zap,
  Droplet,
  Wifi,
  Car,
  Wrench,
  CheckCircle,
  Clock,
  AlertCircle,
  CreditCard,
  Smartphone,
  Wallet,
  Download,
  Share2,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../../components/layout/layoutUser/Sidebar.jsx";
import Header from "../../components/layout/layoutUser/Header.jsx";
import Footer from "../../components/layout/layoutUser/Footer.jsx";

import { getBill, payBill } from "../../services/billing.service";
import { createPayment } from "../../services/payment.service";
import { getContract } from "../../services/contract.service";
import { getPropertyById } from "../../services/property.service";

const BillDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState("Bills");
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  const [bill, setBill] = useState(null);
  const [contract, setContract] = useState(null);
  const [property, setProperty] = useState(null);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");

  useEffect(() => {
    loadBillData();
  }, [id]);

  const loadBillData = async () => {
    try {
      setLoading(true);

      // Load bill
      const billRes = await getBill(id);
      if (billRes?.success && billRes?.result) {
        const billData = billRes.result;
        setBill(billData);

        // Load contract
        if (billData.contractId) {
          const contractRes = await getContract(billData.contractId);
          if (contractRes?.success && contractRes?.result) {
            const contractData = contractRes.result;
            setContract(contractData);

            // Load property
            if (contractData.propertyId) {
              const propertyRes = await getPropertyById(
                contractData.propertyId
              );
              if (propertyRes?.success && propertyRes?.result) {
                setProperty(propertyRes.result);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Error loading bill:", error);
      alert("Không thể tải thông tin hóa đơn!");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!selectedPaymentMethod) {
      alert("Vui lòng chọn phương thức thanh toán!");
      return;
    }

    try {
      setPaying(true);

      // Create payment record
      const paymentPayload = {
        billId: bill.id,
        contractId: bill.contractId,
        amount: bill.totalAmount,
        paymentMethod: selectedPaymentMethod,
        description: `Thanh toán hóa đơn tháng ${formatDate(
          bill.billingMonth
        )}`,
      };

      const paymentRes = await createPayment(paymentPayload);

      if (paymentRes?.success && paymentRes?.result) {
        const payment = paymentRes.result;

        // For VNPAY or MOMO, redirect to payment gateway
        if (
          selectedPaymentMethod === "VNPAY" ||
          selectedPaymentMethod === "MOMO"
        ) {
          if (payment.paymentUrl) {
            window.location.href = payment.paymentUrl;
          } else {
            alert("Không thể tạo link thanh toán!");
          }
        }
        // For CASH, mark as paid directly
        else if (selectedPaymentMethod === "CASH") {
          const payRes = await payBill(bill.id, payment.id);
          if (payRes?.success) {
            alert("✅ Đã xác nhận thanh toán bằng tiền mặt!");
            loadBillData();
            setShowPaymentModal(false);
          }
        }
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      alert(
        "❌ Không thể thanh toán! " + (error?.response?.data?.message || "")
      );
    } finally {
      setPaying(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("vi-VN");
  };

  const formatDateTime = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString("vi-VN");
  };

  const getStatusConfig = (status) => {
    const configs = {
      DRAFT: {
        label: "Nháp",
        bg: "bg-gray-100",
        text: "text-gray-800",
        icon: FileText,
      },
      PENDING: {
        label: "Chờ thanh toán",
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        icon: Clock,
      },
      PAID: {
        label: "Đã thanh toán",
        bg: "bg-green-100",
        text: "text-green-800",
        icon: CheckCircle,
      },
      OVERDUE: {
        label: "Quá hạn",
        bg: "bg-red-100",
        text: "text-red-800",
        icon: AlertCircle,
      },
    };
    return configs[status] || configs.DRAFT;
  };

  if (loading) {
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
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Đang tải hóa đơn...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!bill) {
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
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Không tìm thấy hóa đơn
              </h2>
              <button
                onClick={() => navigate("/my-bills")}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Quay lại danh sách
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(bill.status);
  const StatusIcon = statusConfig.icon;
  const isOverdue = bill.status === "OVERDUE";
  const isPaid = bill.status === "PAID";
  const canPay = bill.status === "PENDING" || bill.status === "OVERDUE";

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

        <main className="p-6">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => navigate("/my-bills")}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Quay lại</span>
            </button>

            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Chi tiết hóa đơn
                </h1>
                <p className="text-gray-600">
                  Mã hóa đơn: <span className="font-mono">{bill.id}</span>
                </p>
              </div>

              <span
                className={`${statusConfig.bg} ${statusConfig.text} px-4 py-2 rounded-full font-medium flex items-center gap-2`}
              >
                <StatusIcon className="w-5 h-5" />
                {statusConfig.label}
              </span>
            </div>
          </div>

          {/* Overdue Warning */}
          {isOverdue && (
            <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-800 mb-1">
                    HÓA ĐƠN QUÁ HẠN THANH TOÁN
                  </h3>
                  <p className="text-sm text-red-700">
                    Hóa đơn đã quá hạn thanh toán từ ngày{" "}
                    {formatDate(bill.dueDate)}. Vui lòng thanh toán ngay để
                    tránh phát sinh phí phạt.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Paid Success */}
          {isPaid && (
            <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-green-800 mb-1">
                    ĐÃ THANH TOÁN THÀNH CÔNG
                  </h3>
                  <p className="text-sm text-green-700">
                    Hóa đơn đã được thanh toán vào lúc{" "}
                    {formatDateTime(bill.paidAt)}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Property Info */}
              {property && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Thông tin bất động sản
                  </h2>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Tên tài sản</p>
                      <p className="font-medium text-gray-900">
                        {property.title}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Địa chỉ</p>
                      <p className="font-medium text-gray-900">
                        {property.address?.fullAddress}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Bill Details */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Chi tiết hóa đơn
                </h2>

                <div className="space-y-4">
                  {/* Rent */}
                  <BillItem
                    icon={FileText}
                    label="Tiền thuê nhà"
                    amount={bill.rentPrice}
                    iconColor="text-blue-600"
                    iconBg="bg-blue-100"
                  />

                  {/* Electricity */}
                  <div className="border-t pt-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                          <Zap className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Tiền điện</p>
                          <p className="text-xs text-gray-600">
                            {bill.electricityOld} → {bill.electricityNew} kWh (
                            {bill.electricityConsumption} kWh ×{" "}
                            {formatCurrency(bill.electricityUnitPrice)})
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-gray-900">
                        {formatCurrency(bill.electricityAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Water */}
                  <div className="border-t pt-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Droplet className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Tiền nước</p>
                          <p className="text-xs text-gray-600">
                            {bill.waterOld} → {bill.waterNew} m³ (
                            {bill.waterConsumption} m³ ×{" "}
                            {formatCurrency(bill.waterUnitPrice)})
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-gray-900">
                        {formatCurrency(bill.waterAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Internet */}
                  {bill.internetPrice > 0 && (
                    <BillItem
                      icon={Wifi}
                      label="Internet"
                      amount={bill.internetPrice}
                      iconColor="text-purple-600"
                      iconBg="bg-purple-100"
                    />
                  )}

                  {/* Parking */}
                  {bill.parkingPrice > 0 && (
                    <BillItem
                      icon={Car}
                      label="Gửi xe"
                      amount={bill.parkingPrice}
                      iconColor="text-green-600"
                      iconBg="bg-green-100"
                    />
                  )}

                  {/* Cleaning */}
                  {bill.cleaningPrice > 0 && (
                    <BillItem
                      icon={FileText}
                      label="Vệ sinh chung"
                      amount={bill.cleaningPrice}
                      iconColor="text-orange-600"
                      iconBg="bg-orange-100"
                    />
                  )}

                  {/* Maintenance */}
                  {bill.maintenancePrice > 0 && (
                    <BillItem
                      icon={Wrench}
                      label="Bảo trì"
                      amount={bill.maintenancePrice}
                      iconColor="text-red-600"
                      iconBg="bg-red-100"
                    />
                  )}

                  {/* Other */}
                  {bill.otherPrice > 0 && (
                    <div className="border-t pt-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-gray-900">Phí khác</p>
                          <p className="text-sm text-gray-600">
                            {bill.otherDescription}
                          </p>
                        </div>
                        <span className="font-bold text-gray-900">
                          {formatCurrency(bill.otherPrice)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Total */}
                <div className="mt-6 pt-6 border-t-2 border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-gray-900">
                      TỔNG CỘNG
                    </span>
                    <span className="text-3xl font-bold text-blue-600">
                      {formatCurrency(bill.totalAmount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Payment Info */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Thông tin thanh toán
                </h2>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      Tháng thanh toán
                    </p>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-900">
                        {formatDate(bill.billingMonth)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">Hạn thanh toán</p>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span
                        className={`font-medium ${
                          isOverdue ? "text-red-600" : "text-gray-900"
                        }`}
                      >
                        {formatDate(bill.dueDate)}
                      </span>
                    </div>
                  </div>

                  {isPaid && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">
                        Đã thanh toán lúc
                      </p>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="font-medium text-gray-900">
                          {formatDateTime(bill.paidAt)}
                        </span>
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="text-sm text-gray-600 mb-1">Mã hóa đơn</p>
                    <p className="font-mono text-sm text-gray-900 break-all">
                      {bill.id}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">Mã hợp đồng</p>
                    <p className="font-mono text-sm text-gray-900 break-all">
                      {bill.contractId}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Hành động
                </h2>

                <div className="space-y-3">
                  {canPay && (
                    <button
                      onClick={() => setShowPaymentModal(true)}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold shadow-md"
                    >
                      <DollarSign className="w-5 h-5" />
                      Thanh toán ngay
                    </button>
                  )}

                  <button className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium">
                    <Download className="w-5 h-5" />
                    Tải hóa đơn
                  </button>

                  <button className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium">
                    <Share2 className="w-5 h-5" />
                    Chia sẻ
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          bill={bill}
          selectedMethod={selectedPaymentMethod}
          setSelectedMethod={setSelectedPaymentMethod}
          onClose={() => setShowPaymentModal(false)}
          onPay={handlePayment}
          paying={paying}
        />
      )}
    </div>
  );
};

// ========== SUB COMPONENTS ==========

const BillItem = ({ icon: Icon, label, amount, iconColor, iconBg }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  };

  return (
    <div className="border-t pt-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 ${iconBg} rounded-lg flex items-center justify-center`}
          >
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
          <span className="font-medium text-gray-900">{label}</span>
        </div>
        <span className="font-bold text-gray-900">
          {formatCurrency(amount)}
        </span>
      </div>
    </div>
  );
};

const PaymentModal = ({
  bill,
  selectedMethod,
  setSelectedMethod,
  onClose,
  onPay,
  paying,
}) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  };

  const paymentMethods = [
    {
      id: "VNPAY",
      name: "VNPay",
      description: "Thanh toán qua VNPay",
      icon: CreditCard,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-200",
    },
    {
      id: "MOMO",
      name: "MoMo",
      description: "Thanh toán qua ví MoMo",
      icon: Smartphone,
      color: "text-pink-600",
      bg: "bg-pink-50",
      border: "border-pink-200",
    },
    {
      id: "CASH",
      name: "Tiền mặt",
      description: "Thanh toán trực tiếp bằng tiền mặt",
      icon: Wallet,
      color: "text-green-600",
      bg: "bg-green-50",
      border: "border-green-200",
    },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 rounded-t-xl">
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
              const Icon = method.icon;
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

export default BillDetail;
