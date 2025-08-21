import { Checkbox, FormControlLabel, InputAdornment, ToggleButton, ToggleButtonGroup, Autocomplete, TextField, Card } from "@mui/material";
import { formFieldValue, inputColStyling } from "../../constants/bootstrapClasses";
import { FormProps } from "../../types";
import CustomFormInput from "../UI/Input/CustomFormInput";
import VerifyIconButton from "../UI/IconButton/VerifyIconButton";
import { getUserDetails, getAllUsers } from "../../services/UserService";
import { FieldValues, useWatch } from "react-hook-form";
import { useApi } from "../../hooks/useApi";
import { useDebounce } from "../../hooks/useDebounce";
import React, { useEffect, useState } from "react";
import CustomIconButton from "../UI/IconButton/CustomIconButton";
import CustomFieldset from "../CustomFieldset";
import { getCurrentUserDetails, FciTheme, isFciUser, isHelpdesk } from "../../config/config";
import DropdownController from "../UI/Dropdown/DropdownController";
import GenericDropdownController from "../UI/Dropdown/GenericDropdownController";
import { DropdownOption } from "../UI/Dropdown/GenericDropdown";
import ViewToggle from "../UI/ViewToggle";
import { useTranslation } from "react-i18next";
import { checkFieldAccess } from "../../utils/permissions";
import { getStakeholders } from "../../services/StakeholderService";

interface RequestorDetailsProps extends FormProps {
    disableAll?: boolean;
}

const FCI_User = "fci";
const NON_FCI_User = "nonFci";

type ViewMode = typeof FCI_User | typeof NON_FCI_User;

const RequestorDetails: React.FC<RequestorDetailsProps> = ({ register, errors, setValue, control, disableAll = false, createMode }) => {
    const [verified, setVerified] = useState<boolean>(false);
    const [disabled, setDisabled] = useState<boolean>(false);
    const [viewMode, setViewMode] = useState<ViewMode>("nonFci");
    const [selectedUser, setSelectedUser] = useState<any | null>(null);
    const [searchText, setSearchText] = useState("");
    const { t } = useTranslation();

    const fciUser = isFciUser();
    const helpdesk = isHelpdesk();

    const isDisabled = disableAll || disabled;

    const { data: userDetailsData, pending, success, apiHandler: getUserDetailsApiHandler } = useApi<any>();
    const { data: usersData, apiHandler: getAllUsersApiHandler } = useApi<any>();
    const { data: stakeholderData, apiHandler: getStakeholdersApiHandler } = useApi<any>();

    const userId = useWatch({ control, name: 'userId' });
    const mode = useWatch({ control, name: 'mode', defaultValue: 'Self' });
    const onBehalfFciUser = useWatch({ control, name: 'onBehalfFciUser' });
    const office = useWatch({ control, name: 'office' });
    const mobileNo = useWatch({ control, name: 'mobileNo' });
    const emailId = useWatch({ control, name: 'emailId' });
    const requestorName = useWatch({ control, name: 'requestorName' });
    const stakeholder = useWatch({ control, name: 'stakeholder' });
    const debouncedUserId = useDebounce(userId, 500);

    const allUsers = usersData || [];
    const filteredUsers = allUsers.filter((u: any) => !stakeholder || u.stakeholder === stakeholder);
    const stakeholderOptions: DropdownOption[] = Array.isArray(stakeholderData)
        ? stakeholderData.map((s: any) => ({ label: s.description, value: s.id }))
        : [];

    const getUserDetailsHandler = (userId: any) => {
        getUserDetailsApiHandler(() => getUserDetails(userId))
    }

    const clearUserDetails = () => {
        console.log("Clearing user details");
        if (setValue) {
            setValue("userId", "");
            setValue("requestorName", "");
            setValue("emailId", "");
            setValue("mobileNo", "");
            setValue("role", "");
            setValue("office", "");
        }
    }

    const populateUserDetails = (data: any) => {
        console.log("Populating user details:", data);
        setSelectedUser(data)
        if (setValue && data) {
            setValue("requestorName", data.name);
            setValue("emailId", data.emailId);
            setValue("mobileNo", data.mobileNo);
            if (fciUser) {
                setValue("role", data.role);
                setValue("office", data.office);
            } else {
                setValue("stakeholder", data.stakeholder)
            }
        }
    };

    useEffect(() => {
        getAllUsersApiHandler(() => getAllUsers());
        getStakeholdersApiHandler(() => getStakeholders());
    }, [getAllUsersApiHandler, getStakeholdersApiHandler]);

    // On initial render, if mode is Self, verify and populate logged-in user details
    // useEffect(() => {
    //     if (mode === "Self") {
    //         const user = getCurrentUserDetails();
    //         if (setValue && user?.userId) {
    //             setValue("userId", user?.userId);
    //             verifyUserById(user?.userId);
    //         }
    //     }
    // }, []);

    // useEffect(() => {
    //     setSelectedUser(null);
    //     setSearchText("");
    //     clearUserDetails();
    // }, [stakeholder]);

    useEffect(() => {
        // When mode changes and is not "Self", enable the form fields
        if (mode && mode !== "Self") {
            setDisabled(false);
            // clearRequestorDetailsForm()
        }
        // If mode is "Self", populate the logged in user details
        else if (mode === "Self") {
            const user = getCurrentUserDetails();
            if (setValue && user?.userId) {
                setValue("userId", user?.userId);
                verifyUserById(user?.userId);
            }
        }
    }, [mode]);

    console.log({ pending, userDetailsData, success });
    useEffect(() => {
        console.log("Pending:", pending, "Success:", success);
        if (success) {
            console.log("Pending:", pending);
            setVerified(true);
            if (setValue && userDetailsData) {
                console.log("Data:", userDetailsData);
                populateUserDetails(userDetailsData)
                setDisabled(true)
            }
        } else setVerified(false);
    }, [pending, userDetailsData, success]);

    useEffect(() => {
        if (debouncedUserId) {
            setDisabled(true);
            if (disableAll || fciUser) verifyUserById(debouncedUserId);
        } else clearRequestorDetailsForm();

        setVerified(false);
    }, [debouncedUserId]);

    useEffect(() => {
        clearUserDetails()
    }, [viewMode, onBehalfFciUser])

    useEffect(() => {
        // Ticket creation by FCI user - SELF
        if (fciUser && createMode) {
            const user = getCurrentUserDetails();
            if (setValue && user?.userId) {
                setValue("userId", user?.userId);
                verifyUserById(user?.userId);
            }
        }
        // Ticket creation by normal user - SELF
        if (!fciUser && !helpdesk && createMode) {
            const user = getCurrentUserDetails();
            if (setValue && user?.userId) {
                setValue('userId', user?.userId);
                verifyUserById(user?.userId);
            }
        }
        if (helpdesk && mode === 'Self' && createMode) {
            const user = getCurrentUserDetails();
            if (setValue && user?.userId) {
                setValue('userId', user?.userId);
                verifyUserById(user?.userId);
            }
        }
    }, [fciUser, helpdesk, mode, createMode]);

    const verifyUserById = (userId: string) => {
        // Logic to verify user by ID
        getUserDetailsHandler(userId)
    };

    const clearRequestorDetailsForm = () => {
        // Allow clearing only while creating
        if (!!setValue && createMode) {
            setValue("requestorName", "");
            setValue("emailId", "");
            setValue("mobileNo", "");
            setValue("userId", "");
            setValue("role", "");
            setValue("office", "");
            setValue("stakeholder", "");
        }
        setDisabled(false);
        setVerified(false);
        setSelectedUser(null);
        setSearchText("");
    };

    const showSearchUserAutocomplete = mode !== 'Self' && createMode
    const showRequestorDetailsCard = selectedUser && Object.keys(selectedUser).length > 0;
    // const showRequestorDetailsCard = userDetailsData && Object.keys(userDetailsData).length > 0;
    // const showRequestorDetailsCard = checkFieldAccess('requestorDetails', 'showRequestorDetailsCard') && !createMode;
    const isSelfHelpdesk = helpdesk && mode === 'Self';

    const showOnBehalfCheckbox = checkFieldAccess('requestorDetails', 'onBehalfOfFciUser') && createMode && mode !== 'Self';

    const showFciToggle = false;
    const showUserId = checkFieldAccess('requestorDetails', 'userId')
    const showRequestorName = checkFieldAccess('requestorDetails', 'requestorName');
    const showEmailId = checkFieldAccess('requestorDetails', 'emailId');
    const showMobileNo = checkFieldAccess('requestorDetails', 'mobileNo');
    const showStakeholder = checkFieldAccess('requestorDetails', 'stakeholder') && mode !== 'Self'
    // &&
    // !onBehalfFciUser &&
    // !isSelfHelpdesk &&
    // viewMode === 'nonFci' &&
    // !fciUser;
    const showRole = checkFieldAccess('requestorDetails', 'role') &&
        (viewMode === FCI_User || fciUser || onBehalfFciUser || isSelfHelpdesk);
    const showOffice = checkFieldAccess('requestorDetails', 'office') &&
        (viewMode === FCI_User || fciUser || onBehalfFciUser) && !isSelfHelpdesk;

    const isNonFci =
        viewMode === NON_FCI_User && !fciUser && !onBehalfFciUser && !isSelfHelpdesk;
    const isFciMode =
        viewMode === FCI_User || fciUser || onBehalfFciUser || isSelfHelpdesk;

    const isUserIdDisabled =
        disableAll || fciUser || isSelfHelpdesk || !createMode;
    const isNameDisabled = isDisabled || fciUser || isSelfHelpdesk || !createMode;
    const isEmailIdDisabled = isDisabled || fciUser || isSelfHelpdesk || !createMode;
    const isMobileNoDisabled = isDisabled || fciUser || isSelfHelpdesk || !createMode;
    const isRoleDisabled = isDisabled || fciUser || isSelfHelpdesk || !createMode;
    const isOfficeDisabled = isDisabled || fciUser || isSelfHelpdesk || !createMode;
    const isStakeholderDisabled = false || !createMode;

    const isRequestorOrOnBehalfFci = !createMode && userId
    const isRequestorOnBehalfNonFci = !createMode && !userId && stakeholder

    const handleSelectUserChange = (e: any, val: any) => {
        setSelectedUser(val);
        if (val) {
            populateUserDetails(val);
            setValue && setValue('userId', val.userId);
        } else {
            clearUserDetails();
        }
    }

    const handleFilterOptions = (options: any[], params: any) => {
        const txt = params.inputValue.toLowerCase();
        return options.filter((o: any) => {
            return (
                o.name?.toLowerCase().includes(txt) ||
                o.userId?.toString().toLowerCase().includes(txt) ||
                o.username?.toLowerCase().includes(txt) ||
                o.emailId?.toLowerCase().includes(txt) ||
                o.mobileNo?.toLowerCase().includes(txt)
            );
        });
    }

    const renderReadOnlyField = (label: string, value: string) => (
        <div className={`${formFieldValue}`}>
            <p className="mb-0 text-muted fs-16">{label}</p>
            <p className="mb-0 fs-16">{value}</p>
        </div>
    );

    return (
        <CustomFieldset variant="bordered" title={t('Requestor Details')} className="row mb-1">
            <div className="row w-100">
                {(showSearchUserAutocomplete || showStakeholder) && (
                    <div className="col-md-6 d-flex flex-column">
                        {showSearchUserAutocomplete && (
                            <Autocomplete
                                options={filteredUsers}
                                getOptionLabel={(option: any) => option.name || ''}
                                renderOption={(props, option: any) => (
                                    <li {...props} key={option.userId}>
                                        <span className="fw-semibold">{option.name}</span>
                                        <span className="text-muted ms-2">{option.username} | {option.mobileNo} | {option.emailId}</span>
                                    </li>
                                )}
                                renderInput={(params) => <TextField {...params} label="Search User" size="small" />}
                                value={selectedUser}
                                inputValue={searchText}
                                onInputChange={(e, val) => setSearchText(val)}
                                onChange={handleSelectUserChange}
                                filterOptions={handleFilterOptions}
                                disabled={disableAll}
                            />
                        )}
                        {showStakeholder && (
                            <GenericDropdownController
                                label="Stakeholder"
                                name="stakeholder"
                                control={control}
                                options={stakeholderOptions}
                                rules={{ required: isNonFci ? 'Please select Stakeholder' : false }}
                                className="form-select mt-3"
                                disabled={isStakeholderDisabled}
                            />
                        )}
                    </div>
                )}
                <CustomFieldset variant="basic" className="col-md-6 mb-3">
                    {showUserId && userId && renderReadOnlyField("User ID", userId)}
                    {showRequestorName && requestorName && renderReadOnlyField("Name", requestorName)}
                    {showEmailId && emailId && renderReadOnlyField("Email ID", emailId)}
                    {showMobileNo && mobileNo && renderReadOnlyField("Mobile No.", mobileNo)}
                    {showRole && control._formValues?.role && renderReadOnlyField("Role", control._formValues?.role || "")}
                    {showOffice && control._formValues?.office && renderReadOnlyField("Office", control._formValues?.office || "")}
                </CustomFieldset>
            </div>

        </CustomFieldset>
        // <CustomFieldset variant="bordered" title={t('Requestor Details')} className="mb-1">
        //     {/* Inputs */}
        //     {!createMode &&
        //         <div className="row g-3">
        //             {isRequestorOrOnBehalfFci && (
        //                 <div className={`${inputColStyling}`}>
        //                     <CustomFormInput
        //                         label="User ID"
        //                         name="userId"
        //                         slotProps={{
        //                             inputLabel: { shrink: userId },
        //                             input: {
        //                                 endAdornment: !disableAll && (
        //                                     <InputAdornment position="end">
        //                                         {(verified || userId) && (
        //                                             <CustomIconButton icon="Clear" onClick={clearRequestorDetailsForm} disabled={disableAll} />
        //                                         )}
        //                                         <VerifyIconButton
        //                                             onClick={() => verifyUserById(userId)}
        //                                             pending={pending}
        //                                             verified={verified}
        //                                             disabled={!createMode}
        //                                         />
        //                                     </InputAdornment>
        //                                 )
        //                             }
        //                         }}
        //                         register={register}
        //                         errors={errors}
        //                         disabled={isUserIdDisabled}
        //                     />
        //                 </div>
        //             )}
        //             {showRequestorName && (
        //                 <div className={`${inputColStyling}`}>
        //                     <CustomFormInput
        //                         slotProps={{
        //                             inputLabel: { shrink: requestorName || userId }
        //                         }}
        //                         label="Name"
        //                         name="requestorName"
        //                         register={register}
        //                         errors={errors}
        //                         disabled={!createMode}
        //                     />
        //                 </div>
        //             )}
        //             {true && (
        //                 <div className={`${inputColStyling}`}>
        //                     <CustomFormInput
        //                         slotProps={{
        //                             inputLabel: { shrink: emailId || userId }
        //                         }}
        //                         label="Email ID"
        //                         name="emailId"
        //                         register={register}
        //                         errors={errors}
        //                         disabled={!createMode}
        //                     />
        //                 </div>
        //             )}
        //             {true && (
        //                 <div className={`${inputColStyling}`}>
        //                     <CustomFormInput
        //                         slotProps={{
        //                             inputLabel: { shrink: mobileNo || userId }
        //                         }}
        //                         label="Mobile No."
        //                         name="mobileNo"
        //                         register={register}
        //                         errors={errors}
        //                         disabled={isMobileNoDisabled}
        //                         type="tel"
        //                         required={!createMode}
        //                     />
        //                 </div>
        //             )}
        //             {isRequestorOnBehalfNonFci && (
        //                 <div className={`${inputColStyling}`}>
        //                     <GenericDropdownController
        //                         label="Stakeholder"
        //                         name="stakeholder"
        //                         control={control}
        //                         options={stakeholderOptions}
        //                         rules={{ required: isNonFci ? 'Please select Stakeholder' : false }}
        //                         className="form-select"
        //                         disabled={!createMode}
        //                     />
        //                 </div>
        //             )}
        //             {isRequestorOrOnBehalfFci && (
        //                 <div className={`${inputColStyling}`}>
        //                     <CustomFormInput
        //                         slotProps={{
        //                             inputLabel: { shrink: userId || verified }
        //                         }}
        //                         label="Role"
        //                         name="role"
        //                         register={register}
        //                         errors={errors}
        //                         disabled={!createMode}
        //                     />
        //                 </div>
        //             )}
        //             {isRequestorOrOnBehalfFci && (
        //                 <div className={`${inputColStyling}`}>
        //                     <CustomFormInput
        //                         slotProps={{
        //                             inputLabel: { shrink: office || verified }
        //                         }}
        //                         label="Office"
        //                         name="office"
        //                         register={register}
        //                         errors={errors}
        //                         disabled={!createMode}
        //                     />
        //                 </div>
        //             )}
        //         </div>
        //     }
        //     <div className="row g-3">
        //         {showRequestorDetailsCard && (
        //             <div className="col-md-6" >
        //                 <Card className="d-flex flex-column p-2 mb-4 justify-content-center" elevation={1} style={{ minHeight: '150px' }}>
        //                     {showUserId && userId && renderReadOnlyField("User ID", userId)}
        //                     {showRequestorName && requestorName && renderReadOnlyField("Name", requestorName)}
        //                     {showEmailId && emailId && renderReadOnlyField("Email ID", emailId)}
        //                     {showMobileNo && mobileNo && renderReadOnlyField("Mobile No.", mobileNo)}
        //                     {showRole && control._formValues?.role && renderReadOnlyField("Role", control._formValues?.role || "")}
        //                     {showOffice && control._formValues?.office && renderReadOnlyField("Office", control._formValues?.office || "")}
        //                 </Card>
        //             </div>
        //         )}
        //     </div>
        // </CustomFieldset>
    )
    return (
        <CustomFieldset variant="bordered" title={t('Requestor Details')} className="mb-4">
            {/* Inputs */}
            {!createMode &&
                <div className="row g-3">
                    {isRequestorOrOnBehalfFci && (
                        <div className={`${inputColStyling}`}>
                            <CustomFormInput
                                label="User ID"
                                name="userId"
                                slotProps={{
                                    inputLabel: { shrink: userId },
                                    input: {
                                        endAdornment: !disableAll && (
                                            <InputAdornment position="end">
                                                {(verified || userId) && (
                                                    <CustomIconButton icon="Clear" onClick={clearRequestorDetailsForm} disabled={disableAll} />
                                                )}
                                                <VerifyIconButton
                                                    onClick={() => verifyUserById(userId)}
                                                    pending={pending}
                                                    verified={verified}
                                                    disabled={!createMode}
                                                />
                                            </InputAdornment>
                                        )
                                    }
                                }}
                                register={register}
                                errors={errors}
                                disabled={isUserIdDisabled}
                            />
                        </div>
                    )}
                    {showRequestorName && (
                        <div className={`${inputColStyling}`}>
                            <CustomFormInput
                                slotProps={{
                                    inputLabel: { shrink: requestorName || userId }
                                }}
                                label="Name"
                                name="requestorName"
                                register={register}
                                errors={errors}
                                disabled={!createMode}
                            />
                        </div>
                    )}
                    {true && (
                        <div className={`${inputColStyling}`}>
                            <CustomFormInput
                                slotProps={{
                                    inputLabel: { shrink: emailId || userId }
                                }}
                                label="Email ID"
                                name="emailId"
                                register={register}
                                errors={errors}
                                disabled={!createMode}
                            />
                        </div>
                    )}
                    {true && (
                        <div className={`${inputColStyling}`}>
                            <CustomFormInput
                                slotProps={{
                                    inputLabel: { shrink: mobileNo || userId }
                                }}
                                label="Mobile No."
                                name="mobileNo"
                                register={register}
                                errors={errors}
                                disabled={isMobileNoDisabled}
                                type="tel"
                                required={!createMode}
                            />
                        </div>
                    )}
                    {isRequestorOnBehalfNonFci && (
                        <div className={`${inputColStyling}`}>
                            <GenericDropdownController
                                label="Stakeholder"
                                name="stakeholder"
                                control={control}
                                options={stakeholderOptions}
                                rules={{ required: isNonFci ? 'Please select Stakeholder' : false }}
                                className="form-select"
                                disabled={!createMode}
                            />
                        </div>
                    )}
                    {isRequestorOrOnBehalfFci && (
                        <div className={`${inputColStyling}`}>
                            <CustomFormInput
                                slotProps={{
                                    inputLabel: { shrink: userId || verified }
                                }}
                                label="Role"
                                name="role"
                                register={register}
                                errors={errors}
                                disabled={!createMode}
                            />
                        </div>
                    )}
                    {isRequestorOrOnBehalfFci && (
                        <div className={`${inputColStyling}`}>
                            <CustomFormInput
                                slotProps={{
                                    inputLabel: { shrink: office || verified }
                                }}
                                label="Office"
                                name="office"
                                register={register}
                                errors={errors}
                                disabled={!createMode}
                            />
                        </div>
                    )}
                </div>
            }
            {createMode && <div className="row g-3">
                {showOnBehalfCheckbox && (
                    <div className="col-md-12 mb-3 px-4">
                        <FormControlLabel
                            control={<Checkbox {...register('onBehalfFciUser')} />}
                            label={t('On behalf of FCI User')}
                        />
                    </div>
                )}
                <div className="col-md-6 px-4">
                    <Autocomplete
                        options={filteredUsers}
                        getOptionLabel={(option: any) => option.name || ''}
                        renderOption={(props, option: any) => (
                            <li {...props} key={option.userId}>
                                <span className="fw-semibold">{option.name}</span>
                                <span className="text-muted ms-2">{option.username} {option.mobileNo} {option.emailId}</span>
                            </li>
                        )}
                        renderInput={(params) => (
                            <TextField {...params} label="Search User" size="small" />
                        )}
                        value={selectedUser}
                        inputValue={searchText}
                        onInputChange={(e, val) => setSearchText(val)}
                        onChange={(e, val: any) => {
                            setSelectedUser(val);
                            if (val) {
                                populateUserDetails(val);
                                setValue && setValue('userId', val.userId);
                            } else {
                                clearUserDetails();
                            }
                        }}
                        filterOptions={(options, params) =>
                            options.filter((o: any) => {
                                const txt = params.inputValue.toLowerCase();
                                return (
                                    o.name?.toLowerCase().includes(txt) ||
                                    o.userId?.toString().toLowerCase().includes(txt) ||
                                    o.username?.toLowerCase().includes(txt) ||
                                    o.emailId?.toLowerCase().includes(txt) ||
                                    o.mobileNo?.toLowerCase().includes(txt)
                                );
                            })
                        }
                        disabled={disableAll}
                    />
                </div>
                {showStakeholder && (
                    <div className="col-md-6 px-4">
                        <GenericDropdownController
                            label="Stakeholder"
                            name="stakeholder"
                            control={control}
                            options={stakeholderOptions}
                            rules={{ required: isNonFci ? 'Please select Stakeholder' : false }}
                            className="form-select"
                            disabled={isStakeholderDisabled}
                        />
                    </div>
                )}
                {showFciToggle && <div className="col-md-5 px-4 w-100">
                    <ViewToggle
                        value={viewMode}
                        onChange={setViewMode}
                        options={[
                            { label: t('FCI User'), value: 'fci' },
                            { label: t('Non-FCI User'), value: 'nonFci' }
                        ]}
                        radio={FciTheme}
                        disabled={disableAll}
                    />
                </div>}
                {showUserId && (
                    <div className={`${inputColStyling}`}>
                        <CustomFormInput
                            label="User ID"
                            name="userId"
                            slotProps={{
                                inputLabel: { shrink: userId },
                                input: {
                                    endAdornment: !disableAll && (
                                        <InputAdornment position="end">
                                            {(verified || userId) && (
                                                <CustomIconButton icon="Clear" onClick={clearRequestorDetailsForm} disabled={disableAll} />
                                            )}
                                            <VerifyIconButton
                                                onClick={() => verifyUserById(userId)}
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
                            required={isFciMode}
                            disabled={isUserIdDisabled}
                        />
                    </div>
                )}
                {showRequestorName && requestorName && (
                    <div className={`${inputColStyling}`}>
                        <label className="form-label d-block">Name</label>
                        <p className="mb-0">{requestorName}</p>
                    </div>
                )}
                {showEmailId && emailId && (
                    <div className={`${inputColStyling}`}>
                        <label className="form-label d-block">Email ID</label>
                        <p className="mb-0">{emailId}</p>
                    </div>
                )}
                {showMobileNo && mobileNo && (
                    <div className={`${inputColStyling}`}>
                        <label className="form-label d-block">Mobile No.</label>
                        <p className="mb-0">{mobileNo}</p>
                    </div>
                )}
                {showRole && (
                    <div className={`${inputColStyling}`}>
                        <CustomFormInput
                            slotProps={{
                                inputLabel: { shrink: userId || verified }
                            }}
                            label="Role"
                            name="role"
                            register={register}
                            errors={errors}
                            disabled={isRoleDisabled}
                        />
                    </div>
                )}
                {showOffice && (
                    <div className={`${inputColStyling}`}>
                        <CustomFormInput
                            slotProps={{
                                inputLabel: { shrink: office || verified }
                            }}
                            label="Office"
                            name="office"
                            register={register}
                            errors={errors}
                            disabled={isOfficeDisabled}
                        />
                    </div>
                )}
            </div>}
        </CustomFieldset>
    )
}

export default React.memo(RequestorDetails);
