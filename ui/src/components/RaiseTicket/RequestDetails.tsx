import { inputColStyling } from "../../constants/bootstrapClasses";
import { FormProps } from "../../types";
import CustomFormInput from "../UI/Input/CustomFormInput";
import { useWatch } from "react-hook-form";
import CustomFieldset from "../CustomFieldset";
import { isHelpdesk } from "../../config/config";
import { checkFieldAccess, getFieldChildren } from "../../utils/permissions";
import React, { useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";
import CustomIconButton from "../UI/IconButton/CustomIconButton";
import { useTheme } from "@mui/material/styles";
import { Radio, RadioGroup, FormControlLabel } from "@mui/material";
import { ThemeModeContext } from "../../context/ThemeContext";

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
    const theme = useTheme();
    const { layout } = useContext(ThemeModeContext);

    const modeChildren = getFieldChildren('requestDetails', 'mode') || {};
    const allowedModes = modeOptions.filter(opt => modeChildren?.[opt.value.toLowerCase()]?.show);
    const showModeField = checkFieldAccess('requestDetails', 'mode') && !(allowedModes.length === 1 && allowedModes[0].value === 'Self');

    useEffect(() => {
        if (setValue && allowedModes.length) {
            setValue("mode", allowedModes[0].value);
        }
    }, [setValue, allowedModes.length]);

    const { t } = useTranslation();

    const handleModeChange = (value: string) => {
        if (setValue) {
            setValue('mode', value);
        }
    };
    return (
        <>
            {showModeField && (
                <div
                    className={`px-4 border rounded-2 mb-4 ${layout === 1 ? 'py-3' : 'py-1 d-flex gap-4 align-items-center'}`}
                    style={{ width: 'fit-content' }}
                >
                    <span className={`text-muted fs-6 ${layout === 1 ? 'd-block mb-2' : ''}`}>{t('Request Mode')}</span>
                    {layout === 1 ? (
                        <RadioGroup
                            row
                            value={mode || allowedModes[0]?.value || ''}
                            onChange={event => handleModeChange(event.target.value)}
                            sx={{ display: 'flex', gap: 2 }}
                        >
                            {allowedModes.map(opt => (
                                <FormControlLabel
                                    key={opt.value}
                                    value={opt.value}
                                    control={(
                                        <Radio
                                            disabled={disableAll || !helpdesk}
                                            sx={{
                                                color: theme.palette.sidebar.background,
                                                '&.Mui-checked': { color: theme.palette.sidebar.background }
                                            }}
                                        />
                                    )}
                                    label={t(opt.label)}
                                />
                            ))}
                        </RadioGroup>
                    ) : (
                        allowedModes.map(opt => (
                            <div
                                key={opt.value}
                                onClick={() => handleModeChange(opt.value)}
                                style={{ cursor: 'pointer' }}
                                className="text-center"
                            >
                                <CustomIconButton
                                    className="p-0 m-0 ts-20"
                                    icon={opt.icon}
                                    disabled={disableAll || !helpdesk}
                                    sx={{ color: mode === opt.value ? theme.palette.secondary.main : theme.palette.primary.main }}
                                />
                                <p className="p-0 m-0 ts-14" style={{ color: mode === opt.value ? theme.palette.secondary.main : theme.palette.primary.main }}>{t(opt.label)}</p>
                            </div>
                        ))
                    )}
                </div>
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
