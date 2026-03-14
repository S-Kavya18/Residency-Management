import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ComplaintManagement = () => {
  const [complaints, setComplaints] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);
  const [filter, setFilter] = useState({ status: 'all', category: 'all', priority: 'all' });
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('active');

  useEffect(() => {
    fetchComplaints();
    fetchStaffMembers();
  }, []);

  useEffect(() => {
    fetchStaffMembers();
  }, [filter.category]);

  const fetchComplaints = async () => {
    try {
      const response = await api.get('/complaints/all', { params: { includeHistory: true } });
      setComplaints(response.data);
    } catch (error) {
      console.error('Error fetching complaints:', error);
    }
  };

  const fetchStaffMembers = async () => {
    try {
      const params = { role: 'staff' };
      if (filter.category !== 'all') {
        params.department = filter.category;
      }
      const response = await api.get('/admin/users', { params });
      setStaffMembers(response.data);
    } catch (error) {
      console.error('Error fetching staff members:', error);
    }
  };

  const handleAssign = async (complaintId, staffId) => {
    setLoading(true);
    try {
      await api.put(`/complaints/${complaintId}/assign`, { staffId });
      toast.success('Complaint assigned successfully!');
      fetchComplaints();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to assign complaint');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (complaintId, status, resolutionNotes = '') => {
    setLoading(true);
    try {
      await api.put(`/complaints/${complaintId}/status`, { status, resolutionNotes });
      toast.success('Complaint status updated!');
      fetchComplaints();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      assigned: 'bg-blue-100 text-blue-800',
      'in-progress': 'bg-purple-100 text-purple-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    return badges[priority] || 'bg-gray-100 text-gray-800';
  };

  const isHistory = (complaint) =>
    complaint.isArchived || ['resolved', 'closed'].includes(complaint.status);

  const matchesFilter = (complaint) => {
    if (filter.status !== 'all' && complaint.status !== filter.status) return false;
    if (filter.category !== 'all' && complaint.category !== filter.category) return false;
    if (filter.priority !== 'all' && complaint.priority !== filter.priority) return false;
    return true;
  };

  const visibleComplaints = complaints
    .filter((complaint) => (view === 'history' ? isHistory(complaint) : !isHistory(complaint)))
    .filter(matchesFilter);

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Complaint Management</h1>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => {
              setView('active');
              setFilter({ status: 'all', category: 'all', priority: 'all' });
            }}
            className={`px-4 py-2 rounded-lg font-semibold ${view === 'active' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            Active
          </button>
          <button
            onClick={() => {
              setView('history');
              setFilter({ status: 'all', category: 'all', priority: 'all' });
            }}
            className={`px-4 py-2 rounded-lg font-semibold ${view === 'history' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            History
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="assigned">Assigned</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={filter.category}
              onChange={(e) => setFilter({ ...filter, category: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">All Categories</option>
              <option value="electrical">Electrical</option>
              <option value="plumbing">Plumbing</option>
              <option value="cleaning">Cleaning</option>
              <option value="maintenance">Maintenance</option>
              <option value="security">Security</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
            <select
              value={filter.priority}
              onChange={(e) => setFilter({ ...filter, priority: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        {visibleComplaints.length === 0 ? (
          <p className="text-gray-600">
            {view === 'history' ? 'No complaint history found.' : 'No complaints found.'}
          </p>
        ) : (
          <div className="space-y-4">
            {visibleComplaints.map((complaint) => (
              <div key={complaint._id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{complaint.title}</h3>
                    <p className="text-sm text-gray-600 capitalize">{complaint.category}</p>
                    <p className="text-sm text-gray-600">
                      By: {complaint.userId?.name} (Room: {complaint.userId?.roomId?.roomNumber || 'N/A'})
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityBadge(complaint.priority)}`}>
                      {complaint.priority}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(complaint.status)}`}>
                      {complaint.status}
                    </span>
                  </div>
                </div>

                <p className="text-gray-700 mb-4">{complaint.description}</p>

                {complaint.image && (
                  <img
                    src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${complaint.image}`}
                    alt="Complaint"
                    className="w-32 h-32 object-cover rounded-lg mb-4"
                  />
                )}

                {complaint.assignedTo && (
                  <p className="text-sm text-gray-600 mb-2">
                    Assigned to: {complaint.assignedTo.name}
                    {complaint.assignedTo.staffDepartment
                      ? ` (${complaint.assignedTo.staffDepartment})`
                      : ''}
                  </p>
                )}

                {complaint.resolutionNotes && (
                  <div className="mb-4 p-2 bg-green-50 rounded">
                    <p className="text-sm font-semibold">Resolution:</p>
                    <p className="text-sm text-gray-700">{complaint.resolutionNotes}</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {complaint.status === 'pending' && (
                    <select
                      onChange={(e) => handleAssign(complaint._id, e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                      defaultValue=""
                    >
                      <option value="">Assign to Staff</option>
                      {staffMembers.map((staff) => (
                        <option key={staff._id} value={staff._id}>
                          {staff.name}
                          {staff.staffDepartment ? ` (${staff.staffDepartment})` : ''}
                        </option>
                      ))}
                    </select>
                  )}

                  {complaint.status !== 'resolved' && complaint.status !== 'closed' && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(complaint._id, 'in-progress')}
                        disabled={loading}
                        className="px-3 py-1 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 disabled:opacity-50"
                      >
                        Mark In Progress
                      </button>
                      <button
                        onClick={() => {
                          const notes = window.prompt('Enter resolution notes:');
                          if (notes !== null) {
                            handleStatusUpdate(complaint._id, 'resolved', notes);
                          }
                        }}
                        disabled={loading}
                        className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50"
                      >
                        Resolve
                      </button>
                    </>
                  )}

                  {complaint.status === 'resolved' && (
                    <button
                      onClick={() => handleStatusUpdate(complaint._id, 'closed')}
                      disabled={loading}
                      className="px-3 py-1 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-700 disabled:opacity-50"
                    >
                      Close
                    </button>
                  )}
                </div>

                <p className="text-xs text-gray-500 mt-2">
                  Created: {new Date(complaint.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ComplaintManagement;
