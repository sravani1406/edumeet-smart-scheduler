import { useState, useEffect } from 'react';
import { Calendar, Clock, User, Filter, Search, BookOpen, Mail, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const AllAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await api.get('/admin/appointments');
      setAppointments(response.data);
    } catch (error) {
      toast.error('Failed to fetch appointments');
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    const matchesFilter = filter === 'all' || apt.status === filter;
    const matchesSearch = searchTerm === '' || 
      apt.student?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.teacher?.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: appointments.length,
    pending: appointments.filter(a => a.status === 'pending').length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">All Appointments</h1>
        <p className="text-gray-600">View and monitor all appointment bookings</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Total</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Confirmed</p>
          <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Completed</p>
          <p className="text-2xl font-bold text-blue-600">{stats.completed}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Cancelled</p>
          <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by student or teacher name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={20} className="text-gray-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Appointments List */}
      {filteredAppointments.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Appointments Found</h3>
          <p className="text-gray-600">No appointments match your search criteria.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((appointment) => (
            <div key={appointment._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(appointment.status)}`}>
                  {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                </span>
                <div className="text-sm text-gray-500">
                  Booked on {new Date(appointment.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                {/* Student Info */}
                <div className="border-r border-gray-200 pr-6">
                  <h4 className="text-sm font-semibold text-gray-500 uppercase mb-3">Student</h4>
                  <div className="flex items-start gap-3">
                    <div className="bg-green-100 p-2 rounded-full">
                      <User size={20} className="text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{appointment.student?.name || 'N/A'}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                        <Mail size={14} />
                        {appointment.student?.email || 'N/A'}
                      </div>
                      {appointment.student?.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                          <Phone size={14} />
                          {appointment.student.phone}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Teacher Info */}
                <div className="pl-0 md:pl-6">
                  <h4 className="text-sm font-semibold text-gray-500 uppercase mb-3">Teacher</h4>
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <User size={20} className="text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{appointment.teacher?.name || 'N/A'}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                        <Mail size={14} />
                        {appointment.teacher?.email || 'N/A'}
                      </div>
                      {appointment.teacher?.department && (
                        <p className="text-sm text-gray-600 mt-1">{appointment.teacher.department}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Appointment Details */}
              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-sm font-semibold text-gray-500 uppercase mb-3">Appointment Details</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Calendar size={16} className="text-gray-400" />
                    <span className="font-medium">Date:</span>
                    <span>{new Date(appointment.date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Clock size={16} className="text-gray-400" />
                    <span className="font-medium">Time:</span>
                    <span>
                      {appointment.startTime && appointment.endTime 
                        ? `${appointment.startTime} - ${appointment.endTime}`
                        : appointment.timeSlot || 'Not specified'}
                    </span>
                  </div>
                </div>

                {(appointment.subject || appointment.purpose) && (
                  <div className="mb-3">
                    <div className="flex items-start gap-2 text-gray-700">
                      <BookOpen size={16} className="text-gray-400 mt-0.5" />
                      <div>
                        <span className="font-medium">Subject/Purpose:</span>
                        <p className="text-gray-600 mt-1">{appointment.subject || appointment.purpose}</p>
                      </div>
                    </div>
                  </div>
                )}

                {appointment.description && (
                  <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-1">Description:</p>
                    <p className="text-sm text-gray-600">{appointment.description}</p>
                  </div>
                )}

                {appointment.notes && (
                  <div className="mb-3 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-900 mb-1">Teacher's Notes:</p>
                    <p className="text-sm text-blue-800">{appointment.notes}</p>
                  </div>
                )}

                {appointment.meetingLink && (
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-700 mb-1">Meeting Link:</p>
                    <a
                      href={appointment.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-purple-600 hover:text-purple-700 underline"
                    >
                      {appointment.meetingLink}
                    </a>
                  </div>
                )}

                {appointment.cancelReason && (
                  <div className="p-3 bg-red-50 rounded-lg">
                    <p className="text-sm font-medium text-red-900 mb-1">Cancellation Reason:</p>
                    <p className="text-sm text-red-800">{appointment.cancelReason}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllAppointments;