import React, { useState } from 'react';
import { Activity, X, Mail, Phone } from 'lucide-react';

export const Footer: React.FC = () => {
  const [modalType, setModalType] = useState<'privacy' | 'terms' | 'contact' | null>(null);

  const closeModal = () => setModalType(null);

  return (
    <>
      <footer className="bg-white border-t border-slate-200 mt-auto py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col-reverse md:flex-row justify-between items-center gap-6">
            {/* Branding & Copyright */}
            <div className="flex flex-col md:flex-row items-center gap-2 md:gap-8 text-slate-500">
              <div className="flex items-center gap-2">
                <Activity size={18} className="text-blue-600" />
                <span className="font-semibold text-slate-700">HopCare</span>
              </div>
              <p className="text-sm text-slate-400">
                &copy; {new Date().getFullYear()} HopCare. All rights reserved.
              </p>
            </div>

            {/* Links */}
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm font-medium text-slate-600">
              <button onClick={() => setModalType('privacy')} className="hover:text-blue-600 transition-colors">Privacy Policy</button>
              <button onClick={() => setModalType('terms')} className="hover:text-blue-600 transition-colors">Terms of Service</button>
              <button onClick={() => setModalType('contact')} className="hover:text-blue-600 transition-colors">Contact Support</button>
            </div>
          </div>
        </div>
      </footer>

      {/* Modal */}
      {modalType && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in" onClick={closeModal}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative animate-slide-up" onClick={e => e.stopPropagation()}>
            <button onClick={closeModal} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
            
            {modalType === 'privacy' && (
              <>
                <h3 className="text-xl font-bold text-slate-900 mb-4">Privacy Policy</h3>
                <p className="text-slate-600 leading-relaxed text-sm">
                  We respect your privacy. All personal and medical information provided on HopCare is kept secure and is used only for appointment booking and healthcare services. We do not share user data with third parties without consent.
                </p>
              </>
            )}

            {modalType === 'terms' && (
              <>
                <h3 className="text-xl font-bold text-slate-900 mb-4">Terms of Service</h3>
                <p className="text-slate-600 leading-relaxed text-sm">
                  By using HopCare, you agree to use the platform responsibly. HopCare provides appointment booking and basic medical suggestions for informational purposes only and does not replace professional medical advice.
                </p>
              </>
            )}

            {modalType === 'contact' && (
              <>
                <h3 className="text-xl font-bold text-slate-900 mb-4">Contact Support</h3>
                <p className="text-slate-600 leading-relaxed mb-4 text-sm">
                  If you face any issues or have questions, please contact us at:
                </p>
                <div className="space-y-3">
                  <a href="mailto:support@hopcare.com" className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors">
                    <Mail size={20} />
                    <span className="font-medium">support@hopcare.com</span>
                  </a>
                  <a href="tel:+918285399000" className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 text-slate-700 hover:bg-slate-100 transition-colors">
                    <Phone size={20} />
                    <span className="font-medium">+91-8285399000</span>
                  </a>
                </div>
              </>
            )}
            
            <div className="mt-6 flex justify-end">
              <button onClick={closeModal} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors text-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};