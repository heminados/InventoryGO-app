// User-management page. This file coordinates the data and state for the screen
// and renders the smaller UI components from ./employee:
//   - EmployeeSearchBar (search + add button)
//   - EmployeeStats     (summary cards)
//   - EmployeeTable     (user list + pagination)
//   - EditUserDrawer    (edit / reset-password drawer)
//   - AddUserDialog     (create user modal)
import React from 'react';
import { Box, Typography, Alert, Snackbar } from '@mui/material';

import EmployeeSearchBar from './employee/EmployeeSearchBar';
import EmployeeStats from './employee/EmployeeStats';
import EmployeeTable from './employee/EmployeeTable';
import EditUserDrawer from './employee/EditUserDrawer';
import AddUserDialog from './employee/AddUserDialog';
import { User, EditUserForm, AddUserForm } from './employee/types';

// Base URL for all API calls — matches the Express server port
const API = 'http://localhost:5001';

// ── Main component ──
// token: JWT passed from App so every fetch is authenticated
export default function EmployeeManage({ token }: { token: string }) {

  // ── State ──
  const [users, setUsers] = React.useState<User[]>([]);       // full user list from the API
  const [loading, setLoading] = React.useState(true);          // shows a spinner on first load
  const [search, setSearch] = React.useState('');              // current search input value
  const [page, setPage] = React.useState(0);                   // current table page (0-indexed)
  const [rowsPerPage, setRowsPerPage] = React.useState(10);    // rows shown per page

  // Edit drawer state
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null); // the user being edited
  const [editForm, setEditForm] = React.useState<EditUserForm>({ name: '', email: '', role: 'EMPLOYEE', is_active: true });

  // Add user dialog state
  const [addOpen, setAddOpen] = React.useState(false);
  const [addForm, setAddForm] = React.useState<AddUserForm>({ name: '', email: '', password: '', role: 'EMPLOYEE' });

  // Snackbar (toast) for success/error feedback
  const [snack, setSnack] = React.useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const [saving, setSaving] = React.useState(false);      // true while a save/create request is in-flight
  const [resetting, setResetting] = React.useState(false); // true while a password reset is in-flight

  // Reusable headers: Content-Type + the Bearer JWT for protected routes
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  // Helper: shows a bottom-right toast with the given message and colour
  const showSnack = (message: string, severity: 'success' | 'error' = 'success') =>
    setSnack({ open: true, message, severity });

  // Fetches all users from GET /users and stores them in state.
  // Wrapped in useCallback so it can be safely used as an effect dependency.
  const fetchUsers = React.useCallback(async () => {
    try {
      const res = await fetch(`${API}/users`, { headers });
      if (!res.ok) throw new Error('Failed to load users');
      const data = await res.json();
      setUsers(data);
    } catch {
      showSnack('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Load users once when the component mounts (or when the token changes)
  React.useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // ── Derived data ──

  // Filter the full user list by what's typed in the search box (name, email, or role)
  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase())
  );

  // Slice the filtered list to only the rows that fit on the current page
  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // ── Handlers ──

  // Opens the edit drawer and pre-fills the form with the selected user's current values
  const openEdit = (user: User) => {
    setSelectedUser(user);
    setEditForm({ name: user.name, email: user.email, role: user.role, is_active: user.is_active });
    setDrawerOpen(true);
  };

  // Closes the drawer and clears the selected user
  const closeDrawer = () => { setDrawerOpen(false); setSelectedUser(null); };

  // Sends a PUT /users/:id request with the edited form values, then refreshes the list
  const handleSave = async () => {
    if (!selectedUser) return;
    setSaving(true);
    try {
      const res = await fetch(`${API}/users/${selectedUser.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(editForm),
      });
      if (!res.ok) throw new Error('Update failed');
      await fetchUsers(); // refresh the table so changes are immediately visible
      showSnack('User updated successfully');
      closeDrawer();
    } catch {
      showSnack('Failed to update user', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Sends a POST /users/:id/reset-password request.
  // Works both from the table action button (userId passed directly)
  // and from inside the drawer (falls back to selectedUser.id).
  const handleResetPassword = async (userId?: number) => {
    const id = userId ?? selectedUser?.id;
    if (!id) return;
    setResetting(true);
    try {
      const res = await fetch(`${API}/users/${id}/reset-password`, { method: 'POST', headers });
      const data = await res.json();
      if (!res.ok) throw new Error('Reset failed');
      // The server returns a temporary password — show it in the toast so the admin can relay it
      showSnack(`Password reset. Temp password: ${data.temp_password}`);
    } catch {
      showSnack('Failed to reset password', 'error');
    } finally {
      setResetting(false);
    }
  };

  // Sends a POST /users request to create a new user, then refreshes the list and closes the dialog
  const handleAddUser = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/users`, {
        method: 'POST',
        headers,
        body: JSON.stringify(addForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Create failed');
      await fetchUsers();
      showSnack('User created successfully');
      setAddOpen(false);
      setAddForm({ name: '', email: '', password: '', role: 'EMPLOYEE' }); // reset for next use
    } catch (err: any) {
      showSnack(err.message || 'Failed to create user', 'error');
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
          <Typography variant="h5" sx={{ fontWeight: 700 }}>User Management</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Manage and organize your team members
          </Typography>
        </Box>
        <EmployeeSearchBar
          search={search}
          onSearchChange={(value) => { setSearch(value); setPage(0); }}
          onAddClick={() => setAddOpen(true)}
        />
      </Box>

      {/* ── Stats row ── */}
      <EmployeeStats users={users} />

      {/* ── Users table ── */}
      <EmployeeTable
        rows={paginated}
        loading={loading}
        count={filtered.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={setPage}
        onRowsPerPageChange={(value) => { setRowsPerPage(value); setPage(0); }}
        onEdit={openEdit}
        onResetPassword={handleResetPassword}
      />

      {/* ── Edit User Drawer ── */}
      <EditUserDrawer
        open={drawerOpen}
        user={selectedUser}
        form={editForm}
        onChange={(changes) => setEditForm({ ...editForm, ...changes })}
        onClose={closeDrawer}
        onSave={handleSave}
        saving={saving}
        onResetPassword={() => handleResetPassword()}
        resetting={resetting}
      />

      {/* ── Add User Dialog ── */}
      <AddUserDialog
        open={addOpen}
        form={addForm}
        onChange={(changes) => setAddForm({ ...addForm, ...changes })}
        onClose={() => setAddOpen(false)}
        onSave={handleAddUser}
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
