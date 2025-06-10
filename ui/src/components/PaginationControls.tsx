import React from 'react';
import { Pagination } from '@mui/material';

interface PaginationControlsProps {
    page: number;
    totalPages: number;
    onChange: (event: React.ChangeEvent<unknown>, value: number) => void;
    className?: string;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({ page, totalPages, onChange, className }) => (
    <Pagination count={totalPages} page={page} onChange={onChange} className={className} color="primary" />
);

export default PaginationControls;
