import { useForm, useWatch } from "react-hook-form";
import RequestDetails from "../components/RaiseTicket/RequestDetails";
import RequestorDetails from "../components/RaiseTicket/RequestorDetails";
import TicketDetails from "../components/RaiseTicket/TicketDetails";
import SuccessfulModal from "../components/RaiseTicket/SuccessfulModal";
import { useContext, useState } from "react";
import Title from "../components/Title";
import LinkToMasterTicketModal from "../components/RaiseTicket/LinkToMasterTicketModal";
import GenericButton from "../components/UI/Button";
import { useApi } from "../hooks/useApi";
import { addTicket } from "../services/TicketService";
import { DevModeContext } from "../context/DevModeContext";
import CustomIconButton from "../components/UI/IconButton/CustomIconButton";
import { formatDateWithSuffix } from "../utils/Utils";

const RaiseTicket: React.FC<any> = () => {
    const { register, handleSubmit, control, setValue, getValues, formState: { errors }, resetField } = useForm();
    const reportedDate = formatDateWithSuffix(new Date());

    const { data, pending, error, success, apiHandler } = useApi();

    const { devMode } = useContext(DevModeContext);

    const isMaster = useWatch({ control, name: 'isMaster' });

    const [successfullModalOpen, setSuccessfulModalOpen] = useState(false);
    const [linkToMasterTicketModalOpen, setLinkToMasterTicketModalOpen] = useState(false);
    const [createdTicketId, setCreatedTicketId] = useState<string | null>(null);

    const onSubmit = (data: any) => {
        const {
            name,
            emailId,
            mobileNo,
            stakeholder,
            ...rest
        } = data;

        const payload = {
            ...rest,
            requestorName: name,
            requestorEmailId: emailId,
            requestorMobileNo: mobileNo,
            stakeholder,
            reportedDate: new Date()
        };

        const formData = new FormData();
        Object.entries(payload).forEach(([key, value]) => {
            if (key === 'attachments' && value && (value as FileList).length > 0) {
                Array.from(value as FileList).forEach(file => formData.append('attachments', file));
            } else if (value !== undefined && value !== null) {
                if (value instanceof Date) {
                    formData.append(key, value.toISOString().split('T')[0]);
                } else {
                    formData.append(key, String(value));
                }
            }
        });

        apiHandler(() => addTicket(formData))
            .then((resp: any) => {
                setCreatedTicketId(resp?.id);
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
        // Add/remove fields as per your TicketDetails form
    };

    const onClose = () => {
        setSuccessfulModalOpen(false);
        clearTicketDetailsFields();
    };
    const onLinkToMasterTicketModalClose = () => setLinkToMasterTicketModalOpen(false);
    const onLinkToMasterTicketModalOpen = () => setLinkToMasterTicketModalOpen(true);

    return (
        <div className="container pb-5">
            <Title text="Raise Ticket" rightContent={<span>{reportedDate}</span>} />
            {devMode && <CustomIconButton icon="listAlt" onClick={() => console.table(getValues())} />}
            <form onSubmit={handleSubmit(onSubmit)}>
                {/* Request Details */}
                <RequestDetails register={register} control={control} errors={errors} setValue={setValue} createMode />
                {/* Requestor Details */}
                <RequestorDetails register={register} control={control} errors={errors} setValue={setValue} createMode />
                {/* Ticket Details */}
                <TicketDetails register={register} control={control} errors={errors} createMode />
                {/* Submit Button */}

                <div className="text-start">
                    <GenericButton textKey="Link to a Master Ticket" variant="contained" onClick={onLinkToMasterTicketModalOpen} disabled={isMaster} />
                </div>
                <div className="text-end mt-3">
                    <GenericButton textKey="Submit Ticket" variant="contained" type="submit" />
                </div>
            </form>

            {/* Link to Master Ticket Modal */}
            <LinkToMasterTicketModal open={linkToMasterTicketModalOpen} onClose={onLinkToMasterTicketModalClose} />
            {/* Successful Modal */}
            <SuccessfulModal ticketId={createdTicketId ?? ''} open={successfullModalOpen} onClose={onClose} />
        </div>
    )
}

export default RaiseTicket;
