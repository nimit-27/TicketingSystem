import { Checkbox, FormControlLabel, InputAdornment, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { inputColStyling } from "../../constants/bootstrapClasses";
import { FormProps } from "../../types";
import CustomFormInput from "../UI/Input/CustomFormInput";
import VerifyIconButton from "../UI/IconButton/VerifyIconButton";
import { getUserDetails } from "../../services/UserService";
import { FieldValues, useWatch } from "react-hook-form";
import { useApi } from "../../hooks/useApi";
import { useDebounce } from "../../hooks/useDebounce";
import React, { useEffect, useState } from "react";
import CustomIconButton from "../UI/IconButton/CustomIconButton";
import CustomFieldset from "../CustomFieldset";
import { getCurrentUserDetails, FciTheme, isFciUser, isHelpdesk } from "../../config/config";
import DropdownController from "../UI/Dropdown/DropdownController";
import GenericDropdownController from "../UI/Dropdown/GenericDropdownController";
import { DropdownOption } from "../UI/Dropdown/GenericDropdown";
import ViewToggle from "../UI/ViewToggle";
import { useTranslation } from "react-i18next";

interface RequestorDetailsProps extends FormProps {
    disableAll?: boolean;
}

const FCI_User = "fci";
const NON_FCI_User = "nonFci";

type ViewMode = typeof FCI_User | typeof NON_FCI_User;

const stakeholderOptions: DropdownOption[] = [
    { label: "Farmer", value: "Farmer" },
    { label: "Miller", value: "Miller" }
];

const RequestorDetails: React.FC<RequestorDetailsProps> = ({ register, errors, setValue, control, disableAll = false, createMode }) => {
    const [verified, setVerified] = useState<boolean>(false);
    const [disabled, setDisabled] = useState<boolean>(false);
    const [viewMode, setViewMode] = useState<ViewMode>("nonFci");
    const { t } = useTranslation();

    const fciUser = isFciUser();
    const helpdesk = isHelpdesk();

    const isDisabled = disableAll || disabled;

    const { data, pending, success, apiHandler: getUserDetailsApiHandler } = useApi<any>();

    const userId = useWatch({ control, name: 'userId' });
    const mode = useWatch({ control, name: 'mode' });
    const onBehalfFciUser = useWatch({ control, name: 'onBehalfFciUser' });
    const office = useWatch({ control, name: 'office' });
    const mobileNo = useWatch({ control, name: 'mobileNo' });
    const emailId = useWatch({ control, name: 'emailId' });
    const requestorName = useWatch({ control, name: 'requestorName' });
    const stakeholder = useWatch({ control, name: 'stakeholder' });
    const debouncedUserId = useDebounce(userId, 500);

    console.log({ stakeholder })

    const getUserDetailsHandler = (userId: any) => {
        getUserDetailsApiHandler(() => getUserDetails(userId))
    }

    const clearUserDetails = () => {
        if (setValue) {
            setValue("userId", "");
            setValue("requestorName", "");
            setValue("emailId", "");
            setValue("mobileNo", "");
            setValue("role", "");
            setValue("office", "");
        }
    }

    const populateUserDetails = (data: any) => {
        if (setValue && data) {
            setValue("requestorName", data.requestorName);
            setValue("emailId", data.emailId);
            setValue("mobileNo", data.mobileNo);
            if (fciUser) {
                setValue("role", data.role);
                setValue("office", data.office);
            } else {
                setValue("stakeholder", data.stakeholder)
            }
        }
    }

    useEffect(() => {
        if (success) {
            setVerified(true);
            if (setValue && data) {
                populateUserDetails(data)
                setDisabled(true)
            }
        } else setVerified(false);
    }, [pending, data]);

    useEffect(() => {
        if (debouncedUserId) {
            setDisabled(true);
            if (disableAll || fciUser) verifyUserById(debouncedUserId);
        } else clearRequestorDetailsForm();

        setVerified(false);
    }, [debouncedUserId]);

    useEffect(() => {
        clearUserDetails()
    }, [viewMode, onBehalfFciUser])

    useEffect(() => {
        // Ticket creation by FCI user - SELF
        if (fciUser && createMode) {
            const user = getCurrentUserDetails();
            if (setValue && user.userId) setValue("userId", user.userId);
        }
        if (helpdesk && mode === 'Self' && createMode) {
            const hdUser = getCurrentUserDetails();
            if (setValue && hdUser.userId) {
                setValue('userId', hdUser.userId);
                verifyUserById(hdUser.userId);
            }
        }
    }, [fciUser, helpdesk, mode, createMode]);

    const verifyUserById = (userId: string) => {
        // Logic to verify user by ID
        getUserDetailsHandler(userId)
    };

    const clearRequestorDetailsForm = () => {
        // Allow clearing only while creating
        if (!!setValue && createMode) {
            setValue("requestorName", "");
            setValue("emailId", "");
            setValue("mobileNo", "");
            setValue("userId", "");
            setValue("role", "");
            setValue("office", "");
            setValue("stakeholder", "");
        }
        setDisabled(false);
        setVerified(false);
    };

    const isSelfHelpdesk = helpdesk && mode === 'Self';

    const showOnBehalfCheckbox = helpdesk && createMode && mode !== 'Self';

    const showFciToggle = !fciUser && !helpdesk;
    const showUserId =
        viewMode === FCI_User || fciUser || onBehalfFciUser || isSelfHelpdesk;
    const userIdLabel = isSelfHelpdesk ? 'User ID' : 'Employee ID';
    const showRequestorName = true;
    const showEmailId = true;
    const showMobileNo = true;
    const showStakeholder =
        !onBehalfFciUser &&
        !isSelfHelpdesk &&
        viewMode === 'nonFci' &&
        !fciUser;
    const showRole =
        viewMode === FCI_User || fciUser || onBehalfFciUser || isSelfHelpdesk;
    const showOffice =
        (viewMode === FCI_User || fciUser || onBehalfFciUser) && !isSelfHelpdesk;

    const isNonFci =
        viewMode === NON_FCI_User && !fciUser && !onBehalfFciUser && !isSelfHelpdesk;
    const isFciMode =
        viewMode === FCI_User || fciUser || onBehalfFciUser || isSelfHelpdesk;

    const isUserIdDisabled =
        disableAll || fciUser || isSelfHelpdesk || !createMode;
    const isNameDisabled = isDisabled || fciUser || isSelfHelpdesk || !createMode;
    const isEmailIdDisabled = isDisabled || fciUser || isSelfHelpdesk || !createMode;
    const isMobileNoDisabled = isDisabled || fciUser || isSelfHelpdesk || !createMode;
    const isRoleDisabled = isDisabled || fciUser || isSelfHelpdesk || !createMode;
    const isOfficeDisabled = isDisabled || fciUser || isSelfHelpdesk || !createMode;
    const isStakeholderDisabled = false || !createMode;

    const isRequestorOrOnBehalfFci = !createMode && userId
    const isRequestorOnBehalfNonFci = !createMode && !userId && stakeholder

    return (
        <CustomFieldset title={t('Requestor Details')} className="mb-4">
            {/* Inputs */}
            {!createMode &&
                <div className="row g-3">
                    {isRequestorOrOnBehalfFci && (
                        <div className={`${inputColStyling}`}>
                            <CustomFormInput
                                label={userIdLabel}
                                name="userId"
                                slotProps={{
                                    inputLabel: { shrink: userId },
                                    input: {
                                        endAdornment: !disableAll && (
                                            <InputAdornment position="end">
                                                {(verified || userId) && (
                                                    <CustomIconButton icon="Clear" onClick={clearRequestorDetailsForm} disabled={disableAll} />
                                                )}
                                                <VerifyIconButton
                                                    onClick={() => verifyUserById(userId)}
                                                    pending={pending}
                                                    verified={verified}
                                                    disabled={!createMode}
                                                />
                                            </InputAdornment>
                                        )
                                    }
                                }}
                                register={register}
                                errors={errors}
                                disabled={isUserIdDisabled}
                            />
                        </div>
                    )}
                    {showRequestorName && (
                        <div className={`${inputColStyling}`}>
                            <CustomFormInput
                                slotProps={{
                                    inputLabel: { shrink: requestorName || userId }
                                }}
                                label="Name"
                                name="requestorName"
                                register={register}
                                errors={errors}
                                disabled={!createMode}
                            />
                        </div>
                    )}
                    {true && (
                        <div className={`${inputColStyling}`}>
                            <CustomFormInput
                                slotProps={{
                                    inputLabel: { shrink: emailId || userId }
                                }}
                                label="Email ID"
                                name="emailId"
                                register={register}
                                errors={errors}
                                disabled={!createMode}
                            />
                        </div>
                    )}
                    {true && (
                        <div className={`${inputColStyling}`}>
                            <CustomFormInput
                                slotProps={{
                                    inputLabel: { shrink: mobileNo || userId }
                                }}
                                label="Mobile No."
                                name="mobileNo"
                                register={register}
                                errors={errors}
                                disabled={isMobileNoDisabled}
                                type="tel"
                                required={!createMode}
                            />
                        </div>
                    )}
                    {isRequestorOnBehalfNonFci && (
                        <div className={`${inputColStyling}`}>
                            <GenericDropdownController
                                label="Stakeholder"
                                name="stakeholder"
                                control={control}
                                options={stakeholderOptions}
                                rules={{ required: isNonFci ? 'Please select Stakeholder' : false }}
                                className="form-select"
                                disabled={!createMode}
                            />
                        </div>
                    )}
                    {isRequestorOrOnBehalfFci && (
                        <div className={`${inputColStyling}`}>
                            <CustomFormInput
                                slotProps={{
                                    inputLabel: { shrink: userId || verified }
                                }}
                                label="Role"
                                name="role"
                                register={register}
                                errors={errors}
                                disabled={!createMode}
                            />
                        </div>
                    )}
                    {isRequestorOrOnBehalfFci && (
                        <div className={`${inputColStyling}`}>
                            <CustomFormInput
                                slotProps={{
                                    inputLabel: { shrink: office || verified }
                                }}
                                label="Office"
                                name="office"
                                register={register}
                                errors={errors}
                                disabled={!createMode}
                            />
                        </div>
                    )}
                </div>
            }
            {createMode && <div className="row g-3">
                {showOnBehalfCheckbox && (
                    <div className="col-md-12 mb-3 px-4">
                        <FormControlLabel
                            control={<Checkbox {...register('onBehalfFciUser')} />}
                            label={t('On behalf of FCI User')}
                        />
                    </div>
                )}
                {showFciToggle && <div className="col-md-5 px-4 w-100">
                    <ViewToggle
                        value={viewMode}
                        onChange={setViewMode}
                        options={[
                            { label: t('FCI User'), value: 'fci' },
                            { label: t('Non-FCI User'), value: 'nonFci' }
                        ]}
                        radio={FciTheme}
                        disabled={disableAll}
                    />
                </div>}
                {showUserId && (
                    <div className={`${inputColStyling}`}>
                        <CustomFormInput
                            label={userIdLabel}
                            name="userId"
                            slotProps={{
                                inputLabel: { shrink: userId },
                                input: {
                                    endAdornment: !disableAll && (
                                        <InputAdornment position="end">
                                            {(verified || userId) && (
                                                <CustomIconButton icon="Clear" onClick={clearRequestorDetailsForm} disabled={disableAll} />
                                            )}
                                            <VerifyIconButton
                                                onClick={() => verifyUserById(userId)}
                                                pending={pending}
                                                verified={verified}
                                                disabled={disableAll}
                                            />
                                        </InputAdornment>
                                    )
                                }
                            }}
                            register={register}
                            errors={errors}
                            required={isFciMode}
                            disabled={isUserIdDisabled}
                        />
                    </div>
                )}
                {showRequestorName && (
                    <div className={`${inputColStyling}`}>
                        <CustomFormInput
                            slotProps={{
                                inputLabel: { shrink: requestorName || userId }
                            }}
                            label="Name"
                            name="requestorName"
                            register={register}
                            errors={errors}
                            disabled={isNameDisabled}
                            required={isNonFci}
                        />
                    </div>
                )}
                {showEmailId && (
                    <div className={`${inputColStyling}`}>
                        <CustomFormInput
                            slotProps={{
                                inputLabel: { shrink: emailId || userId }
                            }}
                            label="Email ID"
                            name="emailId"
                            register={register}
                            errors={errors}
                            disabled={isEmailIdDisabled}
                            type="email"
                        />
                    </div>
                )}
                {showMobileNo && (
                    <div className={`${inputColStyling}`}>
                        <CustomFormInput
                            slotProps={{
                                inputLabel: { shrink: mobileNo || userId }
                            }}
                            label="Mobile No."
                            name="mobileNo"
                            register={register}
                            errors={errors}
                            disabled={isMobileNoDisabled}
                            type="tel"
                            required={isNonFci}
                        />
                    </div>
                )}
                {showStakeholder && (
                    <div className={`${inputColStyling}`}>
                        <GenericDropdownController
                            label="Stakeholder"
                            name="stakeholder"
                            control={control}
                            options={stakeholderOptions}
                            rules={{ required: isNonFci ? 'Please select Stakeholder' : false }}
                            className="form-select"
                            disabled={isStakeholderDisabled}
                        />
                    </div>
                )}
                {showRole && (
                    <div className={`${inputColStyling}`}>
                        <CustomFormInput
                            slotProps={{
                                inputLabel: { shrink: userId || verified }
                            }}
                            label="Role"
                            name="role"
                            register={register}
                            errors={errors}
                            disabled={isRoleDisabled}
                        />
                    </div>
                )}
                {showOffice && (
                    <div className={`${inputColStyling}`}>
                        <CustomFormInput
                            slotProps={{
                                inputLabel: { shrink: office || verified }
                            }}
                            label="Office"
                            name="office"
                            register={register}
                            errors={errors}
                            disabled={isOfficeDisabled}
                        />
                    </div>
                )}
            </div>}
        </CustomFieldset>
    )
}

export default React.memo(RequestorDetails);
