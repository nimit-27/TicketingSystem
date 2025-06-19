import { InputAdornment, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { inputColStyling } from "../../constants/bootstrapClasses";
import { FormProps } from "../../types";
import CustomFormInput from "../UI/Input/CustomFormInput";
import VerifyIconButton from "../UI/IconButton/VerifyIconButton";
import { getEmployeeDetails } from "../../services/EmployeeService";
import { FieldValues, useWatch } from "react-hook-form";
import { useApi } from "../../hooks/useApi";
import { useDebounce } from "../../hooks/useDebounce";
import React, { useEffect, useState } from "react";
import CustomIconButton from "../UI/IconButton/CustomIconButton";
import CustomFieldset from "../CustomFieldset";
import { currentUserDetails, FciTheme, isFciEmployee, isHelpdesk } from "../../config/config";
import DropdownController from "../UI/Dropdown/DropdownController";
import GenericDropdownController from "../UI/Dropdown/GenericDropdownController";
import { DropdownOption } from "../UI/Dropdown/GenericDropdown";
import ViewToggle from "../UI/ViewToggle";

interface RequestorDetailsProps extends FormProps {
    disableAll?: boolean;
}

const FCI_EMPLOYEE = "fci";
const NON_FCI_EMPLOYEE = "nonFci";

type ViewMode = typeof FCI_EMPLOYEE | typeof NON_FCI_EMPLOYEE;

const stakeholderOptions: DropdownOption[] = [
    { label: "Farmer", value: "Farmer" },
    { label: "Miller", value: "Miller" }
];

const RequestorDetails: React.FC<RequestorDetailsProps> = ({ register, errors, setValue, control, disableAll = false, createMode }) => {
    const [verified, setVerified] = useState<boolean>(false);
    const [disabled, setDisabled] = useState<boolean>(false);
    const [viewMode, setViewMode] = useState<ViewMode>("nonFci");

    const isDisabled = disableAll || disabled;

    const { data, pending, success, apiHandler: getEmployeeDetailsApiHandler } = useApi<any>();

    const employeeId = useWatch({ control, name: 'employeeId' });
    const office = useWatch({ control, name: 'office' });
    const mobileNo = useWatch({ control, name: 'mobileNo' });
    const emailId = useWatch({ control, name: 'emailId' });
    const requestorName = useWatch({ control, name: 'requestorName' });
    const stakeholder = useWatch({ control, name: 'stakeholder' });
    const debouncedEmployeeId = useDebounce(employeeId, 500);

    console.log({ stakeholder })

    const getEmployeeDetailsHandler = (employeeId: any) => {
        getEmployeeDetailsApiHandler(() => getEmployeeDetails(employeeId))
    }

    const clearEmployeeDetails = () => {
        if (setValue) {
            setValue("employeeId", "");
            setValue("requestorName", "");
            setValue("emailId", "");
            setValue("mobileNo", "");
            setValue("role", "");
            setValue("office", "");
        }
    }

    const populateEmployeeDetails = (data: any) => {
        if (setValue && data) {
            setValue("requestorName", data.requestorName);
            setValue("emailId", data.emailId);
            setValue("mobileNo", data.mobileNo);
            if (isFciEmployee) {
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
                populateEmployeeDetails(data)
                setDisabled(true)
            }
        } else setVerified(false);
    }, [pending, data]);

    useEffect(() => {
        if (debouncedEmployeeId) {
            setDisabled(true);
            if (disableAll || isFciEmployee) verifyEmployeeById(debouncedEmployeeId);
        } else clearRequestorDetailsForm();

        setVerified(false);
    }, [debouncedEmployeeId]);

    useEffect(() => {
        clearEmployeeDetails()
    }, [viewMode])

    useEffect(() => {
        // Ticket creation by FCI employee - SELF
        if (isFciEmployee && createMode) {
            const fciUser = currentUserDetails as typeof currentUserDetails & { employeeId: string };
            if (setValue && fciUser.employeeId) setValue("employeeId", fciUser.employeeId);
        }
    }, [isFciEmployee, createMode]);

    const verifyEmployeeById = (employeeId: string) => {
        // Logic to verify employee by ID
        getEmployeeDetailsHandler(employeeId)
    };

    const clearRequestorDetailsForm = () => {
        // Allow clearing only while creating
        if (!!setValue && createMode) {
            setValue("requestorName", "");
            setValue("emailId", "");
            setValue("mobileNo", "");
            setValue("employeeId", "");
            setValue("role", "");
            setValue("office", "");
            setValue("stakeholder", "");
        }
        setDisabled(false);
        setVerified(false);
    };

    const showFciToggle = !isFciEmployee;
    const showEmployeeId = viewMode === FCI_EMPLOYEE || isFciEmployee;
    const showRequestorName = true;
    const showEmailId = true;
    const showMobileNo = true;
    const showStakeholder = isHelpdesk && viewMode === "nonFci";
    const showRole = viewMode === FCI_EMPLOYEE || isFciEmployee;
    const showOffice = viewMode === FCI_EMPLOYEE || isFciEmployee;

    const isNonFci = viewMode === NON_FCI_EMPLOYEE && !isFciEmployee;
    const isFciMode = viewMode === FCI_EMPLOYEE || isFciEmployee;

    const isEmployeeIdDisabled = disableAll || isFciEmployee || !createMode; // isFciEmployee true means id will be auto fetched
    const isNameDisabled = isDisabled || isFciEmployee || !createMode;
    const isEmailIdDisabled = isDisabled || isFciEmployee || !createMode;
    const isMobileNoDisabled = isDisabled || isFciEmployee || !createMode;
    const isRoleDisabled = isDisabled || isFciEmployee || !createMode;
    const isOfficeDisabled = isDisabled || isFciEmployee || !createMode;
    const isStakeholderDisabled = false || !createMode;

    const isRequestorOrOnBehalfFci = !createMode && employeeId
    const isRequestorOnBehalfNonFci = !createMode && !employeeId && stakeholder

    return (
        <CustomFieldset title="Requestor Details" className="mb-4">
            {/* Inputs */}
            {!createMode &&
                <div className="row g-3">
                    {isRequestorOrOnBehalfFci && (
                        <div className={`${inputColStyling}`}>
                            <CustomFormInput
                                label="Employee ID"
                                name="employeeId"
                                slotProps={{
                                    inputLabel: { shrink: employeeId },
                                    input: {
                                        endAdornment: !disableAll && (
                                            <InputAdornment position="end">
                                                {(verified || employeeId) && (
                                                    <CustomIconButton icon="Clear" onClick={clearRequestorDetailsForm} disabled={disableAll} />
                                                )}
                                                <VerifyIconButton
                                                    onClick={() => verifyEmployeeById(employeeId)}
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
                                disabled={isEmployeeIdDisabled}
                            />
                        </div>
                    )}
                    {showRequestorName && (
                        <div className={`${inputColStyling}`}>
                            <CustomFormInput
                                slotProps={{
                                    inputLabel: { shrink: requestorName || employeeId }
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
                                    inputLabel: { shrink: emailId || employeeId }
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
                                    inputLabel: { shrink: mobileNo || employeeId }
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
                                    inputLabel: { shrink: employeeId || verified }
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
                {showFciToggle && <div className="col-md-5 px-4 w-100">
                    <ViewToggle
                        value={viewMode}
                        onChange={setViewMode}
                        options={[
                            { label: 'FCI Employee', value: 'fci' },
                            { label: 'Non-FCI Employee', value: 'nonFci' }
                        ]}
                        radio={FciTheme}
                        disabled={disableAll}
                    />
                </div>}
                {showEmployeeId && (
                    <div className={`${inputColStyling}`}>
                        <CustomFormInput
                            label="Employee ID"
                            name="employeeId"
                            slotProps={{
                                inputLabel: { shrink: employeeId },
                                input: {
                                    endAdornment: !disableAll && (
                                        <InputAdornment position="end">
                                            {(verified || employeeId) && (
                                                <CustomIconButton icon="Clear" onClick={clearRequestorDetailsForm} disabled={disableAll} />
                                            )}
                                            <VerifyIconButton
                                                onClick={() => verifyEmployeeById(employeeId)}
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
                            disabled={isEmployeeIdDisabled}
                        />
                    </div>
                )}
                {showRequestorName && (
                    <div className={`${inputColStyling}`}>
                        <CustomFormInput
                            slotProps={{
                                inputLabel: { shrink: requestorName || employeeId }
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
                                inputLabel: { shrink: emailId || employeeId }
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
                                inputLabel: { shrink: mobileNo || employeeId }
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
                                inputLabel: { shrink: employeeId || verified }
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
