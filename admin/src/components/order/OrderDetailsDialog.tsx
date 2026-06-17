// The read-only "Order #N" details modal: shows the customer, the product lines,
// the totals, and the manager/store footer, with Approve / Cancel actions for
// orders that still allow them. OrderManage.tsx passes the selected order and
// the action callbacks (which also close this dialog).
import {
  Box, Typography, Button, Card, IconButton, Divider, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import BlockIcon from '@mui/icons-material/Block';
import CloseIcon from '@mui/icons-material/Close';
import { Order, STATUS_CONFIG, STORE_NAME } from './types';
import { calcValue, calcQty, fmt, currency } from './helpers';

interface OrderDetailsDialogProps {
  order: Order | null;            // the order to show (null when closed)
  onClose: () => void;
  onApprove: (orderId: number) => void;
  onCancel: (orderId: number) => void;
  approveLoading: number | null;  // id of the order currently being approved
}

export default function OrderDetailsDialog({ order, onClose, onApprove, onCancel, approveLoading }: OrderDetailsDialogProps) {
  // The dialog is "open" whenever an order is selected
  const cfg = order ? STATUS_CONFIG[order.status] : null;

  return (
    <Dialog
      open={!!order}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: 3 } } }}
    >
      {order && cfg && (
        <>
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Order #{order.id}</Typography>
              <Chip label={cfg.label} size="small" sx={{ bgcolor: cfg.bg, color: cfg.color, fontWeight: 600 }} />
            </Box>
            <IconButton size="small" onClick={onClose}><CloseIcon /></IconButton>
          </DialogTitle>
          <Divider />
          <DialogContent sx={{ pt: 2.5 }}>

            {/* Top row: date left, customer right */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Order Date</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500, mt: 0.5 }}>{fmt(order.created_at)}</Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Customer</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5 }}>{order.customer_name}</Typography>
                <Typography variant="body2" color="text.secondary">{order.customer_phone}</Typography>
              </Box>
            </Box>

            {/* Products table */}
            <Card variant="outlined" sx={{ borderRadius: 2, mb: 2 }}>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ '& th': { fontWeight: 700, bgcolor: '#f9fafb', fontSize: 12, color: 'text.secondary' } }}>
                      <TableCell>Product</TableCell>
                      <TableCell>SKU</TableCell>
                      <TableCell align="center">Qty</TableCell>
                      <TableCell align="right">Unit Price</TableCell>
                      <TableCell align="right">Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {order.order_items.map((oi) => (
                      <TableRow key={oi.id} sx={{ '& td': { fontSize: 13, borderBottom: '1px solid #f3f4f6' } }}>
                        <TableCell sx={{ fontWeight: 500 }}>{oi.item.name}</TableCell>
                        <TableCell sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>{oi.item.sku}</TableCell>
                        <TableCell align="center">{oi.quantity}</TableCell>
                        <TableCell align="right">{currency(parseFloat(oi.item.price))}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                          {currency(parseFloat(oi.item.price) * oi.quantity)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>

            {/* Totals */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="body2" color="text.secondary">
                  Total Quantity: <strong>{calcQty(order)} units</strong>
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', mt: 0.5 }}>
                  Total: {currency(calcValue(order))}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ mb: 2 }} />

            {/* Footer: manager left, store right */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  System Manager
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5 }}>{order.creator.name}</Typography>
                <Typography variant="caption" color="text.secondary">{order.creator.email}</Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Store
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 700, mt: 0.5, color: 'primary.main' }}>
                  {STORE_NAME}
                </Typography>
              </Box>
            </Box>

          </DialogContent>
          <Divider />
          <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
            {order.status === 'PENDING' && (
              <Button
                variant="contained"
                color="success"
                startIcon={<ThumbUpAltIcon />}
                disabled={approveLoading === order.id}
                onClick={() => onApprove(order.id)}
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                Approve Order
              </Button>
            )}
            {order.status !== 'CANCELLED' && order.status !== 'COMPLETED' && order.status !== 'REJECTED' && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<BlockIcon />}
                onClick={() => onCancel(order.id)}
                sx={{ textTransform: 'none' }}
              >
                Cancel Order
              </Button>
            )}
            <Button onClick={onClose} sx={{ textTransform: 'none', ml: 'auto' }}>Close</Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
}
