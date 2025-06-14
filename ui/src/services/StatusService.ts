import axios from 'axios';

const baseURL = 'http://localhost:8081';

export function getStatuses() {
    return axios.get(`${baseURL}/ticket-statuses`);
}
