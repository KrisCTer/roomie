import React from "react";
import { Container } from "@mui/material";
import EditorialHeader from "../../../components/layout/layoutHome/EditorialHeader";
import EditorialFooter from "../../../components/layout/layoutHome/EditorialFooter";
import PropertyHeader from "../../../components/PropertyDetail/PropertyHeader";
import ImageGallery from "../../../components/PropertyDetail/ImageGallery";
import PropertyOverview from "../../../components/PropertyDetail/PropertyOverview";
import PropertyDescription from "../../../components/PropertyDetail/PropertyDescription";
import PropertyAmenities from "../../../components/PropertyDetail/PropertyAmenities";
import PropertyLocation from "../../../components/PropertyDetail/PropertyLocation";
import PropertyInfo from "../../../components/PropertyDetail/PropertyInfo";
import OwnerContact from "../../../components/PropertyDetail/OwnerContact";
import BookingCard from "../../../components/PropertyDetail/BookingCard";
import PropertyDetailLoadingSection from "./sections/PropertyDetailLoadingSection";
import PropertyDetailNotFoundSection from "./sections/PropertyDetailNotFoundSection";
import PropertyDetailMetaSection from "./sections/PropertyDetailMetaSection";
import usePropertyDetailData from "./hooks/usePropertyDetailData";
import "../../../styles/home-redesign.css";
import "../../../styles/search-redesign.css";

const PropertyDetailPage = () => {
  const {
    property,
    loading,
    images,
    contactingOwner,
    bookingLoading,
    leaseStart,
    leaseEnd,
    leaseDuration,
    estimatedCost,
    setLeaseStart,
    setLeaseEnd,
    isFavorited,
    favoriteCount,
    favoriteLoading,
    handleToggleFavorite,
    handleContactOwner,
    handleLongTermBooking,
  } = usePropertyDetailData();

  if (loading) {
    return <PropertyDetailLoadingSection />;
  }

  if (!property) {
    return <PropertyDetailNotFoundSection />;
  }

  return (
    <div className="home-v2 min-h-screen bg-[var(--home-bg)]">
      <EditorialHeader />

      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        <PropertyDetailMetaSection property={property} />
        <PropertyHeader
          property={property}
          isFavorited={isFavorited}
          favoriteCount={favoriteCount}
          favoriteLoading={favoriteLoading}
          handleToggleFavorite={handleToggleFavorite}
        />

        <ImageGallery images={images} title={property.title} />

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            <PropertyOverview property={property} />
            <PropertyDescription description={property.description} />
            <PropertyAmenities amenities={property.amenities} />
            <PropertyLocation address={property.address} />
            <PropertyInfo property={property} />
          </div>

          <aside className="self-start lg:sticky lg:top-24">
            <div className="space-y-6">
              <OwnerContact
                owner={property.owner}
                onContact={handleContactOwner}
                loading={contactingOwner}
              />
              <BookingCard
                property={property}
                leaseStart={leaseStart}
                leaseEnd={leaseEnd}
                setLeaseStart={setLeaseStart}
                setLeaseEnd={setLeaseEnd}
                leaseDuration={leaseDuration}
                estimatedCost={estimatedCost}
                onBook={handleLongTermBooking}
                loading={bookingLoading}
              />
            </div>
          </aside>
        </div>
      </Container>

      <EditorialFooter description="Khám phá thêm các không gian sống phù hợp với bạn và kết nối trực tiếp với chủ nhà trên Roomie." />
    </div>
  );
};

export default PropertyDetailPage;
