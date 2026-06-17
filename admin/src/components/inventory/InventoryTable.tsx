// The products table with the status chips, the edit button, and pagination.
// Inventory.tsx passes the rows to show (already filtered + paginated), the
// loading flag, the pagination values, and an onEdit callback for the edit icon.
import {
  Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination, Chip, IconButton, Tooltip, Avatar, CircularProgress, Box, Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { Item } from './types';

// Options shown in the rows-per-page dropdown at the bottom of the table
const ROWS_PER_PAGE_OPTIONS = [10, 25, 50];

interface InventoryTableProps {
  rows: Item[];          // rows for the current page
  loading: boolean;      // true while the first fetch is in-flight
  count: number;         // total number of filtered items (for pagination)
  page: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  onEdit: (item: Item) => void;
}

// Formats a price string into "$0.00"
const formatPrice = (price: string) => `$${parseFloat(price).toFixed(2)}`;

export default function InventoryTable({
  rows, loading, count, page, rowsPerPage, onPageChange, onRowsPerPageChange, onEdit,
}: InventoryTableProps) {
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
              <TableCell>Product</TableCell>
              <TableCell>SKU</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Status</TableCell>
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
              /* Empty state — no items match the current search */
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                  No items found.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((item) => (
                <TableRow
                  key={item.id}
                  hover
                  sx={{ '& td': { fontSize: 14, borderBottom: '1px solid #f3f4f6' } }}
                >
                  {/* Product cell: avatar initial + name */}
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: '#e0e7ff', color: '#4338ca', fontSize: 13, fontWeight: 700 }}>
                        {item.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>{item.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>{item.sku}</TableCell>
                  <TableCell>{formatPrice(item.price)}</TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: item.qty === 0 ? '#dc2626' : 'text.primary' }}>
                      {item.qty}
                    </Typography>
                  </TableCell>
                  {/* Status: stock chip, plus a warning chip when flagged for inspection */}
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <Chip
                        label={item.qty > 0 ? 'In Stock' : 'Out of Stock'}
                        size="small"
                        sx={{
                          bgcolor: item.qty > 0 ? '#dcfce7' : '#fee2e2',
                          color: item.qty > 0 ? '#16a34a' : '#dc2626',
                          fontWeight: 600,
                          fontSize: 12,
                        }}
                      />
                      {item.is_ordered && (
                        <Chip
                          icon={<WarningAmberIcon sx={{ fontSize: 14 }} />}
                          label="Requires Inspection"
                          size="small"
                          sx={{ bgcolor: '#fefce8', color: '#ca8a04', fontWeight: 600, fontSize: 12 }}
                        />
                      )}
                    </Box>
                  </TableCell>
                  {/* Action button: edit opens the dialog */}
                  <TableCell align="center">
                    <Tooltip title="Edit Item">
                      <IconButton size="small" onClick={() => onEdit(item)}>
                        <EditIcon fontSize="small" />
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
