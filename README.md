# 🎓 EduMeet - Smart Appointment Scheduler

EduMeet is a **full-stack MERN web application** designed to streamline academic interactions by enabling students to book appointments with teachers based on real-time availability.

The system replaces informal communication with a **structured, secure, and conflict-free scheduling platform**, improving efficiency and transparency within educational institutions.

---

## 🚀 Key Features

### 👨‍🎓 Student Features
- Secure authentication & role-based access (JWT)
- Browse approved teachers
- Book appointments based on availability
- Conflict-free booking (no duplicate slots)
- Receive automated email notifications
- Submit ratings & feedback within a **48-hour window**
- Get **personalized teacher recommendations** based on booking history

---

### 👩‍🏫 Teacher Features
- Secure login and dashboard access
- Define and manage availability slots
- Accept or reject appointment requests
- View scheduled appointments

---

### 🛠️ Admin Features
- Approve or reject user registrations
- Manage students and teachers
- Monitor appointments centrally

---

## 🧠 Core Functionalities

- **Role-Based Access Control (RBAC)** for Admin, Teacher, and Student  
- **Availability-Based Scheduling** to ensure structured booking  
- **Conflict-Free Appointment System** using backend validation  
- **Automated Email Notifications** for booking and status updates  
- **48-Hour Rating System** enforced at backend  
- **Personalized Recommendation System** using booking history and recency logic  

---

## 🛠️ Tech Stack

### Frontend
- React.js
- Tailwind CSS
- Axios
- React Router

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- bcrypt.js

### Other Tools
- Nodemailer (Email Notifications)
- Git & GitHub

---

## 📂 Project Structure

```
📁 EDUMEET/
├── 📁 backend/
│   ├── 📁 config/
│   ├── 📁 controllers/
│   ├── 📁 middleware/
│   ├── 📁 models/
│   ├── 📁 node_modules/
│   ├── 📁 public/
│   ├── 📁 routes/
│   ├── 📁 utils/
│   ├── ⚙️ .env
│   ├── 📄 .gitignore
│   ├── 📄 package-lock.json
│   ├── 📄 package.json
│   └── 📄 server.js
└── 📁 frontend/
    ├── 📁 node_modules/
    ├── 📁 src/
    ├── 📄 index.html
    ├── 📄 package-lock.json
    ├── 📄 package.json
    ├── 📄 postcss.config.js
    ├── 📄 tailwind.config.js
    └── ⚡ vite.config.js
```

---

## ⚙️ Environment Variables

Create a `.env` file inside `backend/`: 
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email
EMAIL_PASS=your_app_password
FRONTEND_URL=http://localhost:5173


⚠️ Never commit `.env` files to GitHub.

---

## ▶️ How to Run Locally

### 1️⃣ Clone Repository

git clone https://github.com/your-username/edumeet-smart-scheduler.git

cd edumeet-smart-scheduler


### 2️⃣ Backend Setup

cd backend
npm install
npm run dev


### 3️⃣ Frontend Setup

cd frontend
npm install
npm run dev


---

## 🔐 Security Features
- JWT-based authentication
- Role-based authorization (RBAC)
- Password hashing using bcrypt
- Protected API routes
- Backend validation for critical operations

---

## 📌 Future Enhancements
- Real-time notifications using WebSockets
- Admin analytics dashboard (top-rated teachers, trends)
- Calendar integration (Google Calendar)
- Mobile application support
- Advanced recommendation system

---

## 👩‍💻 Team Members

This project was developed as part of a team collaboration:

- **P. Lakshmi Sravani** – Full Stack Development (Backend Logic, Database Management)
- **Divya Reddy** – Full Stack Development (API Development, Backend, Validation)
- **P. Ruthu Kumari** – Full Stack Development (Frontend Components, UI Design, API Integration)
- **S. Parveen Bhanu** – Full Stack Development (Testing, Debugging, Documentation, UI Enhancements)
---

⭐ If you like this project, consider giving it a star!
