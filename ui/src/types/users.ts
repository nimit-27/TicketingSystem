export type UserProfileType = 'requester' | 'helpdesk';

export interface HelpdeskUser {
  userId: string;
  username?: string;
  name?: string;
  emailId?: string;
  mobileNo?: string;
  office?: string;
  password?: string;
  roles?: string;
  stakeholder?: string;
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
  password?: string;
  roles?: string;
  stakeholder?: string;
  dateOfJoining?: string;
  dateOfRetirement?: string;
  officeType?: string;
  officeCode?: string;
}
