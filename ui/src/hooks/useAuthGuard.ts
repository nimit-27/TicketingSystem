import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUserDetails, getUserPermissions } from "../utils/Utils";

export const useAuthGuard = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const check = () => {
            const user = getUserDetails();
            const perms = getUserPermissions();
            if (!user?.userId || !perms) {
                navigate("/login");
            }
        };
        check();
        const id = setInterval(check, 1000);
        window.addEventListener("storage", check);
        return () => {
            clearInterval(id);
            window.removeEventListener("storage", check);
        };
    }, [navigate]);
};

export default useAuthGuard;
