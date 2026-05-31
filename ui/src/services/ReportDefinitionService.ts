import axios from "axios";
import { BASE_URL } from "./api";

export function fetchReportDefinitions() {
    return axios.get(`${BASE_URL}/report-definitions`);
}
