import axios from "axios";
import { BASE_URL } from "./api";

let levelsCache: any[] | null = null;
const usersByLevelCache: Record<string, any[]> = {};

export function getAllLevels() {
    if (levelsCache) {
        return Promise.resolve({ data: levelsCache } as any);
    }
    return axios.get(`${BASE_URL}/levels`).then(res => {
        levelsCache = res.data;
        return res;
    });
}

export function getAllUsersByLevel(payload: string) {
    if (usersByLevelCache[payload]) {
        return Promise.resolve({ data: usersByLevelCache[payload] } as any);
    }
    return axios.get(`${BASE_URL}/levels/${payload}/users`).then(res => {
        usersByLevelCache[payload] = res.data;
        return res;
    });
}