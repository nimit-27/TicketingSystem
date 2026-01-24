import { FC, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PersonIcon from "@mui/icons-material/Person";
import LockIcon from "@mui/icons-material/Lock";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import TranslateIcon from "@mui/icons-material/Translate";
import DeveloperModeIcon from "@mui/icons-material/DeveloperMode";
import { InputAdornment, useTheme } from "@mui/material";
import CustomTabsComponent, { TabItem } from "../components/UI/CustomTabsComponent";
import { useTranslation } from "react-i18next";
import { loginUser } from "../services/AuthService";
import { useApi } from "../hooks/useApi";
import { LoginPayload, LoginResponse } from "../types/auth";
import { persistLoginData, startSessionDetection } from "../utils/session";
import { setLastLoginPortal } from "../utils/sessionPortal";
import colors from "../themes/colors";
import { ThemeModeContext } from "../context/ThemeContext";
import { LanguageContext } from "../context/LanguageContext";
import { DevModeContext } from "../context/DevModeContext";
import { devMode as envDevMode } from "../config/config";
import GenericInput from "../components/UI/Input/GenericInput";
import GenericButton from "../components/UI/Button";
import "./LoginPage.scss";

type PortalType = "requestor" | "helpdesk";

const LoginPage: FC = () => {
    const theme = useTheme();

    const [userId, setUserId] = useState("");
    const [password, setPassword] = useState("");
    const [selectedPortal, setSelectedPortal] = useState<PortalType>("requestor");
    const navigate = useNavigate();

    const { t } = useTranslation();
    const { devMode, jwtBypass, toggleJwtBypass, toggleDevMode } = useContext(DevModeContext);
    const { mode, toggle: toggleTheme } = useContext(ThemeModeContext);
    const { toggleLanguage } = useContext(LanguageContext);

    const { data: loginData, error: loginError, apiHandler: loginApiHandler } = useApi<LoginResponse>();

    useEffect(() => {
        document.title = t("Login");
    }, [t]);

    useEffect(() => {
        if (!loginData) {
            return;
        }
        void persistLoginData(loginData, { fallbackUserId: userId.trim(), navigate });
    }, [loginData, navigate, userId]);

    useEffect(() => {
        const cleanup = startSessionDetection({
            navigate,
            onActiveSession: (data) => persistLoginData(data, { navigate }),
        });
        return cleanup;
    }, [navigate]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload: LoginPayload = {
            username: userId.trim(),
            password,
            portal: selectedPortal,
        };

        setLastLoginPortal(selectedPortal);
        loginApiHandler(() => loginUser(payload));
    };

    const errorMessage = useMemo(() => (loginError ? String(loginError) : undefined), [loginError]);

    const renderLoginForm = (portal: PortalType): ReactNode => (
        <form className="login-form" onSubmit={handleSubmit}>
            <GenericInput
                id={`${portal}-username`}
                label={t("Username / Employee Id")}
                fullWidth
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder={t("Enter Username")}
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
                label={t("Password")}
                type="password"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("Enter Password")}
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
                    {t("Remember Me")}
                </label>
                <Link to="/forget-password" className="link subtle-link">
                    {t("Forget Password?")}
                </Link>
            </div>

            {errorMessage && (
                <div className="login-error" role="alert">
                    {errorMessage}
                </div>
            )}

            <GenericButton type="submit" variant="contained" color="success" fullWidth sx={{ borderRadius: 2, fontWeight: 800 }}>
                {t("LOGIN")}
            </GenericButton>

            <div className="divider">{t("Or")}</div>

            <GenericButton
                type="button"
                variant="contained"
                color="warning"
                fullWidth
                sx={{ borderRadius: 2, fontWeight: 800 }}
            >
                {t("Login Via Anna Darpan")}
            </GenericButton>

            {envDevMode && devMode && (
                <label className="dev-toggle">
                    <input type="checkbox" checked={jwtBypass} onChange={toggleJwtBypass} />
                    Use session storage (JWT bypass)
                </label>
            )}
        </form>
    );

    const portalLabels: Record<PortalType, string> = useMemo(() => ({
        requestor: t("Requester"),
        helpdesk: t("Helpdesk"),
    }), [t]);

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
                {envDevMode && (
                    <button type="button" className={`icon-button ${devMode ? "active" : ""}`} onClick={toggleDevMode} aria-label="Toggle dev mode">
                        <DeveloperModeIcon />
                    </button>
                )}
            </div>

            <div className="login-layout">
                <div className="d-flex flex-column login-left position-relative" style={{ background: theme.palette.sidebar.background }}>
                    <div className="login-left w-100">
                        <div className="login-left__content">
                            <div className="justify-content-center">
                                <div className="login-badge__crest">
                                    <img src="./fci-logo-white.png" alt="Anna Darpan crest" />
                                </div>
                                <div className="login-badge__text">

                                    <h3 className="m-0">सबको <span style={{ color: "#f26727" }}>अन्न</span> सबको <span style={{ color: "#f26727" }}>अन्न</span> आहार </h3>
                                </div>
                            </div>
                            <p className="welcome">{t("Welcome to")}</p>
                            <h2 className="title">{t("Anna Darpan")}</h2>
                            <p className="description">{t("Ticketing System")}</p>
                        </div>
                    </div>
                    <footer className="login-footer w-100 position-absolute" style={{ bottom: 0, background: theme.palette.header.background }}>
                        <Link to="/public/faq" className="link">{t("Frequently Asked Questions")}</Link>
                        <img className="login-leaf position-absolute" src="./menu-leaf.png" alt="Decorative leaf" />
                    </footer>
                </div>

                <div className="login-right">
                    <div>
                        <h2 className="login-card__title">{t("Login")}</h2>
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
        </div>
    );
};

export default LoginPage;
