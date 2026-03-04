/**
 * ========================================
 * FORMS - DAILY REPORT
 * ========================================
 * 
 * Generates daily financial summaries.
 * Filters data by date and service type.
 */

import { 
  getEl, 
  getFormData, 
  showError, 
  showSuccess,
  generateUniqueId 
} from './forms-utils.js';

import { calculateReportSummary } from '../utils/utils-calculate.js';
import { MESSAGES } from '../utils/utils-constants.js';
import { storageApi } from '../storage.js';
import { 
  renderReportTable,
  setReportSummary,
  revealPanel, 
  updateDashboards 
} from '../tables/tables-index.js';

/**
 * Filter records by date
 */
function filterByDate(items, field, selectedDate) {
  if (!Array.isArray(items)) return [];
  return items.filter(item => 
    item[field]?.startsWith(selectedDate)
  );
}

export function handleReportSubmit(event) {
  event.preventDefault();
  
  const form = getEl("report-form");
  const data = getFormData(form);
  const messageId = "report-message";
  
  // Check date selected
  if (!data.reportDate) {
    showError(messageId, MESSAGES.report.required);
    return;
  }
  
  const selectedDate = data.reportDate;
  
  // Filter data for selected date
  const receipts = filterByDate(
    storageApi.getReceipts(), 
    "departure", 
    selectedDate
  );
  
  const signouts = filterByDate(
    storageApi.getSignouts(), 
    "signoutTime", 
    selectedDate
  );
  
  const tyreServices = filterByDate(
    storageApi.getTyreServices(), 
    "serviceTime", 
    selectedDate
  );
  
  const batteryRecords = filterByDate(
    storageApi.getBatteryRecords(), 
    "serviceTime", 
    selectedDate
  );
  
  // Calculate totals based on section filter
  let reportTotals = {
    parkingTotal: 0,
    tyreTotal: 0,
    batteryTotal: 0,
  };
  
  if (data.section === "All" || data.section === "Parking") {
    reportTotals.parkingTotal = receipts.reduce((sum, r) => sum + (r.fee || 0), 0);
  }
  
  if (data.section === "All" || data.section === "Tyre") {
    reportTotals.tyreTotal = tyreServices.reduce((sum, t) => sum + (t.price || 0), 0);
  }
  
  if (data.section === "All" || data.section === "Battery") {
    reportTotals.batteryTotal = batteryRecords.reduce((sum, b) => sum + (b.price || 0), 0);
  }
  
  const reportTotal = 
    reportTotals.parkingTotal + 
    reportTotals.tyreTotal + 
    reportTotals.batteryTotal;
  
  // Create report
  const report = {
    id: generateUniqueId("RPT"),
    date: selectedDate,
    section: data.section,
    parkingTotal: reportTotals.parkingTotal,
    tyreTotal: reportTotals.tyreTotal,
    batteryTotal: reportTotals.batteryTotal,
    total: reportTotal,
    parkingCount: data.section === "Parking" || data.section === "All" ? receipts.length : 0,
    tyreCount: data.section === "Tyre" || data.section === "All" ? tyreServices.length : 0,
    batteryCount: data.section === "Battery" || data.section === "All" ? batteryRecords.length : 0,
    createdAt: new Date().toISOString(),
  };
  
  // Save report
  storageApi.addReport(report);
  
  // Display results
  renderReportTable();
  setReportSummary(report);
  revealPanel("report-panel");
  showSuccess(messageId, MESSAGES.report.success);
  updateDashboards();
}

export function setupReport() {
  const form = getEl("report-form");
  if (form) {
    form.addEventListener("submit", handleReportSubmit);
  }
}
