// The users table with role/status chips, the edit + reset-password actions,
// and pagination. EmployeeManage.tsx passes the rows to show (already filtered
// + paginated), the loading flag, pagination values, and the action callbacks.
import {
  Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination, Chip, IconButton, Tooltip, Avatar, CircularProgress, Box, Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import LockResetIcon from '@mui/icons-material/LockReset';
import { User } from './types';

// Options shown in the rows-per-page dropdown at the bottom of the table
const ROWS_PER_PAGE_OPTIONS = [10, 25, 50];

interface EmployeeTableProps {
  rows: User[];          // rows for the current page
  loading: boolean;      // true while the first fetch is in-flight
  count: number;         // total number of filtered users (for pagination)
  page: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  onEdit: (user: User) => void;
  onResetPassword: (userId: number) => void;
}

// Formats an ISO date into "DD Mon YYYY" for the Join Date column
const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

// Converts an uppercase enum value ("MANAGER") to title case ("Manager")
const roleLabel = (role: string) => role.charAt(0) + role.slice(1).toLowerCase();

export default function EmployeeTable({
  rows, loading, count, page, rowsPerPage, onPageChange, onRowsPerPageChange, onEdit, onResetPassword,
}: EmployeeTableProps) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 2 }}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow
              sx={{
                '& th': {
                  fontWeight: 700,
                  bgcolor: '#f9fafb',
                  fontSize: 13,
                  color: 'text.secondary',
                  borderBottom: '1px solid #e5e7eb',
                },
              }}
            >
              <TableCell>Full Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Join Date</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {/* Show a spinner while the first fetch is in-flight */}
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              /* Empty state — no users match the current search */
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((user) => (
                <TableRow
                  key={user.id}
                  hover
                  sx={{ '& td': { fontSize: 14, borderBottom: '1px solid #f3f4f6' } }}
                >
                  {/* Name cell: avatar initial + full name */}
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: '#e0e7ff', color: '#4338ca', fontSize: 13, fontWeight: 700 }}>
                        {user.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>{user.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>{user.email}</TableCell>
                  {/* Role chip — neutral grey, title-cased */}
                  <TableCell>
                    <Chip
                      label={roleLabel(user.role)}
                      size="small"
                      sx={{ bgcolor: '#f1f5f9', color: '#334155', fontWeight: 500, fontSize: 12 }}
                    />
                  </TableCell>
                  {/* Status chip — green for active, red for inactive */}
                  <TableCell>
                    <Chip
                      label={user.is_active ? 'Active' : 'Inactive'}
                      size="small"
                      sx={{
                        bgcolor: user.is_active ? '#dcfce7' : '#fee2e2',
                        color: user.is_active ? '#16a34a' : '#dc2626',
                        fontWeight: 600,
                        fontSize: 12,
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>{formatDate(user.created_at)}</TableCell>
                  {/* Action buttons: edit opens the drawer, reset triggers the API immediately */}
                  <TableCell align="center">
                    <Tooltip title="Edit User">
                      <IconButton size="small" onClick={() => onEdit(user)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Reset Password">
                      <IconButton size="small" onClick={() => onResetPassword(user.id)}>
                        <LockResetIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination controls — works on the filtered list, not the full one */}
      <TablePagination
        component="div"
        count={count}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
        onPageChange={(_, newPage) => onPageChange(newPage)}
        onRowsPerPageChange={(e) => onRowsPerPageChange(parseInt(e.target.value, 10))}
      />
    </Card>
  );
}
