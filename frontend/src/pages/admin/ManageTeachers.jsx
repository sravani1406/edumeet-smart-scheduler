import { useState, useEffect } from 'react';
import { Users, Mail, Phone, Building, BookOpen, Trash2, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const ManageTeachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const response = await api.get('/admin/teachers');
      setTeachers(response.data);
    } catch (error) {
      toast.error('Failed to fetch teachers');
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this teacher? All their appointments will also be deleted.')) {
      return;
    }

    try {
      await api.delete(`/admin/users/${id}`);
      toast.success('Teacher deleted successfully');
      fetchTeachers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete teacher');
    }
  };

  const filteredTeachers = teachers.filter(teacher =>
    teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.subject?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Teachers</h1>
        <p className="text-gray-600">View and manage all approved teachers</p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search teachers by name, email, department, or subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Total Teachers</p>
            <p className="text-2xl font-bold text-gray-900">{teachers.length}</p>
          </div>
          <Users className="text-blue-600" size={32} />
        </div>
      </div>

      {/* Teachers Grid */}
      {filteredTeachers.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Teachers Found</h3>
          <p className="text-gray-600">No teachers match your search criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredTeachers.map((teacher) => (
            <div key={teacher._id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-full bg-blue-100">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{teacher.name}</h3>
                    <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      Teacher
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-gray-700">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">{teacher.email}</span>
                </div>
                {teacher.phone && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{teacher.phone}</span>
                  </div>
                )}
                {teacher.department && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Building className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{teacher.department}</span>
                  </div>
                )}
                {teacher.subject && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <BookOpen className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">Subject: {teacher.subject}</span>
                  </div>
                )}
              </div>

              <div className="text-xs text-gray-500 mb-4">
                Joined: {new Date(teacher.createdAt).toLocaleDateString()}
              </div>

              <button
                onClick={() => handleDelete(teacher._id)}
                className="w-full flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete Teacher
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageTeachers;