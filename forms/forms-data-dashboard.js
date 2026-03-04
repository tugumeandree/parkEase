/**
 * ========================================
 * DATA DASHBOARD FORM HANDLER
 * ========================================
 * 
 * Handles the refresh functionality for the data dashboard.
 * The dashboard displays all data from localStorage with visualizations.
 */

import { getFormStorage } from '../storage.js';

/**
 * Initialize data dashboard form handlers
 */
export function initDataDashboard() {
  const refreshBtn = document.getElementById('refresh-dashboard');
  
  if (refreshBtn) {
    refreshBtn.addEventListener('click', function() {
      // Trigger a custom event that tables can listen to
      const event = new CustomEvent('dashboardRefresh');
      document.dispatchEvent(event);
      
      // Show success message briefly
      const message = document.createElement('div');
      message.className = 'form-message success';
      message.textContent = '✓ Dashboard refreshed successfully';
      message.style.marginTop = '10px';
      refreshBtn.parentElement.appendChild(message);
      
      setTimeout(function() {
        message.remove();
      }, 2000);
    });
  }
  
  console.log('✅ Data Dashboard initialized');
}
