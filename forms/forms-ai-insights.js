/**
 * ========================================
 * AI INSIGHTS FORM HANDLER
 * ========================================
 * 
 * Handles AI-powered features using Hugging Face API:
 * - Receipt summarization
 * - Sentiment analysis
 * - Vehicle classification
 */

import { getFormStorage } from '../storage.js';

import { API_CONFIG } from '../config.js';

// Store feedback in localStorage
const FEEDBACK_KEY = 'ai-feedback';
const API_KEY_STORAGE = 'ai-api-key';
// Default API key for students (provided by instructor)
const DEFAULT_API_KEY = API_CONFIG.HUGGING_FACE_API_KEY;

/**
 * Initialize AI insights handlers
 */
export function initAIInsights() {
  // API key management
  setupAPIKeyHandler();
  
  // Receipt summarization
  setupSummarization();
  
  // Sentiment analysis
  setupSentimentAnalysis();
  
  // Vehicle classification
  setupVehicleClassification();
  
  // Load existing feedback
  loadFeedback();
  
  console.log('✅ AI Insights initialized');
}

/**
 * Setup API key save handler
 */
function setupAPIKeyHandler() {
  const saveBtn = document.getElementById('ai-save-key-btn');
  const apiKeyInput = document.getElementById('ai-api-key');
  
  if (saveBtn && apiKeyInput) {
    // Load saved key or use default
    const savedKey = localStorage.getItem(API_KEY_STORAGE);
    if (savedKey) {
      apiKeyInput.value = savedKey;
    } else {
      // Pre-populate with default key for students
      apiKeyInput.value = DEFAULT_API_KEY;
      localStorage.setItem(API_KEY_STORAGE, DEFAULT_API_KEY);
    }
    
    saveBtn.addEventListener('click', function() {
      const key = apiKeyInput.value.trim();
      if (key) {
        localStorage.setItem(API_KEY_STORAGE, key);
        showMessage('✓ API key saved successfully', 'success');
      } else {
        showMessage('⚠ Please enter a valid API key', 'error');
      }
    });
  }
}

/**
 * Setup receipt summarization
 */
function setupSummarization() {
  const summarizeBtn = document.getElementById('ai-summarize-btn');
  
  if (summarizeBtn) {
    summarizeBtn.addEventListener('click', function() {
      const receipts = getFormStorage('parking-receipt') || [];
      
      if (receipts.length === 0) {
        showMessage('⚠ No receipts available to summarize. Please create some parking receipts first.', 'error');
        return;
      }
      
      // Create text from receipts
      const textData = receipts.map(function(r) {
        return `Receipt ${r.receiptNumber}: Plate ${r.vehiclePlate}, Fee UGX ${r.parkingFee}, Time ${r.receiptTime}`;
      }).join('. ');
      
      const resultDiv = document.getElementById('ai-summary-result');
      resultDiv.className = 'form-message';
      resultDiv.textContent = '🤖 Summarizing receipts with AI...';
      
      queryHuggingFace('facebook/bart-large-cnn', textData)
        .then(function(output) {
          if (output && output[0] && output[0].summary_text) {
            resultDiv.className = 'form-message success';
            resultDiv.textContent = '✓ AI Summary: ' + output[0].summary_text;
          } else {
            resultDiv.className = 'form-message error';
            resultDiv.textContent = '⚠ No summary returned. Response: ' + JSON.stringify(output);
          }
          
          // Update chart
          renderReceiptsChart(receipts);
        })
        .catch(function(err) {
          console.error(err);
          resultDiv.className = 'form-message error';
          resultDiv.textContent = '⚠ Error: ' + (err.message || 'Could not contact Hugging Face API. Please check your API key.');
        });
    });
  }
}

/**
 * Setup sentiment analysis
 */
function setupSentimentAnalysis() {
  const addFeedbackBtn = document.getElementById('ai-add-feedback-btn');
  const sentimentBtn = document.getElementById('ai-sentiment-btn');
  const feedbackInput = document.getElementById('ai-feedback-input');
  
  if (addFeedbackBtn && feedbackInput) {
    addFeedbackBtn.addEventListener('click', function() {
      const text = feedbackInput.value.trim();
      if (text) {
        addFeedback(text);
        feedbackInput.value = '';
        loadFeedback();
      } else {
        showMessage('⚠ Please enter some feedback text', 'error');
      }
    });
  }
  
  if (sentimentBtn) {
    sentimentBtn.addEventListener('click', function() {
      const feedback = getFeedback();
      
      if (feedback.length === 0) {
        showMessage('⚠ No feedback available. Please add some customer feedback first.', 'error');
        return;
      }
      
      const textData = feedback.join(' | ');
      const resultDiv = document.getElementById('ai-sentiment-result');
      resultDiv.className = 'form-message';
      resultDiv.textContent = '🤖 Analyzing feedback sentiment...';
      
      queryHuggingFace('distilbert-base-uncased-finetuned-sst-2-english', textData)
        .then(function(output) {
          resultDiv.className = 'form-message success';
          resultDiv.textContent = '✓ Analysis complete! Check the chart below.';
          
          // Render sentiment chart
          renderSentimentChart(output);
        })
        .catch(function(err) {
          console.error(err);
          resultDiv.className = 'form-message error';
          resultDiv.textContent = '⚠ Error: ' + (err.message || 'Could not contact Hugging Face API. Please check your API key.');
        });
    });
  }
}

/**
 * Setup vehicle classification
 */
function setupVehicleClassification() {
  const classifyBtn = document.getElementById('ai-classify-btn');
  const vehicleInput = document.getElementById('ai-vehicle-input');
  
  if (classifyBtn && vehicleInput) {
    classifyBtn.addEventListener('click', function() {
      const desc = vehicleInput.value.trim();
      
      if (!desc) {
        showMessage('⚠ Please enter a vehicle description', 'error');
        return;
      }
      
      const resultDiv = document.getElementById('ai-vehicle-result');
      resultDiv.className = 'form-message';
      resultDiv.textContent = '🤖 Classifying vehicle...';
      
      // Use zero-shot classification with vehicle types
      const candidateLabels = ['car', 'truck', 'motorcycle', 'van', 'bus'];
      const input = {
        inputs: desc,
        parameters: {
          candidate_labels: candidateLabels
        }
      };
      
      queryHuggingFace('facebook/bart-large-mnli', desc)
        .then(function(output) {
          resultDiv.className = 'form-message success';
          resultDiv.textContent = '✓ AI Classification: ' + JSON.stringify(output, null, 2);
        })
        .catch(function(err) {
          console.error(err);
          resultDiv.className = 'form-message error';
          resultDiv.textContent = '⚠ Error: ' + (err.message || 'Could not contact Hugging Face API. Please check your API key.');
        });
    });
  }
}

/**
 * Query Hugging Face API
 */
function queryHuggingFace(model, inputs) {
  // Get API key from storage, or use default
  let apiKey = localStorage.getItem(API_KEY_STORAGE);
  
  if (!apiKey) {
    apiKey = DEFAULT_API_KEY;
    localStorage.setItem(API_KEY_STORAGE, apiKey);
  }
  
  return fetch(`https://api-inference.huggingface.co/models/${model}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({ inputs: inputs })
  }).then(function(res) {
    if (!res.ok) {
      throw new Error(`API request failed: ${res.status} ${res.statusText}`);
    }
    return res.json();
  });
}

/**
 * Add feedback to storage
 */
function addFeedback(text) {
  const feedback = getFeedback();
  feedback.push(text);
  localStorage.setItem(FEEDBACK_KEY, JSON.stringify(feedback));
}

/**
 * Get feedback from storage
 */
function getFeedback() {
  const data = localStorage.getItem(FEEDBACK_KEY);
  return data ? JSON.parse(data) : [];
}

/**
 * Load and display feedback
 */
function loadFeedback() {
  const feedback = getFeedback();
  const feedbackList = document.getElementById('ai-feedback-list');
  
  if (feedbackList) {
    feedbackList.innerHTML = '';
    feedback.forEach(function(f) {
      const li = document.createElement('li');
      li.textContent = f;
      feedbackList.appendChild(li);
    });
  }
}

/**
 * Show temporary message
 */
function showMessage(text, type) {
  const message = document.createElement('div');
  message.className = `form-message ${type}`;
  message.textContent = text;
  message.style.marginTop = '10px';
  
  const panel = document.getElementById('ai-panel');
  if (panel) {
    panel.appendChild(message);
    setTimeout(function() {
      message.remove();
    }, 3000);
  }
}

/**
 * Render receipts chart
 */
function renderReceiptsChart(receipts) {
  const ctx = document.getElementById('ai-receipts-chart');
  if (!ctx) return;
  
  // Destroy existing chart
  const existingChart = Chart.getChart(ctx);
  if (existingChart) {
    existingChart.destroy();
  }
  
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: receipts.map(function(r) { return r.receiptNumber || ''; }),
      datasets: [{
        label: 'Fees (UGX)',
        data: receipts.map(function(r) { return r.parkingFee || 0; }),
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
          beginAtZero: true
        }
      }
    }
  });
}

/**
 * Render sentiment chart
 */
function renderSentimentChart(output) {
  const ctx = document.getElementById('ai-sentiment-chart');
  if (!ctx) return;
  
  // Destroy existing chart
  const existingChart = Chart.getChart(ctx);
  if (existingChart) {
    existingChart.destroy();
  }
  
  // Parse sentiment data
  let positive = 0;
  let negative = 0;
  
  if (Array.isArray(output)) {
    output.forEach(function(o) {
      if (o.label === 'POSITIVE') positive++;
      else if (o.label === 'NEGATIVE') negative++;
    });
  } else if (output && output.label) {
    if (output.label === 'POSITIVE') positive = 1;
    else if (output.label === 'NEGATIVE') negative = 1;
  }
  
  new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Positive', 'Negative'],
      datasets: [{
        data: [positive, negative],
        backgroundColor: ['#4caf50', '#f44336']
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
