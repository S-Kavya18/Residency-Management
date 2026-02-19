import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ApplicationManagement = () => {
  const [applications, setApplications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, [filter]);

  const fetchApplications = async () => {
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await api.get('/applications/all', { params });
      setApplications(response.data);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const handleApprove = async (id, remarks = '') => {
    setLoading(true);
    try {
      await api.put(`/applications/${id}/approve`, { remarks });
      toast.success('Application approved successfully!');
      fetchApplications();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve application');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (id, remarks = '') => {
    const reason = window.prompt('Enter rejection reason (optional):');
    if (reason === null) return;

    setLoading(true);
    try {
      await api.put(`/applications/${id}/reject`, { remarks: reason });
      toast.success('Application rejected');
      fetchApplications();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject application');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this application?')) return;

    setLoading(true);
    try {
      await api.delete(`/applications/${id}`);
      toast.success('Application deleted');
      fetchApplications();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete application');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Application Management</h1>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        >
          <option value="all">All Applications</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        {applications.length === 0 ? (
          <p className="text-gray-600">No applications found.</p>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div key={app._id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{app.userId?.name}</h3>
                    <p className="text-sm text-gray-600">Email: {app.userId?.email}</p>
                    <p className="text-sm text-gray-600">Phone: {app.userId?.phone || 'N/A'}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadge(app.status)}`}>
                    {app.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Requested Room</p>
                    <p className="font-semibold">
                      {app.roomId?.roomNumber} ({app.roomType})
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Preferred Floor</p>
                    <p className="font-semibold">{app.preferredFloor || 'Any'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Applied Date</p>
                    <p className="font-semibold">
                      {new Date(app.appliedDate).toLocaleDateString()}
                    </p>
                  </div>
                  {app.plannedCheckInAt && app.plannedCheckOutAt && (
                    <div>
                      <p className="text-sm text-gray-600">Planned Stay</p>
                      <p className="font-semibold">
                        {new Date(app.plannedCheckInAt).toLocaleString()} - {new Date(app.plannedCheckOutAt).toLocaleString()}
                      </p>
                    </div>
                  )}
                  {app.actualCheckInAt && (
                    <div>
                      <p className="text-sm text-gray-600">Actual Check-in</p>
                      <p className="font-semibold">{new Date(app.actualCheckInAt).toLocaleString()}</p>
                    </div>
                  )}
                  {app.actualCheckOutAt && (
                    <div>
                      <p className="text-sm text-gray-600">Actual Check-out</p>
                      <p className="font-semibold">{new Date(app.actualCheckOutAt).toLocaleString()}</p>
                    </div>
                  )}
                  {app.reviewedBy && (
                    <div>
                      <p className="text-sm text-gray-600">Reviewed By</p>
                      <p className="font-semibold">{app.reviewedBy?.name}</p>
                    </div>
                  )}
                </div>

                {app.remarks && (
                  <div className="mb-4 p-2 bg-gray-50 rounded">
                    <p className="text-sm font-semibold">Remarks:</p>
                    <p className="text-sm text-gray-700">{app.remarks}</p>
                  </div>
                )}
                {app.earlyCheckoutReason && (
                  <div className="mb-4 p-2 bg-red-50 rounded">
                    <p className="text-sm font-semibold">Early Checkout Reason:</p>
                    <p className="text-sm text-gray-700">{app.earlyCheckoutReason}</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  {app.status === 'pending' && (
                    <>
                    <button
                      onClick={() => handleApprove(app._id)}
                      disabled={loading}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(app._id)}
                      disabled={loading}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                    >
                      Reject
                    </button>
                    </>
                  )}
                  <button
                    onClick={() => handleDelete(app._id)}
                    disabled={loading}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationManagement;
