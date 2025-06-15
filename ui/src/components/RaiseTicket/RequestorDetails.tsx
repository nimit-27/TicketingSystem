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
import ClearIcon from '@mui/icons-material/Clear';
import CustomIconButton from "../UI/IconButton/CustomIconButton";
import CustomFieldset from "../CustomFieldset";
import { currentUserDetails, isFciEmployee, isHelpdesk } from "../../config/config";
import DropdownController from "../UI/Dropdown/DropdownController";
import GenericDropdownController from "../UI/Dropdown/GenericDropdownController";
import { DropdownOption } from "../UI/Dropdown/GenericDropdown";

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

const RequestorDetails: React.FC<RequestorDetailsProps> = ({ register, errors, setValue, control, disableAll = false }) => {
    const [verified, setVerified] = useState<boolean>(false);
    const [disabled, setDisabled] = useState<boolean>(false);
    const [viewMode, setViewMode] = useState<ViewMode>("nonFci");

    const isDisabled = disableAll || disabled;

    const { data, pending, success, apiHandler } = useApi<any>();
    const employeeId = useWatch({ control, name: 'employeeId' });
    const office = useWatch({ control, name: 'office' });
    const debouncedEmployeeId = useDebounce(employeeId, 500);

    const clearEmployeeDetails = () => {
        if (setValue) {
            setValue("employeeId", "");
            setValue("name", "");
            setValue("emailId", "");
            setValue("mobileNo", "");
            setValue("role", "");
            setValue("office", "");
        }
    }

    useEffect(() => {
        if (success) {
            setVerified(true);

            if (setValue && data) {
                setValue("name", data.name);
                setValue("emailId", data.emailId);
                setValue("mobileNo", data.mobileNo);
                setValue("role", data.role);
                setValue("office", data.office);
                setDisabled(true)
            }
        } else {
            setVerified(false);
        }
    }, [pending, data]);

    useEffect(() => {
        if (debouncedEmployeeId) {
            setDisabled(true);
            if (disableAll || isFciEmployee) {
                verifyEmployeeById(debouncedEmployeeId);
            }
        } else {
            clearForm();
        }

        setVerified(false);
    }, [debouncedEmployeeId]);

    useEffect(() => {
        if (viewMode === 'nonFci') clearEmployeeDetails()
    }, [viewMode])

    useEffect(() => {
        if (isFciEmployee) {
            const fciUser = currentUserDetails as typeof currentUserDetails & { employeeId: string };
            if (setValue && fciUser.employeeId) setValue("employeeId", fciUser.employeeId);
        }
    }, [isFciEmployee]);

    const verifyEmployeeById = (employeeId: string) => {
        // Logic to verify employee by ID
        apiHandler(() => getEmployeeDetails(employeeId))
    };

    const clearForm = () => {
        if (!!setValue) {
            setValue("employeeId", "");
            setValue("name", "");
            setValue("emailId", "");
            setValue("mobileNo", "");
            setValue("role", "");
            setValue("office", "");
        }
        setDisabled(false);
        setVerified(false);
    };

    const showFciToggle = !isFciEmployee;
    const showEmployeeId = viewMode === FCI_EMPLOYEE || isFciEmployee;
    const showName = true;
    const showEmailId = true;
    const showMobileNo = true;
    const showStakeholder = isHelpdesk && viewMode === "nonFci";
    const showRole = viewMode === FCI_EMPLOYEE || isFciEmployee;
    const showOffice = viewMode === FCI_EMPLOYEE || isFciEmployee;

    const isEmployeeIdDisabled = disableAll || isFciEmployee;
    const isNameDisabled = isDisabled || isFciEmployee;
    const isEmailIdDisabled = isDisabled || isFciEmployee;
    const isMobileNoDisabled = isDisabled || isFciEmployee;
    const isRoleDisabled = isDisabled || isFciEmployee;
    const isOfficeDisabled = isDisabled || isFciEmployee;
    const isStakeholderDisabled = false;

    return (
        <CustomFieldset title="Requestor Details" className="mb-4">
            {/* Inputs */}
            <div className="row g-3">
                {showFciToggle && <div className="col-md-5 px-4 w-100">
                    <ToggleButtonGroup
                        value={viewMode}
                        exclusive
                        onChange={(_, val) => val && setViewMode(val)}
                        size="small"
                    >
                        <ToggleButton value={FCI_EMPLOYEE}>
                            FCI Employee
                        </ToggleButton>
                        <ToggleButton value={NON_FCI_EMPLOYEE}>
                            Non-FCI Employee
                        </ToggleButton>
                    </ToggleButtonGroup>
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
                                                <CustomIconButton icon="Clear" onClick={clearForm} disabled={disableAll} />
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
                            required
                            disabled={isEmployeeIdDisabled}
                        />
                    </div>
                )}
                {showName && (
                    <div className={`${inputColStyling}`}>
                        <CustomFormInput
                            slotProps={{
                                inputLabel: { shrink: employeeId || verified }
                            }}
                            label="Name"
                            name="name"
                            register={register}
                            errors={errors}
                            disabled={isNameDisabled}
                            required
                        />
                    </div>
                )}
                {showEmailId && (
                    <div className={`${inputColStyling}`}>
                        <CustomFormInput
                            slotProps={{
                                inputLabel: { shrink: employeeId || verified }
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
                                inputLabel: { shrink: employeeId || verified }
                            }}
                            label="Mobile No."
                            name="mobileNo"
                            register={register}
                            errors={errors}
                            disabled={isMobileNoDisabled}
                            type="tel"
                        />
                    </div>
                )}
                {showStakeholder && (
                    <div className={`${inputColStyling}`}>
                        <GenericDropdownController
                            // slotProps={{
                            //     inputLabel: { shrink: employeeId || verified }
                            // }}
                            label="Stakeholder"
                            name="stakeholder"
                            control={control}
                            options={stakeholderOptions}
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
            </div>
        </CustomFieldset>
    )
}

export default React.memo(RequestorDetails);
