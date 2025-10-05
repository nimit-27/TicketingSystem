import React, { useContext, useState, useEffect } from 'react';
import { Checkbox, Chip, Collapse, IconButton, TextField, Tooltip } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { PermissionNode } from '../../types';
import { DevModeContext } from '../../context/DevModeContext';
import CustomIconButton from '../UI/IconButton/CustomIconButton';
import JsonEditModal from './JsonEditModal';

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
    };
};

const cloneNode = (node: PermissionNode): PermissionNode => {
    const clonedChildren = node.children
        ? Object.fromEntries(
              Object.entries(node.children).map(([key, child]) => [key, cloneNode(child)])
          )
        : node.children;

    return {
        ...node,
        metadata: node.metadata ? { ...node.metadata } : node.metadata,
        children: clonedChildren
    };
};

const setShowRecursively = (node: PermissionNode, show: boolean): PermissionNode => {
    const updatedChildren = node.children
        ? Object.fromEntries(
              Object.entries(node.children).map(([key, child]) => [key, setShowRecursively(child, show)])
          )
        : node.children;

    return {
        ...node,
        show,
        children: updatedChildren
    };
};

const isUniformShowState = (node: PermissionNode | undefined, expected: boolean): boolean => {
    if (!node) return false;
    const currentMatches = Boolean(node.show) === expected;
    if (!currentMatches) {
        return false;
    }

    if (!node.children) {
        return true;
    }

    return Object.values(node.children).every(child => isUniformShowState(child, expected));
};

const Node: React.FC<{
    label: string;
    value: any;
    path: string[];
    onChange: (path: string[], value: any, remove?: boolean) => void;
    allowStructureEdit: boolean;
    defaultShow: boolean;
    onOpenJson: (path: string[], value: any) => void;
}> = ({ label, value, path, onChange, allowStructureEdit, defaultShow, onOpenJson }) => {
    const { devMode } = useContext(DevModeContext);
    const canEdit = devMode && allowStructureEdit;
    const defaultOpen = path.length === 1 && (label === 'pages' || label === 'sidebar');
    const [open, setOpen] = useState(defaultOpen);
    const [adding, setAdding] = useState(false);
    const [newChild, setNewChild] = useState('');
    const [addedChildren, setAddedChildren] = useState(false);
    const [editingName, setEditingName] = useState(false);
    const [nameValue, setNameValue] = useState<string>(value?.metadata?.name || label);
    const [allChildrenState, setAllChildrenState] = useState<'neutral' | 'all' | 'none'>('neutral');
    const [cachedValue, setCachedValue] = useState<PermissionNode | null>(null);

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

    useEffect(() => {
        if (!editingName) {
            setNameValue(value?.metadata?.name || label);
        }
    }, [label, value?.metadata?.name, editingName]);

    if (label === 'show' || label === 'metadata') return null;

    const hasChildren = value && typeof value === 'object' && value.children;
    const nodeLabel = value?.metadata?.name || label;
    const show = Boolean(value?.show);
    const childCount = value?.children ? Object.keys(value.children).length : 0;

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

    const startEditName = () => {
        if (!canEdit) return;
        setEditingName(true);
        setNameValue(value?.metadata?.name || label);
    };

    const cancelEditName = () => {
        setEditingName(false);
        setNameValue(value?.metadata?.name || label);
    };

    const confirmEditName = () => {
        const trimmed = nameValue.trim();
        if (!trimmed) {
            return;
        }
        const updatedMetadata = { ...(value?.metadata || {}), name: trimmed };
        onChange([...path, 'metadata'], updatedMetadata);
        setEditingName(false);
    };

    const handleDelete = () => {
        if (!canEdit) return;
        if (childCount > 0) {
            const confirmed = window.confirm('This attribute has children. Do you want to delete it along with all its children?');
            if (!confirmed) {
                return;
            }
        }
        onChange(path, undefined, true);
    };

    const openJsonEditor = () => {
        if (!canEdit) return;
        onOpenJson(path, value);
    };

    const renderNameEditor = () => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexGrow: 1 }}>
            {editingName ? (
                <>
                    <TextField size="small" value={nameValue} onChange={e => setNameValue(e.target.value)} />
                    <CustomIconButton icon='check' onClick={confirmEditName} />
                    <CustomIconButton icon='close' onClick={cancelEditName} />
                </>
            ) : (
                <span style={{ flexGrow: 1 }}>{nodeLabel}</span>
            )}
        </div>
    );

    useEffect(() => {
        if (!value) {
            setAllChildrenState('neutral');
            setCachedValue(null);
            return;
        }

        if (allChildrenState === 'all' && !isUniformShowState(value, true)) {
            setAllChildrenState('neutral');
            setCachedValue(null);
        } else if (allChildrenState === 'none' && !isUniformShowState(value, false)) {
            setAllChildrenState('neutral');
            setCachedValue(null);
        }
    }, [value, allChildrenState]);

    const handleToggleAllChildren = () => {
        if (!value || typeof value !== 'object') {
            return;
        }

        if (allChildrenState === 'neutral') {
            setCachedValue(cloneNode(value));
            onChange(path, setShowRecursively(value, true));
            setAllChildrenState('all');
        } else if (allChildrenState === 'all') {
            onChange(path, setShowRecursively(value, false));
            setAllChildrenState('none');
        } else {
            if (cachedValue) {
                onChange(path, cachedValue);
            }
            setCachedValue(null);
            setAllChildrenState('neutral');
        }
    };

    const renderAllChildrenChip = () => {
        if (!value || childCount === 0) {
            return null;
        }

        let color: 'default' | 'success' | 'error' = 'default';
        let variant: 'outlined' | 'filled' = 'outlined';

        if (allChildrenState === 'all') {
            color = 'success';
            variant = 'filled';
        } else if (allChildrenState === 'none') {
            color = 'error';
            variant = 'filled';
        }

        return (
            <Chip
                size="small"
                label="All children"
                color={color}
                variant={variant}
                onClick={handleToggleAllChildren}
            />
        );
    };

    const renderActions = (includeAdd: boolean) => {
        if (!canEdit) return null;
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Tooltip title="Edit JSON" arrow>
                    <span>
                        <CustomIconButton icon='code' size='small' onClick={openJsonEditor} aria-label='Edit JSON' />
                    </span>
                </Tooltip>
                {!editingName && (
                    <>
                        <Tooltip title="Rename" arrow>
                            <span>
                                <CustomIconButton icon='edit' size='small' onClick={startEditName} aria-label='Rename attribute' />
                            </span>
                        </Tooltip>
                        <Tooltip title="Delete" arrow>
                            <span>
                                <CustomIconButton icon='delete' size='small' onClick={handleDelete} aria-label='Delete attribute' />
                            </span>
                        </Tooltip>
                        {includeAdd && !adding && (
                            <Tooltip title="Add child" arrow>
                                <span>
                                    <CustomIconButton icon='add' size='small' onClick={startAdd} aria-label='Add child attribute' />
                                </span>
                            </Tooltip>
                        )}
                    </>
                )}
            </div>
        );
    };

    if (hasChildren || addedChildren) {
        const entries = Object.entries(value.children || {});
        return (
            <div style={{ marginLeft: 16 }}>
                <div className='border-bottom' style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <IconButton size="small" onClick={() => setOpen(o => !o)}>
                        {open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                    <Checkbox
                        size="small"
                        checked={show}
                        onChange={e => onChange([...path, 'show'], e.target.checked)}
                    />
                    {renderNameEditor()}
                    {renderAllChildrenChip()}
                    {renderActions(true)}
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
                            onOpenJson={onOpenJson}
                        />
                    ))}
                </Collapse>
            </div>
        );
    }

    return (
        <div className='border-bottom' style={{ display: 'flex', alignItems: 'center', marginLeft: 16, gap: 8 }}>
            <Checkbox
                size="small"
                checked={show}
                onChange={e => onChange([...path, 'show'], e.target.checked)}
            />
            {renderNameEditor()}
            {renderAllChildrenChip()}
            {renderActions(true)}
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
    const [jsonModalPath, setJsonModalPath] = useState<string[] | null>(null);
    const [jsonModalData, setJsonModalData] = useState<any>(null);

    const handleChange = (p: string[], value: any, remove?: boolean) => {
        const updated = remove ? deleteValue(data, p.slice(path.length)) : setValue(data, p.slice(path.length), value);
        onChange(updated);
    };

    const handleOpenJson = (nodePath: string[], nodeValue: any) => {
        setJsonModalPath(nodePath);
        setJsonModalData(nodeValue);
    };

    const handleCloseJson = () => {
        setJsonModalPath(null);
        setJsonModalData(null);
    };

    const handleSubmitJson = (value: any) => {
        if (jsonModalPath) {
            handleChange(jsonModalPath, value);
        }
        handleCloseJson();
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
                    onOpenJson={handleOpenJson}
                />
            ))}
            {allowStructureEdit && jsonModalPath !== null && (
                <JsonEditModal
                    open={jsonModalPath !== null}
                    data={jsonModalData}
                    onCancel={handleCloseJson}
                    onSubmit={handleSubmitJson}
                />
            )}
        </div>
    );
};

export default PermissionTree;
