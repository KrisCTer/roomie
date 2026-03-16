// Date formatting utilities

/**
 * Convert YYYY-MM-DD to dd/MM/yyyy
 * @param {string} dateStr - Date in YYYY-MM-DD format
 * @returns {string} Date in dd/MM/yyyy format
 */
export const formatDateForDisplay = (dateStr) => {
  if (!dateStr) return "";
  
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;
  
  const [year, month, day] = parts;
  return `${day}/${month}/${year}`;
};

/**
 * Convert dd/MM/yyyy to YYYY-MM-DD
 * @param {string} dateStr - Date in dd/MM/yyyy format
 * @returns {string} Date in YYYY-MM-DD format
 */
export const formatDateForInput = (dateStr) => {
  if (!dateStr) return "";
  
  const parts = dateStr.split("/");
  if (parts.length !== 3) return dateStr;
  
  const [day, month, year] = parts;
  return `${year}-${month}-${day}`;
};

/**
 * Convert backend date (YYYY-MM-DD) to display format (dd/MM/yyyy)
 * @param {string} backendDate - Date from backend
 * @returns {string} Display format date
 */
export const backendToDisplay = (backendDate) => {
  if (!backendDate) return "";
  
  // Extract just the date part if it's a full datetime
  const datePart = backendDate.substring(0, 10);
  return formatDateForDisplay(datePart);
};

/**
 * Convert display date (dd/MM/yyyy) to backend format (YYYY-MM-DD)
 * @param {string} displayDate - Display format date
 * @returns {string} Backend format date
 */
export const displayToBackend = (displayDate) => {
  if (!displayDate) return "";
  return formatDateForInput(displayDate);
};