export type UserProfileType = 'requester' | 'helpdesk';

export interface HelpdeskUser {
  userId: string;
  username?: string;
  name?: string;
  emailId?: string;
  mobileNo?: string;
  office?: string;
  officeType?: string;
  officeCode?: string;
  roles?: string;
  roleNames?: string[];
  roleIds?: string[];
  stakeholder?: string;
  stakeholderId?: string;
  levels?: string[];
}

export interface RequesterUser {
  requesterUserId: string;
  username?: string;
  name?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  emailId?: string;
  mobileNo?: string;
  office?: string;
  roles?: string;
  roleNames?: string[];
  roleIds?: string[];
  stakeholder?: string;
  stakeholderId?: string;
  dateOfJoining?: string;
  dateOfRetirement?: string;
  officeType?: string;
  officeCode?: string;
  zoneCode?: string;
  regionCode?: string;
  districtCode?: string;
}
