# Finance Dashboard Backend API

A secure, production-ready Node.js REST API for a personal finance dashboard. Features robust Role-Based Access Control (RBAC), stateless JWT authentication, Rate Limiting, Soft Deletes, and comprehensive automated testing.

## 🚀 Built With
* **Runtime:** Node.js (ES Modules)
* **Framework:** Express.js 5.x
* **Database:** SQLite (via Sequelize ORM)
* **Authentication:** JSON Web Tokens (JWT) & bcryptjs
* **Validation:** Joi validation schemas
* **Testing:** Jest & Supertest
* **Documentation:** Swagger / OpenAPI 3.0

## 📦 Setup & Installation

**1. Clone and Install**
```bash
git clone https://github.com/swatishah946/Finance_Dashboard.git
cd Finance_Dashboard
npm install
```

**2. Configure Environment**
Create a `.env` file in the root directory:
```env
NODE_ENV=development
PORT=5000
DB_PATH=./finance.db
JWT_SECRET=your_super_secret_key_here
```

**3. Run the Server**
```bash
# Starts server and automatically seeds the database on first run
npm run dev
```

## 🔐 Built-in Test Accounts
On the first run, the database automatically seeds these roles and users (all passwords are `password123`):

| Role | Email | Description |
|------|-------|-------------|
| **Admin** | `admin@example.com` | Full access. Can delete records and create/manage users. |
| **Analyst** | `analyst@example.com` | Can view the dashboard, and create/update records. |
| **Viewer** | `viewer@example.com` | Can only view records and the dashboard. No mutations. |

## 🧪 Testing (Automated)
The API includes an automated integration test suite that runs in an isolated, in-memory SQLite database (`:memory:`), ensuring tests run fast and never pollute development data.
```bash
npm test
```

## 📚 API Documentation (Interactive)
Instead of relying purely on static text, this backend includes **Swagger UI** for interactive evaluation.

Once the server is running, navigate to:
👉 **[http://localhost:5000/api/docs](http://localhost:5000/api/docs)**

From there, you can view the schemas, authorize with a JWT, and click "Try it out" to send requests directly from your browser.

## ⚖️ Architecture, Assumptions, and Tradeoffs

### Assumptions Made
1. **Currency Handling:** I assumed that standard decimal points (e.g. 150.50) are acceptable for amounts. I used standard Javascript floating point handling at the API edge but stored them as `DECIMAL(10,2)` in the database to prevent database-level rounding drift.
2. **Access Scopes:** By default, if a user is not an Admin, GET requests for financial records automatically scope to `user_id = token.userId`. They cannot even attempt to query another user's records.

### Tradeoffs Considered
1. **SQLite vs PostgreSQL:** I opted for SQLite to minimize setup friction for evaluators. It acts as a hyper-fast drop-in replacement that requires zero external Docker/background services. Because I used the Sequelize ORM, scaling to PostgreSQL in the future would only require changing the dialect string and installing the `pg` driver.
2. **Soft Deletes vs Hard Deletes:** `paranoid: true` was enabled on the Models. The tradeoff is a slightly larger database file size over time. The massive benefit is audit compliance — no financial record or user is ever permanently lost during accidental or malicious deletion.
3. **Session vs JWT:** I opted for stateless JWT tokens instead of stateful sessions. The tradeoff is that immediate token revocation is harder (requires a blacklist), but the benefit is a significantly more scalable API that doesn't require querying a Redis session-store on every single API request.

## 📡 Core Endpoints Overview

### Authentication & Users
* `POST /api/auth/login` - Returns JWT Token
* `GET /api/auth/profile` - Returns logged-in user details & permissions
* `POST /api/users` - Create a new user (Admin only)
* `GET /api/users` - View all users and their status (Admin only)
* `PUT /api/users/password` - Change your current password

### Financial Records
* `GET /api/records` - List records (Admins see all, others see own)
* `POST /api/records` - Create an income/expense record
* `PUT /api/records/:id` - Update existing record
* `DELETE /api/records/:id` - Delete record (Admins only)

### Dashboard Analytics
* `GET /api/dashboard/summary` - Total income, expenses, and net balance
* `GET /api/dashboard/categories` - Deep breakdown of income/expense by category
* `GET /api/dashboard/trends` - Filtered historical aggregation of cashflow
* `GET /api/dashboard/health` - Savings rate calculations and financial health score
