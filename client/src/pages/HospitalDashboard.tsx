// HospitalDashboard.tsx
// ... (your existing imports and component structure)
import React, { useState, useEffect } from 'react';
import HospitalProfile from './HospitalProfile.tsx';
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from 'framer-motion';
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
import { Doctor } from '../types/index.ts';
import { useAuth } from '../context/AuthContext.tsx';

// Assuming these types are correctly defined in '../types/hospital'
interface HospitalProfile {
  id: string;
  basicDetails: {
    name: string;
    registrationNumber: string;
    licenseNumber: string;
    hospitalType: 'Private' | 'Public';
    ownership: string;
    managingAuthority: string;
    accreditation: string[];
    establishedYear: number;
  };
  contactInfo: {
    generalPhone: string;
    emergencyContact: string;
    emailId: string;
    website: string;
    socialMedia?: {
      facebook?: string;
      twitter?: string;
    };
  };
  location: {
    state: string;
    district: string;
    pincode: string;
    fullAddress: string;
    street: string;
    locality: string;
    landmark: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
    googleMapsLink?: string;
  };
  timings: {
    opdTimings: {
      monday: { start: string; end: string } | null;
      tuesday: { start: string; end: string } | null;
      wednesday: { start: string; end: string } | null;
      thursday: { start: string; end: string } | null;
      friday: { start: string; end: string } | null;
      saturday: { start: string; end: string } | null;
      sunday: { start: string; end: string } | null;
    };
    specialistTimings: Record<string, any>;
    emergencyHours: string;
    holidays: string[];
    weeklyOffs: string[];
  };
  departments: {
    activeDepartments: string[];
    bedAllocation: Record<string, { total: number; occupied: number; available: number }>;
    services: {
      labAvailable: boolean;
      pharmacyAvailable: boolean;
      icuAvailable: boolean;
      nicuAvailable: boolean;
      ambulanceService: boolean;
      bloodBankAvailable: boolean;
      dialysisCenter: boolean;
      emergencyServices: boolean;
      surgicalFacilities: boolean;
      diagnosticImaging: boolean;
    };
  };
  infrastructure: {
    totalBeds: number;
    icuBeds: number;
    nicuBeds: number;
    operationTheaters: number;
    occupiedBeds: number;
    availableBeds: number;
    equipmentSummary: Record<string, { total: number; working: number; underMaintenance: number }>;
    parkingCapacity: number;
    buildingFloors: number;
  };
  doctors: {
    totalRegistered: number;
    doctorsList: Doctor[];
    departmentWiseCount: Record<string, number>;
  };
  profileCompletion: {
    percentage: number;
    completedSections: string[];
    missingSections: string[];
    lastUpdated: string;
  };
  adminLog: {
    lastUpdatedBy: string;
    lastUpdatedOn: string;
    updateHistory: any[];
    pendingVerifications: string[];
    adminRemarks: string;
  };
  verification: {
    kycStatus: 'Pending' | 'Verified' | 'Rejected';
    uploadedCertificates: string[];
    lastVerificationDate?: string;
    verifiedBy?: string;
    complianceStatus: {
      healthBoard: boolean;
      fireNoc: boolean;
      pollutionClearance: boolean;
      buildingApproval: boolean;
    };
  };
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  isPubliclyVisible: boolean;
}

interface HospitalDoctor {
  id: string;
  name: string;
  specialization: string;
  contactNumber: string;
  email: string;
  registrationNumber: string;
  department: string;
  qualifications: string;
  experienceYears: number;
  opdDays: string[];
  isVerified: boolean;
}

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
  const {loginHospital, addDoctor} = useAuth()
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'beds' | 'doctors' | 'analytics'>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [hospitalProfile, setHospitalProfile] = useState<HospitalProfile | null>(null);
  const [hospitalStats, setHospitalStats] = useState<HospitalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAddDoctorModalOpen, setIsAddDoctorModalOpen] = useState(false);
  
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

  const [newDoctorForm, setNewDoctorForm] = useState<Omit<HospitalDoctor, 'id' | 'isVerified'>>({
    name: '',
    specialization: '',
    contactNumber: '',
    email: '',
    registrationNumber: '',
    department: '',
    qualifications: '',
    experienceYears: 0,
    opdDays: [],
  });
  const [hospitalDoctors, setHospitalDoctors] = useState<Doctor>([]);
  // State to hold a copy of the profile data for editing
  const [editableProfile, setEditableProfile] = useState<HospitalProfile | null>(null);

  useEffect(() => {
    fetchHospitalData();
  }, []);

  const fetchHospitalData = async () => {
    try {
      // BACKEND: API calls to fetch hospital data
      // const profileResponse = await api.get('/hospital/profile');
      // const statsResponse = await api.get('/hospital/stats');

      // Mock data for demonstration
      const mockProfile: HospitalProfile = {
        id: 'HOSP001',
        basicDetails: {
          name: 'City General Hospital',
          registrationNumber: 'REG123456',
          licenseNumber: 'LIC789012',
          hospitalType: 'Private',
          ownership: 'Private Limited Company',
          managingAuthority: 'City Healthcare Group',
          accreditation: ['NABH', 'ISO 9001:2015'],
          establishedYear: 1995
        },
        contactInfo: {
          generalPhone: '+91-22-12345678',
          emergencyContact: '+91-22-87654321',
          emailId: 'admin@citygeneralhospital.com',
          website: 'https://citygeneralhospital.com',
          socialMedia: {
            facebook: 'https://facebook.com/citygeneralhospital',
            twitter: 'https://twitter.com/citygenhosp'
          }
        },
        location: {
          state: 'Maharashtra',
          district: 'Mumbai',
          pincode: '400001',
          fullAddress: '123 Healthcare Street, Andheri West, Mumbai, Maharashtra 400001',
          street: '123 Healthcare Street',
          locality: 'Andheri West',
          landmark: 'Near Metro Station',
          coordinates: {
            latitude: 19.1136,
            longitude: 72.8697
          },
          googleMapsLink: 'https://maps.google.com/...'
        },
        timings: {
          opdTimings: {
            monday: { start: '09:00', end: '17:00' },
            tuesday: { start: '09:00', end: '17:00' },
            wednesday: { start: '09:00', end: '17:00' },
            thursday: { start: '09:00', end: '17:00' },
            friday: { start: '09:00', end: '17:00' },
            saturday: { start: '09:00', end: '13:00' },
            sunday: null
          },
          specialistTimings: {},
          emergencyHours: '24/7',
          holidays: ['2025-01-26', '2025-08-15'],
          weeklyOffs: ['sunday']
        },
        departments: {
          activeDepartments: ['Cardiology', 'General Medicine', 'Pediatrics', 'Orthopedics'],
          bedAllocation: {
            'Cardiology': { total: 20, occupied: 15, available: 5 },
            'General Medicine': { total: 30, occupied: 22, available: 8 },
            'Pediatrics': { total: 15, occupied: 10, available: 5 }
          },
          services: {
            labAvailable: true,
            pharmacyAvailable: true,
            icuAvailable: true,
            nicuAvailable: true,
            ambulanceService: true,
            bloodBankAvailable: false,
            dialysisCenter: true,
            emergencyServices: true,
            surgicalFacilities: true,
            diagnosticImaging: true
          }
        },
        infrastructure: {
          totalBeds: 150,
          icuBeds: 20,
          nicuBeds: 10,
          operationTheaters: 5,
          occupiedBeds: 120,
          availableBeds: 30,
          equipmentSummary: {
            'Ventilators': { total: 15, working: 14, underMaintenance: 1 },
            'X-Ray Machines': { total: 3, working: 3, underMaintenance: 0 }
          },
          parkingCapacity: 100,
          buildingFloors: 8
        },
        doctors: {
          totalRegistered: 2,
          doctorsList: [
            {
              id: 'DOC001',
              name: 'Dr. John Doe',
              specialization: 'Cardiology',
              contactNumber: '9876543210',
              email: 'johndoe@hospital.com',
              registrationNumber: 'MED-12345',
              department: 'Cardiology',
              qualifications: 'MBBS, MD Cardiology',
              experienceYears: 15,
              opdDays: ['Monday', 'Wednesday', 'Friday'],
              isVerified: true
            },
            {
              id: 'DOC002',
              name: 'Dr. Jane Smith',
              specialization: 'General Medicine',
              contactNumber: '9876543211',
              email: 'janesmith@hospital.com',
              registrationNumber: 'MED-67890',
              department: 'General Medicine',
              qualifications: 'MBBS, MD General Medicine',
              experienceYears: 10,
              opdDays: ['Tuesday', 'Thursday'],
              isVerified: false
            }
          ],
          departmentWiseCount: {
            'Cardiology': 1,
            'General Medicine': 1,
            'Pediatrics': 0,
            'Orthopedics': 0
          }
        },
        profileCompletion: {
          percentage: 85,
          completedSections: ['basicDetails', 'contactInfo', 'location', 'departments'],
          missingSections: ['timings', 'infrastructure'],
          lastUpdated: '2025-01-15T10:30:00Z'
        },
        adminLog: {
          lastUpdatedBy: 'Dr. Admin',
          lastUpdatedOn: '2025-01-15T10:30:00Z',
          updateHistory: [],
          pendingVerifications: ['Doctor Verification', 'Equipment Audit'],
          adminRemarks: 'All systems operational'
        },
        verification: {
          kycStatus: 'Verified',
          uploadedCertificates: [],
          lastVerificationDate: '2025-01-01T00:00:00Z',
          verifiedBy: 'Health Board Inspector',
          complianceStatus: {
            healthBoard: true,
            fireNoc: true,
            pollutionClearance: true,
            buildingApproval: true
          }
        },
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2025-01-15T10:30:00Z',
        isActive: true,
        isPubliclyVisible: true
      };

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

      setHospitalProfile(mockProfile);
      setEditableProfile(mockProfile); // Initialize editable state
      setHospitalStats(mockStats);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching hospital data:', error);
      setLoading(false);
    }
  };

  const calculateProfileCompletion = (profile: HospitalProfile): number => {
    // A more realistic calculation based on non-empty fields
    if (!profile) return 0;

    let completedFields = 0;
    let totalFields = 0;

    const checkFields = (obj: any) => {
      for (const key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
          checkFields(obj[key]);
        } else {
          totalFields++;
          if (Array.isArray(obj[key]) ? obj[key].length > 0 : !!obj[key]) {
            completedFields++;
          }
        }
      }
    };

    checkFields(profile.basicDetails);
    checkFields(profile.contactInfo);
    checkFields(profile.location);
    checkFields(profile.timings);
    checkFields(profile.departments.services);

    return Math.round((completedFields / totalFields) * 100) || 0;
  };


  const handleDoctorFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewDoctorForm({ ...newDoctorForm, [name]: value });
  };

  const handleAddDoctorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (hospitalProfile) {
      // BACKEND: API call to add new doctor
      // await api.post('/hospital/doctors', newDoctorForm);
      const doctor : Doctor = {
        specialization: newDoctorForm.specialization,
        name: newDoctorForm.name,
        registrationNumber: newDoctorForm.registrationNumber,
        department: newDoctorForm.department,
        phone: newDoctorForm.contactNumber,
        email: newDoctorForm.email,
        qualification: newDoctorForm.qualifications,
        experienceYears: newDoctorForm.experienceYears,
        opdDays: newDoctorForm.opdDays,
        isVerified: false
      };
      addDoctor(doctor);
      const newDoctor = {
        ...newDoctorForm,
        id: `DOC${hospitalProfile.doctors.totalRegistered + 1}`,
        isVerified: false
      };
      const updatedDoctorsList = loginHospital?.doctors || [];
      const updatedDepartmentCount = {
        ...hospitalProfile.doctors.departmentWiseCount,
        [newDoctor.department]: (hospitalProfile.doctors.departmentWiseCount[newDoctor.department] || 0) + 1
      };

      setHospitalProfile({
        ...hospitalProfile,
        doctors: {
          totalRegistered: hospitalProfile.doctors.totalRegistered + 1,
          doctorsList: updatedDoctorsList,
          departmentWiseCount: updatedDepartmentCount
        }
      });
      console.log('Adding new doctor:', newDoctor);
      setIsAddDoctorModalOpen(false);
      setNewDoctorForm({
        name: '', specialization: '', contactNumber: '', email: '', registrationNumber: '', department: '', qualifications: '', experienceYears: 0, opdDays: []
      });
    }
  };

  const canAddDoctors = hospitalProfile && hospitalProfile.profileCompletion.percentage >= 60;
  const emergencyUnlocked = hospitalProfile && hospitalProfile.profileCompletion.percentage >= 80;
  const publiclyVisible = hospitalProfile && hospitalProfile.profileCompletion.percentage >= 100;

  if (loading) {
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
                {hospitalProfile?.basicDetails.name || 'Hospital Dashboard'}
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
        {hospitalProfile && hospitalProfile.profileCompletion.percentage < 100 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1">Complete Your Hospital Profile</h3>
                  <p className="text-orange-100 mb-2">
                    Your profile is {hospitalProfile.profileCompletion.percentage}% complete.
                    Complete it to unlock all features.
                  </p>
                  <div className="w-64 bg-white bg-opacity-20 rounded-full h-2">
                    <div
                      className="bg-white h-2 rounded-full transition-all duration-500"
                      style={{ width: `${hospitalProfile.profileCompletion.percentage}%` }}
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

                  <button className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"onClick={() => setActiveTab('beds')}>
                    <Activity className="w-6 h-6 text-purple-600" />
                    
                    <span className="font-medium text-purple-700">Update Bed Status</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Doctors Tab */}
          {activeTab === 'doctors' && hospitalProfile && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="space-y-8">
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Doctors Management</h3>
                    <p className="text-gray-600">Total Doctors: {hospitalProfile.doctors.totalRegistered}</p>
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
                    {hospitalProfile.doctors.doctorsList.length > 0 ? (
                      <ul className="divide-y divide-gray-200">
                        {hospitalProfile.doctors.doctorsList.map((doctor) => (
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
          {activeTab === 'analytics' && hospitalStats && hospitalProfile && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="space-y-8">
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Hospital Analytics</h3>
                
                {/* Detailed Occupancy */}
                <div className="bg-gray-50 rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
                  <h4 className="text-lg font-bold text-gray-900 mb-4">Detailed Bed Status</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Total Beds</p>
                      <p className="text-xl font-semibold text-gray-800">{hospitalProfile.infrastructure.totalBeds}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Occupied</p>
                      <p className="text-xl font-semibold text-red-600">{hospitalProfile.infrastructure.occupiedBeds}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Available</p>
                      <p className="text-xl font-semibold text-emerald-600">{hospitalProfile.infrastructure.availableBeds}</p>
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
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctors</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {Object.entries(hospitalStats.departmentStats).map(([department, stats]) => (
                          <tr key={department}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{department}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{stats.appointments}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{stats.occupancy}%</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                               {hospitalProfile.doctors.departmentWiseCount[department] || 0}
                            </td>
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
            
      <AnimatePresence>
        {isAddDoctorModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              className="bg-white rounded-xl shadow-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Add New Doctor</h3>
                <button onClick={() => setIsAddDoctorModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleAddDoctorSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Doctor's Name</label>
                    <input type="text" name="name" value={newDoctorForm.name} onChange={handleDoctorFormChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Specialization</label>
                    <input type="text" name="specialization" value={newDoctorForm.specialization} onChange={handleDoctorFormChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Department</label>
                    <select name="department" value={newDoctorForm.department} onChange={handleDoctorFormChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                      <option value="">Select a department</option>
                      {hospitalProfile?.departments.activeDepartments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Contact Number</label>
                    <input type="tel" name="contactNumber" value={newDoctorForm.contactNumber} onChange={handleDoctorFormChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email Address</label>
                    <input type="email" name="email" value={newDoctorForm.email} onChange={handleDoctorFormChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Registration Number</label>
                    <input type="text" name="registrationNumber" value={newDoctorForm.registrationNumber} onChange={handleDoctorFormChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Qualifications</label>
                    <input type="text" name="qualifications" value={newDoctorForm.qualifications} onChange={handleDoctorFormChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Years of Experience</label>
                    <input type="number" name="experienceYears" value={newDoctorForm.experienceYears} onChange={handleDoctorFormChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">OPD Days</h4>
                  <div className="flex flex-wrap gap-2">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                      <label key={day} className="flex items-center space-x-2 p-2 rounded-md bg-gray-50 border border-gray-200">
                        <input
                          type="checkbox"
                          checked={newDoctorForm.opdDays.includes(day)}
                          onChange={(e) => {
                            const newDays = e.target.checked
                              ? [...newDoctorForm.opdDays, day]
                              : newDoctorForm.opdDays.filter(d => d !== day);
                            setNewDoctorForm({ ...newDoctorForm, opdDays: newDays });
                          }}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700">{day}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end space-x-4">
                  <button type="button" onClick={() => setIsAddDoctorModalOpen(false)} className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                    <div className="flex items-center space-x-2">
                      <Plus className="w-4 h-4" />
                      <span>Add Doctor</span>
                    </div>
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};