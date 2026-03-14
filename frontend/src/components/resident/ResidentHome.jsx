import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiHome, FiFileText, FiAlertCircle, FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';

const ResidentHome = () => {
  const { user, refreshUser } = useAuth();
  const [stats, setStats] = useState({
    roomStatus: null,
    applicationStatus: null,
    complaintCount: 0,
    subscriptionStatus: false
  });
  const [loading, setLoading] = useState(true);
  const [emergencyLoading, setEmergencyLoading] = useState(false);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user?.roomId, user]);

  const fetchDashboardData = async () => {
    try {
      const roomPromise = user?.roomId
        ? typeof user.roomId === 'object' && user.roomId.roomNumber
          ? Promise.resolve({ data: user.roomId })
          : api.get(`/rooms/${user.roomId}`)
        : Promise.resolve(null);

      const [roomRes, appRes, complaintRes, foodRes] = await Promise.all([
        roomPromise,
        api.get('/applications/my'),
        api.get('/complaints/my'),
        api.get('/food/subscription')
      ]);

      const approvedApplication = appRes.data.find(
        app => app.status === 'approved' && !app.actualCheckOutAt
      ) || null;
      let roomStatus = roomRes?.data || approvedApplication?.roomId || null;

      if (approvedApplication?.roomId && (!roomStatus || !roomStatus.roomNumber)) {
        const approvedRoomId = typeof approvedApplication.roomId === 'object'
          ? approvedApplication.roomId._id
          : approvedApplication.roomId;
        if (approvedRoomId) {
          try {
            const approvedRoomRes = await api.get(`/rooms/${approvedRoomId}`);
            roomStatus = approvedRoomRes.data;
          } catch (roomError) {
            roomStatus = roomStatus || null;
          }
        }
      }

      setStats({
        roomStatus,
        applicationStatus: appRes.data.find(app => app.status === 'pending') || null,
        complaintCount: complaintRes.data.filter(c => c.status !== 'resolved' && c.status !== 'closed').length,
        subscriptionStatus: foodRes.data.isSubscribed || false
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEmergency = async () => {
    if (emergencyLoading) return;

    const defaultMessage = stats.roomStatus?.roomNumber
      ? `Emergency assistance needed in room ${stats.roomStatus.roomNumber}`
      : 'Emergency assistance needed';
    const message = window.prompt('Describe the emergency (optional):', defaultMessage);
    if (message === null) return; // user cancelled

    setEmergencyLoading(true);
    try {
      await api.post('/complaints/emergency', { description: message });
      toast.success('Emergency alert sent to admin and security staff');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send emergency alert');
    } finally {
      setEmergencyLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  const formatDateTime = (value) => {
    if (!value) return '—';
    return new Date(value).toLocaleString();
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Room Status</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {stats.roomStatus ? stats.roomStatus.roomNumber : 'Not Allocated'}
              </p>
            </div>
            <FiHome className="text-4xl text-indigo-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Application Status</p>
              <p className="text-2xl font-bold text-gray-900 mt-2 capitalize">
                {stats.applicationStatus?.status || 'None'}
              </p>
            </div>
            <FiFileText className="text-4xl text-indigo-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Active Complaints</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats.complaintCount}</p>
            </div>
            <FiAlertCircle className="text-4xl text-indigo-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Food Subscription</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {stats.subscriptionStatus ? 'Active' : 'Inactive'}
              </p>
            </div>
            <FiCheckCircle className="text-4xl text-indigo-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            {!stats.roomStatus && !stats.applicationStatus && (
              <Link
                to="/resident/application"
                className="block w-full text-left px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Apply for Room
              </Link>
            )}
            <button
              onClick={handleEmergency}
              disabled={emergencyLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              <FiAlertTriangle />
              {emergencyLoading ? 'Sending alert...' : 'Emergency Assist'}
            </button>
            <Link
              to="/resident/complaints"
              className="block w-full text-left px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Raise Complaint
            </Link>
            <Link
              to="/resident/food"
              className="block w-full text-left px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Manage Food Subscription
            </Link>
            <Link
              to="/resident/housekeeping"
              className="block w-full text-left px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Request Housekeeping
            </Link>
            <Link
              to="/resident/recommendations"
              className="block w-full text-left px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Nearby Recommendations
            </Link>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Room Information</h2>
          {stats.roomStatus ? (
            <div className="space-y-2">
              <p><span className="font-semibold">Room Number:</span> {stats.roomStatus.roomNumber}</p>
              <p><span className="font-semibold">Type:</span> {stats.roomStatus.roomType}</p>
              <p><span className="font-semibold">Floor:</span> {stats.roomStatus.floor}</p>
              <p><span className="font-semibold">Rent:</span> ₹{stats.roomStatus.rent}/day</p>
              <p><span className="font-semibold">Check-in:</span> {formatDateTime(user?.checkInAt)}</p>
              <p><span className="font-semibold">Check-out:</span> {formatDateTime(user?.checkOutAt)}</p>
            </div>
          ) : (
            <p className="text-gray-600">No room allocated yet. Apply for a room to get started.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResidentHome;
