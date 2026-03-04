/**
 * ========================================
 * FORMS - USER MANAGEMENT
 * ========================================
 * 
 * Admin form to add new users.
 * Different from signup (don't need all fields).
 */

import { 
  getEl, 
  getFormData, 
  showError, 
  showSuccess,
  generateUniqueId 
} from './forms-utils.js';

import { 
  isStrongPassword 
} from '../utils/utils-validation.js';

import { MESSAGES } from '../utils/utils-constants.js';
import { storageApi } from '../storage.js';
import { 
  renderUserTables, 
  revealPanel, 
  updateDashboards 
} from '../tables/tables-index.js';

export function handleUserManagementSubmit(event) {
  event.preventDefault();
  
  const form = getEl("user-management-form");
  const data = getFormData(form);
  const messageId = "user-management-message";
  
  // Check username unique
  if (storageApi.isUsernameTaken(data.username)) {
    showError(messageId, MESSAGES.user.username);
    return;
  }
  
  // Check email unique
  if (storageApi.isEmailTaken(data.email)) {
    showError(messageId, MESSAGES.user.email);
    return;
  }
  
  // Validate password
  if (!isStrongPassword(data.password)) {
    showError(messageId, MESSAGES.user.password);
    return;
  }
  
  // Save user
  storageApi.saveUser({
    id: generateUniqueId("USR"),
    fullName: data.username?.trim() || "",
    username: data.username?.trim(),
    email: data.email?.trim(),
    phone: "",
    role: data.role,
    password: data.password,
    status: data.status,
    createdAt: new Date().toISOString(),
  });
  
  form.reset();
  showSuccess(messageId, MESSAGES.user.success);
  
  renderUserTables();
  revealPanel("user-panel");
  updateDashboards();
}

export function setupUserManagement() {
  const form = getEl("user-management-form");
  if (form) {
    form.addEventListener("submit", handleUserManagementSubmit);
  }
}
