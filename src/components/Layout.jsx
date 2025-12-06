import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ConfirmationModal } from './ConfirmationModal';

export const Layout = ({ children }) => {
  const { logout, currentUser } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const location = useLocation();

  const { userClaims } = useAuth();
  const isActive = (path) => location.pathname === path;

  const navItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Alerts', path: '/alerts' },
    { label: 'Sensors', path: '/sensors' },
    { label: 'Settings', path: '/settings' },
  ];

  // Add Team for admins
  const isAdmin = ['super-admin', 'tenant-admin'].includes(userClaims?.role);
  if (isAdmin) {
    navItems.splice(navItems.length - 1, 0, { label: 'Team', path: '/team' });
  }

  // Super Admin navigation items
  const adminNavItems = userClaims?.role === 'super-admin' ? [
    { label: '🔧 Admin Dashboard', path: '/admin' },
    { label: '🏢 Tenants', path: '/admin/tenants' },
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">W</span>
              </div>
              <span className="hidden sm:inline text-xl font-bold text-gray-900">
                Workside Signals
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              
              {/* Admin Navigation (Super Admin Only) */}
              {adminNavItems.length > 0 && (
                <>
                  <div className="w-px h-8 bg-gray-300 mx-2 self-center" />
                  {adminNavItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive(item.path)
                          ? 'bg-red-100 text-red-700'
                          : 'text-gray-700 hover:bg-red-50'
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </>
              )}
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <span className="hidden sm:inline text-sm text-gray-600">
                {currentUser?.email}
              </span>
              <button
                onClick={handleLogoutClick}
                className="btn-secondary text-sm"
              >
                Logout
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <nav className="md:hidden pb-4 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActive(item.path)
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              
              {/* Admin Navigation (Mobile) */}
              {adminNavItems.length > 0 && (
                <>
                  <div className="border-t border-gray-200 my-2" />
                  {adminNavItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                        isActive(item.path)
                          ? 'bg-red-100 text-red-700'
                          : 'text-gray-700 hover:bg-red-50'
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </>
              )}
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto">
        {children}
      </main>

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

