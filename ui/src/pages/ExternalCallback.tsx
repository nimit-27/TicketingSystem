import { useCallback, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LoginResponse, SsoLoginPayload } from "../types/auth";
import { useApi } from "../hooks/useApi";
import { loginSso } from "../services/AuthService";
import { persistLoginData, startSessionDetection } from "../utils/session";


function extractParamsFromUrl(location: Location): SsoLoginPayload {
    // Handles both query (?a=1&b=2) and fragment/hash (#access_token=...)
    const queryParams = new URLSearchParams(location.search);
    const hashParams = new URLSearchParams(location.hash.replace(/^#/, ""));

    // Prefer query params; fall back to hash params if needed
    const get = (key: string) =>
        queryParams.get(key) ?? hashParams.get(key);

    return {
        authCode: get("authCode") ?? "",
        username: get("username") ?? "",
        clientId: get("clientId") ?? "",
    };
}


const ExternalCallback = () => {
    const location: any = useLocation();
    const navigate = useNavigate();

    const {
        data: loginSsoData,
        success: loginSsoSuccess,
        error: loginSsoError,
        apiHandler: loginSsoHandler,
    } = useApi<LoginResponse>();

    const loginSsoApiHandler = useCallback(() => {
        const payload: SsoLoginPayload = extractParamsFromUrl(location);
        const hasParams = Boolean(payload.authCode || payload.username || payload.clientId);
        if (!hasParams) {
            return;
        }
        loginSsoHandler(() => loginSso(payload));
    }, [location, loginSsoHandler]);

    useEffect(() => {
        const cleanup = startSessionDetection({
            navigate,
            redirectPath: "/dashboard",
            onActiveSession: (data) => persistLoginData(data, { navigate, redirectPath: "/dashboard" }),
            onSessionAbsent: () => {
                loginSsoApiHandler();
            },
        });

        return cleanup;
    }, [loginSsoApiHandler, navigate]);
    
    useEffect(() => {
        if (loginSsoSuccess && loginSsoData) {
            void persistLoginData(loginSsoData, { navigate, redirectPath: "/dashboard" });
        }
    }, [loginSsoSuccess, loginSsoData, navigate]);

    useEffect(() => {
        if (loginSsoError) {
            navigate("/login", { replace: true })
        }
    }, [loginSsoError, navigate])
    

    return ""
}

export default ExternalCallback
