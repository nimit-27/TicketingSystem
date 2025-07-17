export interface SidebarItemPermission {
  show?: boolean;
  children?: { [key: string]: SidebarItemPermission };
  [key: string]: any;
}

export interface RolePermission {
  sidebar?: { [key: string]: SidebarItemPermission };
  forms?: { [form: string]: { [key: string]: any } };
}
import {
  getUserPermissions,
  setUserPermissions,
} from './Utils';

export function setPermissions(perm: RolePermission) {
  setUserPermissions(perm);
}

export function checkSidebarAccess(key: string): boolean {
  const perms = getUserPermissions() as RolePermission | null;
  return perms?.sidebar?.[key]?.show ?? false;
}

export function checkFormAccess(
  form: string,
  type: 'view' | 'create' | 'update',
): boolean {
  const perms = getUserPermissions() as RolePermission | null;
  const fp: any = perms?.forms?.[form];
  return !!fp && !!fp[type];
}

export function checkFieldAccess(form: string, field: string): boolean {
  const perms = getUserPermissions() as RolePermission | null;
  const fp: any = perms?.forms?.[form];
  if (!fp) return false;
  const fields: any = fp.fields || {};
  return !!fields[field];
}
