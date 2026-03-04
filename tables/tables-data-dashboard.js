/**
 * ========================================
 * DATA DASHBOARD TABLE RENDERER
 * ========================================
 * 
 * Renders all system data with charts and visualizations.
 */

import { getFormStorage } from '../storage.js';
import { formatCurrency } from '../utils/utils-format.js';

let usersChart = null;
let vehiclesChart = null;
let receiptsChart = null;

/**
 * Initialize data dashboard tables and charts
 */
export function initDataDashboardTable() {
  // Render on page load
  renderDashboard();
  
  // Listen for refresh events
  document.addEventListener('dashboardRefresh', function() {
    renderDashboard();
  });
  
  // Listen for any data changes from other forms
  document.addEventListener('dataUpdated', function() {
    renderDashboard();
  });
  
  console.log('✅ Data Dashboard Table initialized');
}

/**
 * Render complete dashboard
 */
function renderDashboard() {
  renderUsersData();
  renderVehiclesData();
  renderReceiptsData();
  renderRevenueData();
}

/**
 * Render users data table and chart
 */
function renderUsersData() {
  const users = getFormStorage('signup') || [];
  const tbody = document.querySelector('#dashboard-users-table tbody');
  
  if (!tbody) return;
  
  tbody.innerHTML = '';
  
  if (users.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No users registered yet</td></tr>';
    return;
  }
  
  users.forEach(function(u) {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${u.fullName || ''}</td>
      <td>${u.username || ''}</td>
      <td>${u.email || ''}</td>
      <td>${u.phone || ''}</td>
      <td>${u.role || ''}</td>
    `;
    tbody.appendChild(row);
  });
  
  // Create users by role chart
  const roleCounts = {};
  users.forEach(function(u) {
    const role = u.role || 'Unknown';
    roleCounts[role] = (roleCounts[role] || 0) + 1;
  });
  
  const ctx = document.getElementById('dashboard-users-chart');
  if (ctx) {
    if (usersChart) {
      usersChart.destroy();
    }
    
    usersChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: Object.keys(roleCounts),
        datasets: [{
          data: Object.values(roleCounts),
          backgroundColor: ['#4caf50', '#2196f3', '#ff9800', '#9c27b0']
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }
}

/**
 * Render vehicles data table and chart
 */
function renderVehiclesData() {
  const vehicles = getFormStorage('vehicle-registration') || [];
  const tbody = document.querySelector('#dashboard-vehicles-table tbody');
  
  if (!tbody) return;
  
  tbody.innerHTML = '';
  
  if (vehicles.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No vehicles registered yet</td></tr>';
    return;
  }
  
  vehicles.forEach(function(v) {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${v.driverName || ''}</td>
      <td>${v.vehicleType || ''}</td>
      <td>${v.numberPlate || ''}</td>
      <td>${v.arrivalTime || ''}</td>
    `;
    tbody.appendChild(row);
  });
  
  // Create vehicles by type chart
  const typeCounts = {};
  vehicles.forEach(function(v) {
    const type = v.vehicleType || 'Unknown';
    typeCounts[type] = (typeCounts[type] || 0) + 1;
  });
  
  const ctx = document.getElementById('dashboard-vehicles-chart');
  if (ctx) {
    if (vehiclesChart) {
      vehiclesChart.destroy();
    }
    
    vehiclesChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: Object.keys(typeCounts),
        datasets: [{
          label: 'Vehicle Count',
          data: Object.values(typeCounts),
          backgroundColor: '#2196f3'
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        }
      }
    });
  }
}

/**
 * Render receipts data table and chart
 */
function renderReceiptsData() {
  const receipts = getFormStorage('parking-receipt') || [];
  const tbody = document.querySelector('#dashboard-receipts-table tbody');
  
  if (!tbody) return;
  
  tbody.innerHTML = '';
  
  if (receipts.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No receipts issued yet</td></tr>';
    return;
  }
  
  receipts.forEach(function(r) {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${r.receiptNumber || ''}</td>
      <td>${r.vehiclePlate || ''}</td>
      <td>${formatCurrency(r.parkingFee || 0)}</td>
      <td>${r.receiptTime || ''}</td>
    `;
    tbody.appendChild(row);
  });
  
  // Create receipts trend chart
  const ctx = document.getElementById('dashboard-receipts-chart');
  if (ctx) {
    if (receiptsChart) {
      receiptsChart.destroy();
    }
    
    receiptsChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: receipts.map(function(r) { return r.receiptNumber || ''; }),
        datasets: [{
          label: 'Parking Fee',
          data: receipts.map(function(r) { return r.parkingFee || 0; }),
          borderColor: '#4caf50',
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }
}

/**
 * Render revenue summary
 */
function renderRevenueData() {
  const receipts = getFormStorage('parking-receipt') || [];
  const tyreServices = getFormStorage('tyre-clinic') || [];
  const batteryServices = getFormStorage('battery-service') || [];
  
  // Calculate totals
  let parkingRevenue = 0;
  receipts.forEach(function(r) {
    parkingRevenue += parseFloat(r.parkingFee) || 0;
  });
  
  let tyreRevenue = 0;
  tyreServices.forEach(function(t) {
    tyreRevenue += parseFloat(t.price) || 0;
  });
  
  let batteryRevenue = 0;
  batteryServices.forEach(function(b) {
    batteryRevenue += parseFloat(b.price) || 0;
  });
  
  // Update display
  const parkingEl = document.getElementById('dashboard-parking-revenue');
  const tyreEl = document.getElementById('dashboard-tyre-revenue');
  const batteryEl = document.getElementById('dashboard-battery-revenue');
  
  if (parkingEl) parkingEl.textContent = formatCurrency(parkingRevenue);
  if (tyreEl) tyreEl.textContent = formatCurrency(tyreRevenue);
  if (batteryEl) batteryEl.textContent = formatCurrency(batteryRevenue);
}
