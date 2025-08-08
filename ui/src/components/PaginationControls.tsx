import React from 'react';
import { Pagination, PaginationItem } from '@mui/material';

interface PaginationControlsProps {
    page: number;
    totalPages: number;
    onChange: (event: React.ChangeEvent<unknown>, value: number) => void;
    className?: string;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({ page, totalPages, onChange, className }) => (
    <Pagination
        count={totalPages}
        page={page}
        onChange={onChange}
        className={className}
        color="primary"
        boundaryCount={3}
        siblingCount={0}
        renderItem={(item) => {
            if (item.type === 'page') {
                if (item.page <= 3 || item.page === totalPages) {
                    return <PaginationItem {...item} />;
                }
                if (item.page === 4) {
                    return <PaginationItem {...item} type="end-ellipsis" />;
                }
                return null;
            }
            if (item.type === 'end-ellipsis' || item.type === 'start-ellipsis') {
                return null;
            }
            return <PaginationItem {...item} />;
        }}
    />
);

export default PaginationControls;
