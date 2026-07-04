import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, 
  withCredentials: true
});


api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const getImageUrl = (url) => {
  if (!url || url === "null" || url === "undefined") return "";
  if (url.includes("localhost:") || url.includes("127.0.0.1:")) {
    try {
      const parsedUrl = new URL(url);
      const backendBaseUrl = import.meta.env.VITE_SOCKET_URL;
      if (backendBaseUrl) {
        return `${backendBaseUrl}${parsedUrl.pathname}`;
      }
    } catch (e) {
      return url;
    }
  }
  return url;
};

export default api; 