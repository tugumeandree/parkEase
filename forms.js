/**
 * ========================================
 * FORMS.JS - Form Validation & Submission
 * ========================================
 * 
 * PURPOSE:
 * This module handles all form validation, submission logic, and data processing
 * for the ParkEase application. It validates user input against predefined rules
 * and saves valid data to localStorage via the storage API.
 * 
 * STRUCTURE:
 * 1. Imports - Connects to storage.js and tables.js
 * 2. Validation Patterns (regex) - Define allowed formats for inputs
 * 3. Rate Configuration - Parking fees by vehicle type
 * 4. Validation Messages - User-friendly error/success messages
 * 5. Helper Utilities - Small functions for common tasks
 * 6. Navigation Functions - Handle section switching
 * 7. Receipt Helpers - Special logic for receipt management
 * 8. Form Handlers - Process each form submission
 * 9. DOM Setup - Attach event listeners to all forms
 * 
 * KEY CONCEPTS FOR LEARNERS:
 * - Form Validation: Check input BEFORE saving to prevent bad data
 * - Regular Expressions (Regex): Patterns that match valid input formats
 * - Event Delegation: Listen for submit events to prevent page reload
 * - localStorage: Browser storage that persists between sessions
 * - Separation of Concerns: Each function does one specific task
 */

import { storageApi } from "./storage.js";
import {
  initializeTables,
  renderUserTables,
  renderVehicleTable,
  renderReceiptTable,
  renderSignoutTable,
  renderTyreTable,
  renderBatteryTable,
  renderReportTable,
  revealPanel,
  setReportSummary,
  updateDashboards,
  setDashboardVisibility,
  setVehicleClearCallback,
} from "./tables.js";

// This file is an ES module, so its variables stay scoped here by default.

// =============================================================================
// VALIDATION PATTERNS (Regular Expressions)
// =============================================================================
// These patterns define what formats are acceptable for each field.
// Regex is a way to match text patterns:
// - /pattern/flags: Standard syntax
// - ^ means "start of string"
// - $ means "end of string"
// - \d means "any digit (0-9)"
// - [A-Z] means "any uppercase letter"
// - {...} means "repeat X to Y times"
// 
// Examples show what passes each validation:

// Phone: Uganda numbers starting with +256 or 0, followed by 7 and 8 digits
// Valid: +256712345678, 0712345678
// Invalid: 0712345, +25071234567890
const phoneRegex = /^(?:\+256|0)7\d{8}$/;
const nameRegex = /^[A-Z][a-z]+(?:\s[A-Z][a-z]+)+$/;
const plateRegex = /^U[A-Z0-9]{5,7}$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

// =============================================================================
// PARKING RATES BY VEHICLE TYPE
// =============================================================================
// These rates (in UGX) are multiplied by hours parked to calculate fees.
// Example: A car parked for 3 hours = 3 * 2000 = 6,000 UGX
//
// Pro tip for learners: This is a perfect place to add a UI for admins
// to adjust rates instead of hardcoding them!
  Car: 2000,
  Boda: 1000,
  Truck: 5000,
  Van: 2500,
};

// =============================================================================
// VALIDATION MESSAGES
// =============================================================================
// Group messages by form for easy maintenance and translation.
// Each message matches a specific validation rule.
// When validation fails, show the relevant message to the user.

const messages = {
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
// =============================================================================
// UTILITY FUNCTIONS - Small helpers that do one simple job
// =============================================================================

// DOM ACCESS: Shorthand for getting elements by ID
// Why: Saves typing document.getElementById over and over
  return document.getElementById(id);
}

// FORM DATA EXTRACTION: Convert form inputs into a JavaScript object
// Usage: const data = getFormData(myForm);
// Result: { fieldName: "value", anotherField: "another value" }
  return Object.fromEntries(new FormData(form).entries());
}

// MESSAGE DISPLAY: Show error or success messages to the user
// Uses CSS classes to style red (error) or green (success)
  const el = getEl(id);
  if (!el) return;
  el.textContent = message;
  el.classList.toggle("is-error", isError);
  el.classList.toggle("is-success", !isError && message.length > 0);
}

// CONVENIENCE WRAPPERS: Make calling showMessage() clearer
  showMessage(id, message, true);
}

function showSuccess(id, message) {
  showMessage(id, message, false);
}

// STRING FORMATTING: Clean up text for comparison and storage
// Example: "  john okello  " → "JOHN OKELLO"
  return value.trim().toUpperCase();
}

// DATE FORMATTING: Convert ISO dates to human-readable format
// Input: "2026-02-26T10:30:00.000Z"
// Output: "2/26/2026, 10:30:00 AM"
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString();
}

// VALIDATION FUNCTIONS: Each checks ONE specific rule
// Return true/false so they're easy to test
  return nameRegex.test(name.trim());
}

function isValidPhone(phone) {
  return phoneRegex.test(phone.trim());
}

function isValidPlate(plate) {
  return plateRegex.test(plate);
}

function isStrongPassword(password) {
  return passwordRegex.test(password);
}

// RATE LOOKUP: Return parking rate for a vehicle type
// Default to 2000 if type not found (safe fallback)
  return rates[vehicleType] || 2000;
}

// TIME CALCULATION: Determine how many hours between two times
// Math: (departure - arrival) / 3600000 milliseconds per hour
// Math.ceil rounds UP so even 1 second = 1 hour charge
  const arrival = new Date(arrivalISO);
  const departure = new Date(departureISO);
  const diff = departure - arrival;
  return Math.max(1, Math.ceil(diff / 3600000));
}

// FEE CALCULATION: Combine hours and rate to get total fee
// Returns object with both hours and fee for detailed display
  const hours = getParkingHours(arrivalISO, departureISO);
  const rate = getRate(vehicleType);
  return { hours: hours, fee: hours * rate };
}
// =============================================================================
// SECTION NAVIGATION & ANIMATIONS
// =============================================================================
// The app is a single-page app that switches between form sections.
// Only one section is visible at a time.

// ANIMATION: Smooth fade-in effect when showing a new section
// Uses Motion library if available, otherwise just appears instantly
  if (!section) return;
  if (window.motion && window.motion.animate) {
    window.motion.animate(
      section,
      { opacity: [0, 1], transform: ["translateY(18px)", "translateY(0px)"] },
      { duration: 0.4, easing: "ease-out" }
    );
  }
}

// SECTION SWITCHER: Hide all form sections, show only the selected one
// Also updates the navigation buttons to highlight current section
// This is the CORE navigation logic for the app
  document.querySelectorAll(".form-section").forEach(function (section) {
    section.classList.remove("is-visible");
  });
  const section = getEl(targetId);
  if (section) {
    section.classList.add("is-visible");
    animateSection(section);
  }
  document.querySelectorAll(".nav-btn").forEach(function (btn) {
    btn.classList.toggle("is-active", btn.dataset.target === targetId);
  });
}

// SETUP NAV: Attach click handlers to all navigation buttons
// When clicked, each button shows its corresponding form section
  document.querySelectorAll(".nav-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      showSection(btn.dataset.target);
    });
  });
}
// =============================================================================
// RECEIPT MANAGEMENT HELPERS
// =============================================================================
// Receipts connect parking records to fees.
// These help populate and update receipt-related fields.

// RECEIPT NUMBER GENERATION: Create unique ID using timestamp
// Format: PRK-XXXXXX (last 6 digits of current timestamp)
  const number = `PRK-${Date.now().toString().slice(-6)}`;
  getEl("receipt-number").value = number;
}

// PLATE DROPDOWN: Populate the receipt dropdown with active vehicles only
// These haven't been signed out yet, meaning they're still parked
  const select = getEl("receipt-plate");
  if (!select) return;
  const vehicles = storageApi.getActiveVehicles();
  select.innerHTML = "<option value=\"\">Select plate</option>";
  vehicles.forEach(function (vehicle) {
    const option = document.createElement("option");
    option.value = vehicle.plate;
    option.textContent = vehicle.plate;
    select.appendChild(option);
  });
}

// AUTO-FILL RECEIPT: When user picks a plate, auto-fill arrival time and fee
// This prevents manual entry errors and speeds up the process
// Fee updates if user changes departure time
  const plate = getEl("receipt-plate").value;
  const arrivalField = getEl("receipt-arrival");
  const feeField = getEl("receipt-fee");
  if (!plate) {
    arrivalField.value = "";
    feeField.value = "";
    return;
  }
  const vehicle = storageApi.getVehicleByPlate(plate);
  if (!vehicle) return;
  arrivalField.value = formatDate(vehicle.arrival);
  const departure = getEl("receipt-departure").value;
  if (departure) {
    const result = calculateFee(vehicle.vehicleType, vehicle.arrival, departure);
    feeField.value = `${result.fee}`;
  }
}
// =============================================================================
// FORM SUBMISSION HANDLERS
// =============================================================================
// Each form has its own handler function.
// PATTERN:
// 1. Prevent default form submission (no page reload)
// 2. Extract user input from form
// 3. Validate each field
// 4. Show errors if validation fails (STOP here, don't save)
// 5. If valid, save to storage
// 6. Reset form
// 7. Show success message
// 8. Refresh tables to show new data
// 9. Show the data panel

// --------
// SIGNUP HANDLER: Create new user account
// Checks: Name format, unique username, unique email, phone format,
//         strong password, matching passwords
// --------
  event.preventDefault();
  const data = getFormData(signupForm);

  if (!isValidName(data.fullName)) {
    showError("signup-message", messages.signup.name);
    return;
  }
  if (storageApi.isUsernameTaken(data.username)) {
    showError("signup-message", messages.signup.usernameTaken);
    return;
  }
  if (storageApi.isEmailTaken(data.email)) {
    showError("signup-message", messages.signup.emailTaken);
    return;
  }
  if (!isValidPhone(data.phone)) {
    showError("signup-message", messages.signup.phone);
    return;
  }
  if (!isStrongPassword(data.password)) {
    showError("signup-message", messages.signup.password);
    return;
  }
  if (data.password !== data.confirmPassword) {
    showError("signup-message", messages.signup.confirm);
    return;
  }

  storageApi.saveUser({
    fullName: data.fullName.trim(),
    username: data.username.trim(),
    email: data.email.trim(),
    phone: data.phone.trim(),
    role: data.role,
    password: data.password,
    status: "Active",
    createdAt: new Date().toISOString(),
  });
  signupForm.reset();
  showSuccess("signup-message", messages.signup.success);
  renderUserTables();
  revealPanel("signup-panel");
  updateDashboards();
}

// LOGIN HANDLER: Authenticate user
// Checks: Username/email exists and password matches
// Stores session (temporary storage for login duration)
// Updates visible dashboards based on user role
  event.preventDefault();
  const data = getFormData(loginForm);
  if (!data.identity || !data.password) {
    showError("login-message", messages.login.required);
    return;
  }
  const user = storageApi.findUserByIdentity(data.identity);
  if (!user || user.password !== data.password) {
    showError("login-message", messages.login.invalid);
    return;
  }
  const session = {
    username: user.username,
    role: user.role,
    loggedInAt: new Date().toISOString(),
  };
  if (data.remember) {
    localStorage.setItem("pe_session", JSON.stringify(session));
  } else {
    sessionStorage.setItem("pe_session", JSON.stringify(session));
  }
  showSuccess("login-message", `Welcome back, ${user.fullName}.`);
  loginForm.reset();
  setDashboardVisibility(user.role);
  updateDashboards();
  revealPanel("login-panel");
}

// VEHICLE REGISTRATION HANDLER: Log vehicle arrival
// Checks: Valid driver name, plate format, phone, NIN (required for bodas)
// Stores: Arrival timestamp, vehicle details, and "not signed out" flag
// Trigger: Refreshes receipt plate options for later use
  event.preventDefault();
  const data = getFormData(vehicleForm);
  const plate = trimUpper(data.plate);

  if (!isValidName(data.driverName)) {
    showError("vehicle-message", messages.vehicle.name);
    return;
  }
  if (!isValidPlate(plate)) {
    showError("vehicle-message", messages.vehicle.plate);
    return;
  }
  if (!isValidPhone(data.phone)) {
    showError("vehicle-message", messages.vehicle.phone);
    return;
  }
  if (data.vehicleType === "Boda" && !data.nin.trim()) {
    showError("vehicle-message", messages.vehicle.nin);
    return;
  }

  storageApi.addVehicle({
    driverName: data.driverName.trim(),
    vehicleType: data.vehicleType,
    plate: plate,
    model: data.model.trim(),
    color: data.color.trim(),
    arrival: data.arrival,
    phone: data.phone.trim(),
    nin: data.nin.trim(),
    signedOut: false,
  });
  vehicleForm.reset();
  populateReceiptPlates();
  showSuccess("vehicle-message", messages.vehicle.success);
  renderVehicleTable();
  revealPanel("vehicle-panel");
  updateDashboards();
}

// RECEIPT HANDLER: Generate parking receipt
// Checks: Plate and departure time selected, vehicle exists, times valid
// Calculates: Hours parked and parking fee
// Stores: Receipt with reference number for later sign-out
  event.preventDefault();
  const data = getFormData(receiptForm);
  if (!data.plate || !data.departure) {
    showError("receipt-message", messages.receipt.required);
    return;
  }
  const vehicle = storageApi.getVehicleByPlate(data.plate);
  if (!vehicle) {
    showError("receipt-message", messages.receipt.missing);
    return;
  }
  const departure = new Date(data.departure);
  const arrival = new Date(vehicle.arrival);
  if (departure <= arrival) {
    showError("receipt-message", messages.receipt.timing);
    return;
  }

  const result = calculateFee(vehicle.vehicleType, vehicle.arrival, data.departure);

  storageApi.addReceipt({
    receiptNumber: data.receiptNumber,
    plate: vehicle.plate,
    vehicleType: vehicle.vehicleType,
    arrival: vehicle.arrival,
    departure: data.departure,
    hours: result.hours,
    fee: result.fee,
    createdAt: new Date().toISOString(),
  });

  showSuccess("receipt-message", messages.receipt.success);
  receiptForm.reset();
  fillReceiptNumber();
  populateReceiptPlates();
  renderReceiptTable();
  revealPanel("receipt-panel");
  updateDashboards();
}

// SIGN-OUT HANDLER: Record vehicle departure
// Checks: Valid phone, receipt number exists
// Result: Marks vehicle as "signed out" (no longer active)
// Stores: Who picked up the vehicle, when, and contact info
  event.preventDefault();
  const data = getFormData(signoutForm);
  if (!isValidPhone(data.phone)) {
    showError("signout-message", messages.signout.phone);
    return;
  }
  const receipt = storageApi.getReceiptByNumber(data.receiptNumber.trim());
  if (!receipt) {
    showError("signout-message", messages.signout.receipt);
    return;
  }
  storageApi.addSignoutRecord({
    receiverName: data.receiverName.trim(),
    receiptNumber: data.receiptNumber.trim(),
    signoutTime: data.signoutTime,
    phone: data.phone.trim(),
    gender: data.gender,
    nin: data.nin.trim(),
    plate: receipt.plate,
    fee: receipt.fee,
  });
  storageApi.markVehicleSignedOut(receipt.plate);
  signoutForm.reset();
  populateReceiptPlates();
  showSuccess("signout-message", messages.signout.success);
  renderSignoutTable();
  renderVehicleTable();
  revealPanel("signout-panel");
  updateDashboards();
}

// TYRE SERVICE HANDLER: Record tire work
// Uses dropdown to populate service fee automatically
// Maps: Pressure→3000, Puncture→5000, Valve→2000
  const priceMap = { Pressure: 3000, Puncture: 5000, Valve: 2000 };
  tyrePrice.value = event.target.value ? `${priceMap[event.target.value]}` : "";
}

// TYRE SUBMISSION: Save tyre service record
// Links service to vehicle plate for tracking
  event.preventDefault();
  const data = getFormData(tyreForm);
  const plate = trimUpper(data.plate);
  if (!isValidPlate(plate)) {
    showError("tyre-message", messages.tyre.plate);
    return;
  }
  storageApi.addTyreService({
    plate: plate,
    serviceType: data.serviceType,
    price: data.price,
    serviceTime: data.serviceTime,
    attendant: data.attendant.trim(),
  });
  tyreForm.reset();
  tyrePrice.value = "";
  showSuccess("tyre-message", messages.tyre.success);
  renderTyreTable();
  revealPanel("tyre-panel");
  updateDashboards();
}

// BATTERY HANDLER: Record battery sales/rentals
// Tracks transaction type (Sale/Hire) and model details
  event.preventDefault();
  const data = getFormData(batteryForm);
  const plate = trimUpper(data.plate);
  if (!isValidPlate(plate)) {
    showError("battery-message", messages.battery.plate);
    return;
  }
  storageApi.addBatteryRecord({
    plate: plate,
    transactionType: data.transactionType,
    model: data.model.trim(),
    price: Number(data.price),
    serviceTime: data.serviceTime,
    customer: data.customer.trim(),
  });
  batteryForm.reset();
  showSuccess("battery-message", messages.battery.success);
  renderBatteryTable();
  revealPanel("battery-panel");
  updateDashboards();
}

// USER MANAGEMENT HANDLER: Add new user (admin only)
// Different from signup - doesn't require all fields
// Admin assigns role and initial status directly
  event.preventDefault();
  const data = getFormData(userManagementForm);
  if (storageApi.isUsernameTaken(data.username)) {
    showError("user-management-message", messages.user.username);
    return;
  }
  if (storageApi.isEmailTaken(data.email)) {
    showError("user-management-message", messages.user.email);
    return;
  }
  if (!isStrongPassword(data.password)) {
    showError("user-management-message", messages.user.password);
    return;
  }
  storageApi.saveUser({
    fullName: data.username.trim(),
    username: data.username.trim(),
    email: data.email.trim(),
    phone: "",
    role: data.role,
    password: data.password,
    status: data.status,
    createdAt: new Date().toISOString(),
  });
  userManagementForm.reset();
  showSuccess("user-management-message", messages.user.success);
  renderUserTables();
  revealPanel("user-panel");
  updateDashboards();
}

// REPORT HELPER: Filter data by date
// Finds all records matching the selected date
  return items.filter(function (item) {
    return item[field].startsWith(selectedDate);
  });
}

// REPORT HANDLER: Generate daily summary report
// Calculates totals for:
//   - Parking fees (all vehicles)
//   - Tyre services (if selected)
//   - Battery transactions (if selected)
// Filters by date and section to show specific data
// Creates report ID and stores for historical tracking
  event.preventDefault();
  const data = getFormData(reportForm);

  const selectedDate = data.reportDate;
  if (!selectedDate) {
    showError("report-message", messages.report.required);
    return;
  }

  const receipts = filterByDate(storageApi.getReceipts(), "departure", selectedDate);
  const signouts = filterByDate(storageApi.getSignouts(), "signoutTime", selectedDate);
  const tyre = filterByDate(storageApi.getTyreServices(), "serviceTime", selectedDate);
  const battery = filterByDate(
    storageApi.getBatteryRecords(),
    "serviceTime",
    selectedDate
  );

  const totalParking = receipts.reduce(function (sum, receipt) {
    return sum + receipt.fee;
  }, 0);
  const totalTyre = tyre.reduce(function (sum, item) {
    return sum + Number(item.price);
  }, 0);
  const totalBattery = battery.reduce(function (sum, item) {
    return sum + Number(item.price);
  }, 0);

  const reportTotals = {
    parkingTotal: data.section === "Tyre" || data.section === "Battery" ? 0 : totalParking,
    tyreTotal: data.section === "Parking" || data.section === "Battery" ? 0 : totalTyre,
    batteryTotal: data.section === "Parking" || data.section === "Tyre" ? 0 : totalBattery,
  };
  const reportTotal =
    reportTotals.parkingTotal + reportTotals.tyreTotal + reportTotals.batteryTotal;

  const report = {
    id: `REP-${Date.now().toString().slice(-6)}`,
    date: selectedDate,
    section: data.section,
    parkingTotal: reportTotals.parkingTotal,
    tyreTotal: reportTotals.tyreTotal,
    batteryTotal: reportTotals.batteryTotal,
    total: reportTotal,
    createdAt: new Date().toISOString(),
  };

  storageApi.addReport(report);
  renderReportTable();
  setReportSummary(report);
  revealPanel("report-panel");
  showSuccess("report-message", messages.report.success);
  updateDashboards();
}
// =============================================================================
// DOM WIRING - Connect forms to their handlers
// =============================================================================
// This section gets all form elements and attaches event listeners.
// When a user submits a form, the corresponding handler function runs.
// This is how the app responses to user actions.

// Get references to all form elements
const signupForm = getEl("signup-form");
const loginForm = getEl("login-form");
const vehicleForm = getEl("vehicle-form");
const receiptForm = getEl("receipt-form");
const signoutForm = getEl("signout-form");
const tyreForm = getEl("tyre-form");
const tyrePrice = getEl("tyre-price");
const batteryForm = getEl("battery-form");
const userManagementForm = getEl("user-management-form");
const reportForm = getEl("report-form");

// Attach submit handlers to all forms
// event.preventDefault() stops page reload (essential for SPA)

signupForm.addEventListener("submit", handleSignupSubmit);
loginForm.addEventListener("submit", handleLoginSubmit);
vehicleForm.addEventListener("submit", handleVehicleSubmit);
receiptForm.addEventListener("submit", handleReceiptSubmit);
signoutForm.addEventListener("submit", handleSignoutSubmit);
getEl("tyre-service").addEventListener("change", handleTyreChange);
tyreForm.addEventListener("submit", handleTyreSubmit);
batteryForm.addEventListener("submit", handleBatterySubmit);
userManagementForm.addEventListener("submit", handleUserManagementSubmit);
reportForm.addEventListener("submit", handleReportSubmit);
// Listen to plate and departure changes to auto-update receipt fee

getEl("receipt-plate").addEventListener("change", updateReceiptFields);
getEl("receipt-departure").addEventListener("change", updateReceiptFields);

// Initialize the app on page load
// - Set up navigation buttons
// - Create first receipt number
// - Populate vehicle dropdown
// - Set up table rendering callback
// - Initialize all tables

setupNavigation();
fillReceiptNumber();
populateReceiptPlates();
setVehicleClearCallback(populateReceiptPlates);
initializeTables();