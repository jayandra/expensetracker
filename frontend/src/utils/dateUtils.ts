/**
 * Formats a date to YYYY-MM-DD for input fields
 * @param date The date to format
 * @returns A string in YYYY-MM-DD format
 */
export const formatForInput = (date: Date): string => {
    const localDate = new Date(date);
    return localDate.toISOString().split("T")[0];
};

// Reset hours to be 0000 for date comparision
export const resetHours = (date: Date): Date => {
    date.setHours(0, 0, 0, 0)
    return date
}
