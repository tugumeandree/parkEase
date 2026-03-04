/**
 * ========================================
 * FORMS - VEHICLE REGISTRATION
 * ========================================
 * 
 * Registers a vehicle arrival.
 * Must record before issuing parking receipt.
 */

import { 
  getEl, 
  getFormData, 
  showError, 
  showSuccess,
  trimUpper,
  generateUniqueId 
} from './forms-utils.js';

import { 
  isValidName, 
  isValidPhone, 
  isValidPlate,
  hasNIN 
} from '../utils/utils-validation.js';

import { MESSAGES } from '../utils/utils-constants.js';
import { storageApi } from '../storage.js';
import { 
  renderVehicleTable, 
  revealPanel, 
  updateDashboards 
} from '../tables/tables-index.js';
import { populateReceiptPlatesLocal } from './forms-receipt.js';

export function handleVehicleSubmit(event) {
  event.preventDefault();
  
  const form = getEl("vehicle-form");
  const data = getFormData(form);
  const messageId = "vehicle-message";
  const plate = trimUpper(data.plate);
  
  // Validate driver name
  if (!isValidName(data.driverName)) {
    showError(messageId, MESSAGES.vehicle.name);
    return;
  }
  
  // Validate plate
  if (!isValidPlate(plate)) {
    showError(messageId, MESSAGES.vehicle.plate);
    return;
  }
  
  // Validate phone
  if (!isValidPhone(data.phone)) {
    showError(messageId, MESSAGES.vehicle.phone);
    return;
  }
  
  // Validate NIN for bodas
  if (!hasNIN(data.nin, data.vehicleType)) {
    showError(messageId, MESSAGES.vehicle.nin);
    return;
  }
  
  // All valid - save vehicle
  storageApi.addVehicle({
    id: generateUniqueId("VEH"),
    driverName: data.driverName.trim(),
    vehicleType: data.vehicleType,
    plate: plate,
    model: data.model.trim(),
    color: data.color.trim(),
    arrival: data.arrival, // ISO date string
    phone: data.phone.trim(),
    nin: data.nin.trim(),
    signedOut: false, // Active vehicle
  });
  
  form.reset();
  showSuccess(messageId, MESSAGES.vehicle.success);
  
  // Refresh displays
  populateReceiptPlatesLocal(); // Update receipt dropdown with new vehicle
  renderVehicleTable();
  revealPanel("vehicle-panel");
  updateDashboards();
}

export function setupVehicle() {
  const form = getEl("vehicle-form");
  if (form) {
    form.addEventListener("submit", handleVehicleSubmit);
  }
}
