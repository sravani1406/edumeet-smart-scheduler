import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Mail, Phone, Building2, BookOpen, User } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const PendingUsers = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const fetchPendingUsers = async () => {
    try {
      const response = await api.get('/admin/pending-users');
      setPendingUsers(response.data);
    } catch (error) {
      toast.error('Failed to fetch pending users');
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    try {
      await api.put(`/admin/approve-user/${userId}`);
      toast.success('User approved successfully');
      fetchPendingUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve user');
    }
  };

  const handleReject = async (userId) => {
    if (!window.confirm('Are you sure you want to reject this user? This action cannot be undone.')) {
      return;
    }

    try {
      await api.put(`/admin/reject-user/${userId}`);
      toast.success('User rejected successfully');
      fetchPendingUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject user');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Pending User Approvals</h1>
        <p className="mt-2 text-gray-600">Review and approve or reject user registrations</p>
      </div>

      {pendingUsers.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Approvals</h3>
          <p className="text-gray-600">All user registrations have been reviewed.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {pendingUsers.map((user) => (
            <div key={user._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-full ${
                    user.role === 'teacher' ? 'bg-blue-100' : 'bg-green-100'
                  }`}>
                    {user.role === 'teacher' ? (
                      <BookOpen className={`w-6 h-6 ${user.role === 'teacher' ? 'text-blue-600' : 'text-green-600'}`} />
                    ) : (
                      <User className="w-6 h-6 text-green-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                      user.role === 'teacher' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-gray-700">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{user.phone}</span>
                  </div>
                )}
                {user.department && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Building2 className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{user.department}</span>
                  </div>
                )}
                {user.subject && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <BookOpen className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{user.subject}</span>
                  </div>
                )}
              </div>

              <div className="text-xs text-gray-500 mb-4">
                Registered: {new Date(user.createdAt).toLocaleDateString()}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleApprove(user._id)}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve
                </button>
                <button
                  onClick={() => handleReject(user._id)}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingUsers;