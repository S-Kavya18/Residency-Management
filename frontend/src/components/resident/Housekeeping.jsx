import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { validateHousekeeping } from '../../utils/validationSchemas';

const Housekeeping = () => {
  const [requests, setRequests] = useState([]);
  const [formData, setFormData] = useState({
    serviceType: '',
    preferredDate: '',
    preferredTime: ''
  });
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await api.get('/housekeeping/my');
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { errors: validationErrors, value } = validateHousekeeping(formData);

    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      toast.error('Please fix the highlighted fields');
      return;
    }

    setLoading(true);

    try {
      await api.post('/housekeeping', value);
      toast.success('Housekeeping request submitted successfully!');
      setFormData({ serviceType: '', preferredDate: '', preferredTime: '' });
      setShowForm(false);
      setErrors({});
      fetchRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit request');
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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Housekeeping</h1>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setErrors({});
          }}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          {showForm ? 'Cancel' : 'Request Service'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">New Housekeeping Request</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Service Type</label>
              <select
                name="serviceType"
                value={formData.serviceType}
                onChange={handleChange}
                aria-invalid={Boolean(errors.serviceType)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Select service type</option>
                <option value="cleaning">Cleaning</option>
                <option value="laundry">Laundry</option>
                <option value="bedding">Bedding</option>
                <option value="other">Other</option>
              </select>
              {errors.serviceType && <p className="mt-1 text-sm text-red-600">{errors.serviceType}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Date</label>
              <input
                type="date"
                name="preferredDate"
                value={formData.preferredDate}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                aria-invalid={Boolean(errors.preferredDate)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              {errors.preferredDate && <p className="mt-1 text-sm text-red-600">{errors.preferredDate}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Time</label>
              <select
                name="preferredTime"
                value={formData.preferredTime}
                onChange={handleChange}
                aria-invalid={Boolean(errors.preferredTime)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Select time</option>
                <option value="09:00 AM">09:00 AM</option>
                <option value="10:00 AM">10:00 AM</option>
                <option value="11:00 AM">11:00 AM</option>
                <option value="12:00 PM">12:00 PM</option>
                <option value="01:00 PM">01:00 PM</option>
                <option value="02:00 PM">02:00 PM</option>
                <option value="03:00 PM">03:00 PM</option>
                <option value="04:00 PM">04:00 PM</option>
                <option value="05:00 PM">05:00 PM</option>
              </select>
              {errors.preferredTime && <p className="mt-1 text-sm text-red-600">{errors.preferredTime}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </form>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">My Requests</h2>
        {requests.length === 0 ? (
          <p className="text-gray-600">No housekeeping requests submitted yet.</p>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request._id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-lg capitalize">{request.serviceType}</h3>
                    <p className="text-sm text-gray-600">
                      Room: {request.roomId?.roomNumber}
                    </p>
                    <p className="text-sm text-gray-600">
                      Date: {new Date(request.preferredDate).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600">Time: {request.preferredTime}</p>
                    {request.assignedTo && (
                      <p className="text-sm text-gray-600">
                        Assigned to: {request.assignedTo.name}
                      </p>
                    )}
                    {request.notes && (
                      <p className="text-sm text-gray-700 mt-2">Notes: {request.notes}</p>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(request.status)}`}>
                    {request.status}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Created: {new Date(request.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Housekeeping;
