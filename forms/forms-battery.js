/**
 * ========================================
 * FORMS - BATTERY SERVICE
 * ========================================
 * 
 * Records battery sales and rentals.
 */

import { 
  getEl, 
  getFormData, 
  showError, 
  showSuccess,
  trimUpper,
  generateUniqueId 
} from './forms-utils.js';

import { isValidPlate } from '../utils/utils-validation.js';
import { MESSAGES } from '../utils/utils-constants.js';
import { storageApi } from '../storage.js';
import { 
  renderBatteryTable, 
  revealPanel, 
  updateDashboards 
} from '../tables/tables-index.js';

export function handleBatterySubmit(event) {
  event.preventDefault();
  
  const form = getEl("battery-form");
  const data = getFormData(form);
  const messageId = "battery-message";
  const plate = trimUpper(data.plate);
  
  // Validate plate
  if (!isValidPlate(plate)) {
    showError(messageId, MESSAGES.battery.plate);
    return;
  }
  
  // Save transaction
  storageApi.addBatteryRecord({
    id: generateUniqueId("BAT"),
    plate: plate,
    transactionType: data.transactionType,
    model: data.model?.trim() || "",
    price: Number(data.price),
    serviceTime: data.serviceTime,
    customer: data.customer?.trim() || "",
  });
  
  form.reset();
  showSuccess(messageId, MESSAGES.battery.success);
  
  renderBatteryTable();
  revealPanel("battery-panel");
  updateDashboards();
}

export function setupBattery() {
  const form = getEl("battery-form");
  if (form) {
    form.addEventListener("submit", handleBatterySubmit);
  }
}
