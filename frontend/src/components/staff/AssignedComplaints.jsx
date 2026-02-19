import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AssignedComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('active');

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const response = await api.get('/complaints/assigned', { params: { includeHistory: true } });
      setComplaints(response.data);
    } catch (error) {
      console.error('Error fetching complaints:', error);
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

  const visibleComplaints = complaints.filter((complaint) =>
    view === 'history' ? isHistory(complaint) : !isHistory(complaint)
  );

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Assigned Complaints</h1>

      <div className="bg-white p-6 rounded-lg shadow-md">
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
        {visibleComplaints.length === 0 ? (
          <p className="text-gray-600">
            {view === 'history' ? 'No complaint history found.' : 'No complaints assigned to you.'}
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

                {complaint.resolutionNotes && (
                  <div className="mb-4 p-2 bg-green-50 rounded">
                    <p className="text-sm font-semibold">Resolution Notes:</p>
                    <p className="text-sm text-gray-700">{complaint.resolutionNotes}</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {complaint.status === 'assigned' && (
                    <button
                      onClick={() => handleStatusUpdate(complaint._id, 'in-progress')}
                      disabled={loading}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                    >
                      Start Work
                    </button>
                  )}

                  {complaint.status === 'in-progress' && (
                    <button
                      onClick={() => {
                        const notes = window.prompt('Enter resolution notes:');
                        if (notes !== null) {
                          handleStatusUpdate(complaint._id, 'resolved', notes);
                        }
                      }}
                      disabled={loading}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      Mark as Resolved
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

export default AssignedComplaints;
