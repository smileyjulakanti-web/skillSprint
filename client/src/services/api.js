import axios from "axios";

// Default API URL: use env variable VITE_API_URL, localStorage override, or default
export const getApiBaseUrl = () => {
  const localOverride = localStorage.getItem("skillsprint_custom_api_url");
  if (localOverride) return localOverride;

  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/+$/, "");
  }

  // If in production on Vercel and no env is set, use Render fallback
  if (import.meta.env.PROD) {
    return "https://skillsprint-i6ax.onrender.com";
  }

  return "http://localhost:5000";
};

export const setApiBaseUrl = (url) => {
  if (url) {
    localStorage.setItem("skillsprint_custom_api_url", url.replace(/\/+$/, ""));
  } else {
    localStorage.removeItem("skillsprint_custom_api_url");
  }
};

const api = axios.create({
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Dynamically set baseURL before each request
api.interceptors.request.use(
  (config) => {
    config.baseURL = getApiBaseUrl();
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors cleanly
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // If unauthorized, clear stale credentials if token was invalid
      if (localStorage.getItem("token")) {
        console.warn("Session expired or unauthorized. Clearing stored token.");
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (email, password) => {
    const response = await api.post("/api/auth/login", { email, password });
    return response.data;
  },

  register: async (name, email, password) => {
    const response = await api.post("/api/auth/register", { name, email, password });
    return response.data;
  },

  getMe: async () => {
    const response = await api.get("/api/auth/me");
    return response.data;
  },

  checkHealth: async () => {
    const response = await api.get("/api/health");
    return response.data;
  },
};

export const courseAPI = {
  getCourses: async (params = {}) => {
    const response = await api.get("/api/courses", { params });
    return response.data;
  },

  getCourseById: async (id) => {
    const response = await api.get(`/api/courses/${id}`);
    return response.data;
  },

  enrollCourse: async (id) => {
    const response = await api.post(`/api/courses/${id}/enroll`);
    return response.data;
  },

  getEnrolledCourses: async () => {
    const response = await api.get("/api/courses/enrolled");
    return response.data;
  },

  getCourseLearn: async (id) => {
    const response = await api.get(`/api/courses/${id}/learn`);
    return response.data;
  },

  completeLesson: async (courseId, lessonId) => {
    const response = await api.post(
      `/api/courses/${courseId}/lessons/${lessonId}/complete`
    );
    return response.data;
  },
};

export default api;
