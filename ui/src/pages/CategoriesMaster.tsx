import React, { useEffect, useState } from 'react';
import { Autocomplete, Button, IconButton, List, ListItem, TextField, Box } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import Title from '../components/Title';
import { getCategories, addCategory, updateCategory, deleteCategory } from '../services/CategoryService';

interface SubCategory {
    subCategoryId: number;
    subCategory: string;
}

interface Category {
    categoryId: number;
    category: string;
    subCategories: SubCategory[];
}

const CategoriesMaster: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [categoryInput, setCategoryInput] = useState('');
    const [subCategoryInput, setSubCategoryInput] = useState('');

    const allSubCategories = categories.flatMap(c => c.subCategories.map(sc => sc.subCategory));

    const displaySubCategories = selectedCategory
        ? selectedCategory.subCategories.map(sc => sc.subCategory)
        : allSubCategories;

    const fetchCategories = () => {
        getCategories().then(res => setCategories(res.data));
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleAddCategory = () => {
        const name = categoryInput.trim();
        if (!name) return;
        if (!categories.find(c => c.category.toLowerCase() === name.toLowerCase())) {
            addCategory({ category: name }).then(() => fetchCategories());
        }
        setCategoryInput('');
    };

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
            const newSub: SubCategory = { subCategoryId: 0, subCategory: name };
            setCategories(categories.map(c => c.categoryId === selectedCategory.categoryId
                ? { ...c, subCategories: [...c.subCategories, newSub] }
                : c
            ));
            setSelectedCategory({ ...selectedCategory, subCategories: [...selectedCategory.subCategories, newSub] });
        }
        setSubCategoryInput('');
    };


    return (
        <div className="container">
            <Title text="Categories Master" />
            <div className="row mb-4">
                <div className="col-md-6 mb-3">
                    <Autocomplete
                        freeSolo
                        options={categories.map(c => c.category)}
                        value={selectedCategory?.category || null}
                        inputValue={categoryInput}
                        onInputChange={(_, value) => setCategoryInput(value)}
                        onChange={(_, value) => {
                            const cat = categories.find(c => c.category === value);
                            setSelectedCategory(cat || null);
                            if (cat) setCategoryInput(cat.category);
                        }}
                        renderInput={(params) => <TextField {...params} label="Category" size="small" />} />
                    {categoryInput && !categories.find(c => c.category.toLowerCase() === categoryInput.toLowerCase()) && (
                        <Button className="mt-2" size="small" variant="outlined" onClick={handleAddCategory}>Add Category</Button>
                    )}
                    <List className="mt-2">
                        {categories.map(cat => (
                            <ListItem
                                key={cat.categoryId}
                                sx={{
                                    '&:hover .actions': { visibility: 'visible' },
                                    cursor: 'pointer',
                                    background: selectedCategory?.categoryId === cat.categoryId ? '#f0f0f0' : 'transparent',
                                    borderRadius: 1,
                                    mb: 0.5
                                }}
                                onClick={() => setSelectedCategory(cat)}
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
                    <Autocomplete
                        freeSolo
                        options={selectedCategory ? selectedCategory.subCategories.map(sc => sc.subCategory) : allSubCategories}
                        value={null}
                        inputValue={subCategoryInput}
                        onInputChange={(_, value) => setSubCategoryInput(value)}
                        onChange={(_, value) => { if (value) setSubCategoryInput(value); }}
                        renderInput={(params) => <TextField {...params} label="Sub-Category" size="small" />} />
                    {subCategoryInput && !displaySubCategories.includes(subCategoryInput) && (
                        <Button className="mt-2" size="small" variant="outlined" onClick={handleAddSubCategory}>Add Sub-Category</Button>
                    )}
                    <List className="mt-2">
                        {displaySubCategories.map(sc => (
                            <ListItem key={sc} sx={{ display: 'flex', alignItems: 'center' }}>
                                <span style={{ flexGrow: 1 }}>{sc}</span>
                            </ListItem>
                        ))}
                    </List>
                </div>
            </div>
        </div>
    );
};

export default CategoriesMaster;
