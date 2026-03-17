import React from "react";
import { Bell, CheckCheck, RefreshCw, Trash2 } from "lucide-react";

const NotificationsHeroSection = ({
  loading,
  onRefresh,
  onMarkAllAsRead,
  onDeleteAllRead,
}) => {
  return (
    <section className="mb-6 rounded-3xl border border-[#F0E7DB] bg-gradient-to-r from-[#FFF9F2] to-[#FFFCF8] p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h1 className="flex items-center gap-3 text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
          <Bell className="h-8 w-8 text-orange-600" />
          Trung tâm thông báo
        </h1>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-[#E7DAC7] bg-white px-4 py-2 text-sm hover:bg-[#FFFCF8] disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Làm mới
          </button>

          <button
            onClick={onMarkAllAsRead}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm text-white hover:bg-black disabled:opacity-50"
          >
            <CheckCheck className="h-4 w-4" />
            Đánh dấu tất cả đã đọc
          </button>

          <button
            onClick={onDeleteAllRead}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 hover:bg-red-100 disabled:opacity-50"
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
