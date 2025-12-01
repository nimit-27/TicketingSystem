import { Box, Button, Modal } from "@mui/material";
import React, { useEffect, useState } from "react";
import { makeTicketMaster } from "../../services/TicketService";

interface AssignMasterTicketModalProps {
    open: boolean;
    onClose: () => void;
    ticketId?: string;
    onSuccess?: () => void;
}

const AssignMasterTicketModal: React.FC<AssignMasterTicketModalProps> = ({ open, onClose, ticketId, onSuccess }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        if (open) {
            setError(null);
            setIsSuccess(false);
        }
    }, [open]);

    const handleClose = () => {
        setIsSubmitting(false);
        setError(null);
        setIsSuccess(false);
        onClose();
    };

    const handleConfirm = async () => {
        if (!ticketId) {
            return;
        }
        setIsSubmitting(true);
        setError(null);
        try {
            await makeTicketMaster(ticketId);
            setIsSuccess(true);
            onSuccess?.();
        } catch (err: any) {
            const message = err?.response?.data?.body?.data?.message
                || err?.response?.data?.message
                || err?.message
                || 'Failed to assign this ticket as master.';
            setError(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal open={open} onClose={handleClose}>
            <Box className="modal-box w-50 p-3" sx={{ maxWidth: 480 }}>
                <h4 className="text-center mb-3">Assign as Master Ticket</h4>
                {!isSuccess && (
                    <p className="text-center mb-3">
                        Are you sure you want to make the current ticket with id {ticketId} as Master?
                    </p>
                )}
                {isSuccess && (
                    <p className="text-success text-center mb-3">This ticket is now a Master ticket</p>
                )}
                {error && <p className="text-danger text-center mb-3">{error}</p>}
                <Box className="d-flex justify-content-end gap-2">
                    <Button variant="outlined" onClick={handleClose} disabled={isSubmitting}>
                        Close
                    </Button>
                    {!isSuccess && (
                        <Button
                            variant="contained"
                            onClick={handleConfirm}
                            disabled={!ticketId || isSubmitting}
                        >
                            Yes
                        </Button>
                    )}
                </Box>
            </Box>
        </Modal>
    );
};

export default AssignMasterTicketModal;
