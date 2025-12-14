import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getBill, payBill } from "../services/billing.service";
import { createPayment } from "../services/payment.service";
import { getContract } from "../services/contract.service";
import { getPropertyById } from "../services/property.service";

export const useBillDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

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
              const propertyRes = await getPropertyById(contractData.propertyId);
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

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("vi-VN");
  };

  const goBack = () => {
    navigate("/unified-bills");
  };

  return {
    bill,
    contract,
    property,
    loading,
    paying,
    showPaymentModal,
    selectedPaymentMethod,
    setShowPaymentModal,
    setSelectedPaymentMethod,
    handlePayment,
    goBack,
    loadBillData,
  };
};