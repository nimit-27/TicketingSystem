import { FieldValues, useWatch } from "react-hook-form";
import { FormProps } from "../../types";
import { useTranslation } from "react-i18next";
import { DropdownOption } from "../UI/Dropdown/GenericDropdown";
import GenericDropdownController from "../UI/Dropdown/GenericDropdownController";
import CustomFormInput from "../UI/Input/CustomFormInput";
import CustomFieldset from "../CustomFieldset";
import { useApi } from "../../hooks/useApi";
import React, { useEffect, useState } from "react";
import { Checkbox, FormControlLabel } from "@mui/material";
import { getAllUsersByLevel, getAllLevels } from "../../services/LevelService";
import { getCategories, getSubCategories } from "../../services/CategoryService";
import { getStatuses } from "../../services/StatusService";
import { currentUserDetails } from "../../config/config";
import { getPriorities } from "../../services/PriorityService";
import { getSeverities } from "../../services/SeverityService";

interface TicketDetailsProps extends FormProps {
    disableAll?: boolean;
    subjectDisabled?: boolean;
    actionElement?: React.ReactNode;
}

const impactOptions: DropdownOption[] = [
    { label: "High", value: "High" },
    { label: "Medium", value: "Medium" },
    { label: "Low", value: "Low" }
];


const getDropdownOptions = <T,>(arr: any, labelKey: keyof T, valueKey: keyof T): DropdownOption[] =>
    Array.isArray(arr)
        ? arr.map(item => ({
            label: String(item[labelKey]),
            value: item[valueKey]
        }))
        : [];

const TicketDetails: React.FC<TicketDetailsProps> = ({ register, control, errors, disableAll = false, subjectDisabled = false, actionElement, createMode }) => {

    const { t } = useTranslation();

    const { data: allLevels, pending: isLevelsLoading, error: levelsError, apiHandler: getAllLevelApiHandler } = useApi();
    const { data: allUsersByLevel, pending, error, apiHandler: getAllUsersByLevelHandler } = useApi();
    const { data: allCategories, pending: isCategoriesLoading, error: categoriesError, apiHandler: getCategoriesApiHandler } = useApi();
    const { data: allSubCategories, pending: isSubCategoriesLoading, error: subCategoriesError, apiHandler: getSubCategoriesApiHandler } = useApi();
    const { data: statusList, apiHandler: getStatusApiHandler } = useApi<any>();
    const { data: priorityList, apiHandler: getPriorityApiHandler } = useApi<any>();
    const { data: severityList, apiHandler: getSeverityApiHandler } = useApi<any>();

    // Field visibility booleans

    // getDropdownOptions(arr, label, value)
    const assignLevelOptions: DropdownOption[] = getDropdownOptions(allLevels, 'levelName', 'levelId');
    const assignToOptions: DropdownOption[] = getDropdownOptions(allUsersByLevel, 'name', 'UserId');
    const categoryOptions: DropdownOption[] = getDropdownOptions(allCategories, 'category', 'category');
    const subCategoryOptions: DropdownOption[] = getDropdownOptions(allSubCategories, 'subCategory', 'subCategoryId');
    const statusOptions: DropdownOption[] = Array.isArray(statusList) ? statusList.map(s => ({ label: s.replace(/_/g, ' '), value: s })) : [];
    const priorityOptions: DropdownOption[] = Array.isArray(priorityList) ? priorityList.map((p: string) => ({ label: p, value: p })) : [];
    const severityOptions: DropdownOption[] = Array.isArray(severityList) ? severityList.map((s: string) => ({ label: s, value: s })) : [];
    const [assignFurther, setAssignFurther] = useState<boolean>(false);
    const assignedToLevel = useWatch({ control, name: 'assignedToLevel' });
    const category = useWatch({ control, name: 'category' });
    const subjectValue = useWatch({ control, name: 'subject' });
    const descriptionValue = useWatch({ control, name: 'description' });

    let showAssignedToLevel = !createMode;
    let showAssignedTo = !createMode;
    let showCategory = true;
    let showSubCategory = true;
    let showPriority = true;
    const isIT = currentUserDetails?.role.includes('IT');
    let showSeverityFields = isIT;
    let showSeverity = true;
    let showRecommendedSeverity = true;
    let showImpact = !isIT;
    let showSelectedImpact = isIT;
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
        assignedToLevel && getAllUsersByLevelHandler(() => getAllUsersByLevel(assignedToLevel))
    }, [assignedToLevel])

    useEffect(() => {
        getCategoriesApiHandler(() => getCategories())
    }, [])

    useEffect(() => {
        getStatusApiHandler(() => getStatuses())
    }, [])

    useEffect(() => {
        getPriorityApiHandler(() => getPriorities())
        getSeverityApiHandler(() => getSeverities())
    }, [])

    useEffect(() => {
        if (category && Array.isArray(allCategories)) {
            const selectedCategory = allCategories.find((cat: any) => cat.category === category);
            if (selectedCategory?.categoryId) {
                getSubCategoriesApiHandler(() => getSubCategories(selectedCategory.categoryId));
            }
        }
    }, [category])

    useEffect(() => {
        // Set assignedBy to current userId from localStorage if available
        if (register && typeof register === 'function') {
            register('assignedBy', { value: localStorage.getItem('userId') || currentUserDetails?.userId || 'john.doe' });
        }
    }, [register]);


    return (
        <CustomFieldset title={t('Ticket Details')} actionElement={actionElement}>
            <div className="row">
                {showAssignedToLevel && (
                    <div className="col-md-6 mb-3 px-4">
                        <CustomFormInput
                            name="assignedToLevel"
                            label="Assigned To Level"
                            slotProps={{
                                inputLabel: { shrink: subjectValue }
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
                                inputLabel: { shrink: subjectValue }
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
                            disabled={disableAll || !category}
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
                        {showSelectedImpact && (
                            <div className="col-md-4 mb-3 px-4">
                                <GenericDropdownController
                                    name="impact"
                                    control={control}
                                    label="Selected Impact"
                                    options={impactOptions}
                                    className="form-select"
                                    disabled
                                />
                            </div>
                        )}
                        {showRecommendedSeverity && (
                            <div className="col-md-4 mb-3 px-4">
                                <GenericDropdownController
                                    name="recommendedSeverity"
                                    control={control}
                                    label="Recommended Severity"
                                    options={severityOptions}
                                    className="form-select"
                                    disabled
                                />
                            </div>
                        )}
                        {showSeverity && (
                            <div className="col-md-4 mb-3 px-4">
                                <GenericDropdownController
                                    name="severity"
                                    control={control}
                                    label="Confirm Severity"
                                    options={severityOptions}
                                    className="form-select"
                                    disabled={disableAll}
                                />
                            </div>
                        )}
                    </>
                )}
                {showImpact && (
                    <div className="col-md-4 mb-3 px-4">
                        <GenericDropdownController
                            name="impact"
                            control={control}
                            label="Impact"
                            options={impactOptions}
                            className="form-select"
                            disabled={disableAll}
                        />
                    </div>
                )}
                {showIsMaster && (
                    <div className="col-md-5 mb-3 px-4 d-flex align-items-center">
                    <FormControlLabel
                            control={<Checkbox {...register('isMaster')} disabled={disableAll} />}
                            label={t('Mark this ticket as Master')}
                        />
                    </div>
                )}
                {showSubject && (
                    <div className="col-md-12 mb-3 px-4">
                        <CustomFormInput
                            slotProps={{
                                inputLabel: { shrink: subjectValue }
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
                                inputLabel: { shrink: descriptionValue }
                            }}
                            label="Description"
                            name="description"
                            register={register}
                            errors={errors}
                            multiline
                            rows={4}
                            disabled={disableAll}
                        />
                    </div>
                )}
                {showAttachment && (
                    <div className="col-md-6 d-flex align-items-center mb-3 px-4">
                        <label htmlFor="attachment" className="form-label me-2 mb-0" style={{ whiteSpace: "nowrap" }}>
                            {t('Attachment')}
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
                            label={t('Assign Further')}
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

export default React.memo(TicketDetails);
