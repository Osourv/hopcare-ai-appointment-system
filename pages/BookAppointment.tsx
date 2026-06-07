import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { Doctor, AppointmentDocument } from '../types';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Calendar, User, CheckCircle, Search, X, Stethoscope, Loader2, GraduationCap, Clock, MapPin, Building2, Star, Briefcase, ArrowRight, Wallet, Sunrise, Sun, Moon, ChevronDown, UploadCloud, FileText, File, Trash2 } from 'lucide-react';

export const BookAppointment: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [viewingDoctor, setViewingDoctor] = useState<Doctor | null>(null); // State for View More Modal
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');
  const [documents, setDocuments] = useState<AppointmentDocument[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecialist, setFilterSpecialist] = useState('');
  
  // Custom Date/Time Select States
  const [dateList, setDateList] = useState<{date: Date; label: string; dayStr: string; dateStr: string}[]>([]);
  const [timeFilter, setTimeFilter] = useState<'morning' | 'afternoon' | 'night' | 'all'>('all');

  useEffect(() => {
    if (!selectedDoctor) return;

    let availableDates = new Set<string>();
    let hasLegacy = false; 
    
    if (selectedDoctor.availability) {
      selectedDoctor.availability.forEach(slot => {
        if (slot.includes('_')) {
          availableDates.add(slot.split('_')[0]); // Add YYYY-MM-DD
        } else {
          hasLegacy = true; 
        }
      });
    }

    const newDateList: {date: Date; label: string; dayStr: string; dateStr: string}[] = [];
    const todayStr = new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().split('T')[0];

    const sortedDates = Array.from(availableDates).sort();
    
    if (sortedDates.length === 0 && hasLegacy) {
        sortedDates.push(todayStr); // Fallback to today if there is legacy HH:MM data but no dates
    } 

    sortedDates.forEach(dateStr => {
      const [year, month, day] = dateStr.split('-').map(Number);
      const localD = new Date(year, month - 1, day);
      
      const todayLocal = new Date();
      todayLocal.setHours(0,0,0,0);
      
      const diffTime = localD.getTime() - todayLocal.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      
      let label = localD.toLocaleDateString('en-US', { weekday: 'short' });
      if (diffDays === 0) label = 'Today';
      else if (diffDays === 1) label = 'Tomorrow';

      newDateList.push({
          date: localD,
          label,
          dayStr: localD.getDate().toString(),
          dateStr: dateStr
      });
    });

    setDateList(newDateList);
    setSelectedDate(prev => {
      // If no valid dates anymore, clear it
      if (newDateList.length === 0) return '';
      // If the currently selected date is still available for this doctor, keep it!
      if (prev && newDateList.some(d => d.dateStr === prev)) return prev;
      // Otherwise, default to the first available date
      return newDateList[0].dateStr;
    });
  }, [selectedDoctor]);

  useEffect(() => {
    let isMounted = true;

    const fetchDocs = () => {
      api.getDoctors().then(data => {
        if (!isMounted) return;
        setDoctors(data);
        
        // Auto-update selected doctor to reflect new availability seamlessly
        setSelectedDoctor(prev => {
          if (!prev) return prev;
          const currentDoc = data.find(d => d.id === prev.id);
          return currentDoc || prev;
        });

      }).catch(console.error);
    };

    setFetching(true);
    // Initial fetch
    api.getDoctors().then(data => {
      if (!isMounted) return;
      setDoctors(data);
      if (location.state?.specialist) {
        setFilterSpecialist(location.state.specialist);
        setSearchTerm(location.state.specialist);
      }
      setFetching(false);
    });

    // Cleanly poll every 3 seconds to keep slots purely synced without refreshing
    const interval = setInterval(fetchDocs, 3000);
    
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [location.state]);

  const readFileAsBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const newDocs: AppointmentDocument[] = [];
    for (const file of Array.from(files)) {
      if (!allowed.includes(file.type)) { alert(`${file.name}: unsupported file type.`); continue; }
      if (file.size > 5 * 1024 * 1024) { alert(`${file.name}: exceeds 5MB limit.`); continue; }
      if (documents.length + newDocs.length >= 5) { alert('Maximum 5 files allowed.'); break; }
      const data = await readFileAsBase64(file);
      newDocs.push({ name: file.name, type: file.type, data, uploadedAt: new Date().toISOString() });
    }
    setDocuments(prev => [...prev, ...newDocs]);
  };

  const loadRazorpayScript = (): Promise<boolean> =>
    new Promise(resolve => {
      if (document.getElementById('razorpay-script')) return resolve(true);
      const script = document.createElement('script');
      script.id = 'razorpay-script';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handleBooking = async () => {
    if (!user || !selectedDoctor || !selectedDate || !selectedTime) return;

    setLoading(true);
    try {
      const fee = selectedDoctor.consultationFee ? Number(selectedDoctor.consultationFee) : 800;
      const appointmentData = {
        patientId: user.id,
        patientName: user.name,
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        date: selectedDate,
        time: selectedTime,
        notes: notes ? notes.trim() : '',
        documents,
      };

      const order = await api.createPaymentOrder(fee);
      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error('Failed to load payment gateway. Check your internet connection.');

      setLoading(false);

      const options: any = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'HopCare',
        description: `Consultation with ${selectedDoctor.name}`,
        order_id: order.orderId,
        prefill: {
          name: user.name,
          email: user.email || '',
          contact: (user as any).phone || '9876543210',
        },
        notes: {
          doctor: selectedDoctor.name,
          date: selectedDate,
          time: selectedTime,
        },
        theme: { color: '#2563eb' },
        handler: async (response: any) => {
          setLoading(true);
          try {
            await api.verifyPaymentAndBook({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              appointmentData,
            });
            setStep(3);
          } catch (err: any) {
            alert('Payment succeeded but booking failed: ' + (err.message || 'Please contact support.'));
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => setLoading(false),
          confirm_close: true,
        },
      };

      // @ts-ignore — Razorpay loaded via CDN script
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response: any) => {
        alert('Payment failed: ' + response.error.description);
        setLoading(false);
      });
      rzp.open();
    } catch (e: any) {
      console.error(e);
      alert(e.message || 'Could not initiate payment. Please try again.');
      setLoading(false);
    }
  };

  const filteredDoctors = doctors.filter(doc => {
    const term = searchTerm.toLowerCase();
    const name = doc.name?.toLowerCase() || '';
    const spec = doc.specialization?.toLowerCase() || '';
    return name.includes(term) || spec.includes(term);
  });

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 mb-6 animate-fade-in">Book an Appointment</h1>

      {/* Steps Indicator */}
      <div className="flex items-center mb-8 animate-fade-in">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
              step >= s ? 'bg-blue-600 text-white scale-110' : 'bg-slate-200 text-slate-500'
            }`}>
              {s}
            </div>
            {s < 3 && <div className={`w-12 sm:w-24 h-1 mx-2 transition-colors duration-300 ${step > s ? 'bg-blue-600' : 'bg-slate-200'}`} />}
          </div>
        ))}
        <div className="ml-4 text-sm font-medium text-slate-600 animate-fade-in">
          {step === 1 && "Select Doctor"}
          {step === 2 && "Choose Time"}
          {step === 3 && "Confirmation"}
        </div>
      </div>

      {step === 1 && (
        <div className="space-y-6 animate-slide-in-right">
          {/* Search / Filter Bar */}
          <div className="relative">
             <Search className="absolute left-3 top-3.5 text-slate-400" size={20} />
             <input 
              type="text" 
              placeholder="Search by doctor name or specialization (e.g. Cardiologist)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all shadow-sm"
             />
             {searchTerm && (
               <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
               >
                 <X size={20} />
               </button>
             )}
          </div>

          {filterSpecialist && searchTerm === filterSpecialist && (
            <div className="bg-blue-50 text-blue-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2 animate-fade-in">
              <CheckCircle size={16} />
              Showing recommended specialists for your condition.
              <button onClick={() => { setFilterSpecialist(''); setSearchTerm(''); }} className="text-blue-900 underline hover:no-underline font-medium ml-1">
                Show all
              </button>
            </div>
          )}

          {fetching ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <Loader2 className="animate-spin mb-2" size={32} />
              <p>Loading available doctors...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredDoctors.length > 0 ? (
                filteredDoctors.map(doc => (
                  <div 
                    key={doc.id}
                    className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden"
                  >
                    <div className="p-6 flex flex-col md:flex-row gap-8">
                      {/* Left: Image */}
                      <div className="flex flex-col items-center shrink-0">
                         <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-blue-100 p-1 mb-2 shrink-0">
                           <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
                             {doc.image ? (
                               <img src={doc.image} alt={doc.name} className="w-full h-full object-cover" />
                             ) : (
                               <User size={64} className="text-slate-300" />
                             )}
                           </div>
                         </div>
                      </div>

                      {/* Right: Content */}
                      <div className="flex-1">
                        {/* Header Row */}
                        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                              {doc.name}
                              <span className="text-sm font-normal text-slate-500">({doc.specialization})</span>
                            </h3>
                            <div className="mt-1 flex items-center gap-2">
                               <div className="flex items-center bg-green-50 px-2 py-0.5 rounded border border-green-100">
                                  <span className="font-bold text-sm text-green-700">{doc.rating || '4.5'}</span>
                                  <div className="flex ml-1">
                                    {[1,2,3,4].map(i => <Star key={i} size={10} className="fill-green-600 text-green-600" />)}
                                    <Star size={10} className="fill-green-600 text-green-600 opacity-50" />
                                  </div>
                               </div>
                               <span className="text-xs text-slate-500 border-b border-dashed border-slate-300 cursor-pointer">{doc.reviewCount || '100+'} Reviews</span>
                            </div>
                          </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-8 mb-6">
                           <div className="flex items-start gap-3">
                              <CheckCircle size={18} className="text-slate-400 mt-0.5" />
                              <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase">Specialty</p>
                                <p className="text-sm font-medium text-slate-700">{doc.specialization} Treatment</p>
                              </div>
                           </div>
                           
                           <div className="flex items-start gap-3">
                              <Building2 size={18} className="text-slate-400 mt-0.5" />
                              <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase">Hospital</p>
                                <p className="text-sm font-medium text-slate-700">{doc.hospital || 'HopCare Main Clinic'}</p>
                              </div>
                           </div>

                           <div className="flex items-start gap-3">
                              <Briefcase size={18} className="text-slate-400 mt-0.5" />
                              <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase">Experience</p>
                                <p className="text-sm font-medium text-slate-700">{doc.experience || '10 Years'}</p>
                              </div>
                           </div>

                           <div className="flex items-start gap-3">
                              <MapPin size={18} className="text-slate-400 mt-0.5" />
                              <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase">Location</p>
                                <p className="text-sm font-medium text-slate-700">{doc.location || 'Gurugram'}</p>
                              </div>
                           </div>
                        </div>

                        {/* Bio */}
                        <div className="mb-6">
                          <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">
                            {doc.bio || `${doc.name} is a highly qualified ${doc.specialization} with years of experience in treating complex cases. Dedicated to patient care and well-being.`}
                          </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-4">
                           <button 
                             onClick={() => setViewingDoctor(doc)}
                             className="flex-1 sm:flex-none bg-white border border-rose-400 text-rose-500 hover:bg-rose-50 px-6 py-2.5 rounded-lg font-medium transition-colors text-sm"
                           >
                             View More <ArrowRight size={14} className="inline ml-1" />
                           </button>
                           <button 
                             onClick={() => { setSelectedDoctor(doc); setStep(2); }}
                             className="flex-1 sm:flex-none bg-blue-900 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-800 transition-colors shadow-lg shadow-blue-900/10 text-sm"
                           >
                             Book Appointment
                           </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <User size={48} className="mx-auto text-slate-300 mb-3" />
                  <p className="font-medium text-lg text-slate-600">No doctors found matching "{searchTerm}"</p>
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="mt-4 text-blue-600 font-bold text-sm hover:underline"
                  >
                    Clear Search
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* VIEW MORE MODAL */}
      {viewingDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setViewingDoctor(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up relative" onClick={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <button 
              onClick={() => setViewingDoctor(null)}
              className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors z-10"
            >
              <X size={20} className="text-slate-600" />
            </button>

            {/* Header Section */}
            <div className="relative">
              {/* Background pattern */}
              <div className="h-32 bg-gradient-to-r from-blue-600 to-blue-800 relative overflow-hidden">
                 <div className="absolute inset-0 opacity-10">
                    <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
                    </svg>
                 </div>
              </div>
              <div className="px-6 md:px-8 -mt-12 flex flex-col md:flex-row gap-6 items-center md:items-end">
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white shadow-lg bg-white overflow-hidden shrink-0">
                    {viewingDoctor.image ? (
                      <img src={viewingDoctor.image} alt={viewingDoctor.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
                          <User size={48} />
                      </div>
                    )}
                  </div>
                  <div className="text-center md:text-left pb-4 flex-1">
                    <h2 className="text-2xl font-bold text-slate-900">{viewingDoctor.name}</h2>
                    <p className="text-blue-600 font-medium flex items-center justify-center md:justify-start gap-1">
                      <Stethoscope size={16} /> {viewingDoctor.specialization}
                    </p>
                  </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 md:p-8 space-y-6">
                {/* Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-6 border-b border-slate-100">
                  <div className="text-center p-3 bg-slate-50 rounded-xl">
                      <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Experience</p>
                      <p className="font-semibold text-slate-900 text-sm md:text-base">{viewingDoctor.experience || 'N/A'}</p>
                  </div>
                  <div className="text-center p-3 bg-slate-50 rounded-xl">
                      <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Rating</p>
                      <div className="flex items-center justify-center gap-1 font-semibold text-slate-900 text-sm md:text-base">
                        {viewingDoctor.rating || 4.5} <Star size={14} className="fill-yellow-400 text-yellow-400" />
                      </div>
                  </div>
                  <div className="text-center p-3 bg-slate-50 rounded-xl">
                      <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Patients</p>
                      <p className="font-semibold text-slate-900 text-sm md:text-base">{viewingDoctor.reviewCount || '100'}+</p>
                  </div>
                  <div className="text-center p-3 bg-slate-50 rounded-xl">
                      <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Fee</p>
                      <p className="font-semibold text-slate-900 text-sm md:text-base">{viewingDoctor.consultationFee ? `₹${viewingDoctor.consultationFee}` : '₹800'}</p>
                  </div>
                </div>

                {/* About */}
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                    <User size={20} className="text-blue-500" /> About Doctor
                  </h3>
                  <p className="text-slate-600 leading-relaxed text-sm md:text-base">
                    {viewingDoctor.bio || `Dr. ${viewingDoctor.name} is a dedicated specialist with extensive experience in ${viewingDoctor.specialization}. Committed to providing excellent patient care and known for a compassionate approach.`}
                  </p>
                </div>

                {/* Details */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white border border-slate-100 p-4 rounded-xl flex items-start gap-3 shadow-sm hover:border-blue-200 transition-colors">
                      <Building2 className="text-blue-500 mt-1 shrink-0" size={20} />
                      <div>
                        <p className="font-bold text-slate-900 text-sm">Hospital</p>
                        <p className="text-sm text-slate-500">{viewingDoctor.hospital || 'HopCare Main Center'}</p>
                      </div>
                  </div>
                  <div className="bg-white border border-slate-100 p-4 rounded-xl flex items-start gap-3 shadow-sm hover:border-blue-200 transition-colors">
                      <MapPin className="text-red-500 mt-1 shrink-0" size={20} />
                      <div>
                        <p className="font-bold text-slate-900 text-sm">Location</p>
                        <p className="text-sm text-slate-500">{viewingDoctor.location || 'New Delhi'}</p>
                      </div>
                  </div>
                    <div className="bg-white border border-slate-100 p-4 rounded-xl flex items-start gap-3 shadow-sm hover:border-blue-200 transition-colors">
                      <GraduationCap className="text-purple-500 mt-1 shrink-0" size={20} />
                      <div>
                        <p className="font-bold text-slate-900 text-sm">Education</p>
                        <p className="text-sm text-slate-500">{viewingDoctor.qualifications || 'MBBS, MD'}</p>
                      </div>
                  </div>
                  <div className="bg-white border border-slate-100 p-4 rounded-xl flex items-start gap-3 shadow-sm hover:border-blue-200 transition-colors">
                      <Wallet className="text-emerald-500 mt-1 shrink-0" size={20} />
                      <div>
                        <p className="font-bold text-slate-900 text-sm">Consultation Fee</p>
                        <p className="text-sm text-slate-500">{viewingDoctor.consultationFee ? `₹${viewingDoctor.consultationFee}` : '₹800'}</p>
                      </div>
                  </div>
                </div>

                {/* Action */}
                <div className="pt-4 flex gap-4">
                  <button 
                    onClick={() => setViewingDoctor(null)}
                    className="flex-1 py-3 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    Close
                  </button>
                  <button 
                    onClick={() => {
                      setSelectedDoctor(viewingDoctor);
                      setViewingDoctor(null);
                      setStep(2);
                    }}
                    className="flex-[2] py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
                  >
                    Book Appointment
                  </button>
                </div>
            </div>
          </div>
        </div>
      )}

      {step === 2 && selectedDoctor && (
        <div className="bg-[#0f1f38] rounded-[2rem] shadow-sm animate-slide-in-right overflow-hidden border border-[#1a2c4a]">
          
          <div className="px-6 pt-6 pb-4">
             {/* Header */}
             <div className="flex items-center gap-4 mb-6">
                <button onClick={() => setStep(1)} className="text-white hover:text-slate-200">
                  <ArrowRight className="rotate-180" size={24} />
                </button>
                <h2 className="text-2xl font-bold text-white tracking-wide">Consultation Summary</h2>
             </div>

             {/* Doctor Card */}
             <div className="bg-gradient-to-b from-white to-[#f4fbf7] p-4 rounded-3xl flex gap-5 shadow-lg">
                 <div className="w-24 h-28 bg-slate-100 rounded-2xl overflow-hidden shrink-0 shadow-inner">
                   {selectedDoctor.image ? (
                     <img src={selectedDoctor.image} alt={selectedDoctor.name} className="w-full h-full object-cover" />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center text-slate-300">
                         <User size={32} />
                     </div>
                   )}
                 </div>
                 <div className="flex flex-col justify-center">
                     <h3 className="text-[17px] font-bold text-[#2d3748] mb-0.5">{selectedDoctor.name}</h3>
                     <p className="text-[13px] text-slate-500 font-medium mb-2">{selectedDoctor.specialization}</p>
                     
                     {selectedDate && selectedTime && (
                       <p className="text-[13px] text-[#2d3748] mb-1.5 font-medium">
                         Time: {dateList.find(d => d.dateStr === selectedDate)?.label === 'Today' || dateList.find(d => d.dateStr === selectedDate)?.label === 'Tomorrow' ? dateList.find(d => d.dateStr === selectedDate)?.label : new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}, {
                           (() => {                               if (selectedTime.includes('-')) return selectedTime;                             const [h, m] = selectedTime.split(':');
                             const hi = parseInt(h, 10);
                             return `${(hi % 12 || 12).toString().padStart(2, '0')}:${m} ${hi >= 12 ? 'PM' : 'AM'}`;
                           })()
                         }
                       </p>
                     )}
                     
                     <div className="text-[13px] text-slate-500 flex flex-wrap gap-x-2 gap-y-1">
                          {selectedDoctor.experience && (
                             <span>{selectedDoctor.experience.replace(' years', ' years Exp')}</span>
                          )}
                          {selectedDoctor.experience && selectedDoctor.qualifications && <span>•</span>}
                          {selectedDoctor.qualifications ? (
                             <span>{selectedDoctor.qualifications}</span>
                          ) : (
                             <span>M.B.B.S</span>
                          )}
                     </div>
                     <p className="text-[13px] text-slate-500 mt-1">Speaks: Hindi, English, Telugu...</p>
                 </div>
             </div>
          </div>
          
          {/* Bottom Section - White Card */}
          <div className="bg-white rounded-t-[2rem] p-6 pb-8 mt-2 min-h-[500px]">
            <h3 className="text-xl font-bold text-[#2d3748] mb-5">Select your preferred slot</h3>
            
            {/* Date Carousel */}
            <div className="flex overflow-x-auto gap-4 pb-4 snap-x hide-scrollbar -mx-2 px-2">
              {dateList.length > 0 ? (
                dateList.map((dt, idx) => {
                  const isSelected = selectedDate === dt.dateStr;
                  return (
                    <button
                      key={idx}
                      type="button" onClick={(e) => { e.preventDefault(); setSelectedDate(dt.dateStr); setSelectedTime(''); }}
                      className={`snap-start min-w-[70px] flex flex-col items-center justify-center transition-all relative ${
                          isSelected 
                          ? 'bg-[#333b45] text-white rounded-xl py-3 shadow-md' 
                          : 'bg-transparent text-slate-600 hover:bg-slate-50 rounded-xl py-3'
                      }`}
                    >
                      <span className={`text-[13px] mb-1 font-medium ${isSelected ? 'text-slate-200' : 'text-slate-500'}`}>{dt.label}</span>
                      <span className={`text-xl font-bold ${isSelected ? 'text-white' : 'text-[#2d3748]'}`}>{dt.dayStr}</span>
                      {/* Fake border line on the right for non-selected items */}
                      {!isSelected && idx !== dateList.length - 1 && (
                        <div className="absolute right-[-8px] top-[20%] bottom-[20%] w-[1px] bg-slate-200"></div>
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="w-full text-center text-slate-500 py-4 font-medium bg-slate-50 rounded-xl border border-slate-100">
                  No dates available at the moment
                </div>
              )}
            </div>

            {/* Time Filters */}
            <div className="flex gap-3 my-6 justify-start overflow-x-auto hide-scrollbar">
                 {['all', 'night', 'morning', 'afternoon'].map((filter) => {
                   const isSelected = timeFilter === filter;
                   return (
                     <button 
                       key={filter}
                       onClick={() => setTimeFilter(filter as any)}
                       className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-[1.5rem] text-sm font-semibold transition-colors border shrink-0 ${
                         isSelected 
                          ? 'border-teal-600 text-teal-700 bg-teal-50/10 shadow-[0_0_0_1px_rgba(13,148,136,0.3)]' 
                          : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                       }`}
                     >
                       {filter === 'all' && <CheckCircle size={16} className={isSelected ? "text-teal-600" : "text-slate-500"} />}
                       {filter === 'night' && <Moon size={16} className={isSelected ? "text-teal-600" : "text-slate-500"} />}
                       {filter === 'morning' && <Sunrise size={16} className={isSelected ? "text-teal-600" : "text-slate-600"} />}
                       {filter === 'afternoon' && <Sun size={16} className={isSelected ? "text-teal-600" : "text-slate-600"} />}
                       <span className={isSelected ? "text-teal-800" : "text-slate-700"}>
                          {filter.charAt(0).toUpperCase() + filter.slice(1)}
                       </span>
                     </button>
                   );
                 })}
            </div>
            
            {/* Time Slots Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-6">
              {selectedDoctor.availability && selectedDate ? (
                selectedDoctor.availability
                  .filter(slot => slot.startsWith(selectedDate)) // support both formats safely
                  .filter(slot => {
                    if (timeFilter === 'all') return true;
                    // Extract time
                    const timeOnly = slot.includes('_') ? slot.split('_')[1] : slot;
                    const hour = parseInt(timeOnly.split(':')[0], 10);
                    let timeCategory = 'night';
                    if (hour >= 5 && hour < 12) timeCategory = 'morning';
                    else if (hour >= 12 && hour < 17) timeCategory = 'afternoon';
                    return timeFilter === timeCategory;
                  })
                  .map(slot => {
                    const timeOnly = slot.includes('_') ? slot.split('_')[1] : slot;
                    const isSelected = selectedTime === timeOnly;
                    
// Format to AM/PM handling 15min slots
                    const [h, m] = timeOnly.split(':');
                    if (!h || !m || timeOnly.includes('-')) return null;
                    const hi = parseInt(h, 10);
                    const ampm = hi >= 12 ? 'PM' : 'AM';
                    let displayHour = hi % 12;
                    if (displayHour === 0) displayHour = 12;
                    const displayTime = `${displayHour}:${m} ${ampm}`;

                    return (
                        <button
                          key={timeOnly}
                          type="button" onClick={(e) => { e.preventDefault(); setSelectedTime(timeOnly); }}
                          className={`py-3 rounded-[12px] text-[15px] font-bold transition-all border ${
                            isSelected
                              ? 'border-teal-700 bg-[#16887e] text-white shadow-md'
                              : 'border-slate-200 bg-white text-[#2d3748] hover:border-slate-300'
                          }`}
                        >
                          {displayTime}
                        </button>
                    );
                  })
              ) : (
                <div className="col-span-full text-center text-slate-500 py-8">
                   {!selectedDate ? 'Please select a date first' : 'No slots available on this date'}
                </div>
              )}
            </div>

            {selectedDoctor.availability && selectedDoctor.availability.filter(slot => slot.startsWith(selectedDate)).length > 0 && (
                <button className="w-full flex items-center justify-center gap-2 text-teal-700 font-bold text-sm my-6 hover:underline">
                  View More Slots <ChevronDown size={18} />
                </button>
            )}

            {/* Note and Submit */}
            <div className="mt-8 border-t border-slate-100 pt-6">
               <textarea
                 value={notes}
                 onChange={(e) => setNotes(e.target.value)}
                 className="w-full p-4 rounded-xl border border-slate-200 outline-none focus:border-teal-600 h-20 resize-none mb-4 text-sm"
                 placeholder="Reason for visit (Optional)"
               />

               {/* Document Upload */}
               <div className="mb-6">
                 <p className="text-sm font-semibold text-slate-700 mb-2">Upload Previous Reports / Prescriptions <span className="text-slate-400 font-normal">(Optional, max 5 files · 5MB each)</span></p>
                 <input ref={fileInputRef} type="file" multiple accept=".jpg,.jpeg,.png,.pdf,.doc,.docx" className="hidden" onChange={e => handleFiles(e.target.files)} />

                 {/* Dropzone */}
                 <div
                   onClick={() => fileInputRef.current?.click()}
                   onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                   onDragLeave={() => setDragOver(false)}
                   onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
                   className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${dragOver ? 'border-teal-500 bg-teal-50' : 'border-slate-300 hover:border-teal-400 hover:bg-slate-50'}`}
                 >
                   <UploadCloud size={28} className="mx-auto text-slate-400 mb-2" />
                   <p className="text-sm text-slate-500">Drag & drop files here or <span className="text-teal-600 font-semibold">click to browse</span></p>
                   <p className="text-xs text-slate-400 mt-1">PDF, JPG, PNG, DOC supported</p>
                 </div>

                 {/* Uploaded Files List */}
                 {documents.length > 0 && (
                   <div className="mt-3 space-y-2">
                     {documents.map((doc, i) => (
                       <div key={i} className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-2.5">
                         {doc.type === 'application/pdf' ? <FileText size={18} className="text-red-500 shrink-0" /> : doc.type.startsWith('image/') ? <File size={18} className="text-blue-500 shrink-0" /> : <File size={18} className="text-slate-400 shrink-0" />}
                         <span className="flex-1 text-sm text-slate-700 truncate">{doc.name}</span>
                         <button onClick={() => setDocuments(prev => prev.filter((_, j) => j !== i))} className="text-slate-400 hover:text-red-500 transition-colors">
                           <Trash2 size={16} />
                         </button>
                       </div>
                     ))}
                   </div>
                 )}
               </div>

<button
                 onClick={handleBooking}
                 disabled={!selectedDate || !selectedTime || loading}
                 className="w-full bg-[#16887e] text-white py-4 rounded-[14px] font-bold disabled:opacity-50 hover:bg-teal-700 transition-colors shadow-lg shadow-teal-700/20 text-lg flex items-center justify-center gap-3"
               >
                 {loading ? (
                   <><Loader2 className="animate-spin" size={20} /> Processing...</>
                 ) : (
                   <>
                     <Wallet size={20} />
                     Pay ₹{selectedDoctor.consultationFee || 800} & Confirm
                   </>
                 )}
               </button>

            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="bg-white p-12 rounded-2xl border border-slate-100 shadow-sm text-center max-w-lg mx-auto animate-slide-in-right">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto mb-6">
            <CheckCircle size={40} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Booking Confirmed!</h2>
          <p className="text-slate-500 mb-8">
            Your appointment with <span className="font-semibold text-slate-700">{selectedDoctor?.name}</span> is scheduled for <br/>
            <span className="text-slate-900 font-medium">{selectedDate} at {selectedTime}</span>.
          </p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="bg-slate-900 text-white px-8 py-3 rounded-xl font-semibold hover:bg-slate-800 transition-colors w-full sm:w-auto"
          >
            Go to Dashboard
          </button>
        </div>
      )}
    </div>
  );
};


















