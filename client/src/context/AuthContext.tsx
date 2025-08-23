'use client';
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { Doctor, Hospital, HospitalFound, User, UserQuery } from "../types";

interface AuthContextType {
  user: User | null;
  loginHospital: Hospital | null;
  addDoctor: (update: Doctor) => Promise<void>;
  login: (userData: UserQuery) => Promise<void>;
  signup: (userData: User) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  updateUser: (userData: Partial<User>) => void;
  hospitalsignup: (hopitalData: Hospital) => Promise<void>;
  getStates: () => Promise<void>;
  getDistricts: (state: string) => Promise<void>;
  getHospitals: (state: string, district: string) => Promise<void>;
  states: string[];
  districts: string[];
  hospitals: HospitalFound[];
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  // const [hospital, setHospital] = useState<Hospital | null>(null);
  const [loginHospital, setLoginHospital] = useState<Hospital | null>(null);
  const [states, setStates] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        const response = await fetch("auth/check", {
          credentials: "include",
        });
        if (response.ok) {
          const userData = await response.json();
          if(userData.role === 'patient') setUser(userData);
          if(userData.role === 'hospital') setLoginHospital(userData);
        } else {
          setUser(null);
          setLoginHospital(null);
        }
      } catch (error) {
        console.error("Could not fetch user status:", error);
        setUser(null);
      } finally {
        setIsLoading(false); // We are done loading, whether successful or not
      }
    };

    checkUserStatus();
  }, []);
  const hospitalsignup = async (hospitalData: Hospital) => {
    const response = await fetch("/auth/hospitalreg", {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(hospitalData),
    });
    if (!response.ok) throw new Error("Unauthorized");
    const data = await response.json();
    setUser(data.data);
  }
  const login = async (userData: UserQuery) => {
    const response = await fetch("auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        username: userData.email,
        password: userData.password,
      }),
    });
    if (!response.ok) {
      alert("Unauthorized! Please check your credentials.");
      throw new Error("Unauthorized");
    }
    const data = await response.json();
    if(data.role==='patient') setUser(data);
    if(data.role==='hospital') setLoginHospital(data);
  };

  const signup = async (userData: User) => {
    const main = {
      username: userData.email,
      name: userData.name,
      password: userData.password,
      confirmPassword: userData.password,
      phone: userData.phone,
      preferredLanguage: userData.preferredLanguage,
      avatar: userData.avatar,
      dob: userData.dob,
      pincode: userData.pincode,
      role: userData.role,
    };
    const response = await fetch("/auth/register", {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(main),
    });
    if (!response.ok) throw new Error("Unauthorized");

    const data = await response.json();
    setUser(data);
  };

  const logout = async () => {
    const response = await fetch("/auth/logout", {
      credentials: "include",
    });
    if (!response.ok) throw new Error("Unable to logout the user");
    if(user?.role==='patient') setUser(null);
    if(loginHospital?.role==='hospital') setLoginHospital(null);
  };

  const updateUser = async (newUserData: Partial<User>) => {
    if (user) {
      const response = await fetch('/auth/profileupdate',{
        credentials: 'include',
        method: 'PATCH',
        headers: {'content-type':'application/json'},
        body: JSON.stringify(newUserData),
      })
      const data = await response.json();
      if (!response.ok) {
        console.error("Error updating user:", data.message);
        return;
      }
      setUser(data.data);
    }
  };
  const getStates = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/hospital/states', { method: 'GET', credentials: 'include' });
      if (!response.ok) throw new Error("Failed to fetch states");
      const data = await response.json();
      setStates(data);
    } catch (error) {
      console.error("Error fetching states:", error);
      setStates([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getDistricts = useCallback(async (state: string) => {
    if (!state) return;
    setIsLoading(true);
    setDistricts([]);
    try {
      const response = await fetch('/hospital/districts', {
        method: 'POST',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ state }),
      });
      if (!response.ok) throw new Error("Failed to fetch districts");
      const data = await response.json();
      setDistricts(data);
    } catch (error) {
      console.error("Error fetching districts:", error);
      setDistricts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getHospitals = useCallback(async (state: string, district: string) => {
    if (!state || !district) return;
    setIsLoading(true);
    setHospitals([]);
    try {
      const response = await fetch('/hospital/hospitals', {
        method: 'POST',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ state, district }),
      });
      if (!response.ok) throw new Error("Failed to fetch hospitals");
      const rawData = await response.json();
      const formattedHospitals = rawData.map((hospital: HospitalFound) => ({
        _id: hospital._id,
        hospital_name: hospital.hospital_name || 'Hospital Name not available',
        address: hospital.state + ', ' + hospital.district || 'Address not available',
        lat: hospital.lat || 0,
        long: hospital.long || 0,
      }));
      setHospitals(formattedHospitals);

    } catch (error) {
      console.error("Error fetching hospitals:", error);
      setHospitals([]);
    } finally {
      setIsLoading(false);
    }
  }, []);
  const addDoctor = async (update:Doctor) =>{
    const response = await fetch('/auth/update/doctor', {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(update),
    });
    const data = await response.json();
    if(!response.ok) {
      alert(data.message || "Error adding doctor");
    }
    setLoginHospital(data.data);
  }
  const value = {
    user,
    login,
    signup,
    logout,
    isAuthenticated: !!user || !!loginHospital,
    isLoading,
    updateUser,
    hospitalsignup,
    getStates,
    getDistricts,
    getHospitals,
    states,
    districts,
    hospitals,
    loginHospital,
    addDoctor,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};