import { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const statusBadge = {
  pending: 'bg-yellow-100 text-yellow-800',
  assigned: 'bg-blue-100 text-blue-800',
  'in-progress': 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
};

const AssignedHousekeeping = () => {
  const [requests, setRequests] = useState([]);
  const [view, setView] = useState('active');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await api.get('/housekeeping/assigned', { params: { includeHistory: true } });
      setRequests(res.data);
    } catch (err) {
      console.error('Error fetching housekeeping tasks', err);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    const notes = status === 'completed' ? window.prompt('Add completion notes (optional):', '') : '';
    setLoading(true);
    try {
      await api.put(`/housekeeping/${id}/status`, { status, notes });
      toast.success('Task updated');
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setLoading(false);
    }
  };

  const isHistory = (r) => ['completed', 'cancelled'].includes(r.status);
  const visible = requests.filter((r) => (view === 'history' ? isHistory(r) : !isHistory(r)));

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Assigned Housekeeping</h1>
        <div className="flex gap-2">
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
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        {visible.length === 0 ? (
          <p className="text-gray-600">{view === 'history' ? 'No completed/cancelled tasks.' : 'No assigned housekeeping tasks.'}</p>
        ) : (
          <div className="space-y-4">
            {visible.map((req) => (
              <div key={req._id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-lg capitalize">{req.serviceType}</h3>
                    <p className="text-sm text-gray-600">Resident: {req.userId?.name}</p>
                    <p className="text-sm text-gray-600">Room: {req.roomId?.roomNumber}</p>
                    <p className="text-sm text-gray-600">Date: {new Date(req.preferredDate).toLocaleDateString()}</p>
                    <p className="text-sm text-gray-600">Time: {req.preferredTime}</p>
                    {req.notes && <p className="text-sm text-gray-700 mt-1">Notes: {req.notes}</p>}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusBadge[req.status] || 'bg-gray-100 text-gray-800'}`}>
                    {req.status}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 mt-2">
                  {req.status === 'assigned' && (
                    <button
                      onClick={() => handleStatusUpdate(req._id, 'in-progress')}
                      disabled={loading}
                      className="px-3 py-1 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 disabled:opacity-50"
                    >
                      Start
                    </button>
                  )}
                  {['assigned', 'in-progress'].includes(req.status) && (
                    <button
                      onClick={() => handleStatusUpdate(req._id, 'completed')}
                      disabled={loading}
                      className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50"
                    >
                      Complete
                    </button>
                  )}
                  {req.status !== 'completed' && (
                    <button
                      onClick={() => handleStatusUpdate(req._id, 'cancelled')}
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

export default AssignedHousekeeping;