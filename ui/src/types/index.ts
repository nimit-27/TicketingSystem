import { UseFormRegister, FieldValues, Control, FieldError, FieldErrors, UseFormSetValue } from "react-hook-form"

export type FormProps<T extends FieldValues = FieldValues> = {
    register: UseFormRegister<T>;
    control: Control<T>;
    errors: FieldErrors<T>
    setValue?: UseFormSetValue<T>;
    createMode?: boolean;
};

export interface SubCategory {
    subCategoryId: number;
    subCategory: string;
    createdBy?: string;
    timestamp?: string;
    categoryId?: number; // Optional, used when adding sub-categories directly
    lastUpdated?: string;
}

export interface Category {
    categoryId: number;
    category: string;
    createdBy?: string;
    timestamp?: string;
    lastUpdated?: string;
    subCategories: SubCategory[];
}

export interface Employee {
    name?: string;
    emailId?: string;
    mobileNo?: string;
}

export interface Ticket {
    id: number;
    subject: string;
    category: string;
    subCategory: string;
    priority: string;
    isMaster: boolean;
    employee?: Employee;
    status?: string;
}

export interface ToggleOption {
  icon?: string; // optional
  value: string;
  label?: string; // optional
}
