import React, { useEffect, useState } from 'react';
import { Box, Button, Modal } from '@mui/material';
import PermissionTree from './PermissionTree';
import GenericDropdown, { DropdownOption } from '../UI/Dropdown/GenericDropdown';

interface PermissionsModalProps {
  open: boolean;
  roles: string[];
  permissions: any;
  defaultRole?: string;
  onClose: () => void;
  onSubmit: (perm: any) => void;
  title?: string;
}

const PermissionsModal: React.FC<PermissionsModalProps> = ({ open, roles, permissions, defaultRole = 'User', onClose, onSubmit, title }) => {
  const [role, setRole] = useState<string>(defaultRole);
  const [perm, setPerm] = useState<any>(null);

  useEffect(() => {
    if (open) {
      setRole(defaultRole);
      setPerm(JSON.parse(JSON.stringify(permissions[defaultRole] || { sidebar: {}, pages: {} }))); // deep clone
    }
  }, [open, defaultRole, permissions]);

  const handleRoleChange = (e: any) => {
    const value = e.target.value as string;
    setRole(value);
    const base = permissions[value] || { sidebar: {}, pages: {} };
    setPerm(JSON.parse(JSON.stringify(base)));
  };

  const handleSubmit = () => {
    onSubmit(perm);
  };

  const roleOptions: DropdownOption[] = roles.map(r => ({ label: r, value: r }));

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{ bgcolor: 'background.paper', p: 2, maxHeight: '80vh', overflow: 'auto', maxWidth: '80vw', margin: '5% auto' }}>
        {title && <h4 className="text-center mb-2">{title}</h4>}
        <GenericDropdown
          label="Permissions' Role"
          value={role}
          onChange={handleRoleChange as any}
          options={roleOptions}
          fullWidth
          className="mb-3"
        />
        {perm && <PermissionTree data={perm} onChange={setPerm} />}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button variant="contained" onClick={handleSubmit}>Submit</Button>
          <Button variant="outlined" sx={{ ml: 1 }} onClick={onClose}>Cancel</Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default PermissionsModal;
