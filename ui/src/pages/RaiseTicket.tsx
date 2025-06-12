import { useForm } from "react-hook-form";
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
    const { register, handleSubmit, control, setValue, formState: { errors }, watch } = useForm();
    const { data, pending, error, success, apiHandler } = useApi();

    // Get all form values
    const formData = watch();

    const [successfullModalOpen, setSuccessfulModalOpen] = useState(false);
    const [linkToMasterTicketModalOpen, setLinkToMasterTicketModalOpen] = useState(false);


    const onSubmit = (data: any) => {
        console.log("data", data);
        // Handle form submission logic here

        apiHandler(() => addTicket(data))
            .then((response) => {
                console.log("Ticket added successfully:", response);
                setSuccessfulModalOpen(true);
            })

    };

    const onClose = () => setSuccessfulModalOpen(false);
    const onLinkToMasterTicketModalClose = () => setLinkToMasterTicketModalOpen(false);
    const onLinkToMasterTicketModalOpen = () => setLinkToMasterTicketModalOpen(true);

    return (
        <div className="container">
            <Title text="Raise Ticket" />
            <form onSubmit={handleSubmit(onSubmit)}>
                {/* Request Details */}
                <RequestDetails register={register} control={control} errors={errors} />
                {/* Requestor Details */}
                <RequestorDetails register={register} control={control} errors={errors} formData={formData} setValue={setValue} />
                {/* Ticket Details */}
                <TicketDetails register={register} control={control} errors={errors} formData={formData} />
                {/* Submit Button */}

                <div className="text-start">
                    <GenericButton textKey="Link to a Master Ticket" variant="contained" onClick={onLinkToMasterTicketModalOpen} disabled={formData.isMaster} />
                </div>
                <div className="text-end mt-3">
                    <GenericButton textKey="Submit Ticket" variant="contained" type="submit" />
                </div>
            </form>

            {/* Link to Master Ticket Modal */}
            <LinkToMasterTicketModal open={linkToMasterTicketModalOpen} onClose={onLinkToMasterTicketModalClose} />
            {/* Successful Modal */}
            <SuccessfulModal ticketId={"ABC"} open={successfullModalOpen} onClose={onClose} />
        </div>
    )
}

export default RaiseTicket;