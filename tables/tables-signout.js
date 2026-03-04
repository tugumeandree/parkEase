/**
 * ========================================
 * TABLES - SIGN-OUTS
 * ========================================
 * 
 * Renders table of vehicle sign-outs (departures).
 * Includes departures per day and parking duration analysis charts.
 */

import { storageApi } from '../storage.js';
import {
  setTableRows,
  formatDate,
  formatUGX,
  getDateKey,
  buildCountMap,
  mapToChartData,
  getSharedChartOptions,
  renderChart,
} from './tables-utils.js';

/**
 * Render sign-outs table
 * Displays: Receipt#, Plate, Receiver, Phone, Gender, NIN, Sign-out Time, Fee
 */
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

/**
 * Render sign-out charts
 * Shows: Line chart of departures per day, Bar chart of parking duration buckets
 */
function renderSignoutCharts() {
  const signouts = storageApi.getSignouts();
  const receipts = storageApi.getReceipts();
  
  // Map receipt numbers to receipt objects for hour lookup
  const receiptMap = new Map();
  for (let i = 0; i < receipts.length; i += 1) {
    receiptMap.set(receipts[i].receiptNumber, receipts[i]);
  }
  
  // Count departures by date
  const departuresMap = buildCountMap(signouts, function (record) {
    return getDateKey(record.signoutTime);
  });
  const departuresData = mapToChartData(departuresMap);
  
  // Analyze parking duration (group into buckets)
  // Bucket labels for grouping: 1-2 hrs, 3-4 hrs, 5-6 hrs, 7+ hrs
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
  
  // Render departures trend line chart
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
  
  // Render parking duration distribution bar chart
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
