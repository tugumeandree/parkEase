// Example ParkEase receipts data
const receipts = [
  { receiptNo: "R001", vehiclePlate: "U1234", fee: 5000, timestamp: "2026-03-03 08:35" },
  { receiptNo: "R002", vehiclePlate: "U5678", fee: 8000, timestamp: "2026-03-03 08:50" },
  { receiptNo: "R003", vehiclePlate: "UBX999", fee: 2000, timestamp: "2026-03-03 09:05" }
];

// Example customer feedback
const feedback = [
  "The parking process was smooth and easy.",
  "I had to wait too long at the barrier.",
  "Great service from the attendants!"
];

// Render receipts table
const tbody = document.getElementById("receiptsTableBody");
receipts.forEach(r => {
  tbody.innerHTML += `
    <tr>
      <td>${r.receiptNo}</td>
      <td>${r.vehiclePlate}</td>
      <td>${r.fee}</td>
      <td>${r.timestamp}</td>
    </tr>`;
});

// Render feedback list
const feedbackList = document.getElementById("feedbackList");
feedback.forEach(f => {
  feedbackList.innerHTML += `<li>${f}</li>`;
});

// Hugging Face API call helper
function queryHuggingFace(model, inputs) {
  return fetch(`https://api-inference.huggingface.co/models/${model}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer DUMMY_HF_API_KEY" // dummy key for teaching
    },
    body: JSON.stringify({ inputs })
  }).then(res => res.json());
}

// Summarization use case
document.getElementById("summarizeBtn").addEventListener("click", () => {
  const textData = receipts.map(r =>
    `Receipt ${r.receiptNo}: Plate ${r.vehiclePlate}, Fee UGX ${r.fee}, Time ${r.timestamp}`
  ).join(". ");

  document.getElementById("aiSummary").innerText = "Summarizing receipts...";

  queryHuggingFace("facebook/bart-large-cnn", textData)
    .then(output => {
      if (output && output[0] && output[0].summary_text) {
        document.getElementById("aiSummary").innerText =
          "AI Summary: " + output[0].summary_text;
      } else {
        document.getElementById("aiSummary").innerText = "No summary returned.";
      }
    })
    .catch(err => {
      console.error(err);
      document.getElementById("aiSummary").innerText = "Error contacting Hugging Face API.";
    });

  // Chart.js bar chart of fees
  new Chart(document.getElementById("feesChart"), {
    type: "bar",
    data: {
      labels: receipts.map(r => r.receiptNo),
      datasets: [{
        label: "Fees (UGX)",
        data: receipts.map(r => r.fee),
        backgroundColor: "#2196f3"
      }]
    }
  });
});

// Sentiment analysis use case
document.getElementById("sentimentBtn").addEventListener("click", () => {
  document.getElementById("aiSentiment").innerText = "Analyzing feedback sentiment...";

  const textData = feedback.join(" | ");

  queryHuggingFace("distilbert-base-uncased-finetuned-sst-2-english", textData)
    .then(output => {
      document.getElementById("aiSentiment").innerText =
        "AI Sentiment Analysis: " + JSON.stringify(output);

      // For demo, count positive vs negative labels
      let positive = 0, negative = 0;
      if (Array.isArray(output)) {
        output.forEach(o => {
          if (o.label === "POSITIVE") positive++;
          if (o.label === "NEGATIVE") negative++;
        });
      }

      new Chart(document.getElementById("sentimentChart"), {
        type: "pie",
        data: {
          labels: ["Positive", "Negative"],
          datasets: [{
            data: [positive, negative],
            backgroundColor: ["#4caf50", "#f44336"]
          }]
        }
      });
    })
    .catch(err => {
      console.error(err);
      document.getElementById("aiSentiment").innerText = "Error contacting Hugging Face API.";
    });
});

// Vehicle classification use case
document.getElementById("classifyBtn").addEventListener("click", () => {
  const desc = document.getElementById("vehicleDesc").value;
  document.getElementById("aiVehicle").innerText = "Classifying vehicle...";

  queryHuggingFace("facebook/bart-large-mnli", desc)
    .then(output => {
      document.getElementById("aiVehicle").innerText =
        "AI Vehicle Classification: " + JSON.stringify(output);
    })
    .catch(err => {
      console.error(err);
      document.getElementById("aiVehicle").innerText = "Error contacting Hugging Face API.";
    });
});
