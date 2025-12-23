// src/services/billing.service.js
import BaseService from "./BaseService";
import { API, CONFIG } from "../configurations/configuration";

/**
 * Smart create or update bill
 * Backend auto-loads utility config and inherits previous readings
 */
export const createOrUpdateBill = (payload) =>
  BaseService.post(API.CREATE_BILL, payload);

export const getBill = (id) =>
  BaseService.get(API.GET_BILL(id));

export const getAllBills = (params) =>
  BaseService.get(API.GET_ALL_BILLS, params);

export const getBillsByContract = (contractId) =>
  BaseService.get(API.GET_BILLS_BY_CONTRACT(contractId));

export const deleteBill = (id) =>
  BaseService.delete(API.DELETE_BILL(id));

/**
 * Send bill to tenant (DRAFT → PENDING)
 */
export const sendBill = (id) =>
  BaseService.post(`/billing/${id}/send`);

/**
 * Pay bill (PENDING → PAID)
 */
export const payBill = (billId, paymentId) =>
  BaseService.post(`/billing/${billId}/pay`, null, {
    params: { paymentId }
  });

/**
 * Download bill as PDF invoice
 */
export const downloadBillPdf = async (billId) => {
  try {
    const response = await fetch(`${CONFIG.API_GATEWAY}/billing/${billId}/pdf`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Accept': 'application/pdf'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to download PDF');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `invoice_${billId.substring(0, 12)}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return blob;
  } catch (error) {
    console.error('Error downloading PDF:', error);
    throw error;
  }
};

/**
 * Open PDF preview in new tab
 */
export const openBillPdfPreview = (billId) => {
  const token = localStorage.getItem('token');
  const url = `${CONFIG.API_GATEWAY}/billing/${billId}/pdf/preview?token=${token}`;
  window.open(url, '_blank');
};

/**
 * Get PDF preview URL (for iframe)
 */
export const getBillPdfPreviewUrl = (billId) => {
  const token = localStorage.getItem('token');
  return `${CONFIG.API_GATEWAY}/billing/${billId}/pdf/preview?token=${token}`;
};

/**
 * Get bills as landlord
 */
export const getMyLandlordBills = () =>
  BaseService.get("/billing/landlord/my-bills");

/**
 * Get bills as tenant
 */
export const getMyTenantBills = () =>
  BaseService.get("/billing/tenant/my-bills");

// ==================== STATISTICS ====================

/**
 * Get landlord billing statistics
 * NOTE: Backend endpoint not yet implemented
 */
export const getLandlordStats = async () => {
  try {
    return await BaseService.get("/billing/landlord/stats");
  } catch (error) {
    console.warn("Statistics endpoint not yet implemented on backend");
    // Return mock data for now
    return {
      success: true,
      result: {
        total: 0,
        draft: 0,
        pending: 0,
        paid: 0,
        overdue: 0,
        totalAmount: 0
      }
    };
  }
};

/**
 * Get tenant billing statistics
 * NOTE: Backend endpoint not yet implemented
 */
export const getTenantStats = async () => {
  try {
    return await BaseService.get("/billing/tenant/stats");
  } catch (error) {
    console.warn("Statistics endpoint not yet implemented on backend");
    // Return mock data for now
    return {
      success: true,
      result: {
        total: 0,
        pending: 0,
        paid: 0,
        overdue: 0,
        totalPending: 0
      }
    };
  }
};

// ==================== BULK OPERATIONS ====================

/**
 * Bulk send bills
 * NOTE: Backend endpoint not yet implemented
 */
export const bulkSendBills = async (billIds) => {
  try {
    return await BaseService.post("/billing/bulk/send", billIds);
  } catch (error) {
    console.warn("Bulk send endpoint not yet implemented on backend");
    // Fallback to sequential send
    const results = [];
    for (const billId of billIds) {
      try {
        const result = await sendBill(billId);
        results.push({ billId, success: true, result });
      } catch (err) {
        results.push({ billId, success: false, error: err.message });
      }
    }
    return {
      success: true,
      result: results
    };
  }
};

/**
 * Bulk generate bills
 * NOTE: Backend endpoint not yet implemented
 */
export const bulkGenerateBills = async (requests) => {
  try {
    return await BaseService.post("/billing/bulk/generate", requests);
  } catch (error) {
    console.warn("Bulk generate endpoint not yet implemented on backend");
    // Fallback to sequential create
    const results = [];
    for (const request of requests) {
      try {
        const result = await createOrUpdateBill(request);
        results.push({ success: true, result });
      } catch (err) {
        results.push({ success: false, error: err.message });
      }
    }
    return {
      success: true,
      result: results
    };
  }
};

// ==================== EXPORT ====================

/**
 * Export bills to Excel/CSV
 * NOTE: Backend endpoint not yet implemented
 */
export const exportBills = async (params) => {
  try {
    const response = await fetch(`${CONFIG.API_GATEWAY}/billing/export?${new URLSearchParams(params)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      }
    });

    if (!response.ok) {
      throw new Error('Export endpoint not available');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bills_export.${params.format === 'excel' ? 'xlsx' : 'csv'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return blob;
  } catch (error) {
    console.warn("Export endpoint not yet implemented on backend");
    alert("⚠️ Export feature will be available soon!");
    throw error;
  }
};

// ==================== ALIAS (for compatibility) ====================

/**
 * Alias for openBillPdfPreview
 * Used by useBillDetail.js
 */
export const previewBillPdf = openBillPdfPreview;

// Legacy compatibility
export const createBill = createOrUpdateBill;
export const updateBill = createOrUpdateBill;