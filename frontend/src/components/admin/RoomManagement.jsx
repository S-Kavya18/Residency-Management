import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { validateRoom } from '../../utils/validationSchemas';

const RoomManagement = () => {
  const [rooms, setRooms] = useState([]);
  const [formData, setFormData] = useState({
    roomNumber: '',
    roomType: 'single',
    floor: 1,
    capacity: 1,
    rent: 0,
    amenities: [],
    description: '',
    status: 'available'
  });
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [filters, setFilters] = useState({ acType: 'all', floor: 'all', status: 'all' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await api.get('/rooms');
      const sortedRooms = [...response.data].sort((a, b) => {
        if (a.status === b.status) {
          return 0;
        }
        return a.status === 'occupied' ? -1 : 1;
      });
      setRooms(sortedRooms);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'amenities') {
      const amenities = value.split(',').map(a => a.trim()).filter(a => a);
      setFormData({ ...formData, amenities });
    } else {
      setFormData({ ...formData, [name]: name === 'floor' || name === 'capacity' || name === 'rent' ? parseInt(value) || 0 : value });
    }
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { errors: validationErrors, value } = validateRoom(formData);

    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      toast.error('Please fix the highlighted fields');
      return;
    }

    setLoading(true);

    try {
      if (editingRoom) {
        await api.put(`/rooms/${editingRoom._id}`, value);
        toast.success('Room updated successfully!');
      } else {
        await api.post('/rooms', value);
        toast.success('Room created successfully!');
      }
      setFormData({
        roomNumber: '',
        roomType: 'single',
        floor: 1,
        capacity: 1,
        rent: 0,
        amenities: [],
        description: '',
        status: 'available'
      });
      setErrors({});
      setEditingRoom(null);
      setShowForm(false);
      fetchRooms();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save room');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (room) => {
    setEditingRoom(room);
    setFormData({
      roomNumber: room.roomNumber,
      roomType: room.roomType,
      floor: room.floor,
      capacity: room.capacity,
      rent: room.rent,
      amenities: room.amenities || [],
      description: room.description || '',
      status: room.status
    });
    setErrors({});
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this room?')) return;

    try {
      await api.delete(`/rooms/${id}`);
      toast.success('Room deleted successfully!');
      fetchRooms();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete room');
    }
  };

  const handleCheckout = async (roomId) => {
    if (!window.confirm('Checkout the current occupant of this room?')) return;
    const reason = window.prompt('Enter early checkout reason (if applicable):') || '';

    try {
      await api.post('/admin/checkout', { roomId, reason });
      toast.success('Checkout completed');
      fetchRooms();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Checkout failed');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      available: 'bg-green-100 text-green-800',
      occupied: 'bg-blue-100 text-blue-800',
      maintenance: 'bg-yellow-100 text-yellow-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const floors = Array.from(new Set(rooms.map((room) => room.floor))).sort((a, b) => a - b);

  const filteredRooms = rooms.filter((room) => {
    const hasAc = Array.isArray(room.amenities) && room.amenities.includes('AC');

    if (filters.acType === 'ac' && !hasAc) return false;
    if (filters.acType === 'nonac' && hasAc) return false;
    if (filters.floor !== 'all' && room.floor !== Number(filters.floor)) return false;
    if (filters.status !== 'all' && room.status !== filters.status) return false;

    return true;
  });

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Room Management</h1>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingRoom(null);
            setFormData({
              roomNumber: '',
              roomType: 'single',
              floor: 1,
              capacity: 1,
              rent: 0,
              amenities: [],
              description: '',
              status: 'available'
            });
            setErrors({});
          }}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          {showForm ? 'Cancel' : 'Add Room'}
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">AC Type</label>
            <select
              value={filters.acType}
              onChange={(e) => setFilters({ ...filters, acType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">All</option>
              <option value="ac">AC</option>
              <option value="nonac">Non-AC</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Floor</label>
            <select
              value={filters.floor}
              onChange={(e) => setFilters({ ...filters, floor: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">All</option>
              {floors.map((floor) => (
                <option key={floor} value={floor}>
                  Floor {floor}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">All</option>
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingRoom ? 'Edit Room' : 'Add New Room'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Room Number</label>
              <input
                type="text"
                name="roomNumber"
                value={formData.roomNumber}
                onChange={handleChange}
                aria-invalid={Boolean(errors.roomNumber)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              {errors.roomNumber && <p className="mt-1 text-sm text-red-600">{errors.roomNumber}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Room Type</label>
              <select
                name="roomType"
                value={formData.roomType}
                onChange={handleChange}
                aria-invalid={Boolean(errors.roomType)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="single">Single</option>
                <option value="double">Double</option>
                <option value="triple">Triple</option>
                <option value="quad">Quad</option>
              </select>
              {errors.roomType && <p className="mt-1 text-sm text-red-600">{errors.roomType}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Floor</label>
              <input
                type="number"
                name="floor"
                value={formData.floor}
                onChange={handleChange}
                min="1"
                aria-invalid={Boolean(errors.floor)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              {errors.floor && <p className="mt-1 text-sm text-red-600">{errors.floor}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Capacity</label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                min="1"
                aria-invalid={Boolean(errors.capacity)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              {errors.capacity && <p className="mt-1 text-sm text-red-600">{errors.capacity}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rent (₹/day)</label>
              <input
                type="number"
                name="rent"
                value={formData.rent}
                onChange={handleChange}
                min="0"
                aria-invalid={Boolean(errors.rent)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              {errors.rent && <p className="mt-1 text-sm text-red-600">{errors.rent}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                aria-invalid={Boolean(errors.status)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
                <option value="maintenance">Maintenance</option>
              </select>
              {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Amenities (comma-separated)</label>
              <input
                type="text"
                name="amenities"
                value={formData.amenities.join(', ')}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="WiFi, AC, TV, etc."
              />
              {errors.amenities && <p className="mt-1 text-sm text-red-600">{errors.amenities}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                aria-invalid={Boolean(errors.description)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : editingRoom ? 'Update Room' : 'Create Room'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">All Rooms</h2>
        {filteredRooms.length === 0 ? (
          <p className="text-gray-600">No rooms found. Add a room to get started.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4">Room #</th>
                  <th className="text-left py-3 px-4">Type</th>
                  <th className="text-left py-3 px-4">Floor</th>
                  <th className="text-left py-3 px-4">Capacity</th>
                  <th className="text-left py-3 px-4">Occupancy</th>
                  <th className="text-left py-3 px-4">Rent</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRooms.map((room) => (
                  <tr key={room._id} className="border-b border-gray-100">
                    <td className="py-3 px-4">{room.roomNumber}</td>
                    <td className="py-3 px-4 capitalize">{room.roomType}</td>
                    <td className="py-3 px-4">{room.floor}</td>
                    <td className="py-3 px-4">{room.capacity}</td>
                    <td className="py-3 px-4">{room.currentOccupancy}</td>
                    <td className="py-3 px-4">₹{room.rent}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(room.status)}`}>
                        {room.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-2">
                        {room.status === 'occupied' && (
                          <button
                            onClick={() => handleCheckout(room._id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Checkout
                          </button>
                        )}
                        <button
                          onClick={() => handleEdit(room)}
                          className="text-indigo-600 hover:text-indigo-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(room._id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomManagement;
