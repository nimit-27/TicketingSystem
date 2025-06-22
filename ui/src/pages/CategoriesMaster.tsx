import React, { useEffect, useState } from 'react';
import { Autocomplete, Button, List, ListItem, TextField, Box } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import CustomIconButton from '../components/UI/IconButton/CustomIconButton';
import Title from '../components/Title';
import { useTranslation } from 'react-i18next';
import { getCategories, addCategory, updateCategory, deleteCategory, getAllSubCategories, addSubCategory, updateSubCategory, deleteSubCategory } from '../services/CategoryService';
import { useApi } from '../hooks/useApi';
import { Category, SubCategory } from '../types';
import { currentUserDetails } from '../config/config';
import GenericInput from '../components/UI/Input/GenericInput';

const CategoriesMaster: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [categoryInput, setCategoryInput] = useState('');
    const [subCategoryInput, setSubCategoryInput] = useState('');

    const { data: getCategoriesData, apiHandler: getCategoriesApiHandler } = useApi<any>();
    const { data: getSubCategoriesData, apiHandler: getSubCategoriesApiHandler } = useApi<any>();
    const { data: addSubCategoryData, apiHandler: addSubCategoryApiHandler } = useApi<any>();
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

    const fetchCategories = () => {
        getCategoriesApiHandler(() => getCategories())
    };
    const fetchSubCategories = () => {
        getSubCategoriesApiHandler(() => getAllSubCategories())
    };

    useEffect(() => {
        if (Array.isArray(getCategoriesData)) setCategories(getCategoriesData);
        else if (getCategoriesData) setCategories([]);
    }, [getCategoriesData]);

    useEffect(() => {
        if (getSubCategoriesData) {
            const cleaned = getSubCategoriesData.map((sc: SubCategory) => ({
                ...sc,
                subCategory: sc.subCategory.replace(/\+/g, ' ').replace(/=/g, '')
            }));
            setSubCategories(cleaned);
        }
    }, [getSubCategoriesData]);

    useEffect(() => {
        fetchCategories();
        fetchSubCategories();
    }, []);

    const handleAddCategory = () => {
        const name = categoryInput.trim();
        if (!name) return;
        if (!categories.find(c => c.category.toLowerCase() === name.toLowerCase())) {
            addCategory({ category: name, createdBy: currentUserDetails.userId }).then(() => fetchCategories());
        }
        setCategoryInput('');
    }

    const handleEditCategory = (cat: Category) => {
        const newName = prompt('Edit Category', cat.category);
        if (newName && newName.trim() && newName !== cat.category) {
            updateCategory(cat.categoryId, { category: newName.trim() }).then(() => fetchCategories());
        }
    };

    const handleDeleteCategory = (id: number) => {
        if (window.confirm('Delete this category?')) {
            deleteCategory(id).then(() => {
                if (selectedCategory?.categoryId === id) setSelectedCategory(null);
                fetchCategories();
            });
        }
    };

    const handleAddSubCategory = () => {
        const name = subCategoryInput.trim();
        if (!name || !selectedCategory) return;
        if (!selectedCategory.subCategories.find(sc => sc.subCategory.toLowerCase() === name.toLowerCase())) {
            const newSub = { subCategory: name, categoryId: selectedCategory.categoryId, createdBy: currentUserDetails.userId };

            addSubCategoryApiHandler(() => addSubCategory(newSub)).then(() => fetchSubCategories());
        }
        setSubCategoryInput('');
    };

    const handleEditSubCategory = (sc: SubCategory) => {
        const newName = prompt('Edit Sub-Category', sc.subCategory);
        if (newName && newName.trim() && newName !== sc.subCategory) {
            updateSubCategory(sc.subCategoryId, { subCategory: newName.trim() }).then(() => fetchSubCategories());
        }
    };

    const handleDeleteSubCategory = (id: number) => {
        if (window.confirm('Delete this sub-category?')) {
            deleteSubCategory(id).then(() => fetchSubCategories());
        }
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
                        }}
                        onFocus={() => setSelectedCategory(null)}
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
                                            background: selectedCategory?.categoryId === cat.categoryId
                                                ? '#e0e0e0'
                                                : '#e7e5e5',
                                        },
                                        '&:hover .actions': { visibility: 'visible' },
                                        cursor: 'pointer',
                                        background: selectedCategory?.categoryId === cat.categoryId ? '#f0f0f0' : '#e1dddd',
                                        borderRadius: 1,
                                        mb: 0.5
                                    }}
                                    onClick={() => {
                                        setSelectedCategory(cat);
                                        setCategoryInput(cat.category);
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
                                            background: selectedCategory?.categoryId === cat.categoryId
                                                ? '#e0e0e0'
                                                : '#e7e5e5',
                                        },
                                        '&:hover .actions': { visibility: 'visible' },
                                        cursor: 'pointer',
                                        background: selectedCategory?.categoryId === cat.categoryId ? '#f0f0f0' : '#e1dddd',
                                        borderRadius: 1,
                                        mb: 0.5
                                    }}
                                    onClick={() => {
                                        setSelectedCategory(cat);
                                        setCategoryInput(cat.category);
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
                        onChange={e => setSubCategoryInput(e.target.value)}
                        onFocus={() => setSubCategoryInput('')}
                    />
                    {subCategoryInput && !displaySubCategories?.some(sc => sc.subCategory.toLowerCase() === subCategoryInput.toLowerCase()) && (
                        <Button className="mt-2" size="small" variant="outlined" onClick={handleAddSubCategory}>
                            {t('Add Sub-Category')}
                        </Button>
                    )}
                    <List className="mt-2">
                        {displaySubCategories?.map(sc => (
                            <ListItem
                                    key={sc.subCategoryId}
                                    sx={{
                                        '&:hover': {
                                            background: '#e7e5e5',
                                        },
                                        '&:hover .actions': { visibility: 'visible' },
                                        cursor: 'pointer',
                                        background: '#e1dddd',
                                        borderRadius: 1,
                                        mb: 0.5,
                                        display: 'flex',
                                        alignItems: 'center'
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
                                            background: '#e7e5e5',
                                        },
                                        '&:hover .actions': { visibility: 'visible' },
                                        cursor: 'pointer',
                                        background: '#e1dddd',
                                        borderRadius: 1,
                                        mb: 0.5,
                                        display: 'flex',
                                        alignItems: 'center'
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
