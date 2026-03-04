# ParkEase Student Projects 🚗
## Interactive Applications with JavaScript & DOM Manipulation

**Goal:** Choose ONE project as a group and BUILD an interactive web application that demonstrates core JavaScript concepts and DOM manipulation skills.

---

## Project 1: Build An Authentication System
**Group Size:** 2-3 students | **Difficulty:** ⭐ Medium

### Description:
Create a complete user authentication system with sign-up and login functionality. Users should be able to create accounts with validation, store credentials securely (using localStorage), and log in to access a personalized dashboard.

### Instructions:
- **Data Structure:** Design user objects with properties like `fullName`, `username`, `email`, `password`, and `role`
- **Create Sign-Up Form:** Build HTML form with input fields for name, username, email, password confirmation
- **Implement Validation:** 
  - Check password strength (minimum 8 characters, must include numbers)
  - Verify username/email uniqueness
  - Validate email format and phone number
- **Create Login Form:** Accept username or email with password verification
- **DOM Manipulation:**
  - Show/hide forms dynamically based on user state
  - Display error messages for failed validations
  - Create a welcome dashboard showing user's role and information
- **localStorage Integration:** Save user data and maintain login sessions
- **Bonus Features:** Add "Remember Me" checkbox, password reset link, user profile page

### Key JS Concepts:
- Object creation and manipulation
- Form validation with regex
- localStorage API
- Event listeners and handlers
- DOM manipulation (createElement, innerHTML, classList)
- Conditional rendering

---

## Project 2: Build A Parking Management System
**Group Size:** 3-4 students | **Difficulty:** ⭐⭐ Advanced

### Description:
Create a complete parking lot operations platform where attendants can register vehicle arrivals, issue parking receipts with auto-calculated fees, and process vehicle departures (sign-outs).

### Instructions:
- **Vehicle Registration Form:** Collect driver name, vehicle type, license plate, arrival time
- **Parking Receipt Generator:**
  - Calculate parking fees based on vehicle type and duration
  - Auto-fill vehicle details when plate is selected
  - Display receipt with unique receipt number
  - Show fee breakdown (hourly rate × hours parked)
- **Vehicle Sign-Out System:**
  - Link to parking receipts for validation
  - Record departure time and receiver information
  - Calculate final parking duration and fee
- **Data Management:**
  - Store all vehicles, receipts, and sign-outs in localStorage
  - Create dropdown menus that update dynamically as data changes
  - Implement search/filter by license plate
- **Display Tables:** Show history of all registered vehicles, receipts, and sign-outs with sorting
- **Bonus Features:** Receipt printing/export, penalty calculation for overstay, vehicle status tracking (active/departed)

### Key JS Concepts:
- Complex data structures (arrays of objects)
- Date/Time manipulation (duration calculation)
- Dynamic form population (auto-fill based on selection)
- Data filtering and searching
- Event delegation for dynamic content
- DOM table generation from data arrays
- localStorage for persistent data

---

## Project 3: Build A Service Management Platform
**Group Size:** 2-3 students | **Difficulty:** ⭐⭐ Advanced

### Description:
Create a service operations system for auxiliary services (Tyre Clinic and Battery Sales). Staff input service requests, track inventory, calculate pricing, and maintain service records.

### Instructions:
- **Tyre Clinic Form:** 
  - Input vehicle plate, service type (pressure, puncture, valve)
  - Auto-fill price based on service type
  - Record attendant name and service timestamp
- **Battery Sales/Rental Form:**
  - Input vehicle plate, transaction type (sale/rental)
  - Select battery model and enter price
  - Record customer name and transaction date
- **Service Records Display:**
  - Show table of all tyre services with totals
  - Show table of all battery transactions
  - Group by service type or date
- **Pricing Logic:**
  - Implement price lookup based on service/product selection
  - Calculate total revenue by service type
  - Show running totals in the form
- **Dynamic Pricing:** Create dropdown menus that update prices when selection changes
- **Bonus Features:** Service history by vehicle plate, staff performance dashboard, inventory tracking

### Key JS Concepts:
- Conditional logic for pricing decisions
- Dynamic dropdown population
- Event listeners for real-time calculations
- Array methods (filter, map, reduce) for analytics
- localStorage for service records
- Form manipulation and validation
- Table generation from arrays

---

## Project 4: Build A User Management Admin Panel
**Group Size:** 2 students | **Difficulty:** ⭐ Medium

### Description:
Create an admin interface for managing users in the system. Administrators should be able to create user accounts with different roles (Attendant, Manager, Admin), view all users, edit user details, and control access permissions.

### Instructions:
- **User Creation Form:**
  - Input fields: full name, username, email, password, role selection
  - Validate uniqueness of username and email
  - Confirm password matching
- **User List Display:**
  - Create table showing all users with columns: Name, Username, Email, Role, Status
  - Show user count summary
  - Color-code users by role
- **User Management Actions:**
  - Edit user role and status
  - Delete user (with confirmation modal)
  - Search/filter users by name, role, or status
- **Role-Based Display:**
  - Show different dashboards based on user roles
  - Restrict certain actions based on role permissions
- **Data Validation:** Ensure unique usernames/emails across all users
- **Bonus Features:** User activity log, bulk user import, user permissions matrix, deactivate vs delete

### Key JS Concepts:
- Array manipulation (add, edit, delete users)
- Object properties for user roles and permissions
- Conditional rendering based on roles
- Modal dialogs for confirmations
- Table sorting and filtering
- localStorage for user database
- String methods for searching

---

## Project 5: Build A Data Analytics & Reporting Dashboard
**Group Size:** 3-4 students | **Difficulty:** ⭐⭐⭐ Expert

### Description:
Create a comprehensive analytics dashboard that visualizes parking data, generates daily reports, calculates revenue by source, and displays trends using charts and statistics.

### Instructions:
- **Daily Report Generator:**
  - Filter data by date range
  - Calculate total vehicles, revenue by service (parking, tyre, battery)
  - Show signed-out vs still-parked vehicles
  - Display metrics in card format
- **Data Visualization:**
  - Create pie charts for revenue distribution (parking vs services)
  - Line chart showing revenue trends over time
  - Bar chart for vehicle types or service frequency
  - Use Chart.js library or D3.js
- **Statistics Display:**
  - Total parking revenue, average fee, peak hours
  - Service popularity (which services generated most revenue)
  - User performance (attendant with most transactions)
  - Vehicle type breakdown
- **Data Filtering:**
  - Filter by date range, service type, vehicle type
  - Export report as JSON or printing
- **Summary Cards:** Show KPIs (Key Performance Indicators) at dashboard top
- **Bonus Features:** Comparison between time periods, forecast trends, alert system for anomalies

### Key JS Concepts:
- Array methods (reduce, filter, map) for data aggregation
- Date/Time filtering and formatting
- Chart.js integration and configuration
- Calculated fields and metrics
- Data transformation for visualization
- DOM manipulation for dynamic cards
- localStorage queries and analysis

---

## Project 6: Build An AI-Powered Insights Assistant
**Group Size:** 2-3 students | **Difficulty:** ⭐⭐⭐ Expert

### Description:
Create an intelligent assistant that uses AI API calls to analyze parking data, provide natural language summaries, and classify information. This feature showcases integration with third-party AI services and dynamic content generation.

### Instructions:
- **AI Features to Implement:**
  1. **Receipt Summarization:** Generate AI summary of parking transactions
  2. **Feedback Analysis:** Analyze customer feedback sentiment (positive/negative)
  3. **Vehicle Classification:** AI-based vehicle type classification from description
- **API Integration:**
  - Set up Hugging Face API calls (or alternative AI service)
  - Handle API keys securely (localStorage or environment)
  - Manage async requests with promises/async-await
  - Display loading states while awaiting AI responses
- **Data Display:**
  - Show AI-generated summaries in readable format
  - Create sentiment pie chart (positive vs negative feedback)
  - Display classification results with confidence scores
- **User Interaction:**
  - Input forms for AI requests (describe vehicle, add feedback)
  - Buttons to trigger AI analysis
  - Error handling for API failures
- **Error Handling:** Gracefully handle API timeouts, rate limits, errors
- **Bonus Features:** Multi-language summaries, voice input for vehicle description, prompt optimization for better AI results

### Key JS Concepts:
- Fetch API and async/await
- Error handling (try/catch)
- Promise management
- Conditional rendering based on async states
- JSON parsing and data transformation
- DOM updates based on API responses
- LocalStorage for API key management
- Regular expressions for text processing
- Event listeners for user triggers

---

## 📋 Project Selection Guide

### How to Choose Your Project:

**Pick Project 1 (Authentication)** if your group:
- Is just learning JavaScript fundamentals
- Wants to practice forms and validation
- Needs a simpler scope to complete in limited time

**Pick Project 2 (Parking Management)** if your group:
- Wants to build a complete end-to-end feature
- Is comfortable with arrays and objects
- Wants real-world business logic

**Pick Project 3 (Service Management)** if your group:
- Likes working with pricing logic and calculations
- Wants to practice dynamic form updates
- Prefers working with multiple related forms

**Pick Project 4 (User Admin Panel)** if your group:
- Wants to practice CRUD operations (Create, Read, Update, Delete)
- Likes working with tables and lists
- Is interested in role-based access control

**Pick Project 5 (Analytics Dashboard)** if your group:
- Wants to create impressive visualizations
- Is comfortable with data aggregation and calculations
- Enjoys working with libraries like Chart.js
- Has time for a more complex project

**Pick Project 6 (AI Assistant)** if your group:
- Is excited about AI and APIs
- Is comfortable with async programming
- Wants to showcase cutting-edge features
- Has access to an API key for AI services

---

## 🎯 Deliverables (All Projects)

By the end of your project, deliver:

1. **HTML File:** Semantic structure with forms, tables, and display areas
2. **CSS File:** Professional styling with responsive design
3. **JavaScript File:** Well-organized code with:
   - Clear variable and function names
   - Comments explaining complex logic
   - Event listeners properly attached
   - Data stored in localStorage
4. **Working Demo:** Full functionality that can be tested in browser
5. **Documentation:**
   - README explaining how to use the application
   - List of JS concepts used
   - Challenges you faced and how you solved them
6. **Presentation (5-10 minutes):**
   - Demo the working application
   - Explain the JavaScript concepts used
   - Show your code structure
   - Discuss what you learned

---

## 💡 Tips for Success

✅ **Start with HTML structure** before writing JavaScript  
✅ **Use localStorage early** to persist data between page reloads  
✅ **Test frequently** as you add features  
✅ **Use console.log()** to debug data flow  
✅ **Comment your code** explaining the "why" not just the "what"  
✅ **Handle errors gracefully** with try/catch and user-friendly messages  
✅ **Keep functions small** and focused on one task  
✅ **Organize your code** with clear sections and consistent naming  

---

## 📚 Resources

- MDN Web Docs: https://developer.mozilla.org/
- JavaScript.info: https://javascript.info/
- Chart.js Docs: https://www.chartjs.org/
- Hugging Face API: https://huggingface.co/docs/api
- localStorage Reference: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage

**Good luck! Have fun building! 🚀**
