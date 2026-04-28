import { AiRecord } from "../types";

/**
 * SMART LOGIC ENGINE (Rule-Based)
 * 
 * Replaces complex external AI dependencies with a deterministic, local keyword-matching algorithm.
 * This ensures the application runs completely offline and without API keys.
 */

const CONDITIONS_DB = [
  { keywords: ['headache', 'migraine', 'light', 'sensitivity', 'nausea', 'dizzy'], prediction: "Migraine", specialist: "Neurologist", recommendation: "Rest in a dark, quiet room. Stay hydrated and avoid screens." },
  { keywords: ['fever', 'cold', 'cough', 'runny', 'sneeze', 'throat', 'congestion'], prediction: "Viral Infection / Flu", specialist: "General Physician", recommendation: "Rest, drink plenty of fluids, and monitor temperature. Isolate if contagious." },
  { keywords: ['chest', 'pain', 'heart', 'breath', 'pressure', 'tight'], prediction: "Potential Cardiac Issue", specialist: "Cardiologist", recommendation: "Seek immediate medical attention if pain is severe. Consult a cardiologist." },
  { keywords: ['skin', 'rash', 'itch', 'redness', 'dry', 'bump'], prediction: "Dermatitis / Skin Allergy", specialist: "Dermatologist", recommendation: "Avoid irritants, keep area clean and moisturized. Do not scratch." },
  { keywords: ['stomach', 'pain', 'digest', 'acid', 'bloat', 'vomit', 'diarrhea'], prediction: "Gastritis / Indigestion", specialist: "Gastroenterologist", recommendation: "Avoid spicy/oily foods, eat smaller meals, and stay hydrated." },
  { keywords: ['joint', 'pain', 'knee', 'back', 'stiff', 'bone', 'muscle'], prediction: "Arthritis / Muscular Strain", specialist: "Orthopedist", recommendation: "Rest affected area, apply ice/heat as needed. Avoid heavy lifting." },
  { keywords: ['tooth', 'gum', 'pain', 'mouth', 'bleed', 'sensitive'], prediction: "Dental Issue", specialist: "Dentist", recommendation: "Rinse with warm salt water and schedule a dental visit." },
  { keywords: ['vision', 'eye', 'blur', 'see', 'red', 'watery'], prediction: "Vision / Eye Strain", specialist: "Ophthalmologist", recommendation: "Rest eyes, follow the 20-20-20 rule. Avoid rubbing eyes." },
  { keywords: ['ear', 'hear', 'pain', 'ring', 'wax'], prediction: "Ear Infection / Tinnitus", specialist: "ENT Specialist", recommendation: "Keep ear dry, do not insert objects. Consult an ENT if pain persists." },
  { keywords: ['sad', 'anxiety', 'depress', 'mood', 'sleep', 'worry', 'panic'], prediction: "Anxiety / Stress", specialist: "Psychiatrist", recommendation: "Practice deep breathing and relaxation techniques. Talk to a professional." }
];

export const analyzeSymptoms = async (symptoms: string): Promise<Omit<AiRecord, 'id' | 'date'>> => {
  // Simulate network delay for realism (as if calling a real ML model)
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const lowerSymptoms = symptoms.toLowerCase();
  
  // Find best match based on keyword count
  let bestMatch = null;
  let maxCount = 0;

  for (const condition of CONDITIONS_DB) {
    const count = condition.keywords.filter(k => lowerSymptoms.includes(k)).length;
    if (count > maxCount) {
      maxCount = count;
      bestMatch = condition;
    }
  }

  // If we found some matching keywords
  if (bestMatch && maxCount > 0) {
    return {
      symptoms,
      prediction: bestMatch.prediction,
      confidence: maxCount >= 3 ? "High" : "Medium",
      recommendation: bestMatch.recommendation,
      specialist: bestMatch.specialist
    };
  }

  // Default fallback if no keywords match
  return {
    symptoms,
    prediction: "General Symptoms",
    confidence: "Low",
    recommendation: "Your symptoms are nonspecific. Please consult a General Physician for a complete checkup.",
    specialist: "General Physician"
  };
};