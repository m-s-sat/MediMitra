import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Globe,
  Calendar,
  FileText,
  Shield,
  Award,
  Stethoscope,
  Plus,
  Edit3,
  Save,
  Trash2,
  Archive,
  X,
  Upload,
  Map,
  ArrowLeft
} from 'lucide-react';
import { Header } from '../components/Header.jsx';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface HospitalProfileData {
  generalInfo: {
    name: string;
    slogan: string;
    primarySpecialization: string;
    establishmentDate: string;
    aboutUs: string;
  };
  contactLocation: {
    address: {
      street: string;
      city: string;
      state: string;
      pincode: string;
    };
    contact: {
      mainPhone: string;
      emergencyPhone: string;
      email: string;
      website: string;
    };  
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  administrative: {
    registrationNumber: string;
    issuingAuthority: string;
    accreditations: Array<{
      id: string;
      name: string;
      validityDate: string;
      issuedBy: string;
    }>;
    taxInfo: {
      gstNumber: string;
      panNumber: string;
      otherTaxIds: string[];
    };
  };
  departments: Array<{
    id: string;
    name: string;
    status: 'active' | 'archived';
    headOfDepartment: string;
    services: string[];
  }>;
  services: Array<{
    id: string;
    name: string;
    category: string;
    departmentId: string;
    description: string;
    isActive: boolean;
  }>;
}

interface HospitalProfileProps {
  onNavigate: (page: string) => void;
}

export const HospitalProfile: React.FC<HospitalProfileProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'general' | 'contact' | 'administrative' | 'departments'>('general');
  const [isEditing, setIsEditing] = useState(false);
  const [showAddDepartmentModal, setShowAddDepartmentModal] = useState(false);
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [showAddAccreditationModal, setShowAddAccreditationModal] = useState(false);
  
  const [profileData, setProfileData] = useState<HospitalProfileData>({
    generalInfo: {
      name: 'City General Hospital',
      slogan: 'Caring for Life, Healing with Compassion',
      primarySpecialization: 'Multi-specialty Healthcare',
      establishmentDate: '1995-03-15',
      aboutUs: 'City General Hospital has been serving the community for over 25 years, providing comprehensive healthcare services with state-of-the-art facilities and compassionate care. Our mission is to deliver exceptional medical care while maintaining the highest standards of patient safety and satisfaction.'
    },
    contactLocation: {
      address: {
        street: '123 Healthcare Avenue',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001'
      },
      contact: {
        mainPhone: '+91-22-12345678',
        emergencyPhone: '+91-22-87654321',
        email: 'admin@citygeneralhospital.com',
        website: 'https://citygeneralhospital.com'
      },
      coordinates: {
        latitude: 19.0760,
        longitude: 72.8777
      }
    },
    administrative: {
      registrationNumber: 'REG/MH/2024/001234',
      issuingAuthority: 'Maharashtra Health Department',
      accreditations: [
        {
          id: '1',
          name: 'NABH Accreditation',
          validityDate: '2026-12-31',
          issuedBy: 'National Accreditation Board for Hospitals'
        },
        {
          id: '2',
          name: 'ISO 9001:2015',
          validityDate: '2025-08-15',
          issuedBy: 'International Organization for Standardization'
        }
      ],
      taxInfo: {
        gstNumber: '27ABCDE1234F1Z5',
        panNumber: 'ABCDE1234F',
        otherTaxIds: ['TAN123456789']
      }
    },
    departments: [
      {
        id: '1',
        name: 'Cardiology',
        status: 'active',
        headOfDepartment: 'Dr. Sarah Johnson',
        services: ['ECG', 'Echocardiography', 'Cardiac Catheterization']
      },
      {
        id: '2',
        name: 'General Medicine',
        status: 'active',
        headOfDepartment: 'Dr. Michael Chen',
        services: ['General Consultation', 'Health Checkups', 'Chronic Disease Management']
      },
      {
        id: '3',
        name: 'Pediatrics',
        status: 'active',
        headOfDepartment: 'Dr. Emily Rodriguez',
        services: ['Child Health Checkups', 'Vaccination', 'Pediatric Emergency Care']
      }
    ],
    services: [
      {
        id: '1',
        name: 'ECG',
        category: 'Diagnostic',
        departmentId: '1',
        description: 'Electrocardiogram testing for heart rhythm analysis',
        isActive: true
      },
      {
        id: '2',
        name: 'General Consultation',
        category: 'Consultation',
        departmentId: '2',
        description: 'General medical consultation and examination',
        isActive: true
      },
      {
        id: '3',
        name: 'Vaccination',
        category: 'Preventive Care',
        departmentId: '3',
        description: 'Childhood and adult vaccination services',
        isActive: true
      }
    ]
  });

  const [newDepartment, setNewDepartment] = useState({
    name: '',
    headOfDepartment: '',
    services: ['']
  });

  const [newService, setNewService] = useState({
    name: '',
    category: '',
    departmentId: '',
    description: ''
  });

  const [newAccreditation, setNewAccreditation] = useState({
    name: '',
    validityDate: '',
    issuedBy: ''
  });

  const handleSave = () => {
    setIsEditing(false);
    // Backend: Save hospital profile data
    console.log('Saving hospital profile:', profileData);
  };

  const addDepartment = () => {
    const department = {
      id: Date.now().toString(),
      name: newDepartment.name,
      status: 'active' as const,
      headOfDepartment: newDepartment.headOfDepartment,
      services: newDepartment.services.filter(s => s.trim() !== '')
    };
    
    setProfileData(prev => ({
      ...prev,
      departments: [...prev.departments, department]
    }));
    
    setNewDepartment({ name: '', headOfDepartment: '', services: [''] });
    setShowAddDepartmentModal(false);
  };

  const addService = () => {
    const service = {
      id: Date.now().toString(),
      name: newService.name,
      category: newService.category,
      departmentId: newService.departmentId,
      description: newService.description,
      isActive: true
    };
    
    setProfileData(prev => ({
      ...prev,
      services: [...prev.services, service]
    }));
    
    setNewService({ name: '', category: '', departmentId: '', description: '' });
    setShowAddServiceModal(false);
  };

  const addAccreditation = () => {
    const accreditation = {
      id: Date.now().toString(),
      name: newAccreditation.name,
      validityDate: newAccreditation.validityDate,
      issuedBy: newAccreditation.issuedBy
    };
    
    setProfileData(prev => ({
      ...prev,
      administrative: {
        ...prev.administrative,
        accreditations: [...prev.administrative.accreditations, accreditation]
      }
    }));
    
    setNewAccreditation({ name: '', validityDate: '', issuedBy: '' });
    setShowAddAccreditationModal(false);
  };



  const toggleServiceStatus = (serviceId: string) => {
    setProfileData(prev => ({
      ...prev,
      services: prev.services.map(service => 
        service.id === serviceId ? { ...service, isActive: !service.isActive } : service
      )
    }));
  };

  const tabs = [
    { id: 'general', label: 'General Information', icon: Building2 },
    { id: 'contact', label: 'Contact & Location', icon: MapPin },
    { id: 'administrative', label: 'Administrative & Compliance', icon: Shield },
    { id: 'departments', label: 'Departments & Services', icon: Stethoscope }
  ];
const archiveDepartment = (departmentId: string) => {
    setProfileData(prev => ({
      ...prev,
      departments: prev.departments.map(dept =>
        dept.id === departmentId ? { ...dept, status: 'archived' } : dept
      )
    }));
  };

  // Function to delete a department
  const deleteDepartment = (departmentId: string) => {
    setProfileData(prev => ({
      ...prev,
      departments: prev.departments.filter(dept => dept.id !== departmentId)
    }));
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      {/* <Header /> removed to prevent double header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => onNavigate('dashboard')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Dashboard
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Hospital Profile Management
          </h1>
          <p className="text-gray-600 text-lg">
            Manage your hospital's comprehensive profile and organizational structure
          </p>
        </motion.div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 mb-8">
          <div className="flex space-x-1 p-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
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
          {/* General Information Tab */}
          {activeTab === 'general' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">General Information</h3>
                    <p className="text-gray-600">Fundamental hospital identity and details</p>
                  </div>
                </div>
                <button
                  onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {isEditing ? <Save className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                  <span>{isEditing ? 'Save Changes' : 'Edit Information'}</span>
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hospital Name *
                    </label>
                    <input
                      type="text"
                      value={profileData.generalInfo.name}
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        generalInfo: { ...prev.generalInfo, name: e.target.value }
                      }))}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hospital Slogan
                    </label>
                    <input
                      type="text"
                      value={profileData.generalInfo.slogan}
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        generalInfo: { ...prev.generalInfo, slogan: e.target.value }
                      }))}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Primary Specialization *
                    </label>
                    <input
                      type="text"
                      value={profileData.generalInfo.primarySpecialization}
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        generalInfo: { ...prev.generalInfo, primarySpecialization: e.target.value }
                      }))}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Establishment Date *
                    </label>
                    <input
                      type="date"
                      value={profileData.generalInfo.establishmentDate}
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        generalInfo: { ...prev.generalInfo, establishmentDate: e.target.value }
                      }))}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    About Us *
                  </label>
                  <textarea
                    value={profileData.generalInfo.aboutUs}
                    onChange={(e) => setProfileData(prev => ({
                      ...prev,
                      generalInfo: { ...prev.generalInfo, aboutUs: e.target.value }
                    }))}
                    disabled={!isEditing}
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                    placeholder="Enter detailed description or mission statement..."
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Contact & Location Tab */}
          {activeTab === 'contact' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              {/* Address Section */}
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Full Address</h3>
                    <p className="text-gray-600">Structured address information</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      value={profileData.contactLocation.address.street}
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        contactLocation: {
                          ...prev.contactLocation,
                          address: { ...prev.contactLocation.address, street: e.target.value }
                        }
                      }))}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      value={profileData.contactLocation.address.city}
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        contactLocation: {
                          ...prev.contactLocation,
                          address: { ...prev.contactLocation.address, city: e.target.value }
                        }
                      }))}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State *
                    </label>
                    <input
                      type="text"
                      value={profileData.contactLocation.address.state}
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        contactLocation: {
                          ...prev.contactLocation,
                          address: { ...prev.contactLocation.address, state: e.target.value }
                        }
                      }))}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pincode *
                    </label>
                    <input
                      type="text"
                      value={profileData.contactLocation.address.pincode}
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        contactLocation: {
                          ...prev.contactLocation,
                          address: { ...prev.contactLocation.address, pincode: e.target.value }
                        }
                      }))}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information Section */}
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Phone className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Contact Information</h3>
                    <p className="text-gray-600">Communication details for staff and emergencies</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Main Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={profileData.contactLocation.contact.mainPhone}
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        contactLocation: {
                          ...prev.contactLocation,
                          contact: { ...prev.contactLocation.contact, mainPhone: e.target.value }
                        }
                      }))}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Emergency Number *
                    </label>
                    <input
                      type="tel"
                      value={profileData.contactLocation.contact.emergencyPhone}
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        contactLocation: {
                          ...prev.contactLocation,
                          contact: { ...prev.contactLocation.contact, emergencyPhone: e.target.value }
                        }
                      }))}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Official Email *
                    </label>
                    <input
                      type="email"
                      value={profileData.contactLocation.contact.email}
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        contactLocation: {
                          ...prev.contactLocation,
                          contact: { ...prev.contactLocation.contact, email: e.target.value }
                        }
                      }))}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Website URL
                    </label>
                    <input
                      type="url"
                      value={profileData.contactLocation.contact.website}
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        contactLocation: {
                          ...prev.contactLocation,
                          contact: { ...prev.contactLocation.contact, website: e.target.value }
                        }
                      }))}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                    />
                  </div>
                </div>
              </div>

              {/* Map Integration Section */}
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Map className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Map Integration</h3>
                    <p className="text-gray-600">Hospital location coordinates</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Latitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={profileData.contactLocation.coordinates.latitude}
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        contactLocation: {
                          ...prev.contactLocation,
                          coordinates: { ...prev.contactLocation.coordinates, latitude: parseFloat(e.target.value) }
                        }
                      }))}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Longitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={profileData.contactLocation.coordinates.longitude}
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        contactLocation: {
                          ...prev.contactLocation,
                          coordinates: { ...prev.contactLocation.coordinates, longitude: parseFloat(e.target.value) }
                        }
                      }))}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                    />
                  </div>
                </div>

                {/* Interactive Map */}
                <div className="h-96 rounded-lg overflow-hidden border border-gray-200">
                  <MapContainer
                    center={[profileData.contactLocation.coordinates.latitude, profileData.contactLocation.coordinates.longitude]}
                    zoom={15}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={[profileData.contactLocation.coordinates.latitude, profileData.contactLocation.coordinates.longitude]}>
                      <Popup>
                        <div className="text-center">
                          <h4 className="font-semibold text-gray-900">{profileData.generalInfo.name}</h4>
                          <p className="text-sm text-gray-600">{profileData.contactLocation.address.street}</p>
                          <p className="text-sm text-gray-600">
                            {profileData.contactLocation.address.city}, {profileData.contactLocation.address.state}
                          </p>
                          <p className="text-sm text-blue-600 mt-1">{profileData.contactLocation.contact.mainPhone}</p>
                        </div>
                      </Popup>
                    </Marker>
                  </MapContainer>
                </div>
              </div>
            </motion.div>
          )}

          {/* Administrative & Compliance Tab */}
          {activeTab === 'administrative' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              {/* Registration Information */}
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Registration Information</h3>
                    <p className="text-gray-600">Official license and registration details</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Registration Number *
                    </label>
                    <input
                      type="text"
                      value={profileData.administrative.registrationNumber}
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        administrative: { ...prev.administrative, registrationNumber: e.target.value }
                      }))}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Issuing Authority *
                    </label>
                    <input
                      type="text"
                      value={profileData.administrative.issuingAuthority}
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        administrative: { ...prev.administrative, issuingAuthority: e.target.value }
                      }))}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                    />
                  </div>
                </div>
              </div>

              {/* Accreditations */}
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <Award className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Accreditations</h3>
                      <p className="text-gray-600">Official accreditations and certifications</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAddAccreditationModal(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Accreditation</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {profileData.administrative.accreditations.map((accreditation) => (
                    <div key={accreditation.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{accreditation.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">Issued by: {accreditation.issuedBy}</p>
                          <p className="text-sm text-gray-500">Valid until: {accreditation.validityDate}</p>
                        </div>
                        <button className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tax Information */}
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Tax Information</h3>
                    <p className="text-gray-600">GST and other tax identification numbers</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      GST Number *
                    </label>
                    <input
                      type="text"
                      value={profileData.administrative.taxInfo.gstNumber}
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        administrative: {
                          ...prev.administrative,
                          taxInfo: { ...prev.administrative.taxInfo, gstNumber: e.target.value }
                        }
                      }))}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      PAN Number *
                    </label>
                    <input
                      type="text"
                      value={profileData.administrative.taxInfo.panNumber}
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        administrative: {
                          ...prev.administrative,
                          taxInfo: { ...prev.administrative.taxInfo, panNumber: e.target.value }
                        }
                      }))}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Departments & Services Tab */}
          {activeTab === 'departments' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              {/* Departments List */}
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <Stethoscope className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Department List</h3>
                      <p className="text-gray-600">Manage hospital departments and their heads</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAddDepartmentModal(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Department</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {profileData.departments.map((department) => (
                    <div key={department.id} className={`p-4 border rounded-lg ${
                      department.status === 'active' ? 'border-gray-200 bg-white' : 'border-gray-300 bg-gray-50'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-semibold text-gray-900">{department.name}</h4>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              department.status === 'active' 
                                ? 'bg-green-100 text-green-600' 
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {department.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">Head: {department.headOfDepartment}</p>
                          <div className="flex flex-wrap gap-2">
                            {department.services.map((service, index) => (
                              <span key={index} className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">
                                {service}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => archiveDepartment(department.id)}
                            className="text-orange-600 hover:text-orange-700"
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                          <button className="text-red-600 hover:text-red-700"
                            onClick={()=>{deleteDepartment(department.id)}}>
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Services Catalogue */}
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Services Catalogue</h3>
                      <p className="text-gray-600">All medical services provided by the hospital</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAddServiceModal(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Service</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {profileData.services.map((service) => {
                    const department = profileData.departments.find(d => d.id === service.departmentId);
                    return (
                      <div key={service.id} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="font-semibold text-gray-900">{service.name}</h4>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                service.isActive 
                                  ? 'bg-green-100 text-green-600' 
                                  : 'bg-red-100 text-red-600'
                              }`}>
                                {service.isActive ? 'Active' : 'Inactive'}
                              </span>
                              <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">
                                {service.category}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">Department: {department?.name}</p>
                            <p className="text-sm text-gray-500">{service.description}</p>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => toggleServiceStatus(service.id)}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              {service.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            <button className="text-red-600 hover:text-red-700">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Add Department Modal */}
        {showAddDepartmentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Add New Department</h3>
                <button
                  onClick={() => setShowAddDepartmentModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department Name *
                  </label>
                  <input
                    type="text"
                    value={newDepartment.name}
                    onChange={(e) => setNewDepartment(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter department name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Head of Department *
                  </label>
                  <input
                    type="text"
                    value={newDepartment.headOfDepartment}
                    onChange={(e) => setNewDepartment(prev => ({ ...prev, headOfDepartment: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter head of department name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Services Offered
                  </label>
                  {newDepartment.services.map((service, index) => (
                    <div key={index} className="flex space-x-2 mb-2">
                      <input
                        type="text"
                        value={service}
                        onChange={(e) => {
                          const updatedServices = [...newDepartment.services];
                          updatedServices[index] = e.target.value;
                          setNewDepartment(prev => ({ ...prev, services: updatedServices }));
                        }}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter service name"
                      />
                      {index === newDepartment.services.length - 1 && (
                        <button
                          onClick={() => setNewDepartment(prev => ({ ...prev, services: [...prev.services, ''] }))}
                          className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowAddDepartmentModal(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addDepartment}
                    disabled={!newDepartment.name || !newDepartment.headOfDepartment}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Add Department
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Add Service Modal */}
        {showAddServiceModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Add New Service</h3>
                <button
                  onClick={() => setShowAddServiceModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Name *
                  </label>
                  <input
                    type="text"
                    value={newService.name}
                    onChange={(e) => setNewService(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter service name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={newService.category}
                    onChange={(e) => setNewService(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select category</option>
                    <option value="Diagnostic">Diagnostic</option>
                    <option value="Consultation">Consultation</option>
                    <option value="Treatment">Treatment</option>
                    <option value="Preventive Care">Preventive Care</option>
                    <option value="Emergency">Emergency</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department *
                  </label>
                  <select
                    value={newService.departmentId}
                    onChange={(e) => setNewService(prev => ({ ...prev, departmentId: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select department</option>
                    {profileData.departments.filter(d => d.status === 'active').map(department => (
                      <option key={department.id} value={department.id}>{department.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newService.description}
                    onChange={(e) => setNewService(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Enter service description"
                  />
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowAddServiceModal(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addService}
                    disabled={!newService.name || !newService.category || !newService.departmentId}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Add Service
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Add Accreditation Modal */}
        {showAddAccreditationModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Add New Accreditation</h3>
                <button
                  onClick={() => setShowAddAccreditationModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Accreditation Name *
                  </label>
                  <input
                    type="text"
                    value={newAccreditation.name}
                    onChange={(e) => setNewAccreditation(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter accreditation name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Issued By *
                  </label>
                  <input
                    type="text"
                    value={newAccreditation.issuedBy}
                    onChange={(e) => setNewAccreditation(prev => ({ ...prev, issuedBy: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter issuing authority"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Validity Date *
                  </label>
                  <input
                    type="date"
                    value={newAccreditation.validityDate}
                    onChange={(e) => setNewAccreditation(prev => ({ ...prev, validityDate: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowAddAccreditationModal(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addAccreditation}
                    disabled={!newAccreditation.name || !newAccreditation.issuedBy || !newAccreditation.validityDate}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Add Accreditation
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HospitalProfile;