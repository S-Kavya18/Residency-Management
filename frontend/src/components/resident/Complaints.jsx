import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { validateComplaint } from '../../utils/validationSchemas';

const Complaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [formData, setFormData] = useState({
    category: '',
    title: '',
    description: '',
    priority: 'medium',
    image: null
  });
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [view, setView] = useState('active');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const response = await api.get('/complaints/my', { params: { includeHistory: true } });
      setComplaints(response.data);
    } catch (error) {
      console.error('Error fetching complaints:', error);
    }
  };

  const handleChange = (e) => {
    const { name, files, value } = e.target;
    const nextValue = name === 'image' ? files[0] : value;
    setFormData({ ...formData, [name]: nextValue });
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { errors: validationErrors, value } = validateComplaint(formData);

    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      toast.error('Please fix the highlighted fields');
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('category', value.category);
      formDataToSend.append('title', value.title);
      formDataToSend.append('description', value.description);
      formDataToSend.append('priority', value.priority);
      if (value.image) {
        formDataToSend.append('image', value.image);
      }

      await api.post('/complaints', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Complaint submitted successfully!');
      setFormData({ category: '', title: '', description: '', priority: 'medium', image: null });
      setErrors({});
      setShowForm(false);
      fetchComplaints();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit complaint');
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

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Complaints</h1>
        <div className="flex flex-wrap gap-2">
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
          <button
            onClick={() => {
              setShowForm(!showForm);
              setErrors({});
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            {showForm ? 'Cancel' : 'Raise Complaint'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Raise New Complaint</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                aria-invalid={Boolean(errors.category)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Select category</option>
                <option value="electrical">Electrical</option>
                <option value="plumbing">Plumbing</option>
                <option value="cleaning">Cleaning</option>
                <option value="maintenance">Maintenance</option>
                <option value="security">Security</option>
                <option value="other">Other</option>
              </select>
              {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                aria-invalid={Boolean(errors.title)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="Brief description of the issue"
              />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                aria-invalid={Boolean(errors.description)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="Detailed description of the complaint"
              />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
              {errors.priority && <p className="mt-1 text-sm text-red-600">{errors.priority}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Upload Image (Optional)</label>
              <input
                type="file"
                name="image"
                onChange={handleChange}
                accept="image/*"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              {errors.image && <p className="mt-1 text-sm text-red-600">{errors.image}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Complaint'}
            </button>
          </form>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">
          {view === 'history' ? 'Complaint History' : 'My Complaints'}
        </h2>
        {complaints.filter((c) => {
          const isHistory = c.isArchived || ['resolved', 'closed'].includes(c.status);
          return view === 'history' ? isHistory : !isHistory;
        }).length === 0 ? (
          <p className="text-gray-600">
            {view === 'history' ? 'No complaint history available.' : 'No complaints submitted yet.'}
          </p>
        ) : (
          <div className="space-y-4">
            {complaints
              .filter((c) => {
                const isHistory = c.isArchived || ['resolved', 'closed'].includes(c.status);
                return view === 'history' ? isHistory : !isHistory;
              })
              .map((complaint) => (
              <div key={complaint._id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-lg">{complaint.title}</h3>
                    <p className="text-sm text-gray-600 capitalize">{complaint.category}</p>
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
                <p className="text-gray-700 mb-2">{complaint.description}</p>
                {complaint.image && (
                  <img
                    src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${complaint.image}`}
                    alt="Complaint"
                    className="w-32 h-32 object-cover rounded-lg mb-2"
                  />
                )}
                {complaint.assignedTo && (
                  <p className="text-sm text-gray-600">Assigned to: {complaint.assignedTo.name}</p>
                )}
                {complaint.resolutionNotes && (
                  <div className="mt-2 p-2 bg-green-50 rounded">
                    <p className="text-sm font-semibold">Resolution:</p>
                    <p className="text-sm text-gray-700">{complaint.resolutionNotes}</p>
                  </div>
                )}
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

export default Complaints;
