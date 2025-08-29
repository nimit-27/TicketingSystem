import { Modal, Box } from '@mui/material';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import './StatusModal.scss';

interface FailureModalProps {
  open: boolean;
  title: string;
  subtext?: string;
  actions?: React.ReactNode;
  onClose: () => void;
}

const FailureModal: React.FC<FailureModalProps> = ({ open, title, subtext, actions, onClose }) => (
  <Modal open={open} onClose={onClose}>
    <Box className="modal-box status-modal-error">
      <div className="top-line" />
      <h4 className="text-danger fw-bold mb-3 text-center">{title}</h4>
      <HighlightOffIcon className="icon" />
      {subtext && <p className="mb-3">{subtext}</p>}
      {actions && <div className="d-flex flex-column flex-md-row justify-content-center gap-2">{actions}</div>}
    </Box>
  </Modal>
);

export default FailureModal;

