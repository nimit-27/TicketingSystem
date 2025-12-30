import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ExternalApplicationTokenPayload } from "../types/auth";
import { useApi } from "../hooks/useApi";
import { getExternalApplicationToken } from "../services/AuthService";


function extractParamsFromUrl(location: Location): ExternalApplicationTokenPayload {
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

    const { data: getExternalApplicationTokenData, apiHandler: getExternalApplicationTokenHandler } = useApi()

    console.log({ getExternalApplicationTokenData })

    const getExternalApplicationTokenApiHandler = () => {
        let payload: ExternalApplicationTokenPayload = extractParamsFromUrl(location)

        getExternalApplicationTokenHandler(() => getExternalApplicationToken(payload))
    }

    useEffect(() => {
        // Extract params & call API
        getExternalApplicationTokenApiHandler()
    }, [])

    return ""
}

export default ExternalCallback