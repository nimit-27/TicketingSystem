import { Modal, Box } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import './StatusModal.scss';

interface SuccessModalProps {
  open: boolean;
  title: string;
  subtext?: string;
  actions?: React.ReactNode;
  onClose: () => void;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ open, title, subtext, actions, onClose }) => {
  return (
    <Modal open={open} onClose={onClose}>
      <Box className="modal-box status-modal-success">
        <div className="top-line" />
        <h4 className="text-success fw-bold mb-3 text-center">{title}</h4>
        <CheckCircleOutlineIcon className="icon" />
        {subtext && <p className="mb-3">{subtext}</p>}
        {actions && <div className="d-flex flex-column flex-md-row justify-content-center gap-2">{actions}</div>}
      </Box>
    </Modal>
  );
};

export default SuccessModal;

