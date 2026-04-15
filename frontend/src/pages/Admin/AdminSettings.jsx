/* SEO_META: title="Roomie Admin - Settings"; name="description"; property="og:title" */
import React, { useEffect, useState, useCallback } from "react";
import { Settings, Save, AlertTriangle } from "lucide-react";

import AdminSidebar from "../../components/layout/layoutAdmin/AdminSidebar";
import Header from "../../components/layout/layoutUser/Header";
import Footer from "../../components/layout/layoutUser/Footer";
import { useDialog } from "../../contexts/DialogContext";

import { getSystemConfig, updateSystemConfig } from "../../services/adminSystemConfigService";

import "../../styles/apple-glass-dashboard.css";
import "../../styles/home-redesign.css";

const ToggleSwitch = ({ label, description, checked, onChange, disabled }) => (
  <div className="flex items-center justify-between py-3">
    <div>
      <p className="home-text-primary text-sm font-semibold">{label}</p>
      {description && <p className="text-xs home-text-muted mt-0.5">{description}</p>}
    </div>
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
        checked ? "bg-[var(--home-accent-strong)]" : "bg-gray-300"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${checked ? "translate-x-5" : ""}`} />
    </button>
  </div>
);

const TextInput = ({ label, description, value, onChange, placeholder, type = "text" }) => (
  <div className="py-3">
    <label className="home-text-primary text-sm font-semibold block mb-1">{label}</label>
    {description && <p className="text-xs home-text-muted mb-2">{description}</p>}
    <input
      type={type}
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="home-input w-full max-w-md"
    />
  </div>
);

const AdminSettings = () => {
  const { showToast, showConfirm } = useDialog();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState("Cài đặt");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState({});
  const [dirty, setDirty] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getSystemConfig();
      const data = res?.result ?? res?.data ?? res;
      setConfig(data || {});
      setDirty(false);
    } catch (e) {
      console.error("Load config failed:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const update = (key, value) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const handleSave = async () => {
    const confirmed = await showConfirm({
      title: "Lưu cấu hình",
      message: "Xác nhận lưu thay đổi cấu hình hệ thống?",
      confirmText: "Lưu",
      cancelText: "Hủy",
      type: "warning",
    });
    if (!confirmed) return;

    try {
      setSaving(true);
      const { id, updatedAt, ...payload } = config;
      await updateSystemConfig(payload);
      showToast("Cấu hình đã được lưu thành công!", "success");
      setDirty(false);
      await load();
    } catch (e) {
      console.error("Save config failed:", e);
      showToast("Lưu cấu hình thất bại", "error");
    } finally {
      setSaving(false);
    }
  };

  const SectionCard = ({ title, icon: Icon, children }) => (
    <section className="apple-glass-panel no-hover rounded-2xl p-6 mb-6">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b" style={{ borderColor: "rgba(217, 200, 181, 0.15)" }}>
        <Icon className="w-5 h-5 home-text-accent" />
        <h2 className="home-text-primary font-bold text-base">{title}</h2>
      </div>
      <div className="divide-y" style={{ borderColor: "rgba(217, 200, 181, 0.1)" }}>
        {children}
      </div>
    </section>
  );

  return (
    <div className="home-v2 home-shell-bg min-h-screen">
      <AdminSidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className={`transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-0"}`}>
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} pageTitle="Cài đặt hệ thống" pageSubtitle="Quản lý cấu hình nền tảng, tính năng và tích hợp" />
        <main className="w-full px-4 pt-6 pb-8 md:px-8">
          {/* Action bar */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {dirty && (
                <div className="flex items-center gap-1.5 text-amber-600">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-xs font-semibold">Có thay đổi chưa lưu</span>
                </div>
              )}
              {config?.updatedAt && (
                <span className="text-xs home-text-muted">
                  Cập nhật lần cuối: {new Date(config.updatedAt).toLocaleString("vi-VN")}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">

              <button onClick={handleSave} disabled={saving || !dirty}
                className={`apple-glass-btn-accent flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold ${!dirty ? "opacity-40 cursor-not-allowed" : ""}`}
                type="button"
              >
                <Save className="w-4 h-4" /> {saving ? "Đang lưu..." : "Lưu cấu hình"}
              </button>
            </div>
          </div>

          {loading ? (
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="apple-glass-panel no-hover rounded-2xl p-6 animate-pulse">
                  <div className="h-6 rounded w-1/3 mb-4" style={{ background: "var(--home-surface-soft)" }} />
                  <div className="space-y-3">
                    <div className="h-4 rounded w-full" style={{ background: "var(--home-surface-soft)" }} />
                    <div className="h-4 rounded w-3/4" style={{ background: "var(--home-surface-soft)" }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Platform */}
              <SectionCard title="Nền tảng" icon={Settings}>
                <TextInput label="Tên nền tảng" description="Tên hiển thị trên toàn hệ thống" value={config.platformName} onChange={(v) => update("platformName", v)} placeholder="Roomie" />
                <ToggleSwitch label="Chế độ bảo trì" description="Tắt truy cập cho người dùng bình thường" checked={config.maintenanceMode} onChange={(v) => update("maintenanceMode", v)} />
              </SectionCard>

              {/* Feature Flags */}
              <SectionCard title="Tính năng" icon={Settings}>
                <ToggleSwitch label="Chat" description="Cho phép nhắn tin giữa người thuê và chủ nhà" checked={config.enableChat} onChange={(v) => update("enableChat", v)} />
                <ToggleSwitch label="Đặt phòng" description="Cho phép người dùng tạo booking" checked={config.enableBooking} onChange={(v) => update("enableBooking", v)} />
                <ToggleSwitch label="Gợi ý thông minh" description="AI recommendation engine" checked={config.enableRecommendation} onChange={(v) => update("enableRecommendation", v)} />
                <ToggleSwitch label="Analytics" description="Thu thập dữ liệu phân tích" checked={config.enableAnalytics} onChange={(v) => update("enableAnalytics", v)} />
              </SectionCard>

              {/* Notifications */}
              <SectionCard title="Thông báo" icon={Settings}>
                <ToggleSwitch label="Push Notification" description="Cho phép gửi push notification" checked={config.allowPushNotification} onChange={(v) => update("allowPushNotification", v)} />
                <ToggleSwitch label="Email Notification" description="Cho phép gửi email thông báo" checked={config.allowEmailNotification} onChange={(v) => update("allowEmailNotification", v)} />
              </SectionCard>

              {/* Payment */}
              <SectionCard title="Thanh toán" icon={Settings}>
                <TextInput label="Payment Gateway" description="Nhà cung cấp cổng thanh toán" value={config.paymentGatewayProvider} onChange={(v) => update("paymentGatewayProvider", v)} placeholder="vnpay" />
                <ToggleSwitch label="Sandbox Mode" description="Sử dụng môi trường test cho thanh toán" checked={config.paymentSandboxMode} onChange={(v) => update("paymentSandboxMode", v)} />
              </SectionCard>

              {/* Rate Limit */}
              <SectionCard title="API & Bảo mật" icon={Settings}>
                <TextInput label="Rate Limit" description="Số request tối đa mỗi phút" value={config.rateLimitPerMinute} onChange={(v) => update("rateLimitPerMinute", parseInt(v) || 0)} placeholder="60" type="number" />
              </SectionCard>
            </>
          )}
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default AdminSettings;
