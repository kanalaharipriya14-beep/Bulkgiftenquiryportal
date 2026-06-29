# Code & Technical Explanation Guide
*Use this guide to prepare for technical questions regarding the actual code you wrote.*

---

## 💻 1. Frontend Development (React.js)
If asked, **"How did you build the UI and manage data on the frontend?"**

**Key Components & Hooks Used:**
*   **React Hooks (`useState`, `useEffect`):** 
    *   *Code Explanation:* You heavily used the `useState` hook to manage form inputs. For example, in `EnquiryForm.jsx`, you wrote `const [companyName, setCompanyName] = useState("");`. This creates a two-way data bind. When the user types in the input box, it triggers `onChange={(e) => setCompanyName(e.target.value)}`.
    *   *Code Explanation:* You used `useEffect` in dashboard components (like `SalesDashboard.jsx` or `InventoryScreen.jsx`) to automatically fetch data from the backend as soon as the page loads.
*   **Form Handling & File Uploads:**
    *   *Code Explanation:* For the logo upload feature in the Enquiry Form, standard JSON wasn't enough. You wrote code to use the built-in browser `FormData` object: 
        ```javascript
        const formData = new FormData();
        formData.append("company_name", companyName);
        formData.append("logo", logoFile);
        ```
    *   *Why?* Because `FormData` creates a `multipart/form-data` request, which is required to send physical image files over HTTP to the Flask backend.

**Connecting to the Backend:**
*   **API Service Layer:** Instead of writing raw `fetch()` calls in every component, you abstracted API calls into a service file (e.g., `services/api.js`). 
*   *Code Example:* `await api.createEnquiry(formData);` This keeps the React components clean and centralizes error handling.

---

## ⚙️ 2. Backend Development (Python Flask)
If asked, **"How does the backend process data and handle routing?"**

**Key Framework Features Used:**
*   **Flask Blueprints:** 
    *   *Code Explanation:* To keep the code modular, you didn't put all routes in one massive `app.py` file. You used `Blueprint`. For example, in `routes/enquiries.py`, you wrote:
        ```python
        enquiries_bp = Blueprint("enquiries_route", __name__)
        @enquiries_bp.route("/api/create", methods=["POST"])
        def create_enquiry():
        ```
    *   *Why?* This registers all enquiry-related endpoints under one module, making the codebase scalable and easier to debug.
*   **Request Handling (`request` & `jsonify`):**
    *   *Code Explanation:* Inside your routes, you used Flask's `request` object to extract data. You wrote `data = request.json` for standard requests, and `request.files["logo"]` to extract the uploaded image file.
    *   You used `jsonify({"status": "success"})` to convert Python dictionaries into standard JSON strings that the React frontend can understand.
*   **Security (File Uploads):**
    *   *Code Explanation:* You used `secure_filename()` from `werkzeug.utils` and generated random UUIDs (`uuid.uuid4().hex`) before saving files to the server. This prevents directory traversal attacks and ensures filenames are unique.

---

## 🗄️ 3. Database Operations (MySQL)
If asked, **"How do you execute database queries securely?"**

**Key Database Techniques:**
*   **Parameterized Queries (Crucial for Security):**
    *   *Code Explanation:* You did **not** use string concatenation to build SQL queries. Instead, you used parameterized queries with `%s`.
    *   *Example in your code:*
        ```python
        insert_comp = "INSERT INTO companies (company_name, email) VALUES (%s, %s)"
        execute_query(insert_comp, (company_name, email))
        ```
    *   *Why?* This completely prevents **SQL Injection** attacks, which is a major security requirement for any enterprise web application.
*   **Custom Database Wrapper:**
    *   *Code Explanation:* You created a central `db.py` file with an `execute_query()` function. This function handles acquiring a connection from the MySQL pool, executing the cursor, committing the transaction, and closing the connection. 

---

## 🚀 4. Deployment & Infrastructure
If asked, **"How is this application configured for a production environment?"**

**Key Technical Points:**
*   **CORS (Cross-Origin Resource Sharing):** 
    *   *Code Explanation:* In `app.py`, you imported `CORS(app)`. You had to write this because, by default, web browsers block a frontend running on one port (e.g., localhost:5173) from making API requests to a backend on another port (e.g., localhost:5000).
*   **Environment Variables:**
    *   *Code Explanation:* You never hardcoded the database password in `db.py`. Instead, you used Python's `os.getenv("DB_PASSWORD")`. 
    *   *Why?* This ensures sensitive credentials stay out of GitHub and are only stored in the local `.env` file or the server's environment settings.
*   **Production Server:**
    *   *Explanation:* For deployment, the React app is built into static files (`npm run build`). The Flask app would not use the built-in development server (the one started with `app.run()`), but rather a production WSGI server like **Gunicorn** or **Waitress** (for Windows) to handle multiple concurrent user requests efficiently.
