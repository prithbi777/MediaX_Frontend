// import { useState, useRef, useEffect } from 'react';
// import { useAuth } from '../context/AuthContext';
// import { chatbotAPI } from '../services/api';

// function Chatbot() {
//   const { token } = useAuth();
//   const [isOpen, setIsOpen] = useState(false);
//   const [messages, setMessages] = useState([
//     {
//       role: 'assistant',
//       content: 'Hello! I\'m your AI assistant for MediaX. How can I help you today?',
//     },
//   ]);
//   const [inputMessage, setInputMessage] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const messagesEndRef = useRef(null);
//   const inputRef = useRef(null);

//   // Auto-scroll to bottom when new messages are added
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [messages]);

//   // Focus input when chat opens
//   useEffect(() => {
//     if (isOpen && inputRef.current) {
//       setTimeout(() => {
//         inputRef.current?.focus();
//       }, 100);
//     }
//   }, [isOpen]);

//   const handleSendMessage = async (e) => {
//     e.preventDefault();
    
//     if (!inputMessage.trim() || isLoading) return;

//     if (!token) {
//       setMessages((prev) => [
//         ...prev,
//         {
//           role: 'assistant',
//           content: 'Please log in to use the chatbot.',
//         },
//       ]);
//       return;
//     }

//     const userMessage = inputMessage.trim();
//     setInputMessage('');
    
//     // Add user message to chat
//     const newMessages = [
//       ...messages,
//       { role: 'user', content: userMessage },
//     ];
//     setMessages(newMessages);
//     setIsLoading(true);

//     try {
//       // Prepare conversation history (last 10 messages for context)
//       const conversationHistory = newMessages
//         .slice(-10)
//         .map((msg) => ({
//           role: msg.role,
//           content: msg.content,
//         }));

//       const response = await chatbotAPI.chat({
//         message: userMessage,
//         conversationHistory: conversationHistory.slice(0, -1), // Exclude the current user message
//       });

//       setMessages((prev) => [
//         ...prev,
//         {
//           role: 'assistant',
//           content: response.response,
//         },
//       ]);
//     } catch (error) {
//       setMessages((prev) => [
//         ...prev,
//         {
//           role: 'assistant',
//           content: error.message || 'Sorry, I encountered an error. Please try again.',
//         },
//       ]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleToggle = () => {
//     setIsOpen(!isOpen);
//   };

//   const handleClearChat = () => {
//     setMessages([
//       {
//         role: 'assistant',
//         content: 'Hello! I\'m your AI assistant for MediaX. How can I help you today?',
//       },
//     ]);
//   };

//   return (
//     <>
//       {/* Chat Window */}
//       {isOpen && (
//         <div className="fixed bottom-24 right-6 w-96 h-[600px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200 dark:border-slate-700 transition-all duration-300 ease-out">
//           {/* Header */}
//           <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-t-2xl">
//             <div className="flex items-center gap-3">
//               <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   viewBox="0 0 24 24"
//                   fill="currentColor"
//                   className="w-6 h-6 text-indigo-600"
//                 >
//                   <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
//                 </svg>
//               </div>
//               <div>
//                 <h3 className="text-white font-semibold text-lg">AI Assistant</h3>
//                 <p className="text-indigo-100 text-xs">MediaX Support</p>
//               </div>
//             </div>
//             <div className="flex items-center gap-2">
//               <button
//                 onClick={handleClearChat}
//                 className="text-white hover:text-indigo-200 transition-colors p-1"
//                 title="Clear chat"
//               >
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   className="h-5 w-5"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                   stroke="currentColor"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
//                   />
//                 </svg>
//               </button>
//               <button
//                 onClick={handleToggle}
//                 className="text-white hover:text-indigo-200 transition-colors p-1"
//                 title="Close chat"
//               >
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   className="h-5 w-5"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                   stroke="currentColor"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M6 18L18 6M6 6l12 12"
//                   />
//                 </svg>
//               </button>
//             </div>
//           </div>

//           {/* Messages Container */}
//           <div className="flex-1 overflow-y-auto p-4 space-y-4">
//             {messages.map((message, index) => (
//               <div
//                 key={index}
//                 className={`flex ${
//                   message.role === 'user' ? 'justify-end' : 'justify-start'
//                 }`}
//               >
//                 <div
//                   className={`max-w-[80%] rounded-2xl px-4 py-2 ${
//                     message.role === 'user'
//                       ? 'bg-indigo-600 text-white'
//                       : 'bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-slate-100'
//                   }`}
//                 >
//                   <p className="text-sm whitespace-pre-wrap break-words">
//                     {message.content}
//                   </p>
//                 </div>
//               </div>
//             ))}
//             {isLoading && (
//               <div className="flex justify-start">
//                 <div className="bg-gray-100 dark:bg-slate-800 rounded-2xl px-4 py-2">
//                   <div className="flex gap-1">
//                     <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
//                     <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
//                     <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
//                   </div>
//                 </div>
//               </div>
//             )}
//             <div ref={messagesEndRef} />
//           </div>

//           {/* Input Form */}
//           <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 dark:border-slate-700">
//             <div className="flex gap-2">
//               <input
//                 ref={inputRef}
//                 type="text"
//                 value={inputMessage}
//                 onChange={(e) => setInputMessage(e.target.value)}
//                 placeholder="Type your message..."
//                 className="flex-1 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
//                 disabled={isLoading}
//               />
//               <button
//                 type="submit"
//                 disabled={!inputMessage.trim() || isLoading}
//                 className="bg-indigo-600 text-white rounded-lg px-4 py-2 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//               >
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   className="h-5 w-5"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                   stroke="currentColor"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
//                   />
//                 </svg>
//               </button>
//             </div>
//           </form>
//         </div>
//       )}

//       {/* Floating Button */}
//       <button
//         onClick={handleToggle}
//         className={`fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 flex items-center justify-center z-40 ${
//           isOpen ? 'rotate-180' : ''
//         }`}
//         aria-label="Toggle chatbot"
//       >
//         {isOpen ? (
//           <svg
//             xmlns="http://www.w3.org/2000/svg"
//             className="h-8 w-8"
//             fill="none"
//             viewBox="0 0 24 24"
//             stroke="currentColor"
//           >
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               strokeWidth={2}
//               d="M6 18L18 6M6 6l12 12"
//             />
//           </svg>
//         ) : (
//           <svg
//             xmlns="http://www.w3.org/2000/svg"
//             className="h-8 w-8"
//             fill="none"
//             viewBox="0 0 24 24"
//             stroke="currentColor"
//             strokeWidth={2}
//           >
//             {/* Robot Head */}
//             <rect x="6" y="4" width="12" height="14" rx="2" strokeLinecap="round" strokeLinejoin="round" />
//             {/* Left Eye */}
//             <circle cx="9" cy="9" r="1.5" fill="currentColor" />
//             {/* Right Eye */}
//             <circle cx="15" cy="9" r="1.5" fill="currentColor" />
//             {/* Mouth */}
//             <path d="M9 13h6" strokeLinecap="round" strokeLinejoin="round" />
//             {/* Antenna */}
//             <circle cx="12" cy="4" r="1" fill="currentColor" />
//             <path d="M12 3v-1" strokeLinecap="round" />
//           </svg>
//         )}
//       </button>
//     </>
//   );
// }

// export default Chatbot;









import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { chatbotAPI } from '../services/api';

function Chatbot() {
  const { token } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I'm your AI assistant for MediaX. How can I help you today?",
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const sendingRef = useRef(false); // 🔒 HARD LOCK

  /* ===========================
     AUTO SCROLL
     =========================== */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /* ===========================
     AUTO FOCUS
     =========================== */
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  /* ===========================
     SEND MESSAGE
     =========================== */
  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (sendingRef.current) return;
    if (!inputMessage.trim()) return;

    if (!token) {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Please log in to use the chatbot.' },
      ]);
      return;
    }

    sendingRef.current = true;
    setIsLoading(true);

    const userMessage = inputMessage.trim();
    setInputMessage('');

    let updatedMessages;

    // ✅ SAFE STATE UPDATE
    setMessages(prev => {
      updatedMessages = [...prev, { role: 'user', content: userMessage }];
      return updatedMessages;
    });

    try {
      const conversationHistory = updatedMessages
        .slice(-6) // 🔥 MATCH BACKEND
        .map(msg => ({
          role: msg.role,
          content: msg.content,
        }));

      const response = await chatbotAPI.chat({
        message: userMessage,
        conversationHistory: conversationHistory.slice(0, -1),
      });

      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: response.response },
      ]);
    } catch (error) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content:
            error.message ||
            'Sorry, I encountered an issue. Please try again.',
        },
      ]);
    } finally {
      sendingRef.current = false;
      setIsLoading(false);
    }
  };

  /* ===========================
     CLEAR CHAT
     =========================== */
  const handleClearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: "Hello! I'm your AI assistant for MediaX. How can I help you today?",
      },
    ]);
  };

  return (
    <>
      {/* CHAT WINDOW */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[600px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200 dark:border-slate-700">

          {/* HEADER */}
          <div className="flex items-center justify-between p-4 bg-indigo-600 rounded-t-2xl">
            <div>
              <h3 className="text-white font-semibold">AI Assistant</h3>
              <p className="text-indigo-100 text-xs">MediaX Support</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleClearChat}
                className="text-white hover:text-indigo-200"
                title="Clear chat"
              >
                🗑
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-indigo-200"
                title="Close"
              >
                ✖
              </button>
            </div>
          </div>

          {/* MESSAGES */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-slate-100'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-slate-800 rounded-2xl px-4 py-2 text-sm">
                  Thinking…
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* INPUT */}
          <form
            onSubmit={handleSendMessage}
            className="p-4 border-t border-gray-200 dark:border-slate-700"
          >
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={e => setInputMessage(e.target.value)}
                placeholder="Type your message..."
                disabled={isLoading}
                className="flex-1 px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      )}

      {/* FLOATING BUTTON */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-indigo-600 text-white rounded-full shadow-lg hover:scale-110 transition"
      >
        🤖
      </button>
    </>
  );
}

export default Chatbot;
