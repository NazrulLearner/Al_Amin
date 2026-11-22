// src/app/layouts/Topbar.tsx
// অ্যাপের উপরনের বার — কম্প্যাক্ট, রেসপন্সিভ, প্রফেশনাল

import React, { useState, useRef, useEffect } from 'react';
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
  Shield,
  Menu,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TopbarProps {
  toggleSidebar?: () => void;
}

const Topbar: React.FC<TopbarProps> = ({ toggleSidebar }) => {
  const { user, userData, somityInfo, logout, isSuperAdmin } = useAuth();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close user dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close notifications on outside click
  const notifRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getUserRole = (): string => {
    try {
      if (isSuperAdmin) return 'super_admin';
      if (!userData || !somityInfo) return '';
      return userData.role || '';
    } catch {
      return '';
    }
  };

  const userRole = getUserRole();

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-purple-600 text-white';
      case 'admin': return 'bg-purple-500 text-white';
      case 'cashier': return 'bg-blue-500 text-white';
      case 'manager': return 'bg-amber-500 text-white';
      case 'accountant': return 'bg-indigo-500 text-white';
      case 'collector': return 'bg-teal-500 text-white';
      case 'member': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'super_admin': return 'Super Admin';
      case 'admin': return 'Admin';
      case 'cashier': return 'Cashier';
      case 'manager': return 'Manager';
      case 'accountant': return 'Accountant';
      case 'collector': return 'Collector';
      default: return 'Member';
    }
  };

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const notifications = [
    { id: 1, text: 'New member joined', time: '5 min ago', read: false },
    { id: 2, text: 'Fee collection due today', time: '1 hour ago', read: false },
    { id: 3, text: 'Loan approved', time: '2 hours ago', read: true },
  ];
  const unreadCount = notifications.filter((n) => !n.read).length;

  const getCurrentDate = () => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
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
      {/* ===== Main row — compact padding on all screens ===== */}
      <div className="flex items-center justify-between px-3 lg:px-5 py-2">
        {/* ===== Left side: hamburger + org info ===== */}
        <motion.div
          className="flex items-center gap-2 min-w-0"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {/* Hamburger — flush left on mobile */}
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-1.5 -ml-1 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-5 h-5 text-white" />
          </button>

          {/* Super Admin view */}
          {isSuperAdmin && !somityInfo ? (
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/30 flex-shrink-0">
                <span className="text-sm font-bold">🌍</span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold truncate whitespace-nowrap">Super Admin Panel</p>
                <span className="inline-flex mt-0.5 px-1.5 py-0.5 text-[10px] font-medium rounded-full bg-purple-600 text-white">
                  Super Admin
                </span>
              </div>
            </div>
          ) : somityInfo ? (
            // Regular user view
            <div className="flex items-center gap-2 min-w-0">
              <div className="relative flex-shrink-0">
                <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/30">
                  <span className="text-sm font-bold">
                    {somityInfo.name?.charAt(0) || 'S'}
                  </span>
                </div>
              </div>
              <div className="min-w-0">
                {/* Single-line layout: name + role badge side by side */}
                <div className="flex items-center gap-1.5 min-w-0">
                  <p className="text-sm font-bold truncate">{somityInfo.name}</p>
                  <span
                    className={`flex-shrink-0 px-1.5 py-0.5 text-[10px] font-medium rounded-full ${getRoleBadgeStyle(userRole)}`}
                  >
                    {getRoleText(userRole)}
                  </span>
                </div>
                {/* Date: hidden on very narrow mobile (below 380px), visible on wider */}
                <p className="text-[10px] text-emerald-100 mt-0.5 hidden min-[380px]:block">
                  {getCurrentDate()}
                </p>
              </div>
            </div>
          ) : null}
        </motion.div>

        {/* ===== Right side: actions + user profile ===== */}
        <motion.div
          className="flex items-center gap-1"
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {/* Dark mode toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4 text-yellow-300" />
            ) : (
              <Moon className="w-4 h-4 text-white" />
            )}
          </button>

          {/* Notifications */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-1.5 hover:bg-white/10 rounded-full transition-colors relative"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4 text-white" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center border-2 border-emerald-600">
                  {unreadCount}
                </span>
              )}
            </button>

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
                        <div
                          key={notif.id}
                          className={`px-4 py-3 cursor-pointer transition-colors ${
                            !notif.read ? 'bg-blue-50' : ''
                          }`}
                        >
                          <p className="text-sm text-gray-800">{notif.text}</p>
                          <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                        </div>
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

          {/* User avatar + dropdown */}
          <div ref={dropdownRef} className="relative ml-1">
            <button
              onClick={toggleDropdown}
              className="flex items-center gap-2 p-1.5 hover:bg-white/10 rounded-xl transition-colors"
            >
              {/* Avatar always visible even on mobile */}
              <div className="relative flex-shrink-0">
                <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center text-white font-bold shadow-lg">
                  {user?.fullName?.charAt(0) || userData?.fullName?.charAt(0) || 'U'}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-emerald-600" />
              </div>
              {/* Name/email hidden on mobile, shown on tablet+ */}
              <div className="hidden sm:block text-left min-w-0">
                <p className="text-xs font-semibold truncate">
                  {user?.fullName || userData?.fullName || 'User'}
                </p>
                <p className="text-[10px] text-emerald-100 truncate">
                  {userData?.email || 'user@example.com'}
                </p>
              </div>
              {/* Chevron always visible */}
              <ChevronDown
                className={`w-3 h-3 text-white/80 transition-transform flex-shrink-0 ${
                  isDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl py-2 z-50 border border-gray-100"
                >
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-800">
                      {user?.fullName || userData?.fullName}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{userData?.email}</p>
                    {isSuperAdmin && (
                      <p className="text-xs text-purple-600 mt-1 flex items-center">
                        <Shield className="w-3 h-3 mr-1" />
                        Super Admin
                      </p>
                    )}
                  </div>
                  {isSuperAdmin ? (
                    <a
                      href="/super-admin"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Home className="w-4 h-4 mr-3 text-purple-600" />
                      <span>Super Admin Dashboard</span>
                    </a>
                  ) : (
                    <a
                      href="/my-profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <User className="w-4 h-4 mr-3 text-emerald-600" />
                      <span>প্রোফাইল</span>
                    </a>
                  )}
                  <a
                    href="/settings/account"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Settings className="w-4 h-4 mr-3 text-emerald-600" />
                    <span>সেটিংস</span>
                  </a>
                  <a
                    href="/support"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <HelpCircle className="w-4 h-4 mr-3 text-emerald-600" />
                    <span>সাহায্য</span>
                  </a>
                  <div className="border-t border-gray-100 my-2" />
                  <button
                    onClick={logout}
                    className="flex w-full text-left items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    <span>লগআউট</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Bottom decorative line */}
      <div className="h-0.5 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
    </motion.header>
  );
};

export default Topbar;
