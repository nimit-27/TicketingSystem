import { FC, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, LoginPayload } from "../services/AuthService";
import { setPermissions } from "../utils/permissions";
import { RoleLookupItem, setRoleLookup, setUserDetails } from "../utils/Utils";
import { useApi } from "../hooks/useApi";
import { DevModeContext } from "../context/DevModeContext";
import PersonIcon from "@mui/icons-material/Person";
import LockIcon from "@mui/icons-material/Lock";
import { getRoleSummaries } from "../services/RoleService";
import { storeToken, getDecodedAuthDetails } from "../utils/authToken";
import { RolePermission, UserDetails } from "../types/auth";

type PortalType = "requestor" | "helpdesk";

interface ThemeProps {
    userId: string;
    password: string;
    setUserId: (v: string) => void;
    setPassword: (v: string) => void;
    handleSubmit: (e: React.FormEvent) => void;
    error?: string;
    heading: string;
    bypassControl: ReactNode;
    onBack: () => void;
}

const ThemeOne: FC<ThemeProps> = ({ userId, password, setUserId, setPassword, handleSubmit, error, heading, bypassControl, onBack }) => (
    <div style={{ display: "flex", minHeight: "100vh", justifyContent: "center", alignItems: "center", background: "#f5f5f5", padding: "1rem" }}>
        <div style={{ background: "#fff", padding: "2rem", borderRadius: "8px", boxShadow: "0 0 10px rgba(0,0,0,0.1)", textAlign: "center", width: "320px" }}>
            <h2 style={{ color: "#1b5e20", marginBottom: "1rem" }}>{heading}</h2>
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
                {error && <div className="text-danger mt-2" role="alert">{error}</div>}
            </form>
            <div style={{ marginTop: "1.5rem" }}>{bypassControl}</div>
            <button type="button" className="btn btn-link mt-3" onClick={onBack}>Choose a different portal</button>
        </div>
    </div>
);

const ThemeTwo: FC<ThemeProps> = ({ userId, password, setUserId, setPassword, handleSubmit, error, heading, bypassControl, onBack }) => (
    <div style={{ display: "flex", minHeight: "100vh", justifyContent: "center", alignItems: "center", background: "linear-gradient(135deg, #1b5e20, #FF671F)", padding: "1rem" }}>
        <form onSubmit={handleSubmit} style={{ background: "#fff", padding: "2rem", borderRadius: "8px", width: "320px", boxShadow: "0 0 10px rgba(0,0,0,0.2)" }}>
            <h2 style={{ textAlign: "center", color: "#FF671F", marginBottom: "1rem" }}>{heading}</h2>
            <div className="mb-3">
                <label className="form-label">User ID</label>
                <input className="form-control" value={userId} onChange={e => setUserId(e.target.value)} />
            </div>
            <div className="mb-3">
                <label className="form-label">Password</label>
                <input type="password" className="form-control" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <button style={{ background: "#1b5e20", border: "none" }} className="btn w-100 text-white" type="submit">Login</button>
            {error && <div className="text-danger mt-2" role="alert">{error}</div>}
            <div style={{ marginTop: "1.5rem" }}>{bypassControl}</div>
            <button type="button" className="btn btn-link mt-3 w-100 text-center" onClick={onBack}>Choose a different portal</button>
        </form>
    </div>
);

const ThemeThree: FC<ThemeProps> = ({ userId, password, setUserId, setPassword, handleSubmit, error, heading, bypassControl, onBack }) => (
    <div style={{ display: "flex", minHeight: "100vh", justifyContent: "center", alignItems: "center", background: "#fff8e1", padding: "1rem" }}>
        <div style={{ width: "300px", background: "#fff", padding: "2rem", borderRadius: "8px", boxShadow: "0 0 12px rgba(0,0,0,0.08)" }}>
            <h2 style={{ textAlign: "center", color: "#1b5e20", marginBottom: "1.5rem" }}>{heading}</h2>
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
                {error && <div className="text-danger mt-2" role="alert">{error}</div>}
            </form>
            <div style={{ marginTop: "1.5rem" }}>{bypassControl}</div>
            <button type="button" className="btn btn-link mt-3" onClick={onBack}>Choose a different portal</button>
        </div>
    </div>
);

interface LoginResponse {
    token?: string;
    permissions?: RolePermission;
    userId?: string;
    username?: string;
    roles?: string[];
    levels?: string[];
    name?: string;
    allowedStatusActionIds?: string[];
    [key: string]: any;
}

const portalLabels: Record<PortalType, string> = {
    requestor: "Requestor Login",
    helpdesk: "Helpdesk Login",
};

const Login: FC = () => {
    const [userId, setUserId] = useState("");
    const [password, setPassword] = useState("");
    const [themeIdx, setThemeIdx] = useState(0);
    const [selectedPortal, setSelectedPortal] = useState<PortalType | null>(null);
    const navigate = useNavigate();
    const { devMode, jwtBypass, toggleJwtBypass } = useContext(DevModeContext);

    const { data: loginData, error: loginError, apiHandler: loginApiHandler } = useApi<LoginResponse>();

    useEffect(() => {
        document.title = "Login";
    }, []);

    useEffect(() => {
        const persistLoginData = async () => {
            if (!loginData) {
                return;
            }

            if (!jwtBypass && typeof loginData.token === "string" && loginData.token) {
                storeToken(loginData.token);
            }

            const decoded = !jwtBypass ? getDecodedAuthDetails() : null;
            const permissions: RolePermission | undefined = loginData.permissions;
            if (permissions) {
                setPermissions(permissions);
            }

            const submittedUserId = userId.trim();
            const details: UserDetails = {
                userId: decoded?.user.userId || loginData.userId || submittedUserId,
                username: decoded?.user.username || loginData.username || submittedUserId,
                role: decoded?.user.role ?? loginData.roles ?? [],
                levels: decoded?.user.levels ?? loginData.levels ?? [],
                name: decoded?.user.name || loginData.name,
                allowedStatusActionIds: decoded?.user.allowedStatusActionIds ?? loginData.allowedStatusActionIds ?? [],
            };
            setUserDetails(details);

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
                            role: item?.role ?? item?.roleName ?? item?.name ?? "",
                        }))
                        .filter((item) => item.roleId != null && item.role);
                    setRoleLookup(normalized);
                }
            } catch (error) {
                console.error("Failed to load role summaries", error);
            }

            navigate("/");
        };

        void persistLoginData();
    }, [loginData, navigate, userId, jwtBypass]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPortal) {
            return;
        }

        const payload: LoginPayload = {
            username: userId.trim(),
            password,
            portal: selectedPortal,
        };

        loginApiHandler(() => loginUser(payload));
    };

    const changeTheme = (delta: number) => {
        setThemeIdx((prev) => {
            const total = 3;
            return (prev + delta + total) % total;
        });
    };

    const errorMessage = useMemo(() => (loginError ? String(loginError) : undefined), [loginError]);

    const bypassToggle = (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                <input
                    type="checkbox"
                    checked={jwtBypass}
                    onChange={toggleJwtBypass}
                    style={{ width: "1.1rem", height: "1.1rem" }}
                />
                <span>Bypass JWT authentication (use session storage)</span>
            </label>
            <small className="text-muted text-center">Keep enabled only for local development troubleshooting.</small>
        </div>
    );

    const renderTheme = () => {
        const heading = selectedPortal ? portalLabels[selectedPortal] : "Login";
        const commonProps = {
            userId,
            password,
            setUserId,
            setPassword,
            handleSubmit,
            error: errorMessage,
            heading,
            bypassControl: bypassToggle,
            onBack: () => setSelectedPortal(null),
        };

        switch (themeIdx) {
            case 0:
                return <ThemeOne {...commonProps} />;
            case 1:
                return <ThemeTwo {...commonProps} />;
            case 2:
                return <ThemeThree {...commonProps} />;
            default:
                return <ThemeOne {...commonProps} />;
        }
    };

    const renderPortalSelection = () => (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(160deg, rgba(27,94,32,0.85), rgba(255,103,31,0.9))", padding: "2rem" }}>
            <div style={{ background: "rgba(255,255,255,0.95)", borderRadius: "16px", padding: "2.5rem", boxShadow: "0 20px 40px rgba(0,0,0,0.15)", maxWidth: "520px", width: "100%" }}>
                <h1 style={{ textAlign: "center", marginBottom: "1.5rem", color: "#1b5e20" }}>Select your portal</h1>
                <p style={{ textAlign: "center", marginBottom: "2rem", color: "#4b4b4b" }}>Choose how you would like to sign in to continue.</p>
                <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                    <button
                        type="button"
                        onClick={() => setSelectedPortal("requestor")}
                        style={{ flex: 1, minWidth: "200px", border: "2px solid #1b5e20", borderRadius: "12px", padding: "1.5rem", background: "#fff", color: "#1b5e20", fontSize: "1.1rem", fontWeight: 600, cursor: "pointer", transition: "all 0.2s ease" }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.background = "#1b5e20";
                            e.currentTarget.style.color = "#fff";
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.background = "#fff";
                            e.currentTarget.style.color = "#1b5e20";
                        }}
                    >
                        Requestor Login
                    </button>
                    <button
                        type="button"
                        onClick={() => setSelectedPortal("helpdesk")}
                        style={{ flex: 1, minWidth: "200px", border: "2px solid #FF671F", borderRadius: "12px", padding: "1.5rem", background: "#fff", color: "#FF671F", fontSize: "1.1rem", fontWeight: 600, cursor: "pointer", transition: "all 0.2s ease" }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.background = "#FF671F";
                            e.currentTarget.style.color = "#fff";
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.background = "#fff";
                            e.currentTarget.style.color = "#FF671F";
                        }}
                    >
                        Helpdesk Login
                    </button>
                </div>
                <div style={{ marginTop: "2rem" }}>{bypassToggle}</div>
            </div>
        </div>
    );

    if (!selectedPortal) {
        return renderPortalSelection();
    }

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
