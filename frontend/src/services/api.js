import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT token to every request if present in localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      config.headers["auth-token"] = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Optional auto-logout on token expiration
      const currentPath = window.location.pathname;
      if (currentPath !== "/login" && currentPath !== "/register") {
        // localStorage.removeItem("token");
        // localStorage.removeItem("user");
      }
    }
    return Promise.reject(error);
  }
);

// Auth Services
export const authService = {
  login: (credentials) => api.post("/auth/login", credentials),
  register: (userData) => api.post("/auth/register", userData),
  getProfile: () => api.get("/auth/me"),
  adminLogin: (credentials) => api.post("/auth/admin/login", credentials),
  adminRegister: (adminData) => api.post("/auth/admin/register", adminData),
};

// Movie Services
export const movieService = {
  getAll: (params) => api.get("/movie", { params }),
  getById: (id) => api.get(`/movie/${id}`),
  create: (data) => api.post("/movie", data),
  update: (id, data) => api.put(`/movie/${id}`, data),
  delete: (id) => api.delete(`/movie/${id}`),
};

// Theatre Services
export const theatreService = {
  getAll: () => api.get("/theatre"),
  getById: (id) => api.get(`/theatre/${id}`),
  create: (data) => api.post("/theatre", data),
  update: (id, data) => api.put(`/theatre/${id}`, data),
  delete: (id) => api.delete(`/theatre/${id}`),
};

// Show Services
export const showService = {
  getAll: (params) => api.get("/shows", { params }),
  getById: (id) => api.get(`/shows/${id}`),
  create: (data) => api.post("/shows", data),
  update: (id, data) => api.put(`/shows/${id}`, data),
  delete: (id) => api.delete(`/shows/${id}`),
};

// Booking Services
export const bookingService = {
  create: (data) => api.post("/bookings", data),
  getMyBookings: () => api.get("/bookings"),
  getById: (id) => api.get(`/bookings/${id}`),
  cancel: (id) => api.put(`/bookings/${id}/cancel`),
};

// Favorite Services
export const favoriteService = {
  getAll: () => api.get("/favorite"),
  add: (movieId) => api.post("/favorite", { movieId }),
  remove: (movieId) => api.delete(`/favorite/${movieId}`),
};

// Review Services
export const reviewService = {
  getByMovieId: (movieId) => api.get(`/review/${movieId}`),
  add: (data) => api.post("/review", data),
  delete: (id) => api.delete(`/review/${id}`),
};

// Notification Services
export const notificationService = {
  getAll: () => api.get("/notifications"),
};

// Admin Services
export const adminService = {
  getStats: () => api.get("/auth/admin/stats"),
  getAllBookings: () => api.get("/auth/admin/bookings"),
  getAllUsers: () => api.get("/auth/admin/users"),
};

export default api;
