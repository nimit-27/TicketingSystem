import React, { useContext, useEffect, useMemo, useState } from 'react';
import {
    Box,
    Chip,
    Divider,
    InputAdornment,
    Paper,
    Stack,
    Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import CustomIconButton from '../components/UI/IconButton/CustomIconButton';
import GenericInput from '../components/UI/Input/GenericInput';
import GenericButton from '../components/UI/Button';
import SuccessModal from '../components/UI/SuccessModal';
import { changeUserPassword } from '../services/UserService';
import { getCurrentUserDetails } from '../config/config';
import { logout } from '../utils/Utils';
import { useSnackbar } from '../context/SnackbarContext';
import { LanguageContext } from '../context/LanguageContext';
import { ThemeModeContext } from '../context/ThemeContext';
import './ChangePasswordPage.scss';

const COMMON_PASSWORDS = new Set(
    [
        'password', '123456', '123456789', 'qwerty', 'letmein',
        'welcome', 'football', 'monkey', 'abc123', 'admin',
        'pass@123', 'password1', 'iloveyou', '111111',
    ].map((value) => value.toLowerCase()),
);

const MIN_PASSWORD_LENGTH = 8;
const STRONG_PASSWORD_LENGTH = 12;

type PasswordValidationResult = {
    hasMinLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasDigit: boolean;
    hasSpecial: boolean;
    notCommon: boolean;
    recommendedLength: boolean;
};

type ServerError = {
    field?: 'oldPassword' | 'newPassword' | 'global';
    message: string;
    cooldownSeconds?: number;
};

const evaluatePassword = (password: string): PasswordValidationResult => {
    const hasMinLength = password.length >= MIN_PASSWORD_LENGTH;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasDigit = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    const notCommon = password ? !COMMON_PASSWORDS.has(password.toLowerCase()) : false;
    const recommendedLength = password.length >= STRONG_PASSWORD_LENGTH;

    return {
        hasMinLength,
        hasUppercase,
        hasLowercase,
        hasDigit,
        hasSpecial,
        notCommon,
        recommendedLength,
    };
};

const getStrengthLevel = (password: string, validation: PasswordValidationResult): number => {
    if (!password) return 0;
    const baseChecks = [
        validation.hasMinLength,
        validation.hasUppercase,
        validation.hasLowercase,
        validation.hasDigit,
        validation.hasSpecial,
    ];
    const baseScore = baseChecks.filter(Boolean).length;
    const bonus = (validation.notCommon ? 1 : 0) + (validation.recommendedLength ? 1 : 0);
    const totalScore = baseScore + bonus;

    if (!validation.hasMinLength) return 0;
    if (totalScore <= 2) return 1;
    if (totalScore <= 4) return 2;
    if (totalScore === 5) return 3;
    return 4;
};

const strengthLabel = (level: number, t: (key: string) => string): string => {
    switch (level) {
        case 1:
            return t('Weak');
        case 2:
            return t('Fair');
        case 3:
            return t('Good');
        case 4:
            return t('Strong');
        default:
            return t('No password entered');
    }
};

const ChangePasswordPage: React.FC = () => {
    const theme = useTheme();
    const { t } = useTranslation();
    const { showMessage } = useSnackbar();
    const { toggleLanguage, language } = useContext(LanguageContext);
    const { toggle: toggleTheme, mode } = useContext(ThemeModeContext);

    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [touched, setTouched] = useState({
        old: false,
        new: false,
        confirm: false,
    });

    const [submitting, setSubmitting] = useState(false);
    const [successModalOpen, setSuccessModalOpen] = useState(false);
    const [fieldError, setFieldError] = useState<{ oldPassword?: string; newPassword?: string; confirmPassword?: string }>({});
    const [globalError, setGlobalError] = useState<string | null>(null);
    const [, setFailedAttempts] = useState(0);

    const [cooldownUntil, setCooldownUntil] = useState<number | null>(null);
    const [cooldownSecondsLeft, setCooldownSecondsLeft] = useState<number>(0);

    const userDetails = getCurrentUserDetails();
    const userId = userDetails?.userId;

    const validation = useMemo(() => evaluatePassword(newPassword), [newPassword]);
    const strengthLevel = useMemo(() => getStrengthLevel(newPassword, validation), [newPassword, validation]);

    const newPasswordIssues = useMemo(() => {
        const issues: string[] = [];
        if (!validation.hasMinLength) issues.push(t('Password must be at least 8 characters (12+ recommended).'));
        if (!validation.hasUppercase) issues.push(t('Include at least one uppercase letter.'));
        if (!validation.hasLowercase) issues.push(t('Include at least one lowercase letter.'));
        if (!validation.hasDigit) issues.push(t('Include at least one number.'));
        if (!validation.hasSpecial) issues.push(t('Include at least one special character.'));
        if (!validation.notCommon) issues.push(t('Avoid commonly used or leaked passwords.'));
        if (oldPassword && newPassword && oldPassword === newPassword) issues.push(t('New password must be different from your current password.'));
        return issues;
    }, [newPassword, oldPassword, validation, t]);

    const isNewPasswordValid = useMemo(
        () => validation.hasMinLength
            && validation.hasUppercase
            && validation.hasLowercase
            && validation.hasDigit
            && validation.hasSpecial
            && validation.notCommon
            && (!oldPassword || oldPassword !== newPassword),
        [validation, oldPassword, newPassword],
    );

    const confirmPasswordError = useMemo(() => {
        if (!touched.confirm) return '';
        if (!confirmPassword) return t('Please re-enter your new password.');
        if (confirmPassword !== newPassword) return t('Passwords must match.');
        return '';
    }, [confirmPassword, newPassword, touched.confirm, t]);

    const isRateLimited = useMemo(
        () => (cooldownUntil ? cooldownUntil > Date.now() : false),
        [cooldownUntil],
    );

    useEffect(() => {
        if (!isRateLimited) {
            setCooldownSecondsLeft(0);
            return;
        }

        const timer = window.setInterval(() => {
            if (!cooldownUntil) return;
            const remaining = Math.max(0, Math.ceil((cooldownUntil - Date.now()) / 1000));
            setCooldownSecondsLeft(remaining);
            if (remaining <= 0) {
                setCooldownUntil(null);
            }
        }, 500);

        return () => window.clearInterval(timer);
    }, [cooldownUntil, isRateLimited]);

    useEffect(() => {
        setFieldError({});
        setGlobalError(null);
    }, [oldPassword, newPassword, confirmPassword]);

    const mapServerError = (error: any): ServerError => {
        const status = error?.response?.status;
        const retryAfterHeader = error?.response?.headers?.['retry-after'] ?? error?.response?.headers?.['Retry-After'];
        const retryAfterSeconds = retryAfterHeader ? Number.parseInt(retryAfterHeader, 10) : undefined;
        const rawMessage = error?.response?.data?.apiError?.message
            || error?.response?.data?.body?.data?.message
            || error?.response?.data?.message
            || error?.message
            || 'Something went wrong';
        const normalized = rawMessage?.toString()?.toLowerCase?.() ?? '';

        if (status === 429 || normalized.includes('rate limit')) {
            return {
                field: 'global',
                message: 'Too many attempts. Please wait and try again.',
                cooldownSeconds: retryAfterSeconds ?? 30,
            };
        }

        if (status === 423 || normalized.includes('locked')) {
            return {
                field: 'global',
                message: 'Your account is locked. Please try again later or contact support.',
            };
        }

        if (normalized.includes('old') && normalized.includes('password')) {
            return { field: 'oldPassword', message: 'The old password you entered is incorrect.' };
        }

        if (normalized.includes('weak') || normalized.includes('policy')) {
            return { field: 'newPassword', message: 'The new password does not meet the security policy.' };
        }

        if (normalized.includes('previous') || normalized.includes('last')) {
            return { field: 'newPassword', message: 'New password must not match your recent passwords.' };
        }

        return { field: 'global', message: rawMessage };
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setTouched({ old: true, new: true, confirm: true });

        if (!userId) {
            setGlobalError(t('Session expired. Please login again.'));
            return;
        }

        if (isRateLimited || !oldPassword || !isNewPasswordValid || confirmPassword !== newPassword) {
            return;
        }

        setSubmitting(true);
        setGlobalError(null);
        setFieldError({});

        try {
            await changeUserPassword(userId, { oldPassword, newPassword });
            showMessage(t('Password changed successfully'), 'success');
            setSuccessModalOpen(true);
            setFailedAttempts(0);
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setTouched({ old: false, new: false, confirm: false });
        } catch (error: any) {
            const mapped = mapServerError(error);
            const translatedMessage = t(mapped.message);

            showMessage(translatedMessage, 'error');
            if (mapped.field === 'oldPassword') {
                setFieldError((prev) => ({ ...prev, oldPassword: translatedMessage }));
            } else if (mapped.field === 'newPassword') {
                setFieldError((prev) => ({ ...prev, newPassword: translatedMessage }));
            } else {
                setGlobalError(translatedMessage);
            }

            if (mapped.cooldownSeconds) {
                const until = Date.now() + mapped.cooldownSeconds * 1000;
                setCooldownUntil(until);
                setCooldownSecondsLeft(mapped.cooldownSeconds);
            }

            setFailedAttempts((prev) => {
                const next = prev + 1;
                if (!mapped.cooldownSeconds && next >= 3) {
                    const fallbackCooldown = 20;
                    setCooldownUntil(Date.now() + fallbackCooldown * 1000);
                    setCooldownSecondsLeft(fallbackCooldown);
                }
                return next;
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleReLogin = () => {
        logout();
    };

    const requirementItems = useMemo(() => ([
        { key: 'length', met: validation.hasMinLength, label: t('At least 8 characters (12+ recommended)') },
        { key: 'upper', met: validation.hasUppercase, label: t('One uppercase letter (A-Z)') },
        { key: 'lower', met: validation.hasLowercase, label: t('One lowercase letter (a-z)') },
        { key: 'digit', met: validation.hasDigit, label: t('One number (0-9)') },
        { key: 'special', met: validation.hasSpecial, label: t('One special character (!@#$...)') },
        { key: 'common', met: validation.notCommon, label: t('Not a commonly used password') },
    ]), [t, validation]);

    const containerBg = theme.palette.background.default;
    const cardBg = theme.palette.background.paper;
    const accentColor = theme.palette.mode === 'dark' ? theme.palette.primary.light : theme.palette.primary.main;
    const strengthColors = [
        theme.palette.grey[400],
        theme.palette.error.main,
        theme.palette.warning.main,
        theme.palette.info?.main ?? theme.palette.primary.main,
        theme.palette.success.main,
    ];
    const strengthColor = strengthColors[strengthLevel];

    const canSubmit = Boolean(
        oldPassword
        && isNewPasswordValid
        && confirmPassword === newPassword
        && !submitting
        && !isRateLimited,
    );

    return (
        <Box className="change-password-page" sx={{ backgroundColor: containerBg }}>
            <Paper
                className="change-password-card"
                elevation={3}
                sx={{
                    backgroundColor: cardBg,
                    borderColor: theme.palette.divider,
                }}
            >
                <div className="change-password-card__header">
                    <div>
                        <Typography variant="h5" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
                            {t('Change Password')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {t('Keep your account secure by updating your password regularly.')}
                        </Typography>
                    </div>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <CustomIconButton
                            icon={mode === 'light' ? 'darkmode' : 'lightmode'}
                            aria-label={t('Toggle theme')}
                            onClick={toggleTheme}
                            style={{ color: accentColor }}
                        />
                        <CustomIconButton
                            icon="translate"
                            aria-label={t('Toggle language')}
                            onClick={toggleLanguage}
                            style={{ color: accentColor }}
                        />
                        <Chip
                            size="small"
                            label={mode === 'light' ? t('Light mode') : t('Dark mode')}
                            sx={{ fontWeight: 600 }}
                        />
                        <Chip
                            size="small"
                            label={language?.toUpperCase?.() ?? 'EN'}
                            sx={{ fontWeight: 600 }}
                        />
                    </Stack>
                </div>

                <Divider sx={{ my: 2 }} />

                <form onSubmit={handleSubmit} className="change-password-form">
                    <GenericInput
                        label={t('Enter Old Password')}
                        type={showOldPassword ? 'text' : 'password'}
                        required
                        fullWidth
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        onBlur={() => setTouched((prev) => ({ ...prev, old: true }))}
                        error={touched.old && (!oldPassword || Boolean(fieldError.oldPassword))}
                        helperText={
                            touched.old && !oldPassword
                                ? t('Old password is required.')
                                : fieldError.oldPassword
                        }
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <CustomIconButton
                                        icon={showOldPassword ? 'visibilityOff' : 'visibility'}
                                        aria-label={t('Toggle old password visibility')}
                                        onClick={() => setShowOldPassword((prev) => !prev)}
                                        edge="end"
                                    />
                                </InputAdornment>
                            ),
                        }}
                    />

                    <GenericInput
                        label={t('Enter New Password')}
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        fullWidth
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        onBlur={() => setTouched((prev) => ({ ...prev, new: true }))}
                        error={touched.new && (!isNewPasswordValid || Boolean(fieldError.newPassword))}
                        helperText={
                            fieldError.newPassword
                            || (touched.new && !isNewPasswordValid && newPasswordIssues[0])
                            || ' '
                        }
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <CustomIconButton
                                        icon={showNewPassword ? 'visibilityOff' : 'visibility'}
                                        aria-label={t('Toggle new password visibility')}
                                        onClick={() => setShowNewPassword((prev) => !prev)}
                                        edge="end"
                                    />
                                </InputAdornment>
                            ),
                        }}
                    />

                    <div
                        className="password-requirements"
                        style={{
                            borderColor: theme.palette.divider,
                            backgroundColor: theme.palette.action?.hover ?? theme.palette.background.default,
                        }}
                    >
                        <div className="password-requirements__header">
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                {t('Password requirements')}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {t('All conditions must be satisfied')}
                            </Typography>
                        </div>
                        <ul>
                            {requirementItems.map((item) => (
                                <li
                                    key={item.key}
                                    className={item.met ? 'met' : 'unmet'}
                                    style={{ color: item.met ? theme.palette.success.main : theme.palette.error.main }}
                                >
                                    <span className="indicator" style={{ backgroundColor: item.met ? theme.palette.success.main : theme.palette.grey[400] }} />
                                    <span>{item.label}</span>
                                </li>
                            ))}
                            {oldPassword && newPassword && oldPassword === newPassword && (
                                <li
                                    className="unmet"
                                    style={{ color: theme.palette.error.main }}
                                >
                                    <span className="indicator" style={{ backgroundColor: theme.palette.error.main }} />
                                    <span>{t('New password must be different from your current password.')}</span>
                                </li>
                            )}
                        </ul>
                    </div>

                    <div className="strength-meter">
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {t('Password strength')}
                        </Typography>
                        <div className="strength-meter__bars">
                            {[1, 2, 3, 4].map((level) => (
                                <div
                                    key={`strength-${level}`}
                                    className={`strength-meter__bar ${strengthLevel >= level ? 'active' : ''}`}
                                    style={{ backgroundColor: strengthLevel >= level ? strengthColor : theme.palette.grey[300] }}
                                />
                            ))}
                        </div>
                        <Typography variant="caption" color="text.secondary">
                            {strengthLabel(strengthLevel, t)}
                        </Typography>
                    </div>

                    <GenericInput
                        label={t('Re-enter New Password')}
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        fullWidth
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        onBlur={() => setTouched((prev) => ({ ...prev, confirm: true }))}
                        error={Boolean(confirmPasswordError) || Boolean(fieldError.confirmPassword)}
                        helperText={confirmPasswordError || fieldError.confirmPassword}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <CustomIconButton
                                        icon={showConfirmPassword ? 'visibilityOff' : 'visibility'}
                                        aria-label={t('Toggle confirm password visibility')}
                                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                                        edge="end"
                                    />
                                </InputAdornment>
                            ),
                        }}
                    />

                    {globalError && (
                        <Typography color="error" variant="body2" role="alert">
                            {globalError}
                        </Typography>
                    )}

                    {isRateLimited && (
                        <Typography color="warning.main" variant="caption" sx={{ fontWeight: 600 }}>
                            {t('Please wait {{seconds}} seconds before trying again.', { seconds: cooldownSecondsLeft })}
                        </Typography>
                    )}

                    <GenericButton
                        type="submit"
                        variant="contained"
                        color="success"
                        fullWidth
                        disabled={!canSubmit}
                        sx={{ mt: 1.5, borderRadius: 2, fontWeight: 800 }}
                    >
                        {submitting ? t('Submitting...') : t('Update Password')}
                    </GenericButton>
                </form>
            </Paper>

            <SuccessModal
                open={successModalOpen}
                onClose={() => setSuccessModalOpen(false)}
                title={t('Password changed successfully')}
                actions={(
                    <>
                        <GenericButton
                            onClick={handleReLogin}
                            color="warning"
                            variant="contained"
                            sx={{ fontWeight: 700, borderRadius: 2 }}
                        >
                            {t('Re-login')}
                        </GenericButton>
                        <GenericButton
                            onClick={() => setSuccessModalOpen(false)}
                            color="success"
                            variant="contained"
                            sx={{ fontWeight: 700, borderRadius: 2 }}
                        >
                            {t('Keep me logged in')}
                        </GenericButton>
                    </>
                )}
            />
        </Box>
    );
};

export default ChangePasswordPage;
