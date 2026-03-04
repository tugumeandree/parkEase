/**
 * ========================================
 * FORMS - INDEX (Main Entry Point)
 * ========================================
 * 
 * This file imports and initializes all form handlers.
 * 
 * By centralizing all form imports here, we keep the main index.html clean.
 * Instead of importing 9 separate form files, index.html imports this one file.
 * 
 * This is a TEACHING PATTERN showing how to organize module initialization:
 * 1. Import all setup functions
 * 2. Create main initialization function
 * 3. Export single initialization point
 * 4. Call once on page load
 * 
 * LEARNING BENEFIT:
 * - Shows barrel export pattern (aggregating multiple modules)
 * - Demonstrates module namespace organization
 * - Makes form structure visible in single location
 * - Easy to add/remove forms by editing imports here
 */

// Import all form setup functions
import { setupSignup } from './forms-signup.js';
import { setupLogin } from './forms-login.js';
import { setupVehicle } from './forms-vehicle.js';
import { setupReceipt } from './forms-receipt.js';
import { setupSignout } from './forms-signout.js';
import { setupTyre } from './forms-tyre.js';
import { setupBattery } from './forms-battery.js';
import { setupUserManagement } from './forms-user-management.js';
import { setupReport } from './forms-report.js';
import { initDataDashboard } from './forms-data-dashboard.js';
import { initAIInsights } from './forms-ai-insights.js';
import { setupNavigation } from './forms-utils.js';

/**
 * Initialize All Forms
 * 
 * This function is called once on page load (from index.html).
 * It sets up event listeners for all 9 forms that the application uses.
 * 
 * Each form's setup function attaches event listeners to its form element.
 * 
 * LEARNING PATTERN:
 * This demonstrates the initialization chain:
 * index.html → forms-index.js → individual form files → actual event handlers
 * 
 * Alternative patterns:
 * - Could use try/catch to handle errors gracefully
 * - Could log which forms were initialized (for debugging)
 * - Could return array of initialized forms for testing
 * 
 * Example logging pattern (if debugging):
 * const forms = [
 *   { name: "Signup", setup: setupSignup },
 *   { name: "Login", setup: setupLogin },
 *   ...
 * ];
 * forms.forEach(form => {
 *   console.log(`Initializing ${form.name} form...`);
 *   form.setup();
 * });
 */
export function initializeForms() {
  // Setup navigation first
  setupNavigation();
  
  // Authentication & User Management
  setupSignup();
  setupLogin();
  setupUserManagement();
  
  // Parking Management
  setupVehicle();
  setupReceipt();
  setupSignout();
  
  // Service Management
  setupTyre();
  setupBattery();
  
  // Reporting
  setupReport();
  
  // Data & AI Features
  initDataDashboard();
  initAIInsights();
  
  // All forms are now ready to receive user input
  console.log("✓ All forms initialized");
}

/**
 * ARCHITECTURE INSIGHT:
 * 
 * This file demonstrates dependency organization:
 * - Each form is INDEPENDENT (can be tested separately)
 * - Each form is AUTONOMOUS (setupX() handles all form setup)
 * - Each form is COMPOSABLE (can initialize in any order)
 * 
 * The initializeForms() function is the COMPOSITION POINT where
 * all independent modules are brought together.
 * 
 * This same pattern appears in enterprise applications:
 * - store/index.js (initializes all reducers)
 * - middlewares/index.js (sets up all middleware)
 * - routes/index.js (registers all route handlers)
 */
