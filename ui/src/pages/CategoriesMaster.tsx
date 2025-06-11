import React, { useState } from 'react';
import { Autocomplete, Button, IconButton, List, ListItem, TextField } from '@mui/material';
import { Link as LinkIcon } from '@mui/icons-material';
import Title from '../components/Title';

interface Category {
    name: string;
    subCategories: string[];
}

const CategoriesMaster: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [unlinkedSubs, setUnlinkedSubs] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [categoryInput, setCategoryInput] = useState('');
    const [subCategoryInput, setSubCategoryInput] = useState('');
    const [linkingSub, setLinkingSub] = useState<string | null>(null);

    const allSubCategories = [
        ...unlinkedSubs,
        ...categories.flatMap(c => c.subCategories)
    ];

    const displaySubCategories = selectedCategory
        ? selectedCategory.subCategories
        : allSubCategories;

    const handleAddCategory = () => {
        const name = categoryInput.trim();
        if (!name) return;
        if (!categories.find(c => c.name.toLowerCase() === name.toLowerCase())) {
            setCategories([...categories, { name, subCategories: [] }]);
        }
        setCategoryInput('');
    };

    const handleAddSubCategory = () => {
        const name = subCategoryInput.trim();
        if (!name) return;
        if (selectedCategory) {
            setCategories(categories.map(c => c.name === selectedCategory.name
                ? { ...c, subCategories: c.subCategories.includes(name) ? c.subCategories : [...c.subCategories, name] }
                : c
            ));
            setSelectedCategory(prev => prev && prev.name === selectedCategory.name
                ? { ...prev, subCategories: prev.subCategories.includes(name) ? prev.subCategories : [...prev.subCategories, name] }
                : prev
            );
        } else if (!allSubCategories.includes(name)) {
            setUnlinkedSubs([...unlinkedSubs, name]);
        }
        setSubCategoryInput('');
    };

    const linkSubToCategory = (sub: string, catName: string) => {
        setUnlinkedSubs(unlinkedSubs.filter(s => s !== sub));
        setCategories(categories.map(c => c.name === catName
            ? { ...c, subCategories: [...c.subCategories, sub] }
            : c
        ));
        if (selectedCategory && selectedCategory.name === catName) {
            setSelectedCategory({ ...selectedCategory, subCategories: [...selectedCategory.subCategories, sub] });
        }
        setLinkingSub(null);
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
                        onInputChange={(_, value) => setCategoryInput(value)}
                        onChange={(_, value) => {
                            const cat = categories.find(c => c.name === value);
                            setSelectedCategory(cat || null);
                            if (cat) setCategoryInput(cat.name);
                        }}
                        renderInput={(params) => <TextField {...params} label="Category" size="small" />} />
                    {categoryInput && !categories.find(c => c.name.toLowerCase() === categoryInput.toLowerCase()) && (
                        <Button className="mt-2" size="small" variant="outlined" onClick={handleAddCategory}>Add Category</Button>
                    )}
                    <List className="mt-2">
                        {categories.map(cat => (
                            <ListItem
                                key={cat.name}
                                button
                                selected={selectedCategory?.name === cat.name}
                                onClick={() => setSelectedCategory(cat)}>
                                {cat.name}
                            </ListItem>
                        ))}
                    </List>
                </div>
                <div className="col-md-6 mb-3">
                    <Autocomplete
                        freeSolo
                        options={selectedCategory ? selectedCategory.subCategories : allSubCategories}
                        value={null}
                        inputValue={subCategoryInput}
                        onInputChange={(_, value) => setSubCategoryInput(value)}
                        onChange={(_, value) => { if (value) setSubCategoryInput(value); }}
                        renderInput={(params) => <TextField {...params} label="Sub-Category" size="small" />} />
                    {subCategoryInput && !displaySubCategories.includes(subCategoryInput) && (
                        <Button className="mt-2" size="small" variant="outlined" onClick={handleAddSubCategory}>Add Sub-Category</Button>
                    )}
                    <List className="mt-2">
                        {displaySubCategories.map(sc => {
                            const isUnlinked = unlinkedSubs.includes(sc);
                            const parent = categories.find(c => c.subCategories.includes(sc));
                            return (
                                <ListItem key={sc} sx={{ display: 'flex', alignItems: 'center' }}>
                                    <span style={{ flexGrow: 1 }}>
                                        {sc}
                                        {!selectedCategory && parent && ` ( ${parent.name} )`}
                                    </span>
                                    {isUnlinked && (
                                        linkingSub === sc ? (
                                            <Autocomplete
                                                size="small"
                                                options={categories.map(c => c.name)}
                                                onChange={(_, value) => { if (value) linkSubToCategory(sc, value); }}
                                                renderInput={(params) => <TextField {...params} label="Link" size="small" />}
                                            />
                                        ) : (
                                            <IconButton size="small" onClick={() => setLinkingSub(sc)}>
                                                <LinkIcon fontSize="small" />
                                            </IconButton>
                                        )
                                    )}
                                </ListItem>
                            );
                        })}
                    </List>
                </div>
            </div>
        </div>
    );
};

export default CategoriesMaster;
