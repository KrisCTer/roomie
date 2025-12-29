// web-app/src/hooks/useFavorite.js
import { useState, useEffect } from "react";
import { toggleFavorite, checkFavorite } from "../services/favorite.service";

/**
 * Custom hook for managing favorite status of a property
 * @param {string} propertyId - The ID of the property
 * @returns {object} - { isFavorited, favoriteCount, isLoading, handleToggleFavorite }
 */
export const useFavorite = (propertyId) => {
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check initial favorite status
  useEffect(() => {
    const checkStatus = async () => {
      if (!propertyId) return;

      try {
        setIsLoading(true);
        const response = await checkFavorite(propertyId);
        
        if (response?.success) {
          setIsFavorited(response.result.isFavorited);
          setFavoriteCount(response.result.favoriteCount);
        }
      } catch (err) {
        console.error("Error checking favorite status:", err);
        // Don't set error, just use default values (not favorited)
        setIsFavorited(false);
        setFavoriteCount(0);
      } finally {
        setIsLoading(false);
      }
    };

    checkStatus();
  }, [propertyId]);

  // Toggle favorite status
  const handleToggleFavorite = async () => {
    if (!propertyId) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await toggleFavorite(propertyId);

      if (response?.success) {
        setIsFavorited(response.result.isFavorited);
        setFavoriteCount(response.result.favoriteCount);
        
        // Show success message (optional)
        console.log(response.message);
      } else {
        throw new Error(response?.message || "Failed to toggle favorite");
      }
    } catch (err) {
      console.error("Error toggling favorite:", err);
      setError(err.message);
      
      // Show error to user
      alert("Không thể cập nhật trạng thái yêu thích. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isFavorited,
    favoriteCount,
    isLoading,
    error,
    handleToggleFavorite,
  };
};

export default useFavorite;