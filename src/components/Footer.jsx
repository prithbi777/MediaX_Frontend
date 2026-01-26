import { useState } from 'react';
import { FaPaperPlane, FaCheck, FaExclamationTriangle, FaTwitter, FaInstagram, FaLinkedin, FaGithub, FaPlayCircle } from 'react-icons/fa';

const Footer = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [status, setStatus] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/contact`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', message: '' });
        setTimeout(() => setStatus(''), 5000);
      } else {
        throw new Error(data.error || data.message || 'Failure');
      }
    } catch (err) {
      setStatus(err.message || 'error');
    }
  };

  return (
    <footer className="w-full bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 transition-colors pt-24 pb-12 overflow-hidden relative">
      {/* Decorative Blur */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-[100px] -z-10 translate-x-1/2 -translate-y-1/2"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 mb-24">

          {/* Brand & Social */}
          <div className="lg:col-span-4 space-y-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-600/30">
                <FaPlayCircle size={24} />
              </div>
              <span className="text-3xl font-black text-slate-800 dark:text-white tracking-tighter">MediaX</span>
            </div>

            <p className="text-slate-500 dark:text-slate-400 font-bold text-sm leading-relaxed max-w-sm uppercase tracking-wider">
              The ultimate cinematic ecosystem for creators who demand perfection in every pixel.
            </p>

            <div className="flex items-center gap-6">
              {[FaTwitter, FaInstagram, FaLinkedin, FaGithub].map((Icon, i) => (
                <a key={i} href="#" className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-indigo-600 hover:text-white transition-all transform hover:-translate-y-1">
                  <Icon size={20} />
                </a>
              ))}
            </div>
          </div>

          {/* Links Grid */}
          <div className="lg:col-span-4 grid grid-cols-2 gap-10">
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[4px] text-slate-400 mb-8">Navigation</h4>
              <ul className="space-y-4">
                {['Dashboard', 'My Videos', 'Creators', 'Explore'].map(link => (
                  <li key={link}>
                    <a href="#" className="font-black text-sm text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors uppercase tracking-widest">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[4px] text-slate-400 mb-8">Legal</h4>
              <ul className="space-y-4">
                {['Privacy', 'Terms', 'Security', 'FAQ'].map(link => (
                  <li key={link}>
                    <a href="#" className="font-black text-sm text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors uppercase tracking-widest">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Contact / Newsletter */}
          <div className="lg:col-span-4 bg-slate-50 dark:bg-slate-800/40 p-8 sm:p-10 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-inner">
            <h4 className="text-[10px] font-black uppercase tracking-[4px] text-slate-400 mb-3">Support Channel</h4>
            <h3 className="text-xl font-black text-slate-800 dark:text-white mb-8">Suggest a Feature</h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Content Creator Name"
                className="w-full px-6 py-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 font-bold text-sm text-slate-800 dark:text-slate-100 outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm"
                required
              />
              <input
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Contact Channel (Email)"
                className="w-full px-6 py-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 font-bold text-sm text-slate-800 dark:text-slate-100 outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm"
                required
              />
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="What's missing?"
                rows="3"
                className="w-full px-6 py-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 font-bold text-sm text-slate-800 dark:text-slate-100 outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm resize-none"
                required
              ></textarea>

              <button
                type="submit"
                disabled={status === 'sending'}
                className={`w-full py-4 rounded-3xl font-black uppercase tracking-[4px] text-xs flex items-center justify-center gap-3 transition-all ${status === 'success'
                  ? 'bg-green-500 text-white shadow-xl shadow-green-500/30'
                  : 'bg-slate-900 dark:bg-indigo-600 text-white shadow-xl shadow-indigo-600/30 hover:scale-[1.02]'
                  }`}
              >
                {status === 'sending' ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : status === 'success' ? (
                  <><FaCheck /> Sent</>
                ) : (
                  <><FaPaperPlane /> Dispatch</>
                )}
              </button>

              {status !== '' && status !== 'sending' && status !== 'success' && (
                <p className="text-red-500 text-[10px] font-black uppercase tracking-widest text-center mt-4 flex items-center justify-center gap-2">
                  <FaExclamationTriangle shrink-0 /> {status === 'error' ? 'Satellite Down. Retry.' : status}
                </p>
              )}
            </form>
          </div>
        </div>

        <div className="pt-12 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
            &copy; {new Date().getFullYear()} MediaX International. System Active.
          </p>
          <div className="flex gap-8">
            <span className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">Encryption: AES-256</span>
            <span className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">Uptime: 99.9%</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;