/**
 * ========================================
 * TABLES - BATTERY TRANSACTIONS
 * ========================================
 * 
 * Renders table of battery service records.
 * Includes transaction type distribution and revenue charts.
 */

import { storageApi } from '../storage.js';
import {
  setTableRows,
  formatDate,
  formatUGX,
  getDateKey,
  buildCountMap,
  buildSumMap,
  mapToChartData,
  getSharedChartOptions,
  renderChart,
} from './tables-utils.js';

/**
 * Render battery transactions table
 * Displays: Plate, Type (Hire/Sale), Model, Price, Service Time, Customer
 */
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

/**
 * Render battery charts
 * Shows: Bar chart of hire vs sale, Line chart of revenue over time
 */
function renderBatteryCharts() {
  const records = storageApi.getBatteryRecords();
  
  // Count transaction types (Hire vs Sale)
  const typeMap = buildCountMap(records, function (record) {
    return record.transactionType || "Unknown";
  });
  const typeData = mapToChartData(typeMap);
  
  // Sum revenue by date
  const revenueMap = buildSumMap(
    records,
    function (record) {
      return getDateKey(record.serviceTime);
    },
    function (record) {
      return Number(record.price) || 0;
    }
  );
  const revenueData = mapToChartData(revenueMap);
  
  // Render transaction type distribution bar chart
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
  
  // Render revenue trend line chart
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
