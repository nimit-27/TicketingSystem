import { IconButton, InputAdornment, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { inputColStyling } from "../../constants/bootstrapClasses";
import { FormProps } from "../../types";
import CustomFormInput from "../UI/Input/CustomFormInput";
import VerifyIconButton from "../UI/IconButton/VerifyIconButton";
import { getEmployeeDetails } from "../../services/EmployeeService";
import { FieldValues } from "react-hook-form";
import { useApi } from "../../hooks/useApi";
import { useEffect, useState } from "react";
import ClearIcon from '@mui/icons-material/Clear';
import CustomFieldset from "../CustomFieldset";
import { currentUserDetails } from "../../config/config";

interface RequestorDetailsProps extends FormProps {
    formData: FieldValues;
    disableAll?: boolean;
}

const FCI_EMPLOYEE = "fci";
const NON_FCI_EMPLOYEE = "nonFci";

type ViewMode = typeof FCI_EMPLOYEE | typeof NON_FCI_EMPLOYEE;

const RequestorDetails: React.FC<RequestorDetailsProps> = ({ register, errors, setValue, formData, disableAll = false }) => {
    const [verified, setVerified] = useState<boolean>(false);
    const [disabled, setDisabled] = useState<boolean>(false);
    const [viewMode, setViewMode] = useState<ViewMode>("nonFci");

    const isDisabled = disableAll || disabled;

    const { data, error, pending, success, apiHandler } = useApi<any>();

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
        if (formData?.employeeId) {
            setDisabled(true);
            if (disableAll) {
                verifyEmployeeById();
            }
        } else {
            console.log("Employee ID changed, clearing form");
            clearForm();
        }

        setVerified(false);
    }, [formData?.employeeId]);

    const verifyEmployeeById = () => {
        // Logic to verify employee by ID
        console.log("Verifying employee by ID...: ", formData.employeeId);
        apiHandler(() => getEmployeeDetails(formData.employeeId))
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

    const isLoggedInFciEmployee = currentUserDetails?.role?.includes("FCI_EMPLOYEE")
    const showFciToggle = !isLoggedInFciEmployee;
    const showEmployeeId =  viewMode === FCI_EMPLOYEE || isLoggedInFciEmployee;
    const showName = true;
    const showEmailId = true;
    const showMobileNo = true;
    const showRole = viewMode === FCI_EMPLOYEE || isLoggedInFciEmployee;
    const showOffice = viewMode === FCI_EMPLOYEE || isLoggedInFciEmployee;

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
                                inputLabel: { shrink: formData?.employeeId },
                                input: {
                                    endAdornment: !disableAll && (
                                        <InputAdornment position="end">
                                            {(verified || formData?.employeeId) && (
                                                <IconButton onClick={clearForm} disabled={disableAll}>
                                                    <ClearIcon fontSize="small" />
                                                </IconButton>
                                            )}
                                            <VerifyIconButton
                                                onClick={verifyEmployeeById}
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
                            disabled={disableAll}
                        />
                    </div>
                )}
                {showName && (
                    <div className={`${inputColStyling}`}>
                        <CustomFormInput
                            slotProps={{
                                inputLabel: { shrink: formData?.employeeId || verified }
                            }}
                            label="Name"
                            name="name"
                            register={register}
                            errors={errors}
                            disabled={isDisabled}
                            required
                        />
                    </div>
                )}
                {showEmailId && (
                    <div className={`${inputColStyling}`}>
                        <CustomFormInput
                            slotProps={{
                                inputLabel: { shrink: formData?.employeeId || verified }
                            }}
                            label="Email ID"
                            name="emailId"
                            register={register}
                            errors={errors}
                            disabled={isDisabled}
                            type="email"
                        />
                    </div>
                )}
                {showMobileNo && (
                    <div className={`${inputColStyling}`}>
                        <CustomFormInput
                            slotProps={{
                                inputLabel: { shrink: formData?.employeeId || verified }
                            }}
                            label="Mobile No."
                            name="mobileNo"
                            register={register}
                            errors={errors}
                            disabled={isDisabled}
                            type="tel"
                        />
                    </div>
                )}
                {showRole && (
                    <div className={`${inputColStyling}`}>
                        <CustomFormInput
                            slotProps={{
                                inputLabel: { shrink: formData?.employeeId || verified }
                            }}
                            label="Role"
                            name="role"
                            register={register}
                            errors={errors}
                            disabled={isDisabled}
                        />
                    </div>
                )}
                {showOffice && (
                    <div className={`${inputColStyling}`}>
                        <CustomFormInput
                            slotProps={{
                                inputLabel: { shrink: formData?.office || verified }
                            }}
                            label="Office"
                            name="office"
                            register={register}
                            errors={errors}
                            disabled={isDisabled}
                        />
                    </div>
                )}
            </div>
        </CustomFieldset>
    )
}

export default RequestorDetails;
