export const SESSION_EXPIRED_MESSAGE = "Session has expired. Please login again.";
export const SESSION_EXPIRED_EVENT = "session-expired";

export const isSessionExpiredMessage = (message?: string | null) => {
  if (!message) {
    return false;
  }
  return message.toLowerCase().includes("session has expired");
};

export const triggerSessionExpired = (message: string = SESSION_EXPIRED_MESSAGE) => {
  window.dispatchEvent(
    new CustomEvent(SESSION_EXPIRED_EVENT, {
      detail: {
        message,
      },
    }),
  );
};
