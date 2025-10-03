import React, { ChangeEvent, useCallback } from "react";
import { IconButton, Pagination } from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import GenericInput from "./UI/Input/GenericInput";

interface PaginationControlsProps {
    page: number;
    totalPages: number;
    onChange: (event: ChangeEvent<unknown>, value: number) => void;
    className?: string;
    pageSize?: number;
    onPageSizeChange?: (value: number) => void;
    pageSizeLabel?: string;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
    page,
    totalPages,
    onChange,
    className,
    pageSize,
    onPageSizeChange,
    pageSizeLabel = "/ page",
}) => {
    const handlePageSizeChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            if (!onPageSizeChange) {
                return;
            }

            const value = parseInt(event.target.value, 10);
            if (!Number.isNaN(value) && value > 0) {
                onPageSizeChange(value);
            }
        },
        [onPageSizeChange],
    );

    const decreasePageSize = useCallback(() => {
        if (!onPageSizeChange || typeof pageSize !== "number") {
            return;
        }

        onPageSizeChange(Math.max(1, pageSize - 1));
    }, [onPageSizeChange, pageSize]);

    const increasePageSize = useCallback(() => {
        if (!onPageSizeChange || typeof pageSize !== "number") {
            return;
        }

        onPageSizeChange(pageSize + 1);
    }, [onPageSizeChange, pageSize]);

    const containerClasses = ["d-flex align-items-center", className]
        .filter(Boolean)
        .join(" ");

    return (
        <div className={containerClasses}>
            <Pagination count={totalPages} page={page} onChange={onChange} color="primary" />
            {typeof pageSize === "number" && onPageSizeChange && (
                <div className="d-flex align-items-center ms-3">
                    <IconButton size="small" onClick={decreasePageSize}>
                        <ArrowDropDownIcon />
                    </IconButton>
                    <GenericInput
                        type="number"
                        value={pageSize}
                        onChange={handlePageSizeChange}
                        size="small"
                        sx={{ width: 60, mx: 1 }}
                    />
                    <span>{pageSizeLabel}</span>
                    <IconButton size="small" onClick={increasePageSize}>
                        <ArrowDropUpIcon />
                    </IconButton>
                </div>
            )}
        </div>
    );
};

export default PaginationControls;
