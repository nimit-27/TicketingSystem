import React, { useContext, useState, useEffect } from 'react';
import { Checkbox, Collapse, IconButton, TextField } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { PermissionNode } from '../../types';
import { DevModeContext } from '../../context/DevModeContext';
import CustomIconButton from '../UI/IconButton/CustomIconButton';

interface TreeProps {
    data: PermissionNode;
    path?: string[];
    onChange: (data: PermissionNode) => void;
}

const setValue = (obj: any, path: string[], value: any): PermissionNode => {
    if (path.length === 1) {
        return { ...obj, [path[0]]: value };
    }
    const [first, ...rest] = path;
    return {
        ...obj,
        [first]: setValue(obj[first] ?? {}, rest, value)
    } as PermissionNode;
};

const deleteValue = (obj: any, path: string[]): PermissionNode => {
    if (path.length === 1) {
        const { [path[0]]: _removed, ...rest } = obj;
        return rest as PermissionNode;
    }
    const [first, ...restPath] = path;
    return {
        ...obj,
        [first]: deleteValue(obj[first] ?? {}, restPath)
    }
}

const Node: React.FC<{ label: string; value: any; path: string[]; onChange: (path: string[], value: any, remove?: boolean) => void }> = ({ label, value, path, onChange }) => {
    const { devMode } = useContext(DevModeContext);
    const defaultOpen = path.length === 1 && (label === 'pages' || label === 'sidebar');
    const [open, setOpen] = useState(defaultOpen);
    const [adding, setAdding] = useState(false);
    const [newChild, setNewChild] = useState('');
    const [addedChildren, setAddedChildren] = useState(false);

    useEffect(() => {
        if (!devMode && adding) {
            if (addedChildren) {
                onChange([...path, 'children'], undefined, true);
                setAddedChildren(false);
            }
            setAdding(false);
            setNewChild('');
        }
    }, [devMode]);

    if (label === "show" || label === "metadata") return null;

    const hasChildren = value && typeof value === 'object' && value.children;
    const nodeLabel = value?.metadata?.name || label;
    const show = Boolean(value?.show);

    const startAdd = () => {
        if (!hasChildren) {
            onChange([...path, 'children'], {});
            setAddedChildren(true);
        }
        setOpen(true);
        setAdding(true);
    };

    const cancelAdd = () => {
        if (addedChildren) {
            onChange([...path, 'children'], undefined, true);
        }
        setAdding(false);
        setNewChild('');
        setAddedChildren(false);
    };

    const confirmAdd = () => {
        if (!newChild) return;
        const child: PermissionNode = { show: false, metadata: { name: newChild }, children: null };
        onChange([...path, 'children', newChild], child);
        setAdding(false);
        setNewChild('');
        setAddedChildren(false);
    };


    console.log({ value });

    if (hasChildren || addedChildren) {
        const entries = Object.entries(value.children || {});
        return (
            <div style={{ marginLeft: 16 }}>
                <div className='border-bottom' style={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton size="small" onClick={() => setOpen(o => !o)}>
                        {open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                    <Checkbox
                        size="small"
                        checked={show}
                        onChange={e => onChange([...path, 'show'], e.target.checked)}
                    />
                    <span style={{ flexGrow: 1 }}>{nodeLabel}</span>
                    {devMode && !adding && (
                        <CustomIconButton icon='add' onClick={startAdd} />
                    )}
                </div>
                {adding && (
                    <div style={{ display: 'flex', alignItems: 'center', marginLeft: 32, marginTop: 4 }}>
                        <TextField size="small" value={newChild} onChange={e => setNewChild(e.target.value)} />
                        <CustomIconButton icon='close' onClick={cancelAdd} />
                        <CustomIconButton icon='check' onClick={confirmAdd} />
                    </div>
                )}
                <Collapse in={open} timeout="auto" unmountOnExit>
                    {entries.map(([k, v]) => (
                        <Node key={k} label={k} value={v} path={[...path, 'children', k]} onChange={onChange} />
                    ))}
                </Collapse>
            </div>
        );
    }

    return (
        <div className='border-bottom' style={{ display: 'flex', alignItems: 'center', marginLeft: 16 }}>
            <Checkbox
                size="small"
                checked={show}
                onChange={e => onChange([...path, 'show'], e.target.checked)}
            />
            <span style={{ flexGrow: 1 }}>{nodeLabel}</span>
            {devMode && !adding && (
                <CustomIconButton onClick={startAdd} icon='add' />
            )}
            {adding && (
                <>
                    <TextField size="small" value={newChild} onChange={e => setNewChild(e.target.value)} />
                    <CustomIconButton icon='close' onClick={cancelAdd} />
                    <CustomIconButton icon='check' onClick={confirmAdd} />
                </>
            )}
        </div>
    );
};

const PermissionTree: React.FC<TreeProps> = ({ data, path = [], onChange }) => {
    const handleChange = (p: string[], value: any, remove?: boolean) => {
        const updated = remove ? deleteValue(data, p.slice(path.length)) : setValue(data, p.slice(path.length), value);
        onChange(updated);
    };

    return (
        <div>
            {Object.entries(data).map(([k, v]) => (
                <Node key={k} label={k} value={v} path={[...path, k]} onChange={handleChange} />
            ))}
        </div>
    );
};

export default PermissionTree;
