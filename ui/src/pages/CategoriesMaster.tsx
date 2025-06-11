import React, { useEffect, useState } from 'react';
import { List, ListItem, Checkbox, IconButton, TextField, Button } from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import Title from '../components/Title';
import { useApi } from '../hooks/useApi';
import { getCategories, addCategory, updateCategory, deleteCategory, deleteCategories } from '../services/CategoryService';

interface Category {
    categoryId: number;
    category: string;
}

const CategoriesMaster: React.FC = () => {
    const { apiHandler: listApi } = useApi<any>();
    const { apiHandler: addApi } = useApi<any>();
    const { apiHandler: updateApi } = useApi<any>();
    const { apiHandler: deleteApi } = useApi<any>();
    const { apiHandler: deleteManyApi } = useApi<any>();

    const [categories, setCategories] = useState<Category[]>([]);
    const [editId, setEditId] = useState<number | null>(null);
    const [name, setName] = useState('');
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const load = () => {
        listApi(getCategories).then((c: any) => setCategories(c));
    };

    useEffect(() => {
        load();
    }, []);

    const handleSave = () => {
        const value = name.trim();
        if (!value) return;
        if (editId !== null) {
            updateApi(() => updateCategory(editId, { category: value })).then(load);
            setEditId(null);
        } else {
            addApi(() => addCategory({ category: value })).then(load);
        }
        setName('');
    };

    const handleEdit = (cat: Category) => {
        setEditId(cat.categoryId);
        setName(cat.category);
    };

    const handleDelete = (id: number) => {
        deleteApi(() => deleteCategory(id)).then(load);
    };

    const toggleSelect = (id: number) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleDeleteSelected = () => {
        deleteManyApi(() => deleteCategories(selectedIds)).then(() => {
            setSelectedIds([]);
            load();
        });
    };

    return (
        <div className="container">
            <Title text="Categories Master" />
            <div className="mb-3">
                <TextField size="small" label="Category" value={name} onChange={(e) => setName(e.target.value)} sx={{ mr: 2 }} />
                <Button variant="contained" size="small" onClick={handleSave}>{editId !== null ? 'Update' : 'Add'}</Button>
            </div>
            <List>
                {categories.map(cat => (
                    <ListItem key={cat.categoryId} sx={{ display: 'flex', alignItems: 'center' }}>
                        <Checkbox size="small" checked={selectedIds.includes(cat.categoryId)} onChange={() => toggleSelect(cat.categoryId)} />
                        <span style={{ flexGrow: 1 }}>{cat.category}</span>
                        <IconButton size="small" onClick={() => handleEdit(cat)}><Edit fontSize="small" /></IconButton>
                        <IconButton size="small" onClick={() => handleDelete(cat.categoryId)} color="error"><Delete fontSize="small" /></IconButton>
                    </ListItem>
                ))}
            </List>
            {selectedIds.length > 0 && (
                <Button variant="outlined" color="error" onClick={handleDeleteSelected}>Delete Selected</Button>
            )}
        </div>
    );
};

export default CategoriesMaster;
