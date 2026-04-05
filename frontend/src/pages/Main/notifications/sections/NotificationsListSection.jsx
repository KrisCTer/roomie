import React, { useEffect, useRef } from "react";
import { Bell } from "lucide-react";
import NotificationItem from "../../../../components/domain/notification/NotificationItem";

const NotificationsListSkeleton = () => {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={`notification-skeleton-${index}`}
          className="animate-pulse rounded-2xl border border-[#F2E9DE] bg-[#FFFCF8] p-4"
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
    <section className="overflow-hidden rounded-2xl border border-[#EFE6DA] bg-white shadow-sm">
      {(loadingInitial || refreshing) && <NotificationsListSkeleton />}

      {!loadingInitial && !refreshing && notifications.length === 0 ? (
        <div className="p-12 text-center">
          <Bell className="mx-auto mb-4 h-16 w-16 text-gray-300" />
          <p className="text-gray-500">Không có thông báo nào</p>
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
            <div className="border-t border-[#F3ECE2] px-4 py-4 text-center text-sm text-gray-500">
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
