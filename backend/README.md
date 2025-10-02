# astrologica - Backend Server

This is the backend server for the astrologica application. It is built with Node.js, Express, and MongoDB, and it provides a RESTful API for all frontend operations, including user authentication, temple management, bookings, and content management.

## Features

- **JWT Authentication:** Secure user registration and login using JSON Web Tokens.
- **Role-Based Access Control:** Differentiates between regular users, temple managers, and administrators.
- **CRUD Operations:** Full Create, Read, Update, and Delete functionality for temples, services, and other content.
- **Secure Payment Gateway:** Server-side order creation for Razorpay payments.
- **MongoDB Integration:** Uses Mongoose for elegant object data modeling with MongoDB.
- **Centralized Error Handling:** Robust and user-friendly error responses.

## Technologies Used

- **Node.js:** JavaScript runtime environment.
- **Express:** Web framework for Node.js.
- **MongoDB:** NoSQL database.
- **Mongoose:** Object Data Modeling (ODM) library for MongoDB.
- **jsonwebtoken (JWT):** For creating and verifying access tokens.
- **bcryptjs:** For hashing passwords.
- **Razorpay:** For processing payments.
- **dotenv:** For managing environment variables.
- **cors:** For enabling Cross-Origin Resource Sharing.

---
## Setup and Installation

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or later recommended)
- [MongoDB](https://www.mongodb.com/try/download/community) (a local instance or a cloud service like MongoDB Atlas)

### 1. Install Dependencies

Navigate to this directory and install the required packages.

```bash
# This assumes you are inside the /backend directory
npm install
```

### 2. Configure Environment Variables

The backend server requires secret keys and configuration settings to run. These are stored in a `.env` file which you must create.

A template file named `.env.example` is provided to make this easy.

**Step 1: Create your `.env` file**

In your terminal, make sure you are in the `/backend` directory. Then, run the following command to copy the template:

```bash
# For Windows (in PowerShell) or Mac/Linux:
cp .env.example .env

# If you use the old Windows Command Prompt:
copy .env.example .env
```

This will create a new file named `.env` in the `backend` folder.

**Step 2: Edit the `.env` file**

Open the new `.env` file in your code editor and fill in your actual values.

**You must replace the placeholder values** (like `your_super_secret...`, `your_razorpay_key...`) with your actual secret keys.

**All variables listed in this file are required for the server to start.**

### 3. Seed the Database (For Initial Setup)

To populate the database with initial sample data, run the seeder script. **Warning: This will delete all existing data in the collections.**

```bash
npm run seed
```

---
## Running the Server

To run the server in development mode (which automatically restarts on file changes):
```bash
npm run dev
```

The server will start on port 5000 and is now ready to receive requests from the frontend application.

---
## Troubleshooting

### Razorpay Payment Error: "Uh! oh! Something went wrong"

This error on the Razorpay checkout page almost always means there is a problem with the merchant's configuration (your backend setup). The most common causes are:

1.  **Incorrect API Keys:** The `RAZORPAY_KEY_ID` or `RAZORPAY_KEY_SECRET` in your `.env` file are wrong, or you are mixing test keys with live mode. Double-check that you have copied the correct **Live Keys** from your Razorpay dashboard into the `.env` file.
2.  **Server Not Running:** Ensure your backend server is running (`npm run dev`) and has successfully connected to the database without any startup errors.
3.  **Account Not Live:** Your Razorpay account may not be fully activated for live payments. Please check your account status on the Razorpay dashboard.

To use the keys you have, your `.env` file should look like this:

```env
# ... other variables
# Example using your live keys:
RAZORPAY_KEY_ID=rzp_live_RNPcIWCuyzmN11
RAZORPAY_KEY_SECRET=DSxVqzdy712qbchv18ZDSW8F
```

---
## API Endpoints

### Authentication (`/api/auth`)

- `POST /register`: Register a new user.
- `POST /login`: Log in a user and receive a JWT.
- `GET /me`: Get the profile of the currently logged-in user (Protected).

### Temples (`/api/temples`)

- `GET /`: Get all temples.
- `GET /:id`: Get a single temple by its custom ID.
- `POST /`: Create a new temple (Admin only).
- `PUT /:id`: Update a temple (Admin/Temple Manager only).
- `DELETE /:id`: Delete a temple (Admin only).

### Bookings (`/api/bookings`)

- `POST /`: Create a new booking (User only).
- `GET /my-bookings`: Get all bookings for the current user (User only).
- `GET /all`: Get all bookings from all users (Admin/Temple Manager only).

### Payments (`/api/payments`)
- `POST /create-order`: Creates a Razorpay order on the server. (Protected)
- `POST /phonepe/create-order`: Creates a PhonePe payment request. (Protected)
- `POST /phonepe/verify-payment`: Verifies a PhonePe payment and creates the corresponding booking/subscription. (Protected)

### Services (`/api/services`)

- `GET /`: Get all core services.
- `POST /`: Create a new service (Admin only).
- `PUT /:id`: Update a service (Admin only).
- `DELETE /:id`: Delete a service (Admin only).

### Content (`/api/content`)

- `GET /testimonials`: Get all testimonials.
- `POST /testimonials`: Create a new testimonial (Admin only).
- `PUT /testimonials/:id`: Update a testimonial (Admin only).
- `DELETE /testimonials/:id`: Delete a testimonial (Admin only).
- `GET /seasonalevent`: Get the seasonal event banner data.
- `PUT /seasonalevent`: Update the seasonal event banner data (Admin only).

### Users (`/api/users`)

- `GET /`: Get a list of all users (Admin only).