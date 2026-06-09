import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Loader2 } from 'lucide-react';
import { analyzeSymptoms } from '../services/geminiService';

const FAQ_CHIPS = [
  { label: '📅 Book Appointment',  question: 'How do I book an appointment?' },
  { label: '❌ Cancel Booking',    question: 'How do I cancel my appointment?' },
  { label: '💊 Prescription',      question: 'How do I download my prescription?' },
  { label: '📹 Video Call',        question: 'How do I join a video call?' },
  { label: '🩺 Check Symptoms',    question: 'How do I use the symptom checker?' },
  { label: '💰 Fees & Costs',      question: 'What are the fees and costs?' },
];

export const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ id: string, text: string, sender: 'user' | 'bot' }[]>([
    { id: '1', text: 'Hi! I am the HopCare AI assistant. How can I help you today?', sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const getBotResponse = async (text: string): Promise<string> => {
    const lowerInput = text.toLowerCase();
    await new Promise(r => setTimeout(r, 600 + Math.random() * 600));

    if (/(emergency|heart attack|stroke|chest pain|dying|suicide|urgent|911|severe bleeding)/.test(lowerInput)) {
      return '🚨 **MEDICAL EMERGENCY WARNING:** I am an AI, not a doctor. If you are experiencing a life-threatening medical emergency, please call emergency services (like 911) or go to the nearest emergency room immediately!';
    } else if (/(hi|hello|hey|greetings|morning|afternoon)/.test(lowerInput) && lowerInput.split(' ').length < 5) {
      return 'Hello! 👋 I am the HopCare AI Assistant. You can ask me anything about:\n• Booking & Canceling Appointments 📅\n• Downloading Prescriptions 💊\n• Joining Video Calls 📹\n• Checking Symptoms 🩺\n• Managing Your Profile & Settings ⚙️\n\nWhat can I help you with today?';
    } else if (/(prescription|medicine|medication|download pdf|record|history)/.test(lowerInput)) {
      return '💊 **To view and download a prescription:**\n1. Log in and go to your **Patient Dashboard**.\n2. Scroll down to Medical History & Prescriptions.\n3. Click on a completed appointment.\n4. Click the Download button in the blue Prescription box to save it as a PDF!\n\n*(Note: This only appears after the doctor marks the consultation as completed).*';
    } else if (/(video|call|join|camera|mic|microphone|consultation)/.test(lowerInput)) {
      return '📹 **To join a video consultation:**\n1. Ensure your appointment status is Confirmed by the doctor.\n2. Go to your Dashboard and click Join Video Call.\n3. A screen will open where your camera and microphone will connect automatically (ensure you click Allow when prompted by your browser).';
    } else if (/(book|schedule|appointment|find doctor|meet)/.test(lowerInput) && !/(cancel|delete)/.test(lowerInput)) {
      return '📅 **To book an appointment:**\n1. Go to your Dashboard and click Book Appointment.\n2. Browse specialists.\n3. Create your booking.\n\nNot sure which specialist to pick? Tell me your symptoms!';
    } else if (/(cancel|delete|reschedule|remove)/.test(lowerInput)) {
      return '❌ **To cancel or reschedule:**\n1. Go to your Dashboard.\n2. Click on the pending or confirmed appointment you want to cancel.\n3. Click the Cancel Booking (Trash) button.\n*(If you want to reschedule, just cancel the old one and book a new one!)*';
    } else if (/(profile|account|setting|password|name|email|phone)/.test(lowerInput)) {
      return '⚙️ **To manage your account:**\nClick Profile in the top navigation or sidebar. There you can instantly update your Name, Email, Phone number, or Password.\n*(Ensure you click Save Changes when you are done).*';
    } else if (/(cost|pay|price|fee|subscription|money|charge)/.test(lowerInput)) {
      return '💰 **Fees & Costs:**\n🆓 AI Symptom Checking is **100% Free**.\n💳 Doctor consultation fees depend entirely on the individual doctor.\n📋 During booking, you will see the exact Consultation Fee listed next to the doctor\'s name.';
    } else if (/(doctor|availability|complete|dashboard)/.test(lowerInput) && /(how|for)/.test(lowerInput)) {
      return '👨‍⚕️ **For Doctors:**\n📆 **Availability:** Click the time slots on your Dashboard to set when you are working.\n📋 **Appointments:** Accept/Reject pending bookings from your inbox.\n💊 **Prescriptions:** Click a patient, click Complete, then type your remarks in the text box and hit Save Prescription!';
    } else if (/(symptom checker|how to use|help|guide|what can you do)/.test(lowerInput)) {
      return '🩺 **I am your HopCare AI Guide!**\nBesides answering app questions, I am a Symptom Checker. Just tell me how you feel (e.g., I have a severe headache and nausea) and I will analyze it instantly, providing a predicted condition and a specialist recommendation!';
    } else if (/(support|human|agent|customer service|contact)/.test(lowerInput)) {
      return '📞 **Contact Support:**\nIf you need technical help beyond what I can provide, please email **support@hopcare.com** or call our toll-free helpdesk. I am an AI, but our human team is ready to help!';
    } else if (/(thank|thanks|appreciate)/.test(lowerInput) && lowerInput.split(' ').length < 6) {
      return 'You are very welcome! Stay healthy, and do not hesitate to ask me anything else. 😊';
    } else {
      const result = await analyzeSymptoms(text);
      if (!result || result.prediction === "Unknown") {
        return 'I am not completely sure I understand. If you have a question about HopCare (like booking, prescriptions, or video calls), please rephrase it. If you are describing symptoms, could you provide more specific details?';
      } else {
        return `Based on your symptoms, this might be related to **${result.prediction}**.\n\n💡 **Recommendation:**\n${result.recommendation}\n\n👨‍⚕️ **Suggested Specialist:**\nYou should consult a **${result.specialist}**. *(Note: I am an AI, not a doctor. Consult a professional for real advice).*`;
      }
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isTyping) return;
    const userMessage = { id: Date.now().toString(), text: text.trim(), sender: 'user' as const };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    try {
      const botResponseText = await getBotResponse(text.trim());
      setMessages(prev => [...prev, { id: Date.now().toString(), text: botResponseText, sender: 'bot' }]);
    } catch {
      setMessages(prev => [...prev, { id: Date.now().toString(), text: 'Sorry, I am having trouble connecting right now.', sender: 'bot' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    await sendMessage(input);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-4 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-all z-40 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
      >
        <MessageSquare size={24} />
      </button>

      {/* Chat Window */}
      <div className={`fixed bottom-6 right-6 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl flex flex-col z-50 transform transition-all origin-bottom-right duration-300 ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`} style={{ height: '500px', maxHeight: '80vh' }}>

        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-blue-600 text-white rounded-t-2xl shadow-sm">
          <div className="flex items-center gap-2">
            <Bot size={20} />
            <h3 className="font-bold">HopCare Assistant</h3>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Message List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.sender === 'user' ? 'bg-indigo-100 text-indigo-600' : 'bg-blue-100 text-blue-600'}`}>
                {msg.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`p-3 rounded-2xl max-w-[75%] text-sm whitespace-pre-wrap ${
                msg.sender === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none shadow-sm'
              }`}>
                {msg.text.split('**').map((part, i) => (
                  i % 2 === 1 ? <strong key={i} className={msg.sender === 'bot' ? 'text-slate-900' : ''}>{part}</strong> : <span key={i}>{part}</span>
                ))}
              </div>
            </div>
          ))}

          {/* FAQ Chips — shown after every bot message */}
          {!isTyping && messages.length > 0 && messages[messages.length - 1].sender === 'bot' && (
            <div className="pl-11 flex flex-wrap gap-2">
              {FAQ_CHIPS.map(chip => (
                <button
                  key={chip.label}
                  onClick={() => sendMessage(chip.question)}
                  className="text-xs bg-white border border-blue-200 text-blue-600 px-3 py-1.5 rounded-full hover:bg-blue-50 active:bg-blue-100 transition-colors font-medium shadow-sm"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          )}

          {isTyping && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <Loader2 size={16} className="animate-spin" />
              </div>
              <div className="p-3 bg-white border border-slate-100 text-slate-400 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-100 rounded-b-2xl">
          <form onSubmit={handleSend} className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              <Send size={18} className="translate-x-[1px]" />
            </button>
          </form>
        </div>

      </div>
    </>
  );
};
