/**
 * Formats a date string to dd-mm-yy
 * @param {string} dateStr - Date string in YYYY-MM-DD or YYYY-MM format
 * @returns {string} - Formatted date string
 */
export const formatDate = (dateStr) => {
    if (!dateStr) return "-";

    // Handle YYYY-MM-DD
    if (dateStr.length === 10) {
        const [year, month, day] = dateStr.split("-");
        return `${day}-${month}-${year.slice(-2)}`;
    }

    // Handle YYYY-MM
    if (dateStr.length === 7) {
        const [year, month] = dateStr.split("-");
        return `${month}-${year.slice(-2)}`;
    }

    return dateStr;
};
