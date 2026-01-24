import { useState, useEffect } from 'react';
import { Clock, Save, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const SetAvailability = () => {
  const [availability, setAvailability] = useState({
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM',
    '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM'
  ];

  useEffect(() => {
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
  try {
    const response = await api.get('/teacher/availability');
    console.log('Fetched availability:', response.data);

    const slots = response.data.slots || {};

    setAvailability({
      Monday: slots.Monday || [],
      Tuesday: slots.Tuesday || [],
      Wednesday: slots.Wednesday || [],
      Thursday: slots.Thursday || [],
      Friday: slots.Friday || [],
      Saturday: slots.Saturday || [],
      Sunday: slots.Sunday || [],
    });
  } catch (error) {
    console.error('Fetch availability error:', error);
    if (error.response?.status !== 404) {
      toast.error('Failed to fetch availability');
    }
  } finally {
    setLoading(false);
  }
};



  const handleAddSlot = (day) => {
    setAvailability({
      ...availability,
      [day]: [...availability[day], { start: '', end: '' }]
    });
  };

  const handleRemoveSlot = (day, index) => {
    const newSlots = availability[day].filter((_, i) => i !== index);
    setAvailability({
      ...availability,
      [day]: newSlots
    });
  };

  const handleSlotChange = (day, index, field, value) => {
    const newSlots = [...availability[day]];
    newSlots[index][field] = value;
    setAvailability({
      ...availability,
      [day]: newSlots
    });
  };

  const handleSave = async () => {
  setSaving(true);

  try {
    const formattedSlots = [];

    Object.entries(availability).forEach(([day, slots]) => {
      slots.forEach((slot) => {
        if (slot.start && slot.end) {
          formattedSlots.push({
            day: day,          // ✅ ensure correct day
            start: slot.start,
            end: slot.end
          });
        }
      });
    });

    console.log("SENDING TO BACKEND:", formattedSlots); // 🔥 CRITICAL

    if (formattedSlots.length === 0) {
      toast.error("Please add at least one time slot");
      setSaving(false);
      return;
    }

    const res = await api.post("/teacher/availability", {
      slots: formattedSlots
    });

    console.log("BACKEND RESPONSE:", res.data); // 🔥 CRITICAL

    toast.success("Availability saved successfully");
  } catch (error) {
    console.error("SAVE ERROR:", error);
    toast.error("Failed to save availability");
  } finally {
    setSaving(false);
  }
};



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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Set Availability</h1>
        <p className="text-gray-600">Define your weekly availability for student appointments</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="space-y-6">
          {Object.keys(availability).map((day) => (
            <div key={day} className="border-b border-gray-200 pb-6 last:border-b-0">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{day}</h3>
                <button
                  onClick={() => handleAddSlot(day)}
                  className="flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus size={16} className="mr-1" />
                  Add Slot
                </button>
              </div>

              {availability[day].length === 0 ? (
                <p className="text-sm text-gray-500 italic">No time slots added</p>
              ) : (
                <div className="space-y-3">
                  {availability[day].map((slot, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2 flex-1">
                        <Clock size={18} className="text-gray-400" />
                        <select
                          value={slot.start}
                          onChange={(e) => handleSlotChange(day, index, 'start', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Start Time</option>
                          {timeSlots.map((time) => (
                            <option key={time} value={time}>{time}</option>
                          ))}
                        </select>
                        <span className="text-gray-500">to</span>
                        <select
                          value={slot.end}
                          onChange={(e) => handleSlotChange(day, index, 'end', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">End Time</option>
                          {timeSlots.map((time) => (
                            <option key={time} value={time}>{time}</option>
                          ))}
                        </select>
                      </div>
                      <button
                        onClick={() => handleRemoveSlot(day, index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={18} className="mr-2" />
            {saving ? 'Saving...' : 'Save Availability'}
          </button>
        </div>
      </div>

      {/* Quick Tips */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">Quick Tips:</h4>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Add multiple time slots for each day to accommodate more students</li>
          <li>Students can only book appointments during your available time slots</li>
          <li>Update your availability regularly to reflect your schedule changes</li>
          <li>Leave days empty if you're not available on those days</li>
        </ul>
      </div>
    </div>
  );
};

export default SetAvailability;