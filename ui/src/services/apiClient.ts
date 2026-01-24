import axios from "axios";
import { getUserDetails, clearSession } from "../utils/Utils";
import { BASE_URL } from "./api";
import { getActiveToken, isJwtBypassEnabled, clearStoredToken } from "../utils/authToken";
import { isSessionExpiredMessage, triggerSessionExpired } from "../utils/sessionExpired";

axios.defaults.baseURL = process.env.REACT_APP_API_BASE_URL || BASE_URL;
axios.defaults.withCredentials = true;

axios.interceptors.request.use((config) => {
    const headers = config.headers ?? {};
    const bypass = isJwtBypassEnabled();
    // if (!bypass) {
    //     const token = getActiveToken();
    //     if (token) {
    //         headers["Authorization"] = `Bearer ${token}`;
    //     }
    // }

    const userId = getUserDetails()?.userId || "";
    headers["X-User-ID"] = userId;
    config.headers = headers;
    return config;
});

axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error?.response?.status === 403) {
            const data = error?.response?.data;
            const message = data?.apiError?.message
                ?? data?.error?.message
                ?? data?.message;
            if (isSessionExpiredMessage(message)) {
                triggerSessionExpired(message);
            }
        }
        if (error?.response?.status === 401) {
            // clearStoredToken();
            clearSession();
        }
        return Promise.reject(error);
    }
);

export default axios;
