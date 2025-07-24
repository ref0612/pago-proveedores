import React from 'react';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';

interface PaginationControlsProps {
  page: number;
  pageSize: number;
  total: number;
  onChange: (event: React.ChangeEvent<unknown>, value: number) => void;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({ page, pageSize, total, onChange }) => {
  const pageCount = Math.ceil(total / pageSize);
  if (pageCount <= 1) return null;
  return (
    <Stack spacing={2} alignItems="center" marginY={2}>
      <Pagination
        count={pageCount}
        page={page + 1}
        onChange={onChange}
        color="primary"
        showFirstButton
        showLastButton
      />
    </Stack>
  );
};

export default PaginationControls;
