import { useCallback, useEffect, useState } from 'react';
import { DropdownOption } from '../components/UI/Dropdown/GenericDropdown';
import { getCategories, getSubCategories } from '../services/CategoryService';
import { getDropdownOptions } from '../utils/Utils';

const parseResponseList = (response: any): any[] => {
    const rawPayload = response?.data ?? response;
    const payload = rawPayload?.body ?? rawPayload;
    if (Array.isArray(payload?.data)) {
        return payload.data as any[];
    }
    return Array.isArray(payload) ? payload : [];
};

const defaultAllOption: DropdownOption = { label: 'All', value: 'All' };

export const useCategoryFilters = () => {
    const [categoryOptions, setCategoryOptions] = useState<DropdownOption[]>([defaultAllOption]);
    const [subCategoryOptions, setSubCategoryOptions] = useState<DropdownOption[]>([defaultAllOption]);

    useEffect(() => {
        getCategories()
            .then((response) => {
                const categories = parseResponseList(response);
                const options = getDropdownOptions(categories, 'category', 'categoryId');
                setCategoryOptions([defaultAllOption, ...options]);
            })
            .catch(() => {
                setCategoryOptions([defaultAllOption]);
            });
    }, []);

    const loadSubCategories = useCallback(async (categoryId?: string) => {
        if (!categoryId) {
            setSubCategoryOptions([defaultAllOption]);
            return;
        }

        try {
            const response = await getSubCategories(categoryId);
            const subCategories = parseResponseList(response);
            const options = getDropdownOptions(subCategories, 'subCategory', 'subCategoryId');
            setSubCategoryOptions([defaultAllOption, ...options]);
        } catch (error) {
            setSubCategoryOptions([defaultAllOption]);
        }
    }, []);

    return {
        categoryOptions,
        subCategoryOptions,
        loadSubCategories,
        resetSubCategories: () => setSubCategoryOptions([defaultAllOption]),
    };
};

export type UseCategoryFiltersReturn = ReturnType<typeof useCategoryFilters>;
