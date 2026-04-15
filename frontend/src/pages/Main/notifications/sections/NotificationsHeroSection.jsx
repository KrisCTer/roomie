import React from "react";
import { Bell, CheckCheck, RefreshCw, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

const NotificationsHeroSection = ({
  loading,
  onRefresh,
  onMarkAllAsRead,
  onDeleteAllRead,
}) => {
  const { t } = useTranslation();

  return (
    <section className="apple-glass-panel mb-6 rounded-2xl p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-orange-100/80 text-orange-700 flex items-center justify-center">
            <Bell className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold home-text-primary md:text-3xl">
              {t("notificationCenter.title")}
            </h1>
            <p className="text-sm home-text-muted">{t("notificationCenter.subtitle")}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button onClick={onRefresh} disabled={loading}
            className="apple-glass-panel interactive inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold home-text-muted transition hover:-translate-y-0.5 disabled:opacity-50">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            {t("notificationCenter.refresh")}
          </button>

          <button onClick={onMarkAllAsRead} disabled={loading}
            className="apple-glass-panel interactive inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-emerald-700 transition hover:-translate-y-0.5 disabled:opacity-50">
            <CheckCheck className="h-4 w-4" />
            {t("notificationCenter.markAllRead")}
          </button>

          <button onClick={onDeleteAllRead} disabled={loading}
            className="apple-glass-panel interactive inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:-translate-y-0.5 disabled:opacity-50">
            <Trash2 className="h-4 w-4" />
            {t("notificationCenter.deleteRead")}
          </button>
        </div>
      </div>
    </section>
  );
};

export default NotificationsHeroSection;
