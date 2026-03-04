/**
 * ========================================
 * TABLES - SIGNUP & USER MANAGEMENT
 * ========================================
 * 
 * Renders table of all users (created via signup or user management).
 * Includes user role and status distribution charts.
 */

import { storageApi } from '../storage.js';
import {
  setTableRows,
  formatDate,
  buildCountMap,
  mapToChartData,
  getSharedChartOptions,
  renderChart,
  chartPalette,
} from './tables-utils.js';

/**
 * Render users table
 * Displays: Full Name, Username, Email, Role, Status, Created Date
 */
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

/**
 * Render user distribution charts
 * Shows: Pie chart of roles, Bar chart of active/inactive status
 */
function renderUserCharts() {
  const users = storageApi.getUsers();
  
  // Count users by role
  const roleMap = buildCountMap(users, function (user) {
    return user.role || "Unknown";
  });
  const roleData = mapToChartData(roleMap);
  
  // Count users by status
  const statusMap = buildCountMap(users, function (user) {
    return user.status || "Unknown";
  });
  const statusData = mapToChartData(statusMap);
  
  // Render role distribution pie chart
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
  
  // Render status distribution bar chart
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
