/**
 * ========================================
 * INDEX.JS - APPLICATION ENTRY POINT
 * ========================================
 * 
 * This file is imported by index.html and initializes the entire application.
 * It's the single point where both forms and tables are set up.
 * 
 * TEACHING PATTERN:
 * The "main" or "entry point" file demonstrates module orchestration.
 *
 * Import chain:
 * index.html → index.js → forms-index.js, tables-index.js
 *                              ↓
 *                     Individual form and table files
 */

import { initializeForms } from './forms/forms-index.js';
import { initializeTables } from './tables/tables-index.js';

/**
 * Initialize application on page load
 * 
 * Steps:
 * 1. Set up all form handlers (sign up, login, vehicle registration, etc.)
 * 2. Initialize all tables and dashboards
 */
function initializeApp() {
  console.log('🚀 Initializing ParkEase Application...');
  
  initializeForms();
  initializeTables();
  
  console.log('✅ Application initialized successfully');
}

// Run initialization when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  // DOM already loaded (script loaded late in document)
  initializeApp();
}

/**
 * ARCHITECTURE OVERVIEW:
 *
 * Before refactoring:
 * ├── index.html
 * ├── forms.js (603 lines)
 * ├── tables.js (947 lines)
 * ├── storage.js (243 lines)
 * └── style.css (414 lines)
 *
 * After refactoring:
 * ├── index.html
 * ├── index.js (THIS FILE - orchestration)
 * ├── forms/
 * │   ├── forms-index.js (imports + initializes all form files)
 * │   ├── forms-utils.js (shared form utilities)
 * │   ├── forms-signup.js (user registration)
 * │   ├── forms-login.js (authentication)
 * │   ├── forms-vehicle.js (vehicle registration)
 * │   ├── forms-receipt.js (parking receipt)
 * │   ├── forms-signout.js (vehicle departure)
 * │   ├── forms-tyre.js (tyre services)
 * │   ├── forms-battery.js (battery services)
 * │   ├── forms-user-management.js (admin user creation)
 * │   └── forms-report.js (daily reporting)
 * ├── tables/
 * │   ├── tables-index.js (imports + initializes all table files)
 * │   ├── tables-utils.js (shared table utilities)
 * │   ├── tables-signup.js (user table)
 * │   ├── tables-vehicle.js (vehicle registration table)
 * │   ├── tables-receipt.js (parking receipt table)
 * │   ├── tables-signout.js (sign-out records table)
 * │   ├── tables-tyre.js (tyre services table)
 * │   ├── tables-battery.js (battery records table)
 * │   └── tables-report.js (daily reports table)
 * ├── utils/
 * │   ├── utils-constants.js (configuration & messages)
 * │   ├── utils-validation.js (input validation functions)
 * │   ├── utils-format.js (data formatting functions)
 * │   └── utils-calculate.js (business logic calculations)
 * ├── styles/
 * │   ├── style.css (master imports all CSS modules)
 * │   ├── styles-variables.css (colors, spacing)
 * │   ├── styles-layout.css (page structure)
 * │   ├── styles-forms.css (form styling)
 * │   ├── styles-tables.css (table styling)
 * │   ├── styles-charts.css (chart containers)
 * │   ├── styles-dashboards.css (dashboard styling)
 * │   └── styles-responsive.css (mobile adjustments)
 * ├── storage.js (data persistence layer - unchanged)
 * └── index.html (updated to link new CSS and JS)
 */
