import { useCallback, useEffect, useState } from 'react';
import { DropdownOption } from '../components/UI/Dropdown/GenericDropdown';
import { getCategories, getAllSubCategoriesByCategory } from '../services/CategoryService';
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

const onlyWithSeverity = (subCategories: any[]) =>
    subCategories.filter(sc => {
        if (!sc) return false;
        // Dropdowns should only display sub-categories that are linked to a severity.
        const severityId = sc.severityId ?? sc?.severity?.id;
        return Boolean(severityId);
    });

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
            const response = await getAllSubCategoriesByCategory(categoryId);
            const subCategories = onlyWithSeverity(parseResponseList(response));
            const options = getDropdownOptions(subCategories, 'subCategory', 'subCategoryId');
            setSubCategoryOptions([defaultAllOption, ...options]);
        } catch (error) {
            setSubCategoryOptions([defaultAllOption]);
        }
    }, []);

    let resetSubCategories = useCallback(() => setSubCategoryOptions([defaultAllOption]), [defaultAllOption])

    return {
        categoryOptions,
        subCategoryOptions,
        loadSubCategories,
        resetSubCategories,
    };
};

export type UseCategoryFiltersReturn = ReturnType<typeof useCategoryFilters>;
