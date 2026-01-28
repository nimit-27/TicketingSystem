import React, { useCallback, useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@mui/material';
import UserDetailsCard from '../UserDetailsCard';

type CopyField = 'name' | 'username' | 'email' | 'phone';

interface RequestorModalProps {
    open: boolean;
    onClose: () => void;
    name?: string;
    username?: string;
    email?: string;
    phone?: string;
    role?: string;
    office?: string;
    officeCode?: string;
    regionCode?: string;
    zoneCode?: string;
    districtCode?: string;
    stakeholder?: string;
}

const RequestorModal: React.FC<RequestorModalProps> = ({
    open,
    onClose,
    name,
    username,
    email,
    phone,
    role,
    office,
    officeCode,
    regionCode,
    zoneCode,
    districtCode,
    stakeholder,
}) => {
    const [copiedField, setCopiedField] = useState<CopyField | null>(null);

    const handleClose = useCallback(() => {
        setCopiedField(null);
        onClose();
    }, [onClose]);

    const handleCopy = useCallback((field: CopyField, value: string) => {
        navigator.clipboard.writeText(value);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    }, []);

    const details = [
        role ? { label: 'Role', value: role } : null,
        office ? { label: 'Office', value: office } : null,
        officeCode ? { label: 'Office Code', value: officeCode } : null,
        regionCode ? { label: 'Region Code', value: regionCode } : null,
        zoneCode ? { label: 'Zone Code', value: zoneCode } : null,
        districtCode ? { label: 'District Code', value: districtCode } : null,
        stakeholder ? { label: 'Stakeholder', value: stakeholder } : null,
    ].filter(Boolean) as Array<{ label: string; value?: string | null }>;

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
            <DialogTitle>Requestor Details</DialogTitle>
            <DialogContent>
                <UserDetailsCard
                    name={name}
                    username={username}
                    email={email}
                    phone={phone}
                    copiedField={copiedField}
                    onCopy={handleCopy}
                    details={details}
                />
            </DialogContent>
        </Dialog>
    );
};

export default RequestorModal;
