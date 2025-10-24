import { useForm, useWatch } from "react-hook-form";
import RequestDetails from "../components/RaiseTicket/RequestDetails";
import RequestorDetails from "../components/RaiseTicket/RequestorDetails";
import TicketDetails from "../components/RaiseTicket/TicketDetails";
import SuccessfulModal from "../components/RaiseTicket/SuccessfulModal";
import { useContext, useState } from "react";
import Title from "../components/Title";
import LinkToMasterTicketModal from "../components/RaiseTicket/LinkToMasterTicketModal";
import GenericButton from "../components/UI/Button";
import GenericSubmitButton from "../components/UI/Button/GenericSubmitButton";
import { useApi } from "../hooks/useApi";
import { addAttachments, addTicket } from "../services/TicketService";
import { DevModeContext } from "../context/DevModeContext";
import CustomIconButton from "../components/UI/IconButton/CustomIconButton";
import { checkAccessMaster } from "../utils/permissions";
import GenericCancelButton from "../components/UI/Button/GenericCancelButton";

const RaiseTicket: React.FC<any> = () => {
    const { register, handleSubmit, control, setValue, getValues, formState: { errors, isValid }, resetField, trigger } = useForm({ mode: 'onChange' });
    const today = new Date();

    const { data, pending, error, success, apiHandler } = useApi();

    const { devMode } = useContext(DevModeContext);

    const isMaster = useWatch({ control, name: 'isMaster' });
    const masterId = useWatch({ control, name: 'masterId' });
    const subject = useWatch({ control, name: 'subject' });

    let showLinkToMasterTicket = checkAccessMaster(["ticketForm", "linkToMasterTicketButton"]);

    const [successfullModalOpen, setSuccessfulModalOpen] = useState(false);
    const [linkToMasterTicketModalOpen, setLinkToMasterTicketModalOpen] = useState(false);
    const [createdTicketId, setCreatedTicketId] = useState<string | null>(null);
    const [attachments, setAttachments] = useState<File[]>([]);

    const onSubmit = (formValues: any) => {
        const {
            name,
            emailId,
            mobileNo,
            stakeholder,
            assignTo,
            assignToLevel,
            ...rest
        } = formValues;

        // Build JSON payload without attachments
        const payload: any = {
            ...rest,
            requestorName: name,
            requestorEmailId: emailId,
            requestorMobileNo: mobileNo,
            stakeholder,
        };

        // Map assignment fields to backend expected keys
        if (assignTo) payload.assignedTo = assignTo;
        if (assignToLevel) payload.levelId = assignToLevel;

        console.table(payload)

        const formData = new FormData();
        Object.entries(payload).forEach(([key, value]) => {
            if (key === 'attachments' && Array.isArray(value) && value.length > 0) {
                value.forEach(file => formData.append('attachments', file));
            } else if (value !== undefined && value !== null) {
                if (value instanceof Date) {
                    formData.append(key, value.toLocaleString().replace("Z", ""));
                } else {
                    formData.append(key, String(value));
                }
            }
        });

        // 1) Create ticket (no files)
        apiHandler(() => addTicket(formData))
            .then((resp: any) => {
                const ticketId = resp?.id;
                setCreatedTicketId(ticketId);

                const files: File[] = Array.isArray(attachments) ? attachments : [];
                // 2) If files selected, upload them against created ticket
                if (ticketId && files.length > 0) {
                    return apiHandler(() => addAttachments(ticketId, files))
                        .then(() => {
                            setSuccessfulModalOpen(true);
                        });
                }
                // No attachments to upload
                setSuccessfulModalOpen(true);
            })
    };

    const clearTicketDetailsFields = () => {
        resetField('assignedToLevel');
        resetField('assignedTo');
        resetField('assignFurther');
        resetField('assignToLevel');
        resetField('assignTo');
        resetField('category');
        resetField('subCategory');
        resetField('priority');
        resetField('severity');
        resetField('impact');
        resetField('recommendedSeverity');
        resetField('isMaster');
        resetField('subject');
        resetField('description');
        resetField('attachments');
        resetField('statusId');
        setAttachments([]);
        setValue('attachments', []);
        void trigger();
    };

    const handleClearForm = () => {
        clearTicketDetailsFields();
    };

    const onClose = () => {
        setSuccessfulModalOpen(false);
        setAttachments([]);
        setCreatedTicketId(null);
        clearTicketDetailsFields();
    };
    const onLinkToMasterTicketModalClose = () => setLinkToMasterTicketModalOpen(false);
    const onLinkToMasterTicketModalOpen = () => setLinkToMasterTicketModalOpen(true);

    // Dev mode: Populate dummy data for quick testing
    const populateDummyTicketDetails = () => {
        setValue('category', 'Data Management');
        setValue('subCategory', 'Data Entry Errors');
        setValue('priority', 'P1 | Urgent (Impacting 100% users)');
        setValue('subject', 'Sample Issue Subject');
        setValue('description', 'This is a sample description for testing purposes.');
    };

    const setMasterId = (id: string) => {
        setValue('masterId', id)
    }

    return (
        <div className="w-100">
            <Title text="Raise Ticket" rightContent={<span>{today.toLocaleString()}</span>} />
            {devMode && <CustomIconButton icon="listAlt" onClick={() => console.table(getValues())} />}
            <form onSubmit={handleSubmit(onSubmit)}>
                {/* Request Details */}
                <RequestDetails register={register} control={control} errors={errors} setValue={setValue} createMode />
                {/* Requestor Details */}
                <RequestorDetails register={register} control={control} errors={errors} setValue={setValue} createMode />
                {/* Ticket Details */}
                {devMode && <CustomIconButton icon="formatColorFill" onClick={populateDummyTicketDetails} />}
                <TicketDetails register={register} control={control} errors={errors} createMode attachments={attachments} setAttachments={setAttachments} />

                {showLinkToMasterTicket && (
                    <div className="text-start d-flex align-items-center gap-2 flex-wrap">
                        <GenericButton textKey="Link to a Master Ticket" variant="contained" onClick={onLinkToMasterTicketModalOpen} disabled={isMaster} />
                        {masterId && (
                            <span className="text-success">
                                This ticket is linked to master ticket ID {masterId}
                            </span>
                        )}
                    </div>
                )}
                {/* Submit Button */}
                <div className="text-end mt-3 d-flex justify-content-center gap-2">
                    <GenericCancelButton textKey="Clear Form" type="button" onClick={handleClearForm} style={{ width: '220px' }} />
                    <GenericSubmitButton textKey="Submit Ticket" disabled={!isValid} style={{ width: '220px' }} />
                </div>
            </form>

            {/* Link to Master Ticket Modal */}
            <LinkToMasterTicketModal open={linkToMasterTicketModalOpen} onClose={onLinkToMasterTicketModalClose} setMasterId={setMasterId} subject={subject} masterId={masterId} />
            {/* Successful Modal */}
            <SuccessfulModal ticketId={createdTicketId ?? ''} open={successfullModalOpen} onClose={onClose} />
        </div>
    )
}

export default RaiseTicket;
