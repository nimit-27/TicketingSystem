import { Box, Modal } from "@mui/material";
import './SuccessfullModal.scss'

interface SuccessfullModalProps {
    open: boolean;
    ticketId: string;
    onClose: () => void;
}

const SuccessfullModal: React.FC<SuccessfullModalProps> = ({ open, ticketId, onClose }) => {
    const encodedTicketId = encodeURIComponent(ticketId);

    return (
        <Modal open={open} onClose={onClose}>
            <Box className="modal-box ticket-success p-3">
                <div className="bg-light-green p-2 rounded-2">
                    <h4 className="text-success fw-bold text-center mb-3">
                        Thank you! Your ticket has been submitted successfully.
                    </h4>

                    <h5 className="text-center fw-bold mb-4">
                        Ticket ID: <span className="ticket-id">{ticketId}</span>
                    </h5>

                    <div className="note-box p-3 text-start">
                        <strong>Note:</strong>
                        <ul className="mt-2 ps-3">
                            <li>You will receive updates on your registered email and mobile number.</li>
                            <li>Our support team will review your request and get back to you shortly.</li>
                            <li>
                                You can track the status of your ticket anytime from the{' '}
                                <a href={`/my-tickets/${encodedTicketId}`} className="text-primary text-decoration-underline">
                                    My Tickets
                                </a>{' '}
                                section.
                            </li>
                            <li>If your issue is urgent or you need to provide additional information, please contact the Helpdesk.</li>
                        </ul>
                    </div>

                    <div className="text-center">
                        <button className="btn btn-success px-4" onClick={onClose}>
                            OKAY
                        </button>
                    </div>
                </div>
            </Box>
        </Modal>
    )
}

export default SuccessfullModal;