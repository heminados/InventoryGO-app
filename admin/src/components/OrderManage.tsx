// Order-management page. This file coordinates the data and state for the screen
// and renders the smaller UI components from ./order:
//   - OrderSearchBar      (search + status filter)
//   - OrderStats          (summary cards)
//   - OrderTable          (order list + pagination)
//   - OrderDetailsDialog  (read-only order details)
//   - EditOrderDrawer     (edit customer info + items)
//   - CancelOrderDialog   (cancel confirmation modal)
import React from 'react';
import { Box, Typography, Alert, Snackbar } from '@mui/material';

import OrderSearchBar from './order/OrderSearchBar';
import OrderStats from './order/OrderStats';
import OrderTable from './order/OrderTable';
import OrderDetailsDialog from './order/OrderDetailsDialog';
import EditOrderDrawer from './order/EditOrderDrawer';
import CancelOrderDialog from './order/CancelOrderDialog';
import { Order, InventoryItem, EditLineItem, OrderStatus } from './order/types';

const API = 'http://localhost:5001';

export default function OrderManage({ token }: { token: string }) {

  const [orders, setOrders] = React.useState<Order[]>([]);
  const [allItems, setAllItems] = React.useState<InventoryItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<OrderStatus | 'ALL'>('ALL');
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  // Details dialog
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

  // Items available to add in the edit form (exclude items already in the order)
  const availableToAdd = allItems.filter((i) => !editLines.some((l) => l.item_id === i.id));

  // ── Details dialog ──

  const openDetails = (order: Order) => setSelectedOrder(order);
  const closeDetails = () => setSelectedOrder(null);

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
        <OrderSearchBar
          search={search}
          onSearchChange={(value) => { setSearch(value); setPage(0); }}
          statusFilter={statusFilter}
          onStatusFilterChange={(value) => { setStatusFilter(value); setPage(0); }}
        />
      </Box>

      {/* ── Stats row ── */}
      <OrderStats orders={orders} />

      {/* ── Orders table ── */}
      <OrderTable
        rows={paginated}
        loading={loading}
        count={filtered.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={setPage}
        onRowsPerPageChange={(value) => { setRowsPerPage(value); setPage(0); }}
        onViewDetails={openDetails}
        onEdit={openEdit}
        onApprove={handleApprove}
        onCancel={confirmCancel}
        approveLoading={approveLoading}
      />

      {/* ── Order Details Dialog ── */}
      <OrderDetailsDialog
        order={selectedOrder}
        onClose={closeDetails}
        onApprove={(id) => { handleApprove(id); closeDetails(); }}
        onCancel={(id) => { closeDetails(); confirmCancel(id); }}
        approveLoading={approveLoading}
      />

      {/* ── Edit Order Drawer ── */}
      <EditOrderDrawer
        open={editOpen}
        order={editOrder}
        form={editForm}
        onFormChange={(changes) => setEditForm({ ...editForm, ...changes })}
        lines={editLines}
        onChangeLineQty={changeLineQty}
        onRemoveLine={removeLine}
        availableToAdd={availableToAdd}
        addItemId={addItemId}
        onAddItemIdChange={setAddItemId}
        addItemQty={addItemQty}
        onAddItemQtyChange={setAddItemQty}
        onAddLine={addLineItem}
        onSave={handleSaveEdit}
        onClose={closeEdit}
        saving={saving}
      />

      {/* ── Cancel Confirmation Dialog ── */}
      <CancelOrderDialog
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        onConfirm={handleCancel}
        saving={saving}
      />

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
