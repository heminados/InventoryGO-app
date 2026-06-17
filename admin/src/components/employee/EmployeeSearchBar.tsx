// Search box + "Add New User" button shown at the top of the user page.
// EmployeeManage.tsx passes the current search text plus callbacks for when
// the text changes or the add button is clicked.
import { Box, Button, TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';

interface EmployeeSearchBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  onAddClick: () => void;
}

export default function EmployeeSearchBar({ search, onSearchChange, onAddClick }: EmployeeSearchBarProps) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {/* Search field — filters the table in real time */}
      <TextField
        size="small"
        placeholder="Search by name, email or role..."
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
        sx={{ width: 260 }}
      />
      {/* Opens the Add User dialog */}
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={onAddClick}
        sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2, whiteSpace: 'nowrap' }}
      >
        Add New User
      </Button>
    </Box>
  );
}
