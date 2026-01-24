import { useState, useEffect } from 'react';
import { Calendar, Clock, User, Check, X, Filter, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const ManageAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
  try {
    const response = await api.get('/teacher/appointments');

    // ✅ FIX: make sure appointments is always an array
    const data = Array.isArray(response.data)
      ? response.data
      : response.data.appointments || [];

    setAppointments(data);
  } catch (error) {
    toast.error('Failed to fetch appointments');
    console.error('Fetch error:', error);
  } finally {
    setLoading(false);
  }
};


  const handleStatusUpdate = async (id, status) => {
    try {
      await api.put(`/teacher/appointments/${id}`, { status });
      toast.success(`Appointment ${status} successfully`);
      fetchAppointments();
    } catch (error) {
      toast.error(`Failed to ${status} appointment`);
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

  const filteredAppointments = appointments.filter(apt => 
    filter === 'all' || apt.status === filter
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Manage Appointments</h1>
        <p className="text-gray-600">Review and manage your appointment requests</p>
      </div>

      {/* Filter */}
      <div className="mb-6 flex items-center gap-2">
        <Filter size={20} className="text-gray-400" />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Appointments</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        {filteredAppointments.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">
            No appointments found
          </div>
        ) : (
          filteredAppointments.map((appointment) => (
            <div key={appointment._id} className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-4">
                    <div className="flex-shrink-0 h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User size={24} className="text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        {appointment.student?.name || 'Unknown Student'}
                      </h3>
                      <p className="text-sm text-gray-500">{appointment.student?.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center text-sm text-gray-700">
                      <Calendar size={16} className="mr-2 text-gray-400" />
                      <span className="font-medium">Date:</span>
                      <span className="ml-2">{new Date(appointment.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <Clock size={16} className="mr-2 text-gray-400" />
                      <span className="font-medium">Time:</span>
                      <span className="ml-2">
                        {appointment.startTime && appointment.endTime 
                          ? `${appointment.startTime} - ${appointment.endTime}`
                          : appointment.timeSlot || 'Not specified'}
                      </span>
                    </div>
                  </div>

                  {appointment.subject && (
                    <div className="mb-4">
                      <div className="flex items-center text-sm text-gray-700 mb-1">
                        <BookOpen size={16} className="mr-2 text-gray-400" />
                        <span className="font-medium">Subject:</span>
                      </div>
                      <p className="text-sm text-gray-600 ml-6">{appointment.subject}</p>
                    </div>
                  )}

                  {appointment.purpose && !appointment.subject && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-1">Purpose:</p>
                      <p className="text-sm text-gray-600">{appointment.purpose}</p>
                    </div>
                  )}

                  {appointment.description && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-700 mb-1">Description:</p>
                      <p className="text-sm text-gray-600">{appointment.description}</p>
                    </div>
                  )}

                  {appointment.notes && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium text-blue-900 mb-1">Notes:</p>
                      <p className="text-sm text-blue-800">{appointment.notes}</p>
                    </div>
                  )}

                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-700 mr-2">Status:</span>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </span>
                  </div>
                </div>

                {appointment.status === 'pending' && (
                  <div className="mt-4 md:mt-0 md:ml-6 flex flex-col space-y-2">
                    <button
                      onClick={() => handleStatusUpdate(appointment._id, 'confirmed')}
                      className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Check size={18} className="mr-2" />
                      Confirm
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(appointment._id, 'cancelled')}
                      className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <X size={18} className="mr-2" />
                      Cancel
                    </button>
                  </div>
                )}

                {appointment.status === 'confirmed' && (
  <div className="mt-4 md:mt-0 md:ml-6 space-y-3">

    {/* Mark Complete Button */}
    <button
      onClick={() => handleStatusUpdate(appointment._id, 'completed')}
      className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
    >
      <Check size={18} className="mr-2" />
      Mark Complete
    </button>

    {/* ✅ Meeting Link Input */}
    <input
      type="text"
      placeholder="Paste Zoom / Google Meet link"
      defaultValue={appointment.meetingLink || ""}
      className="w-full border px-3 py-2 rounded"
      onBlur={async (e) => {
        if (!e.target.value) return;

        try {
          await api.put(
            `/teacher/appointments/${appointment._id}/meeting-link`,
            { meetingLink: e.target.value }
          );
          toast.success("Meeting link saved");
          fetchAppointments();
        } catch {
          toast.error("Failed to save meeting link");
        }
      }}
    />
  </div>
)}

              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ManageAppointments;