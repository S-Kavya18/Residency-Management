# Smart Residency Management System

A comprehensive full-stack web application built with the MERN stack (MongoDB, Express.js, React.js, Node.js) for automating and digitalizing hostel/lodge/residency management.

## 🚀 Features

### Resident Module
- **Dashboard**: View room allocation, application status, complaints, and food subscription
- **Room Application**: Apply for rooms with real-time availability tracking
- **Complaint Management**: Raise complaints with image uploads and priority levels
- **Food Services**: Subscribe/unsubscribe to meal plans and submit feedback
- **Housekeeping**: Request housekeeping services with preferred date/time

### Admin Module
- **Dashboard**: Overview of residents, occupancy rates, pending applications, and active complaints
- **Room Management**: Add, update, delete, and manage room availability
- **Application Management**: Approve/reject room applications
- **Complaint Management**: Assign complaints to staff and track resolution
- **Reports**: Generate occupancy reports and complaint statistics with CSV export

### Staff Module
- **Dashboard**: View assigned complaints and task statistics
- **Complaint Management**: Update complaint status and mark as resolved

## 🛠️ Technology Stack

### Frontend
- React.js 18
- React Router v6
- Axios
- Tailwind CSS
- React Icons
- React Hot Toast

### Backend
- Node.js
- Express.js
- JWT Authentication
- bcrypt.js
- Multer (file uploads)
- MongoDB with Mongoose

## 📁 Project Structure

```
smart-residency/
├── backend/
│   ├── server.js
│   ├── config/
│   │   └── db.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Room.js
│   │   ├── Application.js
│   │   ├── Complaint.js
│   │   ├── FoodSubscription.js
│   │   ├── HousekeepingRequest.js
│   │   └── ActivityLog.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── roomController.js
│   │   ├── applicationController.js
│   │   ├── complaintController.js
│   │   ├── foodController.js
│   │   ├── housekeepingController.js
│   │   ├── adminController.js
│   │   └── staffController.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── rooms.js
│   │   ├── applications.js
│   │   ├── complaints.js
│   │   ├── food.js
│   │   ├── housekeeping.js
│   │   ├── admin.js
│   │   └── staff.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── upload.js
│   ├── uploads/
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── resident/
│   │   │   ├── admin/
│   │   │   └── staff/
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── ResidentDashboard.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   └── StaffDashboard.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

## 🔧 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/smart-residency
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
```

4. Start the backend server:
```bash
npm run dev
```

The backend server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## 🔐 Authentication

The system uses JWT (JSON Web Tokens) for authentication. Users can register with the following roles:
- **resident**: Default role for residents
- **admin**: Administrative access
- **staff**: Staff member access

## 📊 Database Collections

- **Users**: User accounts with role-based access
- **Rooms**: Room information and availability
- **Applications**: Room application requests
- **Complaints**: Complaint tracking and resolution
- **FoodSubscriptions**: Food service subscriptions
- **HousekeepingRequests**: Housekeeping service requests
- **ActivityLogs**: System activity tracking

## 🎨 Features Overview

### Security
- JWT-based authentication
- Password hashing with bcrypt
- Role-based authorization middleware
- Protected frontend routes
- Input validation and error handling

### User Experience
- Modern and responsive UI with Tailwind CSS
- Real-time status updates
- Image upload support for complaints
- CSV export for reports
- Loading and error states
- Toast notifications

## 🚀 Deployment

### Backend Deployment
1. Set environment variables on your hosting platform
2. Ensure MongoDB is accessible
3. Deploy to platforms like Heroku, Railway, or AWS

### Frontend Deployment
1. Build the production version:
```bash
npm run build
```
2. Deploy the `dist` folder to platforms like Vercel, Netlify, or AWS S3

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Rooms
- `GET /api/rooms` - Get all rooms
- `GET /api/rooms/available` - Get available rooms
- `GET /api/rooms/:id` - Get single room
- `POST /api/rooms` - Create room (Admin)
- `PUT /api/rooms/:id` - Update room (Admin)
- `DELETE /api/rooms/:id` - Delete room (Admin)

### Applications
- `POST /api/applications` - Create application (Resident)
- `GET /api/applications/my` - Get user's applications (Resident)
- `GET /api/applications/all` - Get all applications (Admin)
- `PUT /api/applications/:id/approve` - Approve application (Admin)
- `PUT /api/applications/:id/reject` - Reject application (Admin)

### Complaints
- `POST /api/complaints` - Create complaint (Resident)
- `GET /api/complaints/my` - Get user's complaints (Resident)
- `GET /api/complaints/all` - Get all complaints (Admin)
- `GET /api/complaints/assigned` - Get assigned complaints (Staff)
- `PUT /api/complaints/:id/assign` - Assign complaint (Admin)
- `PUT /api/complaints/:id/status` - Update complaint status (Staff/Admin)

### Food Services
- `GET /api/food/menu` - Get menu
- `GET /api/food/subscription` - Get subscription (Resident)
- `PUT /api/food/subscription` - Update subscription (Resident)
- `POST /api/food/feedback` - Submit feedback (Resident)

### Housekeeping
- `POST /api/housekeeping` - Create request (Resident)
- `GET /api/housekeeping/my` - Get user's requests (Resident)
- `GET /api/housekeeping/all` - Get all requests (Admin)
- `PUT /api/housekeeping/:id/status` - Update request status (Staff/Admin)

### Admin
- `GET /api/admin/dashboard` - Get dashboard stats
- `GET /api/admin/users` - Get all users
- `GET /api/admin/reports/occupancy` - Get occupancy report
- `GET /api/admin/reports/complaints` - Get complaint statistics

### Staff
- `GET /api/staff/dashboard` - Get dashboard stats

## 🤝 Contributing

This is a final-year academic project. Feel free to fork and enhance!

## 📄 License

This project is created for academic purposes.

## 👨‍💻 Author

Created as a comprehensive MERN stack project for hostel/residency management.

---

**Note**: Make sure to change the JWT_SECRET in production and use a secure MongoDB connection string.
