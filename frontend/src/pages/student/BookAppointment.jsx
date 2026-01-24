import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, ArrowLeft, Send, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const BookAppointment = () => {
  const { teacherId } = useParams();
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    startTime: '',
    endTime: '',
    subject: '',
    description: ''
  });

  useEffect(() => {
    if (teacherId) {
      fetchTeacherData();
    }
  }, [teacherId]);

  const fetchTeacherData = async () => {
    try {
      const [teacherRes, availabilityRes] = await Promise.all([
        api.get(`/student/teachers/${teacherId}`),
        api.get(`/student/teachers/${teacherId}/availability`),
      ]);
      
      setTeacher(teacherRes.data.name ? teacherRes.data : teacherRes.data.teacher);
      
      // Backend returns the availability document directly
      const availabilityData = availabilityRes.data;
      
      // Convert the slots object to array format for frontend
      if (availabilityData && availabilityData.slots) {
        const convertedAvailability = Object.keys(availabilityData.slots)
          .filter(day => availabilityData.slots[day] && availabilityData.slots[day].length > 0)
          .map(day => ({
            dayOfWeek: day,
            timeSlots: availabilityData.slots[day].map(slot => ({
              startTime: slot.start,
              endTime: slot.end
            }))
          }));
        setAvailability(convertedAvailability);
      } else {
        setAvailability([]);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to fetch teacher details');
      navigate('/student/teachers');
    } finally {
      setLoading(false);
    }
  };

  const getAvailableTimeSlots = () => {
    if (!formData.date) return [];

    const selectedDate = new Date(formData.date);
    const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' });
    
    const dayAvailability = availability.find(a => a.dayOfWeek === dayName);
    return dayAvailability?.timeSlots || [];
  };

  // Convert time from 12-hour to 24-hour format (HH:MM)
  const convertTo24Hour = (time12h) => {
    if (!time12h) return '';
    
    const cleaned = time12h.trim();
    
    // If already in 24-hour format (no AM/PM), return as is
    if (!cleaned.includes('AM') && !cleaned.includes('PM')) {
      return cleaned;
    }
    
    // Split by space to separate time and AM/PM
    const parts = cleaned.split(' ');
    if (parts.length !== 2) return cleaned;
    
    const [time, modifier] = parts;
    const [hoursStr, minutesStr] = time.split(':');
    
    let hours = parseInt(hoursStr, 10);
    const minutes = minutesStr || '00';
    
    // Convert to 24-hour format
    if (modifier === 'PM' && hours !== 12) {
      hours = hours + 12;
    } else if (modifier === 'AM' && hours === 12) {
      hours = 0;
    }
    
    // Ensure two-digit format
    const hours24 = String(hours).padStart(2, '0');
    const mins24 = String(minutes).padStart(2, '0');
    
    return `${hours24}:${mins24}`;
  };

  const handleTimeSlotSelect = (slot) => {
    setFormData({
      ...formData,
      startTime: slot.startTime,
      endTime: slot.endTime
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.date || !formData.startTime || !formData.endTime || !formData.subject || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    // Check description length
    if (formData.description.length < 10) {
      toast.error('Description must be at least 10 characters');
      return;
    }
    
    // Date validation
    const selectedDate = new Date(formData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      toast.error('Cannot book appointments for past dates');
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Convert times to 24-hour format
      const startTime24 = convertTo24Hour(formData.startTime);
      const endTime24 = convertTo24Hour(formData.endTime);
      
      console.log('Original times:', formData.startTime, formData.endTime);
      console.log('Converted times:', startTime24, endTime24);
      
      // Send data matching the Appointment model schema
      const payload = {
        teacher: teacherId,
        date: formData.date,
        startTime: startTime24,
        endTime: endTime24,
        subject: formData.subject,
        description: formData.description
      };
      
      console.log('Sending payload:', payload);
      
      await api.post('/student/appointments', payload);
      
      toast.success('Appointment booked successfully! Waiting for teacher confirmation.');
      navigate('/student/appointments');
    } catch (error) {
      console.error('Book appointment error:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to book appointment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const availableSlots = getAvailableTimeSlots();

  return (
    <div>
      <button
        onClick={() => navigate('/student/browse')}
        className="flex items-center text-green-600 hover:text-green-700 mb-6"
      >
        <ArrowLeft size={20} className="mr-2" />
        Back to Teachers
      </button>

      <div className="max-w-4xl mx-auto">
        {/* Teacher Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0 h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
              <User size={32} className="text-green-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-2xl font-bold text-gray-900">{teacher?.name}</h2>
              <p className="text-gray-600">{teacher?.designation}</p>
              <p className="text-sm text-gray-500">{teacher?.department}</p>
            </div>
          </div>

          {/* Show Availability */}
          {availability.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-sm mb-2">Teacher's Available Days:</h3>
              <div className="flex flex-wrap gap-2">
                {availability.map((avail, idx) => (
                  <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {avail.dayOfWeek}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Booking Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Book an Appointment</h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Date Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline mr-2" size={18} />
                Select Date *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value, startTime: '', endTime: '' })}
                min={new Date().toISOString().split('T')[0]}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Time Slot Selection */}
            {formData.date && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="inline mr-2" size={18} />
                  Select Time Slot *
                </label>
                {availableSlots.length === 0 ? (
                  <p className="text-sm text-gray-500 italic p-4 bg-gray-50 rounded-lg">
                    No available slots for this day. Please select another date.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {availableSlots.map((slot, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleTimeSlotSelect(slot)}
                        className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                          formData.startTime === slot.startTime && formData.endTime === slot.endTime
                            ? 'bg-green-600 text-white border-green-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-green-500'
                        }`}
                      >
                        {slot.startTime} - {slot.endTime}
                      </button>
                    ))}
                  </div>
                )}
                {formData.startTime && formData.endTime && (
                  <p className="text-sm text-green-600 mt-2">
                    ✓ Selected: {formData.startTime} - {formData.endTime}
                  </p>
                )}
              </div>
            )}

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <BookOpen className="inline mr-2" size={18} />
                Subject/Topic *
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="e.g., Doubt in Chapter 5, Project Discussion"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description * (Minimum 10 characters)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your concern or what you'd like to discuss..."
                rows={4}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.description.length}/10 characters
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate('/student/teachers')}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={18} className="mr-2" />
                {submitting ? 'Booking...' : 'Book Appointment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;