# astrologica - A Modern Devotional Services Platform

astrologica is a modern, devotional, and user-friendly full-stack application for booking religious services online. It is designed for ease of use, especially for elderly devotees, with a focus on a quick and simple booking process for pujas, prasad subscriptions, and other temple services.

![astrologica Screenshot](https://storage.googleapis.com/aistudio-project-images/22904323-289c-40d1-b51f-61219b5b248a/4a1c1d0b-68d8-4a0b-93f0-4fc750e64c1c.png)

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

To run this project on your computer, you need two separate terminals.

### Prerequisites

-   **Node.js:** v16 or later.
-   **MongoDB:** A running instance (either locally or on a cloud service like MongoDB Atlas).

### Step 1: Install All Dependencies

First, install the necessary packages for both the frontend and the backend.

```bash
# 1. Install frontend packages from the root directory
npm install

# 2. Install backend packages
cd backend
npm install
cd ..
```

### Step 2: Configure the Backend

The backend needs secret keys to run.

1.  Go into the `/backend` directory.
2.  Create a new file named `.env`.
3.  Copy and paste the content below into your `.env` file, and fill in your actual values. **All variables are required.**

    ```env
    # The port your backend server will run on (should be 5000)
    PORT=5000

    # Your MongoDB connection string.
    # Replace with your string from your local instance or MongoDB Atlas.
    MONGO_URI=mongodb://your_connection_string_here

    # A long, random, and secret string for security.
    # Use an online password generator to create a strong key.
    JWT_SECRET=your_super_secret_and_random_string_for_jwt
    
    # Your Razorpay API keys (you can use Test keys for local development)
    RAZORPAY_KEY_ID=your_razorpay_key_id
    RAZORPAY_KEY_SECRET=your_razorpay_key_secret
    ```

### Step 3: Seed the Database (First Time Only)

To add sample data to your database (temples, users, etc.), run this command from the `/backend` directory.

**Warning:** This will delete any existing data.

```bash
cd backend
npm run seed
```

### Step 4: Run the Application (Two Terminals)

You need to start both servers at the same time.

-   **Terminal 1: Start the Backend Server**
    ```bash
    cd backend
    npm run dev
    ```
    You should see a message: `✅ Backend server running... on port 5000`. Keep this terminal open.

-   **Terminal 2: Start the Frontend Server**
    (Make sure you are in the project's root directory)
    ```bash
    npm run dev
    ```
    You should see a message: `> Local: http://127.0.0.1:3000/`.

Now, open **`http://localhost:3000`** in your web browser. Your application should be working correctly.

---

## 5. Deployment Guide (Vercel)

For complete, step-by-step instructions on deploying this application to Vercel, please see the dedicated guide:

**[➡️ Vercel Deployment Guide](./DEPLOYMENT_GUIDE.md)**

---

## 6. Project Workflow

-   **Devotee Journey:** A user visits the site, browses temples, selects a puja, fills in their details, and completes the payment via Razorpay. They can then view their booking details in their personal dashboard.
-   **Admin Journey:** An administrator logs in and is redirected to the `/admin_dashboard`. From here, they can add/edit/delete temple information, manage core services offered by the platform, and view all user bookings.
-   **Data Flow:** The React frontend makes authenticated API requests to the Express backend. The backend controllers handle the logic, interact with the MongoDB database via Mongoose models, and return JSON responses to the frontend.