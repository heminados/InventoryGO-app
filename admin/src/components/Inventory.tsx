// Inventory page. This file coordinates the data and state for the inventory
// screen and renders the smaller UI components from ./inventory:
//   - InventorySearchBar  (search + add button)
//   - InventoryStats      (summary cards)
//   - InventoryTable      (product list + pagination)
//   - EditItemDialog      (edit / stock / inspection modal)
//   - AddItemDialog       (create item modal)
import React from 'react';
import { Box, Typography, Alert, Snackbar } from '@mui/material';

import InventorySearchBar from './inventory/InventorySearchBar';
import InventoryStats from './inventory/InventoryStats';
import InventoryTable from './inventory/InventoryTable';
import EditItemDialog from './inventory/EditItemDialog';
import AddItemDialog from './inventory/AddItemDialog';
import { Item, ItemForm } from './inventory/types';

// Base URL for all API calls — matches the Express server port
const API = 'http://localhost:5001';

// Starting values for the "Add New Item" form
const EMPTY_FORM: ItemForm = { sku: '', name: '', description: '', price: '', qty: 0, is_ordered: false };

// ── Main component ──
// token: JWT passed from App so every fetch is authenticated
export default function Inventory({ token }: { token: string }) {

  // ── State ──
  const [items, setItems] = React.useState<Item[]>([]);     // full item list from the API
  const [loading, setLoading] = React.useState(true);        // shows a spinner on first load
  const [search, setSearch] = React.useState('');            // current search input value
  const [page, setPage] = React.useState(0);                 // current table page (0-indexed)
  const [rowsPerPage, setRowsPerPage] = React.useState(10);  // rows shown per page

  // Edit dialog state
  const [editOpen, setEditOpen] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState<Item | null>(null); // the item being edited
  const [editForm, setEditForm] = React.useState<ItemForm>(EMPTY_FORM);

  // Add item dialog state
  const [addOpen, setAddOpen] = React.useState(false);
  const [addForm, setAddForm] = React.useState<ItemForm>(EMPTY_FORM);

  // Snackbar (toast) for success/error feedback
  const [snack, setSnack] = React.useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const [saving, setSaving] = React.useState(false); // true while a save/create request is in-flight

  // Reusable headers: Content-Type + the Bearer JWT for protected routes
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  // Helper: shows a bottom-right toast with the given message and colour
  const showSnack = (message: string, severity: 'success' | 'error' = 'success') =>
    setSnack({ open: true, message, severity });

  // Fetches all items from GET /items/getAll and stores them in state.
  // Wrapped in useCallback so it can be safely used as an effect dependency.
  const fetchItems = React.useCallback(async () => {
    try {
      const res = await fetch(`${API}/items/getAll`, { headers });
      if (!res.ok) throw new Error('Failed to load items');
      const data = await res.json();
      setItems(data);
    } catch {
      showSnack('Failed to load items', 'error');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Load items once when the component mounts (or when the token changes)
  React.useEffect(() => { fetchItems(); }, [fetchItems]);

  // ── Derived data ──

  // Filter the full item list by what's typed in the search box (name or SKU/מקט)
  const filtered = items.filter(
    (it) =>
      it.name.toLowerCase().includes(search.toLowerCase()) ||
      it.sku.toLowerCase().includes(search.toLowerCase())
  );

  // Slice the filtered list to only the rows that fit on the current page
  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // ── Handlers ──

  // Opens the edit dialog and pre-fills the form with the selected item's current values
  const openEdit = (item: Item) => {
    setSelectedItem(item);
    setEditForm({
      sku: item.sku,
      name: item.name,
      description: item.description ?? '',
      price: String(item.price),
      qty: item.qty,
      is_ordered: item.is_ordered,
    });
    setEditOpen(true);
  };

  // Closes the edit dialog and clears the selected item
  const closeEdit = () => { setEditOpen(false); setSelectedItem(null); };

  // Sends a PUT /items/update/:id request with the edited form values, then refreshes the list
  const handleSave = async () => {
    if (!selectedItem) return;
    if (!editForm.name.trim() || !editForm.sku.trim() || editForm.price === '') {
      showSnack('Name, SKU and price are required', 'error');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${API}/items/update/${selectedItem.id}`, {
        method: 'PUT',
        headers,
        // source tells the backend this operation came from the Admin web app (for reports)
        body: JSON.stringify({ ...editForm, source: 'admin' }),
      });
      if (!res.ok) throw new Error('Update failed');
      await fetchItems(); // refresh the table so changes are immediately visible
      showSnack('Item updated successfully');
      closeEdit();
    } catch {
      showSnack('Failed to update item', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Sends a POST /items/add request to create a new item, then refreshes the list and closes the dialog
  const handleAddItem = async () => {
    if (!addForm.name.trim() || !addForm.sku.trim() || addForm.price === '') {
      showSnack('Name, SKU and price are required', 'error');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${API}/items/add`, {
        method: 'POST',
        headers,
        // source tells the backend this operation came from the Admin web app (for reports)
        body: JSON.stringify({ ...addForm, source: 'admin' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Create failed');
      await fetchItems();
      showSnack('Item created successfully');
      setAddOpen(false);
      setAddForm(EMPTY_FORM); // reset for next use
    } catch (err: any) {
      showSnack(err.message || 'Failed to create item', 'error');
    } finally {
      setSaving(false);
    }
  };

  // ── Render ──
  return (
    <Box>

      {/* ── Page header: title + search + add button ── */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Inventory Management</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            View, edit and organize your products
          </Typography>
        </Box>
        <InventorySearchBar
          search={search}
          onSearchChange={(value) => { setSearch(value); setPage(0); }}
          onAddClick={() => { setAddForm(EMPTY_FORM); setAddOpen(true); }}
        />
      </Box>

      {/* ── Stats row ── */}
      <InventoryStats items={items} />

      {/* ── Items table ── */}
      <InventoryTable
        rows={paginated}
        loading={loading}
        count={filtered.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={setPage}
        onRowsPerPageChange={(value) => { setRowsPerPage(value); setPage(0); }}
        onEdit={openEdit}
      />

      {/* ── Edit Item Dialog ── */}
      <EditItemDialog
        open={editOpen}
        item={selectedItem}
        form={editForm}
        onChange={(changes) => setEditForm({ ...editForm, ...changes })}
        onClose={closeEdit}
        onSave={handleSave}
        saving={saving}
      />

      {/* ── Add Item Dialog ── */}
      <AddItemDialog
        open={addOpen}
        form={addForm}
        onChange={(changes) => setAddForm({ ...addForm, ...changes })}
        onClose={() => setAddOpen(false)}
        onSave={handleAddItem}
        saving={saving}
      />

      {/* ── Snackbar (toast) ── bottom-right feedback after every API action */}
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
