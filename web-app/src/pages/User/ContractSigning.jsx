import React, { useState, useEffect } from "react";
import {
  FileText,
  CheckCircle,
  AlertCircle,
  Download,
  Eye,
  PenTool,
  User,
  Calendar,
  Home,
  DollarSign,
  Clock,
  Check,
  X,
  ArrowLeft,
  Printer,
} from "lucide-react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../../components/layout/layoutUser/Sidebar.jsx";
import Header from "../../components/layout/layoutUser/Header.jsx";
import StatsCard from "../../components/layout/layoutUser/StatsCard.jsx";
import Footer from "../../components/layout/layoutUser/Footer";

// ========== MOCK DATA ==========
const mockContract = {
  id: "CONTRACT_001",
  bookingId: "BOOKING_123",
  propertyId: "PROP_456",
  tenantId: "USER_789",
  landlordId: "USER_101",
  startDate: "2024-01-01T00:00:00Z",
  endDate: "2024-12-31T23:59:59Z",
  status: "ACTIVE", // Thay đổi từ PENDING_SIGNATURE
  tenantSigned: true, // Đã ký
  landlordSigned: true, // Đã ký
  pdfUrl: "https://example.com/contract.pdf",
  createdAt: "2023-12-01T10:00:00Z",
  updatedAt: "2023-12-05T10:00:00Z",
  landlordSignedDate: "2023-12-03T10:00:00Z",
  tenantSignedDate: "2023-12-05T10:00:00Z",
  property: {
    title: "Luxury Apartment in District 1",
    address: "123 Nguyen Hue, Ben Nghe Ward, District 1, HCMC",
    monthlyRent: 15000000,
    rentalDeposit: 30000000,
    size: 85,
    bedrooms: 2,
    bathrooms: 2,
  },
  tenant: {
    name: "Nguyen Van A",
    idCard: "079123456789",
    phone: "0901234567",
    email: "nguyenvana@example.com",
  },
  landlord: {
    name: "Tran Thi B",
    idCard: "079987654321",
    phone: "0909876543",
    email: "tranthib@example.com",
  },
};

// ========== MAIN COMPONENT ==========
const ContractSigning = () => {
  const { contractId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [contract, setContract] = useState(mockContract);
  const [loading, setLoading] = useState(false);
  const [userRole] = useState("landlord"); // "tenant" or "landlord"
  const [agreed, setAgreed] = useState(false);
  const [signatureConfirmed, setSignatureConfirmed] = useState(false);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [activeMenu, setActiveMenu] = useState("Contracts");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Kiểm tra xem hợp đồng đã được ký chưa
  const isContractSigned = contract.tenantSigned && contract.landlordSigned;
  const isAlreadySigned = userRole === "tenant" ? contract.tenantSigned : contract.landlordSigned;
  const otherPartySigned = userRole === "tenant" ? contract.landlordSigned : contract.tenantSigned;

  useEffect(() => {
    // Load contract data from API or location state
    if (location.state?.contract) {
      setContract(location.state.contract);
    }
    // TODO: Fetch contract from API using contractId
  }, [contractId, location.state]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleSign = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Update contract status
      setContract((prev) => ({
        ...prev,
        [userRole === "tenant" ? "tenantSigned" : "landlordSigned"]: true,
        [userRole === "tenant" ? "tenantSignedDate" : "landlordSignedDate"]: new Date().toISOString(),
        status:
          prev.tenantSigned && prev.landlordSigned
            ? "ACTIVE"
            : "PENDING_SIGNATURE",
      }));

      setCurrentStep(4);
    } catch (error) {
      console.error("Signing error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = () => {
    // TODO: Implement actual PDF download
    window.open(contract.pdfUrl, "_blank");
  };

  const handlePrintContract = () => {
    // TODO: Implement print functionality
    window.print();
  };

  // ========== SIGNED CONTRACT VIEW (For already signed contracts) ==========
  const renderSignedContractView = () => (
    <div className="space-y-6">
      {/* Back Button & Status */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate("/contracts")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Quay lại danh sách</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Hợp đồng đã ký
          </span>
        </div>
      </div>

      {/* Contract Header */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Hợp Đồng Thuê Nhà
            </h2>
            <p className="text-gray-600 mt-1">Mã hợp đồng: {contract.id}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handlePrintContract}
              className="px-4 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2"
            >
              <Printer className="w-5 h-5" />
              In
            </button>
            <button
              onClick={() => setShowPdfPreview(true)}
              className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2"
            >
              <Eye className="w-5 h-5" />
              Xem PDF
            </button>
            <button
              onClick={handleDownloadPdf}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              Tải xuống
            </button>
          </div>
        </div>

        {/* Signature Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <h3 className="font-semibold text-gray-900">
                  Chữ ký Chủ nhà
                </h3>
                <p className="text-sm text-gray-600">{contract.landlord.name}</p>
              </div>
            </div>
            <p className="text-xs text-gray-600">
              Đã ký vào: {formatDateTime(contract.landlordSignedDate)}
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <h3 className="font-semibold text-gray-900">
                  Chữ ký Người thuê
                </h3>
                <p className="text-sm text-gray-600">{contract.tenant.name}</p>
              </div>
            </div>
            <p className="text-xs text-gray-600">
              Đã ký vào: {formatDateTime(contract.tenantSignedDate)}
            </p>
          </div>
        </div>

        {/* Contract Status Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900 mb-1">
                Hợp đồng có hiệu lực
              </p>
              <p className="text-sm text-gray-700">
                Hợp đồng đã được ký bởi cả hai bên và đang có hiệu lực pháp lý.
                Thời hạn từ {formatDate(contract.startDate)} đến{" "}
                {formatDate(contract.endDate)}.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Property Information */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Home className="w-5 h-5 text-blue-600" />
          Thông Tin Tài Sản
        </h3>
        <div className="space-y-3">
          <div>
            <p className="text-sm text-gray-600">Tên tài sản</p>
            <p className="font-medium text-gray-900">
              {contract.property.title}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Địa chỉ</p>
            <p className="font-medium text-gray-900">
              {contract.property.address}
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t">
            <div>
              <p className="text-sm text-gray-600">Diện tích</p>
              <p className="font-medium text-gray-900">
                {contract.property.size} m²
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Phòng ngủ</p>
              <p className="font-medium text-gray-900">
                {contract.property.bedrooms}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Phòng tắm</p>
              <p className="font-medium text-gray-900">
                {contract.property.bathrooms}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Giá thuê</p>
              <p className="font-medium text-blue-600">
                {formatCurrency(contract.property.monthlyRent)}/tháng
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contract Terms */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          Điều Khoản Hợp Đồng
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
            <Calendar className="w-5 h-5 text-gray-600 mt-0.5" />
            <div>
              <p className="text-sm text-gray-600">Thời gian thuê</p>
              <p className="font-medium text-gray-900">
                {formatDate(contract.startDate)} -{" "}
                {formatDate(contract.endDate)}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
            <DollarSign className="w-5 h-5 text-gray-600 mt-0.5" />
            <div>
              <p className="text-sm text-gray-600">Tiền đặt cọc</p>
              <p className="font-medium text-gray-900">
                {formatCurrency(contract.property.rentalDeposit)}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
            <Clock className="w-5 h-5 text-gray-600 mt-0.5" />
            <div>
              <p className="text-sm text-gray-600">Ngày thanh toán</p>
              <p className="font-medium text-gray-900">
                Ngày {new Date(contract.startDate).getDate()} hàng tháng
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
            <FileText className="w-5 h-5 text-gray-600 mt-0.5" />
            <div>
              <p className="text-sm text-gray-600">Trạng thái</p>
              <p className="font-medium text-green-600">
                Đang hiệu lực
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Parties Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            Bên Cho Thuê
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Họ và tên</p>
              <p className="font-medium text-gray-900">
                {contract.landlord.name}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">CMND/CCCD</p>
              <p className="font-medium text-gray-900">
                {contract.landlord.idCard}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Số điện thoại</p>
              <p className="font-medium text-gray-900">
                {contract.landlord.phone}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium text-gray-900">
                {contract.landlord.email}
              </p>
            </div>
            <div className="pt-3 border-t">
              <span className="inline-flex items-center gap-2 text-green-600 text-sm font-medium">
                <CheckCircle className="w-4 h-4" />
                Đã ký ngày {formatDate(contract.landlordSignedDate)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-green-600" />
            Bên Thuê
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Họ và tên</p>
              <p className="font-medium text-gray-900">
                {contract.tenant.name}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">CMND/CCCD</p>
              <p className="font-medium text-gray-900">
                {contract.tenant.idCard}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Số điện thoại</p>
              <p className="font-medium text-gray-900">
                {contract.tenant.phone}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium text-gray-900">
                {contract.tenant.email}
              </p>
            </div>
            <div className="pt-3 border-t">
              <span className="inline-flex items-center gap-2 text-green-600 text-sm font-medium">
                <CheckCircle className="w-4 h-4" />
                Đã ký ngày {formatDate(contract.tenantSignedDate)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Contract Timeline */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-bold mb-4">Lịch Sử Hợp Đồng</h3>
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="w-0.5 h-full bg-gray-200 mt-2"></div>
            </div>
            <div className="flex-1 pb-6">
              <p className="font-medium text-gray-900">Hợp đồng được tạo</p>
              <p className="text-sm text-gray-600">
                {formatDateTime(contract.createdAt)}
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="w-0.5 h-full bg-gray-200 mt-2"></div>
            </div>
            <div className="flex-1 pb-6">
              <p className="font-medium text-gray-900">Chủ nhà ký hợp đồng</p>
              <p className="text-sm text-gray-600">
                {formatDateTime(contract.landlordSignedDate)}
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">Người thuê ký hợp đồng</p>
              <p className="text-sm text-gray-600">
                {formatDateTime(contract.tenantSignedDate)}
              </p>
              <p className="text-sm text-green-600 font-medium mt-1">
                Hợp đồng có hiệu lực
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ========== STEP 1: CONTRACT PREVIEW ==========
  const renderStep1 = () => (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate("/contracts")}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Quay lại danh sách</span>
      </button>

      {/* Contract Header */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Hợp Đồng Thuê Nhà
            </h2>
            <p className="text-gray-600 mt-1">Mã hợp đồng: {contract.id}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowPdfPreview(true)}
              className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2"
            >
              <Eye className="w-5 h-5" />
              Xem PDF
            </button>
            <button className="px-4 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2">
              <Download className="w-5 h-5" />
              Tải xuống
            </button>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2 mb-4">
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            Chờ ký
          </span>

          {isAlreadySigned && (
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 flex items-center gap-1">
              <CheckCircle className="w-4 h-4" />
              Bạn đã ký
            </span>
          )}
        </div>
      </div>

      {/* Property Information */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Home className="w-5 h-5 text-blue-600" />
          Thông Tin Tài Sản
        </h3>
        <div className="space-y-3">
          <div>
            <p className="text-sm text-gray-600">Tên tài sản</p>
            <p className="font-medium text-gray-900">
              {contract.property.title}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Địa chỉ</p>
            <p className="font-medium text-gray-900">
              {contract.property.address}
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t">
            <div>
              <p className="text-sm text-gray-600">Diện tích</p>
              <p className="font-medium text-gray-900">
                {contract.property.size} m²
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Phòng ngủ</p>
              <p className="font-medium text-gray-900">
                {contract.property.bedrooms}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Phòng tắm</p>
              <p className="font-medium text-gray-900">
                {contract.property.bathrooms}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Giá thuê</p>
              <p className="font-medium text-blue-600">
                {formatCurrency(contract.property.monthlyRent)}/tháng
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contract Terms */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          Điều Khoản Hợp Đồng
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
            <Calendar className="w-5 h-5 text-gray-600 mt-0.5" />
            <div>
              <p className="text-sm text-gray-600">Thời gian thuê</p>
              <p className="font-medium text-gray-900">
                {formatDate(contract.startDate)} -{" "}
                {formatDate(contract.endDate)}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
            <DollarSign className="w-5 h-5 text-gray-600 mt-0.5" />
            <div>
              <p className="text-sm text-gray-600">Tiền đặt cọc</p>
              <p className="font-medium text-gray-900">
                {formatCurrency(contract.property.rentalDeposit)}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
            <Clock className="w-5 h-5 text-gray-600 mt-0.5" />
            <div>
              <p className="text-sm text-gray-600">Ngày thanh toán</p>
              <p className="font-medium text-gray-900">
                Ngày {new Date(contract.startDate).getDate()} hàng tháng
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
            <FileText className="w-5 h-5 text-gray-600 mt-0.5" />
            <div>
              <p className="text-sm text-gray-600">Trạng thái</p>
              <p className="font-medium text-gray-900">
                {contract.tenantSigned && contract.landlordSigned
                  ? "Cả 2 bên đã ký"
                  : otherPartySigned
                  ? "Bên kia đã ký"
                  : "Chờ ký"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Parties Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            Bên Cho Thuê
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Họ và tên</p>
              <p className="font-medium text-gray-900">
                {contract.landlord.name}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">CMND/CCCD</p>
              <p className="font-medium text-gray-900">
                {contract.landlord.idCard}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Số điện thoại</p>
              <p className="font-medium text-gray-900">
                {contract.landlord.phone}
              </p>
            </div>
            {contract.landlordSigned && (
              <div className="pt-3 border-t">
                <span className="inline-flex items-center gap-2 text-green-600 text-sm font-medium">
                  <CheckCircle className="w-4 h-4" />
                  Đã ký ngày {formatDate(contract.updatedAt)}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-green-600" />
            Bên Thuê
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Họ và tên</p>
              <p className="font-medium text-gray-900">
                {contract.tenant.name}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">CMND/CCCD</p>
              <p className="font-medium text-gray-900">
                {contract.tenant.idCard}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Số điện thoại</p>
              <p className="font-medium text-gray-900">
                {contract.tenant.phone}
              </p>
            </div>
            {contract.tenantSigned && (
              <div className="pt-3 border-t">
                <span className="inline-flex items-center gap-2 text-green-600 text-sm font-medium">
                  <CheckCircle className="w-4 h-4" />
                  Đã ký ngày {formatDate(contract.updatedAt)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // ========== STEP 2: TERMS & CONDITIONS ==========
  const renderStep2 = () => (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-bold mb-6">Điều Khoản và Điều Kiện</h2>

      <div className="space-y-6 max-h-[500px] overflow-y-auto pr-4">
        <section>
          <h3 className="text-lg font-semibold mb-3">
            1. TRÁCH NHIỆM CỦA BÊN CHO THUÊ
          </h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
            <li>Giao nhà và trang thiết bị đúng thời hạn đã thỏa thuận</li>
            <li>
              Bảo đảm quyền sử dụng của Bên thuê trong suốt thời gian thuê
            </li>
            <li>Bảo trì, sửa chữa các hư hỏng về kết cấu của nhà</li>
            <li>Không tăng giá thuê trong thời gian hợp đồng</li>
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-3">
            2. TRÁCH NHIỆM CỦA BÊN THUÊ
          </h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
            <li>
              Sử dụng nhà đúng mục đích, giữ gìn nhà và trang thiết bị như tài
              sản của mình
            </li>
            <li>Thanh toán đầy đủ và đúng hạn tiền thuê nhà</li>
            <li>
              Thanh toán các chi phí điện, nước, internet và các dịch vụ khác
              phát sinh
            </li>
            <li>
              Không được tự ý sửa chữa, cải tạo nhà khi chưa có sự đồng ý của
              Bên cho thuê
            </li>
            <li>Trả nhà cho Bên cho thuê khi hết hạn hợp đồng</li>
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-3">
            3. ĐIỀU KHOẢN THANH TOÁN
          </h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
            <li>
              Tiền thuê: {formatCurrency(contract.property.monthlyRent)}/tháng
            </li>
            <li>
              Tiền đặt cọc: {formatCurrency(contract.property.rentalDeposit)}
            </li>
            <li>
              Ngày thanh toán: Ngày {new Date(contract.startDate).getDate()}{" "}
              hàng tháng
            </li>
            <li>Phương thức: Chuyển khoản hoặc tiền mặt</li>
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-3">
            4. ĐIỀU KHOẢN HỦY HỢP ĐỒNG
          </h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
            <li>Thông báo trước 30 ngày nếu muốn hủy hợp đồng</li>
            <li>Vi phạm điều khoản hợp đồng có thể dẫn đến mất tiền đặt cọc</li>
            <li>
              Bên cho thuê có quyền thu hồi nhà nếu Bên thuê vi phạm nghiêm
              trọng
            </li>
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-3">5. ĐIỀU KHOẢN CHUNG</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
            <li>Hai bên cam kết thực hiện đúng các điều khoản đã thỏa thuận</li>
            <li>
              Trong quá trình thực hiện, nếu có vướng mắc, hai bên cùng bàn bạc
              giải quyết
            </li>
            <li>Hợp đồng có hiệu lực kể từ ngày ký</li>
            <li>Hợp đồng được lập thành 02 bản có giá trị pháp lý như nhau</li>
          </ul>
        </section>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 mt-0.5"
          />
          <span className="text-sm text-gray-700">
            Tôi đã đọc và đồng ý với tất cả các điều khoản và điều kiện của hợp
            đồng thuê nhà này. Tôi hiểu rõ các quyền và nghĩa vụ của mình và cam
            kết thực hiện đầy đủ.
          </span>
        </label>
      </div>
    </div>
  );

  // ========== STEP 3: DIGITAL SIGNATURE ==========
  const renderStep3 = () => (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-bold mb-6">Ký Điện Tử</h2>

      <div className="space-y-6">
        {/* Signature Info */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <PenTool className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Xác Nhận Ký Điện Tử
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Bằng việc nhấn nút "Ký Hợp Đồng" bên dưới, bạn xác nhận rằng bạn
                đã đọc, hiểu rõ và đồng ý với tất cả các điều khoản trong hợp
                đồng. Chữ ký điện tử của bạn có giá trị pháp lý tương đương với
                chữ ký viết tay.
              </p>
            </div>
          </div>
        </div>

        {/* Signer Information */}
        <div className="border rounded-lg p-6">
          <h3 className="font-semibold mb-4">Thông Tin Người Ký</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Họ và tên</p>
              <p className="font-medium text-gray-900">
                {userRole === "tenant"
                  ? contract.tenant.name
                  : contract.landlord.name}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">CMND/CCCD</p>
              <p className="font-medium text-gray-900">
                {userRole === "tenant"
                  ? contract.tenant.idCard
                  : contract.landlord.idCard}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Vai trò</p>
              <p className="font-medium text-gray-900">
                {userRole === "tenant" ? "Bên Thuê" : "Bên Cho Thuê"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Thời gian ký</p>
              <p className="font-medium text-gray-900">
                {new Date().toLocaleString("vi-VN")}
              </p>
            </div>
          </div>
        </div>

        {/* Confirmation Checkbox */}
        <div className="border-2 border-yellow-200 bg-yellow-50 rounded-lg p-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={signatureConfirmed}
              onChange={(e) => setSignatureConfirmed(e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 mt-0.5"
            />
            <div>
              <p className="font-medium text-gray-900 mb-1">
                Xác nhận chữ ký điện tử
              </p>
              <p className="text-sm text-gray-700">
                Tôi xác nhận rằng tôi là người có thẩm quyền ký kết hợp đồng này
                và chữ ký điện tử của tôi có hiệu lực pháp lý đầy đủ.
              </p>
            </div>
          </label>
        </div>

        {/* Signature Preview */}
        <div className="border rounded-lg p-6 bg-gray-50">
          <p className="text-sm text-gray-600 mb-3">Chữ ký điện tử</p>
          <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <div
              className="text-3xl font-cursive text-blue-600 mb-2"
              style={{ fontFamily: "Brush Script MT, cursive" }}
            >
              {userRole === "tenant"
                ? contract.tenant.name
                : contract.landlord.name}
            </div>
            <p className="text-sm text-gray-500">Chữ ký số</p>
          </div>
        </div>

        {/* Warning */}
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-800">
            <strong>Lưu ý quan trọng:</strong> Sau khi ký, bạn không thể thu hồi
            chữ ký. Vui lòng đảm bảo bạn đã đọc kỹ toàn bộ hợp đồng trước khi
            tiếp tục.
          </p>
        </div>
      </div>
    </div>
  );

  // ========== STEP 4: COMPLETION ==========
  const renderStep4 = () => (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="text-center py-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          Ký Hợp Đồng Thành Công!
        </h2>

        <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
          {contract.tenantSigned && contract.landlordSigned
            ? "Cả hai bên đã ký hợp đồng. Hợp đồng đã có hiệu lực pháp lý."
            : "Chữ ký của bạn đã được ghi nhận. Vui lòng chờ bên kia ký để hoàn tất hợp đồng."}
        </p>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto mb-8">
          <div
            className={`p-4 rounded-lg border-2 ${
              contract.landlordSigned
                ? "bg-green-50 border-green-200"
                : "bg-gray-50 border-gray-200"
            }`}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              {contract.landlordSigned ? (
                <Check className="w-5 h-5 text-green-600" />
              ) : (
                <Clock className="w-5 h-5 text-gray-400" />
              )}
              <span className="font-semibold">Bên Cho Thuê</span>
            </div>
            <p className="text-sm text-gray-600">
              {contract.landlordSigned ? "Đã ký" : "Chờ ký"}
            </p>
          </div>

          <div
            className={`p-4 rounded-lg border-2 ${
              contract.tenantSigned
                ? "bg-green-50 border-green-200"
                : "bg-gray-50 border-gray-200"
            }`}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              {contract.tenantSigned ? (
                <Check className="w-5 h-5 text-green-600" />
              ) : (
                <Clock className="w-5 h-5 text-gray-400" />
              )}
              <span className="font-semibold">Bên Thuê</span>
            </div>
            <p className="text-sm text-gray-600">
              {contract.tenantSigned ? "Đã ký" : "Chờ ký"}
            </p>
          </div>
        </div>

        {/* Next Steps */}
        {contract.tenantSigned && contract.landlordSigned && (
          <div className="bg-blue-50 rounded-lg p-6 mb-6 max-w-2xl mx-auto">
            <h3 className="font-semibold text-gray-900 mb-3">
              Hợp đồng đã có hiệu lực
            </h3>
            <ul className="text-left space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">✓</span>
                Cả hai bên đã ký hợp đồng thành công
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">✓</span>
                Hợp đồng có hiệu lực pháp lý
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">✓</span>
                Bạn có thể tải xuống bản PDF của hợp đồng
              </li>
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => window.open(contract.pdfUrl, "_blank")}
            className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            Tải Hợp Đồng
          </button>

          <button
            onClick={() => navigate("/contracts")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            Xem Danh Sách Hợp Đồng
          </button>
        </div>
      </div>
    </div>
  );

  // ========== RENDER CURRENT STEP ==========
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      default:
        return renderStep1();
    }
  };

  // ========== MAIN RENDER ==========
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-0"
        }`}
      >
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <div className="p-6">
          {/* If contract is already signed, show signed view */}
          {isContractSigned ? (
            renderSignedContractView()
          ) : (
            <>
              {/* Progress Steps */}
              <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <div className="relative mb-4">
                  <div className="grid grid-cols-4 relative z-10">
                    {[1, 2, 3, 4].map((step) => (
                      <div key={step} className="flex justify-center">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                            currentStep >= step
                              ? "bg-blue-600 text-white"
                              : "bg-gray-200 text-gray-500"
                          }`}
                        >
                          {step}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Background Line */}
                  <div className="absolute left-[12.5%] right-[12.5%] top-[20px] h-1 bg-gray-200"></div>

                  {/* Active Line */}
                  <div
                    className="absolute left-[12.5%] top-[20px] h-1 bg-blue-600 transition-all duration-300"
                    style={{ width: `${((currentStep - 1) / 3) * 75}%` }}
                  ></div>
                </div>

                {/* Step Labels */}
                <div className="grid grid-cols-4 text-center text-sm mt-2">
                  <span
                    className={
                      currentStep >= 1
                        ? "text-blue-600 font-medium"
                        : "text-gray-500"
                    }
                  >
                    Xem Hợp Đồng
                  </span>
                  <span
                    className={
                      currentStep >= 2
                        ? "text-blue-600 font-medium"
                        : "text-gray-500"
                    }
                  >
                    Điều Khoản
                  </span>
                  <span
                    className={
                      currentStep >= 3
                        ? "text-blue-600 font-medium"
                        : "text-gray-500"
                    }
                  >
                    Ký Điện Tử
                  </span>
                  <span
                    className={
                      currentStep >= 4
                        ? "text-blue-600 font-medium"
                        : "text-gray-500"
                    }
                  >
                    Hoàn Tất
                  </span>
                </div>
              </div>

              {/* Current Step Content */}
              {renderCurrentStep()}

              {/* Navigation Buttons */}
              {currentStep < 4 && (
                <div className="flex items-center justify-between mt-6">
                  <button
                    onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                    disabled={currentStep === 1}
                    className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                      currentStep === 1
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    Quay Lại
                  </button>

                  {currentStep === 1 && (
                    <button
                      onClick={() => setCurrentStep(2)}
                      disabled={isAlreadySigned}
                      className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                        isAlreadySigned
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                    >
                      {isAlreadySigned ? "Đã Ký" : "Tiếp Tục"}
                    </button>
                  )}

                  {currentStep === 2 && (
                    <button
                      onClick={() => setCurrentStep(3)}
                      disabled={!agreed}
                      className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                        !agreed
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                    >
                      Tiếp Tục
                    </button>
                  )}

                  {currentStep === 3 && (
                    <button
                      onClick={handleSign}
                      disabled={!signatureConfirmed || loading}
                      className={`px-8 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                        !signatureConfirmed || loading
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-green-600 text-white hover:bg-green-700"
                      }`}
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Đang xử lý...
                        </>
                      ) : (
                        <>
                          <PenTool className="w-5 h-5" />
                          Ký Hợp Đồng
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* PDF Preview Modal */}
        {showPdfPreview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-semibold">Xem Trước Hợp Đồng</h3>
                <button
                  onClick={() => setShowPdfPreview(false)}
                  className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 h-[70vh] bg-gray-100 flex items-center justify-center">
                <p className="text-gray-500">
                  PDF Preview sẽ hiển thị ở đây (Tích hợp PDF viewer)
                </p>
              </div>
            </div>
          </div>
        )}

        <Footer />
      </div>
    </div>
  );
};

export default ContractSigning;