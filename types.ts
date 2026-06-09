export enum UserRole {
  PATIENT = 'patient',
  DOCTOR = 'doctor',
  ADMIN = 'admin'
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

export interface AppointmentDocument {
  name: string;
  type: string;
  data: string; // base64
  uploadedAt: string;
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
  documents?: AppointmentDocument[];
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

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  type?: 'appointment' | 'system' | 'message';
  link?: string;
}