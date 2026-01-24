# 🎓 EduMeet – Smart Teacher Appointment & Recommendation System

EduMeet is a **full-stack MERN application** integrated with a **Machine Learning microservice** that enables students to book appointments with teachers and receive **intelligent teacher recommendations** based on subject preferences and past booking history.

The system uses a **hybrid recommendation approach**:
- 🤖 **ML-based recommendations** (when historical data exists)
- 📏 **Rule-based recommendations** (fallback when ML data is unavailable)

---

## 🚀 Key Features

### 👨‍🎓 Student Features
- Secure authentication & authorization (JWT)
- Browse approved teachers
- Book, cancel, and view appointments
- Subject-based teacher recommendations
- Hybrid recommendation display (ML / Rule-based)
- Email notifications for bookings

### 👩‍🏫 Teacher Features
- Profile management
- Availability management
- Appointment handling

### 🤖 Recommendation System
- ML-based recommendation using **KNN**
- Rule-based fallback using MongoDB subject matching
- Automatic switch between ML and rule-based logic
- Seamless backend ↔ ML microservice communication

---

### 🧠 Hybrid Recommendation Logic (Important)

The recommendation system works as follows:

IF subject exists in previous appointment history
    → Use ML-based recommendation
ELSE
    → Use rule-based recommendation (MongoDB subject match)

---

## 🔍 Why Hybrid?
- ML requires historical data
- New subjects or new systems may lack data
- Rule-based logic ensures no empty results
- Improves reliability and user experience

---

## 🛠️ Tech Stack
Frontend
- React.js
- Tailwind CSS
- Axios
- React Router

Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication

Machine Learning Service
- Python
- Flask
- scikit-learn
- KNN (Nearest Neighbors)
- Pandas & NumPy

Other Tools
- Nodemailer (Email Notifications)
- Git & GitHub

---

## 📂 Project Structure
edumeet/
│
├── frontend/                 # React frontend
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/                  # Node.js backend
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── utils/
│   ├── server.js
│   └── package.json
│
├── ml-service/               # ML microservice (Flask)
│   ├── app.py
│   ├── train.py
│   ├── export_data.py
│   ├── appointments.csv
│   ├── model.pkl
│   ├── student_encoder.pkl
│   ├── subject_encoder.pkl
│   └── requirements.txt
│
└── README.md

“Copy appointments.sample.csv → appointments.csv before training”

---

## ⚙️ Environment Variables
-Create a .env file inside backend/

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:5173
ML_SERVICE_URL=http://127.0.0.1:5001
⚠️ Never commit .env files to GitHub.

## ▶️ How to Run Locally

1️⃣ Clone Repository
- git clone https://github.com/your-username/edumeet.git
- cd edumeet

2️⃣ Backend Setup
- cd backend
- npm install
- npm run dev

3️⃣ ML Service Setup
- cd ml-service
- python -m venv venv
- venv\Scripts\activate   # Windows
- pip install -r requirements.txt
- python train.py
- python app.py

4️⃣ Frontend Setup
- cd frontend
- npm install
- npm run dev

## 📊 ML Model Details

Algorithm: K-Nearest Neighbors (KNN)

Features:
- Encoded Student ID
- Encoded Subject
- Training data: Derived from MongoDB appointments
- Output: Recommended Teacher IDs

## 🔐 Security Considerations
- JWT-based authentication
- Role-based access control
- Password hashing using bcrypt
- Sensitive files ignored via .gitignore

## 📌 Future Enhancements (Optional)
- Store teacher subjects as arrays
- Collaborative filtering
- Recommendation confidence score
- Docker deployment
- Cloud ML service hosting

## 👩‍💻 Author

- Developed by P.Lakshmi Sravani
B.Tech CSE | Full-Stack Developer | ML Enthusiast

⭐ If you like this project, give it a star!
