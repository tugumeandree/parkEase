/**
 * ========================================
 * TABLES - TYRE SERVICES
 * ========================================
 * 
 * Renders table of tyre service records.
 * Includes service type distribution and revenue charts.
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
  chartPalette,
} from './tables-utils.js';

/**
 * Render tyre services table
 * Displays: Plate, Service Type, Price, Service Time, Attendant
 */
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

/**
 * Render tyre charts
 * Shows: Pie chart of service types, Bar chart of revenue per day
 */
function renderTyreCharts() {
  const services = storageApi.getTyreServices();
  
  // Count service types
  const typeMap = buildCountMap(services, function (service) {
    return service.serviceType || "Unknown";
  });
  const typeData = mapToChartData(typeMap);
  
  // Sum revenue by date
  const revenueMap = buildSumMap(
    services,
    function (service) {
      return getDateKey(service.serviceTime);
    },
    function (service) {
      return Number(service.price) || 0;
    }
  );
  const revenueData = mapToChartData(revenueMap);
  
  // Render service type distribution pie chart
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
  
  // Render daily revenue bar chart
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
