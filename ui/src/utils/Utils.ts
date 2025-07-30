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
