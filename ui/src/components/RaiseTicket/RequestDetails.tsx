import { inputColStyling } from "../../constants/bootstrapClasses";
import { FormProps } from "../../types";
import CustomFormInput from "../UI/Input/CustomFormInput";
import { useWatch } from "react-hook-form";
import CustomFieldset from "../CustomFieldset";
import { isHelpdesk } from "../../config/config";
import { checkFieldAccess, getFieldChildren } from "../../utils/permissions";
import React, { useEffect } from "react";
import RequestMode from "./RequestMode";

interface RequestDetailsProps extends FormProps {
    disableAll?: boolean;
    isFieldSetDisabled?: boolean;
}

const modeOptions = [
    { label: "Self", value: "Self", icon: "person" },
    { label: "Call", value: "Call", icon: "call" },
    { label: "Email", value: "Email", icon: "email" }
];

const RequestDetails: React.FC<RequestDetailsProps> = ({ register, control, errors, setValue, disableAll = false, isFieldSetDisabled, createMode }) => {
    const showTicketId = false; // Hide Ticket ID field in create form
    const showReportedDate = checkFieldAccess('requestDetails', 'reportedDate') && !createMode;

    const ticketId = useWatch({ control, name: 'ticketId' });
    const mode = useWatch({ control, name: 'mode' });
    const helpdesk = true

    const modeChildren = getFieldChildren('requestDetails', 'mode') || {};
    const allowedModes = modeOptions.filter(opt => modeChildren?.[opt.value.toLowerCase()]?.show);
    const showModeField = checkFieldAccess('requestDetails', 'mode') && !(allowedModes.length === 1 && allowedModes[0].value === 'Self');

    useEffect(() => {
        if (setValue && allowedModes.length) {
            setValue("mode", allowedModes[0].value);
        }
    }, [setValue, allowedModes.length]);

    const handleModeChange = (value: string) => {
        if (setValue) {
            setValue('mode', value);
        }
    };
    return (
        <>
            <RequestMode
                allowedModes={allowedModes}
                disableAll={disableAll}
                helpdesk={helpdesk}
                mode={mode}
                onModeChange={handleModeChange}
                showModeField={showModeField}
            />
        </>
        // <CustomFieldset title={t('Request Details')} disabled={isFieldSetDisabled}>
        //     {/* Inputs in a row */}
        //     <div className="row g-3">
        //         {/* Ticket ID - Input - System Generated */}
        //         {showTicketId && (
        //             <div className={`${inputColStyling}`}>
        //                 <CustomFormInput
        //                     slotProps={{
        //                         inputLabel: { shrink: ticketId }
        //                     }}
        //                     name="ticketId"
        //                     register={register}
        //                     required
        //                     errors={errors}
        //                     label="Ticket ID"
        //                     disabled={disableAll}
        //                 />
        //             </div>
        //         )}
        //         {/* Reported Date - Input - System Generated */}
        //         {showReportedDate && (
        //             <div className={`${inputColStyling}`}>
        //                 <CustomFormInput
        //                     name="reportedDate"
        //                     register={register}
        //                     required
        //                     errors={errors}
        //                     label="Reported Date"
        //                     disabled
        //                 />
        //             </div>
        //         )}
        //     </div>
        // </CustomFieldset>
    )
};

export default React.memo(RequestDetails);
