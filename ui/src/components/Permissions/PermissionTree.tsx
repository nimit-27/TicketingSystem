import React, { useState } from 'react';
import { Checkbox, Collapse, FormControlLabel, IconButton } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

interface TreeProps {
    data: any;
    path?: string[];
    onChange: (data: any) => void;
}

const setValue = (obj: any, path: string[], value: any): object => {
    if (path.length === 1) {
        return { ...obj, [path[0]]: value };
    }
    const [first, ...rest] = path;
    return {
        ...obj,
        [first]: setValue(obj[first] ?? {}, rest, value)
    };
};

const Node: React.FC<{ label: string; value: any; path: string[]; onChange: (path: string[], value: any) => void }> = ({ label, value, path, onChange }) => {
    const defaultOpen = path.length === 1 && (label === 'pages' || label === 'sidebar');
    const [open, setOpen] = useState(defaultOpen);
    const isObject = value && typeof value === 'object' && !Array.isArray(value);

    if (isObject) {
        return (
            <div style={{ marginLeft: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton size="small" onClick={() => setOpen(o => !o)}>
                        {open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                    <span>{label}</span>
                </div>
                <Collapse in={open} timeout="auto" unmountOnExit>
                    {Object.entries(value).map(([k, v]) => (
                        <Node key={k} label={k} value={v} path={[...path, k]} onChange={onChange} />
                    ))}
                </Collapse>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', alignItems: 'center', marginLeft: 16 }}>
            <Checkbox
                size="small"
                checked={Boolean(value)}
                onChange={e => onChange(path, e.target.checked)}
            />
            <span>{label}</span>
        </div>
    );
};

const PermissionTree: React.FC<TreeProps> = ({ data, path = [], onChange }) => {
    const handleChange = (p: string[], value: any) => {
        onChange(setValue(data, p.slice(path.length), value));
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
