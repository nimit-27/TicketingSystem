import React, { useEffect, useState, useContext } from 'react';
import { Button } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useApi } from '../hooks/useApi';
import { addRole, getAllPermissions, loadPermissions, getAllRoles, deleteRoles, deleteRole } from '../services/RoleService';
import { getStatusActions } from '../services/StatusService';
import { getParameters } from '../services/ParameterService';
import ViewToggle from '../components/UI/ViewToggle';
import GenericTable from '../components/UI/GenericTable';
import Title from '../components/Title';
import { useNavigate } from 'react-router-dom';
import { DevModeContext } from '../context/DevModeContext';
import CustomIconButton from '../components/UI/IconButton/CustomIconButton';
import CreateRole from './CreateRole';
import { getDropdownOptions } from '../utils/Utils';

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
    const { data: statusActions, apiHandler: actionsApiHandler } = useApi<any>();
    const { data: parameters, apiHandler: parametersApiHandler } = useApi<any>();

    const [view, setView] = useState<'table' | 'grid'>('table');
    const navigate = useNavigate();
    const [creating, setCreating] = useState(false);
    const [selectedRows, setSelectedRows] = useState<React.Key[]>([]);
    const { devMode } = useContext(DevModeContext);

    useEffect(() => {
        getAllRolesApiHandler(() => getAllRoles());
    }, []);

    useEffect(() => {
        apiHandler(() => getAllPermissions());
        actionsApiHandler(() => getStatusActions());
        parametersApiHandler(() => getParameters());
    }, []);

    const roles = data?.roles ? Object.keys(data.roles) : [];
    const parameterOptions = getDropdownOptions(parameters || [], 'label', 'parameterId');

    const handleCreate = () => {
        setCreating(true);
    };

    const handleCreateSubmit = (payload: any) => {
        addRole(payload)
            .then(() => loadPermissions())
            .then(() => getAllRolesApiHandler(() => getAllRoles()))
            .then(() => setCreating(false));
    };

    const handleCancel = () => {
        setCreating(false);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Delete this role?')) {
            deleteRole(id, devMode).then(() => getAllRolesApiHandler(() => getAllRoles()));
        }
    };

    const handleMultiDelete = () => {
        if (selectedRows.length) {
            if (window.confirm('Delete selected roles?')) {
                deleteRoles(selectedRows as string[], devMode).then(() => {
                    setSelectedRows([]);
                    getAllRolesApiHandler(() => getAllRoles());
                });
            }
        }
    };

    const columns = [
        { title: 'Role', key: 'role', dataIndex: 'role' },
        { title: 'Description', key: 'description', dataIndex: 'description' },
        { title: 'Created By', key: 'createdBy', dataIndex: 'createdBy' },
        { title: 'Created On', key: 'createdOn', dataIndex: 'createdOn', render: (date: string) => formatDate(date) },
        { title: 'Updated By', key: 'updatedBy', dataIndex: 'updatedBy' },
        { title: 'Updated On', key: 'updatedOn', dataIndex: 'updatedOn' },
        {
            title: 'Action',
            key: 'action',
            render: (_: any, r: any) => (
                <>
                    <VisibilityIcon sx={{ cursor: 'pointer', color: 'grey.600', marginRight: 1 }} onClick={() => navigate(`/role-master/${r.roleId}`, { state: r })} />
                    <CustomIconButton icon="delete" onClick={() => handleDelete(r.roleId)} />
                    {/* <span className="text-danger" style={{ cursor: 'pointer' }} onClick={() => handleDelete(r.role)}>Delete</span> */}
                </>
            )
        }];

    return (
        <div className="">
            <Title textKey="Role Master" />
            <div className="d-flex justify-content-between mb-3">
                {!creating && <Button variant="contained" onClick={handleCreate}>Create Role</Button>}
                <ViewToggle value={view} onChange={setView} options={[{ icon: 'grid', value: 'grid' }, { icon: 'table', value: 'table' }]} />
            </div>
            {creating && (
                <CreateRole
                    roles={roles}
                    permissions={data?.roles || {}}
                    statusActions={statusActions || []}
                    parameterOptions={parameterOptions}
                    onSubmit={handleCreateSubmit}
                    onCancel={handleCancel}
                />
            )}
            {view === 'table' ? (
                <>
                    <Button variant="outlined" color="error" disabled={!selectedRows.length} onClick={handleMultiDelete} className="mb-2">Delete Selected</Button>
                    <GenericTable dataSource={rolesData} columns={columns as any} rowKey="role" pagination={{ pageSize: 10 }}
                        rowSelection={{ selectedRowKeys: selectedRows, onChange: setSelectedRows }} />
                </>
            ) : (
                <div className="row">
                    {(rolesData || []).map((r: any) => (
                        <div className="col-md-3 mb-3" key={r.role}>
                            <div className="card p-3" style={{ cursor: 'pointer' }} onClick={() => navigate(`/role-master/${r.role}`)}>
                                <b>{r.role}</b>
                                {r.description && <p className="mb-0 small text-muted">{r.description}</p>}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RoleMaster;
