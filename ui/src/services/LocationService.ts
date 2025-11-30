import axios from 'axios';
import { BASE_URL } from './api';

export function getZones() {
  return axios.get(`${BASE_URL}/zones`);
}

export function getRegions() {
  return axios.get(`${BASE_URL}/regions`);
}

export function getDistricts() {
  return axios.get(`${BASE_URL}/districts`);
}
