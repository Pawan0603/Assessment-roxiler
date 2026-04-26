# ⭐ RateMyStore

A full-stack web application where users can discover, rate, and review stores.
Built with **Next.js, MongoDB, and Tailwind CSS**, featuring role-based dashboards for Admins, Store Owners, and Users.

---

## 🚀 Features

### 👤 Authentication

* Secure login & signup (JWT-based)
* Role-based access control:

  * **Admin**
  * **Store Owner**
  * **Normal User**

---

### 🧑‍💼 Admin Dashboard

* View platform statistics:

  * Total Users
  * Total Stores
  * Total Ratings
* Manage:

  * Users
  * Stores
* Add new users and stores

---

### 🏪 Store Owner Dashboard

* View assigned stores
* Track:

  * Total ratings
  * Average rating
* See detailed user ratings for their stores

---

### 🧑 User Features

* Browse all stores
* Search stores by name/address
* Rate stores (1–5 stars)
* Update rating anytime

---

### ⭐ Rating System

* One user → one rating per store
* Auto-update rating (no duplicates)
* Real-time average rating calculation
* Personalized rating (`myRating`)

---

### 🔐 Security

* JWT authentication via cookies
* Role-based API protection
* Input validation on both frontend & backend

---

## 🛠 Tech Stack

### Frontend

* Next.js (App Router)
* React (Client Components)
* Tailwind CSS
* ShadCN UI
* Lucide Icons

### Backend

* Next.js API Routes
* MongoDB + Mongoose
* JWT Authentication
* bcrypt (password hashing)

---

## 📁 Project Structure

```
app/
  api/
    auth/
    users/
    stores/
    ratings/
    admin/
    owner/
  (pages)

components/
lib/
models/
```

---

## ⚙️ Setup Instructions

### 1. Clone the repository

```bash
git clone [https://github.com/your-username/ratemystore.git](https://github.com/Pawan0603/ratemystore.git)
cd ratemystore
```

---

### 2. Install dependencies

```bash
pnpm install
```

---

### 3. Setup environment variables

Create a `.env.local` file:

```env
MONGODB_URI=your_mongodb_connection
JWT_SECRET=your_secret_key
```

---

### 4. Run the development server

```bash
pnpm dev
```

---

## 🔗 API Overview

### Auth

* `POST /api/auth/signup`
* `POST /api/auth/login`

### Users (Admin)

* `GET /api/users`
* `POST /api/users`

### Stores

* `GET /api/stores`
* `POST /api/stores`

### Ratings

* `POST /api/ratings`

### Dashboards

* `GET /api/admin/dashboard`
* `GET /api/owner/dashboard`

---

## 🧠 Key Concepts Implemented

* MongoDB Aggregation Pipeline

  * `avgRating`
  * `myRating`
* Role-based authorization
* Optimized queries (avoid N+1 problem)
* Clean API design
* UI preserved while migrating backend

---

## 🧪 Demo Test Accounts

Use the following credentials to explore different roles in the application:

### 🔑 Admin

* **Email:** [admin@example.com](mailto:admin@example.com)
* **Password:** Admin@123

### 👤 Normal User

* **Email:** [user@example.com](mailto:user@example.com)
* **Password:** User@1234

### 🏪 Store Owner

* **Email:** [owner@example.com](mailto:owner@example.com)
* **Password:** Owner@123

> ⚠️ These accounts are for testing/demo purposes only.

---

## 🧑‍💻 Author

**Pawan Thakre**
