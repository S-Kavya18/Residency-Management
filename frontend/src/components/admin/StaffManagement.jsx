import { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const departmentOptions = [
  { value: 'electrical', label: 'Electrical' },
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'cleaning', label: 'Cleaning' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'security', label: 'Security' },
  { value: 'other', label: 'Other' }
];

const StaffManagement = () => {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    staffDepartment: 'maintenance',
    password: ''
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const response = await api.get('/admin/users', { params: { role: 'staff' } });
      setStaffList(response.data);
    } catch (error) {
      console.error('Error fetching staff:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      staffDepartment: 'maintenance',
      password: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingStaff) {
        const payload = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          staffDepartment: formData.staffDepartment
        };
        await api.put(`/admin/staff/${editingStaff._id}`, payload);
        toast.success('Staff updated successfully');
      } else {
        await api.post('/admin/staff', formData);
        toast.success('Staff created successfully');
      }
      setShowForm(false);
      setEditingStaff(null);
      resetForm();
      fetchStaff();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save staff');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (staff) => {
    setEditingStaff(staff);
    setFormData({
      name: staff.name || '',
      email: staff.email || '',
      phone: staff.phone || '',
      staffDepartment: staff.staffDepartment || 'maintenance',
      password: ''
    });
    setShowForm(true);
  };

  const handleDelete = async (staffId) => {
    if (!window.confirm('Delete this staff member?')) return;

    try {
      await api.delete(`/admin/staff/${staffId}`);
      toast.success('Staff deleted');
      fetchStaff();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete staff');
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Staff Management</h1>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingStaff(null);
            resetForm();
          }}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          {showForm ? 'Cancel' : 'Add Staff'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingStaff ? 'Edit Staff' : 'Add New Staff'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
              <select
                value={formData.staffDepartment}
                onChange={(e) => setFormData({ ...formData, staffDepartment: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                {departmentOptions.map((dept) => (
                  <option key={dept.value} value={dept.value}>
                    {dept.label}
                  </option>
                ))}
              </select>
            </div>
            {!editingStaff && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            )}
            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : editingStaff ? 'Update Staff' : 'Create Staff'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Staff List</h2>
        {staffList.length === 0 ? (
          <p className="text-gray-600">No staff members found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4">Name</th>
                  <th className="text-left py-3 px-4">Email</th>
                  <th className="text-left py-3 px-4">Phone</th>
                  <th className="text-left py-3 px-4">Department</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {staffList.map((staff) => (
                  <tr key={staff._id} className="border-b border-gray-100">
                    <td className="py-3 px-4">{staff.name}</td>
                    <td className="py-3 px-4">{staff.email}</td>
                    <td className="py-3 px-4">{staff.phone || '—'}</td>
                    <td className="py-3 px-4 capitalize">{staff.staffDepartment || '—'}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          staff.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {staff.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleEdit(staff)}
                          className="text-indigo-600 hover:text-indigo-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(staff._id)}
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

export default StaffManagement;
