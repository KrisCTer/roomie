import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  getBill, 
  payBill, 
  downloadBillPdf, 
  previewBillPdf,
  sendBill 
} from "../services/billing.service";
import { createPayment } from "../services/payment.service";
import { getContract } from "../services/contract.service";
import { getPropertyById } from "../services/property.service";
import { getUserProfile } from "../services/user.service";

export const useBillDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [sending, setSending] = useState(false);

  const [bill, setBill] = useState(null);
  const [contract, setContract] = useState(null);
  const [property, setProperty] = useState(null);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");

  const [tenant, setTenant] = useState(null);
  const [landlord, setLandlord] = useState(null);

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
              const propertyRes = await getPropertyById(contractData.propertyId);
              if (propertyRes?.success && propertyRes?.result) {
                setProperty(propertyRes.result);
              }
            }

            // Load tenant profile
            if (contractData.tenantId) {
              try {
                const tenantRes = await getUserProfile(contractData.tenantId);
                if (tenantRes?.result) {
                  setTenant(tenantRes.result);
                }
              } catch (e) {
                console.error("Error loading tenant profile", e);
              }
            }

            // Load landlord profile
            if (contractData.landlordId) {
              try {
                const landlordRes = await getUserProfile(contractData.landlordId);
                if (landlordRes?.result) {
                  setLandlord(landlordRes.result);
                }
              } catch (e) {
                console.error("Error loading landlord profile", e);
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
        propertyId: contract.propertyId,
        amount: bill.totalAmount,
        method: selectedPaymentMethod,
        description: `Thanh toán hóa đơn tháng ${formatDate(bill.billingMonth)}`,
      };

      const paymentRes = await createPayment(paymentPayload);

      if (paymentRes?.success && paymentRes?.result) {
        const payment = paymentRes.result;

        // For VNPAY or MOMO, redirect to payment gateway
        if (
          selectedPaymentMethod === "VNPAY" ||
          selectedPaymentMethod === "MOMO"
        ) {
          const redirectUrl = payment.paymentUrl || payment.payUrl;
          console.log("Redirecting to payment URL:", redirectUrl);
          if (redirectUrl) {
            window.location.href = redirectUrl;
          } else {
            alert("Không thể tạo link thanh toán!");
          }
        }
        // For CASH, mark as paid directly
        else if (selectedPaymentMethod === "CASH") {
          alert("ℹ️ Vui lòng thanh toán tiền mặt trực tiếp cho chủ nhà.");
          setShowPaymentModal(false);
          loadBillData();
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

  /**
   * Download bill as PDF
   */
  const handleDownloadPdf = async () => {
    try {
      setDownloading(true);
      const response = await downloadBillPdf(id);
      
      // Create blob from response
      const blob = new Blob([response], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice_${bill.id.substring(0, 12)}_${formatDateForFilename(bill.billingMonth)}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log("✅ PDF downloaded successfully");
    } catch (error) {
      console.error("Error downloading PDF:", error);
      alert("❌ Không thể tải xuống hóa đơn PDF!");
    } finally {
      setDownloading(false);
    }
  };

  /**
   * Preview bill PDF in new tab
   */
  const handlePreviewPdf = async () => {
    try {
      setDownloading(true);
      const response = await previewBillPdf(id);
      
      // Create blob from response
      const blob = new Blob([response], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      // Open in new tab
      window.open(url, '_blank');
      
      // Cleanup after a delay
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 100);
      
      console.log("✅ PDF preview opened");
    } catch (error) {
      console.error("Error previewing PDF:", error);
      alert("❌ Không thể xem trước hóa đơn PDF!");
    } finally {
      setDownloading(false);
    }
  };

  /**
   * Send bill to tenant (DRAFT → PENDING)
   */
  const handleSendBill = async () => {
    if (!window.confirm("Gửi hóa đơn này cho người thuê?")) {
      return;
    }

    try {
      setSending(true);
      const res = await sendBill(id);
      
      if (res?.success) {
        alert("✅ Đã gửi hóa đơn thành công! Trạng thái chuyển sang PENDING");
        loadBillData(); // Reload to get updated status
      }
    } catch (error) {
      console.error("Error sending bill:", error);
      alert("❌ Không thể gửi hóa đơn! " + (error?.response?.data?.message || ""));
    } finally {
      setSending(false);
    }
  };

  /**
   * Get bill status badge info
   */
  const getBillStatusBadge = () => {
    if (!bill) return { text: "N/A", color: "gray" };

    const statusMap = {
      DRAFT: { text: "Nháp", color: "gray" },
      PENDING: { text: "Chờ thanh toán", color: "yellow" },
      PAID: { text: "Đã thanh toán", color: "green" },
      OVERDUE: { text: "Quá hạn", color: "red" },
    };

    return statusMap[bill.status] || { text: bill.status, color: "gray" };
  };

  /**
   * Check if bill can be paid
   */
  const canPayBill = () => {
    return bill && (bill.status === "PENDING" || bill.status === "OVERDUE");
  };

  /**
   * Check if bill can be sent
   */
  const canSendBill = () => {
    return bill && bill.status === "DRAFT";
  };

  /**
   * Check if bill can be edited
   */
  const canEditBill = () => {
    return bill && bill.status === "DRAFT";
  };

  /**
   * Format breakdown for display
   */
  const getBreakdownItems = () => {
    if (!bill) return [];

    const items = [];

    // Monthly Rent
    if (bill.monthlyRent) {
      items.push({
        label: "Tiền thuê nhà",
        amount: bill.monthlyRent,
        icon: "🏠",
      });
    }

    // Electricity
    if (bill.electricityConsumption && bill.electricityAmount) {
      items.push({
        label: "Tiền điện",
        detail: `${bill.electricityConsumption} kWh × ${formatCurrency(bill.electricityUnitPrice)}/kWh`,
        amount: bill.electricityAmount,
        icon: "⚡",
      });
    }

    // Water
    if (bill.waterConsumption && bill.waterAmount) {
      items.push({
        label: "Tiền nước",
        detail: `${bill.waterConsumption} m³ × ${formatCurrency(bill.waterUnitPrice)}/m³`,
        amount: bill.waterAmount,
        icon: "💧",
      });
    }

    // Internet
    if (bill.internetPrice) {
      items.push({
        label: "Internet",
        amount: bill.internetPrice,
        icon: "🌐",
      });
    }

    // Parking
    if (bill.parkingPrice) {
      items.push({
        label: "Phí gửi xe",
        amount: bill.parkingPrice,
        icon: "🚗",
      });
    }

    // Cleaning
    if (bill.cleaningPrice) {
      items.push({
        label: "Phí vệ sinh",
        amount: bill.cleaningPrice,
        icon: "🧹",
      });
    }

    // Maintenance
    if (bill.maintenancePrice) {
      items.push({
        label: "Phí bảo trì",
        amount: bill.maintenancePrice,
        icon: "🔧",
      });
    }

    // Other
    if (bill.otherPrice) {
      items.push({
        label: bill.otherDescription || "Chi phí khác",
        amount: bill.otherPrice,
        icon: "📝",
      });
    }

    return items;
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("vi-VN");
  };

  const formatDateForFilename = (date) => {
    if (!date) return "unknown";
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  };

  const formatCurrency = (amount) => {
    if (!amount) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const goBack = () => {
    navigate("/unified-bills");
  };

  return {
    // Data
    bill,
    contract,
    property,
    tenant,
    landlord,

    // Loading states
    loading,
    paying,
    downloading,
    sending,

    // Modal states
    showPaymentModal,
    selectedPaymentMethod,

    // Setters
    setShowPaymentModal,
    setSelectedPaymentMethod,

    // Handlers
    handlePayment,
    handleDownloadPdf,
    handlePreviewPdf,
    handleSendBill,

    // Helpers
    getBillStatusBadge,
    canPayBill,
    canSendBill,
    canEditBill,
    getBreakdownItems,
    formatDate,
    formatCurrency,
    goBack,
    loadBillData,
  };
};