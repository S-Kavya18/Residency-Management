import { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const statusOptions = ['pending', 'assigned', 'in-progress', 'completed', 'cancelled'];

const HousekeepingManagement = () => {
  const [requests, setRequests] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [view, setView] = useState('active');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRequests();
    fetchStaff();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await api.get('/housekeeping/all');
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching housekeeping requests:', error);
    }
  };

  const fetchStaff = async () => {
    try {
      const response = await api.get('/admin/users', {
        params: { role: 'staff', department: 'cleaning' }
      });
      setStaffMembers(response.data);
    } catch (error) {
      console.error('Error fetching staff list:', error);
    }
  };

  const handleStatusUpdate = async (id, status, assignedTo) => {
    const notes = status === 'completed' ? window.prompt('Add completion notes (optional):', '') : '';
    setLoading(true);
    try {
      await api.put(`/housekeeping/${id}/status`, { status, notes, assignedTo });
      toast.success('Housekeeping request updated');
      fetchRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      assigned: 'bg-blue-100 text-blue-800',
      'in-progress': 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const isHistory = (req) => ['completed', 'cancelled'].includes(req.status);

  const visibleRequests = requests
    .filter((req) => (view === 'history' ? isHistory(req) : !isHistory(req)))
    .filter((req) => (filterStatus === 'all' ? true : req.status === filterStatus));

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Housekeeping Management</h1>

      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setView('active')}
            className={`px-4 py-2 rounded-lg font-semibold ${view === 'active' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            Active
          </button>
          <button
            onClick={() => setView('history')}
            className={`px-4 py-2 rounded-lg font-semibold ${view === 'history' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            History
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">All</option>
              {statusOptions.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        {visibleRequests.length === 0 ? (
          <p className="text-gray-600">{view === 'history' ? 'No completed/cancelled requests.' : 'No housekeeping requests yet.'}</p>
        ) : (
          <div className="space-y-4">
            {visibleRequests.map((req) => (
              <div key={req._id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-lg capitalize">{req.serviceType}</h3>
                    <p className="text-sm text-gray-600">By: {req.userId?.name}</p>
                    <p className="text-sm text-gray-600">Room: {req.roomId?.roomNumber}</p>
                    <p className="text-sm text-gray-600">Date: {new Date(req.preferredDate).toLocaleDateString()}</p>
                    <p className="text-sm text-gray-600">Time: {req.preferredTime}</p>
                    {req.assignedTo && <p className="text-sm text-gray-600">Assigned to: {req.assignedTo.name}</p>}
                    {req.notes && <p className="text-sm text-gray-700 mt-1">Notes: {req.notes}</p>}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(req.status)}`}>
                    {req.status}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 mt-2 items-center">
                  {req.status === 'pending' && (
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          handleStatusUpdate(req._id, 'assigned', e.target.value);
                        }
                      }}
                      className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                      defaultValue=""
                      disabled={loading || staffMembers.length === 0}
                    >
                      <option value="">Assign to cleaning staff</option>
                      {staffMembers.map((staff) => (
                        <option key={staff._id} value={staff._id}>
                          {staff.name}
                        </option>
                      ))}
                    </select>
                  )}

                  {['pending', 'assigned'].includes(req.status) && (
                    <button
                      onClick={() => handleStatusUpdate(req._id, 'in-progress', req.assignedTo?._id || req.assignedTo)}
                      disabled={loading}
                      className="px-3 py-1 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 disabled:opacity-50"
                    >
                      Mark In Progress
                    </button>
                  )}
                  {['in-progress', 'assigned', 'pending'].includes(req.status) && (
                    <button
                      onClick={() => handleStatusUpdate(req._id, 'completed', req.assignedTo?._id || req.assignedTo)}
                      disabled={loading}
                      className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50"
                    >
                      Complete
                    </button>
                  )}
                  {req.status !== 'completed' && (
                    <button
                      onClick={() => handleStatusUpdate(req._id, 'cancelled', req.assignedTo?._id || req.assignedTo)}
                      disabled={loading}
                      className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  )}
                </div>

                <p className="text-xs text-gray-500 mt-2">Created: {new Date(req.createdAt).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HousekeepingManagement;