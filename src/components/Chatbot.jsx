import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { chatbotAPI } from '../services/api';
import { FaTrash, FaTimes, FaRobot, FaPaperPlane, FaMagic, FaUserSecret } from 'react-icons/fa';

function Chatbot() {
  const { token } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Protocol initialized. I'm your MediaX Neural Assistant. How can I assist your creative workflow today?",
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [isOpen]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    if (!token) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Security Check: Please authenticate (login) to access neural processing layers.',
        },
      ]);
      return;
    }

    const userMessage = inputMessage.trim();
    setInputMessage('');

    const newMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const conversationHistory = newMessages.slice(-10).map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await chatbotAPI.chat({
        message: userMessage,
        conversationHistory: conversationHistory.slice(0, -1),
      });

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: response.response,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Link Interrupted: The neural core is temporarily unreachable. Please retry synchronization.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = () => setIsOpen(!isOpen);

  const handleClearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: 'Neural memory purged. Initializing fresh protocol. How can I help?',
      },
    ]);
  };

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div className="fixed inset-0 sm:inset-auto sm:bottom-24 sm:right-8 w-full h-full sm:w-[420px] sm:h-[600px] bg-white/90 dark:bg-slate-950/90 backdrop-blur-3xl sm:rounded-[40px] shadow-[0_32px_120px_-20px_rgba(79,70,229,0.4)] flex flex-col z-[3000] border-0 sm:border border-white/20 dark:border-slate-800/50 transition-all duration-500 overflow-hidden animate-in slide-in-from-bottom-12 fade-in">

          {/* Internal Blurs */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] -z-10 translate-x-1/3 -translate-y-1/3"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] -z-10 -translate-x-1/3 translate-y-1/3"></div>

          {/* Header */}
          <div className="flex items-center justify-between p-6 bg-gradient-to-r from-indigo-600 to-purple-600">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-white border border-white/20 shadow-xl">
                <FaRobot size={24} />
              </div>
              <div>
                <h3 className="text-white font-black uppercase tracking-widest text-sm leading-none mb-1">Neural Core</h3>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
                  <p className="text-indigo-100 text-[10px] font-bold uppercase tracking-widest leading-none">System Active</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleClearChat}
                className="w-10 h-10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                title="Wipe Memory"
              >
                <FaTrash size={16} />
              </button>
              <button
                onClick={handleToggle}
                className="w-10 h-10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                title="Deactivate"
              >
                <FaTimes size={18} />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}
              >
                <div
                  className={`max-w-[85%] rounded-[24px] px-6 py-4 shadow-sm border ${message.role === 'user'
                    ? 'bg-indigo-600 text-white border-indigo-500 rounded-tr-none'
                    : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border-slate-100 dark:border-slate-800 rounded-tl-none'
                    }`}
                >
                  <div className="flex items-center gap-2 mb-2 opacity-50">
                    {message.role === 'user' ? <FaUserSecret size={10} /> : <FaMagic size={10} />}
                    <span className="text-[8px] font-black uppercase tracking-widest">{message.role === 'user' ? 'Identify' : 'Neural'}</span>
                  </div>
                  <p className="text-sm font-bold whitespace-pre-wrap break-words leading-relaxed uppercase tracking-tight">
                    {message.content}
                  </p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start animate-in fade-in zoom-in-95">
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[24px] rounded-tl-none px-6 py-4">
                  <div className="flex gap-2">
                    <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSendMessage} className="p-6 bg-slate-50/50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800/50">
            <div className="relative group">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Query Neural Core..."
                className="w-full pl-6 pr-16 py-5 rounded-[24px] bg-white dark:bg-slate-900 border-2 border-transparent focus:border-indigo-600 outline-none font-black text-xs text-slate-800 dark:text-slate-100 transition-all shadow-inner uppercase tracking-widest placeholder:text-slate-400"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 disabled:opacity-30 disabled:hover:bg-indigo-600 transition-all flex items-center justify-center shadow-lg shadow-indigo-600/30 active:scale-90"
              >
                <FaPaperPlane size={14} className={isLoading ? 'animate-pulse' : ''} />
              </button>
            </div>
            <p className="text-center mt-4 text-[8px] font-black text-slate-400 uppercase tracking-[2px]">Encrypted Neural Link Active</p>
          </form>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={handleToggle}
        className={`fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-700 text-white rounded-[24px] shadow-2xl hover:scale-110 active:scale-90 transition-all duration-500 flex items-center justify-center z-[2500] group ${isOpen ? 'rotate-[360deg] rounded-full' : ''
          }`}
        aria-label="Toggle Neural Hub"
      >
        {isOpen ? (
          <FaTimes size={24} />
        ) : (
          <div className="relative">
            <FaRobot size={28} className="group-hover:rotate-12 transition-transform" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-indigo-600 animate-pulse"></div>
          </div>
        )}
      </button>
    </>
  );
}

export default Chatbot;