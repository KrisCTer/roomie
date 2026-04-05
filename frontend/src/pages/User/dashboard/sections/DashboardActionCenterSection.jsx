import React, { useMemo, useState } from "react";
import { ArrowRight, Clock3, FileText, Home, Receipt, X } from "lucide-react";

const typeMeta = {
  property: {
    icon: Home,
    tone: "home-tone-info",
  },
  booking: {
    icon: Clock3,
    tone: "home-tone-warning",
  },
  contract: {
    icon: FileText,
    tone: "home-tone-success",
  },
  payment: {
    icon: Receipt,
    tone: "home-tone-danger",
  },
};

const DashboardActionCenterSection = ({
  items,
  hasMore,
  onLoadMore,
  onNavigate,
}) => {
  const [activeFilter, setActiveFilter] = useState("all");
  const [dismissedIds, setDismissedIds] = useState([]);

  const filteredItems = useMemo(() => {
    let nextItems = items.filter((item) => !dismissedIds.includes(item.id));
    if (activeFilter !== "all") {
      nextItems = nextItems.filter((item) => item.type === activeFilter);
    }
    return nextItems;
  }, [items, dismissedIds, activeFilter]);

  const filterOptions = [
    { key: "all", label: "Tất cả" },
    { key: "booking", label: "Booking" },
    { key: "payment", label: "Hóa đơn" },
    { key: "contract", label: "Hợp đồng" },
    { key: "property", label: "Bất động sản" },
  ];

  return (
    <section className="apple-glass-panel mb-8 rounded-2xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="home-text-accent text-xs font-semibold uppercase tracking-[0.12em]">
            Action Center
          </p>
          <h2 className="home-text-primary text-xl font-bold">
            Ưu tiên xử lý hôm nay
          </h2>
        </div>
        <div className="apple-glass-pill home-text-muted hidden rounded-full px-3 py-1 text-xs font-semibold md:block">
          {filteredItems.length} tác vụ cần xử lý
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {filterOptions.map((option) => (
          <button
            key={option.key}
            onClick={() => setActiveFilter(option.key)}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
              activeFilter === option.key
                ? "apple-glass-pill home-text-accent border-[color:var(--home-border-strong)] bg-[color:var(--home-surface-soft)]"
                : "apple-glass-pill home-text-muted hover:bg-white"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {filteredItems.length === 0 ? (
        <div className="apple-glass-soft home-text-muted rounded-2xl border-dashed p-6 text-center">
          Không có tác vụ ưu tiên. Bạn đang xử lý rất tốt.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {filteredItems.map((item) => {
            const meta = typeMeta[item.type] || typeMeta.property;
            const Icon = meta.icon;

            return (
              <div key={item.id} className="apple-glass-item rounded-xl p-4">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-lg border ${meta.tone}`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="home-text-primary line-clamp-1 text-sm font-bold">
                        {item.title}
                      </p>
                      <p className="home-text-muted line-clamp-1 text-xs">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>
                  <span className="apple-glass-pill home-text-muted rounded-full px-2 py-0.5 text-[11px] font-semibold">
                    {item.status}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <button
                    onClick={() => onNavigate(item.route)}
                    className="home-text-accent inline-flex items-center gap-1 text-sm font-semibold hover:opacity-85"
                  >
                    {item.cta}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() =>
                      setDismissedIds((prev) => [...prev, item.id])
                    }
                    className="rounded-lg p-1 home-text-muted hover:bg-white/60 hover:home-text-primary"
                    title="Ẩn tác vụ"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {hasMore && (
        <button
          onClick={onLoadMore}
          className="apple-glass-pill home-text-accent mt-4 w-full rounded-xl px-4 py-2.5 text-sm font-semibold hover:bg-white"
        >
          Tải thêm tác vụ
        </button>
      )}
    </section>
  );
};

export default DashboardActionCenterSection;
