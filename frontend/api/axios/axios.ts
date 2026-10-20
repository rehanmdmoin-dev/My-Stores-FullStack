import axios from "axios";
import { Cookies } from "react-cookie";

const cookies = new Cookies();

// Your backend mounts every route under /api (see app.js: app.use('/api', authRoute))
export const baseURL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3003/api";

export const AxiosInstance = axios.create({
  baseURL,
  withCredentials: true,
});

AxiosInstance.interceptors.request.use(
  (config) => {
    const token = cookies.get("token");
    if (token) {
      config.headers = config.headers || {};
      // Your backend's Auth middleware reads: req.headers['authorization'] -> "Bearer <token>"
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

AxiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // token missing/expired/invalid - clear it so the app doesn't loop on a dead token
      cookies.remove("token", { path: "/" });
    }
    return Promise.reject(error);
  }
);

export default AxiosInstance;
