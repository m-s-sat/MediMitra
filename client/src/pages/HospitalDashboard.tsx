import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { motion } from 'framer-motion';
import BedManagementComponent from '../components/BedManagementComponent.tsx';
import {
  Users,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Plus,
  Bed,
  Activity,
  Settings,
  BarChart3,
  UserPlus,
  Bell,
  MoreVertical,
  X,
} from 'lucide-react';
import { Doctor, Hospital } from '../types/index.ts';
import { useCheckUserStatusQuery, useAddDoctorMutation } from '../store/api/authApi.ts';

interface HospitalStats {
  totalPatients: number;
  todayAppointments: number;
  occupancyRate: number;
  revenue: {
    today: number;
    thisMonth: number;
    thisYear: number;
  };
  departmentStats: Record<string, { appointments: number; revenue: number; occupancy: number }>;
}

export const HospitalDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { data: userData, isLoading } = useCheckUserStatusQuery();
  const [addDoctor] = useAddDoctorMutation();
  const hospitalUser = userData as Hospital;

  const [activeTab, setActiveTab] = useState<'overview' | 'beds' | 'doctors' | 'analytics'>('overview');
  const [hospitalStats, setHospitalStats] = useState<HospitalStats | null>(null);
  const [isAddDoctorModalOpen, setIsAddDoctorModalOpen] = useState(false);
  const [profileCompletion, setProfileCompletion] = useState(0);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsAddDoctorModalOpen(false);
      }
    };

    if (isAddDoctorModalOpen) {
      document.addEventListener("keydown", handleKeyDown);
    } else {
      document.removeEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isAddDoctorModalOpen]);

  const [newDoctorForm, setNewDoctorForm] = useState<Omit<Doctor, 'id' | 'isVerified'>>({
    name: '',
    specialization: '',
    phone: '',
    email: '',
    registrationNumber: '',
    department: '',
    qualification: '',
    experienceYears: 0,
    opdDays: [],
  });

  useEffect(() => {
    // Mock stats for demonstration
    const mockStats: HospitalStats = {
      totalPatients: 1250,
      todayAppointments: 45,
      occupancyRate: 40,
      revenue: {
        today: 125000,
        thisMonth: 2500000,
        thisYear: 25000000
      },
      departmentStats: {
        'Cardiology': { appointments: 12, revenue: 45000, occupancy: 75 },
        'General Medicine': { appointments: 20, revenue: 30000, occupancy: 73 }
      }
    };
    setHospitalStats(mockStats);

    if (hospitalUser) {
      setProfileCompletion(calculateProfileCompletion(hospitalUser));
    }
  }, [hospitalUser]);

  const calculateProfileCompletion = (profile: Hospital): number => {
    if (!profile) return 0;
    let completedFields = 0;
    let totalFields = 0;

    const checkField = (val: any) => {
      totalFields++;
      if (val && (Array.isArray(val) ? val.length > 0 : true)) {
        completedFields++;
      }
    };

    if (profile.hospital) {
      checkField(profile.hospital.name);
      checkField(profile.hospital.address);
      checkField(profile.hospital.district);
      checkField(profile.hospital.state);
      checkField(profile.hospital.pincode);
      checkField(profile.hospital.mainPhone);
      checkField(profile.hospital.emergencyPhone);
      checkField(profile.hospital.website);
    }
    checkField(profile.departments);
    checkField(profile.services);
    checkField(profile.accreditations);
    checkField(profile.taxInfo);

    return totalFields === 0 ? 0 : Math.round((completedFields / totalFields) * 100);
  };

  const handleDoctorFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewDoctorForm({ ...newDoctorForm, [name]: value });
  };

  const handleAddDoctorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hospitalUser) {
      try {
        const doctor: Doctor = {
          ...newDoctorForm,
          id: `DOC${Date.now()}`, // Temporary ID generation
          isVerified: false
        };

        await addDoctor(doctor).unwrap();

        setIsAddDoctorModalOpen(false);
        setNewDoctorForm({
          name: '', specialization: '', phone: '', email: '', registrationNumber: '', department: '', qualification: '', experienceYears: 0, opdDays: []
        });
        alert('Doctor added successfully!');
      } catch (error: any) {
        console.error('Failed to add doctor:', error);
        alert(`Error adding doctor: ${error.message || 'Unknown error'}`);
      }
    }
  };

  const canAddDoctors = profileCompletion >= 60;
  const emergencyUnlocked = profileCompletion >= 80;
  const publiclyVisible = profileCompletion >= 100;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading hospital dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {hospitalUser?.hospital?.name || 'Hospital Dashboard'}
              </h1>
              <p className="text-gray-600 text-lg">Manage your hospital operations and profile</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50">
                <Bell className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50">
                <Settings className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Profile Completion Alert */}
        {profileCompletion < 100 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1">Complete Your Hospital Profile</h3>
                  <p className="text-orange-100 mb-2">
                    Your profile is {profileCompletion}% complete.
                    Complete it to unlock all features.
                  </p>
                  <div className="w-64 bg-white bg-opacity-20 rounded-full h-2">
                    <div
                      className="bg-white h-2 rounded-full transition-all duration-500"
                      style={{ width: `${profileCompletion}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              <button
                onClick={() => navigate('/hospital/profile')}
                className="bg-white text-orange-600 px-6 py-3 rounded-lg font-semibold hover:bg-orange-50 transition-colors"
              >
                Complete Profile
              </button>
            </div>
          </motion.div>
        )}

        {/* Feature Unlock Status */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className={`p-4 rounded-lg border ${canAddDoctors ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-center space-x-2">
              {canAddDoctors ? (
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-gray-400" />
              )}
              <span className={`font-medium ${canAddDoctors ? 'text-emerald-700' : 'text-gray-600'}`}>
                Add Doctors {canAddDoctors ? 'Unlocked' : 'Locked (60% required)'}
              </span>
            </div>
          </div>

          <div className={`p-4 rounded-lg border ${emergencyUnlocked ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-center space-x-2">
              {emergencyUnlocked ? (
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-gray-400" />
              )}
              <span className={`font-medium ${emergencyUnlocked ? 'text-emerald-700' : 'text-gray-600'}`}>
                Emergency Panel {emergencyUnlocked ? 'Unlocked' : 'Locked (80% required)'}
              </span>
            </div>
          </div>

          <div className={`p-4 rounded-lg border ${publiclyVisible ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-center space-x-2">
              {publiclyVisible ? (
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-gray-400" />
              )}
              <span className={`font-medium ${publiclyVisible ? 'text-emerald-700' : 'text-gray-600'}`}>
                Public Visibility {publiclyVisible ? 'Enabled' : 'Disabled (100% required)'}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 mb-8">
          <div className="flex space-x-1 p-1">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'doctors', label: 'Doctors', icon: Users },
              { id: 'beds', label: 'Bed Management', icon: Bed },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-colors ${activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && hospitalStats && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="space-y-8">
              {/* Stats Cards */}
              <div className="flex justify-center">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">

                  {/* Total Patients */}
                  <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Patients</p>
                        <p className="text-2xl font-bold text-gray-900">{hospitalStats.totalPatients}</p>
                      </div>
                      <Users className="w-8 h-8 text-blue-600" />
                    </div>
                  </div>

                  {/* Today's Appointments */}
                  <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Today's Appointments</p>
                        <p className="text-2xl font-bold text-gray-900">{hospitalStats.todayAppointments}</p>
                      </div>
                      <Calendar className="w-8 h-8 text-emerald-600" />
                    </div>
                  </div>

                  {/* Occupancy Rate */}
                  <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Occupancy Rate</p>
                        <p className="text-2xl font-bold text-gray-900">{hospitalStats.occupancyRate}%</p>
                      </div>
                      <Bed className="w-8 h-8 text-purple-600" />
                    </div>
                  </div>

                </div>
              </div>


              {/* Quick Actions */}

              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    className={`flex items-center space-x-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors ${!canAddDoctors && 'opacity-50 cursor-not-allowed'}`}
                    disabled={!canAddDoctors}
                    onClick={() => setIsAddDoctorModalOpen(true)}
                  >
                    <UserPlus className="w-6 h-6 text-blue-600" />
                    <span className="font-medium text-blue-700">Add New Doctor</span>
                  </button>

                  <button className="flex items-center space-x-3 p-4 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors">
                    <Calendar className="w-6 h-6 text-emerald-600" />
                    <span className="font-medium text-emerald-700">Manage Appointments</span>
                  </button>

                  <button className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors" onClick={() => setActiveTab('beds')}>
                    <Activity className="w-6 h-6 text-purple-600" />

                    <span className="font-medium text-purple-700">Update Bed Status</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Doctors Tab */}
          {activeTab === 'doctors' && hospitalUser && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="space-y-8">
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Doctors Management</h3>
                    <p className="text-gray-600">Total Doctors: {hospitalUser.doctors?.length || 0}</p>
                  </div>
                  <button
                    onClick={() => setIsAddDoctorModalOpen(true)}
                    disabled={!canAddDoctors}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Doctor</span>
                  </button>
                </div>

                {!canAddDoctors && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-5 h-5 text-orange-600" />
                      <span className="text-orange-700 font-medium">
                        Complete at least 60% of your hospital profile to add doctors
                      </span>
                    </div>
                  </div>
                )}

                {canAddDoctors && (
                  <div className="space-y-4">
                    {hospitalUser.doctors && hospitalUser.doctors.length > 0 ? (
                      <ul className="divide-y divide-gray-200">
                        {hospitalUser.doctors.map((doctor) => (
                          <li key={doctor.id} className="py-4 flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-bold">{doctor.name.charAt(0)}</div>
                              <div>
                                <h4 className="font-bold text-gray-900">{doctor.name}</h4>
                                <p className="text-sm text-gray-600">{doctor.specialization} - {doctor.department}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4">
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${doctor.isVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-orange-100 text-orange-800'}`}>
                                {doctor.isVerified ? 'Verified' : 'Pending Verification'}
                              </span>
                              <button className="text-gray-400 hover:text-gray-600">
                                <MoreVertical className="w-5 h-5" />
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <p>No doctors registered yet.</p>
                        <p className="text-sm">Click "Add Doctor" to get started.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Bed Management Tab */}
          {activeTab === 'beds' && <BedManagementComponent />}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && hospitalStats && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="space-y-8">
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Hospital Analytics</h3>

                {/* Detailed Occupancy */}
                <div className="bg-gray-50 rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
                  <h4 className="text-lg font-bold text-gray-900 mb-4">Detailed Bed Status</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Total Beds</p>
                      <p className="text-xl font-semibold text-gray-800">150</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Occupied</p>
                      <p className="text-xl font-semibold text-red-600">120</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Available</p>
                      <p className="text-xl font-semibold text-emerald-600">30</p>
                    </div>
                  </div>
                </div>

                {/* Departmental Analytics */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b">
                    <h4 className="text-lg font-bold text-gray-900">Departmental Performance</h4>
                    <p className="text-sm text-gray-600">Breakdown of key metrics by department</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Appointments</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Occupancy Rate</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {Object.entries(hospitalStats.departmentStats).map(([dept, stats]) => (
                          <tr key={dept}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{dept}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{stats.appointments}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{stats.occupancy}%</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{stats.revenue}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Add Doctor Modal */}
      {isAddDoctorModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl m-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Add New Doctor</h3>
              <button onClick={() => setIsAddDoctorModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAddDoctorSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={newDoctorForm.name}
                    onChange={handleDoctorFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Specialization *</label>
                  <input
                    type="text"
                    name="specialization"
                    required
                    value={newDoctorForm.specialization}
                    onChange={handleDoctorFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={newDoctorForm.phone}
                    onChange={handleDoctorFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={newDoctorForm.email}
                    onChange={handleDoctorFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Registration Number *</label>
                  <input
                    type="text"
                    name="registrationNumber"
                    required
                    value={newDoctorForm.registrationNumber}
                    onChange={handleDoctorFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Department *</label>
                  <input
                    type="text"
                    name="department"
                    required
                    value={newDoctorForm.department}
                    onChange={handleDoctorFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Qualifications *</label>
                  <input
                    type="text"
                    name="qualification"
                    required
                    value={newDoctorForm.qualification}
                    onChange={handleDoctorFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Experience (Years) *</label>
                  <input
                    type="number"
                    name="experienceYears"
                    required
                    value={newDoctorForm.experienceYears}
                    onChange={handleDoctorFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddDoctorModalOpen(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Doctor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};