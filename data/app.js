// Load JSON data
fetch("parkease_data.json")
  .then(function(res) { return res.json(); })
  .then(function(data) {
    renderUsers(data.users);
    renderVehicles(data.vehicles);
    renderReceipts(data.receipts);
    renderSignouts(data.signouts);
    renderTyreServices(data.tyre_services);
    renderBatteryRecords(data.battery_records);
    renderReport(data.reports[0]);
  })
  .catch(function(err) { console.error("Error loading data:", err); });

// Users
function renderUsers(users) {
  const tbody = document.getElementById("usersTableBody");
  tbody.innerHTML = "";
  users.forEach(function(u) {
    tbody.innerHTML += `<tr>
      <td>${u.fullName}</td><td>${u.username}</td>
      <td>${u.email}</td><td>${u.phone}</td><td>${u.role}</td>
    </tr>`;
  });

  const roleCounts = {};
  users.forEach(function(u) { roleCounts[u.role] = (roleCounts[u.role] || 0) + 1; });

  new Chart(document.getElementById("usersChart"), {
    type: "pie",
    data: {
      labels: Object.keys(roleCounts),
      datasets: [{
        data: Object.values(roleCounts),
        backgroundColor: ["#4caf50","#2196f3","#ff9800"]
      }]
    }
  });
}

// Vehicles
function renderVehicles(vehicles) {
  const tbody = document.getElementById("vehiclesTableBody");
  tbody.innerHTML = "";
  vehicles.forEach(function(v) {
    tbody.innerHTML += `<tr>
      <td>${v.driverName}</td><td>${v.vehicleType}</td>
      <td>${v.numberPlate}</td><td>${v.arrivalTime}</td>
    </tr>`;
  });

  const typeCounts = {};
  vehicles.forEach(function(v) { typeCounts[v.vehicleType] = (typeCounts[v.vehicleType] || 0) + 1; });

  new Chart(document.getElementById("vehiclesChart"), {
    type: "bar",
    data: {
      labels: Object.keys(typeCounts),
      datasets: [{
        label:"Vehicle Types",
        data:Object.values(typeCounts),
        backgroundColor:"#2196f3"
      }]
    }
  });
}

// Receipts
function renderReceipts(receipts) {
  const tbody = document.getElementById("receiptsTableBody");
  tbody.innerHTML = "";
  receipts.forEach(function(r) {
    tbody.innerHTML += `<tr>
      <td>${r.receiptNo}</td><td>${r.vehiclePlate}</td>
      <td>${r.fee}</td><td>${r.timestamp}</td>
    </tr>`;
  });

  new Chart(document.getElementById("receiptsChart"), {
    type: "line",
    data: {
      labels: receipts.map(function(r) { return r.receiptNo; }),
      datasets: [{
        label:"Fees",
        data:receipts.map(function(r) { return r.fee; }),
        borderColor:"#4caf50",
        fill:false
      }]
    }
  });
}

// Signouts
function renderSignouts(signouts) {
  const tbody = document.getElementById("signoutsTableBody");
  tbody.innerHTML = "";
  signouts.forEach(function(s) {
    tbody.innerHTML += `<tr>
      <td>${s.signoutId}</td><td>${s.vehiclePlate}</td>
      <td>${s.receiverName}</td><td>${s.exitTime}</td>
    </tr>`;
  });
}

// Tyre Services
function renderTyreServices(services) {
  const tbody = document.getElementById("tyreTableBody");
  tbody.innerHTML = "";
  services.forEach(function(t) {
    tbody.innerHTML += `<tr>
      <td>${t.serviceId}</td><td>${t.vehiclePlate}</td>
      <td>${t.serviceType}</td><td>${t.price}</td>
      <td>${t.attendant}</td><td>${t.timestamp}</td>
    </tr>`;
  });

  const typeCounts = {};
  services.forEach(function(t) { typeCounts[t.serviceType] = (typeCounts[t.serviceType] || 0) + 1; });

  new Chart(document.getElementById("tyreChart"), {
    type: "pie",
    data: {
      labels:Object.keys(typeCounts),
      datasets:[{
        data:Object.values(typeCounts),
        backgroundColor:["#ff5722","#9c27b0","#03a9f4"]
      }]
    }
  });
}

// Battery Records
function renderBatteryRecords(records) {
  const tbody = document.getElementById("batteryTableBody");
  tbody.innerHTML = "";
  records.forEach(function(b) {
    tbody.innerHTML += `<tr>
      <td>${b.transactionId}</td><td>${b.transactionType}</td>
      <td>${b.batteryModel}</td><td>${b.price}</td>
      <td>${b.customerName}</td><td>${b.timestamp}</td>
    </tr>`;
  });

  const typeCounts = {};
  records.forEach(function(b) { typeCounts[b.transactionType] = (typeCounts[b.transactionType] || 0) + 1; });

  new Chart(document.getElementById("batteryChart"), {
    type: "bar",
    data: {
      labels:Object.keys(typeCounts),
      datasets:[{
        label:"Battery Transactions",
        data:Object.values(typeCounts),
        backgroundColor:"#ff9800"
      }]
    }
  });
}

// Reports
function renderReport(report) {
  const div = document.getElementById("reportSummary");
  div.innerHTML = `
    <h3>Daily Report (${report.reportDate})</h3>
    <p>Total Vehicles: ${report.totalVehicles}</p>
    <p>Signed Out Vehicles: ${report.signedOutVehicles}</p>
    <p>Parking Revenue: ${report.parkingRevenue}</p>
    <p>Tyre Revenue: ${report.tyreRevenue}</p>
    <p>Battery Revenue: ${report.batteryRevenue}</p>
    <p><strong>Total Revenue: ${report.totalRevenue}</strong></p>
  `;

  new Chart(document.getElementById("reportChart"), {
    type: "doughnut",
    data: {
      labels:["Parking","Tyre","Battery"],
      datasets:[{
        data:[report.parkingRevenue, report.tyreRevenue, report.batteryRevenue],
        backgroundColor:["#2196f3","#ff5722","#ff9800"]
      }]
    }
  });
}
