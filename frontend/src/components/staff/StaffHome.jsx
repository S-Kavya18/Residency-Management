import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Link } from 'react-router-dom';
import { FiAlertCircle, FiCheckCircle, FiClipboard } from 'react-icons/fi';

const StaffHome = () => {
  const [stats, setStats] = useState({
    assignedComplaints: 0,
    completedComplaints: 0,
    assignedTasks: 0,
    recentComplaints: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/staff/dashboard');
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
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Staff Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Assigned Complaints</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.assignedComplaints}</p>
            </div>
            <FiAlertCircle className="text-4xl text-indigo-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Completed Complaints</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.completedComplaints}</p>
            </div>
            <FiCheckCircle className="text-4xl text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Assigned Tasks</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.assignedTasks}</p>
            </div>
            <FiClipboard className="text-4xl text-purple-600" />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Recent Complaints</h2>
          <Link
            to="/staff/complaints"
            className="text-indigo-600 hover:text-indigo-700 text-sm"
          >
            View All
          </Link>
        </div>
        {stats.recentComplaints.length === 0 ? (
          <p className="text-gray-600">No assigned complaints</p>
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
  );
};

export default StaffHome;
