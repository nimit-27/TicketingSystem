import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { SsoLoginPayload } from "../types/auth";
import { useApi } from "../hooks/useApi";
import { loginSso } from "../services/AuthService";


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
        apiHandler: loginSsoHandler
    } = useApi()

    console.log({ loginSsoData })  // Should have new access token in response

    const loginSsoApiHandler = () => {
        let payload: SsoLoginPayload = extractParamsFromUrl(location)

        loginSsoHandler(() => loginSso(payload))
    }

    useEffect(() => {
        // Extract params & call API
        loginSsoApiHandler()
    }, [])
    
    useEffect(() => {
        if(loginSsoSuccess) {
        // Save the token in session storage
        }
    }, [loginSsoSuccess])

    useEffect(() => {
        if (loginSsoError) {
            navigate("/login", { replace: true })
        }
    }, [loginSsoError, navigate])
    

    return ""
}

export default ExternalCallback
