# FinanceFlow — Personal Finance Management Application

## 📋 Project Overview

**FinanceFlow** is a full-stack web application for managing personal finances including income, expenses, budgets, savings goals, recurring transactions, and financial analytics. Built using modern enterprise technologies following layered architecture and industry best practices.

---

## 🔧 Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Backend** | Spring Boot | 3.5.13 |
| **Security** | Spring Security + JWT (JJWT) | 0.12.6 |
| **ORM** | Hibernate / Spring Data JPA | 6.x |
| **Database** | MySQL | 8.x |
| **API Docs** | SpringDoc OpenAPI (Swagger) | 2.8.6 |
| **Validation** | Hibernate Validator (JSR-303) | — |
| **Testing** | JUnit 5 + Mockito | — |
| **Frontend** | React.js | 18.x |
| **Styling** | Tailwind CSS | 4.x |
| **Charts** | Chart.js + react-chartjs-2 | 4.x |
| **HTTP Client** | Axios | — |
| **Build (BE)** | Maven | 3.9.x |
| **Build (FE)** | Vite | 6.x |
| **Language** | Java 17+ / JavaScript (ES6+) | — |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Frontend (React)                  │
│  Login │ Dashboard │ Income │ Expenses │ Reports ... │
├─────────────────────────────────────────────────────┤
│                   Axios HTTP Client                  │
│              (JWT Token in Auth Header)              │
├─────────────────────────────────────────────────────┤
│                  REST API (JSON)                     │
├─────────────────────────────────────────────────────┤
│                 Controller Layer                     │
├─────────────────────────────────────────────────────┤
│                  Service Layer                       │
│             (Business Logic + Validation)            │
├─────────────────────────────────────────────────────┤
│                Repository Layer                      │
│              (Spring Data JPA / Hibernate)           │
├─────────────────────────────────────────────────────┤
│                  MySQL Database                      │
└─────────────────────────────────────────────────────┘
```

### Layered Architecture:
1. **Controller Layer** — Handles HTTP requests/responses
2. **Service Layer** — Contains business logic
3. **Repository Layer** — Database operations via JPA
4. **Entity Layer** — JPA entity classes mapping to DB tables
5. **DTO Layer** — Request/Response data transfer objects
6. **Security Layer** — JWT authentication & role-based authorization
7. **Exception Layer** — Centralized global error handling

---

## 📦 Functional Modules

| # | Module | Features |
|---|--------|----------|
| 1 | **Authentication** | Register, Login, JWT, Role-based access (USER/ADMIN) |
| 2 | **Dashboard** | Total income/expenses/balance, monthly summary, recent transactions, budget alerts, goals |
| 3 | **Income** | Add/Edit/Delete income, categorize sources |
| 4 | **Expenses** | Add/Edit/Delete expenses, categorize expenses |
| 5 | **Categories** | CRUD for income & expense categories with colors |
| 6 | **Budgets** | Monthly/category budgets, progress tracking, 80% alerts |
| 7 | **Transactions** | Unified history, pagination, filters (date/category/type), search |
| 8 | **Reports** | Monthly/yearly reports, category breakdown, Line/Bar/Doughnut charts |
| 9 | **Financial Goals** | Savings target tracking with progress percentage |
| 10 | **Recurring** | Auto-repeating entries (salary/bills), daily scheduled processing |

---

## 🗃️ Database Schema

### Entities & Relationships

- **User** ←→ **Role** (Many-to-Many via user_roles)
- **User** → **Income** (One-to-Many)
- **User** → **Expense** (One-to-Many)
- **User** → **Budget** (One-to-Many)
- **User** → **Transaction** (One-to-Many)
- **User** → **FinancialGoal** (One-to-Many)
- **User** → **RecurringTransaction** (One-to-Many)
- **Category** → **Income/Expense/Budget/Transaction** (Many-to-One)

### Tables: `users`, `roles`, `user_roles`, `categories`, `incomes`, `expenses`, `budgets`, `transactions`, `financial_goals`, `recurring_transactions`

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login & get JWT |

### Income (`/api/incomes`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/incomes` | List all incomes |
| POST | `/api/incomes` | Create income |
| GET | `/api/incomes/{id}` | Get by ID |
| PUT | `/api/incomes/{id}` | Update |
| DELETE | `/api/incomes/{id}` | Delete |
| GET | `/api/incomes/date-range` | Filter by dates |

### Expenses, Categories, Budgets, Goals, Recurring — Same CRUD pattern

### Dashboard & Reports
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/summary` | Full dashboard data |
| GET | `/api/reports/monthly` | Monthly report |
| GET | `/api/reports/yearly` | Yearly report with trends |
| GET | `/api/reports/category-wise` | Category breakdown |

### Transactions
| GET | `/api/transactions` | Paginated + filtered |
| GET | `/api/transactions/search` | Search by description |

📖 **Full API documentation**: http://localhost:8080/swagger-ui.html

---

## 🚀 Setup & Run

### Prerequisites
- Java 17 or higher
- MySQL 8.x
- Node.js 18+
- npm 9+

### 1. Database Setup
```sql
CREATE DATABASE finance_db;
```

### 2. Backend
```bash
cd backend

# Using Maven Wrapper (recommended)
./mvnw spring-boot:run

# Or with installed Maven
mvn spring-boot:run
```
Backend runs at: **http://localhost:8080**

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at: **http://localhost:5173**

### 4. Default Configuration
- MySQL: `localhost:3306`, user: `root`, password: `root`
- Edit `backend/src/main/resources/application.properties` to change

---

## 🧪 Testing

### Run Unit Tests
```bash
cd backend
./mvnw test
```

### Test Coverage
- `AuthServiceTest` — Registration, login, duplicate validation
- `IncomeServiceTest` — CRUD operations for income
- `ExpenseServiceTest` — CRUD operations for expenses
- `BudgetServiceTest` — Budget alerts and remaining calculation
- `AuthControllerTest` — API endpoint integration tests

---

## 📂 Project Structure

```
Finance Management/
├── backend/
│   ├── pom.xml
│   └── src/main/java/com/financeapp/
│       ├── FinanceApplication.java
│       ├── config/        (Security, JWT, CORS, OpenAPI)
│       ├── entity/        (9 JPA entities)
│       ├── repository/    (9 Spring Data repositories)
│       ├── dto/           (Request & Response DTOs)
│       ├── service/       (11 service classes)
│       ├── controller/    (10 REST controllers)
│       └── exception/     (Global exception handler)
├── frontend/
│   └── src/
│       ├── api/           (Axios configuration)
│       ├── context/       (Auth context)
│       ├── components/    (Layout, Common, Charts, Forms)
│       ├── pages/         (12 page components)
│       ├── hooks/         (Custom hooks)
│       └── utils/         (Formatters, validators)
└── README.md
```

---

## 🔐 Security

- **JWT Authentication** — Stateless token-based auth
- **BCrypt** — Password hashing
- **Role-based Authorization** — ROLE_USER, ROLE_ADMIN
- **CORS** configured for frontend origin
- **CSRF disabled** (stateless API)

---

## ✅ Validation

### Backend
- `@NotBlank`, `@Email`, `@NotNull`, `@Positive`, `@Size` annotations
- `@Valid` on controller method parameters
- `MethodArgumentNotValidException` → field-level error map

### Frontend
- Form validation before API calls
- Toast notifications for success/error
- Required field indicators

---

## 👨‍💻 Author

Academic Project — Full Stack Finance Management Application

---

## 📝 License

This project is for academic and educational purposes.
