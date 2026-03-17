import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import EditorialHeader from "../../../components/layout/layoutHome/EditorialHeader";
import EditorialFooter from "../../../components/layout/layoutHome/EditorialFooter";
import useHomeProperties from "./hooks/useHomeProperties";
import HomeHeroSection from "./sections/HomeHeroSection";
import HomeTrustSection from "./sections/HomeTrustSection";
import HomePropertySections from "./sections/HomePropertySections";
import "../../../styles/home-redesign.css";

const HomePage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { loading, highlightedSections, totalProperties, availableAreas } =
    useHomeProperties();

  const [searchData, setSearchData] = useState({
    location: "",
    propertyType: "",
    minPrice: "",
    maxPrice: "",
  });

  useEffect(() => {
    const items = document.querySelectorAll(".reveal-item");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );

    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, [highlightedSections, loading]);

  const handlePropertyClick = (id) => {
    if (!id) {
      return;
    }
    navigate(`/property/${id}`);
  };

  const handleViewAll = (province) => {
    const params = new URLSearchParams();
    params.set("location", province);
    navigate(`/search?${params.toString()}`);
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchData.location.trim()) {
      params.set("location", searchData.location.trim());
    }
    if (searchData.propertyType) {
      params.set("type", searchData.propertyType);
    }
    if (searchData.minPrice) {
      params.set("minPrice", searchData.minPrice);
    }
    if (searchData.maxPrice) {
      params.set("maxPrice", searchData.maxPrice);
    }

    navigate(`/search?${params.toString()}`);
  };

  return (
    <div className="home-v2 min-h-screen bg-[var(--home-bg)] text-[var(--home-charcoal)]">
      <EditorialHeader />

      <main>
        <HomeHeroSection
          searchData={searchData}
          setSearchData={setSearchData}
          handleSearch={handleSearch}
          totalProperties={totalProperties}
          availableAreas={availableAreas}
          t={t}
        />
        <HomeTrustSection />
        <HomePropertySections
          loading={loading}
          highlightedSections={highlightedSections}
          t={t}
          onViewAll={handleViewAll}
          onCardClick={handlePropertyClick}
        />
      </main>

      <EditorialFooter description="Home mới tập trung vào flow tìm kiếm và ra quyết định thuê nhanh, với section-based IA, card pattern có khả năng tương tác cao và khả năng đọc tốt trên mobile." />
    </div>
  );
};

export default HomePage;
