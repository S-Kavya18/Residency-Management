import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiHome,
  FiLogOut,
  FiMenu,
  FiX,
  FiFileText,
  FiAlertCircle,
  FiCoffee,
  FiSettings,
  FiUsers,
  FiClipboard,
  FiBarChart,
  FiMapPin
} from 'react-icons/fi';
import { useState } from 'react';

const Sidebar = ({ menuItems }) => {
  const location = useLocation();
  const { logout, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const iconMap = {
    dashboard: FiHome,
    applications: FiFileText,
    complaints: FiAlertCircle,
    food: FiCoffee,
    housekeeping: FiSettings,
    rooms: FiHome,
    users: FiUsers,
    reports: FiBarChart,
    tasks: FiClipboard,
    recommendations: FiMapPin,
    checkout: FiLogOut
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-teal-700 text-white rounded-lg"
      >
        {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out z-40 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-6">
          <h2 className="text-2xl font-display mb-8">RSM Lakshmini Residency</h2>
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = iconMap[item.icon] || FiHome;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-teal-700 text-white'
                      : 'text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <Icon />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="absolute bottom-0 w-full p-6 border-t border-slate-800">
          <div className="mb-4 px-4">
            <p className="text-sm text-slate-300">{user?.name}</p>
            <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <FiLogOut />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
