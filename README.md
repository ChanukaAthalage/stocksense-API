# StockSense API

A production-grade Smart Inventory & Supply Chain Management REST API built with Node.js, Express, and MongoDB. Built with AI-assisted development (GitHub Copilot, Claude Code) and reviewed with automated AI code review (CodeRabbit) on every pull request.

**Live API:** `http://187.77.144.230:5000/api/v1/health`

## Overview

StockSense helps warehouse managers and admins track products, monitor stock levels, and manage inventory across multiple warehouses. It's designed with real-world supply chain operations in mind — particularly relevant to Western Australia's mining and resources sector, where inventory tracking across multiple sites is critical.

Suppliers are modeled as business records (name, contact details, lead time) rather than as system users — supplier companies do not log in or interact with the API directly. This keeps the authentication surface limited to the people actually operating the system day-to-day, while still letting the system track which supplier each product comes from and how long deliveries typically take.

## Tech Stack

- **Runtime:** Node.js (v24)
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT (JSON Web Tokens)
- **Password Security:** bcryptjs
- **Security:** Helmet, CORS, express-rate-limit
- **Containerization:** Docker (node:24-alpine)
- **Deployment:** Hostinger VPS (Ubuntu, Docker)
- **Development Tools:** GitHub Copilot, Claude Code, CodeRabbit (automated PR review)

## Features

### Authentication & Authorization
- JWT-based authentication with role-based access control
- Two user roles: `warehouse_manager`, `admin`
- Passwords hashed with bcrypt, never stored in plain text
- Rate-limited auth endpoints to prevent brute-force attacks

### Product Management
- Full CRUD operations for inventory products
- SKU-based product identification
- Low stock detection (automatically flags products at or below reorder level)
- Soft delete pattern — deactivated products are preserved for audit and historical reporting, never hard-deleted
- Role-based permissions per endpoint (e.g. only admins can deactivate products)
- Reference-integrity validation on `warehouseId` and `supplierId` — rejects malformed IDs, non-existent documents, and inactive (soft-deleted) references before a product can be created or reassigned

### Warehouse Management
- Full CRUD operations for warehouse locations
- Each warehouse requires a manager reference (`managerId`), validated against the User collection for existence, correct role (`warehouse_manager`), and active status — rejecting orphaned, wrong-role, or deactivated manager assignments
- Dedicated contact-only update endpoint, accessible to both admins and the assigned warehouse manager (ownership-based authorization — a warehouse manager can only update their own warehouse's contact details)
- Soft delete pattern, consistent with Product
- `populate()` responses return only safe manager fields (name, email) — password and other sensitive fields are never exposed

### Supplier Management
- Full CRUD operations for supplier business records
- Suppliers are standalone records (no system login) — linked to products via `supplierId`
- Required `leadTime` field (in days) — connects to existing reorder level logic for procurement timing decisions
- Unique email enforcement per supplier
- Admin-only write operations; admin and warehouse_manager can read

### Order Management
- Full procurement lifecycle tracking: `pending → confirmed → shipped → delivered → cancelled`
- State machine enforcement — invalid transitions (e.g. `pending → delivered`) are rejected with a clear error message
- Three normalized references per order: `productId`, `supplierId`, `createdBy` — all populate correctly on read
- `createdBy` always set server-side from the authenticated JWT token, never from the request body — prevents identity spoofing
- Reference-integrity validation on `productId` and `supplierId` before order creation — rejects dangling references
- Admin-only soft delete; warehouse_manager and admin can create and update status

### Security
- Helmet for secure HTTP headers
- Configurable CORS with fail-closed behavior
- General and endpoint-specific rate limiting
- Trust proxy configuration for accurate client IP detection behind load balancers
- MongoDB ObjectId validation before all database queries
- Consistent error handling: 4xx for client errors, 5xx for genuine server errors
- Reusable validation utilities (`validateManager`, `validateWarehouse`, `validateSupplier`, `validateProduct`) enforce existence, role, and active-status checks at the point of reference, preventing orphaned references and privilege-escalation paths

### Containerization
- Dockerized with `node:24-alpine` for minimal image size (~150MB vs ~900MB full image)
- Layer caching optimized — `package*.json` copied before source code so `npm ci` is cached on code-only changes
- Runs as non-root `node` user for security hardening
- Secrets passed via `--env-file` at runtime, never baked into the image

## Live Deployment

The API is deployed on a Hostinger VPS running Docker:

```text
Base URL: http://187.77.144.230:5000/api/v1
Health:   http://187.77.144.230:5000/api/v1/health
```

## Getting Started

### Prerequisites
- Node.js v24 or higher
- MongoDB Atlas account (or local MongoDB instance)
- npm

### Installation

1. Clone the repository
```bash
git clone https://github.com/ChanukaAthalage/stocksense-API.git
cd stocksense-API
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env` file in the root directory (see `.env.example` for the full list of required variables)
```
MONGODB_URI=your_mongodb_connection_string
PORT=5000
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
ALLOWED_ORIGINS=http://localhost:3000
TRUST_PROXY=1
```

4. Start the development server
```bash
npm run dev
```

The API will be available at `http://localhost:5000`.

### Running with Docker

```bash
docker build -t stocksense-api .
docker run -p 5000:5000 --env-file .env stocksense-api
```

## API Endpoints

### Authentication

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/v1/auth/register` | Public | Register a new user |
| POST | `/api/v1/auth/login` | Public | Log in and receive a JWT |

### Products

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/v1/products` | warehouse_manager, admin | Create a new product |
| GET | `/api/v1/products` | warehouse_manager, admin | List all active products (supports `?category=` filter) |
| GET | `/api/v1/products/low-stock` | warehouse_manager, admin | List products at or below reorder level |
| GET | `/api/v1/products/:id` | warehouse_manager, admin | Get a single product by ID |
| PUT | `/api/v1/products/:id` | warehouse_manager, admin | Update product details |
| PATCH | `/api/v1/products/:id/stock` | warehouse_manager, admin | Update product stock quantity only |
| DELETE | `/api/v1/products/:id` | admin | Soft-delete a product |

### Warehouses

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/v1/warehouses` | admin | Create a new warehouse |
| GET | `/api/v1/warehouses` | admin, warehouse_manager | List all active warehouses |
| GET | `/api/v1/warehouses/:id` | admin, warehouse_manager | Get a single warehouse by ID |
| PUT | `/api/v1/warehouses/:id` | admin | Update warehouse details |
| PATCH | `/api/v1/warehouses/:id/contact` | admin, warehouse_manager | Update contact details only (ownership-scoped for managers) |
| DELETE | `/api/v1/warehouses/:id` | admin | Soft-delete a warehouse |

### Suppliers

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/v1/suppliers` | admin | Create a new supplier |
| GET | `/api/v1/suppliers` | admin, warehouse_manager | List all active suppliers |
| GET | `/api/v1/suppliers/:id` | admin, warehouse_manager | Get a single supplier by ID |
| PUT | `/api/v1/suppliers/:id` | admin | Update supplier details |
| DELETE | `/api/v1/suppliers/:id` | admin | Soft-delete a supplier |

### Orders

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/v1/orders` | warehouse_manager | Create a new order |
| GET | `/api/v1/orders` | admin, warehouse_manager | List all active orders |
| GET | `/api/v1/orders/:id` | admin, warehouse_manager | Get a single order by ID |
| PATCH | `/api/v1/orders/:id/status` | warehouse_manager, admin | Update order status (state machine enforced) |
| DELETE | `/api/v1/orders/:id` | admin | Soft-delete an order |

### Utility

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/health` | Health check for uptime monitoring |

## Project Structure

```
stocksense-API/
├── src/
│   ├── config/         # Database connection setup
│   ├── controllers/    # Request handlers / business logic
│   ├── middleware/     # Auth, rate limiting, role authorization
│   ├── models/         # Mongoose schemas
│   ├── routes/         # API route definitions
│   └── utils/          # Reusable validation helpers
├── Dockerfile           # Production container definition
├── .dockerignore        # Docker build exclusions
├── server.js            # Application entry point
├── .env.example         # Environment variable template
└── package.json
```

## Development Workflow

This project follows a structured Git workflow:

```
feature/* → dev → main
```

Every feature is built on its own branch, merged into `dev` for integration, then promoted to `main` once stable. Every pull request is automatically reviewed by [CodeRabbit](https://coderabbit.ai) before merging, catching security issues, logic bugs, and code quality concerns before they reach production. Several real vulnerabilities — orphaned database references, role-bypass paths, privilege escalation via deactivated accounts, and authorization mismatches between documentation and implementation — were identified and fixed this way throughout development.

## Roadmap

- [x] Authentication & authorization
- [x] Product management with low-stock alerts
- [x] Warehouse management with ownership-based authorization
- [x] Supplier management (business records, linked to products — no system login)
- [x] Order management with status lifecycle state machine
- [x] Docker containerization
- [x] Deployment on Hostinger VPS
- [x] CI/CD pipeline with GitHub Actions

## License

ISC

## Author

Chanuka Athalage
