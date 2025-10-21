import React, { useContext } from "react";
import { Radio, RadioGroup, FormControlLabel } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";

import CustomIconButton from "../UI/IconButton/CustomIconButton";
import { ThemeModeContext } from "../../context/ThemeContext";

type ModeOption = {
    label: string;
    value: string;
    icon: string;
};

interface RequestModeProps {
    allowedModes: ModeOption[];
    disableAll: boolean;
    helpdesk: boolean;
    mode?: string;
    onModeChange: (value: string) => void;
    showModeField: boolean;
}

const RequestMode: React.FC<RequestModeProps> = ({
    allowedModes,
    disableAll,
    helpdesk,
    mode,
    onModeChange,
    showModeField
}) => {
    const theme = useTheme();
    const { layout } = useContext(ThemeModeContext);
    const { t } = useTranslation();

    if (!showModeField || allowedModes.length === 0) {
        return null;
    }

    const handleModeSelection = (value: string) => {
        onModeChange(value);
    };

    const renderLayoutOne = () => (
        <div
            className="px-4 border rounded-2 mb-4 py-1 d-flex gap-4 align-items-center"
            style={{ width: "fit-content" }}
        >
            <span className="text-muted fs-6">{t("Request Mode")}</span>
            {allowedModes.map(opt => {
                const isSelected = mode === opt.value;

                return (
                    <div
                        key={opt.value}
                        onClick={() => handleModeSelection(opt.value)}
                        style={{ cursor: "pointer" }}
                        className="text-center"
                    >
                        <CustomIconButton
                            className="p-0 m-0 ts-20"
                            icon={opt.icon}
                            disabled={disableAll || !helpdesk}
                            sx={{
                                color: isSelected ? theme.palette.secondary.main : theme.palette.primary.main
                            }}
                        />
                        <p
                            className="p-0 m-0 ts-14"
                            style={{
                                color: isSelected ? theme.palette.secondary.main : theme.palette.primary.main
                            }}
                        >
                            {t(opt.label)}
                        </p>
                    </div>
                );
            })}
        </div>
    );

    const renderLayoutTwo = () => (
        <div className="px-4 border rounded-2 mb-4 py-3" style={{ width: "fit-content" }}>
            <span className="text-muted fs-6 d-block mb-2">{t("Request Mode")}</span>
            <RadioGroup
                row
                value={mode || allowedModes[0]?.value || ""}
                onChange={event => handleModeSelection(event.target.value)}
                sx={{ display: "flex", gap: 2 }}
            >
                {allowedModes.map(opt => (
                    <FormControlLabel
                        key={opt.value}
                        value={opt.value}
                        control={(
                            <Radio
                                disabled={disableAll || !helpdesk}
                                sx={{
                                    color: theme.palette.sidebar.background,
                                    "&.Mui-checked": { color: theme.palette.sidebar.background }
                                }}
                            />
                        )}
                        label={t(opt.label)}
                    />
                ))}
            </RadioGroup>
        </div>
    );

    return layout === 2 ? renderLayoutTwo() : renderLayoutOne();
};

export default React.memo(RequestMode);
