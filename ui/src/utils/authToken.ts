import { jwtDecode, JwtPayload } from "jwt-decode";
import { DecodedAuthDetails, UserDetails } from "../types/auth";

const TOKEN_KEY = "authToken";
const BYPASS_KEY = "jwtBypass";

interface ExtendedJwtPayload extends JwtPayload {
  userId?: string;
  username?: string;
  name?: string;
  roles?: string[];
  levels?: string[];
  allowedStatusActionIds?: string[];
}

let decodedCache: DecodedAuthDetails | null = null;

export function storeToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
  decodedCache = null;
}

export function getActiveToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearStoredToken() {
  localStorage.removeItem(TOKEN_KEY);
  decodedCache = null;
}

export function isJwtBypassEnabled(): boolean {
  return sessionStorage.getItem(BYPASS_KEY) === "true";
}

export function setJwtBypassEnabled(value: boolean) {
  sessionStorage.setItem(BYPASS_KEY, value ? "true" : "false");
}

export function toggleJwtBypass(): boolean {
  const next = !isJwtBypassEnabled();
  setJwtBypassEnabled(next);
  return next;
}

export function getDecodedAuthDetails(): DecodedAuthDetails | null {
  if (decodedCache) {
    return decodedCache;
  }

  const token = getActiveToken();
  if (!token) {
    return null;
  }

  try {
    const claims = jwtDecode<ExtendedJwtPayload>(token);
    if (claims.exp && claims.exp * 1000 < Date.now()) {
      clearStoredToken();
      return null;
    }

    const user: UserDetails = {
      userId: claims.userId ?? "",
      username: claims.username ?? claims.sub ?? undefined,
      role: claims.roles ?? undefined,
      levels: claims.levels ?? undefined,
      name: claims.name ?? undefined,
      allowedStatusActionIds: claims.allowedStatusActionIds ?? undefined,
    };

    decodedCache = { user };
    return decodedCache;
  } catch (error) {
    clearStoredToken();
    return null;
  }
}

export function clearDecodedCache() {
  decodedCache = null;
}
