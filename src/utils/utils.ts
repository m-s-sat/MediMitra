// src/utils/utils.ts
import { User } from '../types';

interface ProfileData {
  name: string | null;
  age: string | null;
  gender: string | null;
  phone: string | null;
  email: string | null;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  } | null;
  medicalHistory: {
    pastIllnesses: string[];
    ongoingConditions: string[];
    allergies: string[];
    currentMedications: string[];
  } | null;
  bodyMeasurements: {
    height: string;
    weight: string;
    bmi: string;
  } | null;
}

export const calculateCompletionPercentage = (user: User | null, profileData: ProfileData): number => {
  let completed = 0;
  const total = 8;

  if (user?.name || profileData.name) completed++;
  if (profileData.age) completed++;
  if (profileData.gender) completed++;
  if (user?.phone || profileData.phone) completed++;
  if (profileData?.emergencyContact?.name) completed++;
  if (profileData.bodyMeasurements?.height) completed++;
  if (profileData.bodyMeasurements?.weight) completed++;
  if (profileData.medicalHistory?.allergies.length > 0) completed++;

  return Math.round((completed / total) * 100);
};