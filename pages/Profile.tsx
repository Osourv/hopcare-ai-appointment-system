import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { User, Mail, Phone, Save, CheckCircle, Stethoscope, ChevronDown, Camera } from 'lucide-react';

const MEDICAL_SPECIALIZATIONS = [
  "General Physician",
  "Cardiologist",
  "Dermatologist",
  "Neurologist",
  "Pediatrician",
  "Psychiatrist",
  "Orthopedist",
  "Gynecologist",
  "ENT Specialist",
  "Dentist",
  "Ophthalmologist",
  "Urologist",
  "Gastroenterologist",
  "Endocrinologist",
  "Pulmonologist",
  "Oncologist"
];

export const Profile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [specialization, setSpecialization] = useState(user?.specialization || '');
  const [image, setImage] = useState(user?.image || '');
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert("File size should be less than 5MB");
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await updateProfile({ 
        name, 
        email, 
        phone,
        image,
        specialization: user?.role === UserRole.DOCTOR ? specialization : undefined
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
        <p className="text-slate-500">Manage your personal information and contact details.</p>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mb-8 pb-8 border-b border-slate-100 text-center sm:text-left">
          
          {/* Profile Image with Upload Overlay */}
          <div className="relative group cursor-pointer">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 border-4 border-white shadow-md relative shrink-0 overflow-hidden">
              {image ? (
                <img src={image} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={32} />
              )}
            </div>
            
            <label className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10">
              <Camera size={24} className="text-white" />
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleImageUpload}
              />
            </label>

            {user?.role === UserRole.DOCTOR && (
              <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-1.5 rounded-full border-2 border-white z-20 pointer-events-none">
                <Stethoscope size={14} />
              </div>
            )}
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900">{user?.name}</h2>
            <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wider">
                {user?.role}
              </span>
              {user?.specialization && (
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider">
                  {user.specialization}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-2">Click on the picture to update</p>
          </div>
        </div>

        {success && (
          <div className="bg-green-50 text-green-700 p-4 rounded-xl flex items-center gap-2 mb-6 animate-fade-in">
            <CheckCircle size={20} />
            Profile updated successfully!
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-center gap-2 mb-6 animate-fade-in">
            <CheckCircle size={20} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-slate-400" size={18} />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 text-slate-400" size={18} />
                <input
                  type="tel"
                  placeholder="+91 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-slate-700">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-slate-50"
                  readOnly
                />
              </div>
            </div>

            {user?.role === UserRole.DOCTOR && (
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-slate-700">Specialization</label>
                <div className="relative">
                  <Stethoscope className="absolute left-3 top-3 text-slate-400 pointer-events-none" size={18} />
                  <ChevronDown className="absolute right-3 top-3 text-slate-400 pointer-events-none" size={18} />
                  <select
                    required
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all appearance-none bg-white text-slate-700"
                  >
                    <option value="" disabled>Select your specialization</option>
                    {MEDICAL_SPECIALIZATIONS.map((spec) => (
                      <option key={spec} value={spec}>
                        {spec}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-xs text-slate-500">Select your medical specialty from the list.</p>
              </div>
            )}
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 disabled:opacity-70"
            >
              <Save size={18} />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};