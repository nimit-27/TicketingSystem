import React, { useEffect, useState } from 'react';
import { Button } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useApi } from '../hooks/useApi';
import { getAllPermissions, updateRolePermission } from '../services/RoleService';
import ViewToggle from '../components/UI/ViewToggle';
import GenericTable from '../components/UI/GenericTable';
import Title from '../components/Title';
import { useNavigate } from 'react-router-dom';
import { getAllRoles } from '../services/RoleService';

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

    console.log({ rolesData });

    useEffect(() => {
        getAllRolesApiHandler(() => getAllRoles());
    }, []);

    useEffect(() => {
        apiHandler(() => getAllPermissions());
    }, []);

    const roles = data?.roles ? Object.keys(data.roles) : [];

    const handleCreate = () => {
        const role = prompt('Role name');
        if (role) {
            updateRolePermission(role, { sidebar: {}, pages: {} }).then(() => navigate(`/role-master/${role}`));
        }
    };

    const columns = [
        { title: 'Role', key: 'role', dataIndex: 'role' },
        { title: 'Created By', key: 'createdBy', dataIndex: 'createdBy' },
        { title: 'Created On', key: 'createdOn', dataIndex: 'createdOn', render: (date: string) => formatDate(date) },
        { title: 'Updated By', key: 'updatedBy', dataIndex: 'updatedBy' },
        { title: 'Updated On', key: 'updatedOn', dataIndex: 'updatedOn' },
        { title: 'Action', key: 'action', dataIndex: 'action' }
    ];

    return (
        <div className="container">
            <Title textKey="Role Master" />
            <div className="d-flex justify-content-between mb-3">
                <Button variant="contained" onClick={handleCreate}>Create Role</Button>
                <ViewToggle value={view} onChange={setView} options={[{ icon: 'grid', value: 'grid' }, { icon: 'table', value: 'table' }]} />
            </div>
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
        </div>
    );
};

export default RoleMaster;
