import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { UserRole } from '../types';
import { Activity, ArrowLeft, ShieldCheck, RefreshCw, User, Stethoscope, Check, X, AlertCircle } from 'lucide-react';

const MEDICAL_SPECIALIZATIONS = [
  "General Physician", "Cardiologist", "Dermatologist", "Neurologist", 
  "Pediatrician", "Psychiatrist", "Orthopedist", "Gynecologist", 
  "ENT Specialist", "Dentist", "Ophthalmologist", "Urologist", 
  "Gastroenterologist", "Endocrinologist", "Pulmonologist", "Oncologist"
];

export const Auth: React.FC = () => {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const isRegister = location.pathname === '/register';
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: '',
    qualifications: '',
    experience: '',
    consultationFee: '',
    password: '',
    confirmPassword: '',
    role: UserRole.PATIENT
  });

  // CAPTCHA State
  const [captchaCode, setCaptchaCode] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Initialize CAPTCHA
  useEffect(() => {
    refreshCaptcha();
  }, []);

  // Draw CAPTCHA whenever code changes
  useEffect(() => {
    if (captchaCode && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Clear and Set Background
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#f1f5f9'; // slate-100
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add Noise (Curves)
        ctx.strokeStyle = '#cbd5e1'; // slate-300
        ctx.lineWidth = 2;
        for (let i = 0; i < 7; i++) {
          ctx.beginPath();
          ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
          ctx.bezierCurveTo(
            Math.random() * canvas.width, Math.random() * canvas.height,
            Math.random() * canvas.width, Math.random() * canvas.height,
            Math.random() * canvas.width, Math.random() * canvas.height
          );
          ctx.stroke();
        }

        // Add Noise (Dots)
        ctx.fillStyle = '#94a3b8'; // slate-400
        for (let i = 0; i < 50; i++) {
          ctx.beginPath();
          ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 1, 0, 2 * Math.PI);
          ctx.fill();
        }

        // Text settings
        ctx.font = 'bold 30px "Courier New", monospace';
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        
        // Draw characters with random rotation and spacing
        const chars = captchaCode.split('');
        const startX = 35;
        const spacing = 28;
        
        chars.forEach((char, index) => {
          ctx.save();
          // Calculate position with some randomness
          const x = startX + (index * spacing);
          const y = canvas.height / 2 + (Math.random() * 6 - 3);
          const angle = (Math.random() - 0.5) * 0.4; // +/- 0.2 radians
          
          ctx.translate(x, y);
          ctx.rotate(angle);
          ctx.fillStyle = '#0f172a'; // slate-900
          ctx.fillText(char, 0, 0);
          ctx.restore();
        });
      }
    }
  }, [captchaCode]);

  const refreshCaptcha = () => {
    // Exclude confusing characters like 0, O, 1, l, I
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz'; 
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(result);
    setCaptchaInput('');
  };

  // --- Password Validation Logic ---
  const passwordRequirements = [
    { id: 'len', label: "At least 8 characters", valid: formData.password.length >= 8 },
    { id: 'upper', label: "Includes uppercase letter", valid: /[A-Z]/.test(formData.password) },
    { id: 'lower', label: "Includes lowercase letter", valid: /[a-z]/.test(formData.password) },
    { id: 'num', label: "Includes number", valid: /[0-9]/.test(formData.password) },
    { id: 'spec', label: "Includes special char (!@#$%)", valid: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password) },
  ];

  // Check if password contains name parts (if name part is > 2 chars)
  const nameParts = formData.name.toLowerCase().split(' ').filter(part => part.length > 2);
  const containsName = nameParts.length > 0 && nameParts.some(part => formData.password.toLowerCase().includes(part));

  const isPasswordStrong = !containsName && passwordRequirements.every(req => req.valid);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // CAPTCHA Verification (Case Insensitive)
    if (captchaInput.toLowerCase() !== captchaCode.toLowerCase()) {
      setError('Incorrect security code. Please try again.');
      setCaptchaInput('');
      refreshCaptcha(); // Rotate captcha to prevent brute force
      return;
    }

    if (isRegister) {
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        return;
      }
      if (!isPasswordStrong) {
        setError("Please meet all password strength requirements.");
        return;
      }
    }

    setLoading(true);

    try {
      let user;
      if (isRegister) {
        user = await register({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
          specialization: formData.role === UserRole.DOCTOR ? formData.specialization : undefined,
          qualifications: formData.role === UserRole.DOCTOR ? formData.qualifications : undefined,
          experience: formData.role === UserRole.DOCTOR ? formData.experience : undefined,
          consultationFee: formData.role === UserRole.DOCTOR ? formData.consultationFee : undefined,
          password: formData.password // Passed for real backend
        } as any);
      } else {
        user = await login(formData.email, formData.password, formData.role);
      }
      
      if (user.role === UserRole.DOCTOR) {
        navigate('/doctor-dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Authentication failed. Please check your credentials.');
      refreshCaptcha(); 
      setCaptchaInput('');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 md:p-8 relative">
      {/* Back Button */}
      <Link 
        to="/" 
        className="absolute top-4 left-4 md:top-8 md:left-8 flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors font-medium z-10 bg-white/50 backdrop-blur-sm px-3 py-1.5 rounded-full md:bg-transparent md:p-0"
      >
        <ArrowLeft size={20} /> <span className="hidden sm:inline">Back to Home</span>
      </Link>

      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row animate-fade-in my-12 md:my-0">
        
        {/* Left Side - Visual */}
        <div className="md:w-5/12 bg-blue-600 p-8 text-white flex flex-col justify-between relative overflow-hidden shrink-0">
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
            </svg>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-8">
              <Activity className="w-8 h-8" />
              <span className="text-2xl font-bold">HopCare</span>
            </div>
            <h2 className="text-3xl font-bold mb-4">
              {isRegister ? "Join our Community" : "Welcome Back"}
            </h2>
            <p className="text-blue-100 leading-relaxed">
              {isRegister 
                ? "Start your journey towards better health management. Connect with top specialists and track your well-being." 
                : "Access your dashboard, manage appointments, and get AI-powered health insights instantly."}
            </p>
          </div>

          <div className="relative z-10 mt-12 hidden md:block">
            <div className="flex items-center gap-2 text-sm bg-blue-500/50 p-4 rounded-xl backdrop-blur-sm">
              <ShieldCheck size={20} className="shrink-0" />
              <p>Your data is encrypted and secure with HIPAA compliant standards.</p>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="md:w-7/12 p-6 md:p-12 overflow-y-auto overflow-x-hidden max-h-[none] md:max-h-[90vh]">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-slate-900">
              {isRegister ? "Create Account" : "Sign In"}
            </h3>
            <p className="text-slate-500 mt-2">
              {isRegister ? "Already have an account?" : "New to HopCare?"}{" "}
              <Link 
                to={isRegister ? "/login" : "/register"} 
                className="text-blue-600 font-bold hover:underline"
              >
                {isRegister ? "Login here" : "Register now"}
              </Link>
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 flex items-center gap-2 animate-fade-in border border-red-100">
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {isRegister && (
              <>
                {/* Role Selection */}
                <div className="grid grid-cols-2 gap-4 mb-2">
                  <label className={`cursor-pointer border-2 rounded-xl p-3 flex flex-col items-center justify-center gap-2 transition-all h-full ${formData.role === UserRole.PATIENT ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-100 hover:border-blue-300'}`}>
                    <input 
                      type="radio" 
                      name="role" 
                      value={UserRole.PATIENT} 
                      checked={formData.role === UserRole.PATIENT} 
                      onChange={handleChange} 
                      className="hidden" 
                    />
                    <User size={24} />
                    <span className="font-bold text-sm">I'm a Patient</span>
                  </label>
                  <label className={`cursor-pointer border-2 rounded-xl p-3 flex flex-col items-center justify-center gap-2 transition-all h-full ${formData.role === UserRole.DOCTOR ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-100 hover:border-blue-300'}`}>
                    <input 
                      type="radio" 
                      name="role" 
                      value={UserRole.DOCTOR} 
                      checked={formData.role === UserRole.DOCTOR} 
                      onChange={handleChange} 
                      className="hidden" 
                    />
                    <Stethoscope size={24} />
                    <span className="font-bold text-sm">I'm a Doctor</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 h-12 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                    placeholder="John Doe"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    name="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 h-12 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                    placeholder="+91 (555) 000-0000"
                  />
                </div>

                {formData.role === UserRole.DOCTOR && (
                  <div className="bg-slate-50 p-4 rounded-xl space-y-4 border border-slate-100">
                    <h4 className="font-bold text-slate-700 text-sm">Professional Details</h4>
                    
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Specialization</label>
                      <select
                        name="specialization"
                        value={formData.specialization}
                        onChange={handleChange}
                        className="w-full px-4 h-12 rounded-lg border border-slate-200 focus:border-blue-500 outline-none text-sm bg-white"
                        required
                      >
                        <option value="">Select Specialization</option>
                        {MEDICAL_SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Experience (Years)</label>
                        <input
                          name="experience"
                          type="number"
                          min="0"
                          value={formData.experience}
                          onChange={handleChange}
                          className="w-full px-4 h-12 rounded-lg border border-slate-200 focus:border-blue-500 outline-none text-sm"
                          placeholder="e.g. 5"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Consultation Fee (₹)</label>
                        <input
                          name="consultationFee"
                          type="number"
                          min="0"
                          value={formData.consultationFee}
                          onChange={handleChange}
                          className="w-full px-4 h-12 rounded-lg border border-slate-200 focus:border-blue-500 outline-none text-sm"
                          placeholder="e.g. 800"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 h-12 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
              <input
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 h-12 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                placeholder="••••••••"
              />
              
              {/* Password Requirements Checklist (Register Mode Only) */}
              {isRegister && (
                <div className="mt-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <p className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Password Requirements</p>
                  <div className="grid grid-cols-1 gap-1.5">
                    {passwordRequirements.map(req => (
                      <div key={req.id} className={`flex items-center gap-2 text-xs transition-colors ${req.valid ? 'text-green-600 font-medium' : 'text-slate-400'}`}>
                        {req.valid ? (
                          <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                            <Check size={10} className="text-green-600" />
                          </div>
                        ) : (
                          <div className="w-4 h-4 rounded-full bg-slate-200 shrink-0" />
                        )}
                        <span>{req.label}</span>
                      </div>
                    ))}
                    {/* Name Check */}
                    {containsName && (
                      <div className="flex items-center gap-2 text-xs text-red-500 font-medium animate-fade-in">
                         <div className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                            <X size={10} className="text-red-500" />
                         </div>
                         <span>Cannot contain your name</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {isRegister && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Confirm Password</label>
                <input
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 h-12 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            )}

            {/* Visual CAPTCHA */}
            <div className="pt-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Security Check</label>
              <div className="flex flex-col sm:flex-row gap-4 items-stretch">
                <div className="relative group cursor-pointer w-full sm:w-auto shrink-0" onClick={refreshCaptcha} title="Click to refresh">
                  <canvas 
                    ref={canvasRef} 
                    width="200" 
                    height="46" 
                    className="w-full sm:w-auto rounded-lg border border-slate-200 bg-slate-100 block"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors rounded-lg flex items-center justify-center">
                    <RefreshCw size={16} className="text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                <input
                  type="text"
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  placeholder="Enter code"
                  className="flex-1 px-4 h-12 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none tracking-widest font-mono text-center sm:text-left text-lg"
                  maxLength={6}
                />
              </div>
              <p className="text-xs text-slate-400 mt-1">Enter the characters shown in the image.</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 mt-4"
            >
              {loading && <RefreshCw className="animate-spin" size={20} />}
              {isRegister ? 'Create Account' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};