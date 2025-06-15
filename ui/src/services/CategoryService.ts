import axios from 'axios';
import { BASE_URL } from './api';

let categoriesCache: any[] | null = null;
const subCategoryCache: Record<string, any[]> = {};

export function getCategories() {
    if (categoriesCache) {
        return Promise.resolve({ data: categoriesCache } as any);
    }
    return axios.get(`${BASE_URL}/categories`).then(res => {
        categoriesCache = res.data;
        return res;
    });
}

export function getAllSubCategories() {
    return axios.get(`${BASE_URL}/sub-categories`);
}

export function addSubCategory(subCategory: any) {
    return axios.post(`${BASE_URL}/categories/${subCategory?.categoryId}/sub-categories`, subCategory);
}

export function updateSubCategory(id: number, subCategory: any) {
    return axios.put(`${BASE_URL}/sub-categories/${id}`, subCategory);
}

export function deleteSubCategory(id: number) {
    return axios.delete(`${BASE_URL}/sub-categories/${id}`);
}

export function getSubCategories(category: string) {
    if (subCategoryCache[category]) {
        return Promise.resolve({ data: subCategoryCache[category] } as any);
    }
    return axios.get(`${BASE_URL}/categories/${category}/sub-categories`).then(res => {
        subCategoryCache[category] = res.data;
        return res;
    });
}

export function addCategory(category: any) {
    return axios.post(`${BASE_URL}/categories`, category);
}

export function updateCategory(id: number, category: any) {
    return axios.put(`${BASE_URL}/categories/${id}`, category);
}

export function deleteCategory(id: number) {
    return axios.delete(`${BASE_URL}/categories/${id}`);
}

export function deleteCategories(ids: number[]) {
    const params = new URLSearchParams();
    ids.forEach(i => params.append('ids', i.toString()));
    return axios.delete(`${BASE_URL}/categories`, { params });
}