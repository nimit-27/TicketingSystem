import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { getRolePermission, updateRolePermission, updateRole, loadPermissions, renameRole } from '../services/RoleService';
import { getCurrentUserDetails } from '../config/config';
import Title from '../components/Title';
import PermissionTree from '../components/Permissions/PermissionTree';
import JsonEditModal from '../components/Permissions/JsonEditModal';
import { Button, Chip, TextField } from '@mui/material';
import CustomIconButton from '../components/UI/IconButton/CustomIconButton';
import { useSnackbar } from '../context/SnackbarContext';
import { DevModeContext } from '../context/DevModeContext';

const RoleDetails: React.FC = () => {
    const { roleId } = useParams<{ roleId: string }>();
    const { data, apiHandler } = useApi<any>();
    const [perm, setPerm] = useState<any>(null);
    const { showMessage } = useSnackbar();
    const { devMode } = useContext(DevModeContext);
    const [openJson, setOpenJson] = useState(false);
    const [editing, setEditing] = useState(false);
    const [roleName, setRoleName] = useState(roleId || '');
    const navigate = useNavigate();

    useEffect(() => {
        if (roleId) {
            apiHandler(() => getRolePermission(roleId));
            setRoleName(roleId);
        }
    }, [roleId]);

    useEffect(() => {
        if (data) setPerm(data);
    }, [data]);

    function handleSubmit(this: any) {
        if (roleId) {
            updateRolePermission(roleId, this ?? perm).then(() => {
                const user = getCurrentUserDetails();
                updateRole(roleId, { updatedBy: user?.userId }).then(() => {
                    showMessage('Permissions updated successfully', 'success');
                    loadPermissions();
                });
            });
        }
    };

    const handleJsonEdit = (json: any) => {
        setPerm(json);
        setOpenJson(false);
        handleSubmit.call(json);
    }

    const submitRename = () => {
        if (!roleId || !roleName || roleId === roleName) { setEditing(false); return; }
        const user = getCurrentUserDetails();
        renameRole(roleId, roleName, user?.username).then(() => {
            showMessage('Role updated successfully', 'success');
            navigate(`/role-master/${roleName}`);
        });
    };

    const cancelRename = () => {
        setRoleName(roleId || '');
        setEditing(false);
    };

    if (!roleId) return null;

    return (
        <div className="container">
            <div className="d-flex align-items-center mb-3">
                {editing ? (
                    <>
                        <TextField value={roleName} onChange={e => setRoleName(e.target.value)} size="small" className="me-2" />
                        <CustomIconButton icon="check" onClick={submitRename} style={{ minWidth: 0, padding: 2 }} />
                        <CustomIconButton icon="close" onClick={cancelRename} style={{ minWidth: 0, padding: 2 }} />
                    </>
                ) : (
                    <>
                        <Title textKey={`Role: ${roleName}`} />
                        <CustomIconButton icon="edit" onClick={() => setEditing(true)} style={{ minWidth: 0, padding: 2 }} />
                    </>
                )}
            </div>
            {devMode && (
                <Chip label="JSON" size="small" onClick={() => setOpenJson(true)} sx={{ mb: 1 }} />
            )}
            {perm && <PermissionTree data={perm} onChange={setPerm} />}
            <Button variant="contained" className="mt-3" onClick={handleSubmit}>Save</Button>
            {devMode && (
                <JsonEditModal open={openJson} data={perm} onCancel={() => setOpenJson(false)} onSubmit={handleJsonEdit} />
            )}
        </div>
    );
};

export default RoleDetails;
