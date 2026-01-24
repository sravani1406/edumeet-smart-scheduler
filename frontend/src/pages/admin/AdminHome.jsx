import React, { useState, useEffect } from 'react';
import { Users, GraduationCap, UserCheck, Calendar, TrendingUp } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const AdminHome = () => {
  const [stats, setStats] = useState({
    totalTeachers: 0,
    totalStudents: 0,
    pendingApprovals: 0,
    totalAppointments: 0,
    upcomingAppointments: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/stats');
      setStats(response.data);
    } catch (error) {
      toast.error('Failed to fetch statistics');
      console.error('Stats error:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Teachers',
      value: stats.totalTeachers,
      icon: GraduationCap,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700'
    },
    {
      title: 'Total Students',
      value: stats.totalStudents,
      icon: Users,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700'
    },
    {
      title: 'Pending Approvals',
      value: stats.pendingApprovals,
      icon: UserCheck,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-700'
    },
    {
      title: 'Total Appointments',
      value: stats.totalAppointments,
      icon: Calendar,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700'
    },
    {
      title: 'Upcoming Appointments',
      value: stats.upcomingAppointments,
      icon: TrendingUp,
      color: 'bg-indigo-500',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-700'
    }
  ];

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
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="mt-2 text-gray-600">Welcome back! Here's what's happening with EduMeet today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`${stat.bgColor} p-3 rounded-full`}>
                <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pending Approvals Alert */}
      {stats.pendingApprovals > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <UserCheck className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                You have <span className="font-semibold">{stats.pendingApprovals}</span> pending user approval{stats.pendingApprovals > 1 ? 's' : ''}.
                <a href="/admin/pending-users" className="font-medium underline ml-2 hover:text-yellow-800">
                  Review now
                </a>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <a
            href="/admin/pending-users"
            className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all"
          >
            <UserCheck className="w-6 h-6 text-primary-600" />
            <span className="font-medium text-gray-700">Approve Users</span>
          </a>
          <a
            href="/admin/teachers"
            className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all"
          >
            <GraduationCap className="w-6 h-6 text-primary-600" />
            <span className="font-medium text-gray-700">Manage Teachers</span>
          </a>
          <a
            href="/admin/students"
            className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all"
          >
            <Users className="w-6 h-6 text-primary-600" />
            <span className="font-medium text-gray-700">Manage Students</span>
          </a>
          <a
            href="/admin/appointments"
            className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all"
          >
            <Calendar className="w-6 h-6 text-primary-600" />
            <span className="font-medium text-gray-700">View Appointments</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminHome;