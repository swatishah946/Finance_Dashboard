# Finance Dashboard Backend API

A secure, production-ready Node.js REST API for a personal finance dashboard. Features robust Role-Based Access Control (RBAC), stateless JWT authentication, Joi input validation, and comprehensive automated testing.

## 🚀 Built With
* **Runtime:** Node.js (ES Modules)
* **Framework:** Express.js 5.x
* **Database:** SQLite (via Sequelize ORM)
* **Authentication:** JSON Web Tokens (JWT) & bcryptjs
* **Validation:** Joi validation schemas
* **Testing:** Jest & Supertest

## 📦 Setup & Installation

**1. Clone and Install**
```bash
git clone https://github.com/swatishah946/Finance_Dashboard.git
cd Finance_Dashboard
npm install
```

**2. Configure Environment**
Create `.env` file:
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
| **Admin** | `admin@example.com` | Has full access to everything. Can delete any record. |
| **Analyst** | `analyst@example.com` | Can view the dashboard, and create/update records. |
| **Viewer** | `viewer@example.com` | Can only view records and the dashboard. |

## 🧪 Testing
The API includes an automated integration test suite that runs in an isolated, in-memory SQLite database.
```bash
# Run the test suite once (tests Auth and RBAC logic)
npm test

# Run tests in continuous watch mode
npm run test:watch
```

## 🏗️ Architecture & Design Decisions
* **Layered Architecture:** Routes → Controllers → Services → Models. Keeps business logic easily testable and separate from HTTP logic.
* **Granular RBAC:** Uses a custom `permissionGuard` middleware reading a JSON permissions array, meaning roles can easily be reconfigured without code changes.
* **Financial Integrity:** Stores currency using strict `DECIMAL(10,2)` types to avoid standard JS floating-point rounding errors.
* **Graceful Degradation:** A centralized error handler catches `Sequelize` constraints and formats them into clean, predictable JSON without leaking stack traces.

## 📡 API Endpoints 

### Authentication
* `POST /api/auth/login` - Returns JWT Token
* `GET /api/auth/profile` - Returns logged-in user details & permissions

### User Management
* `POST /api/users` - Create a new user (Admin only)
* `GET /api/users` - View all users and their status (Admin only)
* `PUT /api/users/password` - Change your current password (All authenticated users)

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
