import { useCallback, useEffect, useState } from "react";
import { getMyFavorites, removeFavorite } from "../../../../services/favoriteService";

const useFavoritesData = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(null);

  const loadFavorites = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getMyFavorites();
      if (response?.success) {
        setFavorites(response.result || []);
      }
    } catch (error) {
      console.error("Error loading favorites:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const handleRemoveFavorite = async (propertyId) => {
    try {
      setRemoving(propertyId);
      await removeFavorite(propertyId);
      setFavorites((prev) => prev.filter((p) => p.propertyId !== propertyId));
      return { success: true };
    } catch (error) {
      console.error("Error removing favorite:", error);
      return { success: false };
    } finally {
      setRemoving(null);
    }
  };

  return {
    favorites,
    loading,
    removing,
    reload: loadFavorites,
    removeFavoriteById: handleRemoveFavorite,
  };
};

export default useFavoritesData;
