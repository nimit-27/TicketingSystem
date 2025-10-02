import { getUserPermissions, setUserPermissions } from './Utils';
import { RolePermission } from '../types/auth';

export function setPermissions(perm: RolePermission) {
  setUserPermissions(perm);
}

export function checkSidebarAccess(key: string): boolean {
  const perms = getUserPermissions() as RolePermission | null;
  return perms?.sidebar?.children?.[key]?.show ?? false;
}

export function checkFormAccess(
  section: string,
  type: 'view' | 'create' | 'update',
): boolean {
  const perms = getUserPermissions() as RolePermission | null;
  const fp: any = perms?.pages?.children?.[section];
  return !!fp && !!fp[type];
}

export function checkFieldAccess(section: string, field: string): boolean {
  const perms = getUserPermissions() as RolePermission | null;
  const fields: any = perms?.pages?.children?.ticketForm?.children?.[section]?.children;
  if (!fields) return false;
  return !!fields[field]?.show;
}

export function getFieldChildren(section: string, field: string) {
  const perms = getUserPermissions() as RolePermission | null;
  return perms?.pages?.children?.ticketForm?.children?.[section]?.children?.[field]?.children;
}

export function checkMyTicketsAccess(key: string, pageKey: string = 'myTickets'): boolean {
  const perms = getUserPermissions() as RolePermission | null;
  return perms?.pages?.children?.[pageKey]?.children?.[key]?.show ?? false;
}

export function checkMyTicketsColumnAccess(column: string, pageKey: string = 'myTickets'): boolean {
  const perms = getUserPermissions() as RolePermission | null;
  return (
    perms?.pages?.children?.[pageKey]?.children?.table?.children?.columns?.children?.[column]?.show ?? true
  );
}

export function checkAccessMaster(keys: string[]): boolean {
  const perms = getUserPermissions() as RolePermission | null;
  let current = perms?.pages;

  current = keys.reduce((acc, key) => acc?.children?.[key], current);

  if (current?.show !== undefined) {
    return !!current.show;
  }

  return false;
}
