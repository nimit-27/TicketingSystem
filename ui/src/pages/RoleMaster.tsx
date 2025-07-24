import React, { useEffect, useState } from 'react';
import { Button, Chip } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useApi } from '../hooks/useApi';
import { addRole, getAllPermissions, updateRolePermission } from '../services/RoleService';
import ViewToggle from '../components/UI/ViewToggle';
import GenericTable from '../components/UI/GenericTable';
import Title from '../components/Title';
import { useNavigate } from 'react-router-dom';
import { getAllRoles } from '../services/RoleService';
import GenericInput from '../components/UI/Input/GenericInput';
import CustomFieldset from '../components/CustomFieldset';
import PermissionsModal from '../components/Permissions/PermissionsModal';

const formatDate = (inputDate: string) => {
    const date = new Date(inputDate);
    return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
};

const RoleMaster: React.FC = () => {
    const { data: rolesData, apiHandler: getAllRolesApiHandler } = useApi<any>();
    const { data, apiHandler } = useApi<any>();
    const [view, setView] = useState<'table' | 'grid'>('table');
    const navigate = useNavigate();
    const [creating, setCreating] = useState(false);
    const [roleName, setRoleName] = useState('');
    const [selectedPerms, setSelectedPerms] = useState<string[]>([]);
    const [openCustom, setOpenCustom] = useState(false);
    const [customPerm, setCustomPerm] = useState<any>(null);

    console.log({ rolesData });

    useEffect(() => {
        getAllRolesApiHandler(() => getAllRoles());
    }, []);

    useEffect(() => {
        apiHandler(() => getAllPermissions());
    }, []);

    const roles = data?.roles ? Object.keys(data.roles) : [];

    const togglePerm = (perm: string) => {
        setSelectedPerms(prev =>
            prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
        );
    };

    const handleCreate = () => {
        setCreating(true);
    };

    const handleSubmit = () => {
        if (!roleName) return;
        const permissions = customPerm || { sidebar: {}, pages: {} };
        const list = selectedPerms.filter(p => p !== 'Custom');
        // if (list.length > 0) permissionsList = list;
        const payload = { roleName, permissions, permissionsList: list ?? [] }
        addRole(payload);
    };

    const handleCancel = () => {
        setCreating(false);
        setRoleName('');
        setSelectedPerms([]);
        setCustomPerm(null);
    };

    const columns = [
        { title: 'Role', key: 'role', dataIndex: 'role' },
        { title: 'Created By', key: 'createdBy', dataIndex: 'createdBy' },
        { title: 'Created On', key: 'createdOn', dataIndex: 'createdOn', render: (date: string) => formatDate(date) },
        { title: 'Updated By', key: 'updatedBy', dataIndex: 'updatedBy' },
        { title: 'Updated On', key: 'updatedOn', dataIndex: 'updatedOn' },
        {
            title: 'Action',
            key: 'action',
            render: (_: any, r: any) => (
                <VisibilityIcon sx={{ cursor: 'pointer', color: 'grey.600' }} onClick={() => navigate(`/role-master/${r.role}`)} />
            )
        }];

    return (
        <div className="container">
            <Title textKey="Role Master" />
            <div className="d-flex justify-content-between mb-3">
                <Button variant="contained" onClick={handleCreate}>Create Role</Button>
                <ViewToggle value={view} onChange={setView} options={[{ icon: 'grid', value: 'grid' }, { icon: 'table', value: 'table' }]} />
            </div>
            {creating && (
                <div className="mb-3">
                    <GenericInput label="Role name" value={roleName} onChange={e => setRoleName(e.target.value)} fullWidth className="mb-2" />
                    <CustomFieldset title="Select Permission/s">
                        <div className="mb-2">
                            <Chip
                                label="Custom"
                                onClick={() => setOpenCustom(true)}
                                color={selectedPerms.includes('Custom') ? 'primary' : 'default'}
                                variant={selectedPerms.includes('Custom') ? 'filled' : 'outlined'}
                                sx={{ mr: 1, mb: 1, cursor: 'pointer' }}
                            />
                            {roles.map(r => (
                                <Chip
                                    key={r}
                                    label={r}
                                    onClick={() => togglePerm(r)}
                                    color={selectedPerms.includes(r) ? 'primary' : 'default'}
                                    variant={selectedPerms.includes(r) ? 'filled' : 'outlined'}
                                    sx={{ mr: 1, mb: 1, cursor: 'pointer' }}
                                />
                            ))}
                        </div>
                    </CustomFieldset>
                    <div className="mt-2">
                        <Button variant="contained" onClick={handleSubmit} className="me-2">Submit</Button>
                        <Button variant="outlined" onClick={handleCancel}>Cancel</Button>
                    </div>
                </div>
            )}
            {view === 'table' ? (
                <GenericTable dataSource={rolesData} columns={columns as any} rowKey="role" pagination={false} />
            ) : (
                <div className="row">
                    {roles.map(r => (
                        <div className="col-md-3 mb-3" key={r}>
                            <div className="card p-3" style={{ cursor: 'pointer' }} onClick={() => navigate(`/role-master/${r}`)}>
                                <b>{r}</b>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <PermissionsModal
                open={openCustom}
                roles={roles}
                permissions={data?.roles || {}}
                onClose={() => setOpenCustom(false)}
                onSubmit={(perm) => {
                    setCustomPerm(perm);
                    if (!selectedPerms.includes('Custom')) setSelectedPerms(p => [...p, 'Custom']);
                    setOpenCustom(false);
                }}
            />
        </div>
    );
};

export default RoleMaster;
