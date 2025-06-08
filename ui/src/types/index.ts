import { UseFormRegister, FieldValues, Control, FieldError, FieldErrors, UseFormSetValue } from "react-hook-form"

export type FormProps<T extends FieldValues = FieldValues> = {
    register: UseFormRegister<T>;
    control: Control<T>;
    errors: FieldErrors<T>
    setValue?: UseFormSetValue<T>;
};

