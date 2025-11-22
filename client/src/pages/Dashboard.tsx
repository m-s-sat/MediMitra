import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Calendar,
  FileText,
  Pill,
  Video,
  Phone,
  MessageCircle,
  AlertTriangle,
  Activity,
  Users,
  MapPin,
  Globe2,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { useCheckUserStatusQuery } from '../store/api/authApi';
import { selectTranslation } from '../store/slices/languageSlice';
import { QuickActionCard } from '../components/QuickActionCard';
import { calculateCompletionPercentage } from '../utils/utils';
import { useGeolocation } from '../custom_hooks/locationHook.tsx';
import { User } from '../types';

export const Dashboard: React.FC = () => {
  const { loaded, coords, error } = useGeolocation({
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0,
  });
  useEffect(() => {
    if (loaded) console.log(coords.lat, coords.lng);
    if (error) console.log(error)
  }, [coords.lat, coords.lng, error, loaded])

  const { data: userData } = useCheckUserStatusQuery();
  const user = userData as User;
  const t = useSelector(selectTranslation);
  const navigate = useNavigate();

  const mockProfileData = {
    name: user?.name || '',
    age: user?.age || '',
    gender: user?.gender || '',
    phone: user?.phone || '',
    email: user?.email || '',
    emergencyContact: {
      name: user?.emergencyContact?.name || '',
      phone: user?.emergencyContact?.phone || '',
      relationship: user?.emergencyContact?.relationship || ''
    },
    medicalHistory: {
      pastIllnesses: user?.medicalHistory?.pastIllnesses || [],
      ongoingConditions: user?.medicalHistory?.ongoingConditions || [],
      allergies: user?.medicalHistory?.allergies || [],
      currentMedications: user?.medicalHistory?.currentMedications || []
    },
    bodyMeasurements: {
      height: user?.bodyMeasurements?.height || '',
      weight: user?.bodyMeasurements?.weight || '',
      bmi: user?.bodyMeasurements?.bmi || ''
    }
  };

  const completionPercentage = calculateCompletionPercentage(user, mockProfileData);
  const isProfileComplete = completionPercentage === 100;

  const quickActions = [
    {
      icon: MessageCircle,
      title: t('dashboard.quickActions.assistant'),
      description: t('dashboard.quickActions.assistantDesc'),
      onClick: () => navigate('/chat'),
      gradient: 'bg-gradient-to-r from-pink-500 to-pink-600'
    },
    {
      icon: Calendar,
      title: t('features.appointments'),
      description: t('dashboard.quickActions.appointmentsDesc'),
      onClick: () => navigate('/appointments'),
      gradient: 'bg-gradient-to-r from-blue-500 to-blue-600'
    },
    {
      icon: FileText,
      title: t('dashboard.quickActions.reports'),
      description: t('dashboard.quickActions.reportsDesc'),
      onClick: () => navigate('/reports'),
      gradient: 'bg-gradient-to-r from-emerald-500 to-emerald-600'
    },
    {
      icon: Pill,
      title: t('dashboard.quickActions.medicines'),
      description: t('dashboard.quickActions.medicinesDesc'),
      onClick: () => navigate('/medicines'),
      gradient: 'bg-gradient-to-r from-purple-500 to-purple-600'
    },
    {
      icon: Video,
      title: t('dashboard.quickActions.visits'),
      description: t('dashboard.quickActions.visitsDesc'),
      onClick: () => navigate('/visits'),
      gradient: 'bg-gradient-to-r from-indigo-500 to-indigo-600'
    },
    {
      icon: Phone,
      title: t('dashboard.quickActions.helpdesk'),
      description: t('dashboard.quickActions.helpdeskDesc'),
      onClick: () => navigate('/helpdesk'),
      gradient: 'bg-gradient-to-r from-orange-500 to-orange-600'
    }
  ];

  const upcomingAppointments = [
    {
      doctor: 'Dr. Sarah Johnson',
      department: 'Cardiology',
      date: '2025-01-15',
      time: '10:30 AM',
      type: 'video' as const
    },
    {
      doctor: 'Dr. Michael Chen',
      department: 'General Medicine',
      date: '2025-01-18',
      time: '2:00 PM',
      type: 'physical' as const
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Greeting Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            {t('dashboard.greeting', { name: user?.name || t('common.there') })}
          </h1>
          <p className="text-gray-600 text-lg">
            {t('dashboard.subtitle')}
          </p>
        </motion.div>

        {/* Profile Completion Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={`relative p-6 sm:p-8 rounded-2xl shadow-xl overflow-hidden mb-8 transform hover:scale-[1.01] transition-transform duration-300
            ${isProfileComplete ? 'bg-gradient-to-br from-green-400 to-blue-500 text-white' : 'bg-white text-gray-900 border border-gray-100'}`}
        >
          <div className="flex justify-between items-center z-10 relative">
            <div>
              <p className="text-sm font-semibold mb-1">
                {isProfileComplete ? 'Profile Status' : 'Profile Completion'}
              </p>
              <h2 className={`text-2xl md:text-3xl font-bold
                ${isProfileComplete ? 'text-white' : 'text-gray-900'}`}>
                {isProfileComplete ? 'Your profile is complete!' : `${completionPercentage}% Completed`}
              </h2>
            </div>
            {isProfileComplete ? (
              <CheckCircle className="w-12 h-12 text-white opacity-90" />
            ) : (
              <div className="flex flex-col items-end">
                <div className="relative w-20 h-20">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      className="text-gray-200"
                      strokeWidth="6"
                      stroke="currentColor"
                      fill="transparent"
                      r="34"
                      cx="40"
                      cy="40"
                    />
                    <motion.circle
                      className="text-blue-500"
                      strokeWidth="6"
                      strokeDasharray={2 * Math.PI * 34}
                      strokeDashoffset={2 * Math.PI * 34 * (1 - completionPercentage / 100)}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                      r="34"
                      cx="40"
                      cy="40"
                      initial={{ strokeDashoffset: 2 * Math.PI * 34 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 34 * (1 - completionPercentage / 100) }}
                      transition={{ duration: 1.5, ease: 'easeOut' }}
                    />
                  </svg>
                  <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-lg font-bold text-gray-800">
                    {completionPercentage}%
                  </span>
                </div>
              </div>
            )}
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/profile')}
            className={`mt-4 px-6 py-2 rounded-full font-semibold flex items-center gap-2 transition-colors duration-300
              ${isProfileComplete ? 'bg-white text-green-600 hover:bg-gray-100' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
          >
            {isProfileComplete ? 'View Profile' : 'Complete Your Profile'}
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </motion.div>

        {/* Health Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('dashboard.stats.nextAppointment')}</p>
                <p className="text-2xl font-bold text-gray-900">{t('dashboard.stats.today')}</p>
                <p className="text-sm text-blue-600">10:30 AM</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('dashboard.stats.activeMedicines')}</p>
                <p className="text-2xl font-bold text-gray-900">5</p>
                <p className="text-sm text-emerald-600">{t('dashboard.stats.dueToday', { count: String(2) })}</p>
              </div>
              <Pill className="w-8 h-8 text-emerald-600" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('dashboard.stats.healthScore')}</p>
                <p className="text-2xl font-bold text-gray-900">85</p>
                <p className="text-sm text-purple-600">{t('dashboard.stats.good')}</p>
              </div>
              <Activity className="w-8 h-8 text-purple-600" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('dashboard.stats.familyMembers')}</p>
                <p className="text-2xl font-bold text-gray-900">4</p>
                <p className="text-sm text-orange-600">{t('dashboard.stats.active')}</p>
              </div>
              <Users className="w-8 h-8 text-orange-600" />
            </div>
          </motion.div>
        </div>

        {/* Quick Actions Grid */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">{t('dashboard.quickActions.title')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <QuickActionCard
                key={index}
                {...action}
                index={index}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upcoming Appointments */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">{t('dashboard.upcomingAppointments')}</h2>
              <button
                onClick={() => navigate('/appointments')}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
              >
                {t('common.viewAll')} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              {upcomingAppointments.map((apt, index) => (
                <div key={index} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center
                    ${apt.type === 'video' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
                    {apt.type === 'video' ? <Video className="w-6 h-6" /> : <MapPin className="w-6 h-6" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{apt.doctor}</h3>
                    <p className="text-sm text-gray-600">{apt.department}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{apt.time}</p>
                    <p className="text-sm text-gray-500">{apt.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Health Insights */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">{t('dashboard.healthInsights')}</h2>
              <Globe2 className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-orange-50 border border-orange-100">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-orange-900 mb-1">{t('dashboard.fluAlert')}</h3>
                    <p className="text-sm text-orange-700">
                      {t('dashboard.fluAlertDesc')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Stay Tuned Badge */}
              <div className="text-center mt-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-600">
                  {t('common.stayTuned')}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer / Copyright Section */}
      <footer className="w-full bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} MediMitra. All Rights Reserved.
        </div>
      </footer>
    </div>
  );
};