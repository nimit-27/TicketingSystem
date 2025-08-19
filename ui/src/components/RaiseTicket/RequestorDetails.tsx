import { Autocomplete, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { FieldValues, Controller } from "react-hook-form";
import { cardContainer1, cardContainer1Header } from "../../constants/bootstrapClasses";
import { FormProps } from "../../types";
import CustomFormInput from "../UI/Input/CustomFormInput";
import { searchEmployees } from "../../services/UserService";
import { useApi } from "../../hooks/useApi";

interface RequestorDetailsProps extends FormProps {
    formData: FieldValues;
}

interface EmployeeOption {
    id: string;
    name: string;
    username: string;
    emailId: string;
    mobileNo: string;
    role?: string;
    office?: string;
}

const RequestorDetails: React.FC<RequestorDetailsProps> = ({ register, errors, setValue, control, formData }) => {
    const [options, setOptions] = useState<EmployeeOption[]>([]);
    const [inputValue, setInputValue] = useState<string>("");
    const { pending, apiHandler } = useApi<EmployeeOption[]>();

    useEffect(() => {
        if (!inputValue) {
            setOptions([]);
            return;
        }
        apiHandler(() => searchEmployees(inputValue, formData?.stakeholder)).then((res) => {
            setOptions(res || []);
        });
    }, [inputValue, formData?.stakeholder]);

    const handleSelect = (option: EmployeeOption | null) => {
        if (!option || !setValue) return;
        setValue("employeeId", option.id);
        setValue("name", option.name);
        setValue("username", option.username);
        setValue("emailId", option.emailId);
        setValue("mobileNo", option.mobileNo);
        setValue("role", option.role);
        setValue("office", option.office);
    };

    return (
        <div className={`${cardContainer1}`}>
            {/* Title */}
            <p className={`${cardContainer1Header}`}>Requestor Details</p>
            {/* Inputs */}
            <div className="row g-3">
                <div className="col-md-4">
                    <Controller
                        name="employeeId"
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                            <Autocomplete
                                options={options}
                                value={options.find((o) => o.id === field.value) || null}
                                onChange={(_, value) => {
                                    field.onChange(value ? value.id : "");
                                    handleSelect(value);
                                }}
                                inputValue={inputValue}
                                onInputChange={(_, value) => setInputValue(value)}
                                getOptionLabel={(option) => option.name}
                                renderOption={(props, option) => (
                                    <li {...props}>
                                        <span className="fw-bold me-2">{option.name}</span>
                                        <span className="text-muted">
                                            {option.username} {option.mobileNo} {option.emailId}
                                        </span>
                                    </li>
                                )}
                                loading={pending}
                                renderInput={(params) => (
                                    <TextField {...params} label="Requestor" size="small" />
                                )}
                            />
                        )}
                    />
                </div>
                <div className="col-md-4">
                    <CustomFormInput
                        slotProps={{ inputLabel: { shrink: !!formData?.name } }}
                        label="Name"
                        name="name"
                        register={register}
                        errors={errors}
                        disabled
                        required
                    />
                </div>
                <div className="col-md-4">
                    <CustomFormInput
                        slotProps={{ inputLabel: { shrink: !!formData?.username } }}
                        label="Username"
                        name="username"
                        register={register}
                        errors={errors}
                        disabled
                    />
                </div>
                <div className="col-md-4">
                    <CustomFormInput
                        slotProps={{ inputLabel: { shrink: !!formData?.emailId } }}
                        label="Email ID"
                        name="emailId"
                        register={register}
                        errors={errors}
                        disabled
                        type="email"
                    />
                </div>
                <div className="col-md-4">
                    <CustomFormInput
                        slotProps={{ inputLabel: { shrink: !!formData?.mobileNo } }}
                        label="Mobile No."
                        name="mobileNo"
                        register={register}
                        errors={errors}
                        disabled
                        type="tel"
                    />
                </div>
                <div className="col-md-4">
                    <CustomFormInput
                        slotProps={{ inputLabel: { shrink: !!formData?.role } }}
                        label="Role"
                        name="role"
                        register={register}
                        errors={errors}
                        disabled
                    />
                </div>
                <div className="col-md-4">
                    <CustomFormInput
                        slotProps={{ inputLabel: { shrink: !!formData?.office } }}
                        label="Office"
                        name="office"
                        register={register}
                        errors={errors}
                        disabled
                    />
                </div>
            </div>
        </div>
    );
};

export default RequestorDetails;
