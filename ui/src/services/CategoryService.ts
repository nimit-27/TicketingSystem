import axios from 'axios';
import { BASE_URL } from './api';

let categoriesCache: any[] | null = null;
const subCategoryCache: Record<string, any[]> = {};

const normalizeSubCategory = (sc: any) => {
    if (!sc) return sc;
    const severityId = sc.severityId ?? sc?.severity?.id ?? null;
    const subCategory = typeof sc.subCategory === 'string'
        ? sc.subCategory.replace(/\+/g, ' ').replace(/=/g, '')
        : sc.subCategory;
    return {
        ...sc,
        severityId,
        subCategory
    };
};

const normalizeSubCategories = (subCategories: any[]) => {
    if (!Array.isArray(subCategories)) return [];
    return subCategories.map(normalizeSubCategory);
};

const normalizeCategory = (category: any) => {
    if (!category) return category;
    return {
        ...category,
        subCategories: normalizeSubCategories(category?.subCategories)
    };
};

const resetCategoriesCache = () => {
    categoriesCache = null;
};

const resetSubCategoryCache = (categoryId?: string) => {
    if (categoryId) {
        delete subCategoryCache[categoryId];
        return;
    }
    Object.keys(subCategoryCache).forEach(key => delete subCategoryCache[key]);
};

export function getCategories() {
    if (categoriesCache) {
        return Promise.resolve({ data: categoriesCache } as any);
    }
    return axios.get(`${BASE_URL}/categories`).then(res => {
        const normalized = Array.isArray(res.data)
            ? res.data.map(normalizeCategory)
            : res.data;
        if (Array.isArray(normalized)) {
            categoriesCache = normalized;
        } else {
            categoriesCache = null;
        }
        res.data = normalized;
        return res;
    });
}

export function getAllSubCategories() {
    // Fetch the entire sub-category catalogue. Consumers decide how to filter the list.
    return axios.get(`${BASE_URL}/sub-categories`);
}

export function addSubCategory(subCategory: any) {
    return axios
        .post(`${BASE_URL}/categories/${subCategory?.categoryId}/sub-categories`, subCategory)
        .then(res => {
            resetCategoriesCache();
            if (subCategory?.categoryId) resetSubCategoryCache(subCategory.categoryId);
            else resetSubCategoryCache();
            return res;
        });
}

export function updateSubCategory(id: string, subCategory: any) {
    return axios.put(`${BASE_URL}/sub-categories/${id}`, subCategory).then(res => {
        const categoryId = res?.data?.category?.categoryId || res?.data?.categoryId;
        resetCategoriesCache();
        if (categoryId) resetSubCategoryCache(categoryId);
        else resetSubCategoryCache();
        return res;
    });
}

export function deleteSubCategory(id: string) {
    return axios.delete(`${BASE_URL}/sub-categories/${id}`).then(res => {
        resetCategoriesCache();
        resetSubCategoryCache();
        return res;
    });
}

export function getAllSubCategoriesByCategory(categoryId: string) {
    // Fetch every sub-category for a specific category. Callers can filter
    // out inactive or severity-less options as needed.
    if (subCategoryCache[categoryId]) {
        return Promise.resolve({ data: subCategoryCache[categoryId] } as any);
    }
    return axios.get(`${BASE_URL}/categories/${categoryId}/sub-categories`).then(res => {
        const normalized = normalizeSubCategories(res.data);
        subCategoryCache[categoryId] = normalized;
        res.data = normalized;
        return res;
    });
}

export function addCategory(category: any) {
    return axios.post(`${BASE_URL}/categories`, category).then(res => {
        resetCategoriesCache();
        return res;
    });
}

export function updateCategory(id: string, category: any) {
    return axios.put(`${BASE_URL}/categories/${id}`, category).then(res => {
        resetCategoriesCache();
        return res;
    });
}

export function deleteCategory(id: string) {
    return axios.delete(`${BASE_URL}/categories/${id}`).then(res => {
        resetCategoriesCache();
        resetSubCategoryCache(id);
        return res;
    });
}

export function deleteCategories(ids: string[]) {
    const params = new URLSearchParams();
    ids.forEach(i => params.append('ids', i.toString()));
    return axios.delete(`${BASE_URL}/categories`, { params }).then(res => {
        resetCategoriesCache();
        resetSubCategoryCache();
        return res;
    });
}