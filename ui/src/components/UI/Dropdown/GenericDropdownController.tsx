import { Control, Controller, FieldValues, RegisterOptions } from "react-hook-form"
import GenericDropdown, { GenericDropdownProps } from "./GenericDropdown"

interface GenericDropdownControllerProps<T extends FieldValues = any> extends Omit<GenericDropdownProps, "onChange"> {
    name: string;
    control: Control<T>;
    rules?: RegisterOptions;
}

const GenericDropdownController: React.FC<GenericDropdownControllerProps> = ({
    name,
    control,
    rules,
    ...dropdownProps
}) => {
    return (
        <Controller
            name={name}
            control={control}
            rules={rules}
            render={({ field }) => (
                <GenericDropdown
                    {...field}
                    {...dropdownProps}
                />
            )}
        />
    )
}

export default GenericDropdownController;