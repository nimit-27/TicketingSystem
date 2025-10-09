import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, List, ListItem, TextField, Box, MenuItem } from '@mui/material';
import CustomIconButton from '../components/UI/IconButton/CustomIconButton';
import Title from '../components/Title';
import { useTranslation } from 'react-i18next';
import { getCategories, addCategory, updateCategory, deleteCategory, getAllSubCategories, addSubCategory, updateSubCategory, deleteSubCategory } from '../services/CategoryService';
import { useApi } from '../hooks/useApi';
import { Category, SubCategory, SeverityInfo } from '../types';
import { getCurrentUserDetails } from '../config/config';
import GenericInput from '../components/UI/Input/GenericInput';
import { getSeverities } from '../services/SeverityService';

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
    const fetchSubCategories = useCallback((categoryId?: string | null) => {
        let targetCategoryId: string | null | undefined;
        if (typeof categoryId === 'string' && categoryId) {
            targetCategoryId = categoryId;
        } else if (categoryId === null || categoryId === '') {
            targetCategoryId = null;
        } else {
            targetCategoryId = selectedCategory?.categoryId ?? null;
        }
        if (!targetCategoryId) {
            return;
        }
        getSubCategoriesApiHandler(() => getAllSubCategories(targetCategoryId));
    }, [getSubCategoriesApiHandler, selectedCategory?.categoryId]);

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
            const cleaned = getSubCategoriesData.map((sc: SubCategory & { severity?: { id?: string | null } }) => ({
                ...sc,
                severityId: sc.severityId ?? sc?.severity?.id ?? null,
                subCategory: typeof sc.subCategory === 'string'
                    ? sc.subCategory.replace(/\+/g, ' ').replace(/=/g, '')
                    : sc.subCategory
            }));
            setSubCategories(cleaned);
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
    }, [fetchCategories]);

    useEffect(() => {
        if (!selectedCategory?.categoryId) {
            return;
        }
        fetchSubCategories(selectedCategory.categoryId);
    }, [selectedCategory?.categoryId, fetchSubCategories]);

    useEffect(() => {
        if (selectedCategory?.categoryId) {
            return;
        }
        setSubCategories(prev => (Array.isArray(prev) && prev.length > 0 ? [] : prev));
    }, [selectedCategory?.categoryId, subCategories.length]);

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
                fetchSubCategories(currentSelectedCategoryId === id ? null : currentSelectedCategoryId);
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
            fetchSubCategories();
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
                fetchSubCategories();
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
                fetchSubCategories();
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
            fetchSubCategories();
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
                    <List className="mt-2">
                        {categories
                            ?.filter(cat => cat.category.toLowerCase().includes(categoryInput.toLowerCase()))
                            .map(cat => (
                                <ListItem
                                    key={cat.categoryId}
                                    sx={{
                                        '&:hover': {
                                            background: getCategoryBackground(cat, true, selectedCategory?.categoryId === cat.categoryId),
                                        },
                                        '&:hover .actions': { visibility: 'visible' },
                                        cursor: 'pointer',
                                        background: getCategoryBackground(cat, false, selectedCategory?.categoryId === cat.categoryId),
                                        borderRadius: 1,
                                        mb: 0.5
                                    }}
                                    onClick={() => {
                                        setSelectedCategory(cat);
                                        setCategoryInput(cat.category);
                                        setSelectedSubCategoryId(null);
                                        setSelectedSeverity('');
                                    }}
                                >
                                    <span style={{ flexGrow: 1 }}>{cat.category}</span>
                                    <Box className="actions" sx={{ visibility: 'hidden' }} onClick={e => e.stopPropagation()}>
                                        <CustomIconButton icon="Edit" size="small" onClick={() => handleEditCategory(cat)} />
                                        <CustomIconButton icon="Delete" size="small" onClick={() => handleDeleteCategory(cat.categoryId)} />
                                    </Box>
                                </ListItem>
                            ))}
                    </List>
                    {/* Gap between lists */}
                    <Box sx={{ height: 24 }} />
                    <List className="mt-2" subheader={<span style={{ fontWeight: 500, fontSize: 14, color: '#888' }}>{t('Other Categories')}</span>}>
                        {categories
                            ?.filter(cat => !cat.category.toLowerCase().includes(categoryInput.toLowerCase()))
                            .map(cat => (
                                <ListItem
                                    key={cat.categoryId}
                                    sx={{
                                        '&:hover': {
                                            background: getCategoryBackground(cat, true, selectedCategory?.categoryId === cat.categoryId),
                                        },
                                        '&:hover .actions': { visibility: 'visible' },
                                        cursor: 'pointer',
                                        background: getCategoryBackground(cat, false, selectedCategory?.categoryId === cat.categoryId),
                                        borderRadius: 1,
                                        mb: 0.5
                                    }}
                                    onClick={() => {
                                        setSelectedCategory(cat);
                                        setCategoryInput(cat.category);
                                        setSelectedSubCategoryId(null);
                                        setSelectedSeverity('');
                                    }}
                                >
                                    <span style={{ flexGrow: 1 }}>{cat.category}</span>
                                    <Box className="actions" sx={{ visibility: 'hidden' }} onClick={e => e.stopPropagation()}>
                                        <CustomIconButton icon="Edit" size="small" onClick={() => handleEditCategory(cat)} />
                                        <CustomIconButton icon="Delete" size="small" onClick={() => handleDeleteCategory(cat.categoryId)} />
                                    </Box>
                                </ListItem>
                            ))}
                    </List>
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
                    <List className="mt-2">
                        {displaySubCategories?.map(sc => (
                            <ListItem
                                    key={sc.subCategoryId}
                                    sx={{
                                        '&:hover': {
                                            background: getSubCategoryBackground(sc, true, selectedSubCategoryId === sc.subCategoryId),
                                        },
                                        '&:hover .actions': { visibility: 'visible' },
                                        cursor: 'pointer',
                                        background: getSubCategoryBackground(sc, false, selectedSubCategoryId === sc.subCategoryId),
                                        borderRadius: 1,
                                        mb: 0.5,
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}
                                    onClick={() => {
                                        setSelectedSubCategoryId(sc.subCategoryId);
                                        setSelectedSeverity(sc.severityId ?? '');
                                    }}
                                >
                                    <span style={{ flexGrow: 1 }}>{sc.subCategory}</span>
                                    <Box className="actions" sx={{ visibility: 'hidden' }} onClick={e => e.stopPropagation()}>
                                        <CustomIconButton icon="Edit" size="small" onClick={() => handleEditSubCategory(sc)} />
                                        <CustomIconButton icon="Delete" size="small" onClick={() => handleDeleteSubCategory(sc.subCategoryId)} />
                                    </Box>
                                </ListItem>
                            ))}
                    </List>
                    {/* Gap between lists */}
                    <Box sx={{ height: 24 }} />
                    <List
                        className="mt-2"
                        subheader={
                            <span style={{ fontWeight: 500, fontSize: 14, color: '#888' }}>
                                {t('Other Sub-Categories')}
                            </span>
                        }
                    >
                        {otherSubCategories?.map(sc => (
                            <ListItem
                                    key={sc.subCategoryId}
                                    sx={{
                                        '&:hover': {
                                            background: getSubCategoryBackground(sc, true, selectedSubCategoryId === sc.subCategoryId),
                                        },
                                        '&:hover .actions': { visibility: 'visible' },
                                        cursor: 'pointer',
                                        background: getSubCategoryBackground(sc, false, selectedSubCategoryId === sc.subCategoryId),
                                        borderRadius: 1,
                                        mb: 0.5,
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}
                                    onClick={() => {
                                        setSelectedSubCategoryId(sc.subCategoryId);
                                        setSelectedSeverity(sc.severityId ?? '');
                                    }}
                                >
                                    <span style={{ flexGrow: 1 }}>{sc.subCategory}</span>
                                    <Box className="actions" sx={{ visibility: 'hidden' }} onClick={e => e.stopPropagation()}>
                                        <CustomIconButton icon="Edit" size="small" onClick={() => handleEditSubCategory(sc)} />
                                        <CustomIconButton icon="Delete" size="small" onClick={() => handleDeleteSubCategory(sc.subCategoryId)} />
                                    </Box>
                                </ListItem>
                            ))}
                    </List>
                </div>
            </div>
        </div>
    );
};

export default CategoriesMaster;
