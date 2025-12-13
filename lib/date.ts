/**
 * Formats a Date object in the format of MM YYYY
 * @param date - The Date object to format
 * @returns The formatted date string
 */
export function getMonthString(date: Date): string {
  const options: Intl.DateTimeFormatOptions = { month: 'long', year: 'numeric' }
  return date.toLocaleString('en-US', options)
}
