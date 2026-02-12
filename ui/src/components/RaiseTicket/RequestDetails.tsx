import { cardContainer1, cardContainer1Header } from "../../constants/bootstrapClasses";
import { DropdownOption } from "../UI/Dropdown/GenericDropdown";
import { FormProps } from "../../types";
import GenericDropdownController from "../UI/Dropdown/GenericDropdownController";
import CustomFormInput from "../UI/Input/CustomFormInput";

const ticketLodgedThroughDropdownOptions: DropdownOption[] = [
    { label: "Self", value: "Self" },
    { label: "Call", value: "Call" },
    { label: "Mail", value: "Mail" }
];

const indiaToday = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
}).format(new Date());

const RequestDetails: React.FC<FormProps> = ({ register, control, errors }) => (
    <div className={`${cardContainer1}`}>
        {/* title */}
        <p className={`${cardContainer1Header}`}>Request Details</p>
        {/* Inputs in a row */}
        <div className="row g-3">
            {/* Ticket ID - Input - System Generated */}
            <div className="col-md-4">
                <CustomFormInput name="ticketId" register={register} required errors={errors} label="Ticket ID" />
            </div>
            {/* Reported Date - Input - System Generated */}
            <div className="col-md-4">
                <CustomFormInput
                    name="reportedDate"
                    register={register}
                    required
                    errors={errors}
                    label="Reported Date"
                    defaultValue={indiaToday}
                    disabled
                />
            </div>
            {/* Ticket Lodged Through - Dropdown - Self/Call/Mail */}
            <div className="col-md-4">
                <GenericDropdownController
                    name="mode"
                    control={control}
                    rules={{ required: true }}

                    label="Mode"
                    options={ticketLodgedThroughDropdownOptions}
                    className="form-select"
                />
            </div>
        </div>
    </div>
);

export default RequestDetails;
