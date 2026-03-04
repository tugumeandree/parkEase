/**
 * ========================================
 * STORAGE.JS - Data Persistence Layer
 * ========================================
 * 
 * PURPOSE:
 * This module wraps the browser's localStorage API to safely read and write
 * JSON data. It acts as a database layer for the ParkEase app.
 * 
 * KEY CONCEPTS:
 * - localStorage: Browser's built-in storage (persists across sessions)
 * - JSON: Text format for storing JavaScript objects
 * - Error Handling: Try/catch prevents app crashes if data is corrupted
 * - Normalization: Case-insensitive comparisons for user searches
 * - API Pattern: Export a single `storageApi` object with all methods
 * 
 * WHY SEPARATE FILE:
 * - Keeps data logic separate from form logic (clean architecture)
 * - Easy to swap localStorage for a real database later
 * - Reusable across the entire app
 * - Single source of truth for all storage operations
 * 
 * DATA STRUCTURE:
 * Each \"table\" is a JSON array stored in localStorage:
 * - pe_users: [{id, name, role, ...}, ...]
 * - pe_vehicles: [{plate, driver, arrival, ...}, ...]
 * - pe_receipts: [{receiptNumber, fee, ...}, ...]
 * And so on for other entity types.
 */

// ========================================
// LOW-LEVEL STORAGE OPERATIONS
// ========================================

// Read JSON data safely from localStorage.
// If key doesn't exist or JSON is corrupted, return fallback (default [])
// This prevents crashes when data is missing or invalid
function read(key, fallback = []) {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch (error) {
    return fallback;
  }
}

// Write JSON data to localStorage.
// Always use JSON.stringify to convert objects to text
// localStorage only stores strings, not objects
function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// Normalize strings for case-insensitive comparisons.
// Example: "  John Okello  " becomes "john okello"
// This allows searching regardless of capitalization
function normalize(value) {
  return value.trim().toLowerCase();
}

// ========================================
// STORAGE KEYS - Central list for easy maintenance
// ========================================
// Prefix "pe_" = "ParkEase" to avoid conflicts with other apps
// Using constants prevents typos when accessing storage

const USER_KEY = "pe_users";
const VEHICLE_KEY = "pe_vehicles";
const RECEIPT_KEY = "pe_receipts";
const SIGNOUT_KEY = "pe_signouts";
const TYRE_KEY = "pe_tyre_services";
const BATTERY_KEY = "pe_battery_records";
const REPORT_KEY = "pe_reports";

// ========================================
// GENERIC DATA OPERATIONS
// ========================================
// These work with any data type and key

// Get entire array from storage (default to empty array)
function getList(key) {
  return read(key, []);
}

// Save array back to storage
// This overwrites the entire list - modify before calling!
function saveList(key, list) {
  write(key, list);
}

// Add ONE item to the end of an array
// Gets list, pushes new item, saves back
function addItem(key, item) {
  const list = getList(key);
  list.push(item);
  saveList(key, list);
}

// Delete all items from a list
// WARNING: This can't be undone!
function clearList(key) {
  saveList(key, []);
}

// ========================================
// PUBLIC API - Export as single object
// ========================================
// All app code imports and uses this one object.
// Methods for each entity type + helper validations.
// This is the COMPLETE list of storage operations available to the app.

// Small API for the rest of the app to use.
export const storageApi = {
  // ====================
  // USER OPERATIONS
  // ====================
  getUsers() {
    return getList(USER_KEY);
  },
  // Add new user to storage
  saveUser(user) {
    addItem(USER_KEY, user);
  },
  // Clear all user data
  clearUsers() {
    clearList(USER_KEY);
  },
  // Validation helper: Check if username is already taken
  // Searches all users, compares normalized usernames
  // Used during signup/user management to prevent duplicates
  isUsernameTaken(username) {
    const users = getList(USER_KEY);
    const target = normalize(username);
    return users.some(function (user) {
      return normalize(user.username) === target;
    });
  },
  // Validation helper: Check if email is already taken
  isEmailTaken(email) {
    const users = getList(USER_KEY);
    const target = normalize(email);
    return users.some(function (user) {
      return normalize(user.email) === target;
    });
  },
  // Find user by username OR email
  // Used during login to authenticate users
  // Checks both fields because users might log in with either
  findUserByIdentity(identity) {
    const users = getList(USER_KEY);
    const target = normalize(identity);
    return users.find(function (user) {
      return (
        normalize(user.username) === target || normalize(user.email) === target
      );
    });
  },
  // ====================
  // VEHICLE OPERATIONS  
  // ====================
  // Note: Vehicles are tied to parking sessions
  // One vehicle entry = one parking session
  addVehicle(vehicle) {
    addItem(VEHICLE_KEY, vehicle);
  },
  getVehicles() {
    return getList(VEHICLE_KEY);
  },
  clearVehicles() {
    clearList(VEHICLE_KEY);
  },
  // Find vehicle by license plate
  // Used when generating receipts and sign-outs
  getVehicleByPlate(plate) {
    const vehicles = getList(VEHICLE_KEY);
    const target = normalize(plate);
    return vehicles.find(function (vehicle) {
      return normalize(vehicle.plate) === target;
    });
  },
  // Get only vehicles that haven't been signed out yet.
  // These are actively parked vehicles eligible for receipts
  getActiveVehicles() {
    const vehicles = getList(VEHICLE_KEY);
    return vehicles.filter(function (vehicle) {
      return !vehicle.signedOut;
    });
  },
  // Mark a vehicle as signed out (no longer active)
  // Called when vehicle leaves the parking lot
  markVehicleSignedOut(plate) {
    const vehicles = getList(VEHICLE_KEY);
    const target = normalize(plate);
    const updated = vehicles.map(function (vehicle) {
      if (normalize(vehicle.plate) === target) {
        return { ...vehicle, signedOut: true };
      }
      return vehicle;
    });
    saveList(VEHICLE_KEY, updated);
  },
  // ====================
  // RECEIPT OPERATIONS
  // ====================
  // Receipts are proof of parking and link to fees
  addReceipt(receipt) {
    addItem(RECEIPT_KEY, receipt);
  },
  getReceipts() {
    return getList(RECEIPT_KEY);
  },
  clearReceipts() {
    clearList(RECEIPT_KEY);
  },
  // Find receipt by unique receipt number
  // Used during sign-out to verify receipt exists
  getReceiptByNumber(receiptNumber) {
    const receipts = getList(RECEIPT_KEY);
    return receipts.find(function (receipt) {
      return receipt.receiptNumber === receiptNumber;
    });
  },
  // ====================
  // SIGN-OUT OPERATIONS
  // ====================
  // Records who picked up the vehicle
  addSignoutRecord(record) {
    addItem(SIGNOUT_KEY, record);
  },
  getSignouts() {
    return getList(SIGNOUT_KEY);
  },
  clearSignouts() {
    clearList(SIGNOUT_KEY);
  },
  // ====================
  // TYRE SERVICE OPERATIONS
  // ====================
  // Tracks tyre maintenance services
  addTyreService(service) {
    addItem(TYRE_KEY, service);
  },
  getTyreServices() {
    return getList(TYRE_KEY);
  },
  clearTyreServices() {
    clearList(TYRE_KEY);
  },
  // ====================
  // BATTERY OPERATIONS
  // ====================  
  // Tracks battery sales and rentals
  addBatteryRecord(record) {
    addItem(BATTERY_KEY, record);
  },
  getBatteryRecords() {
    return getList(BATTERY_KEY);
  },
  clearBatteryRecords() {
    clearList(BATTERY_KEY);
  },
  // ====================
  // REPORT OPERATIONS
  // ====================
  // Stores financial summaries and analytics
  addReport(report) {
    addItem(REPORT_KEY, report);
  },
  getReports() {
    return getList(REPORT_KEY);
  },
  clearReports() {
    clearList(REPORT_KEY);
  },
};

export function getFormStorage(formId) {
  switch (formId) {
    case "signup":
    case "user-management":
      return storageApi.getUsers();
    case "vehicle-registration":
      return storageApi.getVehicles();
    case "parking-receipt":
      return storageApi.getReceipts();
    case "vehicle-signout":
      return storageApi.getSignouts();
    case "tyre-clinic":
      return storageApi.getTyreServices();
    case "battery-service":
      return storageApi.getBatteryRecords();
    case "daily-report":
      return storageApi.getReports();
    default:
      return [];
  }
}
