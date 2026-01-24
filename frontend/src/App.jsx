import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Public Pages
import Landing from './pages/Landing';
import Register from './pages/Register';
import Login from './pages/Login';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminHome from './pages/admin/AdminHome';
import PendingUsers from './pages/admin/PendingUsers';
import ManageTeachers from './pages/admin/ManageTeachers';
import ManageStudents from './pages/admin/ManageStudents';
import AllAppointments from './pages/admin/AllAppointments';
import AdminProfilePage from './pages/admin/AdminProfile';

// Teacher Pages
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherHome from './pages/teacher/TeacherHome';
import ManageAppointments from './pages/teacher/ManageAppointments';
import SetAvailability from './pages/teacher/SetAvailability';
import TeacherProfilePage from './pages/teacher/TeacherProfile';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentHome from './pages/student/StudentHome';
import BrowseTeachers from './pages/student/BrowseTeachers';
import BookAppointment from './pages/student/BookAppointment';
import MyAppointments from './pages/student/MyAppointments';
import StudentProfilePage from './pages/student/StudentProfile';

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/"
        element={
          user ? (
            user.role === "teacher" ?
              <Navigate to="/teacher/dashboard" replace /> :
              <Navigate to={`/${user.role}/home`} replace />
          ) : (
            <Landing />
          )
        }
      />

      <Route
        path="/login"
        element={
          user ? (
            user.role === "teacher" ?
              <Navigate to="/teacher/dashboard" replace /> :
              <Navigate to={`/${user.role}/home`} replace />
          ) : (
            <Login />
          )
        }
      />

      <Route
        path="/register"
        element={
          user ? (
            user.role === "teacher" ?
              <Navigate to="/teacher/dashboard" replace /> :
              <Navigate to={`/${user.role}/home`} replace />
          ) : (
            <Register />
          )
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin/*"
        element={user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/login" replace />}
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminHome />} />
        <Route path="pending-users" element={<PendingUsers />} />
        <Route path="teachers" element={<ManageTeachers />} />
        <Route path="students" element={<ManageStudents />} />
        <Route path="appointments" element={<AllAppointments />} />
        <Route path="profile" element={<AdminProfilePage />} />
      </Route>

      {/* Teacher Routes */}
      <Route
        path="/teacher/*"
        element={user?.role === 'teacher' ? <TeacherDashboard /> : <Navigate to="/login" replace />}
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<TeacherHome />} />
        <Route path="appointments" element={<ManageAppointments />} />
        <Route path="availability" element={<SetAvailability />} />
        <Route path="profile" element={<TeacherProfilePage />} />
      </Route>

      {/* Student Routes */}
      <Route
        path="/student/*"
        element={user?.role === 'student' ? <StudentDashboard /> : <Navigate to="/login" replace />}
      >
        <Route index element={<Navigate to="home" replace />} />
        <Route path="home" element={<StudentHome />} />
        <Route path="browse" element={<BrowseTeachers />} />
        <Route path="book/:teacherId" element={<BookAppointment />} />
        <Route path="appointments" element={<MyAppointments />} />
        <Route path="profile" element={<StudentProfilePage />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Toaster position="top-right" />
          <AppRoutes />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
