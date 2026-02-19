import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const Checkout = () => {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [roomDetails, setRoomDetails] = useState(null);
  const [roomLoading, setRoomLoading] = useState(false);
  const [approvedApplication, setApprovedApplication] = useState(null);
  const [checkoutReason, setCheckoutReason] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !user.roomId) {
      refreshUser();
    }
  }, [user?.roomId, refreshUser]);

  useEffect(() => {
    const loadRoom = async () => {
      if (!user?.roomId) {
        setRoomDetails(null);
        return;
      }

      if (typeof user.roomId === 'object' && user.roomId.roomNumber) {
        setRoomDetails(user.roomId);
        return;
      }

      setRoomLoading(true);
      try {
        const response = await api.get(`/rooms/${user.roomId}`);
        setRoomDetails(response.data);
      } catch (error) {
        setRoomDetails(null);
      } finally {
        setRoomLoading(false);
      }
    };

    loadRoom();
  }, [user?.roomId]);

  useEffect(() => {
    const loadApplications = async () => {
      try {
        const response = await api.get('/applications/my');
        const approved = response.data.find((app) => app.status === 'approved');
        setApprovedApplication(approved || null);
      } catch (error) {
        setApprovedApplication(null);
      }
    };

    loadApplications();
  }, []);

  const formatDateTime = (value) => {
    if (!value) return '—';
    return new Date(value).toLocaleString();
  };

  const isEarlyCheckout = () => {
    if (!approvedApplication?.plannedCheckOutAt) return false;
    return new Date() < new Date(approvedApplication.plannedCheckOutAt);
  };

  const handleCheckout = async () => {
    if (!user?.roomId) {
      toast.error('No room allocated to checkout');
      return;
    }

    if (isEarlyCheckout() && !checkoutReason.trim()) {
      toast.error('Please provide a reason for early checkout');
      return;
    }

    if (!window.confirm('Are you sure you want to checkout from your room?')) {
      return;
    }

    setLoading(true);
    try {
      await api.post('/rooms/checkout', { reason: checkoutReason.trim() || undefined });
      await refreshUser();
      toast.success('Checkout completed');
      navigate('/resident');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Checkout</h1>
      <p className="text-gray-600 mb-6">
        Use this option when you are leaving the residency. Your room will be marked
        as available after checkout.
      </p>
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <p className="text-sm text-gray-600">Current Room</p>
        <p className="text-lg font-semibold text-gray-900">
          {roomLoading
            ? 'Loading...'
            : roomDetails
            ? `Room ${roomDetails.roomNumber}`
            : 'Not Allocated'}
        </p>
        {roomDetails && (
          <p className="text-sm text-gray-600 mt-1">
            Floor {roomDetails.floor} | {roomDetails.roomType} | ₹{roomDetails.rent}/day
          </p>
        )}
        <p className="text-sm text-gray-600 mt-2">
          Check-in: <span className="font-semibold text-gray-900">{formatDateTime(user?.checkInAt)}</span>
        </p>
        <p className="text-sm text-gray-600">
          Check-out: <span className="font-semibold text-gray-900">{formatDateTime(user?.checkOutAt)}</span>
        </p>
      </div>
      {isEarlyCheckout() && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Early Checkout Reason</label>
          <textarea
            value={checkoutReason}
            onChange={(e) => setCheckoutReason(e.target.value)}
            rows="3"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            placeholder="Tell us why you are checking out early"
          />
        </div>
      )}
      <button
        onClick={handleCheckout}
        disabled={loading || !user?.roomId}
        className="px-5 py-2.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Processing...' : 'Checkout Now'}
      </button>
    </div>
  );
};

export default Checkout;
