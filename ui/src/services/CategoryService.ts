import axios from 'axios';

const baseURL = 'http://localhost:8081';

export function getCategories() {
    return axios.get(`${baseURL}/categories`);
}

export function getAllSubCategories() {
    return axios.get(`${baseURL}/sub-categories`);
}

export function addSubCategory(subCategory: any) {
    return axios.post(`${baseURL}/categories/${subCategory?.categoryId}/sub-categories`, subCategory);
}

export function getSubCategories(category: string) {
    return axios.get(`${baseURL}/categories/${category}/sub-categories`);
}

export function addCategory(category: any) {
    return axios.post(`${baseURL}/categories`, category);
}

export function updateCategory(id: number, category: any) {
    return axios.put(`${baseURL}/categories/${id}`, category);
}

export function deleteCategory(id: number) {
    return axios.delete(`${baseURL}/categories/${id}`);
}

export function deleteCategories(ids: number[]) {
    const params = new URLSearchParams();
    ids.forEach(i => params.append('ids', i.toString()));
    return axios.delete(`${baseURL}/categories`, { params });
}