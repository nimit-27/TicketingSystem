import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { getRolePermission, updateRolePermission } from '../services/PermissionService';
import Title from '../components/Title';
import PermissionTree from '../components/Permissions/PermissionTree';
import { Button } from '@mui/material';
import { useSnackbar } from '../context/SnackbarContext';

const RoleDetails: React.FC = () => {
    const { roleId } = useParams<{ roleId: string }>();
    const { data, apiHandler } = useApi<any>();
    const [perm, setPerm] = useState<any>(null);
    const { showMessage } = useSnackbar();

    useEffect(() => {
        if (roleId) {
            apiHandler(() => getRolePermission(roleId));
        }
    }, [roleId]);

    useEffect(() => {
        if (data) setPerm(data);
    }, [data]);

    const handleSubmit = () => {
        if (roleId) {
            updateRolePermission(roleId, perm).then(() => {
                showMessage('Permissions updated successfully', 'success');
            });
        }
    };

    if (!roleId) return null;

    return (
        <div className="container">
            <Title textKey={`Role: ${roleId}`} />
            {perm && <PermissionTree data={perm} onChange={setPerm} />}
            <Button variant="contained" className="mt-3" onClick={handleSubmit}>Save</Button>
        </div>
    );
};

export default RoleDetails;
