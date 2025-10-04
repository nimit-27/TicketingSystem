import { FC, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import DeveloperModeIcon from "@mui/icons-material/DeveloperMode";
import CircularProgress from "@mui/material/CircularProgress";
import { DevModeContext } from "../context/DevModeContext";
import { useSnackbar } from "../context/SnackbarContext";
import { getAllUsers } from "../services/UserService";
import { getRoleSummaries, getRolePermission } from "../services/RoleService";
import { loginUser } from "../services/AuthService";
import { setPermissions } from "../utils/permissions";
import { RoleLookupItem, setRoleLookup, setUserDetails } from "../utils/Utils";
import { storeToken, getDecodedAuthDetails } from "../utils/authToken";
import { RolePermission, UserDetails } from "../types/auth";

interface ApiUser {
    userId?: string;
    username?: string;
    name?: string;
    role?: string | string[];
    roles?: string[];
    [key: string]: any;
}

interface LoginResponse {
    token?: string;
    permissions?: RolePermission;
    userId?: string;
    username?: string;
    roles?: string[];
    levels?: string[];
    name?: string;
    allowedStatusActionIds?: string[];
    email?: string;
    emailId?: string;
    emailID?: string;
    mail?: string;
    contactNumber?: string;
    contact?: string;
    phone?: string;
    mobile?: string;
    mobileNo?: string;
    user?: {
        userId?: string;
        username?: string;
        name?: string;
        role?: string[];
        roles?: string[];
        levels?: string[];
        allowedStatusActionIds?: string[];
        email?: string;
        phone?: string;
    };
    [key: string]: any;
}

const normalizeResponse = <T,>(response: any, fallback: T): T => {
    const raw = response?.data ?? response ?? fallback;
    const body = raw?.body ?? raw;
    const data = body?.data ?? body;
    return (data ?? fallback) as T;
};

const DevLogin: FC = () => {
    const navigate = useNavigate();
    const { showMessage } = useSnackbar();
    const { devMode, toggleDevMode, jwtBypass, setJwtBypass } = useContext(DevModeContext);
    const [users, setUsers] = useState<ApiUser[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingPermission, setLoadingPermission] = useState(false);
    const roleLookupLoaded = useRef(false);

    const loadRoleLookup = useCallback(async () => {
        if (roleLookupLoaded.current) {
            return;
        }

        try {
            const response = await getRoleSummaries();
            const payload = normalizeResponse<RoleLookupItem[]>(response, []);
            if (Array.isArray(payload)) {
                const normalized = payload
                    .map((item: any) => ({
                        roleId: item?.roleId ?? item?.role_id ?? item?.id,
                        role: item?.role ?? item?.roleName ?? item?.name ?? "",
                    }))
                    .filter((item) => item.roleId != null && item.role);
                setRoleLookup(normalized);
            }
            roleLookupLoaded.current = true;
        } catch (error) {
            console.error("Failed to load role summaries", error);
        }
    }, []);

    const loadUsers = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getAllUsers();
            const payload = normalizeResponse<ApiUser[]>(response, []);
            if (Array.isArray(payload)) {
                setUsers(payload);
            } else {
                setUsers([]);
            }
        } catch (error: any) {
            console.error("Failed to load users", error);
            const message = error?.response?.data?.message
                || error?.message
                || "Unable to load users";
            showMessage(message, "error");
        } finally {
            setLoading(false);
        }
    }, [showMessage]);

    useEffect(() => {
        if (!devMode) {
            navigate("/login", { replace: true });
            return;
        }

        document.title = "Developer Login";
        if (!jwtBypass) {
            setJwtBypass(true);
        }

        void loadUsers();
        void loadRoleLookup();
    }, [devMode, jwtBypass, loadUsers, loadRoleLookup, navigate, setJwtBypass]);

    const primaryRole = useCallback((user: ApiUser): string | undefined => {
        if (Array.isArray(user.role) && user.role.length > 0) {
            return String(user.role[0]);
        }
        if (Array.isArray(user.roles) && user.roles.length > 0) {
            return String(user.roles[0]);
        }
        if (typeof user.role === "string") {
            return user.role;
        }
        return undefined;
    }, []);

    const sortedUsers = useMemo(() => {
        return [...users].sort((a, b) => {
            const roleA = (primaryRole(a) || "").toLowerCase();
            const roleB = (primaryRole(b) || "").toLowerCase();
            if (roleA === roleB) {
                const nameA = (a.username || a.name || a.userId || "").toLowerCase();
                const nameB = (b.username || b.name || b.userId || "").toLowerCase();
                return nameA.localeCompare(nameB);
            }
            return roleA.localeCompare(roleB);
        });
    }, [users, primaryRole]);

    const handleUserSelection = useCallback(async (user: ApiUser) => {
        const userId = user.userId || user.username || user.name;
        if (!userId) {
            showMessage("Unable to determine user id", "error");
            return;
        }

        setLoadingPermission(true);
        try {
            const username = String(userId);
            let permissionsFromLogin: RolePermission | null = null;
            let loginDetails: Partial<UserDetails> | null = null;

            try {
                const loginResponse = await loginUser({ username, password: "admin123", portal: "helpdesk" });
                const loginData = normalizeResponse<LoginResponse | null>(loginResponse, null);

                if (loginData) {
                    if (!jwtBypass && typeof loginData.token === "string" && loginData.token) {
                        storeToken(loginData.token);
                    }

                    const decoded = !jwtBypass ? getDecodedAuthDetails() : null;
                    const responseUser = loginData.user ?? {};
                    const resolvedUserId = responseUser.userId ?? loginData.userId ?? username;
                    const resolvedUsername = responseUser.username ?? loginData.username ?? username;
                    const responseRoles = responseUser.role ?? responseUser.roles ?? loginData.roles;
                    const responseLevels = responseUser.levels ?? loginData.levels;
                    const responseAllowed = responseUser.allowedStatusActionIds ?? loginData.allowedStatusActionIds;

                    const emailFromResponse = decoded?.user?.email
                        ?? responseUser.email
                        ?? loginData.email
                        ?? loginData.emailId
                        ?? loginData.emailID
                        ?? loginData.mail
                        ?? undefined;

                    const phoneFromResponse = decoded?.user?.phone
                        ?? responseUser.phone
                        ?? loginData.phone
                        ?? loginData.contactNumber
                        ?? loginData.contact
                        ?? loginData.mobile
                        ?? loginData.mobileNo
                        ?? undefined;

                    loginDetails = {
                        userId: decoded?.user?.userId || resolvedUserId,
                        username: decoded?.user?.username || resolvedUsername,
                        role: decoded?.user?.role
                            ?? (Array.isArray(responseRoles) ? responseRoles.map(String) : []),
                        levels: decoded?.user?.levels
                            ?? (Array.isArray(responseLevels) ? responseLevels.map(String) : []),
                        name: decoded?.user?.name ?? responseUser.name ?? loginData.name ?? undefined,
                        email: emailFromResponse,
                        phone: phoneFromResponse,
                        allowedStatusActionIds: decoded?.user?.allowedStatusActionIds
                            ?? (Array.isArray(responseAllowed) ? responseAllowed.map(String) : []),
                    };

                    if (loginData.permissions) {
                        permissionsFromLogin = loginData.permissions;
                    }
                }
            } catch (error: any) {
                console.error("Failed to login user via API", error);
                const message = error?.response?.data?.message
                    || error?.message
                    || "Unable to login user";
                showMessage(message, "error");
                return;
            }

            const fallbackRoles = Array.isArray(user.role)
                ? user.role.map(String)
                : Array.isArray(user.roles)
                    ? user.roles.map(String)
                    : user.role
                        ? [String(user.role)]
                        : [];

            const fallbackLevels = Array.isArray(user.levels) ? user.levels.map(String) : [];
            const fallbackAllowed = Array.isArray(user.allowedStatusActionIds)
                ? user.allowedStatusActionIds.map(String)
                : [];

            const details: UserDetails = {
                userId: loginDetails?.userId ?? username,
                username: loginDetails?.username ?? (user.username ?? user.name ?? username),
                role: loginDetails?.role && loginDetails.role.length ? loginDetails.role : fallbackRoles,
                levels: loginDetails?.levels && loginDetails.levels.length ? loginDetails.levels : fallbackLevels,
                name: loginDetails?.name ?? user.name ?? user.username ?? undefined,
                email: loginDetails?.email ?? user.email ?? undefined,
                phone: loginDetails?.phone ?? user.phone ?? user.contactNumber ?? undefined,
                allowedStatusActionIds: loginDetails?.allowedStatusActionIds && loginDetails.allowedStatusActionIds.length
                    ? loginDetails.allowedStatusActionIds
                    : fallbackAllowed,
            };

            setUserDetails(details);

            const roleFromDetails = Array.isArray(details.role) && details.role.length > 0 ? details.role[0] : undefined;
            const resolvedRole = roleFromDetails ?? primaryRole(user);

            if (permissionsFromLogin) {
                setPermissions(permissionsFromLogin);
            } else if (resolvedRole) {
                try {
                    const response = await getRolePermission(resolvedRole);
                    const payload = normalizeResponse<RolePermission | null>(response, null);
                    if (payload) {
                        setPermissions(payload);
                    } else {
                        setPermissions({} as RolePermission);
                    }
                } catch (error) {
                    console.error("Failed to load permissions for role", resolvedRole, error);
                    setPermissions({} as RolePermission);
                }
            } else {
                setPermissions({} as RolePermission);
            }

            navigate("/");
        } finally {
            setLoadingPermission(false);
        }
    }, [jwtBypass, navigate, primaryRole, showMessage]);

    if (!devMode) {
        return null;
    }

    return (
        <div style={{ minHeight: "100vh", background: "#10131a", color: "#f0f3ff", padding: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <DeveloperModeIcon style={{ fontSize: "2rem", color: "#90caf9" }} />
                    <div>
                        <h1 style={{ margin: 0, fontSize: "1.75rem" }}>Developer Login</h1>
                        <p style={{ margin: 0, color: "#c5cae9" }}>Select a user to quickly sign in without hitting the auth service.</p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={toggleDevMode}
                    style={{
                        background: "transparent",
                        border: "1px solid #90caf9",
                        color: "#90caf9",
                        padding: "0.5rem 1rem",
                        borderRadius: "999px",
                        cursor: "pointer",
                        fontWeight: 600,
                        letterSpacing: "0.05em",
                    }}
                >
                    Exit Dev Mode
                </button>
            </div>
            <div style={{ marginBottom: "1.5rem", color: "#90caf9" }}>
                {jwtBypass ? "JWT bypass is enabled for session storage login." : "JWT bypass was forced on for dev login."}
            </div>
            {loading ? (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "40vh" }}>
                    <CircularProgress style={{ color: "#90caf9" }} />
                </div>
            ) : (
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                        gap: "1.25rem",
                    }}
                >
                    {sortedUsers.map((user) => {
                        const role = primaryRole(user) ?? "Unknown";
                        const username = user.username ?? user.name ?? user.userId ?? "";
                        return (
                            <button
                                key={`${user.userId ?? user.username ?? username}`}
                                onClick={() => void handleUserSelection(user)}
                                style={{
                                    textAlign: "left",
                                    border: "1px solid rgba(144, 202, 249, 0.4)",
                                    borderRadius: "12px",
                                    background: "rgba(13, 71, 161, 0.25)",
                                    padding: "1.25rem",
                                    cursor: "pointer",
                                    color: "inherit",
                                    boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
                                    transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.transform = "translateY(-4px)";
                                    e.currentTarget.style.boxShadow = "0 14px 30px rgba(0,0,0,0.3)";
                                    e.currentTarget.style.borderColor = "#90caf9";
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.transform = "translateY(0)";
                                    e.currentTarget.style.boxShadow = "0 10px 25px rgba(0,0,0,0.2)";
                                    e.currentTarget.style.borderColor = "rgba(144, 202, 249, 0.4)";
                                }}
                            >
                                <div style={{ fontSize: "0.85rem", textTransform: "uppercase", color: "#90caf9", letterSpacing: "0.08em" }}>
                                    {role}
                                </div>
                                <div style={{ fontSize: "1.3rem", fontWeight: 600, marginTop: "0.5rem" }}>
                                    {username}
                                </div>
                            </button>
                        );
                    })}
                    {!loading && sortedUsers.length === 0 && (
                        <div style={{ gridColumn: "1 / -1", textAlign: "center", color: "#c5cae9" }}>
                            No users available.
                        </div>
                    )}
                </div>
            )}
            {loadingPermission && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "rgba(10, 14, 25, 0.65)",
                        zIndex: 1000,
                    }}
                >
                    <div style={{ padding: "1.5rem 2rem", background: "#0d1b2a", borderRadius: "12px", textAlign: "center", color: "#f0f3ff" }}>
                        <CircularProgress size={32} style={{ color: "#90caf9", marginBottom: "1rem" }} />
                        <div>Fetching permissions & preparing session…</div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DevLogin;
