import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Appointment, AppointmentStatus, UserRole, User } from '../types';
import { Calendar, CheckCircle, XCircle, Clock, User as UserIcon, Bell, Mail, Phone, Plus, X, Loader2, Video } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AVAILABLE_TIME_SLOTS = Array.from({ length: 44 }, (_, i) => {
  const start = 8 * 60 + i * 15;
  const formatTime = (mins: number) => 
    `${Math.floor(mins / 60).toString().padStart(2, '0')}:${(mins % 60).toString().padStart(2, '0')}`;
  return formatTime(start);
});

export const DoctorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [availability, setAvailability] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    // Use local time offset for default date value
    return new Date(today.getTime() - (today.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
  });
  const [savingSlots, setSavingSlots] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<{ user: User, appointment: Appointment } | null>(null);
  const [loadingPatient, setLoadingPatient] = useState(false);
  const [prescriptionText, setPrescriptionText] = useState('');
  const [savingPrescription, setSavingPrescription] = useState(false);

  const fetchAppointments = () => {
    if (user) {
      api.getAppointments(user.id, UserRole.DOCTOR).then(data => {
        setAppointments(prev => {
          if (JSON.stringify(prev) !== JSON.stringify(data)) {
            return data;
          }
          return prev;
        });
      });
    }
  };

  useEffect(() => {
    if (user?.availability) {
      setAvailability(user.availability);
    }
    fetchAppointments();
    const interval = setInterval(fetchAppointments, 3000);
    return () => clearInterval(interval);
  }, [user]);

  const handleStatusChange = async (id: string, status: AppointmentStatus) => {
    await api.updateAppointmentStatus(id, status);
    fetchAppointments();
  };

  const handleNextPatient = async (date: string, time: string) => {
    try {
      await api.nextPatient(date, time);
      fetchAppointments();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleAvailability = async (time: string) => {
    const slotKey = `${selectedDate}_${time}`;
    const newAvailability = availability.includes(slotKey)
      ? availability.filter(t => t !== slotKey)
      : [...availability, slotKey].sort();
    
    setAvailability(newAvailability);
    setSavingSlots(true);
    // Simulate API Delay
    await new Promise(r => setTimeout(r, 500));
    await updateProfile({ availability: newAvailability });
    setSavingSlots(false);
  };

  const handleViewPatient = async (patientId: string, appointment: Appointment) => {
    setLoadingPatient(true);
    // Open modal immediately to show loading state if needed, or wait
    try {
      const patient = await api.getUserById(patientId);
      if (patient) {
        setSelectedPatient({ user: patient, appointment });
      } else {
        // Fallback for ad-hoc users
        setSelectedPatient({
          user: {
            id: patientId,
            name: 'Guest Patient',
            email: 'N/A',
            role: UserRole.PATIENT
          },
          appointment
        });
      }
      setPrescriptionText(appointment.prescription || '');
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPatient(false);
    }
  };

  const handleSavePrescription = async () => {
    if (!selectedPatient) return;
    setSavingPrescription(true);
    try {
      await api.updateAppointmentPrescription(selectedPatient.appointment.id, prescriptionText);
      // Update local state appointments
      setAppointments(prev => prev.map(a => a.id === selectedPatient.appointment.id ? { ...a, prescription: prescriptionText } : a));
        setSelectedPatient(prev => prev ? { ...prev, appointment: { ...prev.appointment, prescription: prescriptionText } } : null);
        alert('Prescription saved successfully.');
      } catch (e) {
        console.error(e);
        alert('Failed to save prescription. Ensure you are using the correct backend API mode.');
      } finally {
      setSavingPrescription(false);
    }
  };

  const pendingCount = appointments.filter(a => a.status === AppointmentStatus.PENDING).length;

  return (
    <div className="space-y-8 relative">
      <div className="animate-slide-up" style={{animationDelay: '0ms'}}>
        <h1 className="text-2xl font-bold text-slate-900">Doctor Dashboard</h1>
        <p className="text-slate-500">Manage your schedule and patient requests.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Column: Stats & Availability */}
        <div className="lg:col-span-1 space-y-6 animate-slide-up" style={{animationDelay: '100ms'}}>
          {/* Pending Stats */}
          <div className={`p-6 rounded-2xl border shadow-sm transition-all ${pendingCount > 0 ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-100' : 'bg-white border-slate-100'}`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className={`text-sm font-medium uppercase ${pendingCount > 0 ? 'text-blue-700' : 'text-slate-500'}`}>Pending Requests</h3>
              {pendingCount > 0 && <Bell className="text-blue-600 animate-bounce" size={18} />}
            </div>
            <div className={`text-3xl font-bold ${pendingCount > 0 ? 'text-blue-700' : 'text-slate-400'}`}>
              {pendingCount}
            </div>
            {pendingCount > 0 && <p className="text-xs text-blue-600 mt-1 font-medium">Action required</p>}
          </div>

           {/* Confirmed Stats */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-slate-500 text-sm font-medium uppercase mb-2">Confirmed Today</h3>
            <div className="text-3xl font-bold text-green-600">
              {appointments.filter(a => a.status === AppointmentStatus.CONFIRMED).length}
            </div>
          </div>

          {/* Availability Management */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Clock size={18} className="text-blue-600" /> My Schedule
              </h3>
              {savingSlots && <Loader2 size={16} className="animate-spin text-blue-600" />}
            </div>
            
            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Select Date</label>
              <input 
                type="date"
                value={selectedDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full p-2 text-sm rounded-lg border border-slate-200 outline-none focus:border-blue-500 bg-slate-50"
              />
            </div>
            
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Available Slots</label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_TIME_SLOTS.map(time => {
                const slotKey = `${selectedDate}_${time}`;
                const isActive = availability.includes(slotKey);
                return (
                  <button
                    key={time}
                    type="button" onClick={(e) => { e.preventDefault(); toggleAvailability(time); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                      isActive 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200' 
                        : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    {time}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-slate-400 mt-4 italic">
              Tap slots to toggle availability for the selected date.
            </p>
          </div>
        </div>

        {/* Right Column: Appointment List */}
        <div className="lg:col-span-3 animate-slide-up" style={{animationDelay: '200ms'}}>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden min-h-[500px]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="font-bold text-slate-900">Appointment Requests</h2>
              {pendingCount > 0 && (
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                  {pendingCount} New
                </span>
              )}
            </div>
            
            {appointments.length === 0 ? (
              <div className="p-10 text-center text-slate-500 flex flex-col items-center justify-center h-64">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                   <Calendar size={24} className="text-slate-300" />
                </div>
                <p>No appointments found.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {appointments.map((appt) => (
                  <div key={appt.id} className={`p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${appt.status === AppointmentStatus.PENDING ? 'bg-blue-50/30' : 'hover:bg-slate-50'}`}>
                    <div className="flex items-start gap-4">
                      <button 
                         onClick={() => handleViewPatient(appt.patientId, appt)}
                         className="w-10 h-10 rounded-full bg-slate-100 hover:bg-blue-100 hover:text-blue-600 transition-colors flex items-center justify-center text-slate-500 shrink-0 overflow-hidden"
                         title="View Patient Details"
                      >
                           {appt.patientImage ? (
                             <img src={appt.patientImage} alt={appt.patientName} className="w-full h-full object-cover" />
                           ) : (
                             <UserIcon size={20} />
                           )}
                      </button>
                      <div>
                        <h4 
                          className="font-bold text-slate-900 hover:text-blue-600 cursor-pointer"
                          onClick={() => handleViewPatient(appt.patientId, appt)}
                        >
                          {appt.patientName}
                        </h4>
                        <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                          <span className="flex items-center gap-1"><Calendar size={14} /> {appt.date}</span>
                          <span className="flex items-center gap-1"><Clock size={14} /> {appt.time}</span>
                        </div>
                        {appt.notes && (
                           <p className="mt-2 text-sm text-slate-600 bg-white border border-slate-200 p-2 rounded shadow-sm">
                             <span className="font-semibold text-slate-800">Note:</span> {appt.notes}
                           </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto mt-4 md:mt-0">
                      {appt.status === AppointmentStatus.PENDING ? (
                        <>
                          <button 
                            onClick={() => handleStatusChange(appt.id, AppointmentStatus.WAITING)}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 w-full sm:w-auto text-sm"
                          >
                            <Plus size={18} /> Add to Queue
                          </button>
                          <button 
                            onClick={() => handleStatusChange(appt.id, AppointmentStatus.CONFIRMED)}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors shadow-lg shadow-green-600/20 w-full sm:w-auto text-sm"
                          >
                            <CheckCircle size={18} /> Confirm
                          </button>
                          <button 
                            onClick={() => handleStatusChange(appt.id, AppointmentStatus.CANCELLED)}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors w-full sm:w-auto text-sm"
                          >
                            <XCircle size={18} /> Decline
                          </button>
                        </>
                      ) : (
                        <div className="flex flex-col gap-2 w-full sm:w-auto">
                          <span className={`px-4 py-2 rounded-lg text-sm font-bold uppercase w-full text-center ${
                            appt.status === AppointmentStatus.ACTIVE ? 'bg-amber-100 text-amber-700' :
                            appt.status === AppointmentStatus.WAITING ? 'bg-blue-100 text-blue-700' :
                            appt.status === AppointmentStatus.CONFIRMED ? 'bg-green-100 text-green-700' :
                            appt.status === AppointmentStatus.CANCELLED ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {appt.status}
                          </span>
                          {(appt.status === AppointmentStatus.CONFIRMED || appt.status === AppointmentStatus.ACTIVE || appt.status === AppointmentStatus.WAITING) && (
                            <>
                              <button
                                onClick={() => navigate(`/consultation/${appt.id}`)}
                                className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 w-full"
                              >
                                <Video size={18} /> {appt.status === AppointmentStatus.WAITING ? 'Join Room' : 'Join Call'}
                              </button>
                            </>
                          )}
                          
                          {appt.status === AppointmentStatus.ACTIVE && (
                            <button
                              onClick={() => handleNextPatient(appt.date, appt.time)}
                              className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors shadow-lg shadow-green-600/20 w-full text-sm"
                            >
                              <UserIcon size={18} /> Next in Queue
                            </button>
                          )}

                          {appt.status === AppointmentStatus.WAITING && (
                            <button
                              onClick={() => handleStatusChange(appt.id, AppointmentStatus.ACTIVE)}
                              className="flex items-center justify-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors shadow-lg shadow-amber-500/20 w-full text-sm"
                            >
                              <UserIcon size={18} /> Make Active
                            </button>
                          )}
                          
                          {appt.status !== AppointmentStatus.COMPLETED && appt.status !== AppointmentStatus.CANCELLED && (
                            <button
                                onClick={() => handleStatusChange(appt.id, AppointmentStatus.COMPLETED)}
                                className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 hover:text-slate-900 rounded-lg font-medium hover:bg-slate-200 transition-colors w-full text-xs"
                              >
                                Mark Completed
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Patient Details Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedPatient(null)}>
           <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-slide-up relative" onClick={e => e.stopPropagation()}>
              <div className="bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-start">
                  <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-blue-600 border border-slate-200 shadow-sm overflow-hidden">
                          {selectedPatient.user.image ? (
                             <img src={selectedPatient.user.image} alt={selectedPatient.user.name} className="w-full h-full object-cover" />
                          ) : (
                             <UserIcon size={32} />
                          )}
                      </div>
                      <div>
                          <h3 className="text-xl font-bold text-slate-900">{selectedPatient.user.name}</h3>
                          <span className="text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Patient</span>
                      </div>
                  </div>
                  <button onClick={() => setSelectedPatient(null)} className="text-slate-400 hover:text-slate-600">
                      <X size={20} />
                  </button>
              </div>
              <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                      <Mail className="text-slate-400" size={20} />
                      <div>
                          <p className="text-xs text-slate-500 uppercase font-bold">Email</p>
                          <p className="text-slate-900 font-medium">{selectedPatient.user.email}</p>
                      </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                      <Phone className="text-slate-400" size={20} />
                      <div>
                          <p className="text-xs text-slate-500 uppercase font-bold">Phone</p>
                          <p className="text-slate-900 font-medium">{selectedPatient.user.phone || 'Not Provided'}</p>
                      </div>
                  </div>
                  
                  {/* Prescription Section */}
                  <div className="mt-6">
                    <h4 className="font-bold text-slate-900 mb-2">Prescription / Remarks</h4>
                    <textarea 
                        value={prescriptionText}
                        onChange={(e) => setPrescriptionText(e.target.value)}
                        placeholder="Write medical prescription, advice, or remarks here..."
                        className="w-full min-h-[120px] p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none resize-y text-slate-700 text-sm"
                    />
                  </div>
              </div>
              <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
                  <button 
                      onClick={() => setSelectedPatient(null)}
                      className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-100 transition-colors"
                  >
                      Close
                  </button>
                  <button 
                      onClick={handleSavePrescription}
                      disabled={savingPrescription}
                      className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                      {savingPrescription && <Loader2 size={16} className="animate-spin" />}
                      Save Prescription
                  </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

