import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import EditorialHeader from "../../../components/layout/layoutHome/EditorialHeader";
import EditorialFooter from "../../../components/layout/layoutHome/EditorialFooter";
import useFavoritesData from "./hooks/useFavoritesData";
import FavoritesHeroSection from "./sections/FavoritesHeroSection";
import FavoritesGridSection from "./sections/FavoritesGridSection";
import FavoritesLoadingSection from "./sections/FavoritesLoadingSection";
import "../../../styles/home-redesign.css";
import "../../../styles/favorites-redesign.css";

const FavoritesPage = () => {
  const navigate = useNavigate();
  const { favorites, loading, removing, removeFavoriteById } =
    useFavoritesData();

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
  }, [favorites, loading]);

  const handleOpenProperty = (propertyId) => {
    if (propertyId === "search") {
      navigate("/search");
      return;
    }

    navigate(`/property/${propertyId}`);
  };

  const handleRemove = async (propertyId) => {
    const confirmed = window.confirm("Remove this property from favorites?");
    if (!confirmed) return;

    const result = await removeFavoriteById(propertyId);
    if (!result.success) {
      window.alert("Failed to remove favorite");
    }
  };

  return (
    <div className="home-v2 favorite-v2 min-h-screen bg-[var(--home-bg)] text-[var(--home-charcoal)]">
      <EditorialHeader />

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <FavoritesHeroSection totalCount={favorites.length} />
        {loading ? (
          <FavoritesLoadingSection />
        ) : (
          <FavoritesGridSection
            favorites={favorites}
            removing={removing}
            onRemove={handleRemove}
            onOpenProperty={handleOpenProperty}
          />
        )}
      </main>

      <EditorialFooter description="Danh sách yêu thích được thiết kế lại theo hướng editorial: quét nhanh, thao tác bỏ lưu tức thì, và điều hướng liền mạch về chi tiết phòng." />
    </div>
  );
};

export default FavoritesPage;
