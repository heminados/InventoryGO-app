// Search box + status filter dropdown shown at the top of the order page.
// OrderManage.tsx passes the current search text and status filter plus
// callbacks for when either one changes.
import { Box, TextField, InputAdornment, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { OrderStatus } from './types';

interface OrderSearchBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: OrderStatus | 'ALL';
  onStatusFilterChange: (value: OrderStatus | 'ALL') => void;
}

export default function OrderSearchBar({ search, onSearchChange, statusFilter, onStatusFilterChange }: OrderSearchBarProps) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {/* Search field — filters the table in real time */}
      <TextField
        size="small"
        placeholder="Search by ID, customer or manager..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
          },
        }}
        sx={{ width: 300 }}
      />
      {/* Status filter — narrows the table to one order status */}
      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel>Status</InputLabel>
        <Select
          value={statusFilter}
          label="Status"
          onChange={(e) => onStatusFilterChange(e.target.value as OrderStatus | 'ALL')}
        >
          <MenuItem value="ALL">All Statuses</MenuItem>
          <MenuItem value="PENDING">Pending</MenuItem>
          <MenuItem value="APPROVED">Approved</MenuItem>
          <MenuItem value="REJECTED">Rejected</MenuItem>
          <MenuItem value="COMPLETED">Completed</MenuItem>
          <MenuItem value="CANCELLED">Cancelled</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
}
