import { User, UserRole, Appointment, AppointmentStatus, AiRecord, Doctor } from '../types';

const API_URL = 'http://localhost:5000/api';

/**
 * Service to interact with the Real Node.js Backend.
 * All functions match the signatures from mockBackend.ts to ensure seamless switching.
 * 
 * To use this instead of mockBackend:
 * 1. Ensure backend is running (node server.js)
 * 2. Update AuthContext to import from here.
 */

// Helper function to make authenticated requests
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(errorData.message || `HTTP ${response.status}`);
  }
  
  return response.json();
};

export const api = {
  // --- Auth ---
  login: async (email: string, password: string, role?: UserRole): Promise<User> => {
    const data = await fetchWithAuth(`${API_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ email, password, role }),
    });
    
    // Store token
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    
    // Store user info (matching mockBackend behavior)
    const user: User = {
      id: data.user.id || data.user._id,
      name: data.user.name,
      email: data.user.email,
      role: data.user.role,
      phone: data.user.phone,
      specialization: data.user.specialization,
      qualifications: data.user.qualifications,
      experience: data.user.experience,
      consultationFee: data.user.consultationFee,
      availability: data.user.availability,
      hospital: data.user.hospital,
      location: data.user.location,
      rating: data.user.rating,
      reviewCount: data.user.reviewCount,
      image: data.user.image,
      bio: data.user.bio
    };
    
    localStorage.setItem('hopcare_current_user', JSON.stringify(user));
    return user;
  },

  register: async (userData: Partial<User>): Promise<User> => {
    const data = await fetchWithAuth(`${API_URL}/auth/register`, {
      method: 'POST',
      body: JSON.stringify({
        name: userData.name,
        email: userData.email,
        password: (userData as any).password || 'password123',
        role: userData.role || UserRole.PATIENT,
        phone: userData.phone,
        specialization: userData.specialization,
        qualifications: userData.qualifications,
        experience: userData.experience,
        consultationFee: userData.consultationFee,
      }),
    });
    
    // Store token
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    
    // Store user info (matching mockBackend behavior)
    const user: User = {
      id: data.user.id || data.user._id,
      name: data.user.name,
      email: data.user.email,
      role: data.user.role,
      phone: userData.phone,
      specialization: userData.specialization,
      qualifications: userData.qualifications,
      experience: userData.experience,
      consultationFee: userData.consultationFee,
      availability: data.user.availability,
    };
    
    localStorage.setItem('hopcare_current_user', JSON.stringify(user));
    return user;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('hopcare_current_user');
  },

  getCurrentUser: (): User | null => {
    const stored = localStorage.getItem('hopcare_current_user');
    return stored ? JSON.parse(stored) : null;
  },

  getUserById: async (id: string): Promise<User | null> => {
    try {
      const user = await fetchWithAuth(`${API_URL}/users/${id}`);
      return {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        specialization: user.specialization,
        qualifications: user.qualifications,
        experience: user.experience,
        consultationFee: user.consultationFee,
        availability: user.availability,
        hospital: user.hospital,
        location: user.location,
        rating: user.rating,
        reviewCount: user.reviewCount,
        image: user.image,
        bio: user.bio
      };
    } catch (err) {
      console.error('Error fetching user:', err);
      return null;
    }
  },

  updateUser: async (userId: string, data: Partial<User>): Promise<User> => {
    const updated = await fetchWithAuth(`${API_URL}/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    
    const user: User = {
      id: updated._id || updated.id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      phone: updated.phone,
      specialization: updated.specialization,
      qualifications: updated.qualifications,
      experience: updated.experience,
      consultationFee: updated.consultationFee,
      availability: updated.availability,
      hospital: updated.hospital,
      location: updated.location,
      rating: updated.rating,
      reviewCount: updated.reviewCount,
      image: updated.image,
      bio: updated.bio
    };
    
    // Update local storage
    localStorage.setItem('hopcare_current_user', JSON.stringify(user));
    return user;
  },

  // --- Data ---
  getDoctors: async (): Promise<Doctor[]> => {
    const doctors = await fetchWithAuth(`${API_URL}/doctors?t=${Date.now()}`);
    return doctors.map((doc: any): Doctor => ({
      id: doc._id || doc.id,
      name: doc.name,
      email: doc.email,
      role: UserRole.DOCTOR,
      phone: doc.phone,
      specialization: doc.specialization || 'General Physician',
      qualifications: doc.qualifications,
      experience: doc.experience,
      consultationFee: doc.consultationFee,
      availability: doc.availability || [], // remove legacy default so real dates reflect
      hospital: doc.hospital || 'HopCare Network',
      location: doc.location || 'Online',
      rating: doc.rating || 4.5,
      reviewCount: doc.reviewCount || 0,
      image: doc.image,
      bio: doc.bio
    }));
  },

  getAppointments: async (): Promise<Appointment[]> => {
    const appointments = await fetchWithAuth(`${API_URL}/appointments`);
    return appointments.map((appt: any): Appointment => ({
      id: appt._id || appt.id,
      patientId: appt.patientId?._id || appt.patientId,
      patientName: appt.patientId?.name || appt.patientName,
      patientImage: appt.patientId?.image,
      doctorId: appt.doctorId?._id || appt.doctorId,
      doctorName: appt.doctorId?.name || appt.doctorName,
      doctorImage: appt.doctorId?.image,
      date: appt.date,
      time: appt.time,
      status: appt.status as AppointmentStatus,
      notes: appt.notes,
      prescription: appt.prescription
    }));
  },

  createAppointment: async (appointment: Omit<Appointment, 'id' | 'status'>): Promise<Appointment> => {
    const created = await fetchWithAuth(`${API_URL}/appointments`, {
      method: 'POST',
      body: JSON.stringify(appointment),
    });
    
    return {
      id: created._id || created.id,
      patientId: created.patientId,
      patientName: created.patientName,
      doctorId: created.doctorId,
      doctorName: created.doctorName,
      date: created.date,
      time: created.time,
      status: created.status as AppointmentStatus,
      notes: created.notes
    };
  },

  updateAppointmentStatus: async (apptId: string, status: AppointmentStatus): Promise<void> => {
    await fetchWithAuth(`${API_URL}/appointments/${apptId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  getQueueStatus: async (apptId: string): Promise<{ position: number; waitTime: number; isActive: boolean }> => {
    return await fetchWithAuth(`${API_URL}/appointments/${apptId}/queue`);
  },

  nextPatient: async (date: string, time: string): Promise<any> => {
    return await fetchWithAuth(`${API_URL}/doctors/next-patient`, {
      method: 'POST',
      body: JSON.stringify({ date, time }),
    });
  },

  updateAppointmentPrescription: async (apptId: string, prescription: string): Promise<void> => {
    await fetchWithAuth(`${API_URL}/appointments/${apptId}/prescription`, {
      method: 'PUT',
      body: JSON.stringify({ prescription }),
    });
  },

  // --- AI History ---
  saveAiRecord: async (record: AiRecord): Promise<void> => {
    // Store AI history per user (user-specific localStorage key)
    const currentUser = api.getCurrentUser();
    if (!currentUser) return;
    
    const userKey = `hopcare_ai_history_${currentUser.id}`;
    const stored = localStorage.getItem(userKey);
    const all: AiRecord[] = stored ? JSON.parse(stored) : [];
    all.unshift(record);
    localStorage.setItem(userKey, JSON.stringify(all));
  },

  getAiHistory: async (): Promise<AiRecord[]> => {
    // Get AI history from local storage (user-specific)
    const currentUser = api.getCurrentUser();
    if (!currentUser) return [];
    
    const userKey = `hopcare_ai_history_${currentUser.id}`;
    const stored = localStorage.getItem(userKey);
    return stored ? JSON.parse(stored) : [];
  },

  // --- AI Symptom Analysis ---
  analyzeSymptoms: async (symptoms: string): Promise<Omit<AiRecord, 'id' | 'date'>> => {
    const result = await fetchWithAuth(`${API_URL}/ai/predict`, {
      method: 'POST',
      body: JSON.stringify({ symptoms }),
    });
    
    return {
      symptoms,
      prediction: result.prediction,
      confidence: result.confidence,
      recommendation: result.recommendation,
      specialist: result.specialist
    };
  }
};
