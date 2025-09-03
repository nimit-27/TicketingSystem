import { getStatusListFromApi } from "../services/StatusService";
import i18n from "../i18n";

export interface UserDetails {
  userId: string;
  username?: string;
  role?: string[];
  levels?: string[];
  name?: string;
  email?: string;
  phone?: string;
  allowedStatusActionIds?: string[];
}

const USER_KEY = 'userDetails';
const PERM_KEY = 'userPermissions';
const STATUS_LIST_KEY = 'statusList';

let statusCache: any[] | null = null;

export function setUserDetails(details: UserDetails) {
  sessionStorage.setItem(USER_KEY, JSON.stringify(details));
}

export function getUserDetails(): UserDetails | null {
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
    const list = res.data.body.data;
    statusCache = list;
    setStatusList(list);
    return list;
}

export function truncateWithEllipsis(str: string, maxLength: number): string {
  if (!str) return str;
  return str.length > maxLength ? `${str.slice(0, maxLength)}...` : str;
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
  sessionStorage.clear();
  statusCache = null;
  window.location.href = '/login';
}
