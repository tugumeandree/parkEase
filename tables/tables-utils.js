/**
 * ========================================
 * TABLES - UTILITIES
 * ========================================
 * 
 * Shared helper functions for all table renderers.
 * Demonstrates DRY principle: common logic extracted once.
 * 
 * This module handles:
 * - Chart management (Chart.js instances)
 * - Data formatting (dates, currency)
 * - Data aggregation (maps for grouping/summing)
 * - Table rendering (HTML generation from arrays)
 * - Dashboard display logic
 * 
 * LEARNING BENEFIT:
 * When multiple tables need the same functionality, extract to utilities.
 * This prevents copy-paste errors and makes updates easier.
 */

import { storageApi } from '../storage.js';

// ========================================
// CHART MANAGEMENT
// ========================================
// Keep track of Chart.js instances so we can destroy before creating new ones
// Prevents memory leaks from old chart objects

export const chartInstances = new Map();
export const chartPalette = [
  "#c16a2b", "#6f7b3a", "#1f1c16", 
  "#bfa07a", "#8e7d6a", "#a94a2a"
];

// ========================================
// DOM & FORMATTING UTILITIES
// ========================================

/**
 * Shorthand: Get element by ID
 * Used throughout this module instead of document.getElementById
 * More concise and readable
 */
export function getEl(id) {
  return document.getElementById(id);
}

/**
 * Format ISO datetime to human-readable string
 * Example: "2026-02-26T14:30:00Z" → "2/26/2026, 2:30:00 PM"
 * 
 * LEARNING PATTERN:
 * Date formatting is repeated in many places.
 * Extracted here so changing format is one change, not many.
 */
export function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString();
}

/**
 * Format number as currency with UGX prefix
 * Example: 5000 → "UGX 5000"
 * 
 * Future enhancement: could add thousand separators
 * (5000 → "UGX 5,000")
 */
export function formatUGX(value) {
  return `UGX ${value}`;
}

/**
 * Extract just the date portion (YYYY-MM-DD) from ISO datetime
 * Example: "2026-02-26T14:30:00Z" → "2026-02-26"
 * 
 * Used for grouping records by day (receipts by departure date, etc.)
 */
export function getDateKey(dateValue) {
  if (!dateValue) return "";
  return dateValue.split("T")[0];
}

// ========================================
// CHART RENDERING
// ========================================

/**
 * Create or update a Chart.js chart
 * 
 * IMPORTANT CONCEPT: Only one chart per canvas!
 * If chart exists, destroy it first (prevents duplicates in memory).
 * 
 * Chart.js reference: https://www.chartjs.org/docs
 */
export function renderChart(canvasId, config) {
  if (!window.Chart) return; // Chart.js library not loaded
  
  const canvas = getEl(canvasId);
  if (!canvas) return; // Canvas element not found in HTML
  
  // Destroy existing chart if present
  const existing = chartInstances.get(canvasId);
  if (existing) {
    existing.destroy();
  }
  
  // Create new chart
  const chart = new window.Chart(canvas, config);
  chartInstances.set(canvasId, chart);
}

/**
 * Options shared by all charts (responsive, legend, tooltip, title)
 * Called by individual table renderers to avoid duplication
 * 
 * PATTERN: Chart configuration centralized so styling is consistent
 */
export function getSharedChartOptions(title) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "bottom",
        labels: { boxWidth: 12, boxHeight: 12 },
      },
      tooltip: {
        enabled: true,
        mode: "index",
        intersect: false,
      },
      title: title
        ? { display: true, text: title }
        : { display: false },
    },
  };
}

// ========================================
// DATA AGGREGATION / MAP BUILDING
// ========================================

/**
 * Count occurrences of each unique value
 * 
 * Example: Count vehicles by type
 * vehicles = [{type: "Car"}, {type: "Boda"}, {type: "Car"}]
 * keyFn = (v) => v.type
 * Result: Map { "Car" → 2, "Boda" → 1 }
 * 
 * LEARNING CONCEPT: Functional programming (transform + aggregate)
 */
export function buildCountMap(items, keyFn) {
  const map = new Map();
  for (let i = 0; i < items.length; i += 1) {
    const key = keyFn(items[i]) || "Unknown";
    map.set(key, (map.get(key) || 0) + 1);
  }
  return map;
}

/**
 * Sum numeric values grouped by key
 * 
 * Example: Sum revenue by date
 * receipts = [{departure: "2026-02-26T...", fee: 10000}, ...]
 * keyFn = (r) => getDateKey(r.departure)
 * valueFn = (r) => r.fee
 * Result: Map { "2026-02-26" → 45000, "2026-02-27" → 52000 }
 * 
 * LEARNING: SAME PATTERN as buildCountMap, but sums instead of counts
 */
export function buildSumMap(items, keyFn, valueFn) {
  const map = new Map();
  for (let i = 0; i < items.length; i += 1) {
    const key = keyFn(items[i]) || "Unknown";
    const value = valueFn(items[i]);
    map.set(key, (map.get(key) || 0) + value);
  }
  return map;
}

/**
 * Transform Map into chart-ready data
 * 
 * Input: Map { "Car" → 5, "Boda" → 3, "Truck" → 2 }
 * Output: { labels: ["Boda", "Car", "Truck"], values: [3, 5, 2] }
 * 
 * Notice: Labels are SORTED for consistent appearance
 * Values correspond to sorted labels
 */
export function mapToChartData(map) {
  const labels = Array.from(map.keys()).sort();
  const values = [];
  for (let i = 0; i < labels.length; i += 1) {
    values.push(map.get(labels[i]) || 0);
  }
  return { labels: labels, values: values };
}

// ========================================
// TABLE RENDERING UTILITIES
// ========================================

/**
 * Get the <tbody> element where table rows go
 * Tables have structure: <table> → <thead>, <tbody>
 */
export function getTableBody(tableId) {
  const table = getEl(tableId);
  if (!table) return null;
  return table.querySelector("tbody");
}

/**
 * Count columns in table header
 * Needed when showing "no data" message to span all columns
 */
export function getTableColumnCount(tableId) {
  const table = getEl(tableId);
  if (!table) return 0;
  return table.querySelectorAll("thead th").length;
}

/**
 * Show "no data" message when table is empty
 * Creates full-width message row
 */
export function renderEmptyRow(tbody, columnCount, message) {
  const row = document.createElement("tr");
  row.classList.add("empty-row");
  const cell = document.createElement("td");
  cell.colSpan = columnCount;
  cell.textContent = message;
  row.appendChild(cell);
  tbody.appendChild(row);
}

/**
 * Core table rendering function
 * 
 * Takes 2D array (rows × columns) and creates HTML table
 * 
 * Example:
 * rows = [
 *   ["John", "john@email.com", "Admin"],
 *   ["Jane", "jane@email.com", "User"],
 * ]
 * 
 * Creates: <tr><td>John</td><td>john@email.com</td><td>Admin</td></tr> ...
 */
export function setTableRows(tableId, rows, emptyMessage) {
  const tbody = getTableBody(tableId);
  if (!tbody) return;
  
  tbody.innerHTML = ""; // Clear existing rows
  
  if (!rows.length) {
    renderEmptyRow(tbody, getTableColumnCount(tableId), emptyMessage);
    return;
  }
  
  // Create row for each data item
  for (let i = 0; i < rows.length; i += 1) {
    const rowData = rows[i];
    const row = document.createElement("tr");
    
    // Create cell for each column
    for (let j = 0; j < rowData.length; j += 1) {
      const cell = document.createElement("td");
      cell.textContent = rowData[j];
      row.appendChild(cell);
    }
    
    tbody.appendChild(row);
  }
}

// ========================================
// PANEL VISIBILITY
// ========================================

/**
 * Smooth animation when showing a data panel
 * Uses Motion API if available (advanced animation)
 */
export function animatePanel(panel) {
  if (!panel) return;
  if (window.motion && window.motion.animate) {
    window.motion.animate(
      panel,
      { 
        opacity: [0, 1], 
        transform: ["translateY(12px)", "translateY(0px)"] 
      },
      { duration: 0.35, easing: "ease-out" }
    );
  }
}

/**
 * Show a data panel with animation
 * Sets aria-hidden for accessibility
 */
export function revealPanel(panelId) {
  const panel = getEl(panelId);
  if (!panel) return;
  panel.classList.add("is-visible");
  panel.setAttribute("aria-hidden", "false");
  animatePanel(panel);
}

// ========================================
// DASHBOARD UTILITIES
// ========================================

/**
 * Set text content of dashboard metric element
 * Example: setText("attendant-active", "12") → element shows "12"
 */
export function setText(id, value) {
  const el = getEl(id);
  if (el) {
    el.textContent = value;
  }
}

/**
 * Control which dashboard is visible
 * Users see only dashboards for their role
 * 
 * PATTERN: Role-based UI visibility
 * TEACHING: Shows how applications handle different user permissions
 */
export function setDashboardVisibility(role) {
  const dashboards = [
    getEl("attendant-dashboard"),
    getEl("manager-dashboard"),
    getEl("admin-dashboard"),
  ];
  
  // Hide all dashboards first
  for (let i = 0; i < dashboards.length; i += 1) {
    if (dashboards[i]) {
      dashboards[i].classList.add("is-hidden");
    }
  }
  
  // Show dashboard for this role
  let targetId = "";
  if (role === "Attendant") targetId = "attendant-dashboard";
  if (role === "Manager") targetId = "manager-dashboard";
  if (role === "Admin") targetId = "admin-dashboard";
  
  const target = getEl(targetId);
  if (target) {
    target.classList.remove("is-hidden");
  } else {
    // If no matching role, show all dashboards
    for (let i = 0; i < dashboards.length; i += 1) {
      if (dashboards[i]) {
        dashboards[i].classList.remove("is-hidden");
      }
    }
  }
}

/**
 * Update all dashboard metrics
 * Called after data changes (new receipt, new sign-out, etc.)
 * 
 * Queries storage API for current totals and updates elements
 * This keeps dashboard synchronized with data
 */
export function updateDashboards() {
  const activeVehicles = storageApi.getActiveVehicles().length;
  const receipts = storageApi.getReceipts();
  const signouts = storageApi.getSignouts().length;
  const tyre = storageApi.getTyreServices();
  const battery = storageApi.getBatteryRecords();
  const users = storageApi.getUsers().length;
  const reports = storageApi.getReports().length;
  
  // Calculate revenues
  const parkingRevenue = receipts.reduce(function (sum, receipt) {
    return sum + receipt.fee;
  }, 0);
  const tyreRevenue = tyre.reduce(function (sum, record) {
    return sum + Number(record.price);
  }, 0);
  const batteryRevenue = battery.reduce(function (sum, record) {
    return sum + Number(record.price);
  }, 0);
  
  // Update Attendant dashboard
  setText("attendant-active", `${activeVehicles}`);
  setText("attendant-receipts", `${receipts.length}`);
  setText("attendant-signouts", `${signouts}`);
  
  // Update Manager dashboard
  setText("manager-tyre", `${tyre.length}`);
  setText("manager-battery", `${battery.length}`);
  setText("manager-revenue", formatUGX(tyreRevenue + batteryRevenue));
  
  // Update Admin dashboard
  setText("admin-users", `${users}`);
  setText("admin-reports", `${reports}`);
  setText(
    "admin-revenue", 
    formatUGX(parkingRevenue + tyreRevenue + batteryRevenue)
  );
}

/**
 * Get saved session from storage
 * Checks sessionStorage first (browser memory, cleared on close)
 * Falls back to localStorage (persistent)
 */
export function getSavedSession() {
  const sessionData =
    sessionStorage.getItem("pe_session") || 
    localStorage.getItem("pe_session");
  if (!sessionData) return null;
  try {
    return JSON.parse(sessionData);
  } catch (error) {
    return null;
  }
}

/**
 * Restore session state on page load
 * Shows correct dashboard for logged-in user
 */
export function restoreSessionDashboard() {
  const session = getSavedSession();
  if (!session) return;
  setDashboardVisibility(session.role);
  updateDashboards();
  revealPanel("login-panel");
}

// ========================================
// CLEAR DATA CALLBACKS
// ========================================

let vehicleClearCallback = null;

export function setVehicleClearCallback(callback) {
  vehicleClearCallback = callback;
}

export function getVehicleClearCallback() {
  return vehicleClearCallback;
}
