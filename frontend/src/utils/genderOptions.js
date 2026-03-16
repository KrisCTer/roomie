// Gender options for profile form

export const GENDER_OPTIONS = [
  { value: "MALE", label: "Nam" },
  { value: "FEMALE", label: "Nữ" },
  { value: "OTHER", label: "Khác" },
  { value: "PREFER_NOT_TO_SAY", label: "Không muốn tiết lộ" },
];

/**
 * Convert backend gender value to display label
 * @param {string} gender - Backend gender value (MALE, FEMALE, etc.)
 * @returns {string} Display label
 */
export const getGenderLabel = (gender) => {
  const option = GENDER_OPTIONS.find((opt) => opt.value === gender);
  return option ? option.label : gender;
};

/**
 * Convert display label to backend gender value
 * @param {string} label - Display label
 * @returns {string} Backend gender value
 */
export const getGenderValue = (label) => {
  const option = GENDER_OPTIONS.find((opt) => opt.label === label);
  return option ? option.value : label;
};