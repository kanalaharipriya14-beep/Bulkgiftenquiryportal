# Backend Developer Contributions & File Breakdown

As the backend developer on this project, your role was to build the "brain" and the "memory" of the application. You constructed the APIs that the frontend consumes, managed the database schema, and implemented the core business logic (like AI, email handling, and automation rules). 

If your professor asks: **"What was your exact contribution?"**, you can say:
> *"I designed the MySQL database architecture and built a scalable REST API using Python and Flask. I also engineered the background services, including integrating the Google Gemini AI for smart suggestions, the Gmail API for automated email dispatch, and a rule-based workflow engine to process enquiries automatically."*

Here is a breakdown of every backend file and what you built inside them:

---

## 1. Core Server & Configuration (`backend/`)
These files start the server, connect to the database, and handle security.

*   **`app.py`**: The entry point of your backend. You built this file to initialize the Flask server, enable CORS (so the React frontend can talk to it safely), and register all your API routes (blueprints).
*   **`config.py`**: You created this to securely manage environment variables (like Database passwords, Gemini API keys, and Email credentials) instead of hard-coding them.
*   **`db.py`**: You wrote the database connection manager. It uses `PyMySQL` to connect to MySQL, featuring connection pooling and a utility function (`execute_query()`) to safely run SQL statements and prevent SQL injection.
*   **`init_db.sql`**: You designed the entire database schema here. You wrote the SQL statements to create tables for companies, enquiries, quotations, inventory, and personalizations with proper foreign keys and timestamps.
*   **`auth_setup.py`**: A utility script you wrote to generate the initial OAuth `token.json` required to send emails via the Gmail API.

---

## 2. Business Logic & Services (`backend/services/`)
This is where the heavy lifting happens. You separated the complex logic from the simple API routes.

*   **`email_service.py`**: You built this to securely send HTML emails to clients. You integrated the `googleapiclient` (Gmail API) and used `threading.Thread` so that emails send asynchronously in the background, preventing the frontend from freezing.
*   **`gemini_service.py`**: You integrated Google's `gemini-2.5-flash` AI model here. You wrote dynamic prompt-engineering logic that takes an enquiry's budget and category and asks the AI to output formatted recommendations, a quote summary, and a follow-up email.
*   **`workflow_service.py`**: You built the rule-based automation engine here. If an enquiry is above a certain quantity or delivery date, it's marked as "High Priority". It also calculates a fallback quotation if the AI is unavailable.

---

## 3. API Routes (`backend/routes/`)
These files contain the RESTful API endpoints that the frontend calls to read or write data.

*   **`enquiries.py`**: You built endpoints (like `/api/create`) to accept new forms, validate inputs, save the data to MySQL, trigger the workflow engine, and dispatch a confirmation email all in one go.
*   **`quotations.py`**: Handles generating, fetching, and updating quotations (e.g., calculating GST, tracking status from "Prepared" to "Approved").
*   **`gemini.py`**: The bridge endpoint (`/api/gemini-suggestion`) that the frontend calls when the admin clicks the "Generate AI Suggestion" button.
*   **`design_approvals.py`**: Manages the upload of Mockup files. You used `secure_filename()` to safely store PDF/Image uploads on the server and update their status.
*   **`inventory.py` & `occasions.py`**: Endpoints you built for the admin dashboard to manage product stock levels and track upcoming client corporate events.
*   **`personalizations.py`**: API for handling specialized branding requests, ensuring custom logo requirements are saved and tracked.
*   **`returns.py`**: A module you created to handle the RMA (Return Merchandise Authorization) process, allowing clients to submit return requests for damaged goods.
*   **`export.py`**: You wrote this utility to pull data from MySQL and generate downloadable CSV reports for the sales team.
