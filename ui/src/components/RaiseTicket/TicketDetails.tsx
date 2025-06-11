import { FieldValues } from "react-hook-form";
import { FormProps } from "../../types";
import { DropdownOption } from "../UI/Dropdown/GenericDropdown";
import GenericDropdownController from "../UI/Dropdown/GenericDropdownController";
import CustomFormInput from "../UI/Input/CustomFormInput";
import CustomFieldset from "../CustomFieldset";
import { useApi } from "../../hooks/useApi";
import { useEffect } from "react";
import { getAllEmployeesByLevel, getAllLevels } from "../../services/LevelService";
import { getCategories, getSubCategories } from "../../services/CategoryService";

interface TicketDetailsProps extends FormProps {
    formData?: FieldValues;
    disableAll?: boolean;
    subjectDisabled?: boolean;
    actionElement?: React.ReactNode;
}

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

const getDropdownOptions = <T,>(arr: any, labelKey: keyof T, valueKey: keyof T): DropdownOption[] =>
    Array.isArray(arr)
        ? arr.map(item => ({
            label: String(item[labelKey]),
            value: item[valueKey]
        }))
        : [];

const TicketDetails: React.FC<TicketDetailsProps> = ({ register, control, formData, errors, disableAll = false, subjectDisabled = false, actionElement }) => {
    const currentUserRole = localStorage.getItem('role') || 'L1';

    const { data: allLevels, pending: isLevelsLoading, error: levelsError, apiHandler: getAllLevelApiHandler } = useApi();
    const { data: allEmployeesByLevel, pending, error, apiHandler: getAllEmployeesByLevelHandler } = useApi();
    const { data: allCategories, pending: isCategoriesLoading, error: categoriesError, apiHandler: getCategoriesApiHandler } = useApi();
    const { data: allSubCategories, pending: isSubCategoriesLoading, error: subCategoriesError, apiHandler: getSubCategoriesApiHandler } = useApi();

    const assignLevelOptions: DropdownOption[] = getDropdownOptions(allLevels, 'levelName', 'levelId');
    const assignToOptions: DropdownOption[] = getDropdownOptions(allEmployeesByLevel, 'name', 'employeeId');
    const categoryOptions: DropdownOption[] = getDropdownOptions(allCategories, 'category', 'categoryId');
    const subCategoryOptions: DropdownOption[] = getDropdownOptions(allSubCategories, 'name', 'subCategoryId');

    useEffect(() => {
        getAllLevelApiHandler(() => getAllLevels())
    }, [])

    useEffect(() => {
        formData?.assignedToLevel && getAllEmployeesByLevelHandler(() => getAllEmployeesByLevel(formData.assignedToLevel))
    }, [formData?.assignedToLevel])

    useEffect(() => {
        getCategoriesApiHandler(() => getCategories())
    }, [])

    useEffect(() => {
        formData?.category && getSubCategoriesApiHandler(() => getSubCategories(formData.category))
    }, [formData?.category])

    return (
        <CustomFieldset title="Ticket Details" actionElement={actionElement}>
            <div className="row">
                <div className="col-md-6 mb-3 px-4">
                    <CustomFormInput
                        name="assignedAtLevel"
                        label="Assigned at Level"
                        register={register}
                        errors={errors}
                        disabled
                    />
                </div>
                <div className="col-md-6 mb-3 px-4">
                    <CustomFormInput
                        name="assignedTo"
                        label="Assigned to"
                        register={register}
                        errors={errors}
                        disabled
                        />
                </div>
                <div className="col-md-4 mb-3 px-4">
                    <GenericDropdownController
                        name="category"
                        control={control}
                        label="Category of Ticket"
                        options={categoryOptions}
                        className="form-select"
                        disabled={disableAll}
                    />
                </div>
                <div className="col-md-4 mb-3 px-4">
                    <GenericDropdownController
                        name="subCategory"
                        control={control}
                        label="Sub-Category"
                        options={subCategoryOptions}
                        className="form-select"
                        disabled={disableAll || !formData?.category}
                    />
                </div>
                <div className="col-md-4 mb-3 px-4">
                    <GenericDropdownController
                        name="priority"
                        control={control}
                        label="Priority"
                        options={priorityOptions}
                        className="form-select"
                        disabled={disableAll}
                    />
                </div>
                <div className="col-md-12 mb-3 px-4">
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
                <div className="col-md-12 mb-3 px-4">
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
                <div className="col-md-6 d-flex align-items-center mb-3 px-4">
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
                <div className="col-md-3 mb-3 px-4">
                    <GenericDropdownController
                        name="status"
                        control={control}
                        label="Update Status"
                        options={statusOptions}
                        className="form-select"
                    />
                </div>
                <div className="col-md-4 mb-3 offset-1 px-4">
                    <GenericDropdownController
                        name="assignedToLevel"
                        control={control}
                        label="Assign to Level"
                        options={assignLevelOptions}
                        className="form-select"
                    />
                </div>
                <div className="col-md-4 mb-3 px-4">
                    <GenericDropdownController
                        name="assignedTo"
                        control={control}
                        label="Assign to"
                        options={assignToOptions}
                        className="form-select"
                    />
                </div>
                {currentUserRole !== 'USER' && formData?.status === 'ASSIGN_FURTHER' && (
                    <>
                    </>
                )}
            </div>
        </CustomFieldset>
    )
}

export default TicketDetails;
