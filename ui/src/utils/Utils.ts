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
import { useMemo } from "react";
import { getCurrentUserDetails } from "../config/config";

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
  localStorage.setItem(USER_KEY, JSON.stringify(details));
}

export function getUserDetails(): UserDetails | null {
  // if (!isJwtBypassEnabled()) {
  //   const decoded = getDecodedAuthDetails();
  //   if (decoded?.user) {
  //     return decoded.user;
  //   }
  // }

  const data = localStorage.getItem(USER_KEY);
  if (!data) {
    return null;
  }

  const parsed = JSON.parse(data) as UserDetails & Record<string, any>;
  const zoneCode = parsed.zoneCode ?? parsed.zoCode ?? parsed.zo_code;
  const regionCode = parsed.regionCode ?? parsed.roCode ?? parsed.ro_code ?? parsed.hrmsRegCode;
  const districtCode = parsed.districtCode ?? parsed.doCode ?? parsed.do_code;

  return {
    ...parsed,
    zoneCode,
    regionCode,
    districtCode,
  };
}

export function setUserPermissions(perm: any) {
  localStorage.setItem(PERM_KEY, JSON.stringify(perm));
}

export function getUserPermissions(): any {
  const data = localStorage.getItem(PERM_KEY);
  return data ? JSON.parse(data) : null;
}

export function clearSession() {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(PERM_KEY);
  localStorage.removeItem(ROLE_LOOKUP_KEY);
  localStorage.removeItem(STATUS_LIST_KEY);
  statusCache = null;
}

export function setRoleLookup(list: RoleLookupItem[]) {
  localStorage.setItem(ROLE_LOOKUP_KEY, JSON.stringify(list));
}

export function getRoleLookup(): RoleLookupItem[] | null {
  const data = localStorage.getItem(ROLE_LOOKUP_KEY);
  return data ? JSON.parse(data) : null;
}

const roleLookup = getRoleLookup() || []

const roleMap = () => {
  if (!roleLookup) {
    return {} as Record<string, string>;
  }

  return roleLookup.reduce((acc: Record<string, string>, item: RoleLookupItem) => {
    const roleId = item?.roleId;
    const roleName = item?.role ?? (roleId != null ? String(roleId) : "");

    if (roleId != null && roleName) {
      acc[String(roleId)] = String(roleName);
    }

    if (typeof item?.role === "string" && roleName) {
      acc[item.role] = String(roleName);
      acc[item.role.toUpperCase()] = String(roleName);
    }

    return acc;
  }, {});
};

export function getDisplayRoles(): RoleLookupItem[] {
  const user = getCurrentUserDetails();

  let rawRoles = user?.role ?? []

  if (!rawRoles.length) return [] as RoleLookupItem[];

  let res = roleLookup.filter((item) => rawRoles.includes(item.roleId.toString()))
  return res
}

export function setStatusList(list: any[]) {
  localStorage.setItem(STATUS_LIST_KEY, JSON.stringify(list));
}

export function getStatusList(): any[] | null {
  const data = localStorage.getItem(STATUS_LIST_KEY);
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
  void logoutUser()
    .then((res) => {
      if (res.data.body.success) {
        clearStoredToken();
        clearSession();
        const basePath = process.env.PUBLIC_URL || '';
        const loginPath = `${basePath}/login`;
        window.location.assign(loginPath);
      } else {
        throw new Error("Something went wrong")
      }
    })
    .catch((error) => {
      console.warn("Logout request failed", error);
    });
}

export function getDropdownOptions<T>(arr: T[] | any, labelKey: keyof T, valueKey: keyof T): DropdownOption[] {
  return Array.isArray(arr)
    ? arr.map(item => ({
      label: String(item[labelKey]),
      value: item[valueKey]
    }))
    : [];
}

export function getDropdownOptionsWithExtraOption<T>(arr: T[] | any, labelKey: keyof T, valueKey: keyof T, extraOption: DropdownOption): DropdownOption[] {
  const base = Array.isArray(arr)
    ? arr.map(item => ({
      label: String(item[labelKey]),
      value: item[valueKey]
    }))
    : [];

  return extraOption ? [extraOption, ...base] : base;
}
