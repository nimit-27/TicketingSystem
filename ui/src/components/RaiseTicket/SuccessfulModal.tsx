import { Box, Modal } from "@mui/material";
import './SuccessfulModal.scss'
import { useTranslation } from "react-i18next";

interface SuccessfulModalProps {
    open: boolean;
    ticketId: string;
    onClose: () => void;
}

const SuccessfulModal: React.FC<SuccessfulModalProps> = ({ open, ticketId, onClose }) => {
    const encodedTicketId = encodeURIComponent(ticketId);
    const { t } = useTranslation();

    return (
        <Modal open={open} onClose={onClose}>
            <Box className="modal-box ticket-success p-3">
                <div className="bg-light-green p-2 rounded-2">
                    <h4 className="text-success fw-bold text-center mb-3">
                        {t('Thank you! Your ticket has been submitted successfully.')}
                    </h4>

                    <h5 className="text-center fw-bold mb-4">
                        {t('Ticket ID')}: <span className="ticket-id">{ticketId}</span>
                    </h5>

                    <div className="note-box p-3 text-start">
                        <strong>{t('Note')}:</strong>
                        <ul className="mt-2 ps-3">
                            <li>{t('You will receive updates on your registered email and mobile number.')}</li>
                            <li>{t('Our support team will review your request and get back to you shortly.')}</li>
                            <li>
                                {t('You can track the status of your ticket anytime from the Ticket page.')}
                                <a href={`/tickets/${encodedTicketId}`} className="text-primary text-decoration-underline">
                                    {t('Ticket')}
                                </a>.
                            </li>
                            <li>{t('If your issue is urgent or you need to provide additional information, please contact the Helpdesk.')}</li>
                        </ul>
                    </div>

                    <div className="text-center">
                        <button className="btn btn-success px-4" onClick={onClose}>
                            {t('OKAY')}
                        </button>
                    </div>
                </div>
            </Box>
        </Modal>
    )
}

export default SuccessfulModal;
