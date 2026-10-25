
# WEFTIN Atelier 👗
### A Modern Fashion E-Commerce Platform

WEFTIN Atelier is a fashion e-commerce platform developed for a client, combining traditional Indian fashion with a modern online shopping experience. The platform provides a customer-facing storefront alongside backend services and administrative tools designed to support product management, order processing, and business operations.

## 🌐 Live Website

**[Visit WEFTIN Atelier](https://weftin-project.vercel.app/)**

Explore the deployed application and its fashion shopping experience.

## ✨ Features

### 🛍️ Fashion Storefront
- Browse curated fashion collections.
- Explore Sarees, Lehengas, Dresses & Gowns, Kurtis, Co-Ord Sets, and Kids Wear.
- Discover lookbooks and limited-edition collections.
- Add products to the shopping cart.
- Save favorite products to a wishlist.
- Browse the storefront without requiring an account.

### 👤 Customer Account Management
- User registration and login.
- Customer profile management.
- Access account-specific shopping features.
- View orders and access order-tracking functionality.

### 🛒 Shopping & Orders
- Shopping cart management.
- Checkout and order processing.
- Order status management.
- Coupon and discount management.
- Customer order history and tracking features.

### 🧵 Tailoring & Operations
- Customer measurement management.
- Tailor assignment and order coordination.
- Support for tailoring and printing workflows.
- Vendor and inventory management.

### 📊 Administration & Analytics
- Product management and catalog updates.
- Order management and status updates.
- Coupon management.
- Inventory and expense tracking.
- Tailor and vendor management.
- Database-driven revenue reporting and business analytics.

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| React.js | Frontend development |
| Vite | Frontend build tooling |
| CSS | User interface styling |
| Python | Backend development |
| FastAPI | REST API framework |
| PostgreSQL | Relational database |
| Neon | Cloud-hosted PostgreSQL |
| psycopg2-binary | PostgreSQL database connectivity |
| Pydantic | Data validation |
| Passlib & bcrypt | Password hashing support |
| python-jose | JWT and token-related functionality |
| python-dotenv | Environment variable management |
| Uvicorn | ASGI server |
| Gunicorn | Production process management |
| Vercel | Frontend deployment |
| Render | Backend deployment |

## 🏗️ Architecture

WEFTIN follows a full-stack architecture in which the frontend communicates with backend API endpoints, and the backend interacts with PostgreSQL for persistent data storage.

- **Frontend:** React.js with Vite.
- **Backend:** FastAPI and Python.
- **Database:** PostgreSQL hosted on Neon.
- **Frontend hosting:** Vercel.
- **Backend hosting:** Render.

## 🚀 Deployment

The application is deployed using cloud hosting services.

- **Live application:** https://weftin-project.vercel.app/
- **Backend service:** https://weftin-project.onrender.com

The frontend communicates with the backend API, which handles application logic and database operations.

## ⚙️ Backend Setup

### Prerequisites

- Python 3.10 or a compatible version.
- PostgreSQL database or a Neon database instance.
- Git.

### 1. Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd <YOUR_REPOSITORY_DIRECTORY>
```

Navigate to the backend directory containing `main.py` and `requirements.txt`.

### 2. Create a Virtual Environment

```bash
python -m venv venv
```

Activate it on Windows:

```bash
venv\Scripts\activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables

Create a `.env` file in the backend directory and add the environment variables required by the application.

For example:

```env
DATABASE_URL=your_postgresql_connection_string
```

Configure any additional required secrets using the variable names expected by the backend code.

### 5. Start the Backend

```bash
uvicorn main:app --reload
```

The backend will typically run at:

http://localhost:8000

If enabled, interactive API documentation is available at:

http://localhost:8000/docs

## 🔐 Security & Configuration

- Store database credentials and application secrets in environment variables.
- Never commit private credentials or `.env` files to the repository.
- Enforce authentication and authorization on protected backend endpoints.
- Validate sensitive operations on the server.
- Restrict administrative functionality to authorized users.
- Configure CORS for trusted frontend origins.
- Protect customer and order information from unauthorized access.

## 🎯 Project Highlights

- Developed as a client-focused full-stack web application.
- Integrated a modern frontend with backend REST APIs.
- Connected application services to a cloud-hosted PostgreSQL database.
- Implemented fashion storefront and e-commerce workflows.
- Developed administrative functionality for managing business operations.
- Deployed the application using Vercel and Render.

## 👨‍💻 Developer

**Bharath Chelimalla**

Full-Stack Developer | Computer Science & Engineering

GitHub: [@bittubunny](https://github.com/bittubunny)

## 📄 Project Notice

WEFTIN Atelier was developed as a client project. Branding, content, and application functionality may belong to the respective client or rights holders.

This repository is intended to document the development project. Please obtain the appropriate permissions before redistributing client-owned code, assets, or confidential information.
 
---

**WEFTIN Atelier — Bringing Fashion and Digital Experiences Together.**
