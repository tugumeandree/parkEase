/**
 * ========================================
 * TABLES.JS - Data Display & Visualization
 * ========================================
 * 
 * PURPOSE:
 * This module renders tables and charts to display stored data.
 * It transforms raw data into visual formats that users can understand.
 * 
 * STRUCTURE:
 * 1. Chart setup - Initialize Chart.js for data visualization
 * 2. Utility functions - Format dates, numbers, build data maps
 * 3. Panel helpers - Control visibility of data panels
 * 4. Table rendering - Convert data to HTML table rows
 * 5. Chart rendering - Create pie charts, bar charts, line charts
 * 6. Table renderers - One function for each data type
 * 7. Dashboard updates - Show summary metrics by user role
 * 
 * KEY CONCEPTS FOR LEARNERS:
 * - Separation of Concerns: Data logic (storage.js) is separate from display (here)
 * - Template Functions: Create HTML dynamically from data
 * - Chart Library: Uses Chart.js to visualize data  
 * - Map/Filter: Transform arrays to get specific data
 * - Role-Based Visibility: Different users see different dashboards
 */

import { storageApi } from "./storage.js";

// This module handles tables, dashboards, and data panels.

// ========================================
// CHART MANAGEMENT
// ========================================
// Keep track of Chart.js instances so we can destroy old ones
// before creating new ones (prevents memory leaks)

const chartInstances = new Map();
const chartPalette = ["#c16a2b", "#6f7b3a", "#1f1c16", "#bfa07a", "#8e7d6a", "#a94a2a"];

// SHORTHAND: Get element by ID (used throughout this file)
function getEl(id) {
  return document.getElementById(id);
}

// FORMAT DATE: ISO format to human-readable (used in tables)
function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString();
}

// FORMAT MONEY: Add UGX currency prefix for display in tables
function formatUGX(value) {
  return `UGX ${value}`;
}

// EXTRACT DATE: Get just the date part from ISO string (YYYY-MM-DD)
// Used to group records by arrival/departure date
function getDateKey(dateValue) {
  if (!dateValue) return "";
  return dateValue.split("T")[0];
}

// RENDER CHART: Create or update a Chart.js chart on canvas
// Destroys old chart if exists (prevents duplicates)
// Only works if Chart.js library is loaded
function renderChart(canvasId, config) {
  if (!window.Chart) return;
  const canvas = getEl(canvasId);
  if (!canvas) return;

  const existing = chartInstances.get(canvasId);
  if (existing) {
    existing.destroy();
  }

  const chart = new window.Chart(canvas, config);
  chartInstances.set(canvasId, chart);
}

// BUILD COUNT MAP: Count occurrences of each value
// Example: Count vehicles by type {Car: 5, Boda: 3, ...}
function buildCountMap(items, keyFn) {
  const map = new Map();
  for (let i = 0; i < items.length; i += 1) {
    const key = keyFn(items[i]) || "Unknown";
    map.set(key, (map.get(key) || 0) + 1);
  }
  return map;
}

// BUILD SUM MAP: Sum numeric values grouped by key  
// Example: Sum revenue by date {2026-02-26: 45000, 2026-02-27: 52000}
function buildSumMap(items, keyFn, valueFn) {
  const map = new Map();
  for (let i = 0; i < items.length; i += 1) {
    const key = keyFn(items[i]) || "Unknown";
    const value = valueFn(items[i]);
    map.set(key, (map.get(key) || 0) + value);
  }
  return map;
}

// CONVERT MAP TO CHART DATA: Transform {key: value} map
// Returns {labels: [sorted keys], values: [corresponding values]}
// Sorted labels make charts consistent and readable
function mapToChartData(map) {
  const labels = Array.from(map.keys()).sort();
  const values = [];
  for (let i = 0; i < labels.length; i += 1) {
    values.push(map.get(labels[i]) || 0);
  }
  return { labels: labels, values: values };
}

// SHARED CHART OPTIONS: Common configuration for all charts
// Includes legend, tooltips, title, responsive sizing
function getSharedChartOptions(title) {
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
        ? {
            display: true,
            text: title,
          }
        : { display: false },
    },
  };
}
// ========================================
// DATA PANEL MANAGEMENT
// ========================================
// Panels show tables and charts after form submission

// Smooth animation when showing a data panel
function animatePanel(panel) {
  if (!panel) return;
  if (window.motion && window.motion.animate) {
    window.motion.animate(
      panel,
      { opacity: [0, 1], transform: ["translateY(12px)", "translateY(0px)"] },
      { duration: 0.35, easing: "ease-out" }
    );
  }
}

// Show a data panel with animation
// Sets aria-hidden to false for accessibility
export function revealPanel(panelId) {
  const panel = getEl(panelId);
  if (!panel) return;
  panel.classList.add("is-visible");
  panel.setAttribute("aria-hidden", "false");
  animatePanel(panel);
}
// ========================================
// TABLE RENDERING HELPERS
// ========================================
// Low-level functions that create table HTML from data arrays

// Get the <tbody> element where rows go
function getTableBody(tableId) {
  const table = getEl(tableId);
  if (!table) return null;
  return table.querySelector("tbody");
}

// Count columns in table header (needed for empty message spanning)
function getTableColumnCount(tableId) {
  const table = getEl(tableId);
  if (!table) return 0;
  return table.querySelectorAll("thead th").length;
}

// Show "no data" message when table is empty
// Spans across all columns so it's centered
function renderEmptyRow(tbody, columnCount, message) {
  const row = document.createElement("tr");
  row.classList.add("empty-row");
  const cell = document.createElement("td");
  cell.colSpan = columnCount;
  cell.textContent = message;
  row.appendChild(cell);
  tbody.appendChild(row);
}

// CORE TABLE RENDERING: Takes array of arrays and creates HTML table
// Each inner array = one row
// Each element in inner array = one cell
function setTableRows(tableId, rows, emptyMessage) {
  const tbody = getTableBody(tableId);
  if (!tbody) return;
  tbody.innerHTML = "";

  if (!rows.length) {
    renderEmptyRow(tbody, getTableColumnCount(tableId), emptyMessage);
    return;
  }

  for (let i = 0; i < rows.length; i += 1) {
    const rowData = rows[i];
    const row = document.createElement("tr");
    for (let j = 0; j < rowData.length; j += 1) {
      const cell = document.createElement("td");
      cell.textContent = rowData[j];
      row.appendChild(cell);
    }
    tbody.appendChild(row);
  }
}
// ========================================
// TABLE RENDERERS - Display specific data types
// ========================================
// Each function:
// 1. Gets data from storage
// 2. Transforms into row arrays  
// 3. Calls setTableRows to render
// 4. Renders any associated charts

// Render users from signup and user management
function renderUsersTable(tableId) {
  const users = storageApi.getUsers();
  const rows = [];

  for (let i = 0; i < users.length; i += 1) {
    const user = users[i];
    rows.push([
      user.fullName || "",
      user.username || "",
      user.email || "",
      user.role || "",
      user.status || "",
      formatDate(user.createdAt),
    ]);
  }

  setTableRows(tableId, rows, "No users yet.");
}

function renderUserCharts() {
  const users = storageApi.getUsers();
  const roleMap = buildCountMap(users, function (user) {
    return user.role || "Unknown";
  });
  const statusMap = buildCountMap(users, function (user) {
    return user.status || "Unknown";
  });

  const roleData = mapToChartData(roleMap);
  const statusData = mapToChartData(statusMap);

  renderChart("user-role-chart", {
    type: "pie",
    data: {
      labels: roleData.labels,
      datasets: [
        {
          data: roleData.values,
          backgroundColor: chartPalette,
        },
      ],
    },
    options: getSharedChartOptions("User roles"),
  });

  renderChart("user-status-chart", {
    type: "bar",
    data: {
      labels: statusData.labels,
      datasets: [
        {
          label: "Users",
          data: statusData.values,
          backgroundColor: "#c16a2b",
        },
      ],
    },
    options: getSharedChartOptions("Active vs inactive"),
  });
}

export function renderUserTables() {
  renderUsersTable("signup-table");
  renderUsersTable("user-table");
  renderUserCharts();
}

export function renderVehicleTable() {
  const vehicles = storageApi.getVehicles();
  const rows = [];

  for (let i = 0; i < vehicles.length; i += 1) {
    const vehicle = vehicles[i];
    rows.push([
      vehicle.driverName || "",
      vehicle.vehicleType || "",
      vehicle.plate || "",
      vehicle.model || "",
      vehicle.color || "",
      formatDate(vehicle.arrival),
      vehicle.phone || "",
      vehicle.nin || "",
      vehicle.signedOut ? "Signed Out" : "Active",
    ]);
  }

  setTableRows("vehicle-table", rows, "No vehicles registered yet.");
  renderVehicleCharts();
}

function renderVehicleCharts() {
  const vehicles = storageApi.getVehicles();
  const typeMap = new Map([
    ["Car", 0],
    ["Truck", 0],
    ["Van", 0],
    ["Boda", 0],
    ["Taxi", 0],
  ]);

  for (let i = 0; i < vehicles.length; i += 1) {
    const key = vehicles[i].vehicleType || "Unknown";
    if (!typeMap.has(key)) {
      typeMap.set(key, 0);
    }
    typeMap.set(key, typeMap.get(key) + 1);
  }

  const typeLabels = ["Car", "Truck", "Van", "Boda", "Taxi"];
  const typeValues = [];
  for (let i = 0; i < typeLabels.length; i += 1) {
    typeValues.push(typeMap.get(typeLabels[i]) || 0);
  }

  const arrivalMap = buildCountMap(vehicles, function (vehicle) {
    return getDateKey(vehicle.arrival);
  });
  const arrivalData = mapToChartData(arrivalMap);

  renderChart("vehicle-type-chart", {
    type: "pie",
    data: {
      labels: typeLabels,
      datasets: [
        {
          data: typeValues,
          backgroundColor: chartPalette,
        },
      ],
    },
    options: getSharedChartOptions("Vehicle type distribution"),
  });

  renderChart("vehicle-arrivals-chart", {
    type: "bar",
    data: {
      labels: arrivalData.labels,
      datasets: [
        {
          label: "Arrivals",
          data: arrivalData.values,
          backgroundColor: "#6f7b3a",
        },
      ],
    },
    options: getSharedChartOptions("Arrivals per day"),
  });
}

export function renderReceiptTable() {
  const receipts = storageApi.getReceipts();
  const rows = [];

  for (let i = 0; i < receipts.length; i += 1) {
    const receipt = receipts[i];
    rows.push([
      receipt.receiptNumber,
      receipt.plate,
      receipt.vehicleType,
      formatDate(receipt.arrival),
      formatDate(receipt.departure),
      `${receipt.hours}`,
      formatUGX(receipt.fee),
    ]);
  }

  setTableRows("receipt-table", rows, "No receipts generated yet.");
  renderReceiptCharts();
}

function renderReceiptCharts() {
  const receipts = storageApi.getReceipts();
  const revenueMap = buildSumMap(receipts, function (receipt) {
    return getDateKey(receipt.departure);
  }, function (receipt) {
    return receipt.fee || 0;
  });
  const revenueData = mapToChartData(revenueMap);

  const typeMap = buildSumMap(receipts, function (receipt) {
    return receipt.vehicleType || "Unknown";
  }, function (receipt) {
    return receipt.fee || 0;
  });
  const typeData = mapToChartData(typeMap);

  renderChart("receipt-revenue-chart", {
    type: "line",
    data: {
      labels: revenueData.labels,
      datasets: [
        {
          label: "Revenue",
          data: revenueData.values,
          borderColor: "#c16a2b",
          backgroundColor: "rgba(193, 106, 43, 0.2)",
          fill: true,
          tension: 0.3,
        },
      ],
    },
    options: getSharedChartOptions("Parking revenue over time"),
  });

  renderChart("receipt-type-chart", {
    type: "bar",
    data: {
      labels: typeData.labels,
      datasets: [
        {
          label: "Fees",
          data: typeData.values,
          backgroundColor: "#6f7b3a",
        },
      ],
    },
    options: getSharedChartOptions("Fees by vehicle type"),
  });
}

export function renderSignoutTable() {
  const signouts = storageApi.getSignouts();
  const rows = [];

  for (let i = 0; i < signouts.length; i += 1) {
    const record = signouts[i];
    rows.push([
      record.receiptNumber,
      record.plate,
      record.receiverName,
      record.phone,
      record.gender,
      record.nin,
      formatDate(record.signoutTime),
      formatUGX(record.fee),
    ]);
  }

  setTableRows("signout-table", rows, "No sign-outs recorded yet.");
  renderSignoutCharts();
}

function renderSignoutCharts() {
  const signouts = storageApi.getSignouts();
  const receipts = storageApi.getReceipts();
  const receiptMap = new Map();
  for (let i = 0; i < receipts.length; i += 1) {
    receiptMap.set(receipts[i].receiptNumber, receipts[i]);
  }

  const departuresMap = buildCountMap(signouts, function (record) {
    return getDateKey(record.signoutTime);
  });
  const departuresData = mapToChartData(departuresMap);

  const bucketLabels = ["1-2 hrs", "3-4 hrs", "5-6 hrs", "7+ hrs"];
  const bucketCounts = [0, 0, 0, 0];

  for (let i = 0; i < signouts.length; i += 1) {
    const receipt = receiptMap.get(signouts[i].receiptNumber);
    if (!receipt) continue;
    const hours = receipt.hours || 0;
    if (hours <= 2) bucketCounts[0] += 1;
    else if (hours <= 4) bucketCounts[1] += 1;
    else if (hours <= 6) bucketCounts[2] += 1;
    else bucketCounts[3] += 1;
  }

  renderChart("signout-departures-chart", {
    type: "line",
    data: {
      labels: departuresData.labels,
      datasets: [
        {
          label: "Departures",
          data: departuresData.values,
          borderColor: "#1f1c16",
          backgroundColor: "rgba(31, 28, 22, 0.2)",
          fill: true,
          tension: 0.3,
        },
      ],
    },
    options: getSharedChartOptions("Departures per day"),
  });

  renderChart("signout-duration-chart", {
    type: "bar",
    data: {
      labels: bucketLabels,
      datasets: [
        {
          label: "Vehicles",
          data: bucketCounts,
          backgroundColor: "#c16a2b",
        },
      ],
    },
    options: getSharedChartOptions("Parking duration buckets"),
  });
}

export function renderTyreTable() {
  const services = storageApi.getTyreServices();
  const rows = [];

  for (let i = 0; i < services.length; i += 1) {
    const service = services[i];
    rows.push([
      service.plate,
      service.serviceType,
      formatUGX(service.price),
      formatDate(service.serviceTime),
      service.attendant,
    ]);
  }

  setTableRows("tyre-table", rows, "No tyre services recorded yet.");
  renderTyreCharts();
}

function renderTyreCharts() {
  const services = storageApi.getTyreServices();
  const typeMap = buildCountMap(services, function (service) {
    return service.serviceType || "Unknown";
  });
  const typeData = mapToChartData(typeMap);

  const revenueMap = buildSumMap(services, function (service) {
    return getDateKey(service.serviceTime);
  }, function (service) {
    return Number(service.price) || 0;
  });
  const revenueData = mapToChartData(revenueMap);

  renderChart("tyre-type-chart", {
    type: "pie",
    data: {
      labels: typeData.labels,
      datasets: [
        {
          data: typeData.values,
          backgroundColor: chartPalette,
        },
      ],
    },
    options: getSharedChartOptions("Tyre service types"),
  });

  renderChart("tyre-revenue-chart", {
    type: "bar",
    data: {
      labels: revenueData.labels,
      datasets: [
        {
          label: "Revenue",
          data: revenueData.values,
          backgroundColor: "#6f7b3a",
        },
      ],
    },
    options: getSharedChartOptions("Tyre revenue per day"),
  });
}

export function renderBatteryTable() {
  const records = storageApi.getBatteryRecords();
  const rows = [];

  for (let i = 0; i < records.length; i += 1) {
    const record = records[i];
    rows.push([
      record.plate,
      record.transactionType,
      record.model,
      formatUGX(record.price),
      formatDate(record.serviceTime),
      record.customer,
    ]);
  }

  setTableRows("battery-table", rows, "No battery transactions recorded yet.");
  renderBatteryCharts();
}

function renderBatteryCharts() {
  const records = storageApi.getBatteryRecords();
  const typeMap = buildCountMap(records, function (record) {
    return record.transactionType || "Unknown";
  });
  const typeData = mapToChartData(typeMap);

  const revenueMap = buildSumMap(records, function (record) {
    return getDateKey(record.serviceTime);
  }, function (record) {
    return Number(record.price) || 0;
  });
  const revenueData = mapToChartData(revenueMap);

  renderChart("battery-type-chart", {
    type: "bar",
    data: {
      labels: typeData.labels,
      datasets: [
        {
          label: "Transactions",
          data: typeData.values,
          backgroundColor: "#c16a2b",
        },
      ],
    },
    options: getSharedChartOptions("Hire vs sale"),
  });

  renderChart("battery-revenue-chart", {
    type: "line",
    data: {
      labels: revenueData.labels,
      datasets: [
        {
          label: "Revenue",
          data: revenueData.values,
          borderColor: "#1f1c16",
          backgroundColor: "rgba(31, 28, 22, 0.2)",
          fill: true,
          tension: 0.3,
        },
      ],
    },
    options: getSharedChartOptions("Battery revenue over time"),
  });
}

export function renderReportTable() {
  const reports = storageApi.getReports();
  const rows = [];

  for (let i = 0; i < reports.length; i += 1) {
    const report = reports[i];
    rows.push([
      report.date,
      report.section,
      formatUGX(report.parkingTotal),
      formatUGX(report.tyreTotal),
      formatUGX(report.batteryTotal),
      formatUGX(report.total),
    ]);
  }

  setTableRows("report-table", rows, "No reports generated yet.");
  renderReportCharts();
}

function renderReportCharts() {
  const signouts = storageApi.getSignouts();
  const tyre = storageApi.getTyreServices();
  const battery = storageApi.getBatteryRecords();
  const receipts = storageApi.getReceipts();

  const dateSet = new Set();
  const parkingMap = buildCountMap(signouts, function (record) {
    return getDateKey(record.signoutTime);
  });
  const tyreMap = buildCountMap(tyre, function (record) {
    return getDateKey(record.serviceTime);
  });
  const batteryMap = buildCountMap(battery, function (record) {
    return getDateKey(record.serviceTime);
  });

  parkingMap.forEach(function (_, key) {
    dateSet.add(key);
  });
  tyreMap.forEach(function (_, key) {
    dateSet.add(key);
  });
  batteryMap.forEach(function (_, key) {
    dateSet.add(key);
  });

  const labels = Array.from(dateSet).sort();
  const parkingCounts = [];
  const tyreCounts = [];
  const batteryCounts = [];

  for (let i = 0; i < labels.length; i += 1) {
    const key = labels[i];
    parkingCounts.push(parkingMap.get(key) || 0);
    tyreCounts.push(tyreMap.get(key) || 0);
    batteryCounts.push(batteryMap.get(key) || 0);
  }

  const revenueMap = buildSumMap(receipts, function (receipt) {
    return getDateKey(receipt.departure);
  }, function (receipt) {
    return receipt.fee || 0;
  });
  const tyreRevenueMap = buildSumMap(tyre, function (record) {
    return getDateKey(record.serviceTime);
  }, function (record) {
    return Number(record.price) || 0;
  });
  const batteryRevenueMap = buildSumMap(battery, function (record) {
    return getDateKey(record.serviceTime);
  }, function (record) {
    return Number(record.price) || 0;
  });

  const revenueLabelsSet = new Set();
  revenueMap.forEach(function (_, key) {
    revenueLabelsSet.add(key);
  });
  tyreRevenueMap.forEach(function (_, key) {
    revenueLabelsSet.add(key);
  });
  batteryRevenueMap.forEach(function (_, key) {
    revenueLabelsSet.add(key);
  });

  const revenueLabels = Array.from(revenueLabelsSet).sort();
  const totalRevenue = [];
  for (let i = 0; i < revenueLabels.length; i += 1) {
    const key = revenueLabels[i];
    const sum =
      (revenueMap.get(key) || 0) +
      (tyreRevenueMap.get(key) || 0) +
      (batteryRevenueMap.get(key) || 0);
    totalRevenue.push(sum);
  }

  renderChart("report-section-chart", {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Parking",
          data: parkingCounts,
          backgroundColor: "#c16a2b",
        },
        {
          label: "Tyre",
          data: tyreCounts,
          backgroundColor: "#6f7b3a",
        },
        {
          label: "Battery",
          data: batteryCounts,
          backgroundColor: "#1f1c16",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: { x: { stacked: true }, y: { stacked: true } },
      plugins: getSharedChartOptions("Section activity").plugins,
    },
  });

  renderChart("report-revenue-chart", {
    type: "line",
    data: {
      labels: revenueLabels,
      datasets: [
        {
          label: "Total Revenue",
          data: totalRevenue,
          borderColor: "#6f7b3a",
          backgroundColor: "rgba(111, 123, 58, 0.2)",
          fill: true,
          tension: 0.3,
        },
      ],
    },
    options: getSharedChartOptions("Total revenue trend"),
  });
}

export function setReportSummary(report) {
  const summary = getEl("report-summary");
  if (!summary) return;
  summary.innerHTML = `
    <strong>Latest Report:</strong>
    ${report.date} | ${report.section} | Total ${formatUGX(report.total)}
  `;
}

export function renderLatestReportSummary() {
  const reports = storageApi.getReports();
  if (!reports.length) return;
  setReportSummary(reports[reports.length - 1]);
}

function clearReportSummary() {
  const summary = getEl("report-summary");
  if (summary) {
    summary.innerHTML = "";
  }
}

// -------------------------
// Dashboard helpers
// -------------------------
function setText(id, value) {
  const el = getEl(id);
  if (el) {
    el.textContent = value;
  }
}

export function setDashboardVisibility(role) {
  const dashboards = [
    getEl("attendant-dashboard"),
    getEl("manager-dashboard"),
    getEl("admin-dashboard"),
  ];

  for (let i = 0; i < dashboards.length; i += 1) {
    if (dashboards[i]) {
      dashboards[i].classList.add("is-hidden");
    }
  }

  let targetId = "";
  if (role === "Attendant") targetId = "attendant-dashboard";
  if (role === "Manager") targetId = "manager-dashboard";
  if (role === "Admin") targetId = "admin-dashboard";

  const target = getEl(targetId);
  if (target) {
    target.classList.remove("is-hidden");
  } else {
    for (let i = 0; i < dashboards.length; i += 1) {
      if (dashboards[i]) {
        dashboards[i].classList.remove("is-hidden");
      }
    }
  }
}

export function updateDashboards() {
  const activeVehicles = storageApi.getActiveVehicles().length;
  const receipts = storageApi.getReceipts();
  const signouts = storageApi.getSignouts().length;
  const tyre = storageApi.getTyreServices();
  const battery = storageApi.getBatteryRecords();
  const users = storageApi.getUsers().length;
  const reports = storageApi.getReports().length;

  const parkingRevenue = receipts.reduce(function (sum, receipt) {
    return sum + receipt.fee;
  }, 0);
  const tyreRevenue = tyre.reduce(function (sum, record) {
    return sum + Number(record.price);
  }, 0);
  const batteryRevenue = battery.reduce(function (sum, record) {
    return sum + Number(record.price);
  }, 0);

  setText("attendant-active", `${activeVehicles}`);
  setText("attendant-receipts", `${receipts.length}`);
  setText("attendant-signouts", `${signouts}`);

  setText("manager-tyre", `${tyre.length}`);
  setText("manager-battery", `${battery.length}`);
  setText("manager-revenue", formatUGX(tyreRevenue + batteryRevenue));

  setText("admin-users", `${users}`);
  setText("admin-reports", `${reports}`);
  setText("admin-revenue", formatUGX(parkingRevenue + tyreRevenue + batteryRevenue));
}

function getSavedSession() {
  const sessionData =
    sessionStorage.getItem("pe_session") || localStorage.getItem("pe_session");
  if (!sessionData) return null;
  try {
    return JSON.parse(sessionData);
  } catch (error) {
    return null;
  }
}

export function restoreSessionDashboard() {
  const session = getSavedSession();
  if (!session) return;
  setDashboardVisibility(session.role);
  updateDashboards();
  revealPanel("login-panel");
}

// -------------------------
// Clear data handlers
// -------------------------
function clearUsersData() {
  storageApi.clearUsers();
  renderUserTables();
  updateDashboards();
}

function clearVehiclesData() {
  storageApi.clearVehicles();
  renderVehicleTable();
  if (vehicleClearCallback) {
    vehicleClearCallback();
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

let vehicleClearCallback = null;

export function setVehicleClearCallback(callback) {
  vehicleClearCallback = callback;
}

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
}
