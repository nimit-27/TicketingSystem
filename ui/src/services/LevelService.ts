import axios from "axios";
import { BASE_URL } from "./api";

let levelsCache: any[] | null = null;
const employeesByLevelCache: Record<string, any[]> = {};

export function getAllLevels() {
    if (levelsCache) {
        return Promise.resolve({ data: levelsCache } as any);
    }
    return axios.get(`${BASE_URL}/levels`).then(res => {
        levelsCache = res.data;
        return res;
    });
}

export function getAllEmployeesByLevel(payload: string) {
    if (employeesByLevelCache[payload]) {
        return Promise.resolve({ data: employeesByLevelCache[payload] } as any);
    }
    return axios.get(`${BASE_URL}/levels/${payload}/employees`).then(res => {
        employeesByLevelCache[payload] = res.data;
        return res;
    });
}