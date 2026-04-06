import React from "react";
import { Bell, CheckCheck, RefreshCw, Trash2 } from "lucide-react";

const NotificationsHeroSection = ({
  loading,
  onRefresh,
  onMarkAllAsRead,
  onDeleteAllRead,
}) => {
  return (
    <section className="home-glass-soft mb-6 rounded-3xl p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h1 className="flex items-center gap-3 text-2xl font-bold tracking-tight text-[#1F2937] md:text-3xl">
          <Bell className="h-8 w-8 text-[#CC6F4A]" />
          Trung tâm thông báo
        </h1>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-[#E7DAC7] bg-white/90 px-4 py-2 text-sm font-semibold text-[#6E675F] transition hover:-translate-y-0.5 hover:bg-[#FFFCF8] hover:shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Làm mới
          </button>

          <button
            onClick={onMarkAllAsRead}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-[#BFECD8] bg-[#ECFDF5] px-4 py-2 text-sm font-semibold text-[#047857] transition hover:-translate-y-0.5 hover:shadow-sm disabled:opacity-50"
          >
            <CheckCheck className="h-4 w-4" />
            Đánh dấu tất cả đã đọc
          </button>

          <button
            onClick={onDeleteAllRead}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-2 text-sm font-semibold text-[#991B1B] transition hover:-translate-y-0.5 hover:shadow-sm disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            Xóa đã đọc
          </button>
        </div>
      </div>
    </section>
  );
};

export default NotificationsHeroSection;
