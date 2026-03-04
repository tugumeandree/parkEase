/**
 * ========================================
 * UTILS - CONSTANTS
 * ========================================
 * 
 * All configuration, rates, validation patterns, and messages in one place.
 * This is the "source of truth" for the app's rules and feedback.
 * 
 * For learners:
 * - See all validation rules at a glance
 * - Understand what makes valid input
 * - Easy to modify rates, messages, requirements
 * - Demonstrates principle: "Keep configuration separate from logic"
 */

// ========================================
// PARKING RATES (by vehicle type per hour)
// ========================================
export const RATES = {
  Car: 2000,      // UGX per hour
  Boda: 1000,
  Truck: 5000,
  Van: 2500,
};

// ========================================
// VALIDATION PATTERNS (Regular Expressions)
// ========================================
// These patterns define what formats are acceptable for input.
// Regex Reference: ^=start, $=end, \d=digit, [A-Z]=uppercase, {n,m}=count

export const REGEX = {
  // Phone: Uganda numbers starting with +256 or 0, followed by 7 and 8 digits
  // Valid: +256712345678, 0712345678
  // Invalid: 1234567, +25671234567
  phone: /^(?:\+256|0)7\d{8}$/,

  // Name: First and last names, each capitalized
  // Valid: "John Okello", "Mary Smith"
  // Invalid: "john okello", "MARY", "john"
  name: /^[A-Z][a-z]+(?:\s[A-Z][a-z]+)+$/,

  // License plate: Starts with U, followed by 5-7 alphanumeric characters
  // Valid: "UBZ1234", "UXY12AB"
  // Invalid: "ABC1234", "U123"
  plate: /^U[A-Z0-9]{5,7}$/,

  // Password: Min 8 chars, must have uppercase, lowercase, digit, and symbol
  // Valid: "SecurePass123!"
  // Invalid: "password", "PASSWORD123!", "Pass123"
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/,
};

// ========================================
// VALIDATION MESSAGES
// ========================================
// Organized by form type. Shows user why their input was rejected.

export const MESSAGES = {
  signup: {
    name: "Use capitalized first and last names.",
    usernameTaken: "Username is already taken.",
    emailTaken: "Email already exists.",
    phone: "Enter a valid Ugandan phone number.",
    password: "Password must be 8+ chars with upper, lower, number, symbol.",
    confirm: "Passwords do not match.",
    success: "Account created successfully.",
  },
  login: {
    required: "Please enter credentials.",
    invalid: "Invalid credentials.",
  },
  vehicle: {
    name: "Use capitalized first and last names.",
    plate: "Plate must start with U and be alphanumeric.",
    phone: "Enter a valid Ugandan phone number.",
    nin: "NIN is required for boda-bodas.",
    success: "Vehicle registered successfully.",
  },
  receipt: {
    required: "Select plate and departure time.",
    missing: "Vehicle not found.",
    timing: "Departure must be after arrival.",
    success: "Receipt generated and stored.",
  },
  signout: {
    phone: "Enter a valid Ugandan phone number.",
    receipt: "Receipt number not found.",
    success: "Vehicle signed out successfully.",
  },
  tyre: {
    plate: "Enter a valid plate starting with U.",
    success: "Tyre service saved.",
  },
  battery: {
    plate: "Enter a valid plate starting with U.",
    success: "Battery record saved.",
  },
  user: {
    username: "Username already exists.",
    email: "Email already exists.",
    password: "Password must be 8+ chars with upper, lower, number, symbol.",
    success: "User added successfully.",
  },
  report: {
    required: "Choose a date to generate report.",
    success: "Report generated.",
  },
};

// ========================================
// TYRE SERVICE PRICING
// ========================================
// Maps service type to price
export const TYRE_PRICES = {
  Pressure: 3000,
  Puncture: 5000,
  Valve: 2000,
};

// ========================================
// VEHICLE TYPES
// ========================================
export const VEHICLE_TYPES = ["Car", "Boda", "Truck", "Van", "Taxi"];

// ========================================
// USER ROLES
// ========================================
export const USER_ROLES = ["Attendant", "Manager", "Admin"];

// ========================================
// USER STATUSES
// ========================================
export const USER_STATUSES = ["Active", "Inactive", "Suspended"];

// ========================================
// TRANSACTION TYPES
// ========================================
export const BATTERY_TYPES = ["Sale", "Hire"];

// ========================================
// STORAGE KEYS
// ========================================
// All prefixed with "pe_" (ParkEase) to avoid conflicts with other apps
export const STORAGE_KEYS = {
  users: "pe_users",
  vehicles: "pe_vehicles",
  receipts: "pe_receipts",
  signouts: "pe_signouts",
  tyreServices: "pe_tyre_services",
  batteryRecords: "pe_battery_records",
  reports: "pe_reports",
  session: "pe_session",
};
