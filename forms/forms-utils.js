/**
 * ========================================
 * FORMS - SHARED UTILITIES
 * ========================================
 * 
 * Helper functions used by all form handlers.
 * Keeps forms DRY (Don't Repeat Yourself).
 * 
 * For learners:
 * - See common form patterns
 * - Understand why we isolate helpers
 * - Learn to reuse code across forms
 * - Demonstrates: DRY principle and modularity
 */

/**
 * Get DOM element by ID (shorthand)
 * Used throughout forms to access elements
 */
export function getEl(id) {
  return document.getElementById(id);
}

/**
 * Extract form data into JavaScript object
 * Converts <form> inputs → { fieldName: value, ... }
 * 
 * How it works:
 * - FormData extracts all form fields automatically
 * - Object.fromEntries converts to simple object
 * - Easy to work with for validation and storage
 */
export function getFormData(form) {
  return Object.fromEntries(new FormData(form).entries());
}

/**
 * Display message to user (error or success)
 * Uses CSS classes to style visually
 * 
 * @param {string} elementId - ID of message element
 * @param {string} message - Text to show
 * @param {boolean} isError - True for error (red), false for success (green)
 */
export function showMessage(id, message, isError = false) {
  const el = getEl(id);
  if (!el) return;
  
  el.textContent = message;
  el.classList.remove("is-error", "is-success");
  
  if (message.length > 0) {
    el.classList.add(isError ? "is-error" : "is-success");
  }
}

/**
 * Convenience wrapper: Show error message (red)
 */
export function showError(id, message) {
  showMessage(id, message, true);
}

/**
 * Convenience wrapper: Show success message (green)
 */
export function showSuccess(id, message) {
  showMessage(id, message, false);
}

/**
 * String formatting: Trim whitespace and convert to UPPERCASE
 * Used for plate numbers, codes, etc.
 * 
 * Example: "  ubz1234  " → "UBZ1234"
 */
export function trimUpper(value) {
  return value.trim().toUpperCase();
}

/**
 * Normalize string for comparison
 * Removes leading/trailing spaces, converts to lowercase
 * Used for case-insensitive searches
 * 
 * Example: "  John Okello  " → "john okello"
 */
export function normalize(value) {
  return value.trim().toLowerCase();
}

/**
 * Setup navigation button click handlers
 * When user clicks nav button, show corresponding form
 * This is called once on page load to initialize all buttons
 */
export function setupNavigation() {
  const navButtons = document.querySelectorAll(".nav-btn");
  navButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetId = btn.dataset.target;
      showSection(targetId);
    });
  });
}

/**
 * Show one form section and hide others
 * Central point for switching between forms
 * Also updates active nav button
 * 
 * @param {string} targetId - ID of section to show
 */
export function showSection(targetId) {
  // Hide all sections
  document.querySelectorAll(".form-section").forEach(section => {
    section.classList.remove("is-visible");
  });
  
  // Show target section
  const section = getEl(targetId);
  if (section) {
    section.classList.add("is-visible");
    animateSection(section);
  }
  
  // Update active nav button
  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.classList.toggle("is-active", btn.dataset.target === targetId);
  });
}

/**
 * Smooth animation when showing section
 * Fades in and slides up
 */
export function animateSection(section) {
  if (!section) return;
  if (window.motion && window.motion.animate) {
    window.motion.animate(
      section,
      { 
        opacity: [0, 1], 
        transform: ["translateY(18px)", "translateY(0px)"] 
      },
      { 
        duration: 0.4, 
        easing: "ease-out" 
      }
    );
  }
}

/**
 * Get session data (logged-in user info)
 * Check both localStorage (remember me) and sessionStorage
 */
export function getSession() {
  const session = 
    localStorage.getItem("pe_session") || 
    sessionStorage.getItem("pe_session");
  return session ? JSON.parse(session) : null;
}

/**
 * Clear session data (logout)
 */
export function clearSession() {
  localStorage.removeItem("pe_session");
  sessionStorage.removeItem("pe_session");
}

/**
 * Check if user is logged in
 */
export function isLoggedIn() {
  return getSession() !== null;
}

/**
 * Get current user role
 * Returns role or null if not logged in
 */
export function getCurrentUserRole() {
  const session = getSession();
  return session ? session.role : null;
}

/**
 * Helper: Disable/enable form during submission
 * Used to prevent double-clicks
 * 
 * @param {HTMLFormElement} form - Form to disable
 * @param {boolean} disabled - True to disable, false to enable
 */
export function setFormDisabled(form, disabled = true) {
  const input = form.querySelector("button[type='submit']");
  if (input) {
    input.disabled = disabled;
    input.textContent = disabled ? "Loading..." : "Submit";
  }
}

/**
 * Generate unique ID
 * Used for receipts, reports, etc.
 * Format: PREFIX-TIMESTAMP
 * 
 * @param {string} prefix - "PRK", "REP", etc.
 * @returns {string} Unique ID
 */
export function generateUniqueId(prefix = "ID") {
  const timestamp = Date.now().toString().slice(-6);
  return `${prefix}-${timestamp}`;
}

/**
 * Format timestamp to readable string
 * Used for display in tables
 */
export function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleString();
}
