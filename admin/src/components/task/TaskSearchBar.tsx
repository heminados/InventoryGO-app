// Search box + "Create Task" button shown at the top of the task page.
// TaskManage.tsx passes the current search text plus callbacks for when
// the text changes or the create button is clicked.
import { Box, Button, TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';

interface TaskSearchBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  onCreateClick: () => void;
}

export default function TaskSearchBar({ search, onSearchChange, onCreateClick }: TaskSearchBarProps) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {/* Search field — filters the table in real time */}
      <TextField
        size="small"
        placeholder="Search by title, employee or status..."
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
      {/* Opens the Create Task dialog */}
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={onCreateClick}
        sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2, whiteSpace: 'nowrap' }}
      >
        Create Task
      </Button>
    </Box>
  );
}
