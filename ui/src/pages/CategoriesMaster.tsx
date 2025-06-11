import React, { useState } from 'react';
import { TextField, Chip, IconButton, Stack, Button, Autocomplete, Box } from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import Title from '../components/Title';

interface Category {
    name: string;
    subCategories: string[];
}

const CategoriesMaster: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [categoryInput, setCategoryInput] = useState('');
    const [subCategoryInput, setSubCategoryInput] = useState('');
    const [editCategoryName, setEditCategoryName] = useState<string | null>(null);
    const [editSubCategoryName, setEditSubCategoryName] = useState<string | null>(null);

    const handleAddCategory = () => {
        const name = categoryInput.trim();
        if (!name) return;
        if (editCategoryName) {
            setCategories(categories.map(c => c.name === editCategoryName ? { ...c, name } : c));
            setEditCategoryName(null);
        } else if (!categories.find(c => c.name.toLowerCase() === name.toLowerCase())) {
            setCategories([...categories, { name, subCategories: [] }]);
        }
        setCategoryInput('');
    };

    const handleDeleteCategory = (name: string) => {
        setCategories(categories.filter(c => c.name !== name));
        if (selectedCategory?.name === name) setSelectedCategory(null);
    };

    const handleEditCategory = (cat: Category) => {
        setEditCategoryName(cat.name);
        setCategoryInput(cat.name);
        setSelectedCategory(cat);
    };

    const handleAddSubCategory = () => {
        if (!selectedCategory) return;
        const name = subCategoryInput.trim();
        if (!name) return;
        setCategories(categories.map(c => {
            if (c.name !== selectedCategory.name) return c;
            const exists = c.subCategories.includes(name);
            let subCategories = c.subCategories;
            if (editSubCategoryName) {
                subCategories = subCategories.map(s => s === editSubCategoryName ? name : s);
            } else if (!exists) {
                subCategories = [...subCategories, name];
            }
            return { ...c, subCategories };
        }));
        setSelectedCategory(prev => prev ? {
            ...prev,
            subCategories: editSubCategoryName ? prev.subCategories.map(s => s === editSubCategoryName ? name : s) : prev.subCategories.includes(name) ? prev.subCategories : [...prev.subCategories, name]
        } : null);
        setEditSubCategoryName(null);
        setSubCategoryInput('');
    };

    const handleDeleteSubCategory = (name: string) => {
        if (!selectedCategory) return;
        setCategories(categories.map(c => c.name === selectedCategory.name ? { ...c, subCategories: c.subCategories.filter(s => s !== name) } : c));
        setSelectedCategory(prev => prev ? { ...prev, subCategories: prev.subCategories.filter(s => s !== name) } : null);
    };

    const handleEditSubCategory = (name: string) => {
        setEditSubCategoryName(name);
        setSubCategoryInput(name);
    };

    const handleSubmit = () => {
        console.log(categories);
        alert('Categories saved.');
    };

    return (
        <div className="container">
            <Title text="Categories Master" />
            <div className="row mb-4">
                <div className="col-md-6 mb-3">
                    <Autocomplete
                        freeSolo
                        options={categories.map(c => c.name)}
                        value={selectedCategory?.name || null}
                        inputValue={categoryInput}
                        onInputChange={(_, newInput) => setCategoryInput(newInput)}
                        onChange={(_, value) => {
                            const cat = categories.find(c => c.name === value);
                            setSelectedCategory(cat || null);
                            if (cat) setCategoryInput(cat.name);
                        }}
                        renderInput={(params) => <TextField {...params} label="Category" size="small" />} />
                    {categoryInput && !categories.find(c => c.name.toLowerCase() === categoryInput.toLowerCase()) && (
                        <Button className="mt-2" size="small" variant="outlined" onClick={handleAddCategory}>Add as new category</Button>
                    )}
                    {/* Category chips below input */}
                    <Stack direction="row" spacing={1} flexWrap="wrap" className="mt-3 mb-2">
                        {categories.map(cat => (
                            <Box key={cat.name} className="d-flex align-items-center me-2 mb-2">
                                <Chip
                                    label={cat.name}
                                    color={selectedCategory?.name === cat.name ? 'primary' : 'default'}
                                    onClick={() => setSelectedCategory(cat)}
                                />
                            </Box>
                        ))}
                    </Stack>
                </div>
                <div className="col-md-6 mb-3">
                    <Autocomplete
                        freeSolo
                        disabled={!selectedCategory}
                        options={selectedCategory ? selectedCategory.subCategories : []}
                        value={null}
                        inputValue={subCategoryInput}
                        onInputChange={(_, newInput) => setSubCategoryInput(newInput)}
                        onChange={(_, value) => {
                            if (value) setSubCategoryInput(value);
                        }}
                        renderInput={(params) => <TextField {...params} label="Sub-Category" size="small" />} />
                    {subCategoryInput && selectedCategory && !selectedCategory.subCategories.includes(subCategoryInput) && (
                        <Button className="mt-2" size="small" variant="outlined" onClick={handleAddSubCategory}>Add as new sub-category</Button>
                    )}
                    {/* Sub-category chips below input */}
                    {selectedCategory && (
                        <Stack direction="row" spacing={1} flexWrap="wrap" className="mt-3 mb-2">
                            {selectedCategory.subCategories.map(sc => (
                                <Box key={sc} className="d-flex align-items-center me-2 mb-2">
                                    <Chip label={sc} />
                                    {/* <IconButton size="small" onClick={() => handleEditSubCategory(sc)}><Edit fontSize="small" /></IconButton>
                                    <IconButton size="small" onClick={() => handleDeleteSubCategory(sc)}><Delete fontSize="small" /></IconButton> */}
                                </Box>
                            ))}
                        </Stack>
                    )}
                </div>
            </div>
            <Button variant="contained" onClick={handleSubmit}>Submit</Button>
        </div>
    );
};

export default CategoriesMaster;
