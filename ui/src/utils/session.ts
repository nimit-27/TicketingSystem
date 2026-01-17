import { NavigateFunction } from "react-router-dom";
import { getActiveSession } from "../services/AuthService";
import { getRoleSummaries } from "../services/RoleService";
import { LoginResponse, RolePermission, UserDetails } from "../types/auth";
import {
  RoleLookupItem,
  getUserDetails,
  getUserPermissions,
  setRoleLookup,
  setUserDetails,
} from "./Utils";
import { setPermissions } from "./permissions";

type PersistLoginOptions = {
  fallbackUserId?: string;
  navigate: NavigateFunction;
  redirectPath?: string;
};

type SessionDetectionOptions = {
  navigate: NavigateFunction;
  onActiveSession: (data: LoginResponse) => Promise<void>;
  onSessionAbsent?: () => void;
  redirectPath?: string;
};

export async function persistLoginData(
  data: LoginResponse,
  { fallbackUserId, navigate, redirectPath = "/" }: PersistLoginOptions,
) {
  if (!data) {
    return;
  }

  const decoded = null;
  const permissions: RolePermission | undefined = data.permissions;
  if (permissions) {
    setPermissions(permissions);
  } else {
    return;
  }

  const submittedUserId = fallbackUserId?.trim() ?? "";
  const decodedUser = decoded?.user ?? null;
  const emailFromResponse = data.email
    ?? data.emailId
    ?? data.emailID
    ?? data.mail
    ?? data.userEmail
    ?? data.userMail
    ?? data.user?.email
    ?? undefined;
  const phoneFromResponse = data.phone
    ?? data.contactNumber
    ?? data.contact
    ?? data.mobile
    ?? data.mobileNo
    ?? data.userPhone
    ?? data.user?.phone
    ?? undefined;
  const resolvedUserId = data.userId || decodedUser?.userId || submittedUserId;
  const details: UserDetails = {
    userId: resolvedUserId,
    username: data.username || resolvedUserId,
    role: data.roles ?? [],
    levels: data.levels ?? [],
    name: data.name,
    email: emailFromResponse,
    phone: phoneFromResponse,
    allowedStatusActionIds: data.allowedStatusActionIds ?? [],
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

  navigate(redirectPath);
}

export function startSessionDetection({
  navigate,
  onActiveSession,
  onSessionAbsent,
  redirectPath = "/",
}: SessionDetectionOptions) {
  const checkStoredSession = () => {
    const user = getUserDetails();
    const perms = getUserPermissions();
    if (user?.userId && perms) {
      navigate(redirectPath, { replace: true });
      return true;
    }
    return false;
  };

  let sessionResolved = checkStoredSession();
  const id = setInterval(() => {
    if (checkStoredSession()) {
      sessionResolved = true;
    }
  }, 1000);

  const handleStorage = () => {
    if (checkStoredSession()) {
      sessionResolved = true;
    }
  };
  window.addEventListener("storage", handleStorage);

  let mounted = true;
  const fetchSession = async () => {
    try {
      const response = await getActiveSession();
      if (!mounted) {
        return;
      }
      if (response.status === 200 && response.data) {
        sessionResolved = true;
        await onActiveSession(response.data);
        return;
      }
      if (!sessionResolved) {
        onSessionAbsent?.();
      }
    } catch (error) {
      console.error("Failed to check active session", error);
      if (!sessionResolved) {
        onSessionAbsent?.();
      }
    }
  };
  void fetchSession();

  return () => {
    mounted = false;
    clearInterval(id);
    window.removeEventListener("storage", handleStorage);
  };
}
