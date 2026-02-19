import { Routes, Route } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import ResidentHome from '../components/resident/ResidentHome';
import RoomApplication from '../components/resident/RoomApplication';
import Complaints from '../components/resident/Complaints';
import FoodServices from '../components/resident/FoodServices';
import Housekeeping from '../components/resident/Housekeeping';
import Checkout from '../components/resident/Checkout';
import Recommendations from '../components/resident/Recommendations';

const ResidentDashboard = () => {
  const menuItems = [
    { path: '/resident', label: 'Dashboard', icon: 'dashboard' },
    { path: '/resident/application', label: 'Room Application', icon: 'applications' },
    { path: '/resident/complaints', label: 'Complaints', icon: 'complaints' },
    { path: '/resident/food', label: 'Food Services', icon: 'food' },
    { path: '/resident/housekeeping', label: 'Housekeeping', icon: 'housekeeping' },
    { path: '/resident/recommendations', label: 'Nearby Spots', icon: 'recommendations' },
    { path: '/resident/checkout', label: 'Checkout', icon: 'checkout' }
  ];

  return (
    <div className="flex min-h-screen landing-bg">
      <Sidebar menuItems={menuItems} />
      <main className="flex-1 md:ml-64 p-6">
        <Routes>
          <Route path="/" element={<ResidentHome />} />
          <Route path="/application" element={<RoomApplication />} />
          <Route path="/complaints" element={<Complaints />} />
          <Route path="/food" element={<FoodServices />} />
          <Route path="/housekeeping" element={<Housekeeping />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/checkout" element={<Checkout />} />
        </Routes>
      </main>
    </div>
  );
};

export default ResidentDashboard;
