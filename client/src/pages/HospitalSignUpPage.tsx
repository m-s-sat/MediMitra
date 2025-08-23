import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Select from 'react-select';
import { 
  Building2, 
  Phone, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Clock,
  User,
  CheckCircle,
  ArrowLeft,
  Search,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Hospital, HospitalFound } from '../types';

interface SelectOption {
  value: string;
  label: string;
}

const departments = [
  'Cardiology', 'General Medicine', 'Pediatrics', 'Orthopedics', 'Gynecology',
  'Neurology', 'Dermatology', 'Psychiatry', 'Emergency Medicine', 'Radiology',
  'Pathology', 'Anesthesiology'
];

export const HospitalSignupPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    hospitalsignup,
    getStates,
    getDistricts,
    getHospitals,
    states,
    districts,
    hospitals,
    isLoading,
  } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedHospital, setSelectedHospital] = useState<HospitalFound | null>(null);
  const [hospitalSearch, setHospitalSearch] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    adminName: '',
    adminEmail: '',
    phone: '',
    password: '',
    departments: [] as string[],
    emergencyContact: '',
    visitingHours: { start: '09:00', end: '17:00' }
  });

  useEffect(() => {
    const fetchStates = async () => {
      try {
        await getStates();
      } catch (err) {
        console.error("Failed to fetch states on component mount:", err);
        setError("Could not load states. Please check the connection and try refreshing.");
      }
    };
    fetchStates();
  }, [getStates]); // FIX: Add stable function to dependency array

  useEffect(() => {
    if (selectedState) {
      const fetchDistricts = async () => {
        try {
          await getDistricts(selectedState);
        } catch (err) {
          console.error(`Failed to fetch districts for ${selectedState}:`, err);
          setError(`Could not load districts for ${selectedState}.`);
        }
      };
      fetchDistricts();
    }
  }, [selectedState, getDistricts]); // FIX: Add stable function to dependency array

  useEffect(() => {
    if (selectedState && selectedDistrict) {
      const fetchHospitals = async () => {
        try {
          await getHospitals(selectedState, selectedDistrict);
        } catch (err) {
          console.error(`Failed to fetch hospitals for ${selectedDistrict}:`, err);
          setError(`Could not load hospitals for ${selectedDistrict}.`);
        }
      };
      fetchHospitals();
    }
  }, [selectedState, selectedDistrict, getHospitals]); // FIX: Add stable function to dependency array

  const handleStateChange = (stateValue: string) => {
    setError(null);
    setSelectedState(stateValue);
    setSelectedDistrict('');
    setSelectedHospital(null);
    if (stateValue) setCurrentStep(2);
  };

  const handleDistrictChange = (districtValue: string) => {
    setError(null);
    setSelectedDistrict(districtValue);
    setSelectedHospital(null);
    if (districtValue) setCurrentStep(3);
  };

  const handleHospitalSelect = (hospital: HospitalFound) => {
    setError(null);
    setSelectedHospital(hospital);
    setCurrentStep(4);
  };

  const handleDepartmentToggle = (department: string) => {
    setFormData(prev => ({
      ...prev,
      departments: prev.departments.includes(department)
        ? prev.departments.filter(d => d !== department)
        : [...prev.departments, department]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedHospital || !selectedState || !selectedDistrict) {
      setError("Please ensure a hospital, state, and district are selected.");
      return;
    }
    if (formData.departments.length < 3) {
      setError("Please select at least 3 departments.");
      return;
    }
    setIsSubmitting(true);

    const payload: Hospital = {
      role: 'hospital',
      hospital: {
        id: selectedHospital._id || selectedHospital.hospital_name.replace(/\s+/g, '-').toLowerCase(),
        name: selectedHospital.hospital_name,
        address: selectedHospital.address,
        type: 'Government',
        coordinates: { lat: selectedHospital.lat, long: selectedHospital.long },
        state: selectedState,
        district: selectedDistrict
      },
      admin: {
        name: formData.adminName,
        email: formData.adminEmail,
        phone: formData.phone,
        password: formData.password
      },
      departments: formData.departments,
      emergency_contact: formData.emergencyContact,
      visiting_hours: formData.visitingHours
    };
    try {
      await hospitalsignup(payload);
      navigate('/hospital/dashboard');
    } catch (err) {
      console.error("Hospital registration failed:", err);
      setError("Registration failed. Please check your details and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  const stateOptions: SelectOption[] = states.map(s => ({ value: s, label: s }));
  const districtOptions: SelectOption[] = districts.map(d => ({ value: d, label: d }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-2xl w-full space-y-8"
      >
        <div className="text-center">
          <Link to="/signup" className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-6">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to signup</span>
          </Link>
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-xl flex items-center justify-center">
              <Building2 className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Hospital Registration</h2>
          <p className="text-gray-600">Register your hospital with verified credentials</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-8">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                  {currentStep > step ? <CheckCircle className="w-5 h-5" /> : step}
                </div>
                {step < 4 && <div className={`w-16 h-1 mx-2 ${currentStep > step ? 'bg-blue-600' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>

          {error && currentStep < 4 && (
            <div className="my-4 flex items-center p-3 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0"/>
              <span className="font-medium">Error:</span>&nbsp;{error}
            </div>
          )}

          {currentStep === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900">Select State</h3>
              <Select
                options={stateOptions}
                onChange={(option) => handleStateChange(option ? option.value : '')}
                value={stateOptions.find(option => option.value === selectedState) || null}
                placeholder="Search and select a state..."
                isSearchable
                isLoading={isLoading && !states.length}
              />
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Select District in {selectedState}</h3>
                <button onClick={() => setCurrentStep(1)} className="text-blue-600 hover:text-blue-700">Change State</button>
              </div>
              <Select
                options={districtOptions}
                onChange={(option) => handleDistrictChange(option ? option.value : '')}
                value={districtOptions.find(option => option.value === selectedDistrict) || null}
                placeholder="Search and select a district..."
                isSearchable
                isLoading={isLoading && !!selectedState && !districts.length}
                isDisabled={!selectedState}
              />
            </motion.div>
          )}

          {currentStep === 3 && selectedDistrict && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Select Hospital in {selectedDistrict}</h3>
                <button onClick={() => setCurrentStep(2)} className="text-blue-600 hover:text-blue-700">Change District</button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input type="text" placeholder="Search hospitals..." value={hospitalSearch} onChange={(e) => setHospitalSearch(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {isLoading && !hospitals.length && <p className="text-center text-gray-500">Loading hospitals...</p>}
                {!isLoading && !hospitals.length && selectedDistrict && <p className="text-center text-gray-500">No hospitals found for this district.</p>}
                {hospitals.map((hospital) => (
                  hospital && hospital.hospital_name && (
                    <button key={hospital._id || hospital.hospital_name} onClick={() => handleHospitalSelect(hospital)} className="w-full p-4 border border-gray-200 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-colors text-left">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{hospital.hospital_name}</h4>
                          <p className="text-sm text-gray-600 mt-1">{hospital.address || 'No address provided'}</p>
                        </div>
                        <Building2 className="w-6 h-6 text-blue-600 flex-shrink-0" />
                      </div>
                    </button>
                  )
                ))}
              </div>
            </motion.div>
          )}

          {currentStep === 4 && selectedHospital && (
             <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Admin Details</h3>
                <button onClick={() => setCurrentStep(3)} className="text-blue-600 hover:text-blue-700">Change Hospital</button>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border">
                <h4 className="font-semibold text-gray-900 mb-2">Selected Hospital</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <p><strong>Name:</strong> {selectedHospital.hospital_name}</p>
                  <p><strong>Address:</strong> {selectedHospital.address}</p>
                  <p><strong>Coordinates:</strong> {`Lat: ${selectedHospital.lat}, Lng: ${selectedHospital.long}`}</p>
                </div>
              </div>
              <form onSubmit={handleSubmit} className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Admin Name *</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input type="text" required value={formData.adminName} onChange={(e) => setFormData(prev => ({ ...prev, adminName: e.target.value }))} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Enter admin name" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Admin Email *</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input type="email" required value={formData.adminEmail} onChange={(e) => setFormData(prev => ({ ...prev, adminEmail: e.target.value }))} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Enter admin email" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input type="tel" required value={formData.phone} onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Enter phone number" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input type={showPassword ? 'text' : 'password'} required value={formData.password} onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))} className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Create password" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        {showPassword ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
                      </button>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Departments Offered * (Select at least 3)</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {departments.map((department) => (
                      <button key={department} type="button" onClick={() => handleDepartmentToggle(department)} className={`p-3 text-sm rounded-lg border transition-colors ${formData.departments.includes(department) ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                        {department}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Selected: {formData.departments.length} departments</p>
                </div>
                
                {error && currentStep === 4 && (
                  <div className="flex items-center p-3 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
                    <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0"/>
                    <span className="font-medium">Error:</span>&nbsp;{error}
                  </div>
                )}

                <button type="submit" disabled={isSubmitting} className="w-full bg-gradient-to-r from-blue-600 to-emerald-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                  {isSubmitting ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Registering Hospital...</span>
                    </div>
                  ) : 'Complete Registration'}
                </button>
              </form>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
