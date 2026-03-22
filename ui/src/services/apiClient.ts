import axios from "axios";
import { getUserDetails, clearSession } from "../utils/Utils";
import { BASE_URL } from "./api";

axios.defaults.baseURL = process.env.REACT_APP_API_BASE_URL || BASE_URL;
axios.defaults.withCredentials = true;

const REFRESH_MARGIN_MS = 2 * 60 * 1000;
const MIN_REFRESH_DELAY_MS = 30 * 1000;
const SESSION_EXPIRED_STATUSES = new Set([401, 403]);
const AUTH_PATH_PATTERNS = ["/auth/login", "/auth/logout", "/auth/session", "/auth/refresh", "/auth/sso"];

let refreshTimer: ReturnType<typeof setTimeout> | null = null;
let refreshPromise: Promise<void> | null = null;

const normalizeUrl = (url: string | undefined): string => {
    if (!url) {
        return "";
    }
    try {
        const parsed = new URL(url, window.location.origin);
        return parsed.pathname;
    } catch (_) {
        return url;
    }
};

const isAuthUrl = (url: string | undefined): boolean => {
    const normalized = normalizeUrl(url);
    return AUTH_PATH_PATTERNS.some((path) => normalized.includes(path));
};

const toMinutes = (value: unknown): number | null => {
    if (typeof value === "number" && Number.isFinite(value) && value > 0) {
        return value;
    }
    if (typeof value === "string") {
        const parsed = Number(value);
        if (Number.isFinite(parsed) && parsed > 0) {
            return parsed;
        }
    }
    return null;
};

const resolveAccessExpiryMinutes = (response: any): number | null => {
    const responseData = response?.data;
    const bodyData = responseData?.body;
    const candidate = responseData?.expiresInMinutes
        ?? bodyData?.expiresInMinutes
        ?? response?.headers?.["x-access-token-expires-in-minutes"];
    return toMinutes(candidate);
};

const redirectToLogin = () => {
    const basePath = process.env.PUBLIC_URL || "";
    const loginPath = `${basePath}/login`;
    if (window.location.pathname !== loginPath) {
        window.location.assign(loginPath);
    }
};

const scheduleProactiveRefresh = (expiresInMinutes: number | null) => {
    if (!expiresInMinutes) {
        return;
    }
    if (refreshTimer) {
        clearTimeout(refreshTimer);
    }
    const durationMs = expiresInMinutes * 60 * 1000;
    const delayMs = Math.max(MIN_REFRESH_DELAY_MS, durationMs - REFRESH_MARGIN_MS);
    refreshTimer = setTimeout(() => {
        void triggerRefresh();
    }, delayMs);
};

const triggerRefresh = async (): Promise<void> => {
    if (!refreshPromise) {
        refreshPromise = axios.post(`${BASE_URL}/auth/refresh`, null, { withCredentials: true })
            .then(() => undefined)
            .finally(() => {
                refreshPromise = null;
            });
    }
    return refreshPromise;
};

axios.interceptors.request.use((config) => {
    const headers = config.headers ?? {};
    const userId = getUserDetails()?.userId || "";
    headers["X-User-ID"] = userId;
    config.headers = headers;
    return config;
});

axios.interceptors.response.use(
    (response) => {
        scheduleProactiveRefresh(resolveAccessExpiryMinutes(response));
        return response;
    },
    async (error) => {
        const status = error?.response?.status;
        const originalRequest = error?.config ?? {};

        if (SESSION_EXPIRED_STATUSES.has(status) && !originalRequest._retry && !isAuthUrl(originalRequest.url)) {
            originalRequest._retry = true;
            try {
                await triggerRefresh();
                return axios.request(originalRequest);
            } catch (refreshError) {
                clearSession();
                redirectToLogin();
                return Promise.reject(refreshError);
            }
        }

        if (SESSION_EXPIRED_STATUSES.has(status)) {
            clearSession();
            redirectToLogin();
        }
        return Promise.reject(error);
    }
);

export default axios;
