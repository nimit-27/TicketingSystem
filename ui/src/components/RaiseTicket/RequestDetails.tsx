import { inputColStyling } from "../../constants/bootstrapClasses";
import { DropdownOption } from "../UI/Dropdown/GenericDropdown";
import { FormProps } from "../../types";
import GenericDropdownController from "../UI/Dropdown/GenericDropdownController";
import CustomFormInput from "../UI/Input/CustomFormInput";
import { FieldValues } from "react-hook-form";
import CustomFieldset from "../CustomFieldset";

interface RequestDetailsProps extends FormProps {
    formData?: FieldValues;
    disableAll?: boolean;
}

const ticketLodgedThroughDropdownOptions: DropdownOption[] = [
    { label: "Self", value: "Self" },
    { label: "Call", value: "Call" },
    { label: "Mail", value: "Mail" }
];

const RequestDetails: React.FC<RequestDetailsProps> = ({ register, control, errors, formData, disableAll = false }) => {
    const showTicketId = false;
    const showReportedDate = true;
    const showModeDropdown = true;

    return (
        <CustomFieldset title="Request Details">
            {/* Inputs in a row */}
            <div className="row g-3">
                {/* Ticket ID - Input - System Generated */}
                {showTicketId && (
                    <div className={`${inputColStyling}`}>
                        <CustomFormInput
                            slotProps={{
                                inputLabel: { shrink: formData?.ticketId }
                            }}
                            name="ticketId"
                            register={register}
                            required
                            errors={errors}
                            label="Ticket ID"
                            disabled={disableAll}
                        />
                    </div>
                )}
                {/* Ticket Lodged Through - Dropdown - Self/Call/Mail */}
                {showModeDropdown && (
                    <div className={`${inputColStyling}`}>
                        <GenericDropdownController
                            name="mode"
                            control={control}
                            rules={{ required: true }}
                            label="Mode"
                            options={ticketLodgedThroughDropdownOptions}
                            className="form-select"
                            disabled={disableAll}
                        />
                    </div>
                )}
                {/* Reported Date - Input - System Generated */}
                {showReportedDate && (
                    <div className={`${inputColStyling}`}>
                        <CustomFormInput
                            name="reportedDate"
                            register={register}
                            required
                            errors={errors}
                            label="Reported Date"
                            defaultValue={new Date().toISOString().slice(0, 10)}
                            disabled
                        />
                    </div>
                )}
            </div>
        </CustomFieldset>
    )
};

export default RequestDetails;
