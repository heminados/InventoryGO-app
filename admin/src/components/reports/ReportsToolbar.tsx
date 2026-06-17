// Search box + status filter shown at the top of the reports page.
// Reports.tsx passes the current search text and status filter plus callbacks
// for when either one changes. (Read-only page, so there is no add button.)
import { Box, TextField, InputAdornment, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { ReportStatus } from './types';

interface ReportsToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: ReportStatus | 'ALL';
  onStatusFilterChange: (value: ReportStatus | 'ALL') => void;
}

export default function ReportsToolbar({ search, onSearchChange, statusFilter, onStatusFilterChange }: ReportsToolbarProps) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {/* Search field — filters the table in real time */}
      <TextField
        size="small"
        placeholder="Search by action, user or product..."
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
      {/* Status filter — narrows the table to Normal or Exception reports */}
      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel>Status</InputLabel>
        <Select
          value={statusFilter}
          label="Status"
          onChange={(e) => onStatusFilterChange(e.target.value as ReportStatus | 'ALL')}
        >
          <MenuItem value="ALL">All Statuses</MenuItem>
          <MenuItem value="NORMAL">Normal</MenuItem>
          <MenuItem value="EXCEPTION">Exception</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
}
