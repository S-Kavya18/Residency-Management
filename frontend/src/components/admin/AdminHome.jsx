import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Link } from 'react-router-dom';
import { FiUsers, FiHome, FiFileText, FiAlertCircle } from 'react-icons/fi';

const AdminHome = () => {
  const [stats, setStats] = useState({
    totalResidents: 0,
    totalRooms: 0,
    occupiedRooms: 0,
    availableRooms: 0,
    occupancyRate: 0,
    pendingApplications: 0,
    activeComplaints: 0,
    recentApplications: [],
    recentComplaints: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/admin/dashboard');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Residents</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalResidents}</p>
            </div>
            <FiUsers className="text-4xl text-indigo-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Occupancy Rate</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.occupancyRate}%</p>
            </div>
            <FiHome className="text-4xl text-indigo-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Pending Applications</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.pendingApplications}</p>
            </div>
            <FiFileText className="text-4xl text-indigo-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Active Complaints</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.activeComplaints}</p>
            </div>
            <FiAlertCircle className="text-4xl text-indigo-600" />
          </div>
        </div>
      </div>

      {/* Room Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-gray-600 text-sm">Total Rooms</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{stats.totalRooms}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-gray-600 text-sm">Occupied Rooms</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{stats.occupiedRooms}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-gray-600 text-sm">Available Rooms</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{stats.availableRooms}</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent Applications</h2>
            <Link
              to="/admin/applications"
              className="text-indigo-600 hover:text-indigo-700 text-sm"
            >
              View All
            </Link>
          </div>
          {stats.recentApplications.length === 0 ? (
            <p className="text-gray-600">No pending applications</p>
          ) : (
            <div className="space-y-3">
              {stats.recentApplications.map((app) => (
                <div key={app._id} className="border border-gray-200 rounded-lg p-3">
                  <p className="font-semibold">{app.userId?.name}</p>
                  <p className="text-sm text-gray-600">
                    Room: {app.roomId?.roomNumber} ({app.roomType})
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(app.appliedDate).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent Complaints</h2>
            <Link
              to="/admin/complaints"
              className="text-indigo-600 hover:text-indigo-700 text-sm"
            >
              View All
            </Link>
          </div>
          {stats.recentComplaints.length === 0 ? (
            <p className="text-gray-600">No active complaints</p>
          ) : (
            <div className="space-y-3">
              {stats.recentComplaints.map((complaint) => (
                <div key={complaint._id} className="border border-gray-200 rounded-lg p-3">
                  <p className="font-semibold">{complaint.title}</p>
                  <p className="text-sm text-gray-600">
                    By: {complaint.userId?.name} | Priority: {complaint.priority}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(complaint.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminHome;
