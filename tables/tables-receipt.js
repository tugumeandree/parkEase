/**
 * ========================================
 * TABLES - RECEIPTS
 * ========================================
 * 
 * Renders table of parking receipts.
 * Includes revenue over time and fees by vehicle type charts.
 */

import { storageApi } from '../storage.js';
import {
  setTableRows,
  formatDate,
  formatUGX,
  getDateKey,
  buildSumMap,
  mapToChartData,
  getSharedChartOptions,
  renderChart,
} from './tables-utils.js';

/**
 * Render receipts table
 * Displays: Receipt#, Plate, Type, Arrival, Departure, Hours, Fee
 */
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

/**
 * Render receipt charts
 * Shows: Line chart of revenue over time, Bar chart of fees by vehicle type
 */
function renderReceiptCharts() {
  const receipts = storageApi.getReceipts();
  
  // Sum revenue by departure date
  const revenueMap = buildSumMap(
    receipts,
    function (receipt) {
      return getDateKey(receipt.departure);
    },
    function (receipt) {
      return receipt.fee || 0;
    }
  );
  const revenueData = mapToChartData(revenueMap);
  
  // Sum fees by vehicle type
  const typeMap = buildSumMap(
    receipts,
    function (receipt) {
      return receipt.vehicleType || "Unknown";
    },
    function (receipt) {
      return receipt.fee || 0;
    }
  );
  const typeData = mapToChartData(typeMap);
  
  // Render revenue trend line chart
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
  
  // Render fees by vehicle type bar chart
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
