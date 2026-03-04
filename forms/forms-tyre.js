/**
 * ========================================
 * FORMS - TYRE CLINIC SERVICE
 * ========================================
 * 
 * Records tyre maintenance services.
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
import { TYRE_PRICES, MESSAGES } from '../utils/utils-constants.js';
import { storageApi } from '../storage.js';
import { 
  renderTyreTable, 
  revealPanel, 
  updateDashboards 
} from '../tables/tables-index.js';

/**
 * Auto-fill tyre price based on service type
 */
export function handleTyreServiceChange(event) {
  const tyreService = event.target.value;
  const priceField = getEl("tyre-price");
  priceField.value = TYRE_PRICES[tyreService] || "";
}

export function handleTyreSubmit(event) {
  event.preventDefault();
  
  const form = getEl("tyre-form");
  const data = getFormData(form);
  const messageId = "tyre-message";
  const plate = trimUpper(data.plate);
  
  // Validate plate
  if (!isValidPlate(plate)) {
    showError(messageId, MESSAGES.tyre.plate);
    return;
  }
  
  // Save service
  storageApi.addTyreService({
    id: generateUniqueId("TYR"),
    plate: plate,
    vehicleType: data.vehicleType,
    serviceType: data.serviceType,
    price: Number(data.price),
    serviceTime: data.serviceTime,
    attendant: data.attendant?.trim() || "",
  });
  
  form.reset();
  getEl("tyre-price").value = "";
  
  showSuccess(messageId, MESSAGES.tyre.success);
  renderTyreTable();
  revealPanel("tyre-panel");
  updateDashboards();
}

export function setupTyre() {
  const form = getEl("tyre-form");
  if (form) {
    form.addEventListener("submit", handleTyreSubmit);
  }
  
  getEl("tyre-service")?.addEventListener("change", handleTyreServiceChange);
}
