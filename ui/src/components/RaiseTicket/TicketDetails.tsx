import { FieldValues, useWatch } from "react-hook-form";
import { FormProps } from "../../types";
import { useTranslation } from "react-i18next";
import { DropdownOption } from "../UI/Dropdown/GenericDropdown";
import GenericDropdownController from "../UI/Dropdown/GenericDropdownController";
import CustomFormInput from "../UI/Input/CustomFormInput";
import CustomFieldset from "../CustomFieldset";
import { useApi } from "../../hooks/useApi";
import React, { useEffect, useState, useMemo } from "react";
import { Checkbox, FormControlLabel } from "@mui/material";
import { getAllUsersByLevel, getAllLevels } from "../../services/LevelService";
import { getCategories, getSubCategories } from "../../services/CategoryService";
import { getNextStatusListByStatusId } from "../../services/StatusService";
import { getCurrentUserDetails } from "../../config/config";
import { checkFieldAccess } from "../../utils/permissions";
import { getPriorities } from "../../services/PriorityService";
import { getSeverities } from "../../services/SeverityService";
import InfoIcon from "../UI/Icons/InfoIcon";
import { PriorityInfo, SeverityInfo } from "../../types";
import FileUpload from "../UI/FileUpload";
import { getDropdownOptions } from "../../utils/Utils";

interface TicketDetailsProps extends FormProps {
    disableAll?: boolean;
    subjectDisabled?: boolean;
    actionElement?: React.ReactNode;
    attachments?: File[];
    setAttachments?: (files: File[]) => void;
}

const impactOptions: DropdownOption[] = [
    { label: "High", value: "High" },
    { label: "Medium", value: "Medium" },
    { label: "Low", value: "Low" }
];


// const getDropdownOptions = <T,>(arr: any, labelKey: keyof T, valueKey: keyof T): DropdownOption[] =>
//     Array.isArray(arr)
//         ? arr.map(item => ({
//             label: String(item[labelKey]),
//             value: item[valueKey]
//         }))
//         : [];

const TicketDetails: React.FC<TicketDetailsProps> = ({ register, control, setValue, errors, disableAll = false, subjectDisabled = false, actionElement, createMode, attachments, setAttachments }) => {
    const { t } = useTranslation();

    // USEAPI INITIALIZATIONS
    const { data: allLevels, pending: isLevelsLoading, error: levelsError, apiHandler: getAllLevelApiHandler } = useApi();
    const { data: allUsersByLevel, pending, error, apiHandler: getAllUsersByLevelHandler } = useApi();
    const { data: allCategories, pending: isCategoriesLoading, error: categoriesError, apiHandler: getCategoriesApiHandler } = useApi();
    const { data: allSubCategories, pending: isSubCategoriesLoading, error: subCategoriesError, apiHandler: getSubCategoriesApiHandler } = useApi();
    const { data: nextStatusListByStatusIdData, apiHandler: getNextStatusListByStatusIdApiHandler } = useApi<any>();
    const { data: priorityList, apiHandler: getPriorityApiHandler } = useApi<any>();
    const { data: severityList, apiHandler: getSeverityApiHandler } = useApi<any>();

    // USESTATE INITIALIZATIONS
    const [assignFurther, setAssignFurther] = useState<boolean>(false);

    const stableAttachments = useMemo(() => attachments ?? [], [attachments]);

    // DROPDOWN OPTIONS - getDropdownOptions(arr, label, value)
    const assignLevelOptions: DropdownOption[] = getDropdownOptions(allLevels, 'levelName', 'levelId');
    const assignToOptions: DropdownOption[] = getDropdownOptions(allUsersByLevel, 'name', 'username');
    const categoryOptions: DropdownOption[] = getDropdownOptions(allCategories, 'category', 'categoryId');
    const subCategoryOptions: DropdownOption[] = getDropdownOptions(allSubCategories, 'subCategory', 'subCategoryId');
    const statusOptions: DropdownOption[] = getDropdownOptions(nextStatusListByStatusIdData, 'action', 'nextStatus');
    const priorityOptions: DropdownOption[] = Array.isArray(priorityList) ? priorityList.map((p: PriorityInfo) => ({ label: p.level, value: p.id })) : [];
    const severityOptions: DropdownOption[] = Array.isArray(severityList) ? severityList.map((s: SeverityInfo) => ({ label: s.level, value: s.level })) : [];

    const priorityContent = Array.isArray(priorityList) ? (
        <div>
            {priorityList.map((p: PriorityInfo) => (
                <div key={p.id}>{p.level} - {p.description}</div>
            ))}
        </div>
    ) : undefined;

    const severityContent = Array.isArray(severityList) ? (
        <div>
            {severityList.map((s: SeverityInfo) => (
                <div key={s.id}>{s.level} - {s.description}</div>
            ))}
        </div>
    ) : undefined;

    const assignedToLevel = useWatch({ control, name: 'assignedToLevel' });
    const assignToLevel = useWatch({ control, name: 'assignToLevel' });
    const category = useWatch({ control, name: 'category' });
    const subjectValue = useWatch({ control, name: 'subject' });
    const descriptionValue = useWatch({ control, name: 'description' });
    const currentStatus = useWatch({ control, name: 'statusId' });

    let showAssignedToLevel = checkFieldAccess('ticketDetails', 'assignedToLevel') && !createMode;
    let showAssignedTo = checkFieldAccess('ticketDetails', 'assignedTo') && !createMode;
    let showAssignFurther = checkFieldAccess('ticketDetails', 'assignFurtherCheckbox');
    let showAssignToLevelDropdown = checkFieldAccess('ticketDetails', 'assignToLevelDropdown');
    let showAssignToDropdown = checkFieldAccess('ticketDetails', 'assignToDropdown');
    let showCategory = checkFieldAccess('ticketDetails', 'category');
    let showSubCategory = checkFieldAccess('ticketDetails', 'subCategory');
    let showPriority = checkFieldAccess('ticketDetails', 'priority');
    let showSeverityFields = checkFieldAccess('ticketDetails', 'severity');
    let showSeverity = checkFieldAccess('ticketDetails', 'severity');
    let showRecommendedSeverity = checkFieldAccess('ticketDetails', 'recommendedSeverity');
    let showImpact = checkFieldAccess('ticketDetails', 'impact');
    let showSelectedImpact = checkFieldAccess('ticketDetails', 'impact');
    let showIsMaster = checkFieldAccess('ticketDetails', 'isMaster');
    let showSubject = checkFieldAccess('ticketDetails', 'subject');
    let showDescription = checkFieldAccess('ticketDetails', 'description');
    let showAttachment = checkFieldAccess('ticketDetails', 'attachment');
    const userRoles = getCurrentUserDetails()?.role || [];
    const isTeamLead = userRoles.includes('TEAM_LEAD') || userRoles.includes('TL') || userRoles.includes('TeamLead');
    let showStatus = checkFieldAccess('ticketDetails', 'status') && !createMode && !isTeamLead;

    const getNextStatusListByStatusIdApi = (statusId: string) => getNextStatusListByStatusIdApiHandler(() => getNextStatusListByStatusId(statusId))

    useEffect(() => {
        getAllLevelApiHandler(() => getAllLevels())
    }, [])

    useEffect(() => {
        assignToLevel && getAllUsersByLevelHandler(() => getAllUsersByLevel(assignToLevel))
    }, [assignToLevel])

    useEffect(() => {
        getCategoriesApiHandler(() => getCategories())
    }, [])


    // useEffect(() => {
    //     setValue && nextStatusListByStatusIdData && setValue("statusId", nextStatusListByStatusIdData[0]?.currentStatus);
    // }, [statusOptions]);

    useEffect(() => {
        currentStatus && getNextStatusListByStatusIdApi(currentStatus)
    }, [currentStatus])

    useEffect(() => {
        getPriorityApiHandler(() => getPriorities())
        getSeverityApiHandler(() => getSeverities())
    }, [])

    useEffect(() => {
        if (category) {
            getSubCategoriesApiHandler(() => getSubCategories(category));
        }
    }, [category])

    useEffect(() => {
        if (register && typeof register === 'function') {
            register('assignedBy', { value: getCurrentUserDetails()?.username || 'john.doe' });
            register('updatedBy', { value: getCurrentUserDetails()?.username || 'john.doe' });
            register('attachments');
        }
    }, [register]);


    return (
        <CustomFieldset variant="bordered" title={t('Ticket Details')} actionElement={actionElement}>
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
                            rules={{ required: 'Please select Category' }}
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
                            rules={{ required: 'Please select Sub Category' }}
                        />
                    </div>
                )}
                {showPriority && (
                    <div className="col-md-4 mb-3 px-4 d-flex align-items-center">
                        <GenericDropdownController
                            name="priority"
                            control={control}
                            label="Priority"
                            options={priorityOptions}
                            className="form-select flex-grow-1"
                            disabled={disableAll}
                            rules={{ required: 'Please select Priority' }}
                        />
                        <InfoIcon content={priorityContent} />
                    </div>
                )}
                {true && (
                    // {showSeverityFields && (
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
                        {!createMode && showRecommendedSeverity && (
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
                        {!createMode && showSeverity && (
                            <div className="col-md-4 mb-3 px-4 d-flex align-items-center">
                                <GenericDropdownController
                                    name="severity"
                                    control={control}
                                    label="Confirm Severity"
                                    options={severityOptions}
                                    className="form-select flex-grow-1"
                                    disabled={disableAll}
                                />
                                <InfoIcon content={severityContent} />
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
                            required
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
                            required
                        />
                    </div>
                )}
                {showAttachment && (
                    <div className="col-md-12 mb-3 px-4">
                        <FileUpload
                            maxSizeMB={5}
                            thumbnailSize={100}
                            attachments={stableAttachments}
                            onFilesChange={(files) => {
                                setAttachments && setAttachments(files)
                                setValue && setValue('attachments', files)
                            }}
                        />
                    </div>
                )}
                {/* <div className="col-md-6 mb-3"></div> */}
                {showStatus && (
                    <div className="col-md-12 mb-3 px-4">
                        <GenericDropdownController
                            name="statusId"
                            control={control}
                            // onChange={handleExplicitStatusChange}
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
                {!getCurrentUserDetails()?.role?.includes("USER") && assignFurther && (
                    <>
                        {showAssignToLevelDropdown && (
                            <div className="col-md-4 mb-3  px-4">
                                <GenericDropdownController
                                    name="assignToLevel"
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
                                    name="assignTo"
                                    control={control}
                                    label="Assign to"
                                    options={assignToOptions}
                                    className="form-select"
                                    disabled={!assignToLevel}
                                    rules={assignToLevel ? { required: 'Please select Assignee' } : undefined}
                                />
                            </div>
                        )}
                    </>
                )}
            </div>
        </CustomFieldset>
    )
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
                    <div className="col-md-12 mb-3 px-4">
                        <FileUpload
                            maxSizeMB={5}
                            thumbnailSize={100}
                            attachments={stableAttachments}
                            onFilesChange={(files) => {
                                // Store temporarily in parent state for post-create upload
                                setAttachments?.(files);
                                // Keep form value if needed elsewhere
                                setValue && setValue('attachments', files);
                            }}
                        />
                    </div>
                )}
                {/* <div className="col-md-6 mb-3"></div> */}
                {showStatus && (
                    <div className="col-md-12 mb-3 px-4">
                        <GenericDropdownController
                            name="statusId"
                            control={control}
                            // onChange={handleExplicitStatusChange}
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
                {!getCurrentUserDetails()?.role?.includes("USER") && assignFurther && (
                    <>
                        {showAssignToLevelDropdown && (
                            <div className="col-md-4 mb-3  px-4">
                                <GenericDropdownController
                                    name="assignToLevel"
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
                                    name="assignTo"
                                    control={control}
                                    label="Assign to"
                                    options={assignToOptions}
                                    className="form-select"
                                    disabled={!assignToLevel}
                                    rules={assignToLevel ? { required: 'Please select Assignee' } : undefined}
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
