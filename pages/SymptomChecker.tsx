import React, { useState } from 'react';
import { api } from '../services/api';
import { AiRecord } from '../types';
import { BrainCircuit, AlertTriangle, CheckCircle, RefreshCw, ChevronRight, Stethoscope, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const SymptomChecker: React.FC = () => {
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AiRecord | null>(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptoms.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const analysis = await api.analyzeSymptoms(symptoms);
      const record: AiRecord = {
        ...analysis,
        id: Math.random().toString(36).substr(2, 9),
        date: new Date().toISOString(),
        symptoms
      };
      
      await api.saveAiRecord(record);
      setResult(record);
    } catch (err) {
      setError('Could not analyze symptoms. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold uppercase tracking-wider mb-4">
          <BrainCircuit size={14} /> Smart Logic Powered
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Symptom Checker</h1>
        <p className="text-slate-500">Describe your symptoms below to get an instant smart assessment. This is not a substitute for professional medical advice.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Input Form */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <form onSubmit={handleAnalyze}>
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                What are you feeling?
              </label>
              <textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="e.g., I have a throbbing headache, sensitivity to light, and slight nausea..."
                className="w-full h-40 p-4 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none resize-none transition-all text-slate-600 mb-4"
                required
              />
              <button
                type="submit"
                disabled={loading || !symptoms}
                className="w-full bg-purple-600 text-white font-semibold py-3 rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2"
              >
                {loading ? <RefreshCw className="animate-spin" size={20} /> : <BrainCircuit size={20} />}
                {loading ? 'Analyzing...' : 'Analyze Symptoms'}
              </button>
            </form>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-xl flex gap-3 text-yellow-800">
            <AlertTriangle className="shrink-0" size={20} />
            <p className="text-sm leading-relaxed">
              <strong>Disclaimer:</strong> This tool uses rule-based logic for educational purposes only. Always consult a qualified doctor for diagnosis and treatment.
            </p>
          </div>
        </div>

        {/* Results Section */}
        <div>
          {result ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-lg overflow-hidden animate-fade-in">
              <div className="bg-purple-600 p-6 text-white">
                <div className="flex items-center gap-2 opacity-80 mb-1 text-sm font-medium">
                  <BrainCircuit size={16} /> Analysis Complete
                </div>
                <h3 className="text-2xl font-bold">{result.prediction}</h3>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Confidence Level</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-purple-500 rounded-full" 
                        style={{ width: result.confidence.includes('High') ? '90%' : result.confidence.includes('Medium') ? '60%' : '30%' }}
                      />
                    </div>
                    <span className="text-sm font-bold text-purple-700">{result.confidence}</span>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Recommendation</div>
                  <p className="text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                    {result.recommendation}
                  </p>
                </div>

                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Suggested Specialist</div>
                  <div className="flex items-center justify-between bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <div className="flex items-center gap-3">
                      <div className="bg-white p-2 rounded-lg text-blue-600 shadow-sm">
                        <Stethoscope size={20} />
                      </div>
                      <span className="font-bold text-blue-900">{result.specialist}</span>
                    </div>
                    <Link 
                      to="/book-appointment" 
                      state={{ specialist: result.specialist }}
                      className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-blue-700 transition-colors flex items-center gap-1"
                    >
                      Book <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>

                <button 
                  onClick={() => { setSymptoms(''); setResult(null); }}
                  className="w-full py-2 text-slate-500 font-medium hover:text-slate-700 transition-colors"
                >
                  Start New Check
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center p-8 text-slate-400">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                <CheckCircle size={32} className="text-slate-300" />
              </div>
              <p className="font-medium">Results will appear here</p>
              <p className="text-sm mt-1">Submit your symptoms to see the analysis.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};