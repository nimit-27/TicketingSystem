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
    allowStructureEdit?: boolean;
    defaultShowForNewNodes?: boolean;
}

const toCamelCase = (value: string) => {
    const parts = value
        .trim()
        .split(/[^a-zA-Z0-9]+/)
        .filter(Boolean)
        .map(part => part.toLowerCase());
    if (!parts.length) {
        return '';
    }
    const [first, ...rest] = parts;
    return first + rest.map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('');
};

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

const Node: React.FC<{ label: string; value: any; path: string[]; onChange: (path: string[], value: any, remove?: boolean) => void; allowStructureEdit: boolean; defaultShow: boolean; }> = ({ label, value, path, onChange, allowStructureEdit, defaultShow }) => {
    const { devMode } = useContext(DevModeContext);
    const canEdit = devMode && allowStructureEdit;
    const defaultOpen = path.length === 1 && (label === 'pages' || label === 'sidebar');
    const [open, setOpen] = useState(defaultOpen);
    const [adding, setAdding] = useState(false);
    const [newChild, setNewChild] = useState('');
    const [addedChildren, setAddedChildren] = useState(false);

    useEffect(() => {
        if (!canEdit && adding) {
            if (addedChildren) {
                onChange([...path, 'children'], undefined, true);
                setAddedChildren(false);
            }
            setAdding(false);
            setNewChild('');
        }
    }, [canEdit]);

    if (label === "show" || label === "metadata") return null;

    const hasChildren = value && typeof value === 'object' && value.children;
    const nodeLabel = value?.metadata?.name || label;
    const show = Boolean(value?.show);

    const startAdd = () => {
        if (!canEdit) {
            return;
        }
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
        const key = toCamelCase(newChild);
        if (!key) return;
        if (value?.children && Object.prototype.hasOwnProperty.call(value.children, key)) {
            return;
        }
        const child: PermissionNode = { show: defaultShow, metadata: { name: newChild }, children: null };
        onChange([...path, 'children', key], child);
        setAdding(false);
        setNewChild('');
        setAddedChildren(false);
    };

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
                    {canEdit && !adding && (
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
                        <Node
                            key={k}
                            label={k}
                            value={v}
                            path={[...path, 'children', k]}
                            onChange={onChange}
                            allowStructureEdit={allowStructureEdit}
                            defaultShow={defaultShow}
                        />
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
            {canEdit && !adding && (
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

const PermissionTree: React.FC<TreeProps> = ({ data, path = [], onChange, allowStructureEdit = false, defaultShowForNewNodes = false }) => {
    const handleChange = (p: string[], value: any, remove?: boolean) => {
        const updated = remove ? deleteValue(data, p.slice(path.length)) : setValue(data, p.slice(path.length), value);
        onChange(updated);
    };

    return (
        <div>
            {Object.entries(data).map(([k, v]) => (
                <Node
                    key={k}
                    label={k}
                    value={v}
                    path={[...path, k]}
                    onChange={handleChange}
                    allowStructureEdit={allowStructureEdit}
                    defaultShow={defaultShowForNewNodes}
                />
            ))}
        </div>
    );
};

export default PermissionTree;
