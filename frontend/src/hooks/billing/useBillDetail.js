import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  getBill, 
  payBill, 
  downloadBillPdf, 
  previewBillPdf,
  sendBill 
} from "../../services/billingService";
import { createPayment, getPayment } from "../../services/paymentService";
import { getContract } from "../../services/contractService";
import { getPropertyById } from "../../services/propertyService";
import { getUserProfile } from "../../services/userService";
import { useDialog } from "../../contexts/DialogContext";

export const useBillDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast, showConfirm } = useDialog();

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
      showToast("Không thể tải thông tin hóa đơn!", "error");
    } finally {
      setLoading(false);
    }
  };

  const [momoPaymentUrl, setMomoPaymentUrl] = useState(null);
  const [momoPaymentId, setMomoPaymentId] = useState(null);
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  // Poll payment status when QR is showing
  useEffect(() => {
    if (!momoPaymentId || !momoPaymentUrl || paymentCompleted) return;

    const interval = setInterval(async () => {
      try {
        const res = await getPayment(momoPaymentId);
        if (res?.success && res?.result) {
          const status = res.result.status;
          if (status === "COMPLETED") {
            setPaymentCompleted(true);
            clearInterval(interval);
            showToast("Thanh toán thành công! 🎉", "success");
            setTimeout(() => {
              setShowPaymentModal(false);
              setMomoPaymentUrl(null);
              setMomoPaymentId(null);
              setPaymentCompleted(false);
              loadBillData();
            }, 2500);
          }
        }
      } catch (err) {
        // Silently ignore polling errors
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [momoPaymentId, momoPaymentUrl, paymentCompleted]);

  const handlePayment = async () => {
    if (!selectedPaymentMethod) {
      showToast("Vui lòng chọn phương thức thanh toán!", "warning");
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

        if (selectedPaymentMethod === "MOMO" || selectedPaymentMethod === "VNPAY") {
          const redirectUrl = payment.paymentUrl || payment.payUrl;
          if (redirectUrl) {
            window.location.href = redirectUrl;
          } else {
            showToast("Không thể tạo link thanh toán!", "error");
          }
        }
        // For CASH
        else if (selectedPaymentMethod === "CASH") {
          showToast("Vui lòng thanh toán tiền mặt trực tiếp cho chủ nhà.", "info");
          setShowPaymentModal(false);
          loadBillData();
        }
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      showToast(
        "Không thể thanh toán! " + (error?.response?.data?.message || ""),
        "error"
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
      
    } catch (error) {
      console.error("Error downloading PDF:", error);
      showToast("Không thể tải xuống hóa đơn PDF!", "error");
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
      
    } catch (error) {
      console.error("Error previewing PDF:", error);
      showToast("Không thể xem trước hóa đơn PDF!", "error");
    } finally {
      setDownloading(false);
    }
  };

  /**
   * Send bill to tenant (DRAFT → PENDING)
   */
  const handleSendBill = async () => {
    const confirmed = await showConfirm({
      title: "Gửi hóa đơn",
      message: "Gửi hóa đơn này cho người thuê?",
      confirmText: "Gửi",
      cancelText: "Hủy",
      type: "question",
    });
    if (!confirmed) return;

    try {
      setSending(true);
      const res = await sendBill(id);
      
      if (res?.success) {
        showToast("Đã gửi hóa đơn thành công! Trạng thái chuyển sang PENDING", "success");
        loadBillData();
      }
    } catch (error) {
      console.error("Error sending bill:", error);
      showToast("Không thể gửi hóa đơn! " + (error?.response?.data?.message || ""), "error");
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
    momoPaymentUrl,
    paymentCompleted,

    // Setters
    setShowPaymentModal,
    setSelectedPaymentMethod,
    setMomoPaymentUrl,

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