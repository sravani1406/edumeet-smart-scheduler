import { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const StudentHome = () => {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
  });
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/student/appointments');
      // Handle both response formats
      const appointments = response.data.appointments || response.data.data || [];
      
      setRecentAppointments(Array.isArray(appointments) ? appointments.slice(0, 5) : []);

      setStats({
        total: appointments.length,
        pending: appointments.filter(a => a.status === 'pending').length,
        confirmed: appointments.filter(a => a.status === 'confirmed').length,
        completed: appointments.filter(a => a.status === 'completed').length,
        cancelled: appointments.filter(a => a.status === 'cancelled').length,
      });
    } catch (error) {
      console.error('Dashboard error:', error);
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back!</h1>
        <p className="text-gray-600">Here's an overview of your appointments</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Calendar className="text-gray-400" size={32} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <AlertCircle className="text-yellow-400" size={32} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Confirmed</p>
              <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
            </div>
            <CheckCircle className="text-green-400" size={32} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-blue-600">{stats.completed}</p>
            </div>
            <CheckCircle className="text-blue-400" size={32} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Cancelled</p>
              <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
            </div>
            <XCircle className="text-red-400" size={32} />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Link
          to="/student/browse"
          className="bg-gradient-to-r from-primary-500 to-primary-600 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow text-white"
        >
          <div className="flex items-center">
            <div className="bg-white bg-opacity-20 p-3 rounded-full">
              <Users className="h-8 w-8" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold">Browse Teachers</h3>
              <p className="text-primary-100">Find and book appointments with teachers</p>
            </div>
          </div>
        </Link>

        <Link
          to="/student/appointments"
          className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow text-white"
        >
          <div className="flex items-center">
            <div className="bg-white bg-opacity-20 p-3 rounded-full">
              <Calendar className="h-8 w-8" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold">My Appointments</h3>
              <p className="text-blue-100">View and manage your appointments</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Appointments */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Appointments</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {recentAppointments.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <p>No appointments yet</p>
              <Link to="/student/browse" className="text-primary-600 hover:text-primary-700 font-medium mt-2 inline-block">
                Browse teachers to book your first appointment
              </Link>
            </div>
          ) : (
            recentAppointments.map((appointment) => (
              <div key={appointment._id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-600 font-semibold">
                          {appointment.teacher?.name?.charAt(0).toUpperCase() || 'T'}
                        </span>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900">
                          {appointment.teacher?.name || 'Unknown Teacher'}
                        </p>
                        <p className="text-sm text-gray-500">{appointment.subject}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="flex items-center text-sm text-gray-900">
                        <Calendar size={14} className="mr-2" />
                        {new Date(appointment.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <Clock size={14} className="mr-2" />
                        {appointment.startTime} - {appointment.endTime}
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentHome;