import axios from "axios";

const API = axios.create({
// baseURL: "http://localhost:4000/api",
  //baseURL: "/api"
  //"https://order-tracker-production-535d.up.railway.app/api",
   baseURL:"https://order-tracker-production-124e.up.railway.app/api", 
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;

//https://order-tracker-production-535d.up.railway.app/