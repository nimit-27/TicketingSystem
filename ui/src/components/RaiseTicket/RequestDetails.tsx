import { inputColStyling } from "../../constants/bootstrapClasses";
import { DropdownOption } from "../UI/Dropdown/GenericDropdown";
import { FormProps } from "../../types";
import GenericDropdownController from "../UI/Dropdown/GenericDropdownController";
import CustomFormInput from "../UI/Input/CustomFormInput";
import { FieldValues, useWatch } from "react-hook-form";
import CustomFieldset from "../CustomFieldset";
import { currentUserDetails, isFciEmployee } from "../../config/config";
import React, { useEffect } from "react";

interface RequestDetailsProps extends FormProps {
    disableAll?: boolean;
}

const ticketLodgedThroughDropdownOptions: DropdownOption[] = [
    { label: "Self", value: "Self" },
    { label: "Call", value: "Call" },
    { label: "Mail", value: "Mail" }
];

const RequestDetails: React.FC<RequestDetailsProps> = ({ register, control, errors, setValue, disableAll = false }) => {
    const showTicketId = false;
    const showReportedDate = true;
    const showModeDropdown = true;

    const ticketId = useWatch({ control, name: 'ticketId' });
    const mode = useWatch({ control, name: 'mode' });

    useEffect(() => {
        if (currentUserDetails.role.includes("FCI_EMPLOYEE") && (!mode || mode !== "Self")) {
            setValue && setValue("mode", "Self");
        }
    }, [setValue, mode, currentUserDetails.role]);

    return (
        <CustomFieldset title="Request Details">
            {/* Inputs in a row */}
            <div className="row g-3">
                {/* Ticket ID - Input - System Generated */}
                {showTicketId && (
                    <div className={`${inputColStyling}`}>
                        <CustomFormInput
                            slotProps={{
                                inputLabel: { shrink: ticketId }
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
                            disabled={disableAll || isFciEmployee}
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

export default React.memo(RequestDetails);
