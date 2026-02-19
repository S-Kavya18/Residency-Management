import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const FoodServices = () => {
  const [menu, setMenu] = useState({});
  const [subscription, setSubscription] = useState(null);
  const [feedback, setFeedback] = useState({ rating: 5, comment: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMenu();
    fetchSubscription();
  }, []);

  const fetchMenu = async () => {
    try {
      const response = await api.get('/food/menu');
      setMenu(response.data);
    } catch (error) {
      console.error('Error fetching menu:', error);
    }
  };

  const fetchSubscription = async () => {
    try {
      const response = await api.get('/food/subscription');
      setSubscription(response.data);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    }
  };

  const handleSubscriptionToggle = async () => {
    setLoading(true);
    try {
      const response = await api.put('/food/subscription', {
        isSubscribed: !subscription.isSubscribed,
        mealPlan: subscription.mealPlan || 'all'
      });
      setSubscription(response.data);
      toast.success(
        response.data.isSubscribed
          ? 'Food subscription activated!'
          : 'Food subscription deactivated'
      );
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update subscription');
    } finally {
      setLoading(false);
    }
  };

  const handleMealPlanChange = async (mealPlan) => {
    setLoading(true);
    try {
      const response = await api.put('/food/subscription', {
        isSubscribed: subscription.isSubscribed,
        mealPlan
      });
      setSubscription(response.data);
      toast.success('Meal plan updated!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update meal plan');
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/food/feedback', feedback);
      toast.success('Feedback submitted successfully!');
      setFeedback({ rating: 5, comment: '' });
      fetchSubscription();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Food Services</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Menu */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Today's Menu</h2>
          {Object.keys(menu).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(menu).map(([meal, items]) => (
                <div key={meal}>
                  <h3 className="font-semibold capitalize mb-2">{meal}</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    {items.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">Menu not available</p>
          )}
        </div>

        {/* Subscription */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Food Subscription</h2>
          {subscription && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Subscription Status</span>
                <button
                  onClick={handleSubscriptionToggle}
                  disabled={loading}
                  className={`px-4 py-2 rounded-lg font-semibold ${
                    subscription.isSubscribed
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  } disabled:opacity-50`}
                >
                  {subscription.isSubscribed ? 'Unsubscribe' : 'Subscribe'}
                </button>
              </div>

              {subscription.isSubscribed && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Meal Plan</label>
                    <select
                      value={subscription.mealPlan}
                      onChange={(e) => handleMealPlanChange(e.target.value)}
                      disabled={loading}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="breakfast">Breakfast Only</option>
                      <option value="lunch">Lunch Only</option>
                      <option value="dinner">Dinner Only</option>
                      <option value="all">All Meals</option>
                    </select>
                  </div>

                  {subscription.startDate && (
                    <p className="text-sm text-gray-600">
                      Started: {new Date(subscription.startDate).toLocaleDateString()}
                    </p>
                  )}
                </>
              )}

              {/* Feedback Form */}
              {subscription.isSubscribed && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="font-semibold mb-3">Submit Feedback</h3>
                  <form onSubmit={handleFeedbackSubmit} className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                      <select
                        value={feedback.rating}
                        onChange={(e) => setFeedback({ ...feedback, rating: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      >
                        {[5, 4, 3, 2, 1].map(rating => (
                          <option key={rating} value={rating}>{rating} Stars</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Comment</label>
                      <textarea
                        value={feedback.comment}
                        onChange={(e) => setFeedback({ ...feedback, comment: e.target.value })}
                        rows="3"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        placeholder="Your feedback..."
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50"
                    >
                      Submit Feedback
                    </button>
                  </form>
                </div>
              )}

              {/* Previous Feedback */}
              {subscription.feedback && subscription.feedback.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="font-semibold mb-3">Previous Feedback</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {subscription.feedback.slice(-5).reverse().map((fb, idx) => (
                      <div key={idx} className="p-2 bg-gray-50 rounded">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-semibold">{fb.rating} ⭐</span>
                          <span className="text-xs text-gray-500">
                            {new Date(fb.date).toLocaleDateString()}
                          </span>
                        </div>
                        {fb.comment && <p className="text-sm text-gray-700">{fb.comment}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FoodServices;
