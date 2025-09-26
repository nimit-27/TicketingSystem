import { UseFormRegister, FieldValues, Control, FieldError, FieldErrors, UseFormSetValue } from "react-hook-form"

export type FormProps<T extends FieldValues = FieldValues> = {
    register: UseFormRegister<T>;
    control: Control<T>;
    errors: FieldErrors<T>
    setValue?: UseFormSetValue<T>;
    createMode?: boolean;
};

export interface SubCategory {
    subCategoryId: string;
    subCategory: string;
    createdBy?: string;
    timestamp?: string;
    categoryId?: string; // Optional, used when adding sub-categories directly
    lastUpdated?: string;
}

export interface Category {
    categoryId: string;
    category: string;
    createdBy?: string;
    timestamp?: string;
    lastUpdated?: string;
    subCategories: SubCategory[];
}

export interface PriorityInfo {
    id: string;
    level: string;
    description: string;
}

export interface SeverityInfo {
    id: string;
    level: string;
    description: string;
    weightage: number;
}

export interface Ticket {
    id: string;
    subject: string;
    description?: string;
    category: string;
    subCategory: string;
    priority: string;
    priorityId?: string;
    isMaster: boolean;
    userId?: string;
    requestorName?: string;
    requestorEmailId?: string;
    requestorMobileNo?: string;
    reportedDate?: string; // ISO-8601 datetime
    statusId?: string;
    statusLabel?: string;
    assignedTo?: string;
    assignedBy?: string;
    updatedBy?: string;
    lastModified?: string;
    feedbackStatus?: 'PENDING' | 'PROVIDED' | 'NOT_PROVIDED';
}

export interface TicketStatusWorkflow {
    id: number;
    action: string;
    currentStatus: number;
    nextStatus: number;
}

export interface ToggleOption {
    icon?: string; // optional
    value: string;
    label?: string; // optional
}

export interface ApiError {
    message: string;
    status: number;
    path: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: ApiError;
    timestamp: string;
}

export interface TicketSla {
    id: string;
    dueAt?: string;
    resolutionTimeMinutes?: number;
    elapsedTimeMinutes?: number;
    responseTimeMinutes?: number;
    breachedByMinutes?: number;
    totalSlaMinutes?: number;
    dueDate?: string;
    createdAt?: string;
    timeTillDueDate?: number;
}

export interface Faq {
    id: string;
    questionEn?: string;
    questionHi?: string;
    answerEn?: string;
    answerHi?: string;
    keywords?: string;
    createdBy?: string;
    createdOn?: string;
    updatedBy?: string;
    updatedOn?: string;
}

export interface PermissionNode {
    show?: boolean;
    metadata?: {
        type?: string;
        name?: string;
    };
    children?: { [key: string]: PermissionNode } | null;
}
