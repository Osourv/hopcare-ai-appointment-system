import { AiRecord } from "../types";

interface Condition {
  keywords: string[];
  heavyKeywords: string[]; // worth 2 points each
  prediction: string;
  specialist: string;
  recommendation: string;
  priority: number; // higher = wins ties
  urgent?: boolean; // show seek-immediate-care warning
}

const CONDITIONS_DB: Condition[] = [
  {
    heavyKeywords: ['chest pain', 'heart attack', 'left arm', 'jaw pain', 'cardiac'],
    keywords: ['chest', 'pressure', 'tight', 'palpitation', 'irregular heartbeat', 'shortness of breath', 'sweating', 'radiating'],
    prediction: "Potential Cardiac Issue",
    specialist: "Cardiologist",
    recommendation: "Chest pain with other symptoms may indicate a serious cardiac condition. If pain is severe or radiates to the arm or jaw, call emergency services immediately. Avoid strenuous activity and consult a cardiologist urgently.",
    priority: 10, urgent: true
  },
  {
    heavyKeywords: ['stroke', 'facial droop', 'slurred speech', 'sudden numbness', 'vision loss'],
    keywords: ['paralysis', 'confusion', 'sudden headache', 'balance', 'arm weakness'],
    prediction: "Possible Stroke / Neurological Emergency",
    specialist: "Neurologist",
    recommendation: "These symptoms may indicate a stroke — a medical emergency. Call emergency services (112/911) immediately. Time is critical for stroke treatment.",
    priority: 10, urgent: true
  },
  {
    heavyKeywords: ['high fever', 'dengue', 'malaria', 'chills', 'platelet'],
    keywords: ['fever', 'body ache', 'bone pain', 'rash', 'sweating', 'shivering', 'mosquito', 'tropical'],
    prediction: "Dengue / Malaria Fever",
    specialist: "General Physician",
    recommendation: "High fever with body aches and chills may indicate dengue or malaria. Get a blood test (CBC/dengue NS1 antigen) immediately. Stay hydrated and avoid self-medication with NSAIDs.",
    priority: 8, urgent: true
  },
  {
    heavyKeywords: ['difficulty breathing', 'breathless', 'wheezing', 'inhaler', 'asthma attack'],
    keywords: ['breath', 'wheeze', 'chest tight', 'cough', 'respiratory', 'oxygen', 'blue lips'],
    prediction: "Asthma / Respiratory Distress",
    specialist: "Pulmonologist",
    recommendation: "Breathing difficulties need prompt attention. Use your inhaler if prescribed. If breathlessness is severe or lips turn blue, seek emergency care immediately.",
    priority: 9, urgent: true
  },
  {
    heavyKeywords: ['pneumonia', 'phlegm', 'productive cough', 'green mucus', 'yellow mucus'],
    keywords: ['fever', 'cough', 'chest', 'breathless', 'fatigue', 'chills', 'night sweats', 'lung'],
    prediction: "Pneumonia / Chest Infection",
    specialist: "Pulmonologist",
    recommendation: "Fever with productive cough and chest discomfort may indicate pneumonia. A chest X-ray and blood test are recommended. Avoid cold environments and consult a doctor promptly.",
    priority: 7
  },
  {
    heavyKeywords: ['migraine', 'severe headache', 'aura', 'throbbing head'],
    keywords: ['headache', 'light sensitivity', 'nausea', 'dizzy', 'visual disturbance', 'vomiting', 'one side'],
    prediction: "Migraine / Tension Headache",
    specialist: "Neurologist",
    recommendation: "Rest in a dark, quiet room. Stay hydrated and avoid screen exposure. Over-the-counter pain relief may help mild episodes. If headaches are frequent or worsening, consult a neurologist.",
    priority: 6
  },
  {
    heavyKeywords: ['jaundice', 'yellow skin', 'yellow eyes', 'hepatitis', 'liver'],
    keywords: ['fatigue', 'dark urine', 'pale stool', 'abdominal pain', 'nausea', 'right side pain'],
    prediction: "Liver / Hepatitis Issue",
    specialist: "Gastroenterologist",
    recommendation: "Yellow discoloration of skin or eyes is a serious sign of liver involvement. Avoid alcohol and fatty foods. Get liver function tests (LFT) done immediately.",
    priority: 8, urgent: true
  },
  {
    heavyKeywords: ['cold', 'runny nose', 'sore throat', 'flu', 'influenza'],
    keywords: ['fever', 'cough', 'sneeze', 'congestion', 'body ache', 'fatigue', 'mild fever', 'throat pain'],
    prediction: "Viral Infection / Flu",
    specialist: "General Physician",
    recommendation: "Rest well and drink plenty of warm fluids. Monitor temperature — if fever exceeds 103°F (39.4°C) or persists beyond 5 days, consult a doctor. Paracetamol can help reduce fever.",
    priority: 5
  },
  {
    heavyKeywords: ['covid', 'corona', 'loss of taste', 'loss of smell', 'covid-19'],
    keywords: ['fever', 'cough', 'fatigue', 'breathless', 'body ache', 'sore throat', 'headache', 'diarrhea'],
    prediction: "Possible COVID-19 / Viral Respiratory Infection",
    specialist: "General Physician",
    recommendation: "Isolate yourself and get tested for COVID-19. Monitor oxygen levels (SpO2 should be above 94%). Rest, hydrate, and consult a doctor if symptoms worsen or breathing becomes difficult.",
    priority: 7
  },
  {
    heavyKeywords: ['food poisoning', 'contaminated food', 'ate bad', 'food allergy'],
    keywords: ['vomiting', 'diarrhea', 'nausea', 'cramps', 'stomach ache', 'bloating', 'ate', 'food'],
    prediction: "Food Poisoning / Gastroenteritis",
    specialist: "Gastroenterologist",
    recommendation: "Stay hydrated with ORS (oral rehydration solution). Avoid solid foods until vomiting subsides. If symptoms persist beyond 48 hours or you notice blood in stool, seek immediate medical attention.",
    priority: 6
  },
  {
    heavyKeywords: ['acid reflux', 'heartburn', 'gastritis', 'ulcer', 'acidity'],
    keywords: ['stomach', 'indigestion', 'bloat', 'burp', 'upper abdominal', 'after eating', 'burning sensation'],
    prediction: "Gastritis / Acid Reflux",
    specialist: "Gastroenterologist",
    recommendation: "Avoid spicy, oily, and acidic foods. Eat smaller, frequent meals. Antacids can provide temporary relief. Avoid lying down immediately after eating. Consult a gastroenterologist if symptoms persist.",
    priority: 5
  },
  {
    heavyKeywords: ['appendicitis', 'right side pain', 'lower right abdomen'],
    keywords: ['abdominal pain', 'nausea', 'fever', 'vomiting', 'loss of appetite', 'pain worse on movement'],
    prediction: "Possible Appendicitis",
    specialist: "General Surgeon",
    recommendation: "Right lower abdominal pain with fever and nausea may indicate appendicitis — a surgical emergency. Do NOT take painkillers or laxatives. Go to an emergency room immediately.",
    priority: 9, urgent: true
  },
  {
    heavyKeywords: ['diabetes', 'blood sugar', 'insulin', 'hyperglycemia'],
    keywords: ['thirst', 'frequent urination', 'fatigue', 'weight loss', 'blurry vision', 'slow healing', 'tingling', 'hunger'],
    prediction: "Possible Diabetes / Blood Sugar Issue",
    specialist: "Endocrinologist",
    recommendation: "Excessive thirst, frequent urination, and unexplained fatigue are classic diabetes symptoms. Get a fasting blood glucose test and HbA1c test. Reduce sugary foods and maintain a healthy lifestyle.",
    priority: 7
  },
  {
    heavyKeywords: ['hypertension', 'high blood pressure', 'bp high'],
    keywords: ['headache', 'dizziness', 'blurred vision', 'nosebleed', 'pounding head', 'neck pain', 'morning headache'],
    prediction: "Hypertension / High Blood Pressure",
    specialist: "Cardiologist",
    recommendation: "Persistent headaches with dizziness may indicate high blood pressure. Check your BP regularly. Reduce salt intake, avoid stress, and consult a cardiologist if BP consistently exceeds 140/90 mmHg.",
    priority: 7
  },
  {
    heavyKeywords: ['uti', 'urinary infection', 'kidney infection', 'burning urine'],
    keywords: ['urination', 'burning', 'frequent urination', 'cloudy urine', 'lower back pain', 'pelvic pain', 'strong odor'],
    prediction: "Urinary Tract Infection (UTI)",
    specialist: "Urologist",
    recommendation: "Drink plenty of water (at least 8 glasses a day). Avoid holding urine for long periods. A urine culture test can confirm UTI. Antibiotics are required — consult a doctor before self-medicating.",
    priority: 6
  },
  {
    heavyKeywords: ['skin rash', 'hives', 'eczema', 'psoriasis', 'dermatitis'],
    keywords: ['skin', 'rash', 'itch', 'redness', 'dry skin', 'bump', 'blister', 'peel', 'scaling'],
    prediction: "Dermatitis / Skin Condition",
    specialist: "Dermatologist",
    recommendation: "Keep the affected area clean and avoid scratching. Use fragrance-free moisturizers. Avoid known irritants. If rash spreads rapidly or is accompanied by fever, consult a dermatologist promptly.",
    priority: 5
  },
  {
    heavyKeywords: ['joint pain', 'arthritis', 'rheumatoid', 'gout'],
    keywords: ['joint', 'knee pain', 'back pain', 'stiff', 'swollen joint', 'bone', 'muscle pain', 'limping'],
    prediction: "Arthritis / Joint Pain",
    specialist: "Orthopedist",
    recommendation: "Rest the affected joint and apply ice for acute pain or heat for chronic stiffness. Avoid high-impact activities. Anti-inflammatory medication may help. Consult an orthopedist for persistent pain.",
    priority: 5
  },
  {
    heavyKeywords: ['anemia', 'low hemoglobin', 'iron deficiency'],
    keywords: ['fatigue', 'weakness', 'pale', 'tired', 'breathless', 'pale skin', 'cold hands', 'dizziness', 'hair loss'],
    prediction: "Anemia / Iron Deficiency",
    specialist: "General Physician",
    recommendation: "Include iron-rich foods (spinach, lentils, red meat) in your diet. Get a complete blood count (CBC) test to confirm anemia. Your doctor may prescribe iron supplements based on test results.",
    priority: 5
  },
  {
    heavyKeywords: ['thyroid', 'hypothyroidism', 'hyperthyroidism'],
    keywords: ['weight gain', 'weight loss', 'fatigue', 'hair loss', 'cold intolerance', 'heat intolerance', 'neck swelling', 'slow heart', 'fast heart'],
    prediction: "Thyroid Disorder",
    specialist: "Endocrinologist",
    recommendation: "Unexplained weight changes with fatigue may indicate a thyroid issue. Get a TSH (thyroid-stimulating hormone) blood test. Thyroid disorders are highly manageable with proper medication.",
    priority: 6
  },
  {
    heavyKeywords: ['sinusitis', 'sinus infection', 'nasal congestion', 'blocked nose'],
    keywords: ['sneeze', 'runny nose', 'watery eyes', 'itchy eyes', 'post nasal drip', 'facial pressure', 'smell loss', 'headache'],
    prediction: "Sinusitis / Nasal Allergy",
    specialist: "ENT Specialist",
    recommendation: "Use saline nasal rinse to clear congestion. Stay away from allergens (dust, pollen, pet dander). Steam inhalation can help relieve sinus pressure. Consult an ENT if symptoms persist beyond 10 days.",
    priority: 4
  },
  {
    heavyKeywords: ['anxiety', 'panic attack', 'depression', 'mental health'],
    keywords: ['sad', 'worried', 'stress', 'panic', 'sleep', 'insomnia', 'hopeless', 'nervous', 'fear', 'mood swings', 'crying'],
    prediction: "Anxiety / Mental Health Concern",
    specialist: "Psychiatrist",
    recommendation: "Practice mindfulness, deep breathing, and regular physical activity. Limit caffeine and screen time. Talk to someone you trust. Seeking professional help from a therapist or psychiatrist is a sign of strength, not weakness.",
    priority: 5
  },
  {
    heavyKeywords: ['tooth pain', 'toothache', 'gum disease', 'dental'],
    keywords: ['tooth', 'gum', 'mouth', 'bleeding gums', 'sensitive teeth', 'jaw pain', 'swollen gum', 'bad breath'],
    prediction: "Dental / Oral Health Issue",
    specialist: "Dentist",
    recommendation: "Rinse with warm salt water to reduce pain temporarily. Avoid very hot, cold, or sweet foods. Schedule a dental appointment as soon as possible — untreated dental issues can worsen quickly.",
    priority: 4
  },
  {
    heavyKeywords: ['eye pain', 'eye infection', 'conjunctivitis', 'pink eye'],
    keywords: ['vision', 'eye', 'blur', 'watery eyes', 'red eye', 'itchy eyes', 'eye strain', 'double vision', 'floaters'],
    prediction: "Eye Condition / Vision Problem",
    specialist: "Ophthalmologist",
    recommendation: "Avoid rubbing your eyes. Follow the 20-20-20 rule for screen fatigue (every 20 min, look 20 feet away for 20 sec). If vision is blurry or pain persists, consult an ophthalmologist promptly.",
    priority: 4
  },
  {
    heavyKeywords: ['ear pain', 'ear infection', 'hearing loss', 'tinnitus'],
    keywords: ['ear', 'hearing', 'ringing', 'ear wax', 'discharge from ear', 'balance problem', 'vertigo'],
    prediction: "Ear Infection / Hearing Issue",
    specialist: "ENT Specialist",
    recommendation: "Keep the ear dry and avoid inserting objects into the ear canal. For ringing or balance issues, consult an ENT specialist. Do not self-treat with ear drops without a prescription.",
    priority: 4
  },
  {
    heavyKeywords: ['kidney stone', 'renal stone', 'flank pain'],
    keywords: ['severe back pain', 'painful urination', 'blood in urine', 'lower back', 'groin pain', 'nausea', 'vomiting'],
    prediction: "Kidney Stone / Renal Issue",
    specialist: "Urologist",
    recommendation: "Drink large quantities of water (3-4 liters/day) to help pass small stones. A urine test and ultrasound can confirm kidney stones. Severe flank pain requires immediate medical attention.",
    priority: 7, urgent: true
  },
];

export const analyzeSymptoms = async (symptoms: string): Promise<Omit<AiRecord, 'id' | 'date'>> => {
  await new Promise(resolve => setTimeout(resolve, 1200));

  const lower = symptoms.toLowerCase();

  // Check for emergency keywords first
  const emergencyWords = ['unconscious', 'not breathing', 'collapse', 'severe chest pain', 'stroke', 'heart attack'];
  if (emergencyWords.some(w => lower.includes(w))) {
    return {
      symptoms,
      prediction: "Medical Emergency",
      confidence: "High",
      recommendation: "🚨 This may be a life-threatening emergency. Call 112 / 911 immediately or go to the nearest emergency room.",
      specialist: "Emergency Medicine"
    };
  }

  // Severity multiplier
  const severityBoost = /(severe|intense|unbearable|worst|extreme|sudden|acute)/.test(lower) ? 1 : 0;

  // Score each condition
  const scored = CONDITIONS_DB.map(condition => {
    const heavyScore = condition.heavyKeywords.filter(k => lower.includes(k)).length * 2;
    const lightScore = condition.keywords.filter(k => lower.includes(k)).length;
    const total = heavyScore + lightScore + (heavyScore > 0 ? severityBoost : 0);
    return { condition, score: total };
  }).filter(s => s.score > 0)
    .sort((a, b) => b.score !== a.score ? b.score - a.score : b.condition.priority - a.condition.priority);

  if (scored.length === 0) {
    return {
      symptoms,
      prediction: "General Symptoms",
      confidence: "Low",
      recommendation: "Your symptoms are unclear or too general. Please describe your symptoms in more detail (e.g., location, duration, severity). Consulting a General Physician is always a safe first step.",
      specialist: "General Physician"
    };
  }

  const best = scored[0];
  const score = best.score;

  // Build confidence
  const confidence: "High" | "Medium" | "Low" = score >= 5 ? "High" : score >= 3 ? "Medium" : "Low";

  // Add urgency prefix if needed
  const urgencyPrefix = best.condition.urgent
    ? "⚠️ IMPORTANT: "
    : "";

  return {
    symptoms,
    prediction: best.condition.prediction,
    confidence,
    recommendation: urgencyPrefix + best.condition.recommendation,
    specialist: best.condition.specialist
  };
};
