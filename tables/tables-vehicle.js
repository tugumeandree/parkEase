/**
 * ========================================
 * TABLES - VEHICLES
 * ========================================
 * 
 * Renders table of registered vehicles.
 * Includes vehicle type distribution and arrivals by date charts.
 */

import { storageApi } from '../storage.js';
import {
  setTableRows,
  formatDate,
  getDateKey,
  buildCountMap,
  mapToChartData,
  getSharedChartOptions,
  renderChart,
  chartPalette,
} from './tables-utils.js';

/**
 * Render vehicles table
 * Displays: Driver, Type, Plate, Model, Color, Arrival, Phone, NIN, Status
 */
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

/**
 * Render vehicle charts
 * Shows: Pie chart of vehicle types, Bar chart of arrivals per day
 */
function renderVehicleCharts() {
  const vehicles = storageApi.getVehicles();
  
  // Count vehicles by type (initialize with all known types)
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
  
  // Extract type labels and values in order
  const typeLabels = ["Car", "Truck", "Van", "Boda", "Taxi"];
  const typeValues = [];
  for (let i = 0; i < typeLabels.length; i += 1) {
    typeValues.push(typeMap.get(typeLabels[i]) || 0);
  }
  
  // Count arrivals by date
  const arrivalMap = buildCountMap(vehicles, function (vehicle) {
    return getDateKey(vehicle.arrival);
  });
  const arrivalData = mapToChartData(arrivalMap);
  
  // Render vehicle type distribution pie chart
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
  
  // Render daily arrivals bar chart
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
