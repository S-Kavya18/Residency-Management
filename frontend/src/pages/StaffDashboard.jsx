import { Routes, Route } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import StaffHome from '../components/staff/StaffHome';
import AssignedComplaints from '../components/staff/AssignedComplaints';
import AssignedHousekeeping from '../components/staff/AssignedHousekeeping';

const StaffDashboard = () => {
  const menuItems = [
    { path: '/staff', label: 'Dashboard', icon: 'dashboard' },
    { path: '/staff/complaints', label: 'Assigned Complaints', icon: 'complaints' },
    { path: '/staff/housekeeping', label: 'Housekeeping Tasks', icon: 'housekeeping' }
  ];

  return (
    <div className="flex min-h-screen landing-bg">
      <Sidebar menuItems={menuItems} />
      <main className="flex-1 md:ml-64 p-6">
        <Routes>
          <Route path="/" element={<StaffHome />} />
          <Route path="/complaints" element={<AssignedComplaints />} />
          <Route path="/housekeeping" element={<AssignedHousekeeping />} />
        </Routes>
      </main>
    </div>
  );
};

export default StaffDashboard;
