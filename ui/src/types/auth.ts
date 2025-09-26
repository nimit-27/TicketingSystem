export interface SidebarItemPermission {
  show?: boolean;
  children?: { [key: string]: SidebarItemPermission };
  [key: string]: any;
}

export interface RolePermission {
  sidebar?: { [key: string]: SidebarItemPermission };
  pages?: { [form: string]: { [key: string]: any } };
}

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

export interface DecodedAuthDetails {
  user: UserDetails;
  permissions?: RolePermission;
}
