// The reports table (read-only): type, action, user, date/time and status, plus
// pagination. Clicking a row — or the view icon — opens its details dialog.
// Reports.tsx passes the rows to show (already filtered + paginated), the
// loading flag, pagination values, and the onView callback.
import {
  Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination, Chip, IconButton, Tooltip, Avatar, CircularProgress, Box, Typography,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Report, formatDateTime } from './types';

// Options shown in the rows-per-page dropdown at the bottom of the table
const ROWS_PER_PAGE_OPTIONS = [10, 25, 50];

interface ReportsTableProps {
  rows: Report[];          // rows for the current page
  loading: boolean;        // true while the first fetch is in-flight
  count: number;           // total number of filtered reports (for pagination)
  page: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  onView: (report: Report) => void;
}

export default function ReportsTable({
  rows, loading, count, page, rowsPerPage, onPageChange, onRowsPerPageChange, onView,
}: ReportsTableProps) {
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
              <TableCell>Type</TableCell>
              <TableCell>Action</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Date &amp; Time</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Details</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                  No reports found.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((report) => (
                <TableRow
                  key={report.id}
                  hover
                  sx={{ cursor: 'pointer', '& td': { fontSize: 14, borderBottom: '1px solid #f3f4f6' } }}
                  onClick={() => onView(report)}
                >
                  {/* Type chip — neutral grey */}
                  <TableCell>
                    <Chip
                      label="Inventory"
                      size="small"
                      sx={{ bgcolor: '#f1f5f9', color: '#334155', fontWeight: 500, fontSize: 12 }}
                    />
                  </TableCell>
                  {/* Action + which product it affected */}
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{report.action}</Typography>
                    {report.item_name && (
                      <Typography variant="caption" color="text.secondary">
                        {report.item_sku ? `${report.item_sku} · ` : ''}{report.item_name}
                      </Typography>
                    )}
                  </TableCell>
                  {/* User responsible: avatar initial + name */}
                  <TableCell>
                    {report.user ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: '#e0e7ff', color: '#4338ca', fontSize: 13, fontWeight: 700 }}>
                          {report.user.name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Typography variant="body2">{report.user.name}</Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">—</Typography>
                    )}
                  </TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>{formatDateTime(report.created_at)}</TableCell>
                  {/* Status chip — green for Normal, red for Exception */}
                  <TableCell>
                    <Chip
                      label={report.status === 'EXCEPTION' ? 'Exception' : 'Normal'}
                      size="small"
                      sx={{
                        bgcolor: report.status === 'EXCEPTION' ? '#fee2e2' : '#dcfce7',
                        color: report.status === 'EXCEPTION' ? '#dc2626' : '#16a34a',
                        fontWeight: 600,
                        fontSize: 12,
                      }}
                    />
                  </TableCell>
                  {/* View action — stopPropagation so it doesn't double-fire with the row click */}
                  <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                    <Tooltip title="View Details">
                      <IconButton size="small" onClick={() => onView(report)}>
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
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
