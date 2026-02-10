import React, { ChangeEvent, useCallback, useId, useMemo } from "react";
import { FormControl, IconButton, InputLabel, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import LastPageIcon from "@mui/icons-material/LastPage";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

interface PaginationControlsProps {
    page: number;
    totalPages: number;
    onChange: (event: ChangeEvent<unknown>, value: number) => void;
    className?: string;
    pageSize?: number;
    onPageSizeChange?: (value: number) => void;
    pageSizeLabel?: string;
    totalCount?: number;
    pageSizeOptions?: number[];
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
    page,
    totalPages,
    onChange,
    className,
    pageSize,
    onPageSizeChange,
    pageSizeLabel = "Rows per page",
    totalCount,
    pageSizeOptions = [5, 10, 20, 40, 60],
}) => {
    const safePage = Math.max(page, 1);
    const safeTotalPages = Math.max(totalPages, 0);
    const hasPageSize = typeof pageSize === "number" && pageSize > 0;

    const totalItems = useMemo(() => {
        if (typeof totalCount === "number") {
            return Math.max(totalCount, 0);
        }

        if (hasPageSize) {
            return safeTotalPages * pageSize!;
        }

        return 0;
    }, [hasPageSize, pageSize, safeTotalPages, totalCount]);

    const { startItem, endItem } = useMemo(() => {
        if (!hasPageSize || safeTotalPages === 0) {
            return { startItem: 0, endItem: 0 };
        }

        const start = (safePage - 1) * pageSize! + 1;
        const calculatedEnd = start + pageSize! - 1;
        const end = totalItems > 0 ? Math.min(calculatedEnd, totalItems) : calculatedEnd;

        return { startItem: start, endItem: end };
    }, [hasPageSize, pageSize, safePage, safeTotalPages, totalItems]);

    const labelId = useId();

    const normalizedPageSizeOptions = useMemo(() => {
        if (!hasPageSize) {
            return pageSizeOptions;
        }

        return pageSizeOptions.includes(pageSize!)
            ? pageSizeOptions
            : [...pageSizeOptions, pageSize!].sort((a, b) => a - b);
    }, [hasPageSize, pageSize, pageSizeOptions]);

    const handlePageSizeSelectChange = useCallback(
        (event: any) => {
        // (event: SelectChangeEvent) => {
            if (!onPageSizeChange) {
                return;
            }

            const value = Number(event.target.value);
            if (!Number.isNaN(value) && value > 0) {
                onPageSizeChange(value);
            }
        },
        [onPageSizeChange],
    );

    const handleFirstPage = useCallback(() => {
        if (safePage <= 1) {
            return;
        }

        onChange({} as ChangeEvent<unknown>, 1);
    }, [onChange, safePage]);

    const handlePreviousPage = useCallback(() => {
        if (safePage <= 1) {
            return;
        }

        onChange({} as ChangeEvent<unknown>, safePage - 1);
    }, [onChange, safePage]);

    const handleNextPage = useCallback(() => {
        if (safePage >= safeTotalPages) {
            return;
        }

        onChange({} as ChangeEvent<unknown>, safePage + 1);
    }, [onChange, safePage, safeTotalPages]);

    const handleLastPage = useCallback(() => {
        if (safePage >= safeTotalPages) {
            return;
        }

        onChange({} as ChangeEvent<unknown>, safeTotalPages || 1);
    }, [onChange, safePage, safeTotalPages]);

    const containerClasses = ["d-flex align-items-center", className]
        .filter(Boolean)
        .join(" ");

    return (
        <div className={containerClasses}>
            {hasPageSize && onPageSizeChange && (
                <div className="d-flex align-items-center me-3">
                    <FormControl size="small" variant="outlined">
                        <InputLabel id={labelId}>{pageSizeLabel}</InputLabel>
                        <Select
                            labelId={labelId}
                            value={pageSize}
                            label={pageSizeLabel}
                            onChange={handlePageSizeSelectChange}
                        >
                            {normalizedPageSizeOptions.map((option) => (
                                <MenuItem key={option} value={option}>
                                    {option}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </div>
            )}
            <div className="me-3">
                {hasPageSize && startItem > 0 ? (
                    <span>{`${startItem}–${endItem} of ${totalItems || endItem}`}</span>
                ) : (
                    <span>{`Page ${safePage} of ${Math.max(safeTotalPages, 1)}`}</span>
                )}
            </div>
            <div className="d-flex align-items-center">
                <IconButton size="small" onClick={handleFirstPage} disabled={safePage <= 1} aria-label="first page">
                    <FirstPageIcon />
                </IconButton>
                <IconButton size="small" onClick={handlePreviousPage} disabled={safePage <= 1} aria-label="previous page">
                    <NavigateBeforeIcon />
                </IconButton>
                <IconButton
                    size="small"
                    onClick={handleNextPage}
                    disabled={safePage >= safeTotalPages}
                    aria-label="next page"
                >
                    <NavigateNextIcon />
                </IconButton>
                <IconButton
                    size="small"
                    onClick={handleLastPage}
                    disabled={safePage >= safeTotalPages}
                    aria-label="last page"
                >
                    <LastPageIcon />
                </IconButton>
            </div>
        </div>
    );
};

export default PaginationControls;
