import { Control, Controller, FieldValues, RegisterOptions } from "react-hook-form"
import { SelectChangeEvent } from "@mui/material/Select"
import GenericDropdown, { GenericDropdownProps } from "./GenericDropdown"

interface GenericDropdownControllerProps<T extends FieldValues = any> extends Omit<GenericDropdownProps, "onChange"> {
    name: string;
    control: Control<T>;
    rules?: RegisterOptions;
    onChange?: GenericDropdownProps["onChange"];
}

const GenericDropdownController: React.FC<GenericDropdownControllerProps> = ({
    name,
    control,
    rules,
    onChange: externalOnChange,
    ...dropdownProps
}) => {
    return (
        <Controller
            name={name}
            control={control}
            rules={rules}
            render={({ field, fieldState }) => {
                const handleChange = (event: SelectChangeEvent) => {
                    field.onChange(event);
                    externalOnChange?.(event);
                };

                return (
                    <GenericDropdown
                        {...dropdownProps}
                        {...field}
                        onChange={handleChange}
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                    />
                );
            }}
        />
    )
}

export default GenericDropdownController;