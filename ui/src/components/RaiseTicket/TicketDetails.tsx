import { FieldValues } from "react-hook-form";
import { cardContainer1, cardContainer1Header } from "../../constants/bootstrapClasses";
import { FormProps } from "../../types";
import { DropdownOption } from "../UI/Dropdown/GenericDropdown";
import GenericDropdownController from "../UI/Dropdown/GenericDropdownController";
import CustomFormInput from "../UI/Input/CustomFormInput";
import { Roles } from "../../config/config";

interface TicketDetailsProps extends FormProps {
    formData?: FieldValues;
    disableAll?: boolean;
    subjectDisabled?: boolean;
}

const categoryOptions: DropdownOption[] = [
    { label: "Hardware", value: "hardware" },
    { label: "Software", value: "software" },
    { label: "Network", value: "network" }
];

const subCategoryOptions: DropdownOption[] = [
    { label: "Laptop", value: "laptop" },
    { label: "Desktop", value: "desktop" },
    { label: "Printer", value: "printer" }
];

const priorityOptions: DropdownOption[] = [
    { label: "Low", value: "Low" },
    { label: "Medium", value: "Medium" },
    { label: "High", value: "High" }
];

const statusOptions: DropdownOption[] = [
    { label: "Pending", value: "PENDING" },
    { label: "On Hold", value: "ON_HOLD" },
    { label: "Closed", value: "CLOSED" },
    { label: "Reopened", value: "REOPENED" },
    { label: "Resolved", value: "RESOLVED" },
    { label: "Assign Further", value: "ASSIGN_FURTHER" }
];

const TicketDetails: React.FC<TicketDetailsProps> = ({ register, control, formData, errors, disableAll = false, subjectDisabled = false }) => {
    const currentUserRole = localStorage.getItem('role') || 'L1';

    const assignLevelOptions: DropdownOption[] = Roles.filter(r => r !== "USER").map(r => ({ label: r, value: r }));
    const assignToOptions: DropdownOption[] = assignLevelOptions;
    return (
        <div className={`${cardContainer1}`}>
            {/* Title */}
            <p className={`${cardContainer1Header}`}>Ticket Details</p>
            <div className="row">
                <div className="col-md-6 mb-3">
                    <CustomFormInput
                        name="assignedAtLevel"
                        label="Assigned at Level"
                        register={register}
                        errors={errors}
                        disabled
                    // showLabel
                    />
                </div>
                <div className="col-md-6 mb-3">
                    <CustomFormInput
                        name="assignedTo"
                        label="Assigned to"
                        register={register}
                        errors={errors}
                        disabled
                    // showLabel
                    />
                </div>
                <div className="col-md-4 mb-3">
                    <GenericDropdownController
                        name="category"
                        control={control}
                        label="Category of Ticket"
                        options={categoryOptions}
                        className="form-select"
                        disabled={disableAll}
                    />
                </div>
                <div className="col-md-4 mb-3">
                    <GenericDropdownController
                        name="subCategory"
                        control={control}
                        label="Sub-Category"
                        options={subCategoryOptions}
                        className="form-select"
                        disabled={disableAll}
                    />
                </div>
                <div className="col-md-4 mb-3">
                    <GenericDropdownController
                        name="priority"
                        control={control}
                        label="Priority"
                        options={priorityOptions}
                        className="form-select"
                        disabled={disableAll}
                    />
                </div>
                <div className="col-md-12 mb-3">
                    <CustomFormInput
                        slotProps={{
                            inputLabel: { shrink: formData?.subject }
                        }}
                        label="Subject"
                        name="subject"
                        register={register}
                        errors={errors}
                        type="text"
                        disabled={disableAll || subjectDisabled}
                    />
                </div>
                <div className="col-md-12 mb-3">
                    <CustomFormInput
                        slotProps={{
                            inputLabel: { shrink: formData?.description }
                        }}
                        label="Description"
                        name="description"
                        register={register}
                        errors={errors}
                        multiline
                        rows={3}
                        disabled={disableAll}
                    />
                </div>
                <div className="col-md-6 d-flex align-items-center mb-3">
                    <label htmlFor="attachment" className="form-label me-2 mb-0" style={{ whiteSpace: "nowrap" }}>
                        Attachment
                    </label>
                    <CustomFormInput
                        name="attachment"
                        register={register}
                        errors={errors}
                        type="file"
                        size="medium"
                        className="form-control"
                        inputProps={{ accept: ".jpg,.jpeg,.png,.pdf" }}
                        disabled={disableAll}
                    />
                </div>
                <div className="col-md-6 mb-3">
                </div>
                <div className="col-md-3 mb-3">
                    <GenericDropdownController
                        name="status"
                        control={control}
                        label="Update Status"
                        options={statusOptions}
                        className="form-select"
                    />
                </div>

                {currentUserRole !== 'USER' && formData?.status === 'ASSIGN_FURTHER' && (
                    <>
                        <div className="col-md-4 mb-3 offset-1">
                            <GenericDropdownController
                                name="assignedToLevel"
                                control={control}
                                label="Assign to Level"
                                options={assignLevelOptions}
                                className="form-select"
                            />
                        </div>
                        <div className="col-md-4 mb-3">
                            <GenericDropdownController
                                name="assignedTo"
                                control={control}
                                label="Assign to"
                                options={assignToOptions}
                                className="form-select"
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

export default TicketDetails;
