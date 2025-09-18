# Taskify - Full-Stack Task Management System

A modern task management application built with React, Material UI, Node.js, Express, and MongoDB.

## Features

### Frontend
- **React** with **Material UI** for beautiful, responsive UI
- **JWT Authentication** with login/signup
- **Task Management** - Create, edit, delete, and manage tasks
- **Status Tracking** - Pending, In Progress, Completed
- **Priority Levels** - Low, Medium, High
- **Due Date Management** with smart date formatting
- **Real-time Updates** with loading states and error handling
- **Responsive Design** that works on all devices

### Backend
- **Node.js + Express** RESTful API
- **MongoDB** with Mongoose ODM
- **JWT Authentication** with bcrypt password hashing
- **Protected Routes** with middleware
- **Input Validation** and error handling
- **CORS** configured for frontend integration

## Tech Stack

### Frontend
- React 18
- Material UI (MUI)
- React Router DOM
- Axios (HTTP client)
- Day.js (Date handling)
- Date-fns (Date utilities)

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JSON Web Tokens (JWT)
- bcrypt.js (Password hashing)
- CORS middleware
- dotenv (Environment variables)

## Project Structure

```
taskify/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components (Login, Signup, Dashboard)
│   │   ├── services/       # API service layer
│   │   └── ...
│   ├── package.json
│   └── ...
├── server/                 # Express backend
│   ├── models/             # Mongoose schemas
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   ├── server.js           # Main server file
│   ├── package.json
│   └── .env
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd taskify
   ```

2. **Set up the Backend**
   ```bash
   cd server
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the server directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/taskify
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=7d
   PORT=5000
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:5173
   ```

4. **Set up the Frontend**
   ```bash
   cd ../client
   npm install
   ```

### Running the Application

1. **Start MongoDB**
   Make sure MongoDB is running locally or update the `MONGODB_URI` in your `.env` file to point to MongoDB Atlas.

2. **Start the Backend Server**
   ```bash
   cd server
   npm run dev
   ```
   The server will start on http://localhost:5000

3. **Start the Frontend Development Server**
   ```bash
   cd client
   npm run dev
   ```
   The client will start on http://localhost:5173

4. **Open your browser**
   Navigate to http://localhost:5173 to use the application.

## API Endpoints

### Authentication
- `POST /auth/signup` - Register a new user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user (protected)

### Tasks
- `GET /tasks` - Get all tasks for logged-in user
- `GET /tasks/:id` - Get single task
- `POST /tasks` - Create new task
- `PUT /tasks/:id` - Update task
- `DELETE /tasks/:id` - Delete task
- `PATCH /tasks/:id/status` - Update task status

## Configuration

### MongoDB Setup
You can use either:

1. **Local MongoDB**
   - Install MongoDB locally
   - Update `MONGODB_URI` to `mongodb://localhost:27017/taskify`

2. **MongoDB Atlas (Recommended)**
   - Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create a cluster and get your connection string
   - Update `MONGODB_URI` in your `.env` file

### JWT Configuration
- Change the `JWT_SECRET` in your `.env` file to a secure random string
- Adjust `JWT_EXPIRES_IN` as needed (default: 7 days)

## Testing the Application

1. **Sign Up**: Create a new account with username, email, and password
2. **Login**: Sign in with your credentials
3. **Create Tasks**: Add new tasks with title, description, due date, and priority
4. **Manage Tasks**: Edit, delete, and change task status
5. **Filter Tasks**: View tasks by status (pending, in-progress, completed)

## Production Deployment

### Backend Deployment
1. Set `NODE_ENV=production` in your environment
2. Use a production MongoDB instance
3. Set a secure `JWT_SECRET`
4. Configure CORS for your production frontend URL

### Frontend Deployment
1. Update the API base URL in `src/services/api.js`
2. Build the production bundle: `npm run build`
3. Deploy the `dist` folder to your hosting provider