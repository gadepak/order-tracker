import axios from "axios";

const API = axios.create({
  baseURL: "https://order-tracker-production-124e.up.railway.app/api",
});

// Attach JWT token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 🔴 ADD THIS (Step 4)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 403 &&
      error.response?.data?.code === "MAINTENANCE_EXPIRED"
    ) {
      window.location.href = "/service-expired";
      return;
    }
    return Promise.reject(error);
  }
);

export default API;
