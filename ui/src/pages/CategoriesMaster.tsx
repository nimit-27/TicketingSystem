import React, { useEffect, useState } from 'react';
import { Autocomplete, Button, IconButton, List, ListItem, TextField, Box } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import Title from '../components/Title';
import { getCategories, addCategory, updateCategory, deleteCategory, getAllSubCategories, addSubCategory } from '../services/CategoryService';
import { useApi } from '../hooks/useApi';
import { Category, SubCategory } from '../types';
import { currentUserDetails } from '../config/config';

const CategoriesMaster: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [categoryInput, setCategoryInput] = useState('');
    const [subCategoryInput, setSubCategoryInput] = useState('');

    const { data: getCategoriesData, apiHandler: getCategoriesApiHandler } = useApi<any>();
    const { data: getSubCategoriesData, apiHandler: getSubCategoriesApiHandler } = useApi<any>();
    const { data: addSubCategoryData, apiHandler: addSubCategoryApiHandler } = useApi<any>();

    const displaySubCategories = subCategories
        ?.filter(sc => !selectedCategory || sc.categoryId === selectedCategory.categoryId)
        ?.map(sc => sc.subCategory)
        ?.filter(sc => sc.toLowerCase().includes(subCategoryInput.toLowerCase()));

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
        if (getSubCategoriesData) setSubCategories(getSubCategoriesData);
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


    return (
        <div className="container">
            <Title text="Categories Master" />
            <div className="row mb-4">
                <div className="col-md-6 mb-3">
                    <TextField
                        label="Category"
                        size="small"
                        fullWidth
                        value={categoryInput}
                        onChange={e => {
                            setCategoryInput(e.target.value);
                            setSelectedCategory(null);
                        }}
                        onFocus={() => setSelectedCategory(null)}
                    />
                    {categoryInput && !categories.find(c => c.category.toLowerCase() === categoryInput.toLowerCase()) && (
                        <Button className="mt-2" size="small" variant="outlined" onClick={handleAddCategory}>Add Category</Button>
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
                                        <IconButton size="small" onClick={() => handleEditCategory(cat)}>
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton size="small" onClick={() => handleDeleteCategory(cat.categoryId)}>
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                </ListItem>
                            ))}
                    </List>
                    {/* Gap between lists */}
                    <Box sx={{ height: 24 }} />
                    <List className="mt-2" subheader={<span style={{ fontWeight: 500, fontSize: 14, color: '#888' }}>Other Categories</span>}>
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
                                        <IconButton size="small" onClick={() => handleEditCategory(cat)}>
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton size="small" onClick={() => handleDeleteCategory(cat.categoryId)}>
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                </ListItem>
                            ))}
                    </List>
                </div>
                <div className="col-md-6 mb-3">
                    <TextField
                        label="Sub-Category"
                        size="small"
                        fullWidth
                        value={subCategoryInput}
                        onChange={e => setSubCategoryInput(e.target.value)}
                        onFocus={() => setSubCategoryInput('')}
                    />
                    {subCategoryInput && !displaySubCategories.includes(subCategoryInput) && (
                        <Button className="mt-2" size="small" variant="outlined" onClick={handleAddSubCategory}>
                            Add Sub-Category
                        </Button>
                    )}
                    <List className="mt-2">
                        {displaySubCategories
                            ?.filter(sc =>
                                sc?.toLowerCase().includes(subCategoryInput.toLowerCase())
                            )
                            .map(sc => (
                                <ListItem
                                    key={sc}
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
                                    <span style={{ flexGrow: 1 }}>{sc}</span>
                                    <Box className="actions" sx={{ visibility: 'hidden' }} onClick={e => e.stopPropagation()}>
                                        {/* Add edit/delete sub-category logic here if needed */}
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
                                Other Sub-Categories
                            </span>
                        }
                    >
                        {displaySubCategories
                            ?.filter(sc => !sc?.toLowerCase().includes(subCategoryInput.toLowerCase()))
                            .map(sc => (
                                <ListItem
                                    key={sc}
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
                                    <span style={{ flexGrow: 1 }}>{sc}</span>
                                    <Box className="actions" sx={{ visibility: 'hidden' }} onClick={e => e.stopPropagation()}>
                                        {/* Add edit/delete sub-category logic here if needed */}
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
