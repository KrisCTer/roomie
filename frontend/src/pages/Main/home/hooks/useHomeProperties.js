import { useCallback, useEffect, useMemo, useState } from "react";
import { getPublicProperties } from "../../../../services/propertyService";
import { filterApproved, groupByProvince } from "../utils/homePresentation";

const useHomeProperties = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadProperties = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getPublicProperties();

      let list = [];
      if (res && res.success && Array.isArray(res.result)) {
        list = res.result;
      } else if (res && res.data && Array.isArray(res.data.result)) {
        list = res.data.result;
      } else if (Array.isArray(res)) {
        list = res;
      }

      const visible = filterApproved(list);
      const grouped = groupByProvince(visible);
      setSections(grouped);
    } catch (error) {
      console.error("Error loading properties:", error);
      setSections([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProperties();
  }, [loadProperties]);

  const highlightedSections = useMemo(() => {
    return [...sections]
      .filter((section) => section.items.length > 0)
      .sort((a, b) => b.items.length - a.items.length);
  }, [sections]);

  const totalProperties = useMemo(
    () => sections.reduce((total, section) => total + section.items.length, 0),
    [sections],
  );

  const availableAreas = useMemo(
    () =>
      sections.filter((section) => section.province !== "__OTHER__").length,
    [sections],
  );

  return {
    sections,
    loading,
    highlightedSections,
    totalProperties,
    availableAreas,
    reload: loadProperties,
  };
};

export default useHomeProperties;
