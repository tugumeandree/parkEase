/**
 * ========================================
 * FORMS - PARKING RECEIPT
 * ========================================
 * 
 * Generates parking receipt.
 * Calculates fees based on vehicle type and parking duration.
 */

import { 
  getEl, 
  getFormData, 
  showError, 
  showSuccess,
  generateUniqueId 
} from './forms-utils.js';

import { calculateFee } from '../utils/utils-calculate.js';
import { MESSAGES } from '../utils/utils-constants.js';
import { storageApi } from '../storage.js';
import { 
  renderReceiptTable, 
  revealPanel, 
  updateDashboards 
} from '../tables/tables-index.js';

/**
 * Auto-fill receipt fields when user selects a vehicle plate
 */
export function updateReceiptFields() {
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
  
  // Fill arrival time from vehicle record
  arrivalField.value = formatDate(vehicle.arrival);
  
  // Calculate fee if departure time set
  const departure = getEl("receipt-departure").value;
  if (departure) {
    const result = calculateFee(vehicle.vehicleType, vehicle.arrival, departure);
    feeField.value = result.fee;
  }
}

/**
 * Populate dropdown with active vehicles
 * Called when page loads and after each vehicle registration
 */
export function populateReceiptPlatesLocal() {
  const select = getEl("receipt-plate");
  if (!select) return;
  
  const vehicles = storageApi.getActiveVehicles();
  select.innerHTML = '<option value="">Select plate</option>';
  
  vehicles.forEach(vehicle => {
    const option = document.createElement("option");
    option.value = vehicle.plate;
    option.textContent = vehicle.plate;
    select.appendChild(option);
  });
}

/**
 * Generate unique receipt number
 */
export function fillReceiptNumber() {
  const number = generateUniqueId("PRK");
  getEl("receipt-number").value = number;
}

/**
 * RECEIPT FORM HANDLER
 * 
 * Process:
 * 1. Validate plate and departure selected
 * 2. Find vehicle
 * 3. Calculate fee
 * 4. Save receipt
 * 5. Refresh displays
 */
export function handleReceiptSubmit(event) {
  event.preventDefault();
  
  const form = getEl("receipt-form");
  const data = getFormData(form);
  const messageId = "receipt-message";
  
  // Check plate and departure selected
  if (!data.plate || !data.departure) {
    showError(messageId, MESSAGES.receipt.required);
    return;
  }
  
  // Find vehicle
  const vehicle = storageApi.getVehicleByPlate(data.plate);
  if (!vehicle) {
    showError(messageId, MESSAGES.receipt.missing);
    return;
  }
  
  // Validate timing
  const departure = new Date(data.departure);
  const arrival = new Date(vehicle.arrival);
  if (departure <= arrival) {
    showError(messageId, MESSAGES.receipt.timing);
    return;
  }
  
  // Calculate fee
  const result = calculateFee(vehicle.vehicleType, vehicle.arrival, data.departure);
  
  // Save receipt
  storageApi.addReceipt({
    id: generateUniqueId("RCP"),
    receiptNumber: data.receiptNumber,
    plate: vehicle.plate,
    vehicleType: vehicle.vehicleType,
    driverName: vehicle.driverName,
    arrival: vehicle.arrival,
    departure: data.departure,
    hours: result.hours,
    fee: result.fee,
    createdAt: new Date().toISOString(),
  });
  
  form.reset();
  fillReceiptNumber();
  populateReceiptPlatesLocal();
  
  showSuccess(messageId, MESSAGES.receipt.success);
  renderReceiptTable();
  revealPanel("receipt-panel");
  updateDashboards();
}

/**
 * Setup this form on page load
 */
export function setupReceipt() {
  const form = getEl("receipt-form");
  if (form) {
    form.addEventListener("submit", handleReceiptSubmit);
  }
  
  // Setup auto-fill when plate changes
  getEl("receipt-plate")?.addEventListener("change", updateReceiptFields);
  getEl("receipt-departure")?.addEventListener("change", updateReceiptFields);
  
  // Initialize form
  fillReceiptNumber();
  populateReceiptPlatesLocal();
}

// Helper: Format date (from tables)
function formatDate(isoString) {
  if (!isoString) return "";
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString();
}
