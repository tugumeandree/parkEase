/**
 * ========================================
 * UTILS - CALCULATION FUNCTIONS
 * ========================================
 * 
 * Business logic calculations: fees, hours, totals.
 * Separated from display so they can be tested independently.
 * 
 * For learners:
 * - Understand business logic separation from UI
 * - Practice writing pure functions
 * - Learn to handle time math
 * - Demonstrates: Testability and reusability
 */

import { RATES } from './utils-constants.js';

/**
 * Calculate parking hours between arrival and departure
 * 
 * Logic:
 * - Convert ISO dates to milliseconds
 * - Calculate difference
 * - Convert to hours (divide by 3,600,000 ms per hour)
 * - Round up (even 1 second charged as 1 hour)
 * 
 * @param {string} arrivalISO - ISO date string "2026-02-26T10:00:00Z"
 * @param {string} departureISO - ISO date string "2026-02-26T13:30:00Z"
 * @returns {number} Hours parked (minimum 1)
 * 
 * Example:
 * calculateParkingHours("2026-02-26T10:00:00Z", "2026-02-26T13:30:00Z")
 * Result: 4 (3.5 hours rounds up to 4)
 */
export function calculateParkingHours(arrivalISO, departureISO) {
  const arrival = new Date(arrivalISO);
  const departure = new Date(departureISO);
  
  // Calculate milliseconds difference
  const diffMs = departure - arrival;
  
  // Convert to hours (3,600,000 ms = 1 hour)
  const diffHours = diffMs / 3600000;
  
  // Round up and ensure minimum 1 hour
  return Math.max(1, Math.ceil(diffHours));
}

/**
 * Get parking rate for vehicle type
 * Falls back to 2000 if type unknown (safe default)
 * 
 * @param {string} vehicleType - "Car", "Boda", "Truck", "Van"
 * @returns {number} Rate in UGX per hour
 */
export function getRate(vehicleType) {
  return RATES[vehicleType] || 2000;
}

/**
 * Calculate parking fee
 * 
 * Formula: Hours × Rate = Fee
 * 
 * @param {string} vehicleType - "Car", "Boda", etc.
 * @param {string} arrivalISO - ISO date string
 * @param {string} departureISO - ISO date string
 * @returns {object} { hours: number, fee: number }
 * 
 * Example:
 * calculateFee("Car", arrival, departure)
 * Result: { hours: 3, fee: 6000 }
 */
export function calculateFee(vehicleType, arrivalISO, departureISO) {
  const hours = calculateParkingHours(arrivalISO, departureISO);
  const rate = getRate(vehicleType);
  const fee = hours * rate;

  return {
    hours: hours,
    fee: fee,
  };
}

/**
 * Calculate total revenue from multiple receipts
 * 
 * @param {array} receipts - Array of receipt objects with .fee property
 * @returns {number} Total fees sum
 * 
 * Example:
 * const receipts = [
 *   { plate: "UBZ1234", fee: 6000 },
 *   { plate: "UXY5678", fee: 4000 },
 * ];
 * calculateTotalRevenue(receipts)
 * Result: 10000
 */
export function calculateTotalRevenue(receipts) {
  if (!Array.isArray(receipts)) return 0;
  return receipts.reduce((sum, receipt) => sum + Number(receipt.fee || 0), 0);
}

/**
 * Calculate average fee
 * 
 * @param {array} receipts - Array of receipt objects
 * @returns {number} Average fee (0 if no receipts)
 */
export function calculateAverageFee(receipts) {
  if (!Array.isArray(receipts) || receipts.length === 0) return 0;
  const total = calculateTotalRevenue(receipts);
  return Math.round(total / receipts.length);
}

/**
 * Calculate average parking duration
 * 
 * @param {array} receipts - Array of receipt objects with .hours
 * @returns {number} Average hours (rounded)
 */
export function calculateAverageDuration(receipts) {
  if (!Array.isArray(receipts) || receipts.length === 0) return 0;
  const totalHours = receipts.reduce((sum, r) => sum + Number(r.hours || 0), 0);
  return Math.round(totalHours / receipts.length);
}

/**
 * Calculate peak vehicle type (most parked)
 * 
 * @param {array} vehicles - Array of vehicle objects
 * @returns {object} { type: string, count: number }
 * 
 * Example:
 * Result: { type: "Car", count: 45 }
 */
export function calculatePeakVehicleType(vehicles) {
  if (!Array.isArray(vehicles) || vehicles.length === 0) {
    return { type: "Unknown", count: 0 };
  }

  const counts = {};
  vehicles.forEach(v => {
    counts[v.vehicleType] = (counts[v.vehicleType] || 0) + 1;
  });

  let peak = { type: "Unknown", count: 0 };
  for (const type in counts) {
    if (counts[type] > peak.count) {
      peak = { type, count: counts[type] };
    }
  }

  return peak;
}

/**
 * Calculate active vs inactive vehicles
 * 
 * @param {array} vehicles - Array of vehicle objects
 * @returns {object} { active: number, inactive: number }
 */
export function calculateVehicleStatus(vehicles) {
  if (!Array.isArray(vehicles)) {
    return { active: 0, inactive: 0 };
  }

  const stats = vehicles.reduce(
    (acc, v) => {
      if (v.signedOut) {
        acc.inactive++;
      } else {
        acc.active++;
      }
      return acc;
    },
    { active: 0, inactive: 0 }
  );

  return stats;
}

/**
 * Calculate percentage of vehicle type
 * Useful for charts and analytics
 * 
 * @param {array} vehicles - All vehicles
 * @param {string} vehicleType - "Car", "Boda", etc.
 * @returns {number} Percentage (0-100)
 */
export function calculateVehicleTypePercentage(vehicles, vehicleType) {
  if (!Array.isArray(vehicles) || vehicles.length === 0) return 0;
  const count = vehicles.filter(v => v.vehicleType === vehicleType).length;
  return Math.round((count / vehicles.length) * 100);
}

/**
 * Calculate revenue by vehicle type
 * Useful for understanding which vehicles generate most revenue
 * 
 * @param {array} receipts - All receipts
 * @returns {object} { "Car": 50000, "Boda": 30000, ... }
 */
export function calculateRevenueByType(receipts) {
  if (!Array.isArray(receipts)) return {};

  return receipts.reduce((acc, receipt) => {
    const type = receipt.vehicleType || "Unknown";
    acc[type] = (acc[type] || 0) + Number(receipt.fee || 0);
    return acc;
  }, {});
}

/**
 * Calculate summary statistics for a report
 * 
 * @param {array} receipts - All receipts for the period
 * @param {array} signouts - All sign-outs for the period
 * @param {array} tyre - All tyre services for the period
 * @param {array} battery - All battery transactions for the period
 * @returns {object} Complete summary
 */
export function calculateReportSummary(receipts, signouts, tyre, battery) {
  const parkingTotal = calculateTotalRevenue(receipts);
  const tyreTotal = calculateTotalRevenue(tyre);
  const batteryTotal = calculateTotalRevenue(battery);

  return {
    parkingTotal: parkingTotal,
    tyreTotal: tyreTotal,
    batteryTotal: batteryTotal,
    grandTotal: parkingTotal + tyreTotal + batteryTotal,
    vehicleCount: (receipts || []).length,
    signoutCount: (signouts || []).length,
    tyreCount: (tyre || []).length,
    batteryCount: (battery || []).length,
  };
}

/**
 * Calculate if discount applies
 * Example: Bulk discount if parking > 8 hours
 * 
 * @param {number} hours - Hours parked
 * @param {number} baseRate - Rate without discount
 * @returns {number} Discounted rate
 */
export function calculateDiscountedRate(hours, baseRate) {
  // Example: 10% discount for 4+ hours, 15% for 8+ hours
  if (hours >= 8) {
    return Math.round(baseRate * 0.85); // 15% discount
  }
  if (hours >= 4) {
    return Math.round(baseRate * 0.90); // 10% discount
  }
  return baseRate; // No discount
}

/**
 * Calculate projected daily revenue if trend continues
 * 
 * @param {number} currentRevenue - Revenue so far today
 * @param {number} currentHour - Hour of day (0-23)
 * @returns {number} Projected total for full day
 */
export function calculateProjectedDailyRevenue(currentRevenue, currentHour = new Date().getHours()) {
  if (currentHour === 0) return 0; // Invalid
  const projection = (currentRevenue / currentHour) * 24;
  return Math.round(projection);
}

/**
 * Calculate if parking lot is "busy" (heuristic)
 * 
 * @param {number} activeVehicles - Current active vehicle count
 * @param {number} capacity - Lot capacity
 * @returns {object} { isBusy: boolean, percentage: number }
 */
export function calculateOccupancyStatus(activeVehicles, capacity = 100) {
  const percentage = Math.round((activeVehicles / capacity) * 100);
  return {
    isBusy: percentage > 70,
    percentage: Math.min(100, percentage),
    level: percentage > 85 ? "Full" : percentage > 70 ? "Busy" : "Available",
  };
}
