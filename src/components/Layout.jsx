import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ConfirmationModal } from './ConfirmationModal';
import TenantSwitcher from './TenantSwitcher';

// Icons (using Unicode/Emoji for simplicity - you could use react-icons later)
const Icons = {
  Dashboard: () => <span className="text-xl">📊</span>,
  Alerts: () => <span className="text-xl">🚨</span>,
  Sensors: () => <span className="text-xl">📡</span>,
  Team: () => <span className="text-xl">👥</span>,
  Settings: () => <span className="text-xl">⚙️</span>,
  Admin: () => <span className="text-xl">🔧</span>,
  Tenants: () => <span className="text-xl">🏢</span>,
  Demo: () => <span className="text-xl">🎬</span>,
  Menu: () => <span className="text-xl">☰</span>,
  Close: () => <span className="text-xl">✕</span>,
  Logout: () => <span className="text-xl">🚪</span>,
};

export const Layout = ({ children }) => {
  const { logout, currentUser, userClaims } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: Icons.Dashboard },
    { label: 'Alerts', path: '/alerts', icon: Icons.Alerts },
    { label: 'Sensors', path: '/sensors', icon: Icons.Sensors },
  ];

  // Add Team for admins
  const isAdmin = ['super-admin', 'tenant-admin'].includes(userClaims?.role);
  if (isAdmin) {
    navItems.push({ label: 'Team', path: '/team', icon: Icons.Team });
  }

  navItems.push({ label: 'Settings', path: '/settings', icon: Icons.Settings });

  // Super Admin navigation items
  const adminNavItems = userClaims?.role === 'super-admin' ? [
    { label: 'Admin Dashboard', path: '/admin', icon: Icons.Admin },
    { label: 'Tenants', path: '/admin/tenants', icon: Icons.Tenants },
    { label: 'Demo Control', path: '/admin/demo', icon: Icons.Demo },
  ] : [];

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleLogoutConfirm = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
      setShowLogoutConfirm(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-30
          w-64 bg-gradient-to-b from-primary-700 to-primary-800
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col shadow-xl
        `}
      >
        {/* Logo */}
        <div className="p-6 border-b border-primary-600">
          <Link to="/dashboard" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-primary-700 font-bold text-xl">W</span>
            </div>
            <div className="flex flex-col">
              <span className="text-black font-bold text-2xl leading-tight">Workside</span>
              <span className="text-black text-2xl font-semibold">Signals</span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`
                  flex items-center space-x-3 px-4 py-3 rounded-lg
                  transition-all duration-200 group
                  ${
                    isActive(item.path)
                      ? 'bg-white text-primary-700 shadow-md'
                      : 'text-primary-100 hover:bg-green-500 hover:text-black'
                  }
                `}
              >
                <Icon />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}

          {/* Admin Section */}
          {adminNavItems.length > 0 && (
            <>
              <div className="border-t border-primary-600 my-4 pt-4">
                <p className="px-4 text-xs font-semibold text-primary-300 uppercase tracking-wider mb-2">
                  Admin
                </p>
              </div>
              {adminNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`
                      flex items-center space-x-3 px-4 py-3 rounded-lg
                      transition-all duration-200 group
                      ${
                        isActive(item.path)
                          ? 'bg-white text-primary-700 shadow-md'
                          : 'text-primary-100 hover:bg-green-500 hover:text-black'
                      }
                    `}
                  >
                    <Icon />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </>
          )}
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-primary-600">
          <div className="px-3 py-2 mb-2">
            <p className="text-sm text-black font-medium mb-1">Signed in as</p>
            <p className="text-md text-black font-semibold truncate">{currentUser?.email}</p>
            {userClaims?.role && (
              <p className="text-xs text-primary-200 capitalize mt-1">
                {userClaims.role.replace(/-/g, ' ')}
              </p>
            )}
          </div>
          <button
            onClick={handleLogoutClick}
            className="
              w-full flex items-center space-x-2 px-4 py-2.5 rounded-lg
              bg-red-600 hover:bg-red-700 text-white
              transition-colors duration-200 font-medium shadow-md
            "
            style={{ position: 'relative', zIndex: 10 }}
          >
            <Icons.Logout />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar (Desktop) - Hidden on mobile */}
        <header className="hidden lg:block bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
          <div className="flex items-center justify-between px-6 py-3">
            <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
            <TenantSwitcher />
          </div>
        </header>

        {/* Top Bar (Mobile) */}
        <header className="lg:hidden bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-lg text-gray-700 hover:bg-gray-100"
            >
              <Icons.Menu />
            </button>
            <h1 className="text-lg font-bold text-gray-900">Workside Signals</h1>
            <div className="w-10" /> {/* Spacer for centering */}
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      <ConfirmationModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogoutConfirm}
        title="Confirm Logout"
        message="Are you sure you want to logout? You will need to login again to access the dashboard."
        confirmText="Logout"
        cancelText="Cancel"
        variant="warning"
        isLoading={isLoggingOut}
      />
    </div>
  );
};

