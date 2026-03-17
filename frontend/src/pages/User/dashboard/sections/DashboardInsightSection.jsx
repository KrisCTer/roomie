import React from "react";
import { AlertCircle, TrendingUp } from "lucide-react";

const DashboardInsightSection = ({ activeRole, stats, onUnpaidClick }) => {
  if (activeRole === "landlord" && stats.totalProperties > 0) {
    return (
      <div className="apple-glass-panel rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="home-tone-warning flex h-12 w-12 items-center justify-center rounded-xl border">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="home-text-primary mb-2 text-lg font-bold">
              Những hiểu biết hữu ích
            </h3>
            <ul className="home-text-muted space-y-2">
              {stats.pendingProperties > 0 && (
                <li className="flex items-center gap-2">
                  <AlertCircle className="home-text-accent h-4 w-4" />
                  <span>
                    Bạn có {stats.pendingProperties} bất động sản đang chờ phê
                    duyệt
                  </span>
                </li>
              )}
              {stats.availableProperties > 0 && (
                <li className="flex items-center gap-2">
                  <TrendingUp className="home-tone-success h-4 w-4 rounded-full border p-[1px]" />
                  <span>
                    Bạn có {stats.availableProperties} bất động sản sẵn sàng cho
                    thuê
                  </span>
                </li>
              )}
              {stats.unpaidBills > 0 && (
                <li className="flex items-center gap-2">
                  <AlertCircle className="home-tone-danger h-4 w-4 rounded-full border p-[1px]" />
                  <span>
                    Bạn có {stats.unpaidBills} hóa đơn chưa thanh toán
                  </span>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (activeRole === "tenant" && stats.unpaidBills > 0) {
    return (
      <div className="apple-glass-panel rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="home-tone-danger flex h-12 w-12 items-center justify-center rounded-xl border">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="home-text-primary mb-2 text-lg font-bold">
              Cần chú ý!
            </h3>
            <p className="home-text-muted">
              Bạn có {stats.unpaidBills} hóa đơn chưa thanh toán với tổng số
              tiền là{" "}
              <span className="home-tone-danger rounded px-1 py-0.5 font-bold">
                {stats.totalBillAmount.toLocaleString()}đ
              </span>
            </p>
            <button
              onClick={onUnpaidClick}
              className="home-btn-accent mt-3 px-4 py-2 text-white shadow-sm"
            >
              Xem chi tiết
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default DashboardInsightSection;
