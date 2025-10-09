import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, TextField, MenuItem } from '@mui/material';
import Title from '../components/Title';
import { useTranslation } from 'react-i18next';
import { getCategories, addCategory, updateCategory, deleteCategory, getAllSubCategories, addSubCategory, updateSubCategory, deleteSubCategory } from '../services/CategoryService';
import { useApi } from '../hooks/useApi';
import { Category, SubCategory, SeverityInfo } from '../types';
import { getCurrentUserDetails } from '../config/config';
import GenericInput from '../components/UI/Input/GenericInput';
import { getSeverities } from '../services/SeverityService';
import CategoryListItem from '../components/CategoriesMaster/CategoryListItem';

const CategoriesMaster: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<string | null>(null);
    const [categoryInput, setCategoryInput] = useState('');
    const [subCategoryInput, setSubCategoryInput] = useState('');
    const [selectedSeverity, setSelectedSeverity] = useState<string>('');

    const { data: getCategoriesData, apiHandler: getCategoriesApiHandler } = useApi<any>();
    const { data: getSubCategoriesData, apiHandler: getSubCategoriesApiHandler } = useApi<any>();
    const { apiHandler: addSubCategoryApiHandler } = useApi<any>();
    const { apiHandler: updateSubCategoryApiHandler } = useApi<any>();
    const { data: severityData, apiHandler: getSeverityApiHandler } = useApi<any>();
    const { t } = useTranslation();

    const filteredSubCategories = subCategories?.filter(
        sc => !selectedCategory || sc.categoryId === selectedCategory.categoryId
    );

    const displaySubCategories = filteredSubCategories?.filter(sc =>
        sc.subCategory.toLowerCase().includes(subCategoryInput.toLowerCase())
    );

    const otherSubCategories = filteredSubCategories?.filter(
        sc => !sc.subCategory.toLowerCase().includes(subCategoryInput.toLowerCase())
    );

    const trimmedSubCategoryInput = subCategoryInput.trim();
    const normalizedSubCategoryInput = trimmedSubCategoryInput.toLowerCase();
    const subCategoryExists = filteredSubCategories?.some(
        sc => sc.subCategory.toLowerCase() === normalizedSubCategoryInput
    ) ?? false;
    const isUniqueSubCategory = Boolean(trimmedSubCategoryInput) && !subCategoryExists;
    const canAddSubCategory = Boolean(selectedCategory) && isUniqueSubCategory;
    const selectedSubCategory = useMemo(
        () => subCategories.find(sc => sc.subCategoryId === selectedSubCategoryId) ?? null,
        [subCategories, selectedSubCategoryId]
    );
    const canSelectSeverity = Boolean(selectedSubCategory) || canAddSubCategory;

    const fetchCategories = useCallback(() => {
        getCategoriesApiHandler(() => getCategories());
    }, [getCategoriesApiHandler]);

    const fetchAllSubCategories = useCallback(() => {
        // Load the complete sub-category list. We filter it locally whenever
        // a category is selected so the UI stays responsive.
        console.log("fetchAllSubCategories")
        getSubCategoriesApiHandler(() => getAllSubCategories());
    }, []);

    useEffect(() => {
        getSeverityApiHandler(() => getSeverities());
    }, [getSeverityApiHandler]);

    useEffect(() => {
        if (Array.isArray(getCategoriesData)) setCategories(getCategoriesData);
        else if (getCategoriesData) setCategories([]);
    }, [getCategoriesData]);

    useEffect(() => {
        if (selectedCategory) {
            const updatedCategory = categories.find(cat => cat.categoryId === selectedCategory.categoryId);
            if (updatedCategory && updatedCategory !== selectedCategory) {
                setSelectedCategory(updatedCategory);
            }
        }
    }, [categories, selectedCategory]);

    useEffect(() => {
        if (Array.isArray(getSubCategoriesData)) {
            setSubCategories(getSubCategoriesData);
        } else if (getSubCategoriesData) {
            setSubCategories([]);
        }
    }, [getSubCategoriesData]);

    useEffect(() => {
        if (selectedSubCategory) {
            const normalizedSeverity = selectedSubCategory.severityId ?? '';
            if (normalizedSeverity !== selectedSeverity) {
                setSelectedSeverity(normalizedSeverity);
            }
        } else if (selectedSeverity !== '') {
            setSelectedSeverity('');
        }
    }, [selectedSubCategory, selectedSeverity]);

    useEffect(() => {
        fetchCategories();
        fetchAllSubCategories();
    }, []);

    const handleAddCategory = () => {
        const name = categoryInput.trim();
        if (!name) return;
        if (!categories.find(c => c.category.toLowerCase() === name.toLowerCase())) {
            addCategory({ category: name, createdBy: getCurrentUserDetails()?.userId }).then(() => fetchCategories());
        }
        setCategoryInput('');
    }

    const handleEditCategory = (cat: Category) => {
        const newName = prompt('Edit Category', cat.category);
        if (newName && newName.trim() && newName !== cat.category) {
            updateCategory(cat.categoryId, { category: newName.trim() }).then(() => fetchCategories());
        }
    };

    const handleDeleteCategory = (id: string) => {
        if (window.confirm('Delete this category?')) {
            const currentSelectedCategoryId = selectedCategory?.categoryId;
            deleteCategory(id).then(() => {
                if (currentSelectedCategoryId === id) setSelectedCategory(null);
                setSelectedSubCategoryId(null);
                setSelectedSeverity('');
                fetchCategories();
                fetchAllSubCategories();
            });
        }
    };

    const handleAddSubCategory = () => {
        if (!canAddSubCategory || !selectedCategory) return;
        const name = trimmedSubCategoryInput;
        const newSub: any = {
            subCategory: name,
            categoryId: selectedCategory.categoryId,
            createdBy: getCurrentUserDetails()?.userId
        };

        if (selectedSeverity) {
            newSub.severityId = selectedSeverity;
        }

        addSubCategoryApiHandler(() => addSubCategory(newSub)).then(() => {
            fetchAllSubCategories();
            fetchCategories();
        });
        setSubCategoryInput('');
        setSelectedSeverity('');
        setSelectedSubCategoryId(null);
    };

    const handleEditSubCategory = (sc: SubCategory) => {
        const newName = prompt('Edit Sub-Category', sc.subCategory);
        if (newName && newName.trim() && newName !== sc.subCategory) {
            updateSubCategory(sc.subCategoryId, { subCategory: newName.trim() }).then(() => {
                fetchAllSubCategories();
                fetchCategories();
            });
        }
    };

    const handleDeleteSubCategory = (id: string) => {
        if (window.confirm('Delete this sub-category?')) {
            deleteSubCategory(id).then(() => {
                if (selectedSubCategoryId === id) {
                    setSelectedSubCategoryId(null);
                    setSelectedSeverity('');
                }
                fetchAllSubCategories();
                fetchCategories();
            });
        }
    };

    const severityOptions: SeverityInfo[] = useMemo(() => (Array.isArray(severityData) ? severityData : []), [severityData]);

    const handleSeverityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setSelectedSeverity(value);
        if (!selectedSubCategory) return;
        const payload: any = {};
        if (selectedSubCategory.subCategory) {
            payload.subCategory = selectedSubCategory.subCategory;
        }
        payload.severity = value ? { id: value } : { id: '' };
        updateSubCategoryApiHandler(() => updateSubCategory(selectedSubCategory.subCategoryId, payload)).then(() => {
            fetchAllSubCategories();
            fetchCategories();
        });
    };

    const getCategoryBackground = (cat: Category, isHovered: boolean, isSelected: boolean) => {
        const hasMissingSeverity = Array.isArray(cat.subCategories) && cat.subCategories.some(sc => !sc.severityId);
        const baseGreen = '#dcedc8';
        const hoverGreen = '#c5e1a5';
        const selectedGreen = '#a5d6a7';
        const baseOrange = '#ffe0b2';
        const hoverOrange = '#ffcc80';
        const selectedOrange = '#ffb74d';
        if (hasMissingSeverity) {
            if (isSelected) return selectedOrange;
            return isHovered ? hoverOrange : baseOrange;
        }
        if (isSelected) return selectedGreen;
        return isHovered ? hoverGreen : baseGreen;
    };

    const getSubCategoryBackground = (sc: SubCategory, isHovered: boolean, isSelected: boolean) => {
        const hasSeverity = Boolean(sc.severityId);
        const baseGreen = '#dcedc8';
        const hoverGreen = '#c5e1a5';
        const selectedGreen = '#a5d6a7';
        const baseOrange = '#ffe0b2';
        const hoverOrange = '#ffcc80';
        const selectedOrange = '#ffb74d';
        if (hasSeverity) {
            if (isSelected) return selectedGreen;
            return isHovered ? hoverGreen : baseGreen;
        }
        if (isSelected) return selectedOrange;
        return isHovered ? hoverOrange : baseOrange;
    };


    return (
        <div className="container">
            <Title textKey="Categories Master" />
            <div className="row mb-4">
                <div className="col-md-6 mb-3">
                    <GenericInput
                        label="Category"
                        fullWidth
                        value={categoryInput}
                        onChange={e => {
                            setCategoryInput(e.target.value);
                            setSelectedCategory(null);
                            setSelectedSubCategoryId(null);
                            setSelectedSeverity('');
                        }}
                        onFocus={() => {
                            setSelectedCategory(null);
                            setSelectedSubCategoryId(null);
                            setSelectedSeverity('');
                        }}
                    />
                    {categoryInput && !categories.find(c => c.category.toLowerCase() === categoryInput.toLowerCase()) && (
                        <Button className="mt-2" size="small" variant="outlined" onClick={handleAddCategory}>{t('Add Category')}</Button>
                    )}
                    <ul className="list-group mt-2">
                        {categories
                            ?.filter(cat => cat.category.toLowerCase().includes(categoryInput.toLowerCase()))
                            .map(cat => (
                                <CategoryListItem
                                    key={cat.categoryId}
                                    type="category"
                                    item={cat}
                                    isSelected={selectedCategory?.categoryId === cat.categoryId}
                                    onSelect={selectedItem => {
                                        setSelectedCategory(selectedItem);
                                        setCategoryInput(selectedItem.category);
                                        setSelectedSubCategoryId(null);
                                        setSelectedSeverity('');
                                    }}
                                    onEdit={handleEditCategory}
                                    onDelete={item => handleDeleteCategory(item.categoryId)}
                                />
                            ))}
                    </ul>
                    <div className="my-3" style={{ height: 24 }} />
                    <div className="text-muted fw-semibold small">{t('Other Categories')}</div>
                    <ul className="list-group mt-2">
                        {categories
                            ?.filter(cat => !cat.category.toLowerCase().includes(categoryInput.toLowerCase()))
                            .map(cat => (
                                <CategoryListItem
                                    key={cat.categoryId}
                                    type="category"
                                    item={cat}
                                    isSelected={selectedCategory?.categoryId === cat.categoryId}
                                    onSelect={selectedItem => {
                                        setSelectedCategory(selectedItem);
                                        setCategoryInput(selectedItem.category);
                                        setSelectedSubCategoryId(null);
                                        setSelectedSeverity('');
                                    }}
                                    onEdit={handleEditCategory}
                                    onDelete={item => handleDeleteCategory(item.categoryId)}
                                />
                            ))}
                    </ul>
                </div>
                <div className="col-md-6 mb-3">
                    <GenericInput
                        label="Sub-Category"
                        fullWidth
                        value={subCategoryInput}
                        onChange={e => {
                            setSubCategoryInput(e.target.value);
                            if (selectedSubCategory) {
                                setSelectedSubCategoryId(null);
                                setSelectedSeverity('');
                            }
                        }}
                        onFocus={() => {
                            setSubCategoryInput('');
                            setSelectedSubCategoryId(null);
                            setSelectedSeverity('');
                        }}
                    />
                    {canAddSubCategory && (
                        <Button className="mt-2" size="small" variant="outlined" onClick={handleAddSubCategory}>
                            {t('Add Sub-Category')}
                        </Button>
                    )}
                    <TextField
                        select
                        label={t('Severity')}
                        fullWidth
                        className="mt-3"
                        value={selectedSeverity}
                        disabled={!canSelectSeverity}
                        onChange={handleSeverityChange}
                    >
                        <MenuItem value="">
                            <em>{t('None')}</em>
                        </MenuItem>
                        {severityOptions.map(option => (
                            <MenuItem key={option.id} value={option.id}>
                                {option.level}
                            </MenuItem>
                        ))}
                    </TextField>
                    <ul className="list-group mt-2">
                        {displaySubCategories?.map(sc => (
                            <CategoryListItem
                                key={sc.subCategoryId}
                                type="subcategory"
                                item={sc}
                                isSelected={selectedSubCategoryId === sc.subCategoryId}
                                onSelect={selectedItem => {
                                    setSelectedSubCategoryId(selectedItem.subCategoryId);
                                    setSelectedSeverity(selectedItem.severityId ?? '');
                                }}
                                onEdit={handleEditSubCategory}
                                onDelete={item => handleDeleteSubCategory(item.subCategoryId)}
                            />
                        ))}
                    </ul>
                    <div className="my-3" style={{ height: 24 }} />
                    <div className="text-muted fw-semibold small">{t('Other Sub-Categories')}</div>
                    <ul className="list-group mt-2">
                        {otherSubCategories?.map(sc => (
                            <CategoryListItem
                                key={sc.subCategoryId}
                                type="subcategory"
                                item={sc}
                                isSelected={selectedSubCategoryId === sc.subCategoryId}
                                onSelect={selectedItem => {
                                    setSelectedSubCategoryId(selectedItem.subCategoryId);
                                    setSelectedSeverity(selectedItem.severityId ?? '');
                                }}
                                onEdit={handleEditSubCategory}
                                onDelete={item => handleDeleteSubCategory(item.subCategoryId)}
                            />
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default CategoriesMaster;
