import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Calendar, CheckCircle, Loader2, Star, Stethoscope, Users } from 'lucide-react';

interface AdminStats {
  totalPatients: number;
  totalDoctors: number;
  totalAppointments: number;
  completedAppointments: number;
}

const STATUS_COLOR: Record<string, string> = {
  completed:  'bg-green-100 text-green-700',
  cancelled:  'bg-red-100 text-red-700',
  confirmed:  'bg-blue-100 text-blue-700',
  active:     'bg-amber-100 text-amber-700',
  waiting:    'bg-purple-100 text-purple-700',
  pending:    'bg-slate-100 text-slate-600',
};

const StatCard: React.FC<{ icon: React.ElementType; label: string; value: number; gradient: string }> = ({ icon: Icon, label, value, gradient }) => (
  <div className={`bg-gradient-to-br ${gradient} text-white p-5 rounded-2xl shadow-lg`}>
    <Icon size={22} className="opacity-80 mb-3" />
    <div className="text-3xl font-bold">{value.toLocaleString()}</div>
    <div className="text-sm opacity-80 mt-0.5">{label}</div>
  </div>
);

export const AdminDashboard: React.FC = () => {
  const [stats, setStats]               = useState<AdminStats | null>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [users, setUsers]               = useState<{ patients: any[]; doctors: any[] } | null>(null);
  const [loading, setLoading]           = useState(true);
  const [tab, setTab]                   = useState<'patients' | 'doctors'>('patients');

  useEffect(() => {
    const load = async () => {
      try {
        const [s, a, u] = await Promise.all([
          api.getAdminStats(),
          api.getAdminAppointments(),
          api.getAdminUsers(),
        ]);
        setStats(s);
        setAppointments(a);
        setUsers(u);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-24 text-slate-500 gap-2">
      <Loader2 size={20} className="animate-spin" /> Loading admin data…
    </div>
  );

  const topDoctors = users?.doctors
    .filter(d => d.reviewCount > 0)
    .sort((a: any, b: any) => (b.rating ?? 0) - (a.rating ?? 0))
    .slice(0, 4) ?? [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="text-slate-500">System-wide overview for HopCare</p>
      </div>

      {/* Stat Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-up">
          <StatCard icon={Users}        label="Total Patients"      value={stats.totalPatients}         gradient="from-blue-500 to-blue-600" />
          <StatCard icon={Stethoscope}  label="Total Doctors"       value={stats.totalDoctors}          gradient="from-emerald-500 to-emerald-600" />
          <StatCard icon={Calendar}     label="All Appointments"    value={stats.totalAppointments}     gradient="from-purple-500 to-purple-600" />
          <StatCard icon={CheckCircle}  label="Completed"           value={stats.completedAppointments} gradient="from-amber-500 to-amber-600" />
        </div>
      )}

      {/* Top Rated Doctors */}
      {topDoctors.length > 0 && (
        <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
          <h2 className="text-lg font-bold text-slate-900 mb-4">Top Rated Doctors</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {topDoctors.map((doc: any) => (
              <div key={doc._id} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm text-center">
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Stethoscope size={20} className="text-blue-600" />
                </div>
                <p className="font-bold text-slate-900 text-sm truncate">{doc.name}</p>
                <p className="text-xs text-slate-500 mb-2 truncate">{doc.specialization || 'General'}</p>
                <div className="flex items-center justify-center gap-1 text-amber-500 font-bold text-sm">
                  <Star size={14} className="fill-amber-400" />
                  {doc.rating?.toFixed(1)}
                  <span className="text-slate-400 font-normal text-xs">({doc.reviewCount})</span>
                </div>
                {doc.consultationFee && (
                  <p className="text-xs text-slate-500 mt-1">₹{doc.consultationFee}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Appointments */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-slide-up" style={{ animationDelay: '150ms' }}>
        <div className="p-5 border-b border-slate-100">
          <h2 className="font-bold text-slate-900">Recent Appointments <span className="text-slate-400 font-normal text-sm">(last 50)</span></h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider">
                <th className="text-left px-5 py-3">Patient</th>
                <th className="text-left px-5 py-3">Doctor</th>
                <th className="text-left px-5 py-3">Date</th>
                <th className="text-left px-5 py-3">Status</th>
                <th className="text-left px-5 py-3">Payment ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {appointments.map((appt: any) => (
                <tr key={appt._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3 font-medium text-slate-900">{appt.patientName}</td>
                  <td className="px-5 py-3 text-slate-600">{appt.doctorName}</td>
                  <td className="px-5 py-3 text-slate-500">{appt.date}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold uppercase ${STATUS_COLOR[appt.status] ?? STATUS_COLOR.pending}`}>
                      {appt.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-400 font-mono text-xs">
                    {appt.paymentId ? appt.paymentId.slice(0, 16) + '…' : '—'}
                  </td>
                </tr>
              ))}
              {appointments.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-slate-400">No appointments yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* All Users */}
      {users && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-slide-up" style={{ animationDelay: '200ms' }}>
          <div className="p-5 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
            <h2 className="font-bold text-slate-900">All Users</h2>
            <div className="flex bg-slate-100 rounded-full p-1">
              <button
                onClick={() => setTab('patients')}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${tab === 'patients' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Patients ({users.patients.length})
              </button>
              <button
                onClick={() => setTab('doctors')}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${tab === 'doctors' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Doctors ({users.doctors.length})
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            {tab === 'patients' ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider">
                    <th className="text-left px-5 py-3">Name</th>
                    <th className="text-left px-5 py-3">Email</th>
                    <th className="text-left px-5 py-3">Phone</th>
                    <th className="text-left px-5 py-3">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {users.patients.map((p: any) => (
                    <tr key={p._id} className="hover:bg-slate-50">
                      <td className="px-5 py-3 font-medium text-slate-900">{p.name}</td>
                      <td className="px-5 py-3 text-slate-600">{p.email}</td>
                      <td className="px-5 py-3 text-slate-500">{p.phone || '—'}</td>
                      <td className="px-5 py-3 text-slate-400">{new Date(p.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {users.patients.length === 0 && (
                    <tr><td colSpan={4} className="px-5 py-8 text-center text-slate-400">No patients yet.</td></tr>
                  )}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider">
                    <th className="text-left px-5 py-3">Name</th>
                    <th className="text-left px-5 py-3">Specialization</th>
                    <th className="text-left px-5 py-3">Hospital</th>
                    <th className="text-left px-5 py-3">Rating</th>
                    <th className="text-left px-5 py-3">Fee</th>
                    <th className="text-left px-5 py-3">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {users.doctors.map((d: any) => (
                    <tr key={d._id} className="hover:bg-slate-50">
                      <td className="px-5 py-3 font-medium text-slate-900">{d.name}</td>
                      <td className="px-5 py-3 text-slate-600">{d.specialization || '—'}</td>
                      <td className="px-5 py-3 text-slate-500 text-xs">{d.hospital || '—'}</td>
                      <td className="px-5 py-3">
                        {d.rating ? (
                          <span className="flex items-center gap-1 text-amber-500 font-semibold">
                            <Star size={12} className="fill-amber-400" />
                            {d.rating.toFixed(1)}
                            <span className="text-slate-400 font-normal text-xs">({d.reviewCount ?? 0})</span>
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-5 py-3 text-slate-600">{d.consultationFee ? `₹${d.consultationFee}` : '—'}</td>
                      <td className="px-5 py-3 text-slate-400">{new Date(d.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {users.doctors.length === 0 && (
                    <tr><td colSpan={6} className="px-5 py-8 text-center text-slate-400">No doctors yet.</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
