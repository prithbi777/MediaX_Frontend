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
    credentials: 'include', // Required for CORS with credentials
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

  // Upload directly to Cloudinary, then save metadata to backend
  upload: async ({ title, file, onProgress }) => {
    // Get Cloudinary config from environment variables
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      throw new Error('Cloudinary configuration is missing. Please check your environment variables.');
    }

    // Generate a unique public ID
    const publicId = crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    const folder = 'mediax/videos';
    const resourceType = 'video';

    // Step 2: Upload directly to Cloudinary
    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append('file', file);
    cloudinaryFormData.append('upload_preset', uploadPreset);
    cloudinaryFormData.append('folder', folder);
    cloudinaryFormData.append('public_id', publicId);
    cloudinaryFormData.append('resource_type', resourceType);

    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;

    // Upload to Cloudinary with progress tracking
    const xhr = new XMLHttpRequest();

    return new Promise((resolve, reject) => {
      // Track upload progress if callback provided
      // Map Cloudinary upload progress to 0-90% (backend save will be 90-100%)
      if (onProgress) {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const cloudinaryProgress = (e.loaded / e.total) * 100;
            // Map to 0-90% range
            const percentComplete = (cloudinaryProgress * 0.9);
            onProgress(percentComplete);
          }
        });
      }

      xhr.addEventListener('load', async () => {
        if (xhr.status === 200) {
          try {
            // Update progress to 90% when Cloudinary upload completes
            if (onProgress) {
              onProgress(90);
            }

            const cloudinaryResult = JSON.parse(xhr.responseText);
            
            // Step 3: Save metadata to backend
            // Update progress to 95% when starting backend save
            if (onProgress) {
              onProgress(95);
            }

            const saveResponse = await apiRequest('/videos/save', {
              method: 'POST',
              body: JSON.stringify({
                title,
                videoUrl: cloudinaryResult.secure_url,
                publicId: cloudinaryResult.public_id,
                duration: cloudinaryResult.duration || 0,
              }),
            });

            // Update progress to 100% when backend save completes
            if (onProgress) {
              onProgress(100);
            }

            resolve(saveResponse);
          } catch (error) {
            reject(new Error('Failed to save video metadata: ' + error.message));
          }
        } else {
          try {
            const errorData = JSON.parse(xhr.responseText);
            reject(new Error(errorData.error?.message || 'Upload failed'));
          } catch {
            reject(new Error('Upload failed with status: ' + xhr.status));
          }
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload cancelled'));
      });

      xhr.open('POST', cloudinaryUrl);
      xhr.send(cloudinaryFormData);
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

/* ===============================
  CHATBOT APIs
  =============================== */

export const chatbotAPI = {
  chat: ({ message, conversationHistory }) =>
    apiRequest('/chatbot/chat', {
      method: 'POST',
      body: JSON.stringify({ message, conversationHistory }),
    }),
};
