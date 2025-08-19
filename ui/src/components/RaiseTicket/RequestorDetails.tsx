import { Icon, IconButton, InputAdornment } from "@mui/material";
import { cardContainer1, cardContainer1Header } from "../../constants/bootstrapClasses";
import { FormProps } from "../../types";
import CustomFormInput from "../UI/Input/CustomFormInput";
import VerifyIconButton from "../UI/IconButton/VerifyIconButton";
import { getEmployeeDetails } from "../../services/UserService";
import { FieldValues } from "react-hook-form";
import { useApi } from "../../hooks/useApi";
import { useEffect, useState } from "react";
import ClearIcon from '@mui/icons-material/Clear';

interface RequestorDetailsProps extends FormProps {
    formData: FieldValues;
}

const RequestorDetails: React.FC<RequestorDetailsProps> = ({ register, errors, setValue, formData }) => {
    const [verified, setVerified] = useState<boolean>(false);
    const [disabled, setDisabled] = useState<boolean>(false);

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
        formData?.employeeId ? setDisabled(true) : clearForm();

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

    return (
        <div className={`${cardContainer1}`}>
            {/* Title */}
            <p className={`${cardContainer1Header}`}>Requestor Details</p>
            {/* Inputs */}
            <div className="row g-3">
                <div className="col-md-4">
                    <CustomFormInput
                        label="Employee ID"
                        name="employeeId"
                        slotProps={{
                            input: {
                                endAdornment: <InputAdornment position="end">
                                    {(verified || formData?.employeeId) && <IconButton onClick={clearForm}>
                                        <ClearIcon fontSize="small" />
                                    </IconButton>}
                                    <VerifyIconButton
                                        onClick={verifyEmployeeById}
                                        pending={pending}
                                        verified={verified} />
                                </InputAdornment>
                            }
                        }}
                        register={register}
                        errors={errors}
                        required
                    />
                </div>
                <div className="col-md-4">
                    <CustomFormInput
                        slotProps={{
                            inputLabel: { shrink: formData?.employeeId || verified }
                        }}
                        label="Name"
                        name="name"
                        register={register}
                        errors={errors}
                        disabled={disabled}
                        required
                    />
                </div>
                <div className="col-md-4">
                    <CustomFormInput
                        slotProps={{
                            inputLabel: { shrink: formData?.employeeId || verified }
                        }}
                        label="Email ID"
                        name="emailId"
                        register={register}
                        errors={errors}
                        disabled={disabled}
                        type="email"
                    />
                </div>
                <div className="col-md-4">
                    <CustomFormInput
                        slotProps={{
                            inputLabel: { shrink: formData?.employeeId || verified }
                        }}
                        label="Mobile No."
                        name="mobileNo"
                        register={register}
                        errors={errors}
                        disabled={disabled}
                        type="tel"
                    />
                </div>
                <div className="col-md-4">
                    <CustomFormInput
                        slotProps={{
                            inputLabel: { shrink: formData?.employeeId || verified }
                        }}
                        label="Role"
                        name="role"
                        register={register}
                        errors={errors}
                        disabled={disabled}
                    />
                </div>
                <div className="col-md-4">
                    <CustomFormInput
                        slotProps={{
                            inputLabel: { shrink: formData?.office || verified }
                        }}
                        label="Office"
                        name="office"
                        register={register}
                        errors={errors}
                        disabled={disabled}
                    />
                </div>
            </div>
        </div>
    )
}

export default RequestorDetails;