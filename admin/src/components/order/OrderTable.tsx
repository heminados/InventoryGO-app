// The orders table with status chips and the per-row actions (view / edit /
// approve / cancel), plus pagination. Clicking a row opens its details.
// OrderManage.tsx passes the rows to show (already filtered + paginated), the
// loading flag, pagination values, and the action callbacks.
import {
  Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination, Chip, IconButton, Tooltip, CircularProgress, Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import BlockIcon from '@mui/icons-material/Block';
import { Order, STATUS_CONFIG } from './types';
import { calcValue, calcQty, fmt, currency } from './helpers';

// Options shown in the rows-per-page dropdown at the bottom of the table
const ROWS_PER_PAGE_OPTIONS = [10, 25, 50];

interface OrderTableProps {
  rows: Order[];          // rows for the current page
  loading: boolean;       // true while the first fetch is in-flight
  count: number;          // total number of filtered orders (for pagination)
  page: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  onViewDetails: (order: Order) => void;
  onEdit: (order: Order) => void;
  onApprove: (orderId: number) => void;
  onCancel: (orderId: number) => void;
  approveLoading: number | null; // id of the order currently being approved (for the spinner)
}

export default function OrderTable({
  rows, loading, count, page, rowsPerPage, onPageChange, onRowsPerPageChange,
  onViewDetails, onEdit, onApprove, onCancel, approveLoading,
}: OrderTableProps) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 2 }}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ '& th': { fontWeight: 700, bgcolor: '#f9fafb', fontSize: 13, color: 'text.secondary', borderBottom: '1px solid #e5e7eb' } }}>
              <TableCell>Order</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Order Date</TableCell>
              <TableCell>Items</TableCell>
              <TableCell>Total Value</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Last Updated</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                  No orders found.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((order) => {
                const cfg = STATUS_CONFIG[order.status];
                const canApprove = order.status === 'PENDING';
                const canEdit    = order.status !== 'CANCELLED' && order.status !== 'COMPLETED';
                const canCancel  = order.status !== 'CANCELLED' && order.status !== 'COMPLETED' && order.status !== 'REJECTED';
                return (
                  <TableRow
                    key={order.id}
                    hover
                    sx={{ cursor: 'pointer', '& td': { fontSize: 14, borderBottom: '1px solid #f3f4f6' } }}
                    onClick={() => onViewDetails(order)}
                  >
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                        #{order.id}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">{order.creator.name}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>{order.customer_name}</Typography>
                      <Typography variant="caption" color="text.secondary">{order.customer_phone}</Typography>
                    </TableCell>
                    <TableCell sx={{ color: 'text.secondary' }}>{fmt(order.created_at)}</TableCell>
                    <TableCell sx={{ color: 'text.secondary' }}>{calcQty(order)} units</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{currency(calcValue(order))}</TableCell>
                    <TableCell>
                      <Chip label={cfg.label} size="small" sx={{ bgcolor: cfg.bg, color: cfg.color, fontWeight: 600, fontSize: 12 }} />
                    </TableCell>
                    <TableCell sx={{ color: 'text.secondary' }}>{fmt(order.updated_at)}</TableCell>
                    {/* stopPropagation so clicking an action button doesn't also open the details dialog */}
                    <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                      <Tooltip title="View Details">
                        <IconButton size="small" onClick={() => onViewDetails(order)}>
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {canEdit && (
                        <Tooltip title="Edit Order">
                          <IconButton size="small" onClick={() => onEdit(order)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {canApprove && (
                        <Tooltip title="Approve Order">
                          <IconButton
                            size="small"
                            onClick={() => onApprove(order.id)}
                            disabled={approveLoading === order.id}
                            sx={{ color: '#16a34a' }}
                          >
                            {approveLoading === order.id
                              ? <CircularProgress size={14} />
                              : <ThumbUpAltIcon fontSize="small" />}
                          </IconButton>
                        </Tooltip>
                      )}
                      {canCancel && (
                        <Tooltip title="Cancel Order">
                          <IconButton size="small" onClick={() => onCancel(order.id)} sx={{ color: 'error.main' }}>
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
        onPageChange={(_, p) => onPageChange(p)}
        onRowsPerPageChange={(e) => onRowsPerPageChange(parseInt(e.target.value, 10))}
      />
    </Card>
  );
}
