/**
 * ========================================
 * FORMS - VEHICLE SIGN-OUT
 * ========================================
 * 
 * Records vehicle departure.
 * Links to parking receipt for fee payment.
 */

import { 
  getEl, 
  getFormData, 
  showError, 
  showSuccess,
  generateUniqueId 
} from './forms-utils.js';

import { isValidPhone } from '../utils/utils-validation.js';
import { MESSAGES } from '../utils/utils-constants.js';
import { storageApi } from '../storage.js';
import { 
  renderSignoutTable, 
  renderVehicleTable,
  revealPanel, 
  updateDashboards 
} from '../tables/tables-index.js';
import { populateReceiptPlatesLocal } from './forms-receipt.js';

export function handleSignoutSubmit(event) {
  event.preventDefault();
  
  const form = getEl("signout-form");
  const data = getFormData(form);
  const messageId = "signout-message";
  
  // Validate phone
  if (!isValidPhone(data.phone)) {
    showError(messageId, MESSAGES.signout.phone);
    return;
  }
  
  // Find receipt
  const receipt = storageApi.getReceiptByNumber(data.receiptNumber?.trim());
  if (!receipt) {
    showError(messageId, MESSAGES.signout.receipt);
    return;
  }
  
  // Save signout record
  storageApi.addSignoutRecord({
    id: generateUniqueId("SOUT"),
    receiverName: data.receiverName?.trim() || "N/A",
    receiptNumber: data.receiptNumber?.trim(),
    signoutTime: data.signoutTime,
    phone: data.phone?.trim(),
    gender: data.gender,
    nin: data.nin?.trim() || "",
    plate: receipt.plate,
    fee: receipt.fee,
  });
  
  // Mark vehicle as signed out
  storageApi.markVehicleSignedOut(receipt.plate);
  
  form.reset();
  showSuccess(messageId, MESSAGES.signout.success);
  
  // Refresh displays
  populateReceiptPlatesLocal(); // Update receipt dropdown after sign-out
  renderSignoutTable();
  renderVehicleTable();
  revealPanel("signout-panel");
  updateDashboards();
}

export function setupSignout() {
  const form = getEl("signout-form");
  if (form) {
    form.addEventListener("submit", handleSignoutSubmit);
  }
}
