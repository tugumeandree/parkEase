/**
 * ========================================
 * FORMS - LOGIN
 * ========================================
 * 
 * Handles user authentication and session management.
 * Creates session after successful login.
 * 
 * For learners:
 * - Understand authentication flow
 * - Learn session management
 * - See role-based dashboard control
 */

import { 
  getEl, 
  getFormData, 
  showError, 
  showSuccess 
} from './forms-utils.js';

import { MESSAGES } from '../utils/utils-constants.js';
import { storageApi } from '../storage.js';
import { 
  setDashboardVisibility, 
  updateDashboards, 
  revealPanel 
} from '../tables/tables-index.js';

/**
 * LOGIN FORM HANDLER
 * 
 * Process:
 * 1. Check credentials exist
 * 2. Find user by username or email
 * 3. Verify password matches
 * 4. Create session
 * 5. Show role-specific dashboard
 */
export function handleLoginSubmit(event) {
  event.preventDefault();
  
  const form = getEl("login-form");
  const data = getFormData(form);
  const messageId = "login-message";
  
  // ================================
  // STEP 1: Check both fields filled
  // ================================
  if (!data.identity || !data.password) {
    showError(messageId, MESSAGES.login.required);
    return;
  }
  
  // ================================
  // STEP 2: Find user
  // ================================
  // User can login with username OR email
  const user = storageApi.findUserByIdentity(data.identity);
  
  // ================================
  // STEP 3: Verify password
  // ================================
  if (!user || user.password !== data.password) {
    showError(messageId, MESSAGES.login.invalid);
    return;
  }
  
  // ================================
  // STEP 4: Create session
  // ================================
  const session = {
    userId: user.id,
    username: user.username,
    fullName: user.fullName,
    role: user.role,
    loggedInAt: new Date().toISOString(),
  };
  
  // Store based on "remember me" checkbox
  if (data.remember) {
    // Long-term: localStorage (persists even after browser closes)
    localStorage.setItem("pe_session", JSON.stringify(session));
  } else {
    // Short-term: sessionStorage (cleared when browser closes)
    sessionStorage.setItem("pe_session", JSON.stringify(session));
  }
  
  // ================================
  // STEP 5: Show success
  // ================================
  showSuccess(messageId, `Welcome back, ${user.fullName}!`);
  form.reset();
  
  // ================================
  // STEP 6: Update dashboards
  // ================================
  // Show only dashboards for this user's role
  setDashboardVisibility(user.role);
  updateDashboards();
  revealPanel("login-panel");
}

/**
 * Setup this form on page load
 */
export function setupLogin() {
  const form = getEl("login-form");
  if (form) {
    form.addEventListener("submit", handleLoginSubmit);
  }
}
