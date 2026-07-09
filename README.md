# 🚗 Automotive E-commerce & Service Platform

A full-stack web application combining e-commerce functionality with vehicle service management. Built with React, Node.js, MongoDB, and Stripe.

![React](https://img.shields.io/badge/React-18.3.1-blue)
![Node.js](https://img.shields.io/badge/Node.js-Express-brightgreen)
![MongoDB](https://img.shields.io/badge/MongoDB-8.5.3-green)
![Stripe](https://img.shields.io/badge/Stripe-Payment%20API-blue)

## ✨ Features

### 🛒 E-commerce
- Product catalog with categories/subcategories
- Shopping cart with real-time updates
- Stripe payment processing (card + cash on delivery)
- Coupon system with automatic discounts
- Order management with status tracking
- Inventory management

### 🔧 Service Management
- Appointment booking with mechanic scheduling
- Vehicle registration and service history
- Service orders with parts/labor tracking
- Mechanic workload management

### 📊 Analytics Dashboard
- Real-time sales analytics with charts
- Product performance analysis
- Service center analytics //working on it 

### 👥 User Management
- JWT authentication with role-based access
- Admin and Customer roles
- User profiles with vehicle information

## 🛠️ Tech Stack

**Frontend:** React 18, Vite, Tailwind CSS, Framer Motion, Zustand, Recharts
**Backend:** Node.js, Express, MongoDB, Mongoose, JWT, bcrypt, Stripe, Cloudinary

## 🚀 Quick Start

1. **Clone & Install**
   ```bash
   git clone <repository-url>
   npm install
   cd frontend && npm install
   ```
  
2. **Environment Setup**
   Create `.env` file:
   ```env
   MONGODB_URI=your_mongodb_uri
   ACCESS_TOKEN_SECRET=your_access_secret
   REFRESH_TOKEN_SECRET=your_refresh_secret
   STRIPE_SECRET_KEY=your_stripe_key
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_key
   CLOUDINARY_API_SECRET=your_cloudinary_secret
   UPSTASH_REDIS_URL=your_redis_url
   ```

3. **Run Development Servers**
   ```bash
   npm run dev          # Backend (port 5000)
   cd frontend && npm run dev  # Frontend (port 5173)
   ```

## 📁 Project Structure

```
├── backend/
│   ├── controllers/    # Route handlers
│   ├── models/         # MongoDB schemas
│   ├── routes/         # API endpoints
│   └── lib/           # Utilities (DB, Stripe)
├── frontend/
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── pages/      # Page components
│   │   └── stores/     # State management
│   └── public/         # Static assets
```
