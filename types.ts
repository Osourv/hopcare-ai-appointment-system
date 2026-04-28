export enum UserRole {
  PATIENT = 'patient',
  DOCTOR = 'doctor'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  
  // Extended Doctor Profile Fields
  specialization?: string; 
  qualifications?: string; 
  experience?: string; 
  consultationFee?: string; 
  availability?: string[]; 
  
  // Visual & Social Proof
  image?: string;
  rating?: number;
  reviewCount?: number;
  hospital?: string;
  location?: string;
  bio?: string;
}

export interface Doctor extends User {
  role: UserRole.DOCTOR;
  specialization: string;
  availability: string[];
}

export enum AppointmentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  WAITING = 'waiting',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  patientImage?: string;
  doctorImage?: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  notes?: string;
  prescription?: string;
}

export interface AiRecord {
  id: string;
  date: string;
  symptoms: string;
  prediction: string;
  confidence: string;
  recommendation: string;
  specialist: string;
}

// For the mock backend response
export interface AuthResponse {
  user: User;
  token: string;
}