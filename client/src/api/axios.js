import axios from "axios";

const productionUrl = "https://investiqapi.ramanlohar.site/api";
const developmentUrl = "http://localhost:5000/api";

export const serverUrl = import.meta.env.VITE_DEV ? developmentUrl : productionUrl;

const api = axios.create({
    baseURL: serverUrl,
});

// Automatically attach the JWT token to requests.
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("investiq_token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Automatically handle invalid or expired sessions.
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("investiq_token");
            localStorage.removeItem("investiq_user");

            if (window.location.pathname !== "/login") {
                window.location.replace("/login");
            }
        }

        return Promise.reject(error);
    }
);

export default api;