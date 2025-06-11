import axios from 'axios';

const baseURL = 'http://localhost:8081';

export function getCategories() {
    return axios.get(`${baseURL}/categories`);
}

export function getSubCategories(category: string) {
    return axios.get(`${baseURL}/categories/${category}/sub-categories`);
}