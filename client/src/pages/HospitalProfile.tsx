import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Building2,
  MapPin,
  Shield,
  Stethoscope,
  Edit3,
  Save,
  ArrowLeft,
  Plus,
  X,
  Trash2,
  Archive
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCheckUserStatusQuery, useUpdateHospitalMutation } from '../store/api/authApi';
import { Hospital, DepartmentDetail, Service, Accreditation } from '../types';

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
    accreditations: Accreditation[];
    taxInfo: {
      gstNumber: string;
      panNumber: string;
      otherTaxIds: string[];
    };
  };
  departments: DepartmentDetail[];
  services: Service[];
}

export const HospitalProfile: React.FC = () => {
  const navigate = useNavigate();
  const { data: userData } = useCheckUserStatusQuery();
  const [updateHospitalMutation] = useUpdateHospitalMutation();
  const hospitalUser = userData as Hospital;

  const [activeTab, setActiveTab] = useState<'general' | 'contact' | 'administrative' | 'departments'>('general');
  const [isEditing, setIsEditing] = useState(false);
  const [showAddDepartmentModal, setShowAddDepartmentModal] = useState(false);
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [showAddAccreditationModal, setShowAddAccreditationModal] = useState(false);

  const [profileData, setProfileData] = useState<HospitalProfileData>({
    generalInfo: {
      name: '',
      slogan: '',
      primarySpecialization: '',
      establishmentDate: '',
      aboutUs: ''
    },
    contactLocation: {
      address: { street: '', city: '', state: '', pincode: '' },
      contact: { mainPhone: '', emergencyPhone: '', email: '', website: '' },
      coordinates: { latitude: 20.5937, longitude: 78.9629 }
    },
    administrative: {
      registrationNumber: '',
      issuingAuthority: '',
      accreditations: [],
      taxInfo: { gstNumber: '', panNumber: '', otherTaxIds: [] }
    },
    departments: [],
    services: []
  });

  useEffect(() => {
    if (hospitalUser && hospitalUser.hospital) {
      setProfileData({
        generalInfo: {
          name: hospitalUser.hospital.name || '',
          slogan: hospitalUser.hospital.slogan || '',
          primarySpecialization: hospitalUser.hospital.primarySpecialization || '',
          establishmentDate: hospitalUser.hospital.establishmentDate || '',
          aboutUs: hospitalUser.hospital.aboutUs || ''
        },
        contactLocation: {
          address: {
            street: hospitalUser.hospital.address || '',
            city: hospitalUser.hospital.district || '',
            state: hospitalUser.hospital.state || '',
            pincode: hospitalUser.hospital.pincode || ''
          },
          contact: {
            mainPhone: hospitalUser.hospital.mainPhone || '',
            emergencyPhone: hospitalUser.hospital.emergencyPhone || '',
            email: hospitalUser.admin?.email || '',
            website: hospitalUser.hospital.website || ''
          },
          coordinates: {
            latitude: hospitalUser.hospital.coordinates?.lat || 20.5937,
            longitude: hospitalUser.hospital.coordinates?.long || 78.9629
          }
        },
        administrative: {
          registrationNumber: hospitalUser.hospital.govId || '',
          issuingAuthority: '', // Not in Hospital type yet, assuming empty or mapped
          accreditations: hospitalUser.accreditations || [],
          taxInfo: hospitalUser.taxInfo || { gstNumber: '', panNumber: '', otherTaxIds: [] }
        },
        departments: hospitalUser.departmentDetails || [],
        services: hospitalUser.services || []
      });
    }
  }, [hospitalUser]);

  const [newDepartment, setNewDepartment] = useState({
    name: '',
    headOfDepartment: '',
    services: ''
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

  const handleSave = async () => {
    try {
      const updatedHospital: Partial<Hospital> = {
        hospital: {
          ...hospitalUser?.hospital,
          name: profileData.generalInfo.name,
          slogan: profileData.generalInfo.slogan,
          primarySpecialization: profileData.generalInfo.primarySpecialization,
          establishmentDate: profileData.generalInfo.establishmentDate,
          aboutUs: profileData.generalInfo.aboutUs,
          address: profileData.contactLocation.address.street,
          district: profileData.contactLocation.address.city,
          state: profileData.contactLocation.address.state,
          pincode: profileData.contactLocation.address.pincode,
          mainPhone: profileData.contactLocation.contact.mainPhone,
          emergencyPhone: profileData.contactLocation.contact.emergencyPhone,
          website: profileData.contactLocation.contact.website,
          coordinates: {
            lat: profileData.contactLocation.coordinates.latitude,
            long: profileData.contactLocation.coordinates.longitude
          }
        },
        departmentDetails: profileData.departments,
        services: profileData.services,
        accreditations: profileData.administrative.accreditations,
        taxInfo: profileData.administrative.taxInfo
      };

      await updateHospitalMutation(updatedHospital).unwrap();
      setIsEditing(false);
      alert('Hospital profile updated successfully!');
    } catch (error: any) {
      console.error('Failed to update hospital profile:', error);
      alert(`Error: ${error.message || 'Failed to update profile'}`);
    }
  };

  const addDepartment = () => {
    const department: DepartmentDetail = {
      id: Date.now().toString(),
      name: newDepartment.name,
      status: 'active',
      headOfDepartment: newDepartment.headOfDepartment,
      services: newDepartment.services.split(',').map(s => s.trim()).filter(s => s !== '')
    };

    setProfileData(prev => ({
      ...prev,
      departments: [...prev.departments, department]
    }));

    setNewDepartment({ name: '', headOfDepartment: '', services: '' });
    setShowAddDepartmentModal(false);
  };

  const addService = () => {
    const service: Service = {
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
    const accreditation: Accreditation = {
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

  const archiveDepartment = (departmentId: string) => {
    setProfileData(prev => ({
      ...prev,
      departments: prev.departments.map(dept =>
        dept.id === departmentId ? { ...dept, status: 'archived' } : dept
      )
    }));
  };

  const deleteDepartment = (departmentId: string) => {
    setProfileData(prev => ({
      ...prev,
      departments: prev.departments.filter(dept => dept.id !== departmentId)
    }));
  };

  const tabs = [
    { id: 'general', label: 'General Information', icon: Building2 },
    { id: 'contact', label: 'Contact & Location', icon: MapPin },
    { id: 'administrative', label: 'Administrative & Compliance', icon: Shield },
    { id: 'departments', label: 'Departments & Services', icon: Stethoscope }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/hospital/dashboard')}
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

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 mb-8">
          <div className="flex space-x-1 p-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-colors whitespace-nowrap ${activeTab === tab.id
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

        <div className="space-y-8">
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hospital Name *</label>
                    <input
                      type="text"
                      value={profileData.generalInfo.name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, generalInfo: { ...prev.generalInfo, name: e.target.value } }))}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Slogan</label>
                    <input
                      type="text"
                      value={profileData.generalInfo.slogan}
                      onChange={(e) => setProfileData(prev => ({ ...prev, generalInfo: { ...prev.generalInfo, slogan: e.target.value } }))}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Primary Specialization *</label>
                    <input
                      type="text"
                      value={profileData.generalInfo.primarySpecialization}
                      onChange={(e) => setProfileData(prev => ({ ...prev, generalInfo: { ...prev.generalInfo, primarySpecialization: e.target.value } }))}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Establishment Date *</label>
                    <input
                      type="date"
                      value={profileData.generalInfo.establishmentDate}
                      onChange={(e) => setProfileData(prev => ({ ...prev, generalInfo: { ...prev.generalInfo, establishmentDate: e.target.value } }))}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">About Us *</label>
                  <textarea
                    value={profileData.generalInfo.aboutUs}
                    onChange={(e) => setProfileData(prev => ({ ...prev, generalInfo: { ...prev.generalInfo, aboutUs: e.target.value } }))}
                    disabled={!isEditing}
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'contact' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Full Address</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Street Address *</label>
                    <input
                      type="text"
                      value={profileData.contactLocation.address.street}
                      onChange={(e) => setProfileData(prev => ({ ...prev, contactLocation: { ...prev.contactLocation, address: { ...prev.contactLocation.address, street: e.target.value } } }))}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                    <input
                      type="text"
                      value={profileData.contactLocation.address.city}
                      onChange={(e) => setProfileData(prev => ({ ...prev, contactLocation: { ...prev.contactLocation, address: { ...prev.contactLocation.address, city: e.target.value } } }))}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                    <input
                      type="text"
                      value={profileData.contactLocation.address.state}
                      onChange={(e) => setProfileData(prev => ({ ...prev, contactLocation: { ...prev.contactLocation, address: { ...prev.contactLocation.address, state: e.target.value } } }))}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Pincode *</label>
                    <input
                      type="text"
                      value={profileData.contactLocation.address.pincode}
                      onChange={(e) => setProfileData(prev => ({ ...prev, contactLocation: { ...prev.contactLocation, address: { ...prev.contactLocation.address, pincode: e.target.value } } }))}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Contact Information</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Main Phone *</label>
                    <input
                      type="tel"
                      value={profileData.contactLocation.contact.mainPhone}
                      onChange={(e) => setProfileData(prev => ({ ...prev, contactLocation: { ...prev.contactLocation, contact: { ...prev.contactLocation.contact, mainPhone: e.target.value } } }))}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Phone *</label>
                    <input
                      type="tel"
                      value={profileData.contactLocation.contact.emergencyPhone}
                      onChange={(e) => setProfileData(prev => ({ ...prev, contactLocation: { ...prev.contactLocation, contact: { ...prev.contactLocation.contact, emergencyPhone: e.target.value } } }))}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                    <input
                      type="email"
                      value={profileData.contactLocation.contact.email}
                      onChange={(e) => setProfileData(prev => ({ ...prev, contactLocation: { ...prev.contactLocation, contact: { ...prev.contactLocation.contact, email: e.target.value } } }))}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                    <input
                      type="url"
                      value={profileData.contactLocation.contact.website}
                      onChange={(e) => setProfileData(prev => ({ ...prev, contactLocation: { ...prev.contactLocation, contact: { ...prev.contactLocation.contact, website: e.target.value } } }))}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Map Integration</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      value={profileData.contactLocation.coordinates.latitude}
                      onChange={(e) => setProfileData(prev => ({ ...prev, contactLocation: { ...prev.contactLocation, coordinates: { ...prev.contactLocation.coordinates, latitude: parseFloat(e.target.value) } } }))}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      value={profileData.contactLocation.coordinates.longitude}
                      onChange={(e) => setProfileData(prev => ({ ...prev, contactLocation: { ...prev.contactLocation, coordinates: { ...prev.contactLocation.coordinates, longitude: parseFloat(e.target.value) } } }))}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
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
                      <Popup>{profileData.generalInfo.name}</Popup>
                    </Marker>
                  </MapContainer>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'administrative' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Registration Information</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Registration Number *</label>
                    <input
                      type="text"
                      value={profileData.administrative.registrationNumber}
                      onChange={(e) => setProfileData(prev => ({ ...prev, administrative: { ...prev.administrative, registrationNumber: e.target.value } }))}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Issuing Authority *</label>
                    <input
                      type="text"
                      value={profileData.administrative.issuingAuthority}
                      onChange={(e) => setProfileData(prev => ({ ...prev, administrative: { ...prev.administrative, issuingAuthority: e.target.value } }))}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Accreditations</h3>
                  {isEditing && (
                    <button
                      onClick={() => setShowAddAccreditationModal(true)}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Accreditation</span>
                    </button>
                  )}
                </div>
                <div className="space-y-4">
                  {profileData.administrative.accreditations.map((accreditation) => (
                    <div key={accreditation.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div>
                        <h4 className="font-medium text-gray-900">{accreditation.name}</h4>
                        <p className="text-sm text-gray-600">Issued by: {accreditation.issuedBy} • Valid until: {accreditation.validityDate}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Tax Information</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">GST Number *</label>
                    <input
                      type="text"
                      value={profileData.administrative.taxInfo.gstNumber}
                      onChange={(e) => setProfileData(prev => ({ ...prev, administrative: { ...prev.administrative, taxInfo: { ...prev.administrative.taxInfo, gstNumber: e.target.value } } }))}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">PAN Number *</label>
                    <input
                      type="text"
                      value={profileData.administrative.taxInfo.panNumber}
                      onChange={(e) => setProfileData(prev => ({ ...prev, administrative: { ...prev.administrative, taxInfo: { ...prev.administrative.taxInfo, panNumber: e.target.value } } }))}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'departments' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Departments</h3>
                  {isEditing && (
                    <button
                      onClick={() => setShowAddDepartmentModal(true)}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Department</span>
                    </button>
                  )}
                </div>
                <div className="space-y-4">
                  {profileData.departments.map((dept) => (
                    <div key={dept.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{dept.name}</h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${dept.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {dept.status.charAt(0).toUpperCase() + dept.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">Head: {dept.headOfDepartment}</p>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {dept.services.map((service, index) => (
                          <span key={index} className="px-2 py-1 bg-white border border-gray-200 rounded text-xs text-gray-600">
                            {service}
                          </span>
                        ))}
                      </div>
                      {isEditing && (
                        <div className="flex justify-end space-x-2">
                          <button onClick={() => archiveDepartment(dept.id)} className="text-xs text-yellow-600 hover:text-yellow-700">
                            <Archive className="w-4 h-4" />
                          </button>
                          <button onClick={() => deleteDepartment(dept.id)} className="text-xs text-red-600 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Services Catalog</h3>
                  {isEditing && (
                    <button
                      onClick={() => setShowAddServiceModal(true)}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Service</span>
                    </button>
                  )}
                </div>
                <div className="space-y-4">
                  {profileData.services.map((service) => (
                    <div key={service.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-gray-900">{service.name}</h4>
                          <span className="px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded">{service.category}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={service.isActive}
                            onChange={() => toggleServiceStatus(service.id)}
                            disabled={!isEditing}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showAddDepartmentModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <div className="bg-white rounded-xl p-6 w-full max-w-md m-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Add New Department</h3>
                <button onClick={() => setShowAddDepartmentModal(false)}><X className="w-6 h-6" /></button>
              </div>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Department Name"
                  value={newDepartment.name}
                  onChange={(e) => setNewDepartment({ ...newDepartment, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Head of Department"
                  value={newDepartment.headOfDepartment}
                  onChange={(e) => setNewDepartment({ ...newDepartment, headOfDepartment: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Services (comma separated)"
                  value={newDepartment.services}
                  onChange={(e) => setNewDepartment({ ...newDepartment, services: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
                <button onClick={addDepartment} className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                  Add Department
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {showAddServiceModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <div className="bg-white rounded-xl p-6 w-full max-w-md m-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Add New Service</h3>
                <button onClick={() => setShowAddServiceModal(false)}><X className="w-6 h-6" /></button>
              </div>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Service Name"
                  value={newService.name}
                  onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Category"
                  value={newService.category}
                  onChange={(e) => setNewService({ ...newService, category: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Description"
                  value={newService.description}
                  onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
                <button onClick={addService} className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                  Add Service
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {showAddAccreditationModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <div className="bg-white rounded-xl p-6 w-full max-w-md m-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Add Accreditation</h3>
                <button onClick={() => setShowAddAccreditationModal(false)}><X className="w-6 h-6" /></button>
              </div>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Accreditation Name"
                  value={newAccreditation.name}
                  onChange={(e) => setNewAccreditation({ ...newAccreditation, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Issued By"
                  value={newAccreditation.issuedBy}
                  onChange={(e) => setNewAccreditation({ ...newAccreditation, issuedBy: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
                <input
                  type="date"
                  placeholder="Validity Date"
                  value={newAccreditation.validityDate}
                  onChange={(e) => setNewAccreditation({ ...newAccreditation, validityDate: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
                <button onClick={addAccreditation} className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                  Add Accreditation
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};