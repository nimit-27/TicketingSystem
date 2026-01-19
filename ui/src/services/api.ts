// export const BASE_URL = 'http://localhost:8082/helpdesk';
// export const BASE_URL = 'https://dev.annadarpan.in/helpdeskbackend';
// export const BASE_URL = 'https://uat.annadarpan.in/helpdeskbackend';
// export const BASE_URL = 'https://stg.annadarpan.in/helpdeskbackend';
export const BASE_URL = process.env.REACT_APP_API_URL;

export const ANNADARPAN_KEYCLOAK_URL = 'https://devkeycloak.annadarpan.in/realms/AnnaDarpan'
export const ANNADARPAN_AUTHORIZE_URL = process.env.REACT_APP_ANNADARPAN_AUTHORIZE_URL || 'https://dev.annadarpan.in/authorize';
export const ANNADARPAN_CLIENT_ID = process.env.REACT_APP_ANNADARPAN_CLIENT_ID || 'ad-ticketing-service';
