import { envConfig } from './envconfig';
import { getUserDetails } from '../utils/Utils';

const Users = envConfig.Users;

export const Roles = envConfig.Roles;
export const devMode = envConfig.devMode;
export const FciTheme = envConfig.FciTheme;

export function getCurrentUserDetails() {
  return getUserDetails();
}

export function isFciUser() {
  return getCurrentUserDetails()?.role?.includes?.('FCI_User');
}

export function isHelpdesk() {
  return true;
  return getCurrentUserDetails()?.role?.includes('HELPDESK');
}

