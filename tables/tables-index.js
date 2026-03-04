/**
 * ========================================
 * TABLES - INDEX (Main Entry Point)
 * ========================================
 * 
 * This file imports all table renderers and orchestrates:
 * - Initial table rendering
 * - Clear data button handlers
 * - Dashboard restoration
 * 
 * By centralizing imports here, index.html stays clean.
 * Single import point: import { initializeTables } from './tables/tables-index.js'
 * 
 * TEACHING PATTERN:
 * Demonstrates how a complex module (947 lines originally)
 * is split into focused files, then orchestrated through a single entry point.
 */

import { storageApi } from '../storage.js';
import {
  getEl,
  revealPanel,
  updateDashboards,
  setDashboardVisibility,
  restoreSessionDashboard,
  setVehicleClearCallback,
  getVehicleClearCallback,
} from './tables-utils.js';

// Import all table renderers
import { renderUserTables } from './tables-signup.js';
import { renderVehicleTable } from './tables-vehicle.js';
import { renderReceiptTable } from './tables-receipt.js';
import { renderSignoutTable } from './tables-signout.js';
import { renderTyreTable } from './tables-tyre.js';
import { renderBatteryTable } from './tables-battery.js';
import {
  renderReportTable,
  setReportSummary,
  renderLatestReportSummary,
  clearReportSummary,
} from './tables-report.js';
import { initDataDashboardTable } from './tables-data-dashboard.js';

// ===========================================
// CLEAR DATA FUNCTIONS
// ===========================================
// These functions clear stored data and refresh tables

function clearUsersData() {
  storageApi.clearUsers();
  renderUserTables();
  updateDashboards();
}

function clearVehiclesData() {
  storageApi.clearVehicles();
  renderVehicleTable();
  const callback = getVehicleClearCallback();
  if (callback) {
    callback();
  }
  updateDashboards();
}

function clearReceiptsData() {
  storageApi.clearReceipts();
  renderReceiptTable();
  updateDashboards();
}

function clearSignoutsData() {
  storageApi.clearSignouts();
  renderSignoutTable();
  updateDashboards();
}

function clearTyreData() {
  storageApi.clearTyreServices();
  renderTyreTable();
  updateDashboards();
}

function clearBatteryData() {
  storageApi.clearBatteryRecords();
  renderBatteryTable();
  updateDashboards();
}

function clearReportsData() {
  storageApi.clearReports();
  renderReportTable();
  clearReportSummary();
  updateDashboards();
}

// ===========================================
// CLEAR BUTTON INITIALIZATION
// ===========================================
// Attach click handlers to all "clear data" buttons

function wireClearButtons() {
  const clearSignupBtn = getEl("clear-signup");
  const clearVehiclesBtn = getEl("clear-vehicles");
  const clearReceiptsBtn = getEl("clear-receipts");
  const clearSignoutsBtn = getEl("clear-signouts");
  const clearTyreBtn = getEl("clear-tyre");
  const clearBatteryBtn = getEl("clear-battery");
  const clearUsersBtn = getEl("clear-users");
  const clearReportsBtn = getEl("clear-reports");
  
  if (clearSignupBtn) clearSignupBtn.addEventListener("click", clearUsersData);
  if (clearVehiclesBtn) clearVehiclesBtn.addEventListener("click", clearVehiclesData);
  if (clearReceiptsBtn) clearReceiptsBtn.addEventListener("click", clearReceiptsData);
  if (clearSignoutsBtn) clearSignoutsBtn.addEventListener("click", clearSignoutsData);
  if (clearTyreBtn) clearTyreBtn.addEventListener("click", clearTyreData);
  if (clearBatteryBtn) clearBatteryBtn.addEventListener("click", clearBatteryData);
  if (clearUsersBtn) clearUsersBtn.addEventListener("click", clearUsersData);
  if (clearReportsBtn) clearReportsBtn.addEventListener("click", clearReportsData);
}

// ===========================================
// MAIN INITIALIZATION
// ===========================================

/**
 * Initialize all tables and charts
 * Called once on page load from index.html
 * 
 * Steps:
 * 1. Render all data tables
 * 2. Show latest report summary
 * 3. Update dashboard metrics
 * 4. Restore user session (show correct dashboard for logged-in user)
 * 5. Wire up clear data buttons
 */
export function initializeTables() {
  renderUserTables();
  renderVehicleTable();
  renderReceiptTable();
  renderSignoutTable();
  renderTyreTable();
  renderBatteryTable();
  renderReportTable();
  renderLatestReportSummary();
  updateDashboards();
  restoreSessionDashboard();
  wireClearButtons();
  
  // Initialize data dashboard and AI insights
  initDataDashboardTable();
  
  console.log("✓ All tables initialized");
}

// ===========================================
// EXPORTS FOR FORM HANDLERS
// ===========================================
// Forms import these to update tables after submission

/**
 * After a user signs up or is created, re-render user tables
 */
export function refreshUserTables() {
  renderUserTables();
  updateDashboards();
}

/**
 * After a vehicle is registered, re-render vehicle table
 */
export function refreshVehicleTable() {
  renderVehicleTable();
  updateDashboards();
}

/**
 * After a receipt is generated, re-render receipt table and update revenue
 */
export function refreshReceiptTable() {
  renderReceiptTable();
  updateDashboards();
}

/**
 * After a vehicle is signed out, re-render signout table
 */
export function refreshSignoutTable() {
  renderSignoutTable();
  updateDashboards();
}

/**
 * After a tyre service is recorded, re-render tyre table
 */
export function refreshTyreTable() {
  renderTyreTable();
  updateDashboards();
}

/**
 * After a battery transaction is recorded, re-render battery table
 */
export function refreshBatteryTable() {
  renderBatteryTable();
  updateDashboards();
}

/**
 * After a report is generated, re-render report table
 */
export function refreshReportTable() {
  renderReportTable();
  renderLatestReportSummary();
  updateDashboards();
}

/**
 * Export functions used by table renderers and other modules
 */
export {
  renderUserTables,
  renderVehicleTable,
  renderReceiptTable,
  renderSignoutTable,
  renderTyreTable,
  renderBatteryTable,
  renderReportTable,
  setReportSummary,
  setDashboardVisibility,
  updateDashboards,
  revealPanel,
  setVehicleClearCallback,
};
