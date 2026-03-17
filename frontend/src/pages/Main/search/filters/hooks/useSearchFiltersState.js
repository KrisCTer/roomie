import { useEffect, useMemo, useState } from "react";
import {
  DEFAULT_FILTERS,
  getActiveFilterCount,
} from "../utils/filterOptions";

const useSearchFiltersState = ({ filters, open, onFilterChange, onClose }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters, open]);

  const activeFilterCount = useMemo(
    () => getActiveFilterCount(localFilters),
    [localFilters],
  );

  const handleApply = () => {
    onFilterChange(localFilters);
    onClose();
  };

  const handleReset = () => {
    setLocalFilters(DEFAULT_FILTERS);
    onFilterChange(DEFAULT_FILTERS);
  };

  return {
    localFilters,
    setLocalFilters,
    activeFilterCount,
    handleApply,
    handleReset,
  };
};

export default useSearchFiltersState;
