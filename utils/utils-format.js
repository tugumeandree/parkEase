/**
 * ========================================
 * UTILS - FORMATTING FUNCTIONS
 * ========================================
 * 
 * Transform raw data into display-friendly formats.
 * Used throughout the app for tables, displays, exports.
 * 
 * For learners:
 * - See how to format different data types
 * - Understand locale-aware formatting
 * - Learn to handle edge cases (null, NaN, etc.)
 * - Demonstrates: Separation of logic from presentation
 */

/**
 * Format ISO date string to human-readable format
 * Input: "2026-02-26T14:30:00.000Z"
 * Output: "2/26/2026, 2:30:00 PM"
 * 
 * Uses browser's locale (user's language/region)
 */
export function formatDate(isoString) {
  if (!isoString) return "";
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString();
}

/**
 * Format date to just the date part (no time)
 * Input: "2026-02-26T14:30:00.000Z"
 * Output: "2/26/2026"
 */
export function formatDateOnly(isoString) {
  if (!isoString) return "";
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString();
}

/**
 * Format time only (no date)
 * Input: "2026-02-26T14:30:00.000Z"
 * Output: "2:30:00 PM"
 */
export function formatTimeOnly(isoString) {
  if (!isoString) return "";
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString();
}

/**
 * Format number as UGX currency
 * Input: 45000
 * Output: "UGX 45,000"
 */
export function formatCurrency(amount) {
  if (amount === null || amount === undefined || Number.isNaN(Number(amount))) {
    return "UGX 0";
  }
  const num = Number(amount);
  return `UGX ${num.toLocaleString()}`;
}

/**
 * Extract date key from ISO string for grouping
 * Used to group records by date
 * Input: "2026-02-26T14:30:00.000Z"
 * Output: "2026-02-26"
 */
export function getDateKey(isoString) {
  if (!isoString) return "";
  return isoString.split("T")[0];
}

/**
 * Format name to Title Case
 * Input: "john okello"
 * Output: "John Okello"
 */
export function toTitleCase(str) {
  if (!str) return "";
  return str
    .trim()
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Format plate to uppercase
 * Input: "ubz1234"
 * Output: "UBZ1234"
 */
export function formatPlate(plate) {
  return plate.trim().toUpperCase();
}

/**
 * Format phone number for display
 * Input: "256712345678" or "0712345678"
 * Output: "+256 712 345 678" or "071 234 5678"
 */
export function formatPhoneDisplay(phone) {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 9) {
    // Ugandan format: 0712345678
    return `0${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  } else if (cleaned.length === 12 && cleaned.startsWith("256")) {
    // International: 256712345678
    return `+256 ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`;
  }
  return phone;
}

/**
 * Truncate long text for display
 * Input: "This is a very long description...", 20
 * Output: "This is a very long..."
 */
export function truncate(text, length = 30) {
  if (!text) return "";
  if (text.length <= length) return text;
  return text.substring(0, length) + "...";
}

/**
 * Format vehicle type name (handle singular/plural)
 * Input: "Boda", 2
 * Output: "2 Bodas" or "2 Boda-bodas" depending on context
 */
export function formatVehicleType(type) {
  if (type === "Boda") return "Boda-boda";
  return type;
}

/**
 * Format percentage value
 * Input: 0.8567
 * Output: "85.67%"
 */
export function formatPercentage(decimal) {
  const percent = (decimal * 100).toFixed(2);
  return `${percent}%`;
}

/**
 * Format hours with "hour" or "hours"
 * Input: 1
 * Output: "1 hour"
 * Input: 2
 * Output: "2 hours"
 */
export function formatHours(hours) {
  const h = Number(hours);
  return `${h} ${h === 1 ? "hour" : "hours"}`;
}

/**
 * Format full receipt display string
 * Input: { plate: "UBZ1234", fee: 6000, hours: 3 }
 * Output: "UBZ1234 - 3 hours - UGX 6,000"
 */
export function formatReceiptSummary(receipt) {
  return `${receipt.plate} - ${formatHours(receipt.hours)} - ${formatCurrency(receipt.fee)}`;
}

/**
 * Strip all formatting and return raw value
 * Input: "UGX 45,000"
 * Output: "45000"
 */
export function stripFormatting(formattedValue) {
  if (!formattedValue) return "";
  return formattedValue.replace(/[^0-9]/g, "");
}

/**
 * Safely convert to number, handle errors
 * Input: "not a number"
 * Output: 0 (safe default)
 */
export function toNumber(value, defaultValue = 0) {
  const num = Number(value);
  return Number.isNaN(num) ? defaultValue : num;
}

/**
 * Format timestamp to relative time
 * Input: timestamp from 2 hours ago
 * Output: "2 hours ago"
 * Note: Useful for showing "Document created 3 days ago"
 */
export function formatRelativeTime(isoString) {
  if (!isoString) return "";
  const date = new Date(isoString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;

  return formatDateOnly(isoString);
}
