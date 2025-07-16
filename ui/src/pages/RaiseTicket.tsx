import { useForm, useWatch } from "react-hook-form";
import RequestDetails from "../components/RaiseTicket/RequestDetails";
import RequestorDetails from "../components/RaiseTicket/RequestorDetails";
import TicketDetails from "../components/RaiseTicket/TicketDetails";
import SuccessfulModal from "../components/RaiseTicket/SuccessfulModal";
import { useState } from "react";
import Title from "../components/Title";
import LinkToMasterTicketModal from "../components/RaiseTicket/LinkToMasterTicketModal";
import GenericButton from "../components/UI/Button";
import { useApi } from "../hooks/useApi";
import { addTicket } from "../services/TicketService";

const RaiseTicket: React.FC<any> = () => {
    const { register, handleSubmit, control, setValue, formState: { errors } } = useForm();
    const { data, pending, error, success, apiHandler } = useApi();

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
            stakeholder
        };

        apiHandler(() => addTicket(payload))
            .then((resp: any) => {
                setCreatedTicketId(resp?.id);
                setSuccessfulModalOpen(true);
            })
    };

    const onClose = () => setSuccessfulModalOpen(false);
    const onLinkToMasterTicketModalClose = () => setLinkToMasterTicketModalOpen(false);
    const onLinkToMasterTicketModalOpen = () => setLinkToMasterTicketModalOpen(true);

    return (
        <div className="container pb-5">
            <Title text="Raise Ticket" />
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