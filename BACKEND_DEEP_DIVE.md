# Backend Architecture Deep Dive: Email, AI, and Logic

This guide explains the three major background systems in your project so you can confidently answer questions during your presentation.

---

## 📧 1. How the Email System Works (Gmail API)

If asked: **"How are emails sent when a quotation proposal is submitted?"**

1. **The Technology Used:**
   - The service used for email sending is the **Google Gmail API**. Instead of using basic SMTP, the backend uses the official `googleapiclient` Python library to send emails directly and securely via a Gmail account, authenticated using modern **OAuth 2.0** tokens (`token.json`).
2. **The Flow:**
   - When an action happens (e.g., clicking "Request Quotation Proposal"), the backend creates an HTML email template.
   - It calls the `send_email` function inside `backend/services/email_service.py`.
3. **Performance Optimization (Asynchronous Execution):**
   - Sending an email over the internet takes time. To prevent the application from freezing or "lagging," the code uses **Python Threading** (`threading.Thread`).
   - This means the server hands the email task to a background worker and *immediately* responds to the frontend with a success message.

---

## 🤖 2. How Gemini AI is Integrated

If asked: **"How is the Gemini AI used for smart suggestions?"**

1. **The Model:**
   - The project uses the `gemini-2.5-flash` model via the `google.generativeai` library.
2. **Dynamic Prompting (`gemini_service.py`):**
   - When a suggestion is requested, the backend gathers the client's data (Company Name, Budget, Category, Quantity) and injects it into a carefully crafted prompt.
   - The prompt instructs the AI to return data in three exact sections separated by markers: `===RECOMMENDATIONS===`, `===QUOTATION===`, and `===FOLLOWUP===`.
3. **Resilience & Retries:**
   - The code includes a "Retry Loop". If the AI fails to respond or times out, the code waits 2 seconds and tries again (up to 2 times).

---

## ⚙️ 3. Rule-Based Logic (The Fallback System)

If asked: **"What happens if Gemini goes down? How does the rule-based logic work?"**

1. **The Immediate Fallback:**
   - When a user first submits an enquiry, the system *immediately* runs the **Rule-Based Logic** (`backend/services/workflow_service.py`).
   - It doesn't even wait for Gemini. It generates an instant, reliable baseline suggestion.
2. **How it Works (`if/else` logic):**
   - **Priority:** If `quantity > 100` or delivery is within `14 days`, it automatically marks the enquiry as "High" priority.
   - **Package Selection:** It checks the `category`. If `Festival Hampers`, it suggests the "Festive Celebration Box". If `Corporate Gifts`, it suggests the "Classic Corporate Bundle".
   - **Budget Constraints:** It applies a budget check. If the budget is under ₹500, it filters out expensive items (like leather) and defaults to eco-friendly pens and notebooks.
3. **The Benefit:**
   - This ensures the sales team **always** has a baseline recommendation instantly, even if the Gemini API key is missing or the internet is down. Gemini is used as a premium "enhancement" on top of the rock-solid rule-based foundation.
