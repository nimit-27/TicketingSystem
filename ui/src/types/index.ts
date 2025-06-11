import { UseFormRegister, FieldValues, Control, FieldError, FieldErrors, UseFormSetValue } from "react-hook-form"

export type FormProps<T extends FieldValues = FieldValues> = {
    register: UseFormRegister<T>;
    control: Control<T>;
    errors: FieldErrors<T>
    setValue?: UseFormSetValue<T>;
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

