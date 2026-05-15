// src/components/Topbar.tsx
import React, { useState } from 'react';
import { useAuth } from '../providers/AuthProvider';
import { 
  Bell, 
  User, 
  LogOut, 
  ChevronDown, 
  Home,
  Calendar,
  Moon,
  Sun,
  Settings,
  HelpCircle,
  Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Topbar: React.FC = () => {
  const { user, userData, somityInfo, logout, isSuperAdmin } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Get current user role with proper path
  const getUserRole = (): string => {
    try {
      // Super admin check
      if (isSuperAdmin) {
        return 'super_admin';
      }
      
      if (!userData || !somityInfo) return '';
      return userData.role || '';
    } catch (error) {
      console.error('Error getting user role:', error);
      return '';
    }
  };

  const userRole = getUserRole();

  // Role badge color mapping (Super Admin added)
  const getRoleBadgeStyle = (role: string) => {
    switch(role) {
      case 'super_admin':
        return 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-purple-200';
      case 'admin':
        return 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-purple-200';
      case 'cashier':
        return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-blue-200';
      case 'member':
        return 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-green-200';
      default:
        return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-gray-200';
    }
  };

  // Role icon mapping (Super Admin added)
  const getRoleIcon = (role: string) => {
    switch(role) {
      case 'super_admin':
        return <Shield className="w-3 h-3 mr-1" />;
      case 'admin':
        return <Shield className="w-3 h-3 mr-1" />;
      case 'cashier':
        return <Home className="w-3 h-3 mr-1" />;
      default:
        return <User className="w-3 h-3 mr-1" />;
    }
  };

  // Role text mapping (Super Admin added)
  const getRoleText = (role: string) => {
    switch(role) {
      case 'super_admin':
        return 'সুপার অ্যাডমিন';
      case 'admin':
        return 'অ্যাডমিন';
      case 'cashier':
        return 'ক্যাশিয়ার';
      default:
        return 'সদস্য';
    }
  };

  // Toggle dropdown
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    // Here you would implement actual dark mode toggle
  };

  // Sample notifications
  const notifications = [
    { id: 1, text: 'New member joined', time: '5 min ago', read: false },
    { id: 2, text: 'Fee collection due today', time: '1 hour ago', read: false },
    { id: 3, text: 'Loan approved', time: '2 hours ago', read: true },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  // Format current date in Bangla style
  const getCurrentDate = () => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return now.toLocaleDateString('bn-BD', options);
  };

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 text-white shadow-lg"
    >
      <div className="flex items-center justify-between px-6 py-3">
        {/* Left side - Somity Info */}
        <motion.div 
          className="flex items-center space-x-4"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {/* For Super Admin - Show different icon when no somity */}
          {isSuperAdmin && !somityInfo ? (
            <>
              <div className="relative">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg border border-white/30">
                  <span className="text-xl font-bold text-white">🌍</span>
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center space-x-2">
                  <motion.h1 
                    className="text-xl font-bold tracking-tight"
                    whileHover={{ scale: 1.02 }}
                  >
                    Super Admin Panel
                  </motion.h1>
                  <motion.span 
                    className={`ml-2 px-3 py-1 text-xs font-medium rounded-full shadow-md flex items-center ${getRoleBadgeStyle('super_admin')}`}
                    whileHover={{ scale: 1.05 }}
                  >
                    {getRoleIcon('super_admin')}
                    {getRoleText('super_admin')}
                  </motion.span>
                </div>
                <div className="flex items-center text-xs text-emerald-100 mt-1">
                  <Calendar className="w-3 h-3 mr-1" />
                  <span>{getCurrentDate()}</span>
                </div>
              </div>
            </>
          ) : somityInfo ? (
            <>
              {/* Somity Logo/Icon */}
              <div className="relative">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg border border-white/30">
                  <span className="text-xl font-bold text-white">
                    {somityInfo.name?.charAt(0) || 'S'}
                  </span>
                </div>
                <motion.div 
                  className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                />
              </div>

              {/* Somity Details */}
              <div className="flex flex-col">
                <div className="flex items-center space-x-2">
                  <motion.h1 
                    className="text-xl font-bold tracking-tight"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {somityInfo.name}
                  </motion.h1>
                  
                  {/* Role Badge with Icon */}
                  <motion.span 
                    className={`ml-2 px-3 py-1 text-xs font-medium rounded-full shadow-md flex items-center ${getRoleBadgeStyle(userRole)}`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {getRoleIcon(userRole)}
                    {getRoleText(userRole)}
                  </motion.span>
                </div>

                {/* Date Display */}
                <div className="flex items-center text-xs text-emerald-100 mt-1">
                  <Calendar className="w-3 h-3 mr-1" />
                  <span>{getCurrentDate()}</span>
                </div>
              </div>
            </>
          ) : null}
        </motion.div>

        {/* Right side - User Menu */}
        <motion.div 
          className="flex items-center space-x-3"
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {/* Dark Mode Toggle */}
          <motion.button 
            whileHover={{ scale: 1.1, rotate: 15 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleDarkMode}
            className="p-2 hover:bg-white/10 rounded-full transition-all duration-300 relative group"
          >
            {isDarkMode ? 
              <Sun className="w-5 h-5 text-yellow-300" /> : 
              <Moon className="w-5 h-5 text-white" />
            }
            <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {isDarkMode ? 'Light Mode' : 'Dark Mode'}
            </span>
          </motion.button>

          {/* Notifications */}
          <div className="relative">
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 hover:bg-white/10 rounded-full transition-all duration-300 relative group"
            >
              <Bell className="w-5 h-5 text-white" />
              {unreadCount > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center border-2 border-white"
                >
                  {unreadCount}
                </motion.span>
              )}
            </motion.button>

            {/* Notifications Dropdown */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl py-2 z-50 border border-gray-100"
                >
                  <div className="px-4 py-2 border-b border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-700">নোটিফিকেশন</h3>
                  </div>
                  {notifications.length > 0 ? (
                    <>
                      {notifications.map((notif) => (
                        <motion.div
                          key={notif.id}
                          whileHover={{ backgroundColor: '#f3f4f6' }}
                          className={`px-4 py-3 cursor-pointer transition-colors ${!notif.read ? 'bg-blue-50' : ''}`}
                        >
                          <p className="text-sm text-gray-800">{notif.text}</p>
                          <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                        </motion.div>
                      ))}
                      <div className="px-4 py-2 border-t border-gray-100">
                        <button className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">
                          সব দেখুন
                        </button>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">কোন নোটিফিকেশন নেই</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* User Menu */}
          <div className="relative">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={toggleDropdown}
              className="flex items-center space-x-3 p-2 hover:bg-white/10 rounded-xl transition-all duration-300 group"
            >
              {/* User Avatar with Gradient */}
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg group-hover:shadow-xl transition-shadow">
                  {user?.fullName?.charAt(0) || userData?.fullName?.charAt(0) || 'U'}
                </div>
                <motion.div 
                  className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                />
              </div>

              {/* User Info */}
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold">
                  {user?.fullName || userData?.fullName || 'User'}
                </p>
                <p className="text-xs text-emerald-100">
                  {userData?.email || 'user@example.com'}
                </p>
              </div>

              {/* Dropdown Arrow */}
              <motion.div
                animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDown className="w-4 h-4 text-white/80" />
              </motion.div>
            </motion.button>
            
            {/* Dropdown Menu */}
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl py-2 z-50 border border-gray-100"
                >
                  {/* User Info Header */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-800">
                      {user?.fullName || userData?.fullName}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {userData?.email}
                    </p>
                    {/* Role indicator for Super Admin */}
                    {isSuperAdmin && (
                      <p className="text-xs text-purple-600 mt-1 flex items-center">
                        <Shield className="w-3 h-3 mr-1" />
                        Super Admin
                      </p>
                    )}
                  </div>

                  {/* Menu Items - Dynamic based on role */}
                  {isSuperAdmin ? (
                    <>
                      <motion.a 
                        href="/super-admin"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        whileHover={{ x: 5 }}
                      >
                        <Home className="w-4 h-4 mr-3 text-purple-600" />
                        <span>Super Admin Dashboard</span>
                      </motion.a>
                      <motion.a 
                        href="/super-admin/requests"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        whileHover={{ x: 5 }}
                      >
                        <Shield className="w-4 h-4 mr-3 text-purple-600" />
                        <span>Somity Requests</span>
                      </motion.a>
                    </>
                  ) : (
                    <>
                      <motion.a 
                        href="/my-profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        whileHover={{ x: 5 }}
                      >
                        <User className="w-4 h-4 mr-3 text-emerald-600" />
                        <span>প্রোফাইল</span>
                      </motion.a>
                    </>
                  )}

                  <motion.a 
                    href="/settings/account"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    whileHover={{ x: 5 }}
                  >
                    <Settings className="w-4 h-4 mr-3 text-emerald-600" />
                    <span>সেটিংস</span>
                  </motion.a>

                  <motion.a 
                    href="/support"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    whileHover={{ x: 5 }}
                  >
                    <HelpCircle className="w-4 h-4 mr-3 text-emerald-600" />
                    <span>সাহায্য</span>
                  </motion.a>

                  <div className="border-t border-gray-100 my-2"></div>

                  <motion.button
                    whileHover={{ backgroundColor: '#fee2e2' }}
                    onClick={logout}
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    <span>লগআউট</span>
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Decorative Bottom Line */}
      <motion.div 
        className="h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      />
    </motion.header>
  );
};

export default Topbar;
