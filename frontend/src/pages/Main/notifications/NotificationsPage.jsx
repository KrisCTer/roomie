import React from "react";
import EditorialHeader from "../../../components/layout/layoutHome/EditorialHeader";
import EditorialFooter from "../../../components/layout/layoutHome/EditorialFooter";
import useNotificationCenterData from "./hooks/useNotificationCenterData";
import NotificationsHeroSection from "./sections/NotificationsHeroSection";
import NotificationsStatsSection from "./sections/NotificationsStatsSection";
import NotificationsFiltersSection from "./sections/NotificationsFiltersSection";
import NotificationsListSection from "./sections/NotificationsListSection";
import "../../../styles/home-redesign.css";
import "../../../styles/search-redesign.css";

const NotificationsPage = () => {
  const {
    filteredNotifications,
    hasMore,
    filter,
    setFilter,
    typeFilter,
    setTypeFilter,
    typeOptions,
    stats,
    loadingInitial,
    loadingMore,
    refreshing,
    handleLoadMore,
    handleMarkAsRead,
    handleDeleteOne,
    handleMarkAllAsRead,
    handleRefresh,
    handleDeleteAllRead,
  } = useNotificationCenterData();

  return (
    <div className="home-v2 search-v2 min-h-screen bg-[var(--home-bg)]">
      <EditorialHeader />

      <main className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
        <NotificationsHeroSection
          loading={loadingInitial || refreshing || loadingMore}
          onRefresh={handleRefresh}
          onMarkAllAsRead={handleMarkAllAsRead}
          onDeleteAllRead={handleDeleteAllRead}
        />

        <NotificationsStatsSection stats={stats} />

        <NotificationsFiltersSection
          filter={filter}
          setFilter={setFilter}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          typeOptions={typeOptions}
          totalFiltered={filteredNotifications.length}
        />

        <NotificationsListSection
          notifications={filteredNotifications}
          loadingInitial={loadingInitial}
          refreshing={refreshing}
          loadingMore={loadingMore}
          hasMore={hasMore}
          onLoadMore={handleLoadMore}
          onMarkAsRead={handleMarkAsRead}
          onDelete={handleDeleteOne}
        />
      </main>

      <EditorialFooter description="Notification Center theo visual language của Home/Search: editorial layout, filtering rõ ràng và đọc thông báo theo luồng vô hạn mượt hơn." />
    </div>
  );
};

export default NotificationsPage;
