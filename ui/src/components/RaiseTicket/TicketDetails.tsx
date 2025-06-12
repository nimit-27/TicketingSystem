import { FieldValues } from "react-hook-form";
import { FormProps } from "../../types";
import { DropdownOption } from "../UI/Dropdown/GenericDropdown";
import GenericDropdownController from "../UI/Dropdown/GenericDropdownController";
import CustomFormInput from "../UI/Input/CustomFormInput";
import CustomFieldset from "../CustomFieldset";
import { useApi } from "../../hooks/useApi";
import { useEffect, useState } from "react";
import { Checkbox, FormControlLabel } from "@mui/material";
import { getAllEmployeesByLevel, getAllLevels } from "../../services/LevelService";
import { getCategories, getSubCategories } from "../../services/CategoryService";
import { currentUserDetails } from "../../config/config";

interface TicketDetailsProps extends FormProps {
    formData?: FieldValues;
    disableAll?: boolean;
    subjectDisabled?: boolean;
    actionElement?: React.ReactNode;
    showSeverityFields?: boolean;
}

const priorityOptions: DropdownOption[] = [
    { label: "Low", value: "Low" },
    { label: "Medium", value: "Medium" },
    { label: "High", value: "High" }
];

const severityOptions: DropdownOption[] = [
    { label: "CRITICAL", value: "CRITICAL" },
    { label: "HIGH", value: "HIGH" },
    { label: "MEDIUM", value: "MEDIUM" },
    { label: "LOW", value: "LOW" }
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

const TicketDetails: React.FC<TicketDetailsProps> = ({ register, control, formData, errors, disableAll = false, subjectDisabled = false, actionElement, showSeverityFields = false }) => {

    const { data: allLevels, pending: isLevelsLoading, error: levelsError, apiHandler: getAllLevelApiHandler } = useApi();
    const { data: allEmployeesByLevel, pending, error, apiHandler: getAllEmployeesByLevelHandler } = useApi();
    const { data: allCategories, pending: isCategoriesLoading, error: categoriesError, apiHandler: getCategoriesApiHandler } = useApi();
    const { data: allSubCategories, pending: isSubCategoriesLoading, error: subCategoriesError, apiHandler: getSubCategoriesApiHandler } = useApi();

    const assignLevelOptions: DropdownOption[] = getDropdownOptions(allLevels, 'levelName', 'levelId');
    const assignToOptions: DropdownOption[] = getDropdownOptions(allEmployeesByLevel, 'name', 'employeeId');
    const categoryOptions: DropdownOption[] = getDropdownOptions(allCategories, 'category', 'categoryId');
    const subCategoryOptions: DropdownOption[] = getDropdownOptions(allSubCategories, 'name', 'subCategoryId');
    const [assignFurther, setAssignFurther] = useState<boolean>(false);

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

    useEffect(() => {
        // Set assignedBy to current userId from localStorage if available
        if (register && typeof register === 'function') {
            register('assignedBy', { value: localStorage.getItem('userId') || currentUserDetails?.userId || 'john.doe' });
        }
    }, [register]);

    console.log({ role: currentUserDetails?.role, status: formData?.status })

    return (
        <CustomFieldset title="Ticket Details" actionElement={actionElement}>
            <div className="row">
                <div className="col-md-6 mb-3 px-4">
                    <CustomFormInput
                        name="assignedToLevel"
                        label="Assigned To Level"
                        slotProps={{
                            inputLabel: { shrink: formData?.subject }
                        }}
                        register={register}
                        errors={errors}
                        disabled
                    />
                </div>
                <div className="col-md-6 mb-3 px-4">
                    <CustomFormInput
                        name="assignedTo"
                        label="Assigned to"
                        slotProps={{
                            inputLabel: { shrink: formData?.subject }
                        }}
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
                {showSeverityFields && currentUserDetails?.role === 'RNO' && (
                    <>
                        <div className="col-md-4 mb-3 px-4">
                            <CustomFormInput
                                name="severity"
                                label="Severity"
                                register={register}
                                errors={errors}
                                disabled
                            />
                        </div>
                        <div className="col-md-4 mb-3 px-4">
                            <GenericDropdownController
                                name="recommendedSeverity"
                                control={control}
                                label="Recommend Severity"
                                options={severityOptions}
                                className="form-select"
                                disabled={disableAll}
                            />
                        </div>
                        <div className="col-md-4 mb-3 px-4">
                            <CustomFormInput
                                name="impact"
                                label="Impact"
                                register={register}
                                errors={errors}
                                disabled={disableAll}
                            />
                        </div>
                    </>
                )}
                <div className="col-md-4 mb-3 px-4 d-flex align-items-center">
                    <FormControlLabel
                        control={<Checkbox {...register('isMaster')} disabled={disableAll} />}
                        label="Mark this ticket as Master"
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
                <div className="col-md-6 mb-3 px-4">
                    <GenericDropdownController
                        name="status"
                        control={control}
                        label="Update Status"
                        options={statusOptions}
                        className="form-select"
                        disabled={disableAll}
                    />
                </div>

                <div className="col-md-6 mb-3 px-4 d-flex align-items-center">
                    <FormControlLabel
                        control={
                            <Checkbox
                                disabled={disableAll}
                                onChange={e => setAssignFurther?.(e.target.checked)}
                            />
                        }
                        label="Assign Further"
                    />
                </div>

                {currentUserDetails?.role !== 'USER' && assignFurther && (
                    <>
                        <div className="col-md-6 mb-3  px-4">
                            <GenericDropdownController
                                name="assignedToLevel"
                                control={control}
                                label="Assign to Level"
                                options={assignLevelOptions}
                                className="form-select"
                            />
                        </div>
                        <div className="col-md-6 mb-3 px-4">
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
        </CustomFieldset>
    )
}

export default TicketDetails;
