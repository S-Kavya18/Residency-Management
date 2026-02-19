import { Routes, Route } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import AdminHome from '../components/admin/AdminHome';
import RoomManagement from '../components/admin/RoomManagement';
import ApplicationManagement from '../components/admin/ApplicationManagement';
import ComplaintManagement from '../components/admin/ComplaintManagement';
import Reports from '../components/admin/Reports';
import StaffManagement from '../components/admin/StaffManagement';
import HousekeepingManagement from '../components/admin/HousekeepingManagement';

const AdminDashboard = () => {
  const menuItems = [
    { path: '/admin', label: 'Dashboard', icon: 'dashboard' },
    { path: '/admin/rooms', label: 'Room Management', icon: 'rooms' },
    { path: '/admin/staff', label: 'Staff Management', icon: 'users' },
    { path: '/admin/applications', label: 'Applications', icon: 'applications' },
    { path: '/admin/complaints', label: 'Complaints', icon: 'complaints' },
    { path: '/admin/housekeeping', label: 'Housekeeping', icon: 'housekeeping' },
    { path: '/admin/reports', label: 'Reports', icon: 'reports' }
  ];

  return (
    <div className="flex min-h-screen landing-bg">
      <Sidebar menuItems={menuItems} />
      <main className="flex-1 md:ml-64 p-6">
        <Routes>
          <Route path="/" element={<AdminHome />} />
          <Route path="/rooms" element={<RoomManagement />} />
          <Route path="/staff" element={<StaffManagement />} />
          <Route path="/applications" element={<ApplicationManagement />} />
          <Route path="/complaints" element={<ComplaintManagement />} />
          <Route path="/housekeeping" element={<HousekeepingManagement />} />
          <Route path="/reports" element={<Reports />} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminDashboard;
