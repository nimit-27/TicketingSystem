import axios from 'axios';
import { BASE_URL } from './api';

export function getZones() {
  return axios.get(`${BASE_URL}/zones`);
}

export function getRegions(zoneCode?: string) {
  return axios.get(`${BASE_URL}/regions`, {
    params: {
      zoneCode,
    },
  });
}

export function getDistricts(hrmsRegCode?: string) {
  return axios.get(`${BASE_URL}/districts`, {
    params: {
      hrmsRegCode,
    },
  });
}
