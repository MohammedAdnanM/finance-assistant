/**
 * Formats a date string to dd-mm-yy
 * @param dateStr - Date string in YYYY-MM-DD
 * @returns Formatted date string
 */
export const formatDate = (dateStr: string): string => {
    if (!dateStr) return "-";
    if (dateStr.length === 10) {
        const [year, month, day] = dateStr.split("-");
        return `${day}-${month}-${year.slice(-2)}`;
    }
    return dateStr;
};
