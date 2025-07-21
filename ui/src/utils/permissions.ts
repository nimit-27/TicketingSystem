import { getUserPermissions, setUserPermissions } from './Utils';

export interface SidebarItemPermission {
  show?: boolean;
  children?: { [key: string]: SidebarItemPermission };
  [key: string]: any;
}

export interface RolePermission {
  sidebar?: { [key: string]: SidebarItemPermission };
  pages?: { [form: string]: { [key: string]: any } };
}

export function setPermissions(perm: RolePermission) {
  setUserPermissions(perm);
}

export function checkSidebarAccess(key: string): boolean {
  const perms = getUserPermissions() as RolePermission | null;
  console.log(perms)
  return perms?.sidebar?.[key]?.show ?? false;
}

export function checkFormAccess(
  section: string,
  type: 'view' | 'create' | 'update',
): boolean {
  const perms = getUserPermissions() as RolePermission | null;
  const fp: any = perms?.pages?.[section];
  return !!fp && !!fp[type];
}

export function checkFieldAccess(section: string, field: string): boolean {
  const perms = getUserPermissions() as RolePermission | null;
  const fields: any = perms?.pages?.ticketForm?.[section];
  if (!fields) return false;
  return !!fields[field];
}
