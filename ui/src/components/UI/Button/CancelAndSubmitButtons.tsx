import { useTranslation } from "react-i18next";
import GenericCancelButton from "./GenericCancelButton";
import GenericSubmitButton from "./GenericSubmitButton";

interface CancelAndSubmitButtonsProps {
    handleCancel: () => void;
    handleSubmit?: () => void;
    isSubmitDisabled?: boolean;
    typeSubmit?: boolean;
}

const CancelAndSubmitButtons: React.FC<CancelAndSubmitButtonsProps> = ({ handleCancel, handleSubmit, isSubmitDisabled, typeSubmit }) => {
    const { t } = useTranslation();

    return (
        <div className="d-flex gap-2 mt-3 justify-content-center">
            <GenericCancelButton onClick={handleCancel} style={{ width: '220px' }}>
                {t('Cancel')}
            </GenericCancelButton>
            <GenericSubmitButton className="me-2" type={typeSubmit ? 'submit' : undefined} onClick={handleSubmit} style={{ width: '220px' }} disabled={isSubmitDisabled}>
                {t('Submit')}
            </GenericSubmitButton>
        </div>
    );
}

export default CancelAndSubmitButtons;