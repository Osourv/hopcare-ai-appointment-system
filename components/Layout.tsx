import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { UserRole } from '../types';
import {
  Activity,
  Calendar,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  BrainCircuit,
  Settings,
  ChevronDown,
  ClipboardList,
  Moon,
  Sun
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Footer } from './Footer';
import { Chatbot } from './Chatbot';
import { NotificationBell } from './NotificationBell';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const location = useLocation();

  if (!user) return <>{children}</>;

  const dashboardLink = user.role === UserRole.DOCTOR ? '/doctor-dashboard' : '/dashboard';

  const NavItem = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => {
    const isActive = location.pathname === to;
    return (
      <Link
        to={to}
        onClick={() => setIsMobileMenuOpen(false)}
        className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all duration-200 ${
          isActive 
            ? 'bg-blue-600 text-white shadow-md' 
            : 'text-slate-600 hover:bg-blue-50 hover:text-blue-600'
        }`}
      >
        <Icon size={18} />
        <span>{label}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            
            {/* Logo */}
            <div className="flex items-center gap-2 text-blue-600">
              <Link to={dashboardLink} className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                  <Activity size={20} />
                </div>
                <span className="text-xl font-bold tracking-tight text-slate-900">HopCare</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              <NavItem 
                to={user.role === UserRole.DOCTOR ? '/doctor-dashboard' : '/dashboard'} 
                icon={LayoutDashboard} 
                label="Dashboard" 
              />
              
              {user.role === UserRole.PATIENT && (
                <>
                  <NavItem to="/book-appointment" icon={Calendar} label="Appointments" />
                  <NavItem to="/symptom-checker" icon={BrainCircuit} label="AI Checker" />
                  <NavItem to="/medical-history" icon={ClipboardList} label="History" />
                </>
              )}
            </nav>

            {/* User Profile & Mobile Menu Button */}
            <div className="flex items-center gap-4">

              <button
                onClick={toggleTheme}
                className="p-2 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              <NotificationBell />

              {/* Profile Dropdown (Desktop) */}
              <div className="hidden md:block relative">
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors focus:outline-none"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200 overflow-hidden">
                    {user.image ? (
                      <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon size={16} />
                    )}
                  </div>
                  <span>{user.name}</span>
                  <ChevronDown size={14} className={`transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                </button>

                {isProfileOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setIsProfileOpen(false)}
                    ></div>
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-20 animate-fade-in">
                      <div className="px-4 py-2 border-b border-slate-50">
                        <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                        <p className="text-xs text-slate-500 capitalize">{user.role}</p>
                      </div>
                      <Link 
                        to="/profile"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                      >
                        <Settings size={16} /> My Profile
                      </Link>
                      <button 
                        onClick={logout}
                        className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut size={16} /> Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white">
            <div className="px-4 py-3 space-y-2">
               <NavItem 
                to={user.role === UserRole.DOCTOR ? '/doctor-dashboard' : '/dashboard'} 
                icon={LayoutDashboard} 
                label="Dashboard" 
              />
              {user.role === UserRole.PATIENT && (
                <>
                  <NavItem to="/book-appointment" icon={Calendar} label="Appointments" />
                  <NavItem to="/symptom-checker" icon={BrainCircuit} label="AI Symptom Checker" />
                  <NavItem to="/medical-history" icon={ClipboardList} label="Medical History" />
                </>
              )}
               <NavItem to="/profile" icon={Settings} label="My Profile" />
               <div className="border-t border-slate-100 my-2 pt-2">
                 <div className="flex items-center gap-3 px-4 py-2">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200 overflow-hidden">
                      {user.image ? (
                        <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <UserIcon size={20} />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{user.name}</p>
                      <p className="text-xs text-slate-500 capitalize">{user.role}</p>
                    </div>
                 </div>
                 <button 
                    onClick={logout}
                    className="w-full text-left flex items-center gap-2 px-8 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <LogOut size={16} /> Sign Out
                  </button>
               </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 relative">
        <div className="animate-fade-in">
          {children}
        </div>
      </main>

      {/* Floating AI Chatbot */}
      <Chatbot />

      {/* Footer Component */}
      <Footer />
    </div>
  );
};