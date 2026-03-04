/**
 * ========================================
 * TABLES - DAILY REPORTS
 * ========================================
 * 
 * Renders table of daily financial reports.
 * Includes section activity and revenue trend charts.
 */

import { storageApi } from '../storage.js';
import {
  setTableRows,
  formatUGX,
  getDateKey,
  buildCountMap,
  buildSumMap,
  mapToChartData,
  getSharedChartOptions,
  renderChart,
  getEl,
} from './tables-utils.js';

/**
 * Render reports table
 * Displays: Date, Section, Parking Total, Tyre Total, Battery Total, Grand Total
 */
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

/**
 * Render report charts
 * Shows: Stacked bar chart by section, Line chart of total revenue trend
 */
function renderReportCharts() {
  const signouts = storageApi.getSignouts();
  const tyre = storageApi.getTyreServices();
  const battery = storageApi.getBatteryRecords();
  const receipts = storageApi.getReceipts();
  
  // Collect all dates from all data types
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
  
  parkingMap.forEach(function (_, key) { dateSet.add(key); });
  tyreMap.forEach(function (_, key) { dateSet.add(key); });
  batteryMap.forEach(function (_, key) { dateSet.add(key); });
  
  // Sort dates and get counts for each section
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
  
  // Calculate revenue by date for each section
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
  
  // Combine all revenue dates
  const revenueLabelsSet = new Set();
  revenueMap.forEach(function (_, key) { revenueLabelsSet.add(key); });
  tyreRevenueMap.forEach(function (_, key) { revenueLabelsSet.add(key); });
  batteryRevenueMap.forEach(function (_, key) { revenueLabelsSet.add(key); });
  
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
  
  // Render stacked bar chart showing activity by section
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
      scales: { 
        x: { stacked: true }, 
        y: { stacked: true } 
      },
      plugins: getSharedChartOptions("Section activity").plugins,
    },
  });
  
  // Render revenue trend line chart
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

/**
 * Display latest report summary
 */
export function setReportSummary(report) {
  const summary = getEl("report-summary");
  if (!summary) return;
  summary.innerHTML = `
    <strong>Latest Report:</strong>
    ${report.date} | ${report.section} | Total ${formatUGX(report.total)}
  `;
}

/**
 * Show latest report summary on dashboard
 */
export function renderLatestReportSummary() {
  const reports = storageApi.getReports();
  if (!reports.length) return;
  setReportSummary(reports[reports.length - 1]);
}

/**
 * Clear report summary display
 */
export function clearReportSummary() {
  const summary = getEl("report-summary");
  if (summary) {
    summary.innerHTML = "";
  }
}
