import { Checkbox, FormControlLabel, InputAdornment, ToggleButton, ToggleButtonGroup, Autocomplete, TextField, Card, IconButton, CircularProgress } from "@mui/material";
import { formFieldValue, inputColStyling } from "../../constants/bootstrapClasses";
import { FormProps } from "../../types";
import CustomFormInput from "../UI/Input/CustomFormInput";
import VerifyIconButton from "../UI/IconButton/VerifyIconButton";
import { getUserDetailsWithFallback, searchRequesterUsers } from "../../services/UserService";
import { FieldValues, useWatch } from "react-hook-form";
import { useApi } from "../../hooks/useApi";
import { useDebounce } from "../../hooks/useDebounce";
import React, { useCallback, useEffect, useMemo, useState } from "react";
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
import UserAvatar from "../UI/UserAvatar/UserAvatar";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { RequesterUser } from "../../types/users";

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
    const [requesterUsers, setRequesterUsers] = useState<RequesterUser[]>([]);
    const [userPage, setUserPage] = useState(0);
    const [hasMoreUsers, setHasMoreUsers] = useState(true);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const { t } = useTranslation();

    const fciUser = isFciUser();
    const helpdesk = isHelpdesk();

    const isDisabled = disableAll || disabled;

    const { data: userDetailsData, pending, success, apiHandler: getUserDetailsApiHandler } = useApi<any>();
    const { apiHandler: getRequesterUsersApiHandler } = useApi<any>();
    const { data: stakeholderData, apiHandler: getStakeholdersApiHandler } = useApi<any>();

    const userId = useWatch({ control, name: 'userId' });
    const mode = useWatch({ control, name: 'mode', defaultValue: 'Self' });
    const onBehalfFciUser = useWatch({ control, name: 'onBehalfFciUser' });
    const office = useWatch({ control, name: 'office' });
    const mobileNo = useWatch({ control, name: 'mobileNo' });
    const emailId = useWatch({ control, name: 'emailId' });
    const requestorName = useWatch({ control, name: 'requestorName' });
    const stakeholder = useWatch({ control, name: 'stakeholder' });
    const role = useWatch({ control, name: 'role' });
    const debouncedUserId = useDebounce(userId, 500);
    const debouncedSearchText = useDebounce(searchText, 500);

    const PAGE_SIZE = 10;

    const stakeholderOptions: DropdownOption[] = useMemo(() => {
        const rawStakeholders = Array.isArray(stakeholderData)
            ? stakeholderData
            : Array.isArray((stakeholderData as any)?.data)
                ? (stakeholderData as any)?.data
                : [];

        const uniqueStakeholders = Array.from(
            new Map(rawStakeholders.map((s: any) => [String(s.id), s])).values()
        );

        return uniqueStakeholders.map((s: any) => ({
            label: s.description || s.name || s.stakeholder || 'Stakeholder',
            value: String(s.id)
        }));
    }, [stakeholderData]);

    const fetchRequesterUsers = useCallback((pageToLoad: number = 0, append: boolean = false) => {
        setLoadingUsers(true);
        return getRequesterUsersApiHandler(() => searchRequesterUsers(
            debouncedSearchText.trim(),
            undefined,
            stakeholder || undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            '',
            pageToLoad,
            PAGE_SIZE,
        )).then((response: any) => {
            const items: RequesterUser[] = response?.items ?? [];
            const totalPages = response?.totalPages ?? 0;
            const totalElements = response?.totalElements;
            const serverSaysMore = totalPages ? pageToLoad < totalPages - 1 : false;
            const inferredMore = typeof totalElements === 'number'
                ? (pageToLoad + 1) * PAGE_SIZE < totalElements
                : items.length === PAGE_SIZE;
            const canLoadMore = serverSaysMore || inferredMore;
            setHasMoreUsers(canLoadMore);
            setUserPage(pageToLoad);
            setRequesterUsers((prev) => append ? [...prev, ...items] : items);
        }).finally(() => setLoadingUsers(false));
    }, [debouncedSearchText, stakeholder, getRequesterUsersApiHandler]);

    const handleLoadMoreUsers = useCallback(() => {
        if (loadingUsers || !hasMoreUsers) return;
        const nextPage = userPage + 1;
        fetchRequesterUsers(nextPage, true);
    }, [fetchRequesterUsers, hasMoreUsers, loadingUsers, userPage]);

    const autocompleteOptions = useMemo(() => {
        const options: (RequesterUser | { loadMore: true })[] = [...requesterUsers];
        if (hasMoreUsers) {
            options.push({ loadMore: true });
        }
        return options;
    }, [hasMoreUsers, requesterUsers]);

    let showRequestorDetails = true;
    // let showRequestorDetails = mode.toLowerCase() !== 'self';

    const getUserDetailsHandler = (userId: any) => {
        getUserDetailsApiHandler(() => getUserDetailsWithFallback(userId, helpdesk));
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
            setValue("officeCode", "");
            setValue("regionCode", "");
            setValue("zoneCode", "");
            setValue("districtCode", "");
        }
    }

    const populateUserDetails = (data: any) => {
        console.log("Populating user details:", data);
        setSelectedUser(data)
        if (setValue && data) {
            setValue("requestorName", data.name ?? data.username ?? "");
            setValue("emailId", data.emailId);
            setValue("mobileNo", data.mobileNo);

            const resolvedRole = Array.isArray(data?.role)
                ? data.role.filter(Boolean).join(', ')
                : Array.isArray(data?.roles)
                    ? data.roles.filter(Boolean).join(', ')
                    : data?.role ?? data?.roles ?? '';

            setValue("role", resolvedRole);
            setValue("office", data?.office ?? data?.officeName ?? '');
            setValue("officeCode", data?.officeCode ?? '');
            setValue("regionCode", data?.regionCode ?? '');
            setValue("zoneCode", data?.zoneCode ?? '');
            setValue("districtCode", data?.districtCode ?? '');

            if (!fciUser) {
                setValue("stakeholder", data.stakeholderId ?? data.stakeholder);
            }
        }
    };

    useEffect(() => {
        register('role');
        register('office');
        register('officeCode');
        register('regionCode');
        register('zoneCode');
        register('districtCode');
    }, [register]);

    useEffect(() => {
        fetchRequesterUsers();
    }, [fetchRequesterUsers]);

    useEffect(() => {
        getStakeholdersApiHandler(() => getStakeholders());
    }, [getStakeholdersApiHandler]);

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

    useEffect(() => {
        if (success) {
            setVerified(true);
            if (setValue && userDetailsData) {
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
            setValue("officeCode", "");
            setValue("regionCode", "");
            setValue("zoneCode", "");
            setValue("districtCode", "");
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
    const showMobileNo = checkFieldAccess('requestorDetails', 'phoneNumber');
    const showStakeholder = checkFieldAccess('requestorDetails', 'stakeholder') && mode !== 'Self'

    const showRole = checkFieldAccess('requestorDetails', 'role')
    // && (viewMode === FCI_User || fciUser || onBehalfFciUser || isSelfHelpdesk);
    const showOffice = checkFieldAccess('requestorDetails', 'office')
    // && (viewMode === FCI_User || fciUser || onBehalfFciUser) && !isSelfHelpdesk;

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

    const isLoadMoreOption = (option: any): option is { loadMore: true } => option?.loadMore;

    const handleSelectUserChange = (e: any, val: any) => {
        if (val && isLoadMoreOption(val)) {
            handleLoadMoreUsers();
            return;
        }
        setSelectedUser(val);
        if (val) {
            populateUserDetails(val);
            setValue && setValue('userId', val.requesterUserId);
            setSearchText(val.name || val.username || '');
        } else {
            clearUserDetails();
        }
    }

    const handleFilterOptions = (options: any[]) => options;

    const renderReadOnlyField = (label: string, value: string) => (
        <div className={`${formFieldValue} justify-content-center text-center flex-column flex-md-row`}>
            <p className="mb-0 text-muted ts-13">{label}</p>
            <p className="mb-0 ts-13">{value}</p>
        </div>
    );

    const renderUserOption = (props: React.HTMLAttributes<HTMLLIElement>, option: any) => {
        if (isLoadMoreOption(option)) {
            return (
                <li
                    {...props}
                    key="load-more-users"
                    onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        handleLoadMoreUsers();
                    }}
                    className="d-flex align-items-center gap-2"
                >
                    <IconButton size="small" color="primary" disabled={loadingUsers || !hasMoreUsers}>
                        <KeyboardArrowDownIcon />
                    </IconButton>
                    <span className="ms-1">Load more users</span>
                </li>
            );
        }

        const identityParts = [option.username, option.requesterUserId].filter(Boolean);
        const contactParts = Array.from(new Set([option.mobileNo, option.emailId].filter(Boolean)));

        return (
            <li {...props} key={option.requesterUserId} className="d-flex w-100 align-items-start justify-content-between gap-3 py-2">
                <div className="d-flex flex-column">
                    <span className="fw-semibold">{option.name}</span>
                    {identityParts.length > 0 && (
                        <span className="text-muted ts-13">{identityParts.join(' • ')}</span>
                    )}
                </div>
                {contactParts.length > 0 && (
                    <div className="text-end text-muted ts-13">
                        {contactParts.map((part: string) => (
                            <div key={part}>{part}</div>
                        ))}
                    </div>
                )}
            </li>
        );
    };

    return (
        <>
            {showRequestorDetails && <CustomFieldset title={t('Requestor Details')} className="mb-1">
                <div className="d-flex w-100 flex-column flex-lg-row align-items-start gap-3 justify-content-between">
                    {(showSearchUserAutocomplete || showStakeholder) && (
                        <div className="col-lg-6 d-flex flex-column">
                            {showSearchUserAutocomplete && (
                                <Autocomplete
                                    options={autocompleteOptions}
                                    getOptionLabel={(option: any) => isLoadMoreOption(option) ? 'Load more users' : option.name || option.username || ''}
                                    renderOption={renderUserOption}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Search User"
                                            size="small"
                                            InputProps={{
                                                ...params.InputProps,
                                                endAdornment: (
                                                    <>
                                                        {loadingUsers ? <CircularProgress color="inherit" size={20} /> : null}
                                                        {params.InputProps.endAdornment}
                                                    </>
                                                ),
                                            }}
                                        />
                                    )}
                                    value={selectedUser}
                                    inputValue={searchText}
                                    onInputChange={(e, val, reason) => {
                                        setSearchText(val);
                                        if (reason === 'clear') {
                                            setSelectedUser(null);
                                            clearUserDetails();
                                        }
                                    }}
                                    onChange={handleSelectUserChange}
                                    filterOptions={handleFilterOptions}
                                    isOptionEqualToValue={(option, value) => !isLoadMoreOption(option) && option.requesterUserId === value?.requesterUserId}
                                    disabled={disableAll}
                                    loading={loadingUsers}
                                />
                            )}
                            {showStakeholder && (
                                <GenericDropdownController
                                    label="Stakeholder"
                                    name="stakeholder"
                                    control={control}
                                    options={stakeholderOptions}
                                    rules={{ required: false }}
                                    className="form-select mt-3"
                                    disabled={isStakeholderDisabled}
                                />
                            )}
                        </div>
                    )}
                    {showRequestorDetailsCard && (
                        <div className="p-3 bg-light border rounded shadow-sm flex-grow-1 flex-lg-grow-0" style={{ minWidth: '280px', maxWidth: '360px' }}>
                            <div className="d-flex align-items-center justify-content-center mb-2">
                                <UserAvatar name={requestorName} />
                                {/* <span className="ms-2 fs-5">{requestorName}</span> */}
                            </div>
                            <div className="d-flex flex-column align-items-center mb-2 justify-content-center">
                                {showRequestorName && requestorName && (
                                    <div className="fw-semibold">{requestorName}</div>
                                )}
                                {(showEmailId && emailId) || (showMobileNo && mobileNo) ? (
                                    <div className="text-muted">
                                        {showEmailId && emailId && <span className="ts-14">{emailId}</span>}
                                        {showEmailId && emailId && showMobileNo && mobileNo && <span> | </span>}
                                        {showMobileNo && mobileNo && <span className="ts-13">{mobileNo}</span>}
                                    </div>
                                ) : null}
                            </div>
                            <div className="w-100">
                                {/* {showRole && role && renderReadOnlyField("Role", role)} */}
                                {showOffice && office && renderReadOnlyField("Office", office)}
                                {selectedUser?.officeType && renderReadOnlyField("Office Type", selectedUser.officeType)}
                                {selectedUser?.officeCode && renderReadOnlyField("Office Code", selectedUser.officeCode)}
                                {selectedUser?.stakeholder && renderReadOnlyField("Stakeholder", selectedUser.stakeholder)}
                            </div>
                        </div>
                    )}
                </div>

            </CustomFieldset>}
        </>
    )
}

export default React.memo(RequestorDetails);
