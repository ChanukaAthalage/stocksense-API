# StockSense API

A production-grade Smart Inventory & Supply Chain Management REST API built with Node.js, Express, and MongoDB. Built with AI-assisted development (GitHub Copilot) and reviewed with automated AI code review (CodeRabbit) on every pull request.

## Overview

StockSense helps warehouse managers, suppliers, and admins track products, monitor stock levels, and manage inventory across multiple warehouses. It's designed with real-world supply chain operations in mind — particularly relevant to Western Australia's mining and resources sector, where inventory tracking across multiple sites is critical.

## Tech Stack

- **Runtime:** Node.js (v16+)
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT (JSON Web Tokens)
- **Password Security:** bcryptjs
- **Security:** Helmet, CORS, express-rate-limit
- **Development Tools:** GitHub Copilot, CodeRabbit (automated PR review)

## Features

### Authentication & Authorization
- JWT-based authentication with role-based access control
- Three user roles: `warehouse_manager`, `supplier`, `admin`
- Passwords hashed with bcrypt, never stored in plain text
- Rate-limited auth endpoints to prevent brute-force attacks

### Product Management
- Full CRUD operations for inventory products
- SKU-based product identification
- Low stock detection (automatically flags products at or below reorder level)
- Soft delete pattern — deactivated products are preserved for audit and historical reporting, never hard-deleted
- Role-based permissions per endpoint (e.g. only admins can deactivate products)

### Security
- Helmet for secure HTTP headers
- Configurable CORS with fail-closed behavior
- General and endpoint-specific rate limiting
- Trust proxy configuration for accurate client IP detection behind load balancers
- MongoDB ObjectId validation before all database queries
- Consistent error handling: 4xx for client errors, 5xx for genuine server errors

## Getting Started

### Prerequisites
- Node.js v16 or higher
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

### Running in Production

```bash
npm start
```

## API Endpoints

### Authentication
| Method | Endpoint | Access | Description |
|--------|----------|--------|--------------|
| POST | `/api/v1/auth/register` | Public | Register a new user |
| POST | `/api/v1/auth/login` | Public | Log in and receive a JWT |

### Products
| Method | Endpoint | Access | Description |
|--------|----------|--------|--------------|
| POST | `/api/v1/products` | warehouse_manager, admin | Create a new product |
| GET | `/api/v1/products` | All roles | List all active products (supports `?category=` filter) |
| GET | `/api/v1/products/low-stock` | warehouse_manager, admin | List products at or below reorder level |
| GET | `/api/v1/products/:id` | All roles | Get a single product by ID |
| PUT | `/api/v1/products/:id` | warehouse_manager, admin | Update product details |
| PATCH | `/api/v1/products/:id/stock` | warehouse_manager, admin | Update product stock quantity only |
| DELETE | `/api/v1/products/:id` | admin | Soft-delete a product |

### Utility
| Method | Endpoint | Description |
|--------|----------|--------------|
| GET | `/api/v1/health` | Health check for uptime monitoring |

## Project Structure

```
stocksense-API/
├── src/
│   ├── config/         # Database connection setup
│   ├── controllers/    # Request handlers / business logic
│   ├── middleware/     # Auth, rate limiting, role authorization
│   ├── models/         # Mongoose schemas
│   └── routes/         # API route definitions
├── server.js            # Application entry point
├── .env.example          # Environment variable template
└── package.json
```

## Development Workflow

This project follows a structured Git workflow:

```
feature/* → dev → main
```

Every feature is built on its own branch, merged into `dev` for integration, then promoted to `main` once stable. Every pull request is automatically reviewed by [CodeRabbit](https://coderabbit.ai) before merging, catching security issues, logic bugs, and code quality concerns before they reach production.

## Roadmap

- [x] Authentication & authorization
- [x] Product management with low-stock alerts
- [ ] Warehouse management
- [ ] Supplier management
- [ ] Order management
- [ ] Real-time stock alerts via Socket.io
- [ ] File uploads (product images, supplier invoices) via AWS S3
- [ ] Email notifications via AWS SES
- [ ] Docker containerization
- [ ] CI/CD pipeline with GitHub Actions
- [ ] Deployment on Railway

## License

ISC

## Author

Chanuka Athalage