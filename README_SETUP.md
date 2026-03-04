# ParkEase - Local Development Setup

## 🚨 Important: You MUST use a local server

Modern browsers block ES6 modules when opening HTML files directly (`file://` protocol) due to CORS security restrictions.

## Quick Start

### Option 1: Python Server (Recommended)
```bash
# In the parkEase folder, run:
python server.py
```
This will automatically open http://localhost:8000 in your browser.

### Option 2: Python Simple Server
```bash
python -m http.server 8000
```
Then open http://localhost:8000 in your browser.

### Option 3: Node.js (if you have it)
```bash
npx http-server -p 8000
```

### Option 4: VS Code Live Server Extension
1. Install "Live Server" extension in VS Code
2. Right-click [index.html](index.html) → "Open with Live Server"

## Testing the Application

Once the server is running:

1. **Sign Up** - Create a user account first
2. **Login** - Log in with your credentials
3. **Register Vehicles** - Add some vehicles
4. **Generate Receipts** - Create parking receipts
5. **Data Dashboard** - Now this will show all your data with charts
6. **AI Insights** - Test AI features (requires data to analyze)

## Common Issues

### "Data Dashboard is empty"
- Add data first! Register users, vehicles, and create receipts
- Click "Refresh Data" button on the dashboard

### "AI Insights not working"
- Make sure you're using a web server (see above)
- Check browser console (F12) for errors
- Verify config.js exists (see below)

### Module Errors
- Ensure you copied `config.example.js` to `config.js`
- If you see "Failed to load module", you're not using a web server

## API Configuration

The Hugging Face API key is configured in `config.js`:

```javascript
export const API_CONFIG = {
  HUGGING_FACE_API_KEY: 'your_key_here'
};
```

This file is git-ignored for security. A key is already configured for you.

## Project Structure

```
parkEase/
├── index.html          # Main page
├── config.js          # API keys (gitignored)
├── config.example.js  # Template for config
├── server.py          # Development server
├── forms/             # Form handlers
├── tables/            # Table renderers
├── styles/            # CSS files
└── utils/             # Utility functions
```
