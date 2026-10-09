import axios from "axios";

export const serverUrl = "https://investiqapi.ramanlohar.site/api";

const api = axios.create({
    baseURL: serverUrl,
    headers: {
        "Content-Type": "application/json",
    },
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