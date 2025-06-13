import { envConfig } from './envconfig';

const Users = envConfig.Users;

export const Roles = envConfig.Roles;
export const devMode = envConfig.devMode;
export const currentUserDetails = Users.fci

export const isFciEmployee = currentUserDetails.role.includes("FCI_EMPLOYEE")
