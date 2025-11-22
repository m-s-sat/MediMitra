export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  preferredLanguage: string;
  avatar?: string;
  dob?: string,
  pincode?: number,
  emergencyContact?: {
    name?: string;
    phone?: string;
    relationship?: string;
  };
  medicalHistory?: {
    pastIllnesses?: string[];
    ongoingConditions?: string[];
    allergies?: string[];
    currentMedications?: string[];
  };
  bodyMeasurements?: {
    height?: string;
    weight?: string;
    bmi?: string;
  };
  age?: string;
  gender?: string;
  role?: string;
  weeklyLogs?: {
    weight?: string;
    waistCircumference?: string;
    sleepHours?: string;
    restingHeartRate?: string;
    bloodPressure?: {
      systolic?: string,
      diastolic?: string
    }
    waterIntake?: string,
    energyLevel?: string,
    appetiteChanges?: string,
    symptoms?: string[],
    exerciseFrequency?: string,
    conditionSpecific?: {
      bloodSugar?: string;
      painScore?: string;
    }
    lastUpdated?: Date;
  },
  medicine?: Medicine[]
}
export interface ProfileData {
  name: string;
  age: string;
  gender: string;
  phone: string;
  email: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  medicalHistory: {
    pastIllnesses: string[];
    ongoingConditions: string[];
    allergies: string[];
    currentMedications: string[];
  };
  bodyMeasurements: {
    height: string;
    weight: string;
    bmi: string;
  };
}

export interface UserQuery {
  role: string | null,
  email: string,
  password: string
}

export interface Appointment {
  id: string;
  doctorName: string;
  department: string;
  date: string;
  time: string;
  type: 'physical' | 'video';
  status: 'upcoming' | 'completed' | 'cancelled';
}

export interface Report {
  id: string;
  title: string;
  date: string;
  type: string;
  fileUrl: string;
  description: string;
}

export interface Medicine {
  name: string;
  dosage: string;
  frequency: string;
  times: string[];
  taken: boolean[];
  prescribedBy: string;
  startDate: string;
  endDate: string;
  sideEffects: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  language: string;
  isVoice?: boolean;
}

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}
export interface Doctor {
  id?: string;
  name: string | '';
  specialization: string | '';
  registrationNumber: string | '';
  department: string | '';
  phone: string | '';
  email: string | '';
  qualification: string | '';
  experienceYears: number | 0;
  opdDays: string[] | [];
  isVerified?: boolean;
}
export interface Service {
  id: string;
  name: string;
  category: string;
  departmentId: string;
  description: string;
  isActive: boolean;
}

export interface Accreditation {
  id: string;
  name: string;
  validityDate: string;
  issuedBy: string;
}

export interface DepartmentDetail {
  id: string;
  name: string;
  status: 'active' | 'archived';
  headOfDepartment: string;
  services: string[];
}

export interface Hospital {
  role: string;
  hospital?: {
    id?: string;
    name?: string;
    address?: string;
    govId?: string;
    type?: string;
    coordinates?: {
      lat?: number;
      long?: number;
    };
    state?: string;
    district?: string;
    slogan?: string;
    primarySpecialization?: string;
    establishmentDate?: string;
    aboutUs?: string;
    pincode?: string;
    website?: string;
    emergencyPhone?: string;
    mainPhone?: string;
  };
  admin?: {
    name?: string;
    email?: string;
    phone?: string;
    password?: string;
  };
  departments?: string[];
  departmentDetails?: DepartmentDetail[];
  services?: Service[];
  accreditations?: Accreditation[];
  taxInfo?: {
    gstNumber: string;
    panNumber: string;
    otherTaxIds: string[];
  };
  emergency_contact?: string;
  visiting_hours?: {
    start?: string;
    end?: string;
  };
  doctors?: Doctor[];
}

export interface HospitalFound {
  _id: string;
  lat: number;
  long: number;
  hospital_name: string;
  address: string;
  state: string;
  district: string;
}

export interface SignupRequest extends Omit<User, 'id'> {
  password: string;
}
