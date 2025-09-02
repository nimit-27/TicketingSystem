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

export function checkMyTicketsAccess(key: string): boolean {
  const perms = getUserPermissions() as RolePermission | null;
  return perms?.pages?.children?.myTickets?.children?.[key]?.show ?? false;
}

export function checkMyTicketsColumnAccess(column: string): boolean {
  const perms = getUserPermissions() as RolePermission | null;
  return (
    perms?.pages?.children?.myTickets?.children?.table?.children?.columns?.children?.[column]?.show ?? true
  );
}

export function checkAccessMaster(keys: string[]): boolean {
  const perms = getUserPermissions() as RolePermission | null;
  let current = perms?.pages;

  current = keys.reduce((acc, key) => acc?.children?.[key], current);

  if (current?.show !== undefined) {
    return !!current.show;
  }

  return true;
}
