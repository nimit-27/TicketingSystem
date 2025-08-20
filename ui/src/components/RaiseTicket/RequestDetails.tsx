import { inputColStyling } from "../../constants/bootstrapClasses";
import { FormProps } from "../../types";
import CustomFormInput from "../UI/Input/CustomFormInput";
import { useWatch } from "react-hook-form";
import CustomFieldset from "../CustomFieldset";
import { isHelpdesk } from "../../config/config";
import { checkFieldAccess } from "../../utils/permissions";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import CustomIconButton from "../UI/IconButton/CustomIconButton";
import { useTheme } from "@mui/material/styles";

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
    const showModeField = checkFieldAccess('requestDetails', 'mode');

    const ticketId = useWatch({ control, name: 'ticketId' });
    const mode = useWatch({ control, name: 'mode' });
    const helpdesk = true
    const theme = useTheme();

    useEffect(() => {
        setValue && setValue("mode", "Self");
    }, [setValue]);

    const { t } = useTranslation();
    return (
        <>
            {showModeField && (
                <CustomFieldset variant="basic" title={t('Request Mode')} style={{ width: 'fit-content' }} className="d-flex">
                    <div className="d-flex gap-2">
                        {modeOptions.map(opt => (
                            <div key={opt.value} className="text-center">
                                <CustomIconButton
                                    icon={opt.icon}
                                    onClick={() => setValue && setValue('mode', opt.value)}
                                    disabled={disableAll || !helpdesk}
                                    sx={{ color: mode === opt.value ? theme.palette.secondary.main : theme.palette.primary.main, }}
                                />
                                <div>{t(opt.label)}</div>
                            </div>
                        ))}
                    </div>
                </CustomFieldset>
            )}
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
