# Divine Darshan - A Modern Devotional Services Platform

Divine Darshan is a modern, devotional, and user-friendly full-stack application for booking religious services online. It is designed for ease of use, especially for elderly devotees, with a focus on a quick and simple booking process for pujas, prasad subscriptions, and other temple services.

![Divine Darshan Screenshot](https://storage.googleapis.com/aistudio-project-images/22904323-289c-40d1-b51f-61219b5b248a/4a1c1d0b-68d8-4a0b-93f0-4fc750e64c1c.png)

---

## Table of Contents

1.  [Architecture Overview](#1-architecture-overview)
2.  [Features](#2-features)
3.  [Tech Stack](#3-tech-stack)
4.  [Local Development Setup](#4-local-development-setup)
5.  [Deployment Guide (Vercel)](#5-deployment-guide-vercel)
6.  [Project Workflow](#6-project-workflow)

---

## 1. Architecture Overview

This project is a **monorepo** containing two main parts:

-   **Frontend:** A client-side application built with **React** and TypeScript. It is a static application served directly to the user's browser. It communicates with the backend via a REST API.
-   **Backend:** A RESTful API server built with **Node.js, Express, and MongoDB**. It handles business logic, database interactions, user authentication, and payment processing logic.

The two parts are designed to be developed and deployed together but run as separate services in a production environment.

## 2. Features

-   **User Authentication:** Secure JWT-based login and registration for users, admins, and temple managers.
-   **Temple & Service Browsing:** Users can view detailed information about temples, pujas, and other available services.
-   **Online Booking:** Seamless puja booking with secure payment processing via Razorpay.
-   **Prasad Subscription:** Users can subscribe to receive temple prasad at home.
-   **User Dashboard:** Devotees can view their past and upcoming bookings, manage their profile, and check subscriptions.
-   **Admin Dashboard:** A comprehensive backend interface for administrators to manage:
    -   Temples (CRUD operations)
    -   Core Services (CRUD operations)
    -   User Bookings
    -   Website Content (Seasonal Banners, Testimonials)

## 3. Tech Stack

| Area      | Technology                                                                          |
| :-------- | :---------------------------------------------------------------------------------- |
| **Frontend**  | React, TypeScript, Tailwind CSS, Axios, Lucide React                                |
| **Backend**   | Node.js, Express.js, MongoDB                                                        |
| **Database**  | Mongoose (ODM)                                                                      |
| **Auth**      | JWT (jsonwebtoken), bcryptjs                                                        |
| **Payments**  | Razorpay (Server-side Integration)                                                  |
| **Deployment**| Vercel                                                                         |

---

## 4. Local Development Setup

### Prerequisites

-   **Node.js:** v16 or later.
-   **MongoDB:** A running instance, either locally or on a cloud service like MongoDB Atlas.

### Step 1: Clone the Repository

```bash
git clone <your-repository-url>
cd <your-repository-name>
```

### Step 2: Install Dependencies

This is a monorepo, so you need to install dependencies for both the frontend and backend.

```bash
# Install frontend dependencies from the root directory
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### Step 3: Configure Backend Environment

1.  Navigate to the `/backend` directory.
2.  Create a new file named `.env`.
3.  Copy the contents below into the `.env` file and replace the placeholder values.

    ```env
    # The port your server will run on
    PORT=5000

    # Your MongoDB connection string.
    # Replace with your actual string from your local instance or MongoDB Atlas.
    # Example for local DB: MONGO_URI=mongodb://127.0.0.1:27017/divine_darshan
    MONGO_URI=mongodb://your_connection_string_here

    # A long, random, and secret string for signing security tokens. This is critical.
    # Use an online generator to create a strong secret key.
    JWT_SECRET=your_super_secret_and_random_string_for_jwt
    
    # Your Razorpay API keys. Get these from your Razorpay Dashboard.
    # NEVER commit these to a public repository.
    RAZORPAY_KEY_ID=your_razorpay_key_id
    RAZORPAY_KEY_SECRET=your_razorpay_key_secret
    ```

### Step 4: Seed the Database

To populate your database with initial sample data (temples, users, services), run the seeder script from the `/backend` directory.

**Warning:** This will delete any existing data in the database.

```bash
cd backend
npm run seed
```

### Step 5: Run the Application

You need to run the backend server and the frontend development server in two separate terminals.

-   **Terminal 1: Start the Backend Server**
    ```bash
    cd backend
    npm run dev
    ```
    The backend API should now be running at `http://localhost:5000`.

-   **Terminal 2: Start the Frontend**
    The frontend is served as a static site. You can use any simple HTTP server. If you have `serve` installed:
    ```bash
    # Run from the root directory
    serve -l 3000
    ```
    The website should now be accessible at `http://localhost:3000`. The frontend will automatically connect to the backend running on port 5000.

---

## 5. Deployment Guide (Vercel)

For complete, step-by-step instructions on deploying this application to Vercel, please see the dedicated guide:

**[➡️ Vercel Deployment Guide](./DEPLOYMENT_GUIDE.md)**

---

## 6. Project Workflow

-   **Devotee Journey:** A user visits the site, browses temples, selects a puja, fills in their details, and completes the payment via Razorpay. They can then view their booking details in their personal dashboard.
-   **Admin Journey:** An administrator logs in and is redirected to the `/admin_dashboard`. From here, they can add/edit/delete temple information, manage core services offered by the platform, and view all user bookings.
-   **Data Flow:** The React frontend makes authenticated API requests to the Express backend. The backend controllers handle the logic, interact with the MongoDB database via Mongoose models, and return JSON responses to the frontend.