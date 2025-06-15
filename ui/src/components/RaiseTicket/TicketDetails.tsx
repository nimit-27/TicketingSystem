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
import { getStatuses } from "../../services/StatusService";
import { currentUserDetails } from "../../config/config";

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

const severityOptions: DropdownOption[] = [
    { label: "CRITICAL", value: "CRITICAL" },
    { label: "HIGH", value: "HIGH" },
    { label: "MEDIUM", value: "MEDIUM" },
    { label: "LOW", value: "LOW" }
];


const getDropdownOptions = <T,>(arr: any, labelKey: keyof T, valueKey: keyof T): DropdownOption[] =>
    Array.isArray(arr)
        ? arr.map(item => ({
            label: String(item[labelKey]),
            value: item[valueKey]
        }))
        : [];

const TicketDetails: React.FC<TicketDetailsProps> = ({ register, control, formData, errors, disableAll = false, subjectDisabled = false, actionElement, createMode }) => {

    const { data: allLevels, pending: isLevelsLoading, error: levelsError, apiHandler: getAllLevelApiHandler } = useApi();
    const { data: allEmployeesByLevel, pending, error, apiHandler: getAllEmployeesByLevelHandler } = useApi();
    const { data: allCategories, pending: isCategoriesLoading, error: categoriesError, apiHandler: getCategoriesApiHandler } = useApi();
    const { data: allSubCategories, pending: isSubCategoriesLoading, error: subCategoriesError, apiHandler: getSubCategoriesApiHandler } = useApi();
    const { data: statusList, apiHandler: getStatusApiHandler } = useApi<any>();

    // Field visibility booleans

    // getDropdownOptions(arr, label, value)
    const assignLevelOptions: DropdownOption[] = getDropdownOptions(allLevels, 'levelName', 'levelId');
    const assignToOptions: DropdownOption[] = getDropdownOptions(allEmployeesByLevel, 'name', 'employeeId');
    const categoryOptions: DropdownOption[] = getDropdownOptions(allCategories, 'category', 'category');
    const subCategoryOptions: DropdownOption[] = getDropdownOptions(allSubCategories, 'subCategory', 'subCategoryId');
    const statusOptions: DropdownOption[] = Array.isArray(statusList) ? statusList.map(s => ({ label: s.replace(/_/g, ' '), value: s })) : [];
    const [assignFurther, setAssignFurther] = useState<boolean>(false);

    console.log(categoryOptions)

    let showAssignedToLevel = !createMode;
    let showAssignedTo = !createMode;
    let showCategory = true;
    let showSubCategory = true;
    let showPriority = true;
    let showSeverityFields = currentUserDetails?.role.includes('RNO')
    let showSeverity = true;
    let showRecommendedSeverity = true;
    let showImpact = true;
    let showIsMaster = true;
    let showSubject = true;
    let showDescription = true;
    let showAttachment = true;
    let showStatus = true;
    let showAssignFurther = true;
    let showAssignToLevelDropdown = true;
    let showAssignToDropdown = true;

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
        getStatusApiHandler(() => getStatuses())
    }, [])

    console.log({formData})

    useEffect(() => {
        if (formData?.category && Array.isArray(allCategories)) {
            const selectedCategory = allCategories.find((cat: any) => cat.category === formData.category);
            if (selectedCategory?.categoryId) {
            getSubCategoriesApiHandler(() => getSubCategories(selectedCategory.categoryId));
            }
        }
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
                {showAssignedToLevel && (
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
                )}
                {showAssignedTo && (
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
                )}
                {showCategory && (
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
                )}
                {showSubCategory && (
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
                )}
                {showPriority && (
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
                )}
                {showSeverityFields && (
                    <>
                        {showSeverity && (
                            <div className="col-md-4 mb-3 px-4">
                                <CustomFormInput
                                    name="severity"
                                    label="Severity"
                                    register={register}
                                    errors={errors}
                                    disabled
                                />
                            </div>
                        )}
                        {showRecommendedSeverity && (
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
                        )}
                        {showImpact && (
                            <div className="col-md-4 mb-3 px-4">
                                <CustomFormInput
                                    name="impact"
                                    label="Impact"
                                    register={register}
                                    errors={errors}
                                    disabled={disableAll}
                                />
                            </div>
                        )}
                    </>
                )}
                {showIsMaster && (
                    <div className="col-md-5 mb-3 px-4 d-flex align-items-center">
                        <FormControlLabel
                            control={<Checkbox {...register('isMaster')} disabled={disableAll} />}
                            label="Mark this ticket as Master"
                        />
                    </div>
                )}
                {showSubject && (
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
                )}
                {showDescription && (
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
                )}
                {showAttachment && (
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
                )}
                <div className="col-md-6 mb-3"></div>
                {showStatus && (
                    <div className="col-md-12 mb-3 px-4">
                        <GenericDropdownController
                            name="status"
                            control={control}
                            label="Update Status"
                            options={statusOptions}
                            className="form-select w-25"
                            disabled={disableAll}
                        />
                    </div>
                )}
                {showAssignFurther && (
                    <div className="col-md-4 mb-3 px-4 d-flex align-items-center">
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
                )}
                {!currentUserDetails?.role.includes("USER") && assignFurther && (
                    <>
                        {showAssignToLevelDropdown && (
                            <div className="col-md-4 mb-3  px-4">
                                <GenericDropdownController
                                    name="assignedToLevel"
                                    control={control}
                                    label="Assign to Level"
                                    options={assignLevelOptions}
                                    className="form-select"
                                />
                            </div>
                        )}
                        {showAssignToDropdown && (
                            <div className="col-md-4 mb-3 px-4">
                                <GenericDropdownController
                                    name="assignedTo"
                                    control={control}
                                    label="Assign to"
                                    options={assignToOptions}
                                    className="form-select"
                                />
                            </div>
                        )}
                    </>
                )}
            </div>
        </CustomFieldset>
    )
}

export default TicketDetails;
