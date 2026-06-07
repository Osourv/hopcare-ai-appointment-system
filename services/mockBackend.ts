import { User, UserRole, Appointment, AppointmentStatus, AiRecord, Doctor } from '../types';

/**
 * FINAL YEAR PROJECT NOTE:
 * In the real deployment (Node.js), these functions would be replaced 
 * by Axios calls to your Express backend (e.g., axios.post('/api/auth/login')).
 * 
 * This service acts as a "Mock Database" so the app is fully functional 
 * in the browser preview without needing a local MongoDB running.
 */

const STORAGE_KEYS = {
  USERS: 'hopcare_users',
  APPOINTMENTS: 'hopcare_appointments',
  AI_HISTORY: 'hopcare_ai_history',
  CURRENT_USER: 'hopcare_current_user',
  NOTIFICATIONS: 'hopcare_notifications'
};

// Seed Data - 20 Doctors (10 Male, 10 Female)
const MOCK_DOCTORS: Doctor[] = [
  // --- MALE DOCTORS ---
  { 
    id: 'dm1', 
    name: 'Dr. Amit Sharma', 
    email: 'amit@hopcare.com', 
    role: UserRole.DOCTOR, 
    specialization: 'Cardiologist', 
    qualifications: 'MBBS, MD, DM (Cardiology)', 
    experience: '18 Years', 
    hospital: 'Fortis Escorts',
    location: 'New Delhi',
    rating: 4.9,
    reviewCount: 2100,
    image: 'https://randomuser.me/api/portraits/men/32.jpg',
    bio: 'Dr. Amit Sharma is a distinguished Cardiologist known for his expertise in interventional cardiology. He has performed over 10,000 successful cardiac procedures.',
    availability: ['09:00', '10:00', '11:00', '16:00'],
    consultationFee: '1500'
  },
  { 
    id: 'dm2', 
    name: 'Dr. Rahul Verma', 
    email: 'rahul@hopcare.com', 
    role: UserRole.DOCTOR, 
    specialization: 'Dermatologist', 
    qualifications: 'MBBS, MD (Dermatology)', 
    experience: '10 Years', 
    hospital: 'Skin & Hair Clinic',
    location: 'Mumbai',
    rating: 4.7,
    reviewCount: 850,
    image: 'https://randomuser.me/api/portraits/men/45.jpg',
    bio: 'Dr. Rahul Verma specializes in clinical and aesthetic dermatology. He is an expert in treating acne, hair loss, and anti-aging therapies using advanced laser technology.',
    availability: ['11:00', '13:00', '15:00', '17:00'],
    consultationFee: '1200'
  },
  { 
    id: 'dm3', 
    name: 'Dr. Rakesh Gupta', 
    email: 'rakesh@hopcare.com', 
    role: UserRole.DOCTOR, 
    specialization: 'General Physician', 
    qualifications: 'MBBS, MD (Internal Medicine)', 
    experience: '22 Years', 
    hospital: 'Apollo Hospital',
    location: 'Bangalore',
    rating: 4.8,
    reviewCount: 3200,
    image: 'https://randomuser.me/api/portraits/men/22.jpg',
    bio: 'Dr. Rakesh Gupta is a senior General Physician with vast experience in managing chronic lifestyle diseases like diabetes, hypertension, and thyroid disorders.',
    availability: ['09:30', '12:00', '14:00', '18:00'],
    consultationFee: '800'
  },
  { 
    id: 'dm4', 
    name: 'Dr. Sandeep Kumar', 
    email: 'sandeep@hopcare.com', 
    role: UserRole.DOCTOR, 
    specialization: 'Neurologist', 
    qualifications: 'MBBS, DM (Neurology)', 
    experience: '14 Years', 
    hospital: 'Medanta - The Medicity',
    location: 'Gurugram',
    rating: 4.9,
    reviewCount: 1500,
    image: 'https://randomuser.me/api/portraits/men/64.jpg',
    bio: 'Dr. Sandeep Kumar is a leading Neurologist specializing in stroke management, epilepsy, and movement disorders. He is known for his patient-centric approach.',
    availability: ['10:00', '12:00', '14:00'],
    consultationFee: '1800'
  },
  { 
    id: 'dm5', 
    name: 'Dr. Anil Mehta', 
    email: 'anil@hopcare.com', 
    role: UserRole.DOCTOR, 
    specialization: 'Orthopedist', 
    qualifications: 'MBBS, MS (Orthopedics)', 
    experience: '16 Years', 
    hospital: 'Max Super Speciality',
    location: 'New Delhi',
    rating: 4.6,
    reviewCount: 980,
    image: 'https://randomuser.me/api/portraits/men/11.jpg',
    bio: 'Dr. Anil Mehta is a renowned Orthopedic surgeon specializing in joint replacement and sports injuries. He has helped numerous athletes return to peak performance.',
    availability: ['09:00', '11:00', '15:00'],
    consultationFee: '1400'
  },
  { 
    id: 'dm6', 
    name: 'Dr. Vikram Singh', 
    email: 'vikram@hopcare.com', 
    role: UserRole.DOCTOR, 
    specialization: 'Pediatrician', 
    qualifications: 'MBBS, MD (Pediatrics)', 
    experience: '12 Years', 
    hospital: 'Rainbow Children\'s Hospital',
    location: 'Hyderabad',
    rating: 4.8,
    reviewCount: 1120,
    image: 'https://randomuser.me/api/portraits/men/86.jpg',
    bio: 'Dr. Vikram Singh is a compassionate pediatrician dedicated to newborn care, vaccination, and treating childhood infections.',
    availability: ['08:30', '10:30', '16:30'],
    consultationFee: '1000'
  },
  { 
    id: 'dm7', 
    name: 'Dr. Rajesh Patel', 
    email: 'rajesh@hopcare.com', 
    role: UserRole.DOCTOR, 
    specialization: 'Gastroenterologist', 
    qualifications: 'MBBS, DM (Gastro)', 
    experience: '19 Years', 
    hospital: 'Sterling Hospital',
    location: 'Ahmedabad',
    rating: 4.7,
    reviewCount: 1400,
    image: 'https://randomuser.me/api/portraits/men/75.jpg',
    bio: 'Dr. Rajesh Patel is an expert in treating digestive disorders, liver diseases, and performing advanced endoscopic procedures.',
    availability: ['11:00', '13:00', '16:00'],
    consultationFee: '1300'
  },
  { 
    id: 'dm8', 
    name: 'Dr. Mohit Jain', 
    email: 'mohit@hopcare.com', 
    role: UserRole.DOCTOR, 
    specialization: 'Psychiatrist', 
    qualifications: 'MBBS, MD (Psychiatry)', 
    experience: '9 Years', 
    hospital: 'Vimhans Nayati',
    location: 'New Delhi',
    rating: 4.9,
    reviewCount: 670,
    image: 'https://randomuser.me/api/portraits/men/33.jpg',
    bio: 'Dr. Mohit Jain specializes in mental health, treating anxiety, depression, and stress-related disorders with a holistic combination of therapy and medication.',
    availability: ['14:00', '16:00', '18:00'],
    consultationFee: '1500'
  },
  { 
    id: 'dm9', 
    name: 'Dr. Arjun Malhotra', 
    email: 'arjun@hopcare.com', 
    role: UserRole.DOCTOR, 
    specialization: 'Sexologist', 
    qualifications: 'MBBS, MHSc (Sexual Medicine)', 
    experience: '15 Years', 
    hospital: 'Wellness Hub',
    location: 'Mumbai',
    rating: 4.8,
    reviewCount: 540,
    image: 'https://randomuser.me/api/portraits/men/51.jpg',
    bio: 'Dr. Arjun Malhotra provides confidential and expert care for sexual health issues. He is a certified sexologist with extensive experience in counseling.',
    availability: ['10:00', '12:00', '17:00'],
    consultationFee: '2000'
  },
  { 
    id: 'dm10', 
    name: 'Dr. Prakash Iyer', 
    email: 'prakash@hopcare.com', 
    role: UserRole.DOCTOR, 
    specialization: 'ENT Specialist', 
    qualifications: 'MBBS, MS (ENT)', 
    experience: '20 Years', 
    hospital: 'Manipal Hospital',
    location: 'Bangalore',
    rating: 4.6,
    reviewCount: 900,
    image: 'https://randomuser.me/api/portraits/men/62.jpg',
    bio: 'Dr. Prakash Iyer is a senior ENT surgeon specializing in endoscopic sinus surgery, microscopic ear surgery, and voice disorders.',
    availability: ['09:00', '11:00', '14:00'],
    consultationFee: '900'
  },

  // --- FEMALE DOCTORS ---
  { 
    id: 'df1', 
    name: 'Dr. Neha Sharma', 
    email: 'neha@hopcare.com', 
    role: UserRole.DOCTOR, 
    specialization: 'Gynecologist', 
    qualifications: 'MBBS, MS (OBG)', 
    experience: '16 Years', 
    hospital: 'Cloudnine Hospital',
    location: 'Gurugram',
    rating: 4.9,
    reviewCount: 2500,
    image: 'https://randomuser.me/api/portraits/women/44.jpg',
    bio: 'Dr. Neha Sharma is a leading Obstetrician and Gynecologist. She specializes in high-risk pregnancies, infertility treatments, and laparoscopic surgeries.',
    availability: ['10:00', '13:00', '15:00'],
    consultationFee: '1600'
  },
  { 
    id: 'df2', 
    name: 'Dr. Pooja Verma', 
    email: 'pooja@hopcare.com', 
    role: UserRole.DOCTOR, 
    specialization: 'Dermatologist', 
    qualifications: 'MBBS, DDVL', 
    experience: '7 Years', 
    hospital: 'Kaya Skin Clinic',
    location: 'Noida',
    rating: 4.7,
    reviewCount: 600,
    image: 'https://randomuser.me/api/portraits/women/65.jpg',
    bio: 'Dr. Pooja Verma is passionate about skincare and aesthetic medicine. She offers personalized treatments for acne, pigmentation, and skin rejuvenation.',
    availability: ['11:00', '14:00', '16:00'],
    consultationFee: '1100'
  },
  { 
    id: 'df3', 
    name: 'Dr. Anjali Gupta', 
    email: 'anjali@hopcare.com', 
    role: UserRole.DOCTOR, 
    specialization: 'Pediatrician', 
    qualifications: 'MBBS, DCH', 
    experience: '11 Years', 
    hospital: 'Surya Child Care',
    location: 'Mumbai',
    rating: 4.8,
    reviewCount: 1300,
    image: 'https://randomuser.me/api/portraits/women/29.jpg',
    bio: 'Dr. Anjali Gupta is a trusted child specialist known for her friendly demeanor. She has expertise in child nutrition, growth monitoring, and asthma management.',
    availability: ['09:00', '11:00', '17:00'],
    consultationFee: '900'
  },
  { 
    id: 'df4', 
    name: 'Dr. Ritu Singh', 
    email: 'ritu@hopcare.com', 
    role: UserRole.DOCTOR, 
    specialization: 'General Physician', 
    qualifications: 'MBBS, DNB (Family Medicine)', 
    experience: '13 Years', 
    hospital: 'Max Hospital',
    location: 'New Delhi',
    rating: 4.6,
    reviewCount: 950,
    image: 'https://randomuser.me/api/portraits/women/63.jpg',
    bio: 'Dr. Ritu Singh is a dedicated Family Physician providing comprehensive care for all age groups. She focuses on preventive healthcare and chronic disease management.',
    availability: ['08:00', '10:00', '13:00'],
    consultationFee: '700'
  },
  { 
    id: 'df5', 
    name: 'Dr. Sneha Patel', 
    email: 'sneha@hopcare.com', 
    role: UserRole.DOCTOR, 
    specialization: 'Endocrinologist', 
    qualifications: 'MBBS, DM (Endocrinology)', 
    experience: '9 Years', 
    hospital: 'Zydus Hospital',
    location: 'Ahmedabad',
    rating: 4.8,
    reviewCount: 780,
    image: 'https://randomuser.me/api/portraits/women/90.jpg',
    bio: 'Dr. Sneha Patel is an expert in treating hormonal imbalances, including diabetes, thyroid disorders, and PCOD/PCOS.',
    availability: ['10:30', '12:30', '15:30'],
    consultationFee: '1400'
  },
  { 
    id: 'df6', 
    name: 'Dr. Kavita Mehta', 
    email: 'kavita@hopcare.com', 
    role: UserRole.DOCTOR, 
    specialization: 'Ophthalmologist', 
    qualifications: 'MBBS, MS (Ophthalmology)', 
    experience: '14 Years', 
    hospital: 'Sankara Nethralaya',
    location: 'Chennai',
    rating: 4.7,
    reviewCount: 1100,
    image: 'https://randomuser.me/api/portraits/women/33.jpg',
    bio: 'Dr. Kavita Mehta specializes in cataract surgery and laser vision correction. She is committed to restoring and preserving vision for her patients.',
    availability: ['09:00', '11:00', '14:00'],
    consultationFee: '1000'
  },
  { 
    id: 'df7', 
    name: 'Dr. Shreya Jain', 
    email: 'shreya@hopcare.com', 
    role: UserRole.DOCTOR, 
    specialization: 'Cardiologist', 
    qualifications: 'MBBS, MD (Medicine), DM', 
    experience: '12 Years', 
    hospital: 'Asian Heart Institute',
    location: 'Mumbai',
    rating: 4.9,
    reviewCount: 890,
    image: 'https://randomuser.me/api/portraits/women/58.jpg',
    bio: 'Dr. Shreya Jain is a highly skilled non-invasive cardiologist. She specializes in echocardiography and preventive cardiology for women.',
    availability: ['11:00', '13:00', '16:00'],
    consultationFee: '1600'
  },
  { 
    id: 'df8', 
    name: 'Dr. Aarti Malhotra', 
    email: 'aarti@hopcare.com', 
    role: UserRole.DOCTOR, 
    specialization: 'Psychiatrist', 
    qualifications: 'MBBS, MD (Psychiatry)', 
    experience: '15 Years', 
    hospital: 'Fortis Healthcare',
    location: 'Bangalore',
    rating: 4.8,
    reviewCount: 560,
    image: 'https://randomuser.me/api/portraits/women/68.jpg',
    bio: 'Dr. Aarti Malhotra is a compassionate mental health professional. She treats mood disorders, addiction, and provides family counseling.',
    availability: ['12:00', '14:00', '16:00'],
    consultationFee: '1300'
  },
  { 
    id: 'df9', 
    name: 'Dr. Nisha Iyer', 
    email: 'nisha@hopcare.com', 
    role: UserRole.DOCTOR, 
    specialization: 'Neurologist', 
    qualifications: 'MBBS, DM (Neurology)', 
    experience: '10 Years', 
    hospital: 'Kokilaben Hospital',
    location: 'Mumbai',
    rating: 4.7,
    reviewCount: 720,
    image: 'https://randomuser.me/api/portraits/women/8.jpg',
    bio: 'Dr. Nisha Iyer is an expert in headache medicine and neuro-immunology. She is known for her accurate diagnosis and effective treatment plans.',
    availability: ['09:30', '11:30', '15:30'],
    consultationFee: '1700'
  },
  { 
    id: 'df10', 
    name: 'Dr. Priya Kulkarni', 
    email: 'priya@hopcare.com', 
    role: UserRole.DOCTOR, 
    specialization: 'Oncologist', 
    qualifications: 'MBBS, DM (Oncology)', 
    experience: '17 Years', 
    hospital: 'Tata Memorial Centre',
    location: 'Mumbai',
    rating: 4.9,
    reviewCount: 950,
    image: 'https://randomuser.me/api/portraits/women/92.jpg',
    bio: 'Dr. Priya Kulkarni is a renowned Medical Oncologist. She specializes in breast cancer treatment and immunotherapy, offering hope and advanced care.',
    availability: ['10:00', '12:00', '14:00'],
    consultationFee: '2000'
  }
];

export const mockBackend = {
  // --- Auth ---
  login: async (email: string, password: string, role?: UserRole): Promise<User> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // 1. Check if it's a doctor from the static list
    const staticDoc = MOCK_DOCTORS.find(d => d.email === email);
    if (staticDoc) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(staticDoc));
      return staticDoc;
    }
    
    // 2. Check if user exists in our mock "database" (localStorage)
    const storedUsersStr = localStorage.getItem(STORAGE_KEYS.USERS);
    const storedUsers: User[] = storedUsersStr ? JSON.parse(storedUsersStr) : [];
    const foundUser = storedUsers.find(u => u.email === email);

    if (foundUser) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(foundUser));
      return foundUser;
    }

    // 3. User Not Found - enforce registration
    throw new Error('Account not found. Please register an account first.');
  },

  register: async (userData: Partial<User>): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const role = userData.role || UserRole.PATIENT;
    
    const newUser: User = { 
      id: Math.random().toString(36).substr(2, 9), 
      name: userData.name || '', 
      email: userData.email || '', 
      role: role,
      phone: userData.phone,
      // Doctor specific fields
      specialization: role === UserRole.DOCTOR ? (userData.specialization || 'General Physician') : undefined,
      qualifications: role === UserRole.DOCTOR ? userData.qualifications : undefined,
      experience: role === UserRole.DOCTOR ? userData.experience : undefined,
      consultationFee: role === UserRole.DOCTOR ? userData.consultationFee : undefined,
      hospital: role === UserRole.DOCTOR ? 'HopCare Network' : undefined,
      location: role === UserRole.DOCTOR ? 'Online' : undefined,
      rating: role === UserRole.DOCTOR ? 4.5 : undefined,
      reviewCount: role === UserRole.DOCTOR ? 0 : undefined,
      availability: role === UserRole.DOCTOR ? ['09:00', '10:00', '11:00', '14:00'] : undefined
    };
    
    const storedUsersStr = localStorage.getItem(STORAGE_KEYS.USERS);
    const storedUsers: User[] = storedUsersStr ? JSON.parse(storedUsersStr) : [];
    storedUsers.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(storedUsers));

    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(newUser));
    return newUser;
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  },

  getCurrentUser: (): User | null => {
    const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return stored ? JSON.parse(stored) : null;
  },

  getUserById: async (id: string): Promise<User | null> => {
    // 1. Check static doctors
    const staticDoc = MOCK_DOCTORS.find(d => d.id === id);
    if (staticDoc) return staticDoc;

    // 2. Check stored users
    const storedUsersStr = localStorage.getItem(STORAGE_KEYS.USERS);
    const storedUsers: User[] = storedUsersStr ? JSON.parse(storedUsersStr) : [];
    const found = storedUsers.find(u => u.id === id);
    return found || null;
  },

  updateUser: async (userId: string, data: Partial<User>): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const storedUsersStr = localStorage.getItem(STORAGE_KEYS.USERS);
    let storedUsers: User[] = storedUsersStr ? JSON.parse(storedUsersStr) : [];
    let userFound = false;
    
    storedUsers = storedUsers.map(u => {
      if (u.id === userId) {
        userFound = true;
        return { ...u, ...data };
      }
      return u;
    });
    
    if (userFound) {
       localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(storedUsers));
    }

    const currentUserStr = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (currentUserStr) {
      const currentUser = JSON.parse(currentUserStr);
      if (currentUser.id === userId) {
        const updated = { ...currentUser, ...data };
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updated));
        return updated;
      }
    }
    
    throw new Error("User session not found");
  },

  // --- Data Access ---
  getDoctors: async (): Promise<Doctor[]> => {
    const staticDoctors = MOCK_DOCTORS;
    const storedUsersStr = localStorage.getItem(STORAGE_KEYS.USERS);
    const storedUsers: User[] = storedUsersStr ? JSON.parse(storedUsersStr) : [];
    
    const registeredDoctors: Doctor[] = storedUsers
      .filter(u => u.role === UserRole.DOCTOR)
      .map(u => ({
        ...u,
        role: UserRole.DOCTOR,
        specialization: u.specialization || 'General Physician',
        hospital: u.hospital || 'HopCare Network',
        location: u.location || 'Online',
        rating: u.rating || 0,
        reviewCount: u.reviewCount || 0,
        availability: (u as any).availability || ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00']
      } as Doctor));

    return [...staticDoctors, ...registeredDoctors];
  },

  getAppointments: async (userId: string, role: UserRole): Promise<Appointment[]> => {
    const stored = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
    const all: Appointment[] = stored ? JSON.parse(stored) : [];
    
    if (role === UserRole.DOCTOR) {
      return all.filter(a => a.doctorId === userId); 
    }
    return all.filter(a => a.patientId === userId);
  },

  createAppointment: async (appointment: Omit<Appointment, 'id' | 'status'>): Promise<Appointment> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const stored = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
    const all: Appointment[] = stored ? JSON.parse(stored) : [];
    
    const newAppt: Appointment = {
      ...appointment,
      id: Math.random().toString(36).substr(2, 9),
      status: AppointmentStatus.PENDING
    };
    
    all.push(newAppt);
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(all));
    return newAppt;
  },

  updateAppointmentStatus: async (apptId: string, status: AppointmentStatus): Promise<void> => {
    const stored = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
    let all: Appointment[] = stored ? JSON.parse(stored) : [];
    
    all = all.map(a => a.id === apptId ? { ...a, status } : a);
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(all));
  },

  updateAppointmentPrescription: async (apptId: string, prescription: string): Promise<void> => {
    const stored = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
    let all: Appointment[] = stored ? JSON.parse(stored) : [];
    
    all = all.map(a => a.id === apptId ? { ...a, prescription } : a);
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(all));
  },

  // --- AI History ---
  saveAiRecord: async (record: AiRecord): Promise<void> => {
    const stored = localStorage.getItem(STORAGE_KEYS.AI_HISTORY);
    const all: AiRecord[] = stored ? JSON.parse(stored) : [];
    all.unshift(record); 
    localStorage.setItem(STORAGE_KEYS.AI_HISTORY, JSON.stringify(all));
  },

  getAiHistory: async (): Promise<AiRecord[]> => {
    const stored = localStorage.getItem(STORAGE_KEYS.AI_HISTORY);
    return stored ? JSON.parse(stored) : [];
  },

  // --- Notifications ---
  getNotifications: async (userId: string): Promise<any[]> => {
    const stored = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    const all = stored ? JSON.parse(stored) : [];
    return all.filter((n: any) => n.userId === userId).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  createNotification: async (notification: any): Promise<any> => {
    const stored = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    const all = stored ? JSON.parse(stored) : [];
    const newNotif = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      read: false,
      createdAt: new Date().toISOString()
    };
    all.push(newNotif);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(all));
    return newNotif;
  },

  markNotificationAsRead: async (notifId: string): Promise<void> => {
    const stored = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    let all = stored ? JSON.parse(stored) : [];
    all = all.map((n: any) => n.id === notifId ? { ...n, read: true } : n);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(all));
  },
  
  markAllNotificationsAsRead: async (userId: string): Promise<void> => {
    const stored = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    let all = stored ? JSON.parse(stored) : [];
    all = all.map((n: any) => n.userId === userId ? { ...n, read: true } : n);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(all));
  }
};