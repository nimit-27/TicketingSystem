import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { getRolePermission, updateRolePermission, loadPermissions } from '../services/PermissionService';
import Title from '../components/Title';
import PermissionTree from '../components/Permissions/PermissionTree';
import JsonEditModal from '../components/Permissions/JsonEditModal';
import { Button, Chip } from '@mui/material';
import { useSnackbar } from '../context/SnackbarContext';
import { DevModeContext } from '../context/DevModeContext';

const RoleDetails: React.FC = () => {
    const { roleId } = useParams<{ roleId: string }>();
    const { data, apiHandler } = useApi<any>();
    const [perm, setPerm] = useState<any>(null);
    const { showMessage } = useSnackbar();
    const { devMode } = useContext(DevModeContext);
    const [openJson, setOpenJson] = useState(false);

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
                loadPermissions();
            });
        }
    };

    if (!roleId) return null;

    return (
        <div className="container">
            <Title textKey={`Role: ${roleId}`} />
            {devMode && (
                <Chip label="JSON" size="small" onClick={() => setOpenJson(true)} sx={{ mb: 1 }} />
            )}
            {perm && <PermissionTree data={perm} onChange={setPerm} />}
            <Button variant="contained" className="mt-3" onClick={handleSubmit}>Save</Button>
            {devMode && (
                <JsonEditModal open={openJson} data={perm} onCancel={() => setOpenJson(false)} onSubmit={(p) => { setPerm(p); setOpenJson(false); handleSubmit(); }} />
            )}
        </div>
    );
};

export default RoleDetails;
