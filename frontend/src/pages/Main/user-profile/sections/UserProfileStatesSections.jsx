import React from "react";
import { User, ChevronLeft } from "lucide-react";
import EditorialHeader from "../../../../components/layout/layoutHome/EditorialHeader";
import EditorialFooter from "../../../../components/layout/layoutHome/EditorialFooter";
import "../../../../styles/apple-glass-dashboard.css";
import "../../../../styles/home-redesign.css";

const UserProfileLoadingSection = () => (
  <div className="home-v2 min-h-screen bg-[var(--home-bg)]">
    <EditorialHeader />
    <div className="w-full max-w-7xl mx-auto px-4 py-12 md:px-8">
      <div className="apple-glass-panel no-hover rounded-2xl p-8 mb-8 animate-pulse">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-32 h-32 rounded-2xl mx-auto md:mx-0" style={{ background: "var(--home-surface-soft)" }} />
          <div className="flex-1 space-y-4">
            <div className="h-8 rounded-lg w-1/3 mx-auto md:mx-0" style={{ background: "var(--home-surface-soft)" }} />
            <div className="h-4 rounded w-1/4 mx-auto md:mx-0" style={{ background: "var(--home-surface-soft)" }} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-14 rounded-xl" style={{ background: "var(--home-surface-soft)" }} />
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="apple-glass-panel no-hover rounded-2xl p-8 animate-pulse">
        <div className="h-6 rounded w-1/4 mb-6" style={{ background: "var(--home-surface-soft)" }} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-xl" style={{ background: "var(--home-surface-soft)" }} />
          ))}
        </div>
      </div>
    </div>
    <EditorialFooter description="Đang tải thông tin người dùng..." />
  </div>
);

const UserProfileErrorSection = ({ error, navigate, t }) => (
  <div className="home-v2 min-h-screen bg-[var(--home-bg)]">
    <EditorialHeader />
    <div className="w-full max-w-7xl mx-auto px-4 py-16 md:px-8">
      <div className="apple-glass-panel no-hover rounded-2xl p-12 text-center">
        <div className="w-16 h-16 rounded-full bg-rose-100/80 flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-rose-600" />
        </div>
        <h2 className="text-2xl font-bold home-text-primary mb-2">
          {error || t("userProfile.notFound")}
        </h2>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 home-btn-accent px-6 py-3 text-white rounded-xl shadow-sm flex items-center gap-2 mx-auto font-semibold"
        >
          <ChevronLeft className="w-5 h-5" />
          {t("userProfile.back")}
        </button>
      </div>
    </div>
    <EditorialFooter description="Không tìm thấy người dùng." />
  </div>
);

export { UserProfileLoadingSection, UserProfileErrorSection };
