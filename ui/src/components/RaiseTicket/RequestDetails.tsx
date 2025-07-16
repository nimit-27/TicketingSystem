import { inputColStyling } from "../../constants/bootstrapClasses";
import { DropdownOption } from "../UI/Dropdown/GenericDropdown";
import { FormProps } from "../../types";
import GenericDropdownController from "../UI/Dropdown/GenericDropdownController";
import CustomFormInput from "../UI/Input/CustomFormInput";
import { useWatch } from "react-hook-form";
import CustomFieldset from "../CustomFieldset";
import { currentUserDetails, isFciUser, isHelpdesk } from "../../config/config";
import { checkFieldAccess } from "../../utils/permissions";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";

interface RequestDetailsProps extends FormProps {
    disableAll?: boolean;
    isFieldSetDisabled?: boolean;
}

const modeOptions: DropdownOption[] = [
    { label: "Self", value: "Self" },
    { label: "Call", value: "Call" },
    { label: "Email", value: "Email" }
];

const RequestDetails: React.FC<RequestDetailsProps> = ({ register, control, errors, setValue, disableAll = false, isFieldSetDisabled }) => {
    const showTicketId = checkFieldAccess('RequestDetails', 'ticketId');
    const showReportedDate = checkFieldAccess('RequestDetails', 'reportedDate');
    const showModeDropdown = checkFieldAccess('RequestDetails', 'mode');

    const ticketId = useWatch({ control, name: 'ticketId' });
    const mode = useWatch({ control, name: 'mode' });

    useEffect(() => {
        if (!isHelpdesk && (!mode || mode !== "Self")) {
            setValue && setValue("mode", "Self");
        }
    }, [setValue, mode]);

    const { t } = useTranslation();
    return (
        <CustomFieldset title={t('Request Details')} disabled={isFieldSetDisabled}>
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
                            options={modeOptions}
                            className="form-select"
                            disabled={disableAll || !isHelpdesk}
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
