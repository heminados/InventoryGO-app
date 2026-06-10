import React from 'react';
import {
  Box, Typography, Button, TextField, InputAdornment, Card, CardContent,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination, Chip, IconButton, Tooltip, Drawer, Divider,
  Select, MenuItem, FormControl, InputLabel, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, Alert, Snackbar,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import BlockIcon from '@mui/icons-material/Block';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

const API = 'http://localhost:5001';
const STORE_NAME = 'InventoryGO Store';

type OrderStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED';

interface OrderItemDetail {
  id: number;
  quantity: number;
  item: { id: number; sku: string; name: string; price: string };
}

interface Order {
  id: number;
  created_at: string;
  updated_at: string;
  status: OrderStatus;
  customer_name: string;
  customer_phone: string;
  creator: { id: number; name: string; email: string };
  order_items: OrderItemDetail[];
}

interface InventoryItem {
  id: number;
  sku: string;
  name: string;
  price: string;
  qty: number;
}

interface EditLineItem {
  item_id: number;
  quantity: number;
  item_name: string;
  item_sku: string;
  item_price: string;
}

// ── Status configuration ──
const STATUS_CONFIG: Record<OrderStatus, { label: string; bg: string; color: string }> = {
  PENDING:   { label: 'Pending',   bg: '#fefce8', color: '#ca8a04' },
  APPROVED:  { label: 'Approved',  bg: '#dcfce7', color: '#16a34a' },
  REJECTED:  { label: 'Rejected',  bg: '#fff7ed', color: '#ea580c' },
  COMPLETED: { label: 'Completed', bg: '#eff6ff', color: '#3b82f6' },
  CANCELLED: { label: 'Cancelled', bg: '#f1f5f9', color: '#64748b' },
};

// ── Helpers ──
const calcValue = (order: Order) =>
  order.order_items.reduce((s, oi) => s + parseFloat(oi.item.price) * oi.quantity, 0);

const calcQty = (order: Order) =>
  order.order_items.reduce((s, oi) => s + oi.quantity, 0);

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

const currency = (n: number) => `$${n.toFixed(2)}`;

// ── Stat card ──
interface StatCardProps { icon: React.ReactNode; iconBg: string; label: string; value: number }
function StatCard({ icon, iconBg, label, value }: StatCardProps) {
  return (
    <Card variant="outlined" sx={{ flex: 1, borderRadius: 2 }}>
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ bgcolor: iconBg, borderRadius: 2, p: 1.25, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
        </Box>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.2 }}>{value}</Typography>
          <Typography variant="body2" color="text.secondary">{label}</Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50];

// ── Main component ──
export default function OrderManage({ token }: { token: string }) {

  const [orders, setOrders] = React.useState<Order[]>([]);
  const [allItems, setAllItems] = React.useState<InventoryItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<OrderStatus | 'ALL'>('ALL');
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  // Details dialog
  const [detailsOpen, setDetailsOpen] = React.useState(false);
  const [selectedOrder, setSelectedOrder] = React.useState<Order | null>(null);

  // Edit drawer
  const [editOpen, setEditOpen] = React.useState(false);
  const [editOrder, setEditOrder] = React.useState<Order | null>(null);
  const [editForm, setEditForm] = React.useState({ customer_name: '', customer_phone: '' });
  const [editLines, setEditLines] = React.useState<EditLineItem[]>([]);
  const [addItemId, setAddItemId] = React.useState<number | ''>('');
  const [addItemQty, setAddItemQty] = React.useState(1);

  // Cancel confirm
  const [cancelOpen, setCancelOpen] = React.useState(false);
  const [orderToCancel, setOrderToCancel] = React.useState<number | null>(null);

  const [approveLoading, setApproveLoading] = React.useState<number | null>(null);
  const [snack, setSnack] = React.useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'warning' }>
    ({ open: false, message: '', severity: 'success' });
  const [saving, setSaving] = React.useState(false);

  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  // ── Data fetching ──

  const fetchOrders = React.useCallback(async () => {
    try {
      const res = await fetch(`${API}/orders`, { headers });
      if (!res.ok) throw new Error('Failed to load orders');
      setOrders(await res.json());
    } catch {
      showSnack('Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const fetchItems = React.useCallback(async () => {
    try {
      const res = await fetch(`${API}/items/getAll`, { headers });
      if (res.ok) setAllItems(await res.json());
    } catch {
      // non-critical — only needed for the edit form item picker
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  React.useEffect(() => { fetchOrders(); fetchItems(); }, [fetchOrders, fetchItems]);

  const showSnack = (message: string, severity: 'success' | 'error' | 'warning' = 'success') =>
    setSnack({ open: true, message, severity });

  // ── Derived data ──

  const filtered = orders.filter((o) => {
    const q = search.toLowerCase();
    const matchesSearch =
      String(o.id).includes(q) ||
      o.customer_name.toLowerCase().includes(q) ||
      o.customer_phone.includes(q) ||
      o.creator.name.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const totalOrders     = orders.length;
  const pendingCount    = orders.filter((o) => o.status === 'PENDING').length;
  const approvedCount   = orders.filter((o) => o.status === 'APPROVED').length;
  const completedCount  = orders.filter((o) => o.status === 'COMPLETED').length;

  // ── Details dialog ──

  const openDetails = (order: Order) => { setSelectedOrder(order); setDetailsOpen(true); };
  const closeDetails = () => { setDetailsOpen(false); setSelectedOrder(null); };

  // ── Edit drawer ──

  const openEdit = (order: Order) => {
    setEditOrder(order);
    setEditForm({ customer_name: order.customer_name, customer_phone: order.customer_phone });
    setEditLines(order.order_items.map((oi) => ({
      item_id: oi.item.id,
      quantity: oi.quantity,
      item_name: oi.item.name,
      item_sku: oi.item.sku,
      item_price: oi.item.price,
    })));
    setAddItemId('');
    setAddItemQty(1);
    setEditOpen(true);
  };

  const closeEdit = () => { setEditOpen(false); setEditOrder(null); };

  const changeLineQty = (item_id: number, delta: number) =>
    setEditLines((prev) =>
      prev.map((l) => l.item_id === item_id ? { ...l, quantity: Math.max(1, l.quantity + delta) } : l)
    );

  const removeLine = (item_id: number) =>
    setEditLines((prev) => prev.filter((l) => l.item_id !== item_id));

  const addLineItem = () => {
    if (!addItemId) return;
    const inv = allItems.find((i) => i.id === addItemId);
    if (!inv) return;
    setEditLines((prev) => {
      const existing = prev.find((l) => l.item_id === inv.id);
      if (existing) {
        return prev.map((l) => l.item_id === inv.id ? { ...l, quantity: l.quantity + addItemQty } : l);
      }
      return [...prev, { item_id: inv.id, quantity: addItemQty, item_name: inv.name, item_sku: inv.sku, item_price: inv.price }];
    });
    setAddItemId('');
    setAddItemQty(1);
  };

  const handleSaveEdit = async () => {
    if (!editOrder) return;
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        customer_name: editForm.customer_name,
        customer_phone: editForm.customer_phone,
      };
      if (editOrder.status === 'PENDING') {
        body.items = editLines.map(({ item_id, quantity }) => ({ item_id, quantity }));
      }
      const res = await fetch(`${API}/orders/${editOrder.id}`, {
        method: 'PUT', headers, body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Update failed');
      await fetchOrders();
      showSnack('Order updated successfully');
      closeEdit();
    } catch (err: any) {
      showSnack(err.message || 'Failed to update order', 'error');
    } finally {
      setSaving(false);
    }
  };

  // ── Approve ──

  const handleApprove = async (orderId: number) => {
    setApproveLoading(orderId);
    try {
      const res = await fetch(`${API}/orders/${orderId}/approve`, { method: 'PATCH', headers });
      const data = await res.json();
      if (!res.ok) {
        showSnack(data.message || 'Approval failed', res.status === 422 ? 'warning' : 'error');
        return;
      }
      await fetchOrders();
      showSnack('Order approved and inventory updated');
    } catch {
      showSnack('Failed to approve order', 'error');
    } finally {
      setApproveLoading(null);
    }
  };

  // ── Cancel ──

  const confirmCancel = (orderId: number) => { setOrderToCancel(orderId); setCancelOpen(true); };

  const handleCancel = async () => {
    if (!orderToCancel) return;
    setSaving(true);
    try {
      const res = await fetch(`${API}/orders/${orderToCancel}/cancel`, { method: 'PATCH', headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Cancel failed');
      await fetchOrders();
      showSnack('Order cancelled');
      setCancelOpen(false);
      setOrderToCancel(null);
    } catch (err: any) {
      showSnack(err.message || 'Failed to cancel order', 'error');
    } finally {
      setSaving(false);
    }
  };

  // ── Items available to add in edit form (exclude items already in the order) ──
  const availableToAdd = allItems.filter((i) => !editLines.some((l) => l.item_id === i.id));

  // ── Render ──
  return (
    <Box>

      {/* ── Page header ── */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Order Management</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Review, approve, and manage customer orders
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <TextField
            size="small"
            placeholder="Search by ID, customer or manager..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
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
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => { setStatusFilter(e.target.value as OrderStatus | 'ALL'); setPage(0); }}
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
      </Box>

      {/* ── Stats row ── */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <StatCard icon={<ShoppingCartIcon sx={{ color: '#3b82f6', fontSize: 22 }} />} iconBg="#eff6ff" label="Total Orders" value={totalOrders} />
        <StatCard icon={<HourglassEmptyIcon sx={{ color: '#ca8a04', fontSize: 22 }} />} iconBg="#fefce8" label="Pending" value={pendingCount} />
        <StatCard icon={<CheckCircleIcon sx={{ color: '#16a34a', fontSize: 22 }} />} iconBg="#dcfce7" label="Approved" value={approvedCount} />
        <StatCard icon={<AssignmentTurnedInIcon sx={{ color: '#6366f1', fontSize: 22 }} />} iconBg="#eef2ff" label="Completed" value={completedCount} />
      </Box>

      {/* ── Orders table ── */}
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
              ) : paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                    No orders found.
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((order) => {
                  const cfg = STATUS_CONFIG[order.status];
                  const canApprove  = order.status === 'PENDING';
                  const canEdit     = order.status !== 'CANCELLED' && order.status !== 'COMPLETED';
                  const canCancel   = order.status !== 'CANCELLED' && order.status !== 'COMPLETED' && order.status !== 'REJECTED';
                  return (
                    <TableRow
                      key={order.id}
                      hover
                      sx={{ cursor: 'pointer', '& td': { fontSize: 14, borderBottom: '1px solid #f3f4f6' } }}
                      onClick={() => openDetails(order)}
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
                      <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                        <Tooltip title="View Details">
                          <IconButton size="small" onClick={() => openDetails(order)}>
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {canEdit && (
                          <Tooltip title="Edit Order">
                            <IconButton size="small" onClick={() => openEdit(order)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {canApprove && (
                          <Tooltip title="Approve Order">
                            <IconButton
                              size="small"
                              onClick={() => handleApprove(order.id)}
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
                            <IconButton size="small" onClick={() => confirmCancel(order.id)} sx={{ color: 'error.main' }}>
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
          count={filtered.length}
          page={page}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
          onPageChange={(_, p) => setPage(p)}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
        />
      </Card>

      {/* ── Order Details Dialog ── */}
      <Dialog
        open={detailsOpen}
        onClose={closeDetails}
        maxWidth="md"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        {selectedOrder && (() => {
          const cfg = STATUS_CONFIG[selectedOrder.status];
          const totalValue = calcValue(selectedOrder);
          const totalUnits = calcQty(selectedOrder);
          return (
            <>
              <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>Order #{selectedOrder.id}</Typography>
                  <Chip label={cfg.label} size="small" sx={{ bgcolor: cfg.bg, color: cfg.color, fontWeight: 600 }} />
                </Box>
                <IconButton size="small" onClick={closeDetails}><CloseIcon /></IconButton>
              </DialogTitle>
              <Divider />
              <DialogContent sx={{ pt: 2.5 }}>

                {/* Top row: date left, customer right */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Order Date</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500, mt: 0.5 }}>{fmt(selectedOrder.created_at)}</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Customer</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5 }}>{selectedOrder.customer_name}</Typography>
                    <Typography variant="body2" color="text.secondary">{selectedOrder.customer_phone}</Typography>
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
                        {selectedOrder.order_items.map((oi) => (
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
                      Total Quantity: <strong>{totalUnits} units</strong>
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', mt: 0.5 }}>
                      Total: {currency(totalValue)}
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
                    <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5 }}>{selectedOrder.creator.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{selectedOrder.creator.email}</Typography>
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
                {selectedOrder.status === 'PENDING' && (
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<ThumbUpAltIcon />}
                    disabled={approveLoading === selectedOrder.id}
                    onClick={() => { handleApprove(selectedOrder.id); closeDetails(); }}
                    sx={{ textTransform: 'none', fontWeight: 600 }}
                  >
                    Approve Order
                  </Button>
                )}
                {selectedOrder.status !== 'CANCELLED' && selectedOrder.status !== 'COMPLETED' && selectedOrder.status !== 'REJECTED' && (
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<BlockIcon />}
                    onClick={() => { closeDetails(); confirmCancel(selectedOrder.id); }}
                    sx={{ textTransform: 'none' }}
                  >
                    Cancel Order
                  </Button>
                )}
                <Button onClick={closeDetails} sx={{ textTransform: 'none', ml: 'auto' }}>Close</Button>
              </DialogActions>
            </>
          );
        })()}
      </Dialog>

      {/* ── Edit Order Drawer ── */}
      <Drawer
        anchor="right"
        open={editOpen}
        onClose={closeEdit}
        slotProps={{ paper: { sx: { width: 500, p: 3 } } }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Edit Order</Typography>
            {editOrder && (
              <Typography variant="caption" color="text.secondary">Order #{editOrder.id}</Typography>
            )}
          </Box>
          <IconButton size="small" onClick={closeEdit}><CloseIcon /></IconButton>
        </Box>
        <Divider sx={{ mb: 3 }} />

        {editOrder && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, overflowY: 'auto' }}>

            {/* Customer info */}
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', fontSize: 11, letterSpacing: 0.5 }}>
              Customer Information
            </Typography>
            <TextField
              label="Customer Name"
              size="small"
              fullWidth
              value={editForm.customer_name}
              onChange={(e) => setEditForm({ ...editForm, customer_name: e.target.value })}
            />
            <TextField
              label="Customer Phone"
              size="small"
              fullWidth
              value={editForm.customer_phone}
              onChange={(e) => setEditForm({ ...editForm, customer_phone: e.target.value })}
            />

            {/* Items editor — only for PENDING orders */}
            {editOrder.status === 'PENDING' && (
              <>
                <Divider />
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', fontSize: 11, letterSpacing: 0.5 }}>
                  Order Items
                </Typography>

                {editLines.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">No items in this order.</Typography>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {editLines.map((line) => (
                      <Box
                        key={line.item_id}
                        sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.25, bgcolor: '#f9fafb', borderRadius: 1.5, border: '1px solid #e5e7eb' }}
                      >
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }} noWrap>{line.item_name}</Typography>
                          <Typography variant="caption" color="text.secondary">{line.item_sku} · {currency(parseFloat(line.item_price))}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <IconButton size="small" onClick={() => changeLineQty(line.item_id, -1)}
                            sx={{ border: '1px solid #e5e7eb', borderRadius: 1, p: 0.25, fontSize: 14 }}>−</IconButton>
                          <Typography variant="body2" sx={{ minWidth: 28, textAlign: 'center', fontWeight: 600 }}>{line.quantity}</Typography>
                          <IconButton size="small" onClick={() => changeLineQty(line.item_id, 1)}
                            sx={{ border: '1px solid #e5e7eb', borderRadius: 1, p: 0.25, fontSize: 14 }}>+</IconButton>
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 64, textAlign: 'right' }}>
                          {currency(parseFloat(line.item_price) * line.quantity)}
                        </Typography>
                        <Tooltip title="Remove">
                          <IconButton size="small" onClick={() => removeLine(line.item_id)} sx={{ color: 'error.main' }}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    ))}
                  </Box>
                )}

                {/* Add item row */}
                {availableToAdd.length > 0 && (
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
                    <FormControl size="small" sx={{ flex: 1 }}>
                      <InputLabel>Add Item</InputLabel>
                      <Select
                        value={addItemId}
                        label="Add Item"
                        onChange={(e) => setAddItemId(e.target.value as number)}
                      >
                        {availableToAdd.map((i) => (
                          <MenuItem key={i.id} value={i.id}>
                            {i.name} ({i.sku}) — {currency(parseFloat(i.price))}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <TextField
                      label="Qty"
                      type="number"
                      size="small"
                      sx={{ width: 72 }}
                      value={addItemQty}
                      slotProps={{ htmlInput: { min: 1 } }}
                      onChange={(e) => setAddItemQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    />
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={addLineItem}
                      disabled={!addItemId}
                      sx={{ textTransform: 'none', whiteSpace: 'nowrap' }}
                    >
                      Add
                    </Button>
                  </Box>
                )}

                {/* Running total */}
                {editLines.length > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 3, pt: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      {editLines.reduce((s, l) => s + l.quantity, 0)} units
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {currency(editLines.reduce((s, l) => s + parseFloat(l.item_price) * l.quantity, 0))}
                    </Typography>
                  </Box>
                )}
              </>
            )}

            {editOrder.status !== 'PENDING' && (
              <Alert severity="info" sx={{ borderRadius: 1.5 }}>
                Only customer information can be edited on {STATUS_CONFIG[editOrder.status].label.toLowerCase()} orders.
              </Alert>
            )}

            {/* Buttons */}
            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
              <Button
                variant="contained"
                fullWidth
                onClick={handleSaveEdit}
                disabled={saving}
                sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 1.5 }}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                variant="outlined"
                fullWidth
                onClick={closeEdit}
                sx={{ textTransform: 'none', borderRadius: 1.5 }}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        )}
      </Drawer>

      {/* ── Cancel Confirmation Dialog ── */}
      <Dialog
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Cancel Order</DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to cancel this order? If it was already approved, inventory will be
            restored automatically. The order record will be preserved.
          </Typography>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={() => setCancelOpen(false)} sx={{ textTransform: 'none' }}>Go Back</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleCancel}
            disabled={saving}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            {saving ? 'Cancelling...' : 'Yes, Cancel Order'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Snackbar ── */}
      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snack.severity} variant="filled" onClose={() => setSnack({ ...snack, open: false })}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
