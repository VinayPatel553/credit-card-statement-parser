# 💳 Credit Card Statement Parser

A **full-stack web application** that automatically extracts and displays key information from **credit card statement PDFs**.  
The parser supports **password-protected PDFs** and provides a clean, modern interface for viewing extracted data.

---

## 📋 Description

This application allows users to upload credit card statement PDFs and automatically extract important details such as:

- 🏦 Bank/Issuer name  
- 💳 Card type (Platinum, Gold, etc.)  
- 🔢 Card number (last 4 digits)  
- 📅 Billing period  
- 📆 Payment due date  
- 💰 Total amount due  

The parser handles various **Indian bank statement formats** including:  
**HDFC, SBI, ICICI, Axis, and BOB.**

---

## 🚀 Tech Stack

### 🧠 Backend
- **Node.js** – Runtime environment  
- **Express.js** – Web application framework  
- **Multer** – File upload handling  
- **pdf-parse** – PDF text extraction  
- **qpdf** – Password-protected PDF decryption  

### 💻 Frontend
- **React.js** – UI library  
- **React Bootstrap** – UI component library  
- **Axios** – HTTP client  
- **Framer Motion** – Animation library  
- **React Bootstrap Icons** – Icon library  

---

🛠️ Setup Instructions

1️⃣ Clone the Repository
```bash
git clone https://github.com/VinayPatel553/credit-card-statement-parser.git
cd credit-card-statement-parser
```
2️⃣ Backend Setup

Navigate to the backend directory:
```bash
cd backend
```

Install dependencies:
```bash
npm install
```

Create required directories:
```bash
mkdir uploads
```

(If not already installed) Install required packages:
```bash
npm install express multer cors pdf-parse
```

Start the backend server:
```bash
node index.js
```

The backend server will start on http://localhost:5000

3️⃣ Frontend Setup

Open a new terminal and navigate to the frontend directory:
```bash
cd frontend
```

Install dependencies:
```bash
npm install
```

Install additional packages:
```bash
npm install react-bootstrap bootstrap axios framer-motion react-bootstrap-icons
```

Start the React development server:
```bash
npm start
```

The frontend will start on http://localhost:3000

