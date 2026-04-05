import React from "react";
import PropertyFilters from "../../../../components/domain/property/PropertyFilters";
import PropertyList from "../../../../components/domain/property/PropertyList";
import Pagination from "../../../../components/domain/property/Pagination";
import MyPropertiesLoadingSkeleton from "./MyPropertiesLoadingSkeleton";
import MyPropertiesEmptySection from "./MyPropertiesEmptySection";
import MyPropertiesQuickStatsSection from "./MyPropertiesQuickStatsSection";

const MyPropertiesMainSection = ({
  loading,
  pagedProperties,
  allProperties,
  currentPage,
  totalPages,
  postStatus,
  propertyStatus,
  searchTerm,
  setPostStatus,
  setPropertyStatus,
  setSearchTerm,
  clearFilters,
  setCurrentPage,
  handleEdit,
  handleViewBookings,
  handleDelete,
  requestPublishProperty,
  emptyTitle,
  emptyDescription,
  clearFiltersLabel,
  quickStats,
}) => {
  const hasFilters = Boolean(postStatus || propertyStatus || searchTerm);

  return (
    <section className="home-glass-card rounded-2xl p-6">
      <MyPropertiesQuickStatsSection quickStats={quickStats} />

      <div className="home-glass-soft sticky top-24 z-20 mb-5 rounded-2xl p-4">
        <PropertyFilters
          postStatus={postStatus}
          setPostStatus={setPostStatus}
          propertyStatus={propertyStatus}
          setPropertyStatus={setPropertyStatus}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onClearFilters={clearFilters}
        />
      </div>

      {loading ? (
        <MyPropertiesLoadingSkeleton />
      ) : allProperties.length === 0 ? (
        <MyPropertiesEmptySection
          hasFilters={hasFilters}
          onClearFilters={clearFilters}
          emptyTitle={emptyTitle}
          emptyDescription={emptyDescription}
          clearFiltersLabel={clearFiltersLabel}
        />
      ) : (
        <>
          <PropertyList
            properties={pagedProperties}
            loading={loading}
            onEdit={handleEdit}
            onViewBookings={handleViewBookings}
            onDelete={handleDelete}
            onPublish={requestPublishProperty}
          />

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </section>
  );
};

export default MyPropertiesMainSection;
