# Project Explanation Guide: Corporate Bulk Gift Enquiry Portal

This document explains the "how" and "why" behind the project in simple terms, so you can easily present and explain it during your presentation.

---

## 🏗️ 1. Overall Architecture (The Big Picture)
The project is built using a modern **Three-Tier Architecture**:
1.  **Frontend (The Face):** Built with **React.js** (using Vite). This is what the users (admins, sales team, customers) see and interact with. It contains the forms, dashboards, and buttons.
2.  **Backend (The Brain):** Built with **Python and Flask**. This is where your business logic lives. It receives requests from the Frontend, processes them, talks to the Database, and sends back the result.
3.  **Database (The Memory):** Built with **MySQL**. It securely stores all the data: company details, enquiries, quotations, stock levels, and user uploads.

---

## 🔗 2. How Everything is Connected

**Frontend to Backend Connection:**
*   The connection happens via **RESTful APIs** (Application Programming Interfaces).
*   **Example:** When a user clicks "Submit" on the Enquiry Form (Frontend), the React code uses a tool (like `fetch` or `axios`) to send a package of data over the internet to a specific URL on the Backend (e.g., `http://localhost:5000/api/enquiries`).
*   The Backend (Flask) is listening on that URL. It catches the data, validates it, and runs SQL queries to save it into the MySQL database.
*   Once saved, the Backend sends a "Success" message back to the Frontend in JSON format, and the Frontend shows a green success popup to the user.

---

## 📑 3. How Each Feature & Page is Developed

Here is a breakdown of the major pages you built in React (`frontend/src/pages/`) and how they connect to the Flask Backend:

*   **Login & Dashboards (`LoginScreen`, `SalesDashboard`, `AdminDashboard`):**
    *   **Frontend:** Built using React components to show different views based on who logs in (Sales, Admin, Designer, Dispatch).
    *   **Backend Connection:** Calls the backend to fetch lists of tasks or enquiries specific to that role.
*   **Enquiry Form (`EnquiryForm.jsx`):**
    *   **Frontend:** A large React form that collects budget, branding needs, and corporate details.
    *   **Backend Connection:** Sends a `POST` request to the `/api/enquiries` route in Flask, which saves the data into the `companies` and `enquiries` tables.
*   **Workflow & Details (`WorkflowScreen`, `DetailPage`):**
    *   **Frontend:** Fetches a specific enquiry's timeline and details to show its current status (e.g., "Draft Quotation" -> "Approved").
    *   **Backend Connection:** Flask fetches data from the `workflow_history` table to build a timeline.
*   **Product Personalization & Design Approvals (`ProductPersonalizationManager`, `DesignApprovalTracker`):**
    *   **Frontend:** Allows uploading logos and adding custom messages to gifts. Tracks the back-and-forth approval process.
    *   **Backend Connection:** Uses Flask's file upload system (`/uploads` route) to save the physical logo images, and updates the `personalizations` and `design_approvals` tables.
*   **Inventory Management (`InventoryScreen`):**
    *   **Frontend:** A table showing stock levels, minimum stock, and reserved items.
    *   **Backend Connection:** Calls the `/api/inventory` Flask route. Flask queries the `inventory` table to check if there is enough stock before a bulk order is approved.
*   **Returns Management (`ReturnRequestPage`):**
    *   **Frontend:** Form for clients to request a return or replacement for damaged items.
    *   **Backend Connection:** Hits the `/api/returns` route and saves reasons and images to the `returns` table.
*   **Occasion Calendar (`OccasionCalendar`):**
    *   **Frontend:** A calendar view to track important corporate dates (like company anniversaries).
    *   **Backend Connection:** Fetches dates from the `occasions` table so the sales team knows when to pitch new gifts.

---

## 🗄️ 4. The Database Setup
*   The database is highly relational. We use **Foreign Keys** to connect everything.
*   **How it connects:** A company (in the `companies` table) gets an ID (e.g., ID = 1). When they make an enquiry, that enquiry is saved in the `enquiries` table with `company_id = 1`. This is how we know which enquiry belongs to which company without duplicating data.
*   The backend uses a file called `init_db.sql` to automatically create all 11 tables if they don't exist.

---

## 🚀 5. Deployment Points (How it goes live)
If the professor asks how you would put this on the internet, here are the simple points:
1.  **Frontend Deployment:** The React code is "built" into static HTML/CSS/JS files using the `npm run build` command. These files can be hosted on very fast platforms like **Vercel, Netlify, or AWS S3**.
2.  **Backend Deployment:** The Python Flask app needs a server to run constantly. You would host this on a platform like **Render, Heroku, or an AWS EC2 instance**.
3.  **Database Hosting:** You wouldn't host MySQL on your laptop. You would use a managed database service like **AWS RDS** or **PlanetScale**.
4.  **Environment Variables (.env):** When deployed, we don't hardcode passwords. We use `.env` files to securely pass database passwords and API keys to the backend.

---
**Summary for your presentation:** "We used React for a fast, interactive user interface. It communicates via REST APIs to our Python Flask backend, which orchestrates the business rules and securely stores all structured data in our MySQL relational database."
