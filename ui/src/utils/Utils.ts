import { getStatusListFromApi } from "../services/StatusService";
import i18n from "../i18n";
import { DropdownOption } from "../components/UI/Dropdown/GenericDropdown";
import { UserDetails } from "../types/auth";
import {
  clearStoredToken,
  getDecodedAuthDetails,
  isJwtBypassEnabled,
} from "./authToken";
import { logoutUser } from "../services/AuthService";

export interface RoleLookupItem {
  roleId: number | string;
  role: string;
}

const USER_KEY = 'userDetails';
const PERM_KEY = 'userPermissions';
const STATUS_LIST_KEY = 'statusList';
const ROLE_LOOKUP_KEY = 'roleLookup';

let statusCache: any[] | null = null;

export function setUserDetails(details: UserDetails) {
  sessionStorage.setItem(USER_KEY, JSON.stringify(details));
}

export function getUserDetails(): UserDetails | null {
  if (!isJwtBypassEnabled()) {
    const decoded = getDecodedAuthDetails();
    if (decoded?.user) {
      return decoded.user;
    }
  }

  const data = sessionStorage.getItem(USER_KEY);
  return data ? JSON.parse(data) : null;
}

export function setUserPermissions(perm: any) {
  sessionStorage.setItem(PERM_KEY, JSON.stringify(perm));
}

export function getUserPermissions(): any {
  const data = sessionStorage.getItem(PERM_KEY);
  return data ? JSON.parse(data) : null;
}

export function clearSession() {
  sessionStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(PERM_KEY);
  sessionStorage.removeItem(ROLE_LOOKUP_KEY);
  sessionStorage.removeItem(STATUS_LIST_KEY);
  statusCache = null;
}

export function setRoleLookup(list: RoleLookupItem[]) {
  sessionStorage.setItem(ROLE_LOOKUP_KEY, JSON.stringify(list));
}

export function getRoleLookup(): RoleLookupItem[] | null {
  const data = sessionStorage.getItem(ROLE_LOOKUP_KEY);
  return data ? JSON.parse(data) : null;
}

export function setStatusList(list: any[]) {
  sessionStorage.setItem(STATUS_LIST_KEY, JSON.stringify(list));
}

export function getStatusList(): any[] | null {
  const data = sessionStorage.getItem(STATUS_LIST_KEY);
  return data ? JSON.parse(data) : null;
}

export function getStatusNameById(statusId: string): any | null {
  const statusList = getStatusList();
  return statusList ? statusList?.find(status => status.statusId === statusId)?.statusName : null;
}

export function getStatusColorById(statusId: string): string | null {
  const statusList = getStatusList();
  return statusList ? statusList?.find(status => status.statusId === statusId)?.color || null : null;
}

export async function getStatuses(): Promise<any[]> {
  if (statusCache) {
    return statusCache;
  }
  const stored = getStatusList();
  if (stored) {
    statusCache = stored;
    return stored;
  }
  const res = await getStatusListFromApi();
  const rawPayload = res?.data ?? res;
  const body = rawPayload?.body ?? rawPayload;
  const payload = body && typeof body === "object" && "data" in body ? body.data : body;
  const list = Array.isArray(payload) ? payload : [];
  statusCache = list;
  setStatusList(list);
  return list;
}

export function truncateWithEllipsis(str: string, maxLength: number): string {
  if (!str) return str;
  return str.length > maxLength ? `${str.slice(0, maxLength)}...` : str;
}

export function truncateWithLeadingEllipsis(str: string, maxLength: number): string {
  if (!str) return str;
  const safeLength = Math.max(0, maxLength);
  return str.length > safeLength ? `...${str.slice(-safeLength)}` : str;
}

export function formatDateWithSuffix(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (i18n.language === 'hi') {
    const day = d.getDate();
    const month = d.toLocaleString('hi-IN', { month: 'long' });
    const year = d.getFullYear();
    return `${day} ${month}, ${year}`;
  }
  const day = d.getDate();
  const j = day % 10,
    k = day % 100;
  const suffix = j === 1 && k !== 11 ? 'st'
    : j === 2 && k !== 12 ? 'nd'
      : j === 3 && k !== 13 ? 'rd'
        : 'th';
  const month = d.toLocaleString('en-US', { month: 'long' });
  const year = d.getFullYear();
  return `${day}${suffix} ${month}, ${year}`;
}

export function logout() {
  void logoutUser().catch((error) => {
    console.warn("Logout request failed", error);
  });
  clearStoredToken();
  clearSession();
  const basePath = process.env.PUBLIC_URL || '';
  const loginPath = `${basePath}/login`;
  window.location.assign(loginPath);
}

export function getDropdownOptions<T>(arr: T[] | any, labelKey: keyof T, valueKey: keyof T): DropdownOption[] {
  return Array.isArray(arr)
    ? arr.map(item => ({
      label: String(item[labelKey]),
      value: item[valueKey]
    }))
    : [];
}
