import { envConfig } from './envconfig';
import { getUserDetails } from '../utils/Utils';

const Users = envConfig.Users;

export const Roles = envConfig.Roles;
export const devMode = envConfig.devMode;
export const FciTheme = envConfig.FciTheme;
export const filegatorEnabled = envConfig.filegatorEnabled;
export const altchaConfig = envConfig.altcha;

export function getCurrentUserDetails() {
  return getUserDetails();
}

export function isFciUser() {
  return getCurrentUserDetails()?.role?.includes?.('FCI_User');
}

export function isHelpdesk() {
  const roles = getCurrentUserDetails()?.role ?? [];
  return Array.isArray(roles) && roles.some((role) => role?.toUpperCase?.().includes('HELPDESK'));
}
