import { cardContainer1, cardContainer1Header } from "../../constants/bootstrapClasses";
import { FormProps } from "../../types";
import { DropdownOption } from "../UI/Dropdown/GenericDropdown";
import GenericDropdownController from "../UI/Dropdown/GenericDropdownController";
import CustomFormInput from "../UI/Input/CustomFormInput";

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

const TicketDetails: React.FC<FormProps> = ({ register, control, errors }) => {
    return (
        <div className={`${cardContainer1}`}>
            {/* Title */}
            <p className={`${cardContainer1Header}`}>Ticket Details</p>
            <div className="row">
                <div className="col-md-4 mb-3">
                    <GenericDropdownController
                        name="category"
                        control={control}
                        label="Category of Ticket"
                        options={categoryOptions}
                        className="form-select"
                    />
                </div>
                <div className="col-md-4 mb-3">
                    <GenericDropdownController
                        name="subCategory"
                        control={control}
                        label="Sub-Category"
                        options={subCategoryOptions}
                        className="form-select"
                    />
                </div>
                <div className="col-md-4 mb-3">
                    <GenericDropdownController
                        name="priority"
                        control={control}
                        label="Priority"
                        options={priorityOptions}
                        className="form-select"
                    />
                </div>
                <div className="col-md-12 mb-3">
                    <CustomFormInput
                        label="Subject"
                        name="subject"
                        register={register}
                        errors={errors}
                        type="text"
                    />
                </div>
                <div className="col-md-12 mb-3">
                    <CustomFormInput
                        label="Description"
                        name="description"
                        register={register}
                        errors={errors}
                        multiline
                        rows={3}
                    />
                </div>
                <div className="col-md-6 d-flex align-items-center">
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
                    />
                </div>
            </div>
        </div>
    )
}

export default TicketDetails;