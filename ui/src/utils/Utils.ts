export interface UserDetails {
  userId: string;
  username?: string;
  role?: string[];
  name?: string;
  email?: string;
  phone?: string;
}

const USER_KEY = 'userDetails';
const PERM_KEY = 'userPermissions';
const STATUS_LIST_KEY = 'statusList';

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
  console.log({ statusId })
  return statusList ? statusList?.find(status => status.statusId === statusId)?.statusName : null;
}