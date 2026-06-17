// The tasks table with assignee chips, status chip, and the edit + cancel
// actions, plus pagination. TaskManage.tsx passes the rows to show (already
// filtered + paginated), the loading flag, pagination values, and the callbacks.
import {
  Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination, Chip, IconButton, Tooltip, Avatar, CircularProgress, Box, Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import BlockIcon from '@mui/icons-material/Block';
import { Task, STATUS_CONFIG } from './types';

// Options shown in the rows-per-page dropdown at the bottom of the table
const ROWS_PER_PAGE_OPTIONS = [10, 25, 50];

interface TaskTableProps {
  rows: Task[];          // rows for the current page
  loading: boolean;      // true while the first fetch is in-flight
  count: number;         // total number of filtered tasks (for pagination)
  page: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  onEdit: (task: Task) => void;
  onCancel: (taskId: number) => void;
}

// Formats an ISO date into "DD Mon YYYY", or "—" when there's no date
const formatDate = (iso: string | null) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

export default function TaskTable({
  rows, loading, count, page, rowsPerPage, onPageChange, onRowsPerPageChange, onEdit, onCancel,
}: TaskTableProps) {
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
              <TableCell>Title</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Assigned To</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                  No tasks found.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((task) => {
                const statusCfg = STATUS_CONFIG[task.status];
                return (
                  <TableRow
                    key={task.id}
                    hover
                    sx={{ '& td': { fontSize: 14, borderBottom: '1px solid #f3f4f6' } }}
                  >
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>{task.title}</Typography>
                    </TableCell>
                    <TableCell sx={{ color: 'text.secondary', maxWidth: 180 }}>
                      <Typography variant="body2" noWrap title={task.description || undefined}>
                        {task.description || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {task.assignments.length === 0 ? (
                        <Typography variant="body2" color="text.secondary">—</Typography>
                      ) : (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {task.assignments.map((a) => (
                            <Chip
                              key={a.user.id}
                              size="small"
                              avatar={
                                <Avatar sx={{ bgcolor: '#e0e7ff', color: '#4338ca', fontSize: 10, fontWeight: 700 }}>
                                  {a.user.name.charAt(0).toUpperCase()}
                                </Avatar>
                              }
                              label={a.user.name}
                              sx={{ bgcolor: '#f1f5f9', color: '#334155', fontSize: 12 }}
                            />
                          ))}
                        </Box>
                      )}
                    </TableCell>
                    <TableCell sx={{ color: 'text.secondary' }}>{formatDate(task.due_date)}</TableCell>
                    <TableCell>
                      <Chip
                        label={statusCfg.label}
                        size="small"
                        sx={{ bgcolor: statusCfg.bg, color: statusCfg.color, fontWeight: 600, fontSize: 12 }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: 'text.secondary' }}>{formatDate(task.created_at)}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Edit Task">
                        <IconButton size="small" onClick={() => onEdit(task)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {task.status !== 'CANCELLED' && task.status !== 'DONE' && (
                        <Tooltip title="Cancel Task">
                          <IconButton
                            size="small"
                            onClick={() => onCancel(task.id)}
                            sx={{ color: 'error.main' }}
                          >
                            <BlockIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

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
