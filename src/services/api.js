// export const API_BASE_URL = 'http://localhost:5001/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/* ===============================
   AUTH TOKEN (IN-MEMORY STATE)
   =============================== */

let authToken = localStorage.getItem('token') || null;

// Set token immediately (NO refresh needed)
export const setAuthToken = (token) => {
  authToken = token;
};

// Get token (used internally)
const getToken = () => authToken;

/* ===============================
   API REQUEST HELPER
   =============================== */

const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();

  const isFormData =
    typeof FormData !== 'undefined' && options?.body instanceof FormData;

  const headers = {
    ...options.headers,
  };

  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || 'Something went wrong');
    error.response = data;
    throw error;
  }

  return data;
};

/* ===============================
  VIDEO APIs
  =============================== */

export const videosAPI = {
  list: () =>
    apiRequest('/videos', {
      method: 'GET',
    }),

  getUserVideos: () =>
    apiRequest('/videos/user-videos', {
      method: 'GET',
    }),

  updateTitle: (id, title) =>
    apiRequest(`/videos/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ title }),
    }),

  upload: ({ title, file }) => {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('video', file);

    return apiRequest('/videos', {
      method: 'POST',
      body: formData,
    });
  },

  remove: (id) =>
    apiRequest(`/videos/${id}`, {
      method: 'DELETE',
    }),

  createEventsSource: () => new EventSource(`${API_BASE_URL}/videos/events`),
};

/* ===============================
   AUTH APIs
   =============================== */

export const authAPI = {
  signup: (name, email, password, adminPasskey = '') =>
    apiRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, adminPasskey }),
    }),

  login: (email, password, role) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, role }),
    }),

  verify: () =>
    apiRequest('/auth/verify', {
      method: 'GET',
    }),

  sendOTP: (email) =>
    apiRequest('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  verifyEmail: (email, otp) =>
    apiRequest('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    }),

  forgotPassword: (email) =>
    apiRequest('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token, password) =>
    apiRequest(`/auth/reset-password/${token}`, {
      method: 'POST',
      body: JSON.stringify({ password }),
    }),
};

/* ===============================
  USER APIs
  =============================== */

export const userAPI = {
  getMe: () =>
    apiRequest('/users/me', {
      method: 'GET',
    }),

  getUserProfile: (userId) =>
    apiRequest(`/users/${userId}`, {
      method: 'GET',
    }),

  uploadMyPhoto: (file) => {
    const formData = new FormData();
    formData.append('photo', file);

    return apiRequest('/users/me/photo', {
      method: 'POST',
      body: formData,
    });
  },

  updateMe: ({ name, dob }) =>
    apiRequest('/users/me', {
      method: 'PUT',
      body: JSON.stringify({ name, dob }),
    }),

  deleteMe: () =>
    apiRequest('/users/me', {
      method: 'DELETE',
    }),
};

/* ===============================
   TOKEN HELPERS
   =============================== */

export const saveToken = (token) => {
  localStorage.setItem('token', token);
  setAuthToken(token); // 🔥 IMMEDIATE SYNC
};

export const removeToken = () => {
  localStorage.removeItem('token');
  setAuthToken(null); // 🔥 CLEAR MEMORY TOKEN
};

export const getStoredToken = () => {
  return localStorage.getItem('token');
};
