export interface HospitalProfile {
  id: string;
  
  // Basic Hospital Details
  basicDetails: {
    name: string;
    registrationNumber: string;
    licenseNumber: string;
    hospitalType: 'Private' | 'Government' | 'Super-specialty' | 'Clinic';
    ownership: string;
    managingAuthority: string;
    accreditation: string[];
    establishedYear: number;
  };

  // Contact Information
  contactInfo: {
    generalPhone: string;
    emergencyContact: string;
    emailId: string;
    website?: string;
    socialMedia: {
      facebook?: string;
      twitter?: string;
      instagram?: string;
      linkedin?: string;
    };
  };

  // Location & Address
  location: {
    state: string;
    district: string;
    pincode: string;
    fullAddress: string;
    street: string;
    locality: string;
    landmark?: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
    googleMapsLink?: string;
  };

  // Timings
  timings: {
    opdTimings: {
      monday: { start: string; end: string; closed?: boolean };
      tuesday: { start: string; end: string; closed?: boolean };
      wednesday: { start: string; end: string; closed?: boolean };
      thursday: { start: string; end: string; closed?: boolean };
      friday: { start: string; end: string; closed?: boolean };
      saturday: { start: string; end: string; closed?: boolean };
      sunday: { start: string; end: string; closed?: boolean };
    };
    specialistTimings: {
      [department: string]: {
        [day: string]: { start: string; end: string; closed?: boolean };
      };
    };
    emergencyHours: '24/7' | 'Limited';
    emergencyTimings?: {
      start: string;
      end: string;
    };
    holidays: string[];
    weeklyOffs: string[];
  };

  // Departments & Services
  departments: {
    activeDepartments: string[];
    bedAllocation: {
      [department: string]: {
        total: number;
        occupied: number;
        available: number;
      };
    };
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

  // Infrastructure Information
  infrastructure: {
    totalBeds: number;
    icuBeds: number;
    nicuBeds: number;
    operationTheaters: number;
    occupiedBeds: number;
    availableBeds: number;
    equipmentSummary: {
      [equipment: string]: {
        total: number;
        working: number;
        underMaintenance: number;
      };
    };
    parkingCapacity: number;
    buildingFloors: number;
  };

  // Doctors Linked
  doctors: {
    totalRegistered: number;
    doctorsList: HospitalDoctor[];
    departmentWiseCount: {
      [department: string]: number;
    };
  };

  // Profile Completion
  profileCompletion: {
    percentage: number;
    completedSections: string[];
    missingSections: string[];
    lastUpdated: string;
  };

  // Administrative Notes & Log
  adminLog: {
    lastUpdatedBy: string;
    lastUpdatedOn: string;
    updateHistory: AdminLogEntry[];
    pendingVerifications: string[];
    adminRemarks?: string;
  };

  // Verification & Approval Status
  verification: {
    kycStatus: 'Pending' | 'Verified' | 'Rejected' | 'Under Review';
    uploadedCertificates: UploadedDocument[];
    lastVerificationDate?: string;
    verifiedBy?: string;
    verificationRemarks?: string;
    complianceStatus: {
      healthBoard: boolean;
      fireNoc: boolean;
      pollutionClearance: boolean;
      buildingApproval: boolean;
    };
  };

  // System Fields
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  isPubliclyVisible: boolean;
}

export interface HospitalDoctor {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  specialization: string;
  qualification: string;
  experience: number;
  registrationNumber: string;
  verificationStatus: 'Pending' | 'Verified' | 'Rejected';
  availability: {
    [day: string]: {
      start: string;
      end: string;
      slots: number;
    };
  };
  consultationFee: number;
  profilePhoto?: string;
  joinedDate: string;
  isActive: boolean;
}

export interface AdminLogEntry {
  id: string;
  action: string;
  performedBy: string;
  timestamp: string;
  details: string;
  section: string;
}

export interface UploadedDocument {
  id: string;
  name: string;
  type: 'License' | 'Registration' | 'Accreditation' | 'NOC' | 'Other';
  uploadDate: string;
  fileUrl: string;
  verificationStatus: 'Pending' | 'Verified' | 'Rejected';
  expiryDate?: string;
}

export interface HospitalStats {
  totalPatients: number;
  todayAppointments: number;
  occupancyRate: number;
  revenue: {
    today: number;
    thisMonth: number;
    thisYear: number;
  };
  departmentStats: {
    [department: string]: {
      appointments: number;
      revenue: number;
      occupancy: number;
    };
  };
}