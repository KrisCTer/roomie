import React, { useEffect, useRef } from "react";
import { Bell } from "lucide-react";
import NotificationItem from "../../../../components/domain/notification/NotificationItem";

const NotificationsListSkeleton = () => {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={`notification-skeleton-${index}`}
          className="animate-pulse rounded-[24px] border border-[#EEDFD0] bg-gradient-to-br from-white via-[#FFFDF8] to-[#FFF6ED] p-4"
        >
          <div className="mb-2 h-4 w-1/3 rounded bg-[#EDE2D4]" />
          <div className="mb-2 h-3 w-4/5 rounded bg-[#EDE2D4]" />
          <div className="h-3 w-2/5 rounded bg-[#EDE2D4]" />
        </div>
      ))}
    </div>
  );
};

const NotificationsListSection = ({
  notifications,
  loadingInitial,
  refreshing,
  loadingMore,
  hasMore,
  onLoadMore,
  onMarkAsRead,
  onDelete,
}) => {
  const loadMoreRef = useRef(null);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || !hasMore || loadingInitial || refreshing || loadingMore) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            onLoadMore();
          }
        });
      },
      { threshold: 0.3 },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMore, loadingInitial, refreshing, loadingMore, onLoadMore]);

  return (
    <section className="overflow-hidden rounded-[28px] border border-[#E8D8C7] bg-gradient-to-br from-white via-[#FFFDF8] to-[#FFF3E8] p-3 shadow-[0_14px_34px_rgba(98,60,26,0.08)]">
      {(loadingInitial || refreshing) && <NotificationsListSkeleton />}

      {!loadingInitial && !refreshing && notifications.length === 0 ? (
        <div className="p-12 text-center">
          <Bell className="mx-auto mb-4 h-16 w-16 text-[#D4B89B]" />
          <p className="text-[#7B736A]">Không có thông báo nào</p>
        </div>
      ) : null}

      {!loadingInitial && !refreshing && notifications.length > 0 ? (
        <>
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkAsRead={onMarkAsRead}
              onDelete={onDelete}
            />
          ))}

          <div ref={loadMoreRef} className="h-8" />

          {loadingMore && (
            <div className="border-t border-[#F3ECE2] px-4 py-4 text-center text-sm text-[#7B736A]">
              Đang tải thêm thông báo...
            </div>
          )}

          {!hasMore && (
            <div className="border-t border-[#F3ECE2] px-4 py-4 text-center text-xs font-semibold uppercase tracking-[0.08em] text-gray-400">
              Đã hiển thị tất cả thông báo
            </div>
          )}
        </>
      ) : null}
    </section>
  );
};

export default NotificationsListSection;
