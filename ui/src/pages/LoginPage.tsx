import { FC, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PersonIcon from "@mui/icons-material/Person";
import LockIcon from "@mui/icons-material/Lock";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import TranslateIcon from "@mui/icons-material/Translate";
import DeveloperModeIcon from "@mui/icons-material/DeveloperMode";
import { InputAdornment } from "@mui/material";
import CustomTabsComponent, { TabItem } from "../components/UI/CustomTabsComponent";
import { loginUser, LoginPayload } from "../services/AuthService";
import { useApi } from "../hooks/useApi";
import { setPermissions } from "../utils/permissions";
import { RoleLookupItem, setRoleLookup, setUserDetails } from "../utils/Utils";
import { getRoleSummaries } from "../services/RoleService";
import { storeToken, getDecodedAuthDetails } from "../utils/authToken";
import { RolePermission, UserDetails } from "../types/auth";
import colors from "../themes/colors";
import { ThemeModeContext } from "../context/ThemeContext";
import { LanguageContext } from "../context/LanguageContext";
import { DevModeContext } from "../context/DevModeContext";
import GenericInput from "../components/UI/Input/GenericInput";
import GenericButton from "../components/UI/Button";
import "./LoginPage.scss";

type PortalType = "requestor" | "helpdesk";

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
    userEmail?: string;
    userMail?: string;
    userPhone?: string;
    [key: string]: any;
}

const portalLabels: Record<PortalType, string> = {
    requestor: "Requester",
    helpdesk: "Helpdesk",
};

const LoginPage: FC = () => {
    const [userId, setUserId] = useState("");
    const [password, setPassword] = useState("");
    const [selectedPortal, setSelectedPortal] = useState<PortalType>("requestor");
    const navigate = useNavigate();

    const { devMode, jwtBypass, toggleJwtBypass, toggleDevMode } = useContext(DevModeContext);
    const { mode, toggle: toggleTheme } = useContext(ThemeModeContext);
    const { toggleLanguage } = useContext(LanguageContext);

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
            const decodedUser = decoded?.user;
            const emailFromResponse = decodedUser?.email
                ?? loginData.email
                ?? loginData.emailId
                ?? loginData.emailID
                ?? loginData.mail
                ?? loginData.userEmail
                ?? loginData.userMail
                ?? loginData.user?.email
                ?? undefined;
            const phoneFromResponse = decodedUser?.phone
                ?? loginData.phone
                ?? loginData.contactNumber
                ?? loginData.contact
                ?? loginData.mobile
                ?? loginData.mobileNo
                ?? loginData.userPhone
                ?? loginData.user?.phone
                ?? undefined;
            const details: UserDetails = {
                userId: decodedUser?.userId || loginData.userId || submittedUserId,
                username: decodedUser?.username || loginData.username || submittedUserId,
                role: decodedUser?.role ?? loginData.roles ?? [],
                levels: decodedUser?.levels ?? loginData.levels ?? [],
                name: decodedUser?.name || loginData.name,
                email: emailFromResponse,
                phone: phoneFromResponse,
                allowedStatusActionIds: decodedUser?.allowedStatusActionIds ?? loginData.allowedStatusActionIds ?? [],
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

        const payload: LoginPayload = {
            username: userId.trim(),
            password,
            portal: selectedPortal,
        };

        loginApiHandler(() => loginUser(payload));
    };

    const errorMessage = useMemo(() => (loginError ? String(loginError) : undefined), [loginError]);

    const renderLoginForm = (portal: PortalType): ReactNode => (
        <form className="login-form" onSubmit={handleSubmit}>
            <GenericInput
                id={`${portal}-username`}
                label="Username / Employee Id"
                fullWidth
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter Username"
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <PersonIcon className="login-input__icon" />
                        </InputAdornment>
                    ),
                }}
            />

            <GenericInput
                id={`${portal}-password`}
                label="Password"
                type="password"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Password"
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <LockIcon className="login-input__icon" />
                        </InputAdornment>
                    ),
                }}
            />

            <div className="login-row">
                <label className="remember-option">
                    <input type="checkbox" />
                    Remember Me
                </label>
                <Link to="/forget-password" className="link subtle-link">
                    Forget Password?
                </Link>
            </div>

            {errorMessage && (
                <div className="login-error" role="alert">
                    {errorMessage}
                </div>
            )}

            <GenericButton type="submit" variant="contained" color="success" fullWidth sx={{ borderRadius: 2, fontWeight: 800 }}>
                LOGIN
            </GenericButton>

            <div className="divider">Or</div>

            <GenericButton
                type="button"
                variant="contained"
                color="warning"
                fullWidth
                sx={{ borderRadius: 2, fontWeight: 800 }}
            >
                Login Via Anna Darpan
            </GenericButton>

            {devMode && (
                <label className="dev-toggle">
                    <input type="checkbox" checked={jwtBypass} onChange={toggleJwtBypass} />
                    Use session storage (JWT bypass)
                </label>
            )}
        </form>
    );

    const tabs: TabItem[] = [
        {
            key: "requestor",
            tabTitle: portalLabels.requestor,
            tabComponent: renderLoginForm("requestor"),
        },
        {
            key: "helpdesk",
            tabTitle: portalLabels.helpdesk,
            tabComponent: renderLoginForm("helpdesk"),
        },
    ];

    const isDarkMode = mode === "dark";

    return (
        <div className={`login-page ${isDarkMode ? "dark" : "light"}`}>
            <div className="login-controls">
                <button type="button" className="icon-button" onClick={toggleLanguage} aria-label="Toggle language">
                    <TranslateIcon />
                </button>
                <button type="button" className="icon-button" onClick={toggleTheme} aria-label="Toggle theme">
                    {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
                </button>
                <button type="button" className={`icon-button ${devMode ? "active" : ""}`} onClick={toggleDevMode} aria-label="Toggle dev mode">
                    <DeveloperModeIcon />
                </button>
            </div>

            <div className="login-layout">
                <div className="login-left">
                    <img className="login-leaf" src="./menu-leaf.png" alt="Decorative leaf" />
                    <div className="login-left__content">
                        <div className="login-badge">
                            <div className="login-badge__crest">
                                <img src="./fciLogo.png" alt="Anna Darpan crest" />
                            </div>
                            <div className="login-badge__text">
                                <p className="tagline">सबको अन्न सबको आहार</p>
                                <h1>Anna Darpan</h1>
                            </div>
                        </div>
                        <p className="welcome">Welcome to</p>
                        <h2 className="title">Anna Darpan</h2>
                        <p className="description">Ticketing System</p>
                    </div>
                </div>

                <div className="login-right">
                    <div className="login-card">
                        <h2 className="login-card__title">Login</h2>
                        <CustomTabsComponent
                            tabs={tabs}
                            currentTab={selectedPortal}
                            onTabChange={(key) => setSelectedPortal(key as PortalType)}
                            tabsClassName="login-tabs"
                            tabSx={{
                                minWidth: 140,
                                fontWeight: 700,
                                color: colors.green.default,
                            }}
                            getTabSx={(key, isActive) => ({
                                backgroundColor: isActive ? colors.green.default : "transparent",
                                color: isActive ? "#ffffff" : colors.green.default,
                                border: `1px solid ${colors.green.default}`,
                                borderRadius: "12px 12px 0 0",
                                marginRight: "0.75rem",
                                '&:hover': {
                                    backgroundColor: isActive ? colors.green.default : colors.green.light,
                                },
                            })}
                        />
                    </div>
                </div>
            </div>

            <footer className="login-footer">
                <Link to="/public/faq" className="link">Frequently Asked Questions</Link>
            </footer>
        </div>
    );
};

export default LoginPage;
