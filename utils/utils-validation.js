/**
 * ========================================
 * UTILS - VALIDATION FUNCTIONS
 * ========================================
 * 
 * All input validation in one place.
 * Each function validates ONE specific thing.
 * Returns true/false for easy testing.
 * 
 * For learners:
 * - See common validation patterns
 * - Test each function independently
 * - Easy to modify rules in one place
 * - Demonstrates: Single Responsibility Principle
 */

import { REGEX } from './utils-constants.js';

/**
 * Validate name format (capitalized first and last names)
 * Example: "John Okello" ✓, "john okello" ✗
 */
export function isValidName(name) {
  return REGEX.name.test(name.trim());
}

/**
 * Validate phone number format (Uganda)
 * Example: "+256712345678" ✓, "123" ✗
 */
export function isValidPhone(phone) {
  return REGEX.phone.test(phone.trim());
}

/**
 * Validate license plate format
 * Example: "UBZ1234" ✓, "ABC1234" ✗
 */
export function isValidPlate(plate) {
  return REGEX.plate.test(plate);
}

/**
 * Validate password strength
 * Must have: 8+ chars, uppercase, lowercase, digit, symbol
 * Example: "SecurePass123!" ✓, "password" ✗
 */
export function isStrongPassword(password) {
  return REGEX.password.test(password);
}

/**
 * Check if email format is valid
 * Simple check: has @, has dot after @
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Check if passwords match (for confirmation)
 * Used in signup and password change forms
 */
export function passwordsMatch(password, confirmPassword) {
  return password === confirmPassword && password.length > 0;
}

/**
 * Check if NIN (National ID) is provided (required for bodas)
 * Simple check: just ensure it's not empty
 */
export function hasNIN(nin, vehicleType) {
  if (vehicleType === "Boda") {
    return nin && nin.trim().length > 0;
  }
  return true; // NIN not required for other vehicles
}

/**
 * Check if field is not empty
 * General purpose: any text field that's required
 */
export function isNotEmpty(value) {
  return value && value.trim().length > 0;
}

/**
 * Check if fields are truthy (for dropdowns, checkboxes)
 * Used when form.value must be selected
 */
export function isSelected(value) {
  return value && value !== "";
}

/**
 * Validate date is in past or present (for arrivals)
 * Cannot allow future arrival times
 */
export function isDateInPast(dateString) {
  const date = new Date(dateString);
  return date <= new Date();
}

/**
 * Validate that departure is after arrival
 * Time logic: departure > arrival
 */
export function isDepartureAfterArrival(arrivalISO, departureISO) {
  const arrival = new Date(arrivalISO);
  const departure = new Date(departureISO);
  return departure > arrival;
}

/**
 * Validate a number is positive
 * Used for prices, hours, etc.
 */
export function isPositiveNumber(value) {
  const num = Number(value);
  return !isNaN(num) && num > 0;
}

/**
 * BATCH VALIDATION: Check multiple fields at once
 * Returns object with field: boolean pairs
 * Example: { name: true, email: false, phone: true }
 */
export function validateSignupForm(formData) {
  return {
    fullName: isValidName(formData.fullName),
    email: isValidEmail(formData.email),
    phone: isValidPhone(formData.phone),
    password: isStrongPassword(formData.password),
    confirmPassword: passwordsMatch(formData.password, formData.confirmPassword),
  };
}

/**
 * BATCH VALIDATION: Vehicle registration form
 */
export function validateVehicleForm(formData) {
  return {
    driverName: isValidName(formData.driverName),
    plate: isValidPlate(formData.plate),
    phone: isValidPhone(formData.phone),
    nin: hasNIN(formData.nin, formData.vehicleType),
  };
}

/**
 * BATCH VALIDATION: Receipt form
 */
export function validateReceiptForm(formData) {
  return {
    plate: isSelected(formData.plate),
    departure: isSelected(formData.departure),
  };
}

/**
 * BATCH VALIDATION: Sign-out form
 */
export function validateSignoutForm(formData) {
  return {
    phone: isValidPhone(formData.phone),
    receiptNumber: isNotEmpty(formData.receiptNumber),
  };
}
