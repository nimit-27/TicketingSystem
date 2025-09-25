import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/AuthService";
import { getCurrentUserDetails } from "../config/config";
import { RolePermission, setPermissions } from "../utils/permissions";
import { RoleLookupItem, setRoleLookup, setUserDetails, UserDetails } from "../utils/Utils";
import { useApi } from "../hooks/useApi";
import { DevModeContext } from "../context/DevModeContext";
import PersonIcon from "@mui/icons-material/Person";
import LockIcon from "@mui/icons-material/Lock";
import { getRoleSummaries } from "../services/RoleService";

interface ThemeProps {
    userId: string;
    password: string;
    setUserId: (v: string) => void;
    setPassword: (v: string) => void;
    handleSubmit: (e: React.FormEvent) => void;
    error?: String;
}

const ThemeOne: React.FC<ThemeProps> = ({ userId, password, setUserId, setPassword, handleSubmit, error }) => (
    <div style={{ display: "flex", height: "100vh", justifyContent: "center", alignItems: "center", background: "#f5f5f5" }}>
        <div style={{ background: "#fff", padding: "2rem", borderRadius: "8px", boxShadow: "0 0 10px rgba(0,0,0,0.1)", textAlign: "center", width: "300px" }}>
            <h2 style={{ color: "#1b5e20" }}>Login</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-3 text-start">
                    <label className="form-label">User ID</label>
                    <input className="form-control" value={userId} onChange={e => setUserId(e.target.value)} />
                </div>
                <div className="mb-3 text-start">
                    <label className="form-label">Password</label>
                    <input type="password" className="form-control" value={password} onChange={e => setPassword(e.target.value)} />
                </div>
                <button style={{ background: "#FF671F", border: "none" }} className="btn w-100 text-white" type="submit">Login</button>
                {error && <div className="text-danger mt-2">{error}</div>}
            </form>
        </div>
    </div>
);

const ThemeTwo: React.FC<ThemeProps> = ({ userId, password, setUserId, setPassword, handleSubmit, error }) => (
    <div style={{ display: "flex", height: "100vh", justifyContent: "center", alignItems: "center", background: "linear-gradient(135deg, #1b5e20, #FF671F)" }}>
        <form onSubmit={handleSubmit} style={{ background: "#fff", padding: "2rem", borderRadius: "8px", width: "320px", boxShadow: "0 0 10px rgba(0,0,0,0.2)" }}>
            <h2 style={{ textAlign: "center", color: "#FF671F" }}>Sign In</h2>
            <div className="mb-3">
                <label className="form-label">User ID</label>
                <input className="form-control" value={userId} onChange={e => setUserId(e.target.value)} />
            </div>
            <div className="mb-3">
                <label className="form-label">Password</label>
                <input type="password" className="form-control" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <button style={{ background: "#1b5e20", border: "none" }} className="btn w-100 text-white" type="submit">Login</button>
            {error && <div className="text-danger mt-2">{error}</div>}
        </form>
    </div>
);

const ThemeThree: React.FC<ThemeProps> = ({ userId, password, setUserId, setPassword, handleSubmit, error }) => (
    <div style={{ display: "flex", height: "100vh", justifyContent: "center", alignItems: "center", background: "#fff8e1" }}>
        <div style={{ width: "280px" }}>
            <h2 style={{ textAlign: "center", color: "#1b5e20", marginBottom: "1rem" }}>Welcome Back</h2>
            <form onSubmit={handleSubmit}>
                <div style={{ display: "flex", alignItems: "center", border: "1px solid #1b5e20", borderRadius: "4px", padding: "0.5rem", marginBottom: "1rem" }}>
                    <PersonIcon style={{ color: "#FF671F", marginRight: "0.5rem" }} />
                    <input style={{ border: "none", outline: "none", flex: 1 }} value={userId} onChange={e => setUserId(e.target.value)} placeholder="User ID" />
                </div>
                <div style={{ display: "flex", alignItems: "center", border: "1px solid #1b5e20", borderRadius: "4px", padding: "0.5rem", marginBottom: "1rem" }}>
                    <LockIcon style={{ color: "#FF671F", marginRight: "0.5rem" }} />
                    <input type="password" style={{ border: "none", outline: "none", flex: 1 }} value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
                </div>
                <button style={{ background: "#FF671F", border: "none" }} className="btn w-100 text-white" type="submit">Login</button>
                {error && <div className="text-danger mt-2">{error}</div>}
            </form>
        </div>
    </div>
);

type LoginResponse = {
    permissions?: RolePermission;
    userId?: string;
    username?: string;
    roles?: string[];
    levels?: string[];
    name?: string;
    allowedStatusActionIds?: string[];
    [key: string]: any;
};

const Login: React.FC = () => {
    const [userId, setUserId] = useState("");
    const [password, setPassword] = useState("");
    const [themeIdx, setThemeIdx] = useState(0);
    const navigate = useNavigate();
    const { devMode } = useContext(DevModeContext);

    const { data: loginData, error: loginError, apiHandler: loginApiHandler } = useApi();

    useEffect(() => {
        const persistLoginData = async () => {
            const res: any = loginData;
            // const res: LoginResponse = loginData;
            if (res) {
                if (res.permissions) {
                    setPermissions(res.permissions);
                }
                const details: UserDetails = {
                    userId: res.userId || userId,
                    username: res.username,
                    role: res.roles,
                    levels: res.levels,
                    name: res.name,
                    allowedStatusActionIds: res.allowedStatusActionIds
                };
                setUserDetails(details);
            }

            try {
                const response = await getRoleSummaries();
                const payload = Array.isArray(response.data)
                    ? response.data
                    : Array.isArray(response.data?.body?.data)
                        ? response.data.body.data
                        : [];

                if (Array.isArray(payload)) {
                    const normalized: RoleLookupItem[] = payload
                        .map((item: any) => ({
                            roleId: item?.roleId ?? item?.role_id ?? item?.id,
                            role: item?.role ?? item?.roleName ?? item?.name ?? ""
                        }))
                        .filter((item) => item.roleId != null && item.role);
                    setRoleLookup(normalized);
                }
            } catch (error) {
                console.error("Failed to load role summaries", error);
            }

            navigate("/");
        };

        if (loginData) {
            void persistLoginData();
        }
    }, [loginData, userId, navigate]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const roles = getCurrentUserDetails()?.role as string[];
        loginApiHandler(() => loginUser({ username: userId, password, roles }));
    };

    const changeTheme = (delta: number) => {
        setThemeIdx((prev) => {
            const total = 3;
            return (prev + delta + total) % total;
        });
    };

    const renderTheme = () => {
        switch (themeIdx) {
            case 0:
                return <ThemeOne userId={userId} password={password} setUserId={setUserId} setPassword={setPassword} handleSubmit={handleSubmit} error={loginError || undefined} />;
            case 1:
                return <ThemeTwo userId={userId} password={password} setUserId={setUserId} setPassword={setPassword} handleSubmit={handleSubmit} error={loginError || undefined} />;
            case 2:
                return <ThemeThree userId={userId} password={password} setUserId={setUserId} setPassword={setPassword} handleSubmit={handleSubmit} error={loginError || undefined} />;
            default:
                return <ThemeOne userId={userId} password={password} setUserId={setUserId} setPassword={setPassword} handleSubmit={handleSubmit} error={loginError || undefined} />;
        }
    };

    return (
        <>
            {renderTheme()}
            {devMode && (
                <div style={{ position: "fixed", bottom: "20px", width: "100%", display: "flex", justifyContent: "space-between", padding: "0 20px" }}>
                    <button className="btn btn-light" onClick={() => changeTheme(-1)}>&larr;</button>
                    <button className="btn btn-light" onClick={() => changeTheme(1)}>&rarr;</button>
                </div>
            )}
        </>
    );
};

export default Login;
