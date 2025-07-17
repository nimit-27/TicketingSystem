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

export interface Ticket {
    id: string;
    subject: string;
    category: string;
    subCategory: string;
    priority: string;
    isMaster: boolean;
    requestorName?: string;
    requestorEmailId?: string;
    requestorMobileNo?: string;
    status?: string;
    assignedTo?: string;
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