import axios from "axios";
import { getUserDetails } from "../utils/Utils";

const apiClient = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL || "http://localhost:3000",
})

apiClient.interceptors.request.use(config => {
    config.headers = config.headers || {};

    (config.headers as any)["X-User-ID"] = getUserDetails()?.userId || '';

    return config;
})

export default apiClient;