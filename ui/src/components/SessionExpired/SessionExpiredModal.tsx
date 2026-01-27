import { Box, Modal, Typography } from "@mui/material";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import GenericInput from "../UI/Input/GenericInput";
import GenericButton from "../UI/Button";
import { loginUser } from "../../services/AuthService";
import { persistLoginData } from "../../utils/session";
import { getUserDetails, logout } from "../../utils/Utils";
import { SESSION_EXPIRED_EVENT, SESSION_EXPIRED_MESSAGE } from "../../utils/sessionExpired";
import { getLastLoginPortal } from "../../utils/sessionPortal";
import "./SessionExpiredModal.scss";

type SessionExpiredDetail = {
  message?: string;
};

const SessionExpiredModal = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState(SESSION_EXPIRED_MESSAGE);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(60);
  const timerRef = useRef<number | null>(null);

  const user = getUserDetails();
  const username = user?.username || user?.userId || "";
  const portal = useMemo(() => getLastLoginPortal(), []);

  useEffect(() => {
    const handleSessionExpired = (event: Event) => {
      const detail = (event as CustomEvent<SessionExpiredDetail>)?.detail;
      setMessage(detail?.message || SESSION_EXPIRED_MESSAGE);
      setOpen(true);
      setSecondsRemaining(60);
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
      timerRef.current = window.setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            if (timerRef.current) {
              window.clearInterval(timerRef.current);
              timerRef.current = null;
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    };

    window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
    return () => {
      window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  const handleReauth = async () => {
    if (secondsRemaining <= 0) {
      setError(t("Re-login window expired. Please logout and login again."));
      return;
    }
    if (!username || !password) {
      setError(t("Password is required"));
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      const response = await loginUser({ username, password, portal });
      const rawPayload = response?.data ?? response;
      const payload = rawPayload?.body ?? rawPayload;
      await persistLoginData(payload, { fallbackUserId: username, navigate });
      setPassword("");
      setOpen(false);
    } catch (err: any) {
      const messageFromError = err?.response?.data?.apiError?.message
        ?? err?.response?.data?.message
        ?? err?.message
        ?? t("Session expired. Please login again.");
      setError(messageFromError);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    setOpen(false);
    logout();
  };

  return (
    <Modal open={open} onClose={() => null}>
      <Box className="modal-box status-modal-error session-expired-modal">
        <div className="top-line" />
        <Typography variant="h6" className="text-danger fw-bold mb-3 text-center">
          {t("Session expired")}
        </Typography>
        <HighlightOffIcon className="icon" />
        <Typography variant="body1" className="mb-3">
          {t(message)}
        </Typography>
        <Typography variant="body2" className="mb-3 session-expired-modal__countdown">
          {secondsRemaining > 0
            ? t("You can re-login within {{seconds}} seconds.", { seconds: secondsRemaining })
            : t("Re-login window expired. Please logout and login again.")}
        </Typography>
        <Typography variant="body2" className="mb-3 session-expired-modal__user">
          {t("Signed in as")} <strong>{username || t("Unknown user")}</strong>
        </Typography>
        <div className="session-expired-modal__form">
          <GenericInput
            id="session-expired-password"
            label={t("Password")}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t("Enter Password")}
            fullWidth
          />
          {error && (
            <Typography variant="body2" className="text-danger mt-2" role="alert">
              {error}
            </Typography>
          )}
        </div>
        <div className="session-expired-modal__actions">
          <GenericButton
            type="button"
            variant="outlined"
            color="inherit"
            disabled={submitting}
            onClick={handleLogout}
          >
            {t("Logout")}
          </GenericButton>
          <GenericButton
            type="button"
            variant="contained"
            color="success"
            disabled={submitting || !username || secondsRemaining <= 0}
            onClick={handleReauth}
          >
            {submitting ? t("Signing in...") : t("Login again")}
          </GenericButton>
        </div>
      </Box>
    </Modal>
  );
};

export default SessionExpiredModal;
