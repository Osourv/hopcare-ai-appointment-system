import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Appointment, AppointmentStatus } from '../types';
import { Calendar, ChevronDown, ChevronRight, Download, FileText, Loader2, Paperclip, Star, Stethoscope } from 'lucide-react';
import jsPDF from 'jspdf';

export const MedicalHistory: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [ratedApptIds, setRatedApptIds] = useState<Set<string>>(new Set());
  const [reviewModal, setReviewModal] = useState<{ appointmentId: string; doctorName: string; doctorId: string } | null>(null);
  const [ratingValue, setRatingValue] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const reviewsLoadedRef = useRef(false);

  useEffect(() => {
    const load = async () => {
      try {
        const appts = await api.getAppointments();
        const completed = appts.filter(a => a.status === AppointmentStatus.COMPLETED)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setAppointments(completed);

        if (!reviewsLoadedRef.current && completed.length > 0) {
          reviewsLoadedRef.current = true;
          const results = await Promise.all(
            completed.map(a => api.checkReview(a.id).then(has => has ? a.id : null).catch(() => null))
          );
          setRatedApptIds(new Set(results.filter(Boolean) as string[]));
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDownloadPrescription = (prescription: string, doctorName: string, date: string) => {
    const doc = new jsPDF();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(37, 99, 235);
    doc.text('HopCare', 20, 25);
    doc.setFontSize(16);
    doc.setTextColor(100, 100, 200);
    doc.text('Doctor Consult', 140, 23);
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text('powered by HopCare', 140, 28);
    doc.setFontSize(12);
    doc.setTextColor(37, 99, 235);
    doc.text('Consulted Online', 105, 40, { align: 'center' });
    doc.setLineWidth(0.5);
    doc.setDrawColor(37, 99, 235);
    doc.line(85, 41, 125, 41);
    doc.setTextColor(40, 40, 40);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Prescribed to:', 20, 65);
    doc.setFont('helvetica', 'normal');
    doc.text(user?.name || 'Patient', 20, 72);
    doc.setFont('helvetica', 'bold');
    doc.text('Date: ', 140, 55);
    doc.setFont('helvetica', 'normal');
    doc.text(date, 152, 55);
    doc.setFont('helvetica', 'bold');
    doc.text('Prescribed by:', 190, 65, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.text(`Dr. ${doctorName}`, 190, 72, { align: 'right' });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    let yPos = 110;
    doc.text('Prescription & Remarks', 20, yPos);
    yPos += 8;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    const splitPrescription = doc.splitTextToSize(prescription, 170);
    doc.text(splitPrescription, 20, yPos);
    yPos += Math.max(splitPrescription.length * 5 + 15, 30);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(40, 40, 40);
    doc.text(`Dr. ${doctorName}`, 160, yPos + 10, { align: 'center' });
    doc.setLineWidth(0.5);
    doc.setDrawColor(0, 0, 0);
    doc.line(135, yPos + 2, 185, yPos + 2);
    doc.text('Doctor Signature', 160, yPos + 15, { align: 'center' });
    const filename = `Prescription_${date.replace(/\//g, '-')}_${doctorName.replace(/\s+/g, '_')}.pdf`;
    doc.save(filename);
  };

  const handleDocDownload = (docItem: { name: string; type: string; data: string }) => {
    const base64 = docItem.data.includes(',') ? docItem.data.split(',')[1] : docItem.data;
    const mime = docItem.type || 'application/octet-stream';
    const byteStr = atob(base64);
    const ab = new ArrayBuffer(byteStr.length);
    const ia = new Uint8Array(ab);
    for (let j = 0; j < byteStr.length; j++) ia[j] = byteStr.charCodeAt(j);
    const blob = new Blob([ab], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = docItem.name;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-500 gap-2">
        <Loader2 size={20} className="animate-spin" /> Loading medical history...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Medical History</h1>
        <p className="text-slate-500">All your completed consultations, prescriptions, and documents.</p>
      </div>

      {appointments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
          <FileText size={40} className="text-slate-300 mx-auto mb-4" />
          <h3 className="text-slate-600 font-semibold">No completed appointments yet</h3>
          <p className="text-slate-400 text-sm mt-1">Your past consultations will appear here once completed.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((appt, idx) => {
            const isOpen = expanded.has(appt.id);
            const isRated = ratedApptIds.has(appt.id);
            return (
              <div key={appt.id} className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
                {/* Timeline dot */}
                <div className="flex">
                  {idx < appointments.length - 1 && (
                    <div className="hidden sm:flex flex-col items-center pl-6 pt-5">
                      <div className="w-3 h-3 rounded-full bg-blue-500 shrink-0" />
                      <div className="w-0.5 flex-1 bg-slate-200 mt-1" />
                    </div>
                  )}
                  {idx === appointments.length - 1 && (
                    <div className="hidden sm:flex flex-col items-center pl-6 pt-5">
                      <div className="w-3 h-3 rounded-full bg-slate-300 shrink-0" />
                    </div>
                  )}

                  <div className="flex-1">
                    {/* Header row */}
                    <button
                      className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
                      onClick={() => toggleExpand(appt.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                          <Stethoscope size={18} className="text-blue-600" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{appt.doctorName}</p>
                          <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                            <Calendar size={11} />
                            <span>{appt.date}</span>
                            {appt.time && <span>· {appt.time}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {isRated ? (
                          <span className="text-xs text-amber-500 font-semibold flex items-center gap-1">
                            <Star size={12} className="fill-amber-400 text-amber-400" /> Rated
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              setRatingValue(0);
                              setRatingComment('');
                              setReviewModal({ appointmentId: appt.id, doctorName: appt.doctorName, doctorId: appt.doctorId });
                            }}
                            className="text-xs bg-amber-50 text-amber-600 border border-amber-200 px-2.5 py-1 rounded-full hover:bg-amber-100 transition-colors font-semibold flex items-center gap-1"
                          >
                            <Star size={11} /> Rate
                          </button>
                        )}
                        {isOpen ? <ChevronDown size={18} className="text-slate-400" /> : <ChevronRight size={18} className="text-slate-400" />}
                      </div>
                    </button>

                    {/* Expanded content */}
                    {isOpen && (
                      <div className="px-5 pb-5 space-y-4 border-t border-slate-50">
                        {appt.prescription && (
                          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 mt-4">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1">
                                <Stethoscope size={12} /> Prescription
                              </p>
                              <button
                                onClick={() => handleDownloadPrescription(appt.prescription!, appt.doctorName, appt.date)}
                                className="text-[10px] bg-white border border-blue-200 text-blue-700 px-2 py-1 rounded hover:bg-blue-600 hover:text-white transition-colors flex items-center gap-1"
                              >
                                <Download size={11} /> Download PDF
                              </button>
                            </div>
                            <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{appt.prescription}</p>
                          </div>
                        )}

                        {(appt.documents || []).length > 0 && (
                          <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                              <Paperclip size={12} /> Documents
                            </p>
                            <div className="space-y-2">
                              {(appt.documents || []).map((docItem, i) => (
                                <div key={i} className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                                  <span className="text-xs text-slate-700 truncate max-w-[200px]">{docItem.name}</span>
                                  <button
                                    onClick={() => handleDocDownload(docItem)}
                                    className="text-xs text-blue-600 hover:underline font-semibold ml-2 shrink-0"
                                  >
                                    Download
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {appt.notes && (
                          <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                              <FileText size={12} /> Your Notes
                            </p>
                            <div className="bg-slate-50 rounded-xl border border-slate-200 p-3 text-sm text-slate-700 leading-relaxed">
                              {appt.notes}
                            </div>
                          </div>
                        )}

                        {!appt.prescription && (appt.documents || []).length === 0 && !appt.notes && (
                          <p className="text-sm text-slate-400 italic pt-4">No records available for this consultation.</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Rating Modal */}
      {reviewModal && (
        <div
          className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
          onClick={() => { if (!isSubmittingRating) setReviewModal(null); }}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 animate-slide-up" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Rate Your Visit</h3>
            <p className="text-sm text-slate-500 mb-5">With {reviewModal.doctorName}</p>
            <div className="flex justify-center gap-2 mb-5">
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} type="button" onClick={() => setRatingValue(n)} className="transition-transform hover:scale-110">
                  <Star size={36} className={n <= ratingValue ? 'text-amber-400 fill-amber-400' : 'text-slate-300'} />
                </button>
              ))}
            </div>
            <textarea
              value={ratingComment}
              onChange={e => setRatingComment(e.target.value)}
              placeholder="Share your experience (optional)"
              maxLength={300}
              rows={3}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-400 mb-4"
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setReviewModal(null)}
                disabled={isSubmittingRating}
                className="flex-1 py-2.5 border border-slate-200 rounded-xl text-slate-600 font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={ratingValue === 0 || isSubmittingRating}
                onClick={async () => {
                  if (!reviewModal || ratingValue === 0) return;
                  setIsSubmittingRating(true);
                  try {
                    await api.submitReview(reviewModal.appointmentId, reviewModal.doctorId, ratingValue, ratingComment);
                    setRatedApptIds(prev => new Set([...prev, reviewModal.appointmentId]));
                    setReviewModal(null);
                  } catch (e: any) {
                    alert(e?.message || 'Failed to submit review');
                  } finally {
                    setIsSubmittingRating(false);
                  }
                }}
                className="flex-1 py-2.5 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmittingRating ? <><Loader2 size={16} className="animate-spin" /> Submitting...</> : 'Submit Review'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
