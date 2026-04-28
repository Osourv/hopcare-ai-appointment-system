import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, ShieldCheck, Heart, UserPlus, ArrowRight, Baby, Stethoscope, Brain, Sparkles, Utensils } from 'lucide-react';
import { Footer } from '../components/Footer';

export const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navbar */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 text-blue-600">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                <Activity size={20} />
              </div>
              <span className="text-xl font-bold text-slate-900">HopCare</span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-slate-600 font-medium hover:text-blue-600 text-sm sm:text-base">Login</Link>
              <Link to="/register" className="bg-blue-600 text-white px-4 py-2 sm:px-5 rounded-full font-medium hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 text-sm sm:text-base">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-32 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex-1">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-medium mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Smart Healthcare
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900 tracking-tight mb-6 leading-tight">
            Smart Healthcare, <br/>
            <span className="text-blue-600">Simplified for You</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-500 mb-10 leading-relaxed px-2">
            Experience the future of medical assistance. Book appointments instantly, check symptoms with our smart analysis, and manage your health records in one secure platform.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20">
              <UserPlus size={20} /> Create Account
            </Link>
            <Link to="/login" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-slate-700 border border-slate-200 px-8 py-4 rounded-xl font-semibold hover:bg-slate-50 transition-all">
              Login as Doctor
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8 mt-20 mb-12">
          {[
            {
              icon: Heart,
              title: "Patient Centric",
              desc: "Manage your appointments and history with an intuitive dashboard designed for clarity."
            },
            {
              icon: ShieldCheck,
              title: "Secure & Private",
              desc: "Enterprise-grade security ensures your medical data remains confidential and safe."
            },
            {
              icon: Activity,
              title: "Smart Analysis",
              desc: "Get instant preliminary insights on your symptoms using our smart logic engine."
            }
          ].map((feature, idx) => (
            <div key={idx} className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-6">
                <feature.icon size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
              <p className="text-slate-500 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Specialties Section */}
      <div className="py-24 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6 text-center md:text-left">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Book an appointment with trusted doctors</h2>
              <p className="text-slate-500 text-lg">Private online consultations with verified doctors in all specialists</p>
            </div>
            <Link to="/book-appointment" className="inline-flex items-center justify-center px-6 py-2.5 border-2 border-blue-600 text-blue-600 rounded-full font-semibold hover:bg-blue-50 transition-colors whitespace-nowrap mx-auto md:mx-0">
              View All Specialities
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-8">
            {[
              { title: 'Gynaecology', searchTerm: 'Gynecologist', icon: Baby, color: 'bg-purple-100 text-purple-600' },
              { title: 'Sexology', searchTerm: 'Sexologist', icon: Heart, color: 'bg-rose-100 text-rose-600' },
              { title: 'General physician', searchTerm: 'General Physician', icon: Stethoscope, color: 'bg-blue-100 text-blue-600' },
              { title: 'Dermatology', searchTerm: 'Dermatologist', icon: Sparkles, color: 'bg-orange-100 text-orange-600' },
              { title: 'Psychiatry', searchTerm: 'Psychiatrist', icon: Brain, color: 'bg-teal-100 text-teal-600' },
              { title: 'Stomach & digestion', searchTerm: 'Gastroenterologist', icon: Utensils, color: 'bg-amber-100 text-amber-600' },
            ].map((item, idx) => (
              <Link 
                key={idx} 
                to="/book-appointment"
                state={{ specialist: item.searchTerm }}
                className="flex flex-col items-center text-center group cursor-pointer"
              >
                <div className={`w-28 h-28 sm:w-36 sm:h-36 rounded-full ${item.color} flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 shadow-sm border-4 border-white ring-1 ring-slate-100`}>
                  <item.icon size={36} className="sm:w-12 sm:h-12" strokeWidth={1.5} />
                </div>
                <h3 className="font-bold text-slate-900 mb-1 text-sm sm:text-base">{item.title}</h3>
                <span className="text-blue-600 text-xs sm:text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all mt-2">
                  Consult now <ArrowRight size={14} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};