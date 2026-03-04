/**
 * ========================================
 * FORMS - SIGNUP
 * ========================================
 * 
 * Handles user account creation with full validation.
 * This is a complete, standalone form handler.
 * 
 * For learners:
 * - See complete form pattern: validate → save → display
 * - Understand all validation checks
 * - Learn to work with user data
 * - Easy to duplicate for new forms
 */

import { 
  getEl, 
  getFormData, 
  showError, 
  showSuccess,
  generateUniqueId 
} from './forms-utils.js';

import { 
  isValidName, 
  isValidPhone, 
  isValidEmail,
  isStrongPassword, 
  passwordsMatch 
} from '../utils/utils-validation.js';

import { MESSAGES } from '../utils/utils-constants.js';
import { storageApi } from '../storage.js';
import { renderUserTables, revealPanel } from '../tables/tables-index.js';

/**
 * SIGNUP FORM HANDLER
 * Called when user submits the signup form
 * 
 * Process:
 * 1. Get form data
 * 2. Validate each field
 * 3. Check uniqueness (username, email)
 * 4. Save to storage
 * 5. Show success
 * 6. Refresh display
 * 7. Show data panel
 */
export function handleSignupSubmit(event) {
  event.preventDefault(); // Stop page reload
  
  const form = getEl("signup-form");
  const data = getFormData(form);
  const messageId = "signup-message";
  
  // ===============================
  // STEP 1: Validate name format
  // ===============================
  if (!isValidName(data.fullName)) {
    showError(messageId, MESSAGES.signup.name);
    return; // Stop here, don't save
  }
  
  // ===============================
  // STEP 2: Check username unique
  // ===============================
  if (storageApi.isUsernameTaken(data.username)) {
    showError(messageId, MESSAGES.signup.usernameTaken);
    return;
  }
  
  // ===============================
  // STEP 3: Check email unique
  // ===============================
  if (storageApi.isEmailTaken(data.email)) {
    showError(messageId, MESSAGES.signup.emailTaken);
    return;
  }
  
  // ===============================
  // STEP 4: Validate phone format
  // ===============================
  if (!isValidPhone(data.phone)) {
    showError(messageId, MESSAGES.signup.phone);
    return;
  }
  
  // ===============================
  // STEP 5: Validate password strength
  // ===============================
  if (!isStrongPassword(data.password)) {
    showError(messageId, MESSAGES.signup.password);
    return;
  }
  
  // ===============================
  // STEP 6: Validate passwords match
  // ===============================
  if (!passwordsMatch(data.password, data.confirmPassword)) {
    showError(messageId, MESSAGES.signup.confirm);
    return;
  }
  
  // ===============================
  // STEP 7: All valid! Save user
  // ===============================
  const newUser = {
    id: generateUniqueId("USER"),
    fullName: data.fullName.trim(),
    username: data.username.trim(),
    email: data.email.trim(),
    phone: data.phone.trim(),
    role: data.role,
    password: data.password, // Note: In real app, hash this!
    status: "Active",
    createdAt: new Date().toISOString(),
  };
  
  storageApi.saveUser(newUser);
  
  // ===============================
  // STEP 8: Clear form & show success
  // ===============================
  form.reset();
  showSuccess(messageId, MESSAGES.signup.success);
  
  // ===============================
  // STEP 9: Refresh displays
  // ===============================
  renderUserTables();
  revealPanel("signup-panel");
}

/**
 * Setup this form on page load
 * Attach event listener to the form
 */
export function setupSignup() {
  const form = getEl("signup-form");
  if (form) {
    form.addEventListener("submit", handleSignupSubmit);
  }
}
