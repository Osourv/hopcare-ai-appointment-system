import { User, UserRole, Appointment, AppointmentStatus, AiRecord, Doctor, AppointmentDocument } from '../types';

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

  requestOtp: async (email: string, password: string): Promise<void> => {
    await fetchWithAuth(`${API_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    // Backend returns { requiresOtp: true } — no token yet
  },

  verifyOtp: async (email: string, otp: string): Promise<User> => {
    const data = await fetchWithAuth(`${API_URL}/auth/verify-otp`, {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
    if (data.token) localStorage.setItem('token', data.token);
    const user: User = {
      id: data.user.id || data.user._id,
      name: data.user.name,
      email: data.user.email,
      role: data.user.role as UserRole,
      phone: data.user.phone,
      specialization: data.user.specialization,
      availability: data.user.availability,
    };
    localStorage.setItem('hopcare_current_user', JSON.stringify(user));
    return user;
  },

  register: async (userData: Partial<User>): Promise<void> => {
    await fetchWithAuth(`${API_URL}/auth/register`, {
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
    // Backend returns { requiresOtp: true } — account not created yet
  },

  verifyRegisterOtp: async (email: string, otp: string): Promise<User> => {
    const data = await fetchWithAuth(`${API_URL}/auth/verify-register-otp`, {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
    if (data.token) localStorage.setItem('token', data.token);
    const user: User = {
      id: data.user.id || data.user._id,
      name: data.user.name,
      email: data.user.email,
      role: data.user.role as UserRole,
      phone: data.user.phone,
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
    try {
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
      prescription: appt.prescription,
      documents: appt.documents || []
    }));
    } catch {
      return [];
    }
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

  // --- Notifications ---
  getNotifications: async (userId: string): Promise<any[]> => {
    try {
      const data = await fetchWithAuth(`${API_URL}/notifications`);
      return data.map((n: any) => ({ ...n, id: n._id?.toString() || n.id }));
    } catch {
      // Fallback
      const stored = localStorage.getItem('hopcare_notifications');
      const all = stored ? JSON.parse(stored) : [];
      return all.filter((n: any) => n.userId === userId).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  },

  createNotification: async (notification: any): Promise<any> => {
    try {
      const data = await fetchWithAuth(`${API_URL}/notifications`, {
        method: 'POST',
        body: JSON.stringify(notification)
      });
      return data;
    } catch {
      // Fallback
      const stored = localStorage.getItem('hopcare_notifications');
      const all = stored ? JSON.parse(stored) : [];
      const newNotif = {
        ...notification,
        id: Math.random().toString(36).substr(2, 9),
        read: false,
        createdAt: new Date().toISOString()
      };
      all.push(newNotif);
      localStorage.setItem('hopcare_notifications', JSON.stringify(all));
      return newNotif;
    }
  },

  markNotificationAsRead: async (notifId: string): Promise<void> => {
    try {
      await fetchWithAuth(`${API_URL}/notifications/${notifId}/read`, {
        method: 'PUT'
      });
    } catch {
      // Fallback
      const stored = localStorage.getItem('hopcare_notifications');
      let all = stored ? JSON.parse(stored) : [];
      all = all.map((n: any) => n.id === notifId ? { ...n, read: true } : n);
      localStorage.setItem('hopcare_notifications', JSON.stringify(all));
    }
  },
  
  markAllNotificationsAsRead: async (userId: string): Promise<void> => {
    try {
      await fetchWithAuth(`${API_URL}/notifications/read-all`, {
        method: 'PUT'
      });
    } catch {
      // Fallback
      const stored = localStorage.getItem('hopcare_notifications');
      let all = stored ? JSON.parse(stored) : [];
      all = all.map((n: any) => n.userId === userId ? { ...n, read: true } : n);
      localStorage.setItem('hopcare_notifications', JSON.stringify(all));
    }
  },

  // --- Payment ---
  createPaymentOrder: async (amount: number): Promise<{ orderId: string; amount: number; currency: string; keyId: string }> => {
    return await fetchWithAuth(`${API_URL}/payment/create-order`, {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  },

  verifyPaymentAndBook: async (paymentData: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    appointmentData: any;
  }): Promise<any> => {
    return await fetchWithAuth(`${API_URL}/payment/verify`, {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  },

  testBook: async (appointmentData: any): Promise<any> => {
    return await fetchWithAuth(`${API_URL}/payment/test-book`, {
      method: 'POST',
      body: JSON.stringify({ appointmentData }),
    });
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
