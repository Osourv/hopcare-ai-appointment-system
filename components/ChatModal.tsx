import React, { useEffect, useRef, useState } from 'react';
import { api } from '../services/api';
import { Loader2, MessageSquare, Send, X } from 'lucide-react';

interface ChatMessage {
  _id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  content: string;
  createdAt: string;
}

interface ChatModalProps {
  appointmentId: string;
  currentUserId: string;
  otherUserName: string;
  onClose: () => void;
}

export const ChatModal: React.FC<ChatModalProps> = ({ appointmentId, currentUserId, otherUserName, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      const data = await api.getChatMessages(appointmentId);
      setMessages(prev => {
        if (JSON.stringify(prev.map(m => m._id)) === JSON.stringify(data.map((m: ChatMessage) => m._id))) return prev;
        return data;
      });
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [appointmentId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;
    setSending(true);
    setInput('');
    try {
      const newMsg = await api.sendChatMessage(appointmentId, text);
      setMessages(prev => [...prev, newMsg]);
    } catch {
      setInput(text);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-end sm:items-center justify-center sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md flex flex-col animate-slide-up"
        style={{ height: '75vh', maxHeight: '560px' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-blue-600 text-white rounded-t-2xl shrink-0">
          <div className="flex items-center gap-2">
            <MessageSquare size={18} />
            <span className="font-bold text-sm">{otherUserName}</span>
            <span className="w-2 h-2 rounded-full bg-green-400 ml-1" title="Online" />
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center h-full text-slate-400 gap-2">
              <Loader2 size={18} className="animate-spin" /> Loading messages...
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
              <MessageSquare size={32} className="opacity-30" />
              <p className="text-sm">No messages yet. Say hello!</p>
            </div>
          ) : (
            messages.map(msg => {
              const isMe = msg.senderId === currentUserId;
              return (
                <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[78%] px-3.5 py-2.5 rounded-2xl text-sm shadow-sm ${
                    isMe
                      ? 'bg-blue-600 text-white rounded-br-sm'
                      : 'bg-slate-100 text-slate-800 rounded-bl-sm'
                  }`}>
                    {!isMe && (
                      <p className="text-[10px] font-bold mb-1 text-blue-600 uppercase tracking-wide">{msg.senderName}</p>
                    )}
                    <p className="leading-relaxed">{msg.content}</p>
                    <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-blue-200' : 'text-slate-400'}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 border-t border-slate-100 shrink-0">
          <form onSubmit={handleSend} className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Type a message..."
              maxLength={1000}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={!input.trim() || sending}
              className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors disabled:opacity-40 shrink-0"
            >
              {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="translate-x-px" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
