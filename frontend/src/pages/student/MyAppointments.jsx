import { useState, useEffect } from 'react';
import { Calendar, Clock, User, BookOpen, MapPin, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [cancelModal, setCancelModal] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await api.get('/student/appointments');
      // Handle both response formats
      const appointmentsData = response.data.appointments || response.data.data || [];
      setAppointments(appointmentsData);
    } catch (error) {
      console.error('Fetch appointments error:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (id) => {
    if (!cancelReason.trim()) {
      toast.error('Please provide a reason for cancellation');
      return;
    }

    try {
      await api.put(`/student/appointments/${id}/cancel`, { cancelReason });
      toast.success('Appointment cancelled successfully');
      setCancelModal(null);
      setCancelReason('');
      fetchAppointments();
    } catch (error) {
      console.error('Cancel appointment error:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel appointment');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const filteredAppointments = appointments.filter(app => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') {
      return ['pending', 'confirmed'].includes(app.status) && new Date(app.date) >= new Date();
    }
    if (filter === 'past') {
      return app.status === 'completed' || new Date(app.date) < new Date();
    }
    return app.status === filter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
        <p className="mt-2 text-gray-600">View and manage your scheduled appointments</p>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all'
              ? 'bg-primary-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('upcoming')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'upcoming'
              ? 'bg-primary-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
          }`}
        >
          Upcoming
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'pending'
              ? 'bg-primary-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
          }`}
        >
          Pending
        </button>
        <button
          onClick={() => setFilter('confirmed')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'confirmed'
              ? 'bg-primary-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
          }`}
        >
          Confirmed
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'completed'
              ? 'bg-primary-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
          }`}
        >
          Completed
        </button>
        <button
          onClick={() => setFilter('cancelled')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'cancelled'
              ? 'bg-primary-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
          }`}
        >
          Cancelled
        </button>
      </div>

      {/* Appointments List */}
      {filteredAppointments.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
          <p className="text-gray-600">
            {filter === 'all' 
              ? 'You have not booked any appointments yet.'
              : `No ${filter} appointments found.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((appointment) => (
            <div
              key={appointment._id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary-100 p-3 rounded-full">
                        <User className="w-6 h-6 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {appointment.teacher?.name || 'Unknown Teacher'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {appointment.teacher?.department || appointment.teacher?.email}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusColor(appointment.status)}`}>
                      {getStatusIcon(appointment.status)}
                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <span>{new Date(appointment.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Clock className="w-5 h-5 text-gray-400" />
                      <span>{appointment.startTime} - {appointment.endTime}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <BookOpen className="w-5 h-5 text-gray-400" />
                      <span>{appointment.subject}</span>
                    </div>
                    {appointment.teacher?.email && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <MapPin className="w-5 h-5 text-gray-400" />
                        <span className="text-sm">{appointment.teacher.email}</span>
                      </div>
                    )}
                  </div>

                  {appointment.description && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Description: </span>
                        {appointment.description}
                      </p>
                    </div>
                  )}

                  {appointment.notes && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-900">
                        <span className="font-medium">Teacher's Note: </span>
                        {appointment.notes}
                      </p>
                    </div>
                  )}

                  {appointment.meetingLink && (
                    <div className="mb-4">
                      <a
                        href={appointment.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
                      >
                        <MapPin className="w-4 h-4" />
                        Join Meeting
                      </a>
                    </div>
                  )}

                  {appointment.cancelReason && (
                    <div className="mb-4 p-3 bg-red-50 rounded-lg">
                      <p className="text-sm text-red-900">
                        <span className="font-medium">Cancellation Reason: </span>
                        {appointment.cancelReason}
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                {appointment.status === 'pending' || appointment.status === 'confirmed' ? (
                  <div className="mt-4 lg:mt-0 lg:ml-6">
                    <button
                      onClick={() => setCancelModal(appointment._id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Cancel Appointment
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cancel Modal */}
      {cancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Cancel Appointment
            </h3>
            <p className="text-gray-600 mb-4">
              Please provide a reason for cancelling this appointment:
            </p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Enter cancellation reason..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 mb-4"
              rows="4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setCancelModal(null);
                  setCancelReason('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => handleCancelAppointment(cancelModal)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAppointments;