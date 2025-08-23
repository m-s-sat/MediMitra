import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import {
  User,
  Camera,
  Heart,
  FileText,
  Upload,
  Scale,
  Activity,
  CheckCircle,
  Plus,
  X,
  Edit3,
  Save,
  Download,
  Eye,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import TimeAgo from "../components/Timeago";

interface ProfileData {
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

export const ProfilePage: React.FC = () => {
  const { user, updateUser, isLoading } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<
    "basic" | "medical" | "measurements" | "documents" | "tracker"
  >("basic");
  const [isEditing, setIsEditing] = useState(false);

  const [profileData, setProfileData] = useState<ProfileData>({
    name: "",
    age: "",
    gender: "",
    phone: "",
    email: "",
    emergencyContact: { name: "", phone: "", relationship: "" },
    medicalHistory: {
      pastIllnesses: [],
      ongoingConditions: [],
      allergies: [],
      currentMedications: [],
    },
    bodyMeasurements: { height: "", weight: "", bmi: "" },
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        age: user.age || "",
        gender: user.gender || "",
        phone: user.phone || "",
        email: user.email || "",
        emergencyContact: {
          name: user.emergencyContact?.name || "",
          phone: user.emergencyContact?.phone || "",
          relationship: user.emergencyContact?.relationship || "",
        },
        medicalHistory: {
          pastIllnesses: user.medicalHistory?.pastIllnesses || [],
          ongoingConditions: user.medicalHistory?.ongoingConditions || [],
          allergies: user.medicalHistory?.allergies || [],
          currentMedications: user.medicalHistory?.currentMedications || [],
        },
        bodyMeasurements: {
          height: user.bodyMeasurements?.height || "",
          weight: user.bodyMeasurements?.weight || "",
          bmi: user.bodyMeasurements?.bmi || "",
        },
      });
    }
  }, [user]);

  const [weeklyLog, setWeeklyLog] = useState({
    weight: user?.weeklyLogs?.weight || "",
    waistCircumference: user?.weeklyLogs?.waistCircumference || "",
    bloodPressure: { systolic: user?.weeklyLogs?.bloodPressure?.systolic || "", diastolic: user?.weeklyLogs?.bloodPressure?.diastolic || "" },
    restingHeartRate: user?.weeklyLogs?.restingHeartRate || "",
    sleepHours: user?.weeklyLogs?.sleepHours || "",
    waterIntake: user?.weeklyLogs?.waterIntake || "",
    energyLevel: user?.weeklyLogs?.energyLevel || "",
    appetiteChanges: user?.weeklyLogs?.appetiteChanges || "",
    symptoms: user?.weeklyLogs?.symptoms || [],
    exerciseFrequency: user?.weeklyLogs?.exerciseFrequency || "",
    conditionSpecific: {
      bloodSugar: user?.weeklyLogs?.conditionSpecific?.bloodSugar || "",
      painScore: user?.weeklyLogs?.conditionSpecific?.painScore || "",
    },
    lastUpdated: user?.weeklyLogs?.lastUpdated || new Date(),
  });
    
  const [documents] = useState([
    {
      id: "1",
      name: "Blood Test Report - Jan 2025",
      type: "report",
      date: "2025-01-10",
    },
    {
      id: "2",
      name: "Prescription - Dr. Smith",
      type: "prescription",
      date: "2025-01-08",
    },
    { id: "3", name: "X-Ray Chest", type: "scan", date: "2024-12-15" },
  ]);

  const calculateCompletionPercentage = () => {
    let completed = 0;
    const total = 8;

    if (profileData.name) completed++;
    if (profileData.age) completed++;
    if (profileData.gender) completed++;
    if (profileData.phone) completed++;
    if (profileData.emergencyContact.name) completed++;
    if (profileData.bodyMeasurements.height) completed++;
    if (profileData.bodyMeasurements.weight) completed++;
    if (profileData.medicalHistory.allergies.length > 0) completed++;

    return Math.round((completed / total) * 100);
  };

  const completionPercentage = calculateCompletionPercentage();

  const handleSave = async () => {
    try {
      const response = await fetch("/auth/profileupdate", {
        credentials: "include",
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(profileData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to update profile.");
      }

      updateUser(result.data);
      alert(result.message);
      setIsEditing(false);
    } catch (error: any) {
      console.error("Save failed:", error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const addToList = (
    category: keyof ProfileData["medicalHistory"],
    value: string
  ) => {
    if (value.trim()) {
      setProfileData((prev) => ({
        ...prev,
        medicalHistory: {
          ...prev.medicalHistory,
          [category]: [...prev.medicalHistory[category], value.trim()],
        },
      }));
    }
  };

  const removeFromList = (
    category: keyof ProfileData["medicalHistory"],
    index: number
  ) => {
    setProfileData((prev) => ({
      ...prev,
      medicalHistory: {
        ...prev.medicalHistory,
        [category]: prev.medicalHistory[category].filter((_, i) => i !== index),
      },
    }));
  };

  const tabs = [
    { id: "basic", label: "Basic Info", icon: User },
    { id: "medical", label: "Medical History", icon: Heart },
    { id: "measurements", label: "Body Metrics", icon: Scale },
    { id: "documents", label: "Documents", icon: FileText },
    { id: "tracker", label: "Weekly Tracker", icon: Activity },
  ];
  const handleWeeklySave = ()=>{
    console.log(weeklyLog);
    updateUser({weeklyLogs: weeklyLog});
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            My Profile
          </h1>
          <p className="text-gray-600 text-lg">
            Manage your health information and track your wellness journey
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Profile Completion
            </h3>
            <span className="text-2xl font-bold text-blue-600">
              {completionPercentage}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div
              className="bg-gradient-to-r from-blue-600 to-emerald-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
          <p className="text-gray-600 text-sm">
            {completionPercentage === 100
              ? "🎉 Your profile is complete and up to date!"
              : `Complete your profile to get personalized health insights. ${8 - Math.round(completionPercentage / 12.5)
              } fields remaining.`}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 sticky top-24"
            >
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full flex items-center justify-center mb-3">
                    {user?.avatar ? <img src={user.avatar} alt="User photo" className="w-full h-full object-cover rounded-full"></img> :<span className="text-white text-2xl font-bold">
                      {profileData.name.charAt(0).toUpperCase()}
                    </span>}
                  </div>
                  {user?.password==='google'? null: <button
                    onClick={handleFileUpload}
                    className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors"
                  >
                    <Camera className="w-4 h-4" />
                  </button>}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                  />
                </div>
                <h3 className="font-semibold text-gray-900">
                  {profileData.name}
                </h3>
                <p className="text-gray-500 text-sm">{profileData.email}</p>
              </div>

              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-left ${activeTab === tab.id
                        ? "bg-blue-50 text-blue-600 border border-blue-200"
                        : "text-gray-700 hover:bg-gray-50"
                      }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </motion.div>
          </div>

          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {tabs.find((tab) => tab.id === activeTab)?.label}
                </h2>
                {activeTab !== "documents" && activeTab !== "tracker" && (
                  <button
                    onClick={() =>
                      isEditing ? handleSave() : setIsEditing(true)
                    }
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {isEditing ? (
                      <Save className="w-4 h-4" />
                    ) : (
                      <Edit3 className="w-4 h-4" />
                    )}
                    <span>{isEditing ? "Save" : "Edit"}</span>
                  </button>
                )}
              </div>

              {activeTab === "basic" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) =>
                          setProfileData((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Age
                      </label>
                      <input
                        type="number"
                        value={profileData.age}
                        onChange={(e) =>
                          setProfileData((prev) => ({
                            ...prev,
                            age: e.target.value,
                          }))
                        }
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gender
                      </label>
                      <select
                        value={profileData.gender}
                        onChange={(e) =>
                          setProfileData((prev) => ({
                            ...prev,
                            gender: e.target.value,
                          }))
                        }
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                      >
                        <option value={""} disabled>
                          Select Gender
                        </option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) =>
                          setProfileData((prev) => ({
                            ...prev,
                            phone: e.target.value,
                          }))
                        }
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                      />
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Emergency Contact
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Name
                        </label>
                        <input
                          type="text"
                          value={profileData.emergencyContact.name}
                          onChange={(e) =>
                            setProfileData((prev) => ({
                              ...prev,
                              emergencyContact: {
                                ...prev.emergencyContact,
                                name: e.target.value,
                              },
                            }))
                          }
                          disabled={!isEditing}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone
                        </label>
                        <input
                          type="tel"
                          value={profileData.emergencyContact.phone}
                          onChange={(e) =>
                            setProfileData((prev) => ({
                              ...prev,
                              emergencyContact: {
                                ...prev.emergencyContact,
                                phone: e.target.value,
                              },
                            }))
                          }
                          disabled={!isEditing}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Relationship
                        </label>
                        <input
                          type="text"
                          value={profileData.emergencyContact.relationship}
                          onChange={(e) =>
                            setProfileData((prev) => ({
                              ...prev,
                              emergencyContact: {
                                ...prev.emergencyContact,
                                relationship: e.target.value,
                              },
                            }))
                          }
                          disabled={!isEditing}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "medical" && (
                <div className="space-y-8">
                  {Object.entries(profileData.medicalHistory).map(
                    ([category, items]) => (
                      <div key={category}>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 capitalize">
                          {category.replace(/([A-Z])/g, " $1").trim()}
                        </h3>
                        <div className="space-y-2">
                          {items.map((item, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                            >
                              <span className="text-gray-700">{item}</span>
                              {isEditing && (
                                <button
                                  onClick={() =>
                                    removeFromList(
                                      category as keyof ProfileData["medicalHistory"],
                                      index
                                    )
                                  }
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          ))}
                          {isEditing && (
                            <div className="flex space-x-2">
                              <input
                                type="text"
                                placeholder={`Add ${category
                                  .replace(/([A-Z])/g, " $1")
                                  .toLowerCase()}`}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                onKeyPress={(e) => {
                                  if (e.key === "Enter") {
                                    addToList(
                                      category as keyof ProfileData["medicalHistory"],
                                      e.currentTarget.value
                                    );
                                    e.currentTarget.value = "";
                                  }
                                }}
                              />
                              <button
                                onClick={(e) => {
                                  const input = e.currentTarget
                                    .previousElementSibling as HTMLInputElement;
                                  addToList(
                                    category as keyof ProfileData["medicalHistory"],
                                    input.value
                                  );
                                  input.value = "";
                                }}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}

              {activeTab === "measurements" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Height (cm)
                      </label>
                      <input
                        type="number"
                        value={profileData.bodyMeasurements.height}
                        onChange={(e) => {
                          const height = parseFloat(e.target.value);
                          const weight = parseFloat(
                            profileData.bodyMeasurements.weight
                          );
                          const bmi = weight / (height / 100) ** 2;
                          setProfileData((prev) => ({
                            ...prev,
                            bodyMeasurements: {
                              ...prev.bodyMeasurements,
                              height: e.target.value,
                              bmi: isNaN(bmi) ? "0" : bmi.toFixed(1),
                            },
                          }));
                        }}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Weight (kg)
                      </label>
                      <input
                        type="number"
                        value={profileData.bodyMeasurements.weight}
                        onChange={(e) => {
                          const height = parseFloat(
                            profileData.bodyMeasurements.height
                          );
                          const weight = parseFloat(e.target.value);
                          const bmi = weight / (height / 100) ** 2;
                          setProfileData((prev) => ({
                            ...prev,
                            bodyMeasurements: {
                              ...prev.bodyMeasurements,
                              weight: e.target.value,
                              bmi: isNaN(bmi) ? "0" : bmi.toFixed(1),
                            },
                          }));
                        }}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        BMI
                      </label>
                      <input
                        type="text"
                        value={profileData.bodyMeasurements.bmi}
                        disabled
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                      />
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <h4 className="font-semibold text-blue-900 mb-2">
                      BMI Categories
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      <div className="text-blue-700">Underweight: &lt;18.5</div>
                      <div className="text-green-700">Normal: 18.5-24.9</div>
                      <div className="text-yellow-700">
                        Overweight: 25-29.9
                      </div>
                      <div className="text-red-700">Obese: ≥30</div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "documents" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <p className="text-gray-600">
                      Securely store your medical documents
                    </p>
                    <button
                      onClick={handleFileUpload}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Upload Document</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <FileText className="w-8 h-8 text-blue-600" />
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${doc.type === "report"
                                ? "bg-blue-100 text-blue-600"
                                : doc.type === "prescription"
                                  ? "bg-green-100 text-green-600"
                                  : "bg-purple-100 text-purple-600"
                              }`}
                          >
                            {doc.type}
                          </span>
                        </div>
                        <h4 className="font-medium text-gray-900 mb-2">
                          {doc.name}
                        </h4>
                        <p className="text-gray-500 text-sm mb-3">{doc.date}</p>
                        <div className="flex space-x-2">
                          <button className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm">
                            <Eye className="w-4 h-4" />
                            <span>View</span>
                          </button>
                          <button className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors text-sm">
                            <Download className="w-4 h-4" />
                            <span>Download</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "tracker" && (
                <div className="space-y-8">
                  <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                      <h4 className="font-semibold text-emerald-900">
                        This Week's Log
                      </h4>
                    </div>
                    <p className="text-emerald-700 text-sm">
                      Last updated: <TimeAgo timestamp={String(user?.weeklyLogs?.lastUpdated)}></TimeAgo>
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Weight (kg)
                      </label>
                      <input
                        type="number"
                        value={weeklyLog.weight}
                        onChange={(e) =>
                          setWeeklyLog((prev) => ({
                            ...prev,
                            weight: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Waist Circumference (inches)
                      </label>
                      <input
                        type="number"
                        value={weeklyLog.waistCircumference}
                        onChange={(e) =>
                          setWeeklyLog((prev) => ({
                            ...prev,
                            waistCircumference: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Blood Pressure
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          placeholder="Systolic"
                          value={weeklyLog.bloodPressure.systolic}
                          onChange={(e) =>
                            setWeeklyLog((prev) => ({
                              ...prev,
                              bloodPressure: {
                                ...prev.bloodPressure,
                                systolic: e.target.value,
                              },
                            }))
                          }
                          className="flex-1 min-w-[80px] px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <span className="flex items-center text-gray-400 text-lg font-semibold">/</span>
                        <input
                          type="number"
                          placeholder="Diastolic"
                          value={weeklyLog.bloodPressure.diastolic}
                          onChange={(e) =>
                            setWeeklyLog((prev) => ({
                              ...prev,
                              bloodPressure: {
                                ...prev.bloodPressure,
                                diastolic: e.target.value,
                              },
                            }))
                          }
                          className="flex-1 min-w-[80px] px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Resting Heart Rate (bpm)
                      </label>
                      <input
                        type="number"
                        value={weeklyLog.restingHeartRate}
                        onChange={(e) =>
                          setWeeklyLog((prev) => ({
                            ...prev,
                            restingHeartRate: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sleep Hours (avg/night)
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        value={weeklyLog.sleepHours}
                        onChange={(e) =>
                          setWeeklyLog((prev) => ({
                            ...prev,
                            sleepHours: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Water Intake (glasses/day)
                      </label>
                      <input
                        type="number"
                        value={weeklyLog.waterIntake}
                        onChange={(e) =>
                          setWeeklyLog((prev) => ({
                            ...prev,
                            waterIntake: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Energy Level
                      </label>
                      <select
                        value={weeklyLog.energyLevel}
                        onChange={(e) =>
                          setWeeklyLog((prev) => ({
                            ...prev,
                            energyLevel: e.target.value as any,
                          }))
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Exercise Frequency (times/week)
                      </label>
                      <input
                        type="number"
                        value={weeklyLog.exerciseFrequency}
                        onChange={(e) =>
                          setWeeklyLog((prev) => ({
                            ...prev,
                            exerciseFrequency: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Condition-Specific Metrics
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Blood Sugar (mg/dL)
                        </label>
                        <input
                          type="number"
                          value={weeklyLog.conditionSpecific.bloodSugar}
                          onChange={(e) =>
                            setWeeklyLog((prev) => ({
                              ...prev,
                              conditionSpecific: {
                                ...prev.conditionSpecific,
                                bloodSugar: e.target.value,
                              },
                            }))
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Pain Score (1-10)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={weeklyLog.conditionSpecific.painScore}
                          onChange={(e) =>
                            setWeeklyLog((prev) => ({
                              ...prev,
                              conditionSpecific: {
                                ...prev.conditionSpecific,
                                painScore: e.target.value,
                              },
                            }))
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  <button onClick={handleWeeklySave} className="w-full bg-gradient-to-r from-blue-600 to-emerald-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-emerald-700 transition-all">
                    Save Weekly Log
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};