import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Appointment, AiRecord, AppointmentStatus, UserRole, Doctor } from '../types';
import { Calendar, Clock, MapPin, Activity, BrainCircuit, ArrowRight, X, FileText, User, Stethoscope, CheckCircle, AlertCircle, Trash2, Loader2, AlertTriangle, Video, Download, Paperclip } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';

export const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [aiHistory, setAiHistory] = useState<AiRecord[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [queueInfo, setQueueInfo] = useState<Record<string, { position: number; waitTime: number; isActive: boolean }>>({});
  
  // Cancel Logic State
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Notes editing state
  const [notesInput, setNotesInput] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);
  const [notesSaveError, setNotesSaveError] = useState('');

  // Document upload state
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const docInputRef = React.useRef<HTMLInputElement>(null);

  // Memoize fetch function to reuse it
  const fetchData = useCallback(async () => {
    if (user) {
      try {
        const [appts, history, docs] = await Promise.all([
          api.getAppointments(user.id, UserRole.PATIENT),
          api.getAiHistory(),
          api.getDoctors().catch(() => [])
        ]);
        setAppointments(appts);
        setAiHistory(history);
        setDoctors(docs);

        const q: Record<string, { position: number; waitTime: number; isActive: boolean }> = {};
        for (const a of appts) {
          if (a.status === AppointmentStatus.WAITING || a.status === AppointmentStatus.ACTIVE) {
            try {
              const info = await api.getQueueStatus(a.id);
              q[a.id] = info;
            } catch (e) {
              console.error("Failed to fetch queue info", e);
            }
          }
        }
        setQueueInfo(q);
      } catch (e) {
        console.error("Failed to load dashboard data", e);
      }
    }
  }, [user]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Reset confirmation state when modal closes or changes
  useEffect(() => {
    setShowCancelModal(false);
    setIsProcessing(false);
    setNotesInput(selectedAppointment?.notes || '');
    setNotesSaved(false);
    setNotesSaveError('');
  }, [selectedAppointment]);

  const upcomingAppointments = appointments.filter(a => a.status !== AppointmentStatus.CANCELLED && a.status !== AppointmentStatus.COMPLETED);
  const completedAppointments = appointments.filter(a => a.status === AppointmentStatus.COMPLETED);

  const handleDownloadPrescription = (prescription: string, doctorName: string, date: string) => {
    const doc = new jsPDF();
    
    // Config colors
    const brandColor = [0, 102, 102];
    const textColor = [40, 40, 40];
    const secondaryColor = [80, 80, 80];
    
    // Emulated Logos
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(37, 99, 235); // Blue color like PharmEasy
    doc.text("HopCare", 20, 25);
    
    doc.setFontSize(16);
    doc.setTextColor(100, 100, 200);
    doc.text("Doctor Consult", 140, 23);
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text("powered by HopCare", 140, 28);
    
    // Subheader
    doc.setFontSize(12);
    doc.setTextColor(37, 99, 235);
    doc.text("Consulted Online", 105, 40, { align: "center" });
    doc.setLineWidth(0.5);
    doc.setDrawColor(37, 99, 235);
    doc.line(85, 41, 125, 41);

    doc.setTextColor(textColor[0], textColor[1], textColor[2]);

    // Top Section Info
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    
    // Left Column
    doc.text(`Appointment ID: `, 20, 55);
    doc.setFont("helvetica", "normal");
    doc.text(`APT${Math.floor(Math.random() * 1000000)}`, 55, 55);
    
    doc.setFont("helvetica", "bold");
    doc.text("Prescribed to:", 20, 65);
    doc.setFont("helvetica", "normal");
    doc.text(`${user?.name || 'Unknown Patient'}`, 20, 72);
    
    doc.setFont("helvetica", "bold");
    doc.text("Age/Sex:", 20, 82);
    doc.setFont("helvetica", "normal");
    doc.text(`26/Male`, 40, 82); // Simulated for now since Patient Model doesn't explicitly store Age/Sex

    // Right Column
    doc.setFont("helvetica", "bold");
    doc.text("Date: ", 140, 55);
    doc.setFont("helvetica", "normal");
    doc.text(date, 152, 55);
    
    doc.setFont("helvetica", "bold");
    doc.text("Prescribed by:", 190, 65, { align: "right" });
    doc.setFont("helvetica", "normal");
    const docName = `Dr. ${doctorName}`;
    doc.text(docName, 190, 72, { align: "right" });
    doc.text("MBBS", 190, 77, { align: "right" }); // Simulated qualification

    doc.setFont("helvetica", "bold");
    doc.text("Medical Reg. No: ", 170, 85, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.text("MP-24115", 190, 85, { align: "right" });

    doc.setFont("helvetica", "bold");
    doc.text("Mobile No: ", 170, 90, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.text("18003090101", 190, 90, { align: "right" });
    
    // Main Body
    let yPos = 110;
    
    doc.setFont("helvetica", "bold");
    doc.text("Prescription & Remarks", 20, yPos);
    yPos += 8;
    
    doc.setFont("helvetica", "normal");
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    const splitPrescription = doc.splitTextToSize(prescription, 170);
    doc.text(splitPrescription, 20, yPos);
    
    yPos += Math.max(splitPrescription.length * 5 + 15, 30);
    
    // Disclaimer area
    if (yPos > 240) {
       doc.addPage();
       yPos = 30;
    }
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.text("(Apply generic equivalent wherever applicable)", 20, yPos);
    
    // Signature
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text(docName, 160, yPos + 10, { align: "center" });
    doc.setLineWidth(0.5);
    doc.setDrawColor(0, 0, 0);
    doc.line(135, yPos + 2, 185, yPos + 2);
    doc.text("Doctor Signature", 160, yPos + 15, { align: "center" });
    
    // Bottom Disclaimer
    yPos += 30;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Disclaimer:", 20, yPos);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const disclaimer = "This prescription is issued as a result of the RMPs medical assessment based on inputs of the patients/authorised representative/caregiver of the patient during a tele-consultation. It is valid from the date of issue until specific period/dosage of each medicine as advised.";
    const splitDisclaimer = doc.splitTextToSize(disclaimer, 170);
    doc.text(splitDisclaimer, 20, yPos + 7);

    // Save as PDF
    const filename = `Prescription_${date.replace(/\//g, '-')}_${doctorName.replace(/\s+/g, '_')}.pdf`;
    doc.save(filename);
  };

  const getDoctorDetails = (doctorId: string) => {
    return doctors.find(d => d.id === doctorId);
  };

  const handleCancelClick = () => {
    setShowCancelModal(true);
  };

  const confirmCancel = async () => {
    if (!selectedAppointment) return;

    setIsProcessing(true);
    try {
      await api.updateAppointmentStatus(selectedAppointment.id, AppointmentStatus.CANCELLED);
      await fetchData(); 
      setShowCancelModal(false);
      setSelectedAppointment(null);
    } catch (error) {
      console.error("Failed to cancel appointment", error);
      alert("Failed to cancel appointment. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // --- Dynamic Health Status Logic ---
  const healthStatus = useMemo(() => {
    if (aiHistory.length === 0) {
      return { 
        status: 'Good', 
        subText: 'No recent health issues', 
        icon: Activity, 
        colorClass: 'text-emerald-500', 
        bgClass: 'bg-emerald-50' 
      };
    }

    const latest = aiHistory[0];
    const date = new Date(latest.date);
    const now = new Date();
    // Calculate difference in days
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

    // If last check was more than 7 days ago, assume stable
    if (diffDays > 7) {
      return { 
        status: 'Good', 
        subText: 'Stable since last checkup', 
        icon: Activity, 
        colorClass: 'text-emerald-500', 
        bgClass: 'bg-emerald-50' 
      };
    }

    // Check for severe keywords in prediction
    const lowerPred = latest.prediction.toLowerCase();
    const isSevere = ['cardiac', 'heart', 'severe', 'emergency', 'stroke', 'fracture'].some(k => lowerPred.includes(k));

    if (isSevere) {
      return { 
        status: 'Action Needed', 
        subText: 'Critical symptoms detected', 
        icon: AlertCircle, 
        colorClass: 'text-red-600', 
        bgClass: 'bg-red-50' 
      };
    }

    // Default for recent non-severe issues
    return { 
      status: 'Monitor', 
      subText: `Recent: ${latest.prediction}`, 
      icon: Stethoscope, 
      colorClass: 'text-amber-500', 
      bgClass: 'bg-amber-50' 
    };
  }, [aiHistory]);

  return (
    <div className="space-y-8 relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-slide-up" style={{animationDelay: '0ms'}}>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Good Morning, {user?.name.split(' ')[0]}</h1>
          <p className="text-slate-500">Here's your health overview for today.</p>
        </div>
        <Link to="/book-appointment" className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center gap-2 w-fit">
          <Calendar size={18} /> Book Appointment
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up" style={{animationDelay: '100ms'}}>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-2xl shadow-lg transform transition-transform hover:scale-[1.02]">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="bg-white/20 p-2 rounded-lg w-10 h-10" />
            <span className="font-semibold text-white/90">Upcoming</span>
          </div>
          <div className="text-3xl font-bold">{upcomingAppointments.length}</div>
          <div className="text-sm text-blue-100 mt-1">Appointments scheduled</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transform transition-transform hover:scale-[1.02]">
          <div className="flex items-center gap-3 mb-4">
            <BrainCircuit className="text-purple-500 bg-purple-50 p-2 rounded-lg w-10 h-10" />
            <span className="font-semibold text-slate-700">AI Checks</span>
          </div>
          <div className="text-3xl font-bold text-slate-900">{aiHistory.length}</div>
          <div className="text-sm text-slate-500 mt-1">Symptoms analyzed</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transform transition-transform hover:scale-[1.02]">
          <div className="flex items-center gap-3 mb-4">
            <healthStatus.icon className={`${healthStatus.colorClass} ${healthStatus.bgClass} p-2 rounded-lg w-10 h-10`} />
            <span className="font-semibold text-slate-700">Health Status</span>
          </div>
          <div className="text-3xl font-bold text-slate-900">{healthStatus.status}</div>
          <div className="text-sm text-slate-500 mt-1">{healthStatus.subText}</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8 animate-slide-up" style={{animationDelay: '200ms'}}>
        {/* Appointments List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Upcoming Appointments</h2>
            <Link to="/book-appointment" className="text-sm text-blue-600 hover:underline">View All</Link>
          </div>

          {upcomingAppointments.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-100 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                <Calendar size={24} />
              </div>
              <h3 className="text-slate-900 font-medium mb-1">No appointments yet</h3>
              <p className="text-slate-500 text-sm mb-4">Book a visit with our specialists.</p>
              <Link to="/book-appointment" className="text-blue-600 font-medium text-sm hover:underline">Book Now</Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {upcomingAppointments.map(appt => {
                const doctor = getDoctorDetails(appt.doctorId);
                return (
                  <div 
                    key={appt.id} 
                    onClick={() => setSelectedAppointment(appt)}
                    className="bg-white p-5 rounded-xl border border-slate-100 hover:border-blue-400 transition-all shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer group hover:shadow-md"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 font-bold text-lg shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        {new Date(appt.date).getDate()}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors">{appt.doctorName}</h4>
                        <p className="text-sm text-slate-500">{doctor?.specialization || 'Specialist'} Checkup</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-400 font-medium">
                          <span className="flex items-center gap-1"><Clock size={12} /> {appt.time}</span>
                          <span className="flex items-center gap-1"><MapPin size={12} /> {doctor?.hospital || 'Clinic A'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider self-start sm:self-center ${
                        appt.status === AppointmentStatus.ACTIVE ? 'bg-amber-100 text-amber-700' :
                        appt.status === AppointmentStatus.WAITING ? 'bg-blue-100 text-blue-700' :
                        appt.status === AppointmentStatus.CONFIRMED ? 'bg-green-100 text-green-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {appt.status}
                      </div>
                      {appt.status === AppointmentStatus.WAITING && queueInfo[appt.id] && (
                        <div className="text-xs text-slate-500 text-right mt-1">
                          <span className="font-semibold block">Pos: #{queueInfo[appt.id].position}</span>
                          <span>~{queueInfo[appt.id].waitTime} min wait</span>
                        </div>
                      )}
                      {appt.status === AppointmentStatus.ACTIVE && (
                        <div className="text-xs text-amber-600 font-bold block animate-pulse mt-1">
                          Doctor is ready!
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Completed Appointments / Prescriptions */}
        {completedAppointments.length > 0 && (
          <div className="lg:col-span-2 space-y-6 mt-8">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Medical History & Prescriptions</h2>
            </div>
            <div className="grid gap-4">
              {completedAppointments.map(appt => {
                const doctor = getDoctorDetails(appt.doctorId);
                return (
                  <div 
                    key={appt.id} 
                    className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between gap-4 group"
                  >
                    <div className="flex items-center justify-between w-full">
                       <div className="flex items-start gap-4">
                         <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 font-bold text-lg shrink-0">
                           <FileText size={20} />
                         </div>
                         <div>
                           <h4 className="font-bold text-slate-900">{appt.doctorName}</h4>
                           <p className="text-sm text-slate-500">{doctor?.specialization || 'Specialist'} Consultaion</p>
                           <div className="flex items-center gap-3 mt-2 text-xs text-slate-400 font-medium">
                             <span className="flex items-center gap-1"><Calendar size={12} /> {appt.date}</span>
                           </div>
                         </div>
                       </div>
                       <button 
                          onClick={() => setSelectedAppointment(appt)}
                          className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors"
                       >
                         View Record
                       </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Recent AI Checks */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900">Recent AI Insights</h2>
            <Link to="/symptom-checker" className="text-sm text-blue-600 hover:underline">New Check</Link>
          </div>
          
          <div className="space-y-4">
            {aiHistory.length === 0 ? (
               <div className="bg-white p-6 rounded-2xl border border-slate-100 text-center">
                 <p className="text-sm text-slate-500">No symptoms recorded yet.</p>
               </div>
            ) : (
              aiHistory.slice(0, 3).map((record, i) => (
                <div key={i} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded uppercase">AI Analysis</span>
                    <span className="text-xs text-slate-400">{new Date(record.date).toLocaleDateString()}</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm mb-1">{record.prediction}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2">{record.recommendation}</p>
                </div>
              ))
            )}
            
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
              <h4 className="text-blue-900 font-bold text-sm mb-1">Need quick advice?</h4>
              <p className="text-blue-700 text-xs mb-3">Our AI Symptom Checker is ready to help you triage your condition.</p>
              <Link to="/symptom-checker" className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:gap-2 transition-all">
                Start Check <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Appointment Detail Modal */}
      {selectedAppointment && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelectedAppointment(null)}
        >
          <div 
            className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-slide-up relative cursor-auto max-h-[90vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-slate-50 p-6 border-b border-slate-100 flex items-start justify-between flex-shrink-0">
              <div className="flex items-center gap-4">
                 <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-blue-600 border border-slate-200 shadow-sm overflow-hidden">
                     {(() => {
                        const doc = getDoctorDetails(selectedAppointment.doctorId);
                        return doc?.image ? (
                           <img src={doc.image} alt={doc.name} className="w-full h-full object-cover" />
                        ) : (
                           <User size={28} />
                        );
                     })()}
                 </div>
                 <div>
                    <h3 className="text-lg font-bold text-slate-900">{selectedAppointment.doctorName}</h3>
                    <p className="text-blue-600 text-sm font-medium flex items-center gap-1">
                      <Stethoscope size={14} /> 
                      {getDoctorDetails(selectedAppointment.doctorId)?.specialization || 'Specialist'}
                    </p>
                 </div>
              </div>
              <button 
                type="button"
                onClick={() => setSelectedAppointment(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors bg-white p-1 rounded-full border border-slate-100 hover:bg-slate-50"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 overflow-y-auto">
              {/* Status Badge */}
              <div className="flex justify-between items-center">
                 <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status</span>
                 <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                      selectedAppointment.status === AppointmentStatus.ACTIVE ? 'bg-amber-100 text-amber-700' : 
                      selectedAppointment.status === AppointmentStatus.WAITING ? 'bg-blue-100 text-blue-700' : 
                      selectedAppointment.status === AppointmentStatus.CONFIRMED ? 'bg-green-100 text-green-700' : 
                      selectedAppointment.status === AppointmentStatus.CANCELLED ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'
                   }`}>
                      {selectedAppointment.status === AppointmentStatus.ACTIVE ? <User size={14} /> :
                       selectedAppointment.status === AppointmentStatus.WAITING ? <User size={14} /> :
                       selectedAppointment.status === AppointmentStatus.CONFIRMED ? <CheckCircle size={14} /> : 
                       selectedAppointment.status === AppointmentStatus.CANCELLED ? <AlertCircle size={14} /> : <Clock size={14} />}
                      {selectedAppointment.status}
                   </span>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p className="text-xs text-slate-500 mb-1 flex items-center gap-1"><Calendar size={12} /> Date</p>
                    <p className="font-semibold text-slate-900">{selectedAppointment.date}</p>
                 </div>
                 <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p className="text-xs text-slate-500 mb-1 flex items-center gap-1"><Clock size={12} /> Time</p>
                    <p className="font-semibold text-slate-900">{selectedAppointment.time}</p>
                 </div>
                 <div className="col-span-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p className="text-xs text-slate-500 mb-1 flex items-center gap-1"><MapPin size={12} /> Location</p>
                    <p className="font-semibold text-slate-900">
                      {getDoctorDetails(selectedAppointment.doctorId)?.hospital || 'HopCare Main Clinic, New Delhi'}
                    </p>
                 </div>
              </div>

              {/* Prescription from Doctor */}
              {selectedAppointment.prescription && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mt-4 relative group">
                  <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2 flex items-center justify-between">
                     <span className="flex items-center gap-1"><Stethoscope size={14} /> Doctor's Prescription</span>
                     <button 
                        onClick={() => handleDownloadPrescription(selectedAppointment.prescription!, selectedAppointment.doctorName, selectedAppointment.date)}
                        className="flex items-center gap-1 text-[10px] bg-white border border-blue-200 text-blue-700 px-2 py-1 rounded hover:bg-blue-600 hover:text-white transition-colors"
                        title="Download Prescription"
                     >
                       <Download size={12} /> Download
                     </button>
                  </p>
                  <div className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap font-medium">
                    {selectedAppointment.prescription}
                  </div>
                </div>
              )}

              {/* Documents */}
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1"><Paperclip size={14} /> Documents</span>
                  {selectedAppointment.status !== AppointmentStatus.COMPLETED && selectedAppointment.status !== AppointmentStatus.CANCELLED && (
                    <button
                      type="button"
                      onClick={() => docInputRef.current?.click()}
                      disabled={isUploadingDoc}
                      className="text-[10px] bg-blue-50 text-blue-600 border border-blue-100 px-2 py-1 rounded hover:bg-blue-100 transition-colors font-semibold"
                    >
                      + Upload
                    </button>
                  )}
                </p>
                <input
                  ref={docInputRef}
                  type="file"
                  multiple
                  accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                  className="hidden"
                  onChange={async (e) => {
                    const files = e.target.files;
                    if (!files || !selectedAppointment) return;
                    setIsUploadingDoc(true);
                    const existing = selectedAppointment.documents || [];
                    const newDocs = [...existing];
                    for (const file of Array.from(files)) {
                      if (file.size > 5 * 1024 * 1024) { alert(`${file.name} exceeds 5MB`); continue; }
                      if (newDocs.length >= 5) { alert('Max 5 files allowed'); break; }
                      const data = await new Promise<string>((res) => {
                        const reader = new FileReader();
                        reader.onloadend = () => res(reader.result as string);
                        reader.readAsDataURL(file);
                      });
                      newDocs.push({ name: file.name, type: file.type, data, uploadedAt: new Date().toISOString() });
                    }
                    try {
                      await api.updateAppointmentDocuments(selectedAppointment.id, newDocs);
                      setAppointments(prev => prev.map(a => a.id === selectedAppointment.id ? { ...a, documents: newDocs } : a));
                      setSelectedAppointment(prev => prev ? { ...prev, documents: newDocs } : prev);
                    } catch (err) {
                      alert('Failed to upload document.');
                    } finally {
                      setIsUploadingDoc(false);
                      e.target.value = '';
                    }
                  }}
                />
                {(selectedAppointment.documents || []).length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No documents uploaded.</p>
                ) : (
                  <div className="space-y-2">
                    {(selectedAppointment.documents || []).map((doc, i) => {
                      const handleDocDownload = () => {
                        const base64 = doc.data.includes(',') ? doc.data.split(',')[1] : doc.data;
                        const mime = doc.type || 'application/octet-stream';
                        const byteStr = atob(base64);
                        const ab = new ArrayBuffer(byteStr.length);
                        const ia = new Uint8Array(ab);
                        for (let j = 0; j < byteStr.length; j++) ia[j] = byteStr.charCodeAt(j);
                        const blob = new Blob([ab], { type: mime });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = doc.name;
                        a.style.display = 'none';
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        setTimeout(() => URL.revokeObjectURL(url), 1000);
                      };
                      return (
                        <div key={i} className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                          <span className="text-xs text-slate-700 truncate max-w-[200px]">{doc.name}</span>
                          <button
                            onClick={handleDocDownload}
                            className="text-xs text-blue-600 hover:underline font-semibold ml-2 shrink-0"
                          >
                            Download
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                   <FileText size={14} /> Patient Notes
                </p>
                {selectedAppointment.status === AppointmentStatus.COMPLETED ? (
                  <div className="w-full bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm text-slate-700 leading-relaxed min-h-[80px]">
                    {notesInput || <span className="text-slate-400 italic">No notes added.</span>}
                  </div>
                ) : (
                  <>
                    <textarea
                      value={notesInput}
                      onChange={e => { setNotesInput(e.target.value); setNotesSaved(false); setNotesSaveError(''); }}
                      placeholder="Add notes about your symptoms, concerns, or questions for the doctor..."
                      rows={4}
                      className="w-full bg-white p-4 rounded-xl border border-slate-200 text-sm text-slate-700 leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {notesSaveError && (
                      <p className="mt-1 text-xs text-red-500">{notesSaveError}</p>
                    )}
                    <button
                      type="button"
                      disabled={isSavingNotes}
                      onClick={async () => {
                        setIsSavingNotes(true);
                        setNotesSaveError('');
                        try {
                          await api.updateAppointmentNotes(selectedAppointment.id, notesInput);
                          setAppointments(prev => prev.map(a => a.id === selectedAppointment.id ? { ...a, notes: notesInput } : a));
                          setNotesSaved(true);
                        } catch (e: any) {
                          setNotesSaveError(e?.message || 'Failed to save notes. Please try again.');
                        } finally {
                          setIsSavingNotes(false);
                        }
                      }}
                      className={`mt-2 w-full font-semibold py-2 rounded-xl transition-colors text-sm disabled:opacity-50 ${notesSaved ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                    >
                      {isSavingNotes ? 'Saving...' : notesSaved ? '✓ Saved!' : 'Save Notes'}
                    </button>
                  </>
                )}
              </div>

              {/* Footer Action */}
              <div className="pt-2 flex flex-col gap-3">
                 <div className="flex flex-col sm:flex-row gap-3">
                   <button 
                     type="button"
                     onClick={() => setSelectedAppointment(null)}
                     className="flex-1 bg-slate-100 text-slate-700 font-semibold py-3 rounded-xl hover:bg-slate-200 transition-colors"
                   >
                     Close
                   </button>
                     {(selectedAppointment.status === AppointmentStatus.PENDING || selectedAppointment.status === AppointmentStatus.CONFIRMED || selectedAppointment.status === AppointmentStatus.WAITING) && (
                     <button 
                       type="button"
                       onClick={handleCancelClick}
                       disabled={isProcessing}
                       className="flex-1 font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer bg-red-50 text-red-600 border border-red-100 hover:bg-red-100"
                     >
                       <Trash2 size={18} />
                       Cancel Booking
                     </button>
                   )}
                 </div>
                 {(selectedAppointment.status === AppointmentStatus.CONFIRMED || selectedAppointment.status === AppointmentStatus.WAITING || selectedAppointment.status === AppointmentStatus.ACTIVE) && (
                   <button
                     type="button"
                     onClick={() => navigate(`/consultation/${selectedAppointment.id}`)}
                     className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
                   >
                     <Video size={20} />
                     Join Video Call
                   </button>
                 )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-slide-up text-center border border-slate-100" onClick={e => e.stopPropagation()}>
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                    <AlertTriangle size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Cancel Appointment?</h3>
                <p className="text-slate-500 mb-8 leading-relaxed">
                    Are you sure you want to cancel this appointment?
                </p>
                
                <div className="flex gap-3">
                    <button 
                        onClick={() => setShowCancelModal(false)}
                        className="flex-1 py-3 border border-slate-200 rounded-xl text-slate-700 font-bold hover:bg-slate-50 transition-colors"
                    >
                        No, Keep
                    </button>
                    <button 
                        onClick={confirmCancel}
                        disabled={isProcessing}
                        className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20 flex items-center justify-center gap-2"
                    >
                        {isProcessing && <Loader2 size={18} className="animate-spin" />}
                        Yes, Cancel
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
