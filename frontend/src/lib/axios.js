import axios from "axios";

// Create instance
const axiosInstance = axios.create({
  baseURL:
    import.meta.env.MODE === "development"
      ? "http://localhost:5000/api"
      : "/api",
  withCredentials: true,
});

// Export as DEFAULT export
export { axiosInstance }; // 👈 Change to default export
