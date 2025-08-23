'use client'
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, Menu, X, User, LogOut, Settings, Trash2, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import { LanguageSelector } from './LanguageSelector';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../assets/Logo.png';

export const Header: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);

  const [notifications, setNotifications] = useState([
    { id: 1, text: 'Your appointment is confirmed.', time: '2 min ago', read: false },
    { id: 2, text: 'New health tip is available.', time: '10 min ago', read: false },
    { id: 3, text: 'Password changed successfully.', time: '1 hr ago', read: true },
  ]);

  const profileMenuRef = useRef<HTMLDivElement | null>(null);
  const notificationsRef = useRef<HTMLDivElement | null>(null);
  const languageRef = useRef<HTMLDivElement | null>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (languageRef.current && !languageRef.current.contains(e.target as Node)) {
        setShowLanguageMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowProfileMenu(false);
  };

  const clearAllNotifications = () => setNotifications([]);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to={isAuthenticated && user?.role === 'patient' ? '/dashboard' : user?.role==='hospital' ? '/hospital/dashboard' : '/'} className="flex items-center space-x-2">
            <div className="w-14 h-14 rounded-lg flex items-center justify-center">
              <img src={logo} alt="Aarogya Mitra" className="h-8 sm:h-10 md:h-12 lg:h-14 w-auto" />
            </div>
            <span className="text-xl font-bold text-gray-900">MediMitra</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Language Selector with outside click */}
            <div ref={languageRef}>
              <LanguageSelector
                isOpen={showLanguageMenu}
                setIsOpen={setShowLanguageMenu}
              />
            </div>

            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <div className="relative" ref={notificationsRef}>
                  <button
                    className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
                    onClick={() => setShowNotifications((prev) => !prev)}
                  >
                    <Bell className="w-5 h-5" />
                    {notifications.length > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-[3px] bg-gradient-to-r from-blue-500 to-emerald-500 text-white text-xs font-medium rounded-full flex items-center justify-center shadow">
                        {notifications.length > 9 ? '9+' : notifications.length}
                      </span>
                    )}
                  </button>

                  <AnimatePresence>
                    {showNotifications && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden z-50"
                      >
                        <div className="flex items-center justify-between px-4 py-3 border-b bg-gradient-to-r from-blue-50 to-emerald-50">
                          <span className="font-semibold text-gray-800 text-sm">Notifications</span>
                          {notifications.length > 0 && (
                            <button
                              onClick={clearAllNotifications}
                              className="text-xs text-blue-600 hover:text-emerald-600 font-medium flex items-center space-x-1"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Clear All</span>
                            </button>
                          )}
                        </div>

                        {notifications.length > 0 ? (
                          <div className="max-h-64 overflow-y-auto">
                            {notifications.map((n) => (
                              <div
                                key={n.id}
                                className="px-4 py-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-emerald-50 transition-colors"
                              >
                                <span className="text-sm text-gray-700">{n.text}</span>
                                <div className="flex items-center text-xs text-gray-400 mt-1">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {n.time}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="px-4 py-6 text-center text-gray-400 text-sm">
                            No new notifications
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Profile Menu */}
                <div className="relative" ref={profileMenuRef}>
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center space-x-3 text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full flex items-center justify-center overflow-hidden">
                      {user?.avatar ? (
                        <img
                          src={user.avatar}
                          alt="Profile"
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <span className="text-white text-sm font-medium">
                          {user?.name?.[0]?.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <span className="font-medium">{user?.name}</span>
                  </button>
                  <AnimatePresence>
                    {showProfileMenu && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2"
                      >
                        {user?.role==='patient' ? <Link
                          to="/profile"
                          className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setShowProfileMenu(false)}
                        >
                          <User className="w-4 h-4" />
                          <span>{t('header.profile')}</span>
                        </Link> : <Link
                          to="/hospital/profile"
                          className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setShowProfileMenu(false)}
                        >
                          <User className="w-4 h-4" />
                          <span>{t('header.profile')}</span>
                        </Link>}
                        <hr className="my-2 border-gray-200" />
                        <button
                          onClick={handleLogout}
                          className="flex items-center space-x-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>{t('header.logout')}</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-gray-700 hover:text-gray-900 font-medium transition-colors">
                  {t('nav.login')}
                </Link>
                <Link
                  to="/signup"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  {t('nav.signup')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {showMobileMenu && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-gray-200 py-4"
            >
              <div className="space-y-4">
                <div ref={languageRef}>
                  <LanguageSelector
                    isOpen={showLanguageMenu}
                    setIsOpen={setShowLanguageMenu}
                  />
                </div>
                {isAuthenticated ? (
                  <>
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full flex items-center justify-center overflow-hidden">
                      {user?.avatar ? (
                        <img
                          src={user.avatar}
                          alt="Profile"
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <span className="text-white text-sm font-medium">
                          {user?.name?.[0]?.toUpperCase()}
                        </span>
                      )}
                    </div>
                    {user?.role==='patient' ? <Link
                      to="/profile"
                      className="block text-gray-700 hover:text-gray-900 transition-colors"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      {t('header.profile')}
                    </Link> : <Link 
                      to={'/hospital/profile'}
                      className='block text-gray-700 hover:text-gray-900 transition-colors'
                      onClick={() => setShowMobileMenu(false)}
                      ></Link>}
                    <button
                      onClick={handleLogout}
                      className="block text-red-600 hover:text-red-700 transition-colors text-left"
                    >
                      {t('header.logout')}
                    </button>
                  </>
                ) : (
                  <div className="space-y-3">
                    <Link
                      to="/login"
                      className="block text-gray-700 hover:text-gray-900 font-medium transition-colors"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      {t('nav.login')}
                    </Link>
                    <Link
                      to="/signup"
                      className="block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium text-center"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      {t('nav.signup')}
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};
