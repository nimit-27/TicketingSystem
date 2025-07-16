export interface SidebarItemPermission {
  show?: boolean;
  children?: { [key: string]: SidebarItemPermission };
  [key: string]: any;
}

export interface RolePermission {
  sidebar?: { [key: string]: SidebarItemPermission };
  forms?: { [form: string]: { [key: string]: any } };
}

let currentPermissions: RolePermission | null = null;

export function setPermissions(perm: RolePermission) {
  currentPermissions = perm;
}

export function checkSidebarAccess(key: string): boolean {
  return currentPermissions?.sidebar?.[key]?.show ?? false;
}

export function checkFormAccess(form: string, type: 'view' | 'create' | 'update'): boolean {
  const fp: any = currentPermissions?.forms?.[form];
  return !!fp && !!fp[type];
}

export function checkFieldAccess(form: string, field: string): boolean {
  const fp: any = currentPermissions?.forms?.[form];
  if (!fp) return false;
  const fields: any = fp.fields || {};
  return !!fields[field];
}
