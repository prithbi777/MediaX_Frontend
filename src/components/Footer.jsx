// src/components/Footer.jsx
import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

const Footer = () => {
  const { theme } = useTheme();
  
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      }
    );

    if (response.ok) {
      setStatus('success');
      setFormData({ name: '', email: '', message: '' });
      setTimeout(() => setStatus(''), 3000);
    } else {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to send message');
    }
  } catch (error) {
    setStatus('error');
    console.error('Error:', error.message || error);
  }
};

  return (
    <footer className="py-12 bg-gray-100 dark:bg-gray-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Get in Touch */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Get in Touch</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Have questions or feedback? We'd love to hear from you!
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {['FAQ', 'Help', 'Privacy Policy', 'Terms & Conditions'].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400 transition-colors"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Demand Us Form */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Suggest Us</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your Name"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Your Email"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="What video would you like to see?"
                  rows="3"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                disabled={status === 'sending'}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
              >
                {status === 'sending' ? 'Sending...' : 'Send Request'}
              </button>
              {status === 'success' && (
                <p className="text-green-600 dark:text-green-400 text-sm mt-2">
                  Thank you! Your request has been sent.
                </p>
              )}
              {status === 'error' && (
                <p className="text-red-600 dark:text-red-400 text-sm mt-2">
                  Failed to send message. Please try again.
                </p>
              )}
            </form>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-gray-700 dark:border-gray-300 text-center text-gray-500 dark:text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} MediaX. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;