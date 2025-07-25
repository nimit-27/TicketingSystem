import React, { useEffect, useState, useContext } from 'react';
import { Button, Autocomplete, TextField } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useApi } from '../hooks/useApi';
import { addRole, getAllPermissions, loadPermissions, getAllRoles, deleteRoles, deleteRole } from '../services/RoleService';
import ViewToggle from '../components/UI/ViewToggle';
import GenericTable from '../components/UI/GenericTable';
import Title from '../components/Title';
import { useNavigate } from 'react-router-dom';
import GenericInput from '../components/UI/Input/GenericInput';
import PermissionsModal from '../components/Permissions/PermissionsModal';
import { DevModeContext } from '../context/DevModeContext';

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
    const [selectedRows, setSelectedRows] = useState<React.Key[]>([]);
    const { devMode } = useContext(DevModeContext);

    console.log({ rolesData });

    useEffect(() => {
        getAllRolesApiHandler(() => getAllRoles());
    }, []);

    useEffect(() => {
        apiHandler(() => getAllPermissions());
    }, []);

    const roles = data?.roles ? Object.keys(data.roles) : [];

    const handlePermChange = (_: any, val: any) => {
        const value = Array.isArray(val) ? val : [val];
        if (value.includes('Custom')) {
            if (!selectedPerms.includes('Custom')) {
                setOpenCustom(true);
            }
            setSelectedPerms(['Custom']);
        } else {
            setCustomPerm(null);
            setSelectedPerms(value);
        }
    };

    const handleCreate = () => {
        setCreating(true);
    };

    const handleSubmit = () => {
        if (!roleName) return;
        const permissions = customPerm || { sidebar: {}, pages: {} };
        const list = selectedPerms.filter(p => p !== 'Custom');
        const payload = { role: roleName, permissions, permissionsList: list ?? [] };
        addRole(payload)
            .then(() => loadPermissions())
            .then(() => getAllRolesApiHandler(() => getAllRoles()))
            .then(() => handleCancel());
    };

    const handleCancel = () => {
        setCreating(false);
        setRoleName('');
        setSelectedPerms([]);
        setCustomPerm(null);
    };

    const handleDelete = (id: string) => {
        deleteRole(id, devMode).then(() => getAllRolesApiHandler(() => getAllRoles()));
    };

    const handleMultiDelete = () => {
        if (selectedRows.length) {
            deleteRoles(selectedRows as string[], devMode).then(() => {
                setSelectedRows([]);
                getAllRolesApiHandler(() => getAllRoles());
            });
        }
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
                <>
                    <VisibilityIcon sx={{ cursor: 'pointer', color: 'grey.600', marginRight: 1 }} onClick={() => navigate(`/role-master/${r.role}`)} />
                    <span className="text-danger" style={{ cursor: 'pointer' }} onClick={() => handleDelete(r.role)}>Delete</span>
                </>
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
                    <div className="d-flex mb-2">
                        <GenericInput
                            label="Role name"
                            value={roleName}
                            onChange={e => setRoleName(e.target.value)}
                            className="me-2 w-50"
                        />
                        <Autocomplete
                            multiple={!selectedPerms.includes('Custom')}
                            options={["Custom", ...roles]}
                            value={selectedPerms.includes('Custom') ? 'Custom' : selectedPerms}
                            onChange={handlePermChange}
                            className="w-50"
                            renderOption={(props, option) => (
                                <li {...props} style={{ fontStyle: option === 'Custom' ? 'italic' : 'normal' }}>{option}</li>
                            )}
                            renderInput={(params) => <TextField {...params} label="Permissions" />}
                        />
                    </div>
                    <div className="mt-2">
                        <Button variant="contained" onClick={handleSubmit} className="me-2">Submit</Button>
                        <Button variant="outlined" onClick={handleCancel}>Cancel</Button>
                    </div>
                </div>
            )}
            {view === 'table' ? (
                <>
                    <Button variant="outlined" color="error" disabled={!selectedRows.length} onClick={handleMultiDelete} className="mb-2">Delete Selected</Button>
                    <GenericTable dataSource={rolesData} columns={columns as any} rowKey="role" pagination={false}
                        rowSelection={{ selectedRowKeys: selectedRows, onChange: setSelectedRows }} />
                </>
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
                title="Custom Permissions"
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
