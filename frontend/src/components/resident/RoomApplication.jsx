import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const RoomApplication = () => {
  const [rooms, setRooms] = useState([]);
  const [applications, setApplications] = useState([]);
  const [formData, setFormData] = useState({
    roomId: '',
    preferredFloor: '',
    roomType: '',
    plannedCheckInAt: '',
    plannedCheckOutAt: ''
  });
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState({ roomType: '', floor: '', acType: '' });

  useEffect(() => {
    fetchAvailableRooms();
    fetchMyApplications();
  }, [filter]);

  const fetchAvailableRooms = async () => {
    try {
      const params = {};
      if (filter.roomType) params.roomType = filter.roomType;
      if (filter.floor) params.floor = filter.floor;
      if (filter.acType) params.acType = filter.acType;
      
      const response = await api.get('/rooms/available', { params });
      setRooms(response.data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const fetchMyApplications = async () => {
    try {
      const response = await api.get('/applications/my');
      setApplications(response.data);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/applications', formData);
      toast.success('Application submitted successfully!');
      setFormData({ roomId: '', preferredFloor: '', roomType: '', plannedCheckInAt: '', plannedCheckOutAt: '' });
      fetchMyApplications();
      fetchAvailableRooms();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit application');
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
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Room Application</h1>

      {/* My Applications */}
      {applications.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">My Applications</h2>
          <div className="space-y-4">
            {applications.map((app) => (
              <div key={app._id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">Room: {app.roomId?.roomNumber}</p>
                    <p className="text-sm text-gray-600">Type: {app.roomType}</p>
                    <p className="text-sm text-gray-600">Applied: {new Date(app.appliedDate).toLocaleDateString()}</p>
                    {app.plannedCheckInAt && app.plannedCheckOutAt && (
                      <p className="text-sm text-gray-600">
                        Planned: {new Date(app.plannedCheckInAt).toLocaleString()} - {new Date(app.plannedCheckOutAt).toLocaleString()}
                      </p>
                    )}
                    {app.actualCheckOutAt && (
                      <p className="text-sm text-gray-600">
                        Checked out: {new Date(app.actualCheckOutAt).toLocaleString()}
                      </p>
                    )}
                    {app.earlyCheckoutReason && (
                      <p className="text-sm text-gray-600 mt-2">Checkout reason: {app.earlyCheckoutReason}</p>
                    )}
                    {app.remarks && <p className="text-sm text-gray-600 mt-2">Remarks: {app.remarks}</p>}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadge(app.status)}`}>
                    {app.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Application Form */}
      {applications.filter(app => app.status === 'pending').length === 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Apply for Room</h2>
          
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Type</label>
              <select
                value={filter.roomType}
                onChange={(e) => setFilter({ ...filter, roomType: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">All Types</option>
                <option value="single">Single</option>
                <option value="double">Double</option>
                <option value="triple">Triple</option>
                <option value="quad">Quad</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Floor</label>
              <select
                value={filter.floor}
                onChange={(e) => setFilter({ ...filter, floor: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">All Floors</option>
                {[1, 2, 3, 4].map(floor => (
                  <option key={floor} value={floor}>Floor {floor}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by AC</label>
              <select
                value={filter.acType}
                onChange={(e) => setFilter({ ...filter, acType: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">All</option>
                <option value="ac">AC</option>
                <option value="nonac">Non-AC</option>
              </select>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Room</label>
              <select
                name="roomId"
                value={formData.roomId}
                onChange={(e) => {
                  const room = rooms.find(r => r._id === e.target.value);
                  setFormData({
                    ...formData,
                    roomId: e.target.value,
                    roomType: room?.roomType || '',
                    preferredFloor: room?.floor || ''
                  });
                }}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Choose a room</option>
                {rooms.map((room) => (
                  <option key={room._id} value={room._id}>
                    {room.roomNumber} - {room.roomType} (Floor {room.floor}) - ₹{room.rent}/day
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Floor</label>
              <input
                type="number"
                name="preferredFloor"
                value={formData.preferredFloor}
                onChange={(e) => setFormData({ ...formData, preferredFloor: e.target.value })}
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Check-in Date & Time</label>
                <input
                  type="datetime-local"
                  name="plannedCheckInAt"
                  value={formData.plannedCheckInAt}
                  onChange={(e) => setFormData({ ...formData, plannedCheckInAt: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Check-out Date & Time</label>
                <input
                  type="datetime-local"
                  name="plannedCheckOutAt"
                  value={formData.plannedCheckOutAt}
                  onChange={(e) => setFormData({ ...formData, plannedCheckOutAt: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || rooms.length === 0}
              className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </form>
        </div>
      )}

      {/* Available Rooms */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Available Rooms</h2>
        {rooms.length === 0 ? (
          <p className="text-gray-600">No rooms available at the moment.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.map((room) => (
              <div key={room._id} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-lg">{room.roomNumber}</h3>
                <p className="text-sm text-gray-600">Type: {room.roomType}</p>
                <p className="text-sm text-gray-600">Floor: {room.floor}</p>
                <p className="text-sm text-gray-600">Capacity: {room.currentOccupancy}/{room.capacity}</p>
                <p className="text-sm font-semibold text-indigo-600">₹{room.rent}/day</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomApplication;
