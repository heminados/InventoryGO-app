import React from 'react';
import {
  Box, Typography, Button, TextField, InputAdornment, Card, CardContent,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination, Chip, IconButton, Tooltip, Drawer, Divider,
  Select, MenuItem, FormControl, InputLabel, Avatar, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, Alert, Snackbar,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import LockResetIcon from '@mui/icons-material/LockReset';
import PeopleIcon from '@mui/icons-material/People';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CloseIcon from '@mui/icons-material/Close';
import EmailIcon from '@mui/icons-material/Email';

// Base URL for all API calls — matches the Express server port
const API = 'http://localhost:5001';

// The three possible roles that match the backend Role enum
type Role = 'ADMIN' | 'EMPLOYEE' | 'MANAGER';

// Shape of a user object returned by GET /users
interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  is_active: boolean;
  created_at: string;
}

// Props accepted by the StatCard component
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  iconBg: string; // background colour behind the icon
}

// A small summary card showing one statistic (e.g. "Active Users: 25")
function StatCard({ icon, label, value, iconBg }: StatCardProps) {
  return (
    <Card variant="outlined" sx={{ flex: 1, borderRadius: 2 }}>
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2, '&:last-child': { pb: 2 } }}>
        {/* Coloured icon badge on the left */}
        <Box sx={{ bgcolor: iconBg, borderRadius: 2, p: 1.25, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
        </Box>
        {/* Number and label on the right */}
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.2 }}>{value}</Typography>
          <Typography variant="body2" color="text.secondary">{label}</Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

// Options shown in the rows-per-page dropdown at the bottom of the table
const ROWS_PER_PAGE_OPTIONS = [10, 25, 50];

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
  const [editForm, setEditForm] = React.useState({ name: '', email: '', role: 'EMPLOYEE' as Role, is_active: true });

  // Add user dialog state
  const [addOpen, setAddOpen] = React.useState(false);
  const [addForm, setAddForm] = React.useState({ name: '', email: '', password: '', role: 'EMPLOYEE' as Role });

  // Snackbar (toast) for success/error feedback
  const [snack, setSnack] = React.useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const [saving, setSaving] = React.useState(false);      // true while a save/create request is in-flight
  const [resetting, setResetting] = React.useState(false); // true while a password reset is in-flight

  // Reusable headers: Content-Type + the Bearer JWT for protected routes
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

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

  // Helper: shows a bottom-right toast with the given message and colour
  const showSnack = (message: string, severity: 'success' | 'error' = 'success') =>
    setSnack({ open: true, message, severity });

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

  // Stats card values — calculated client-side from the already-loaded user list
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.is_active).length;
  const inactiveUsers = users.filter((u) => !u.is_active).length;

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

  // Formats an ISO date string into a readable "DD Mon YYYY" format for the Join Date column
  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  // Converts an uppercase enum value (e.g. "MANAGER") to title case ("Manager") for display
  const roleLabel = (role: Role) => role.charAt(0) + role.slice(1).toLowerCase();

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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Search field — filters the table in real time, resets page to 0 on each keystroke */}
          <TextField
            size="small"
            placeholder="Search by name, email or role..."
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
            sx={{ width: 260 }}
          />
          {/* Opens the Add User dialog */}
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setAddOpen(true)}
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2, whiteSpace: 'nowrap' }}
          >
            Add New User
          </Button>
        </Box>
      </Box>

      {/* ── Stats row: four summary cards ── */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <StatCard
          icon={<PeopleIcon sx={{ color: '#3b82f6', fontSize: 22 }} />}
          iconBg="#eff6ff"
          label="Total Users"
          value={totalUsers}
        />
        <StatCard
          icon={<CheckCircleIcon sx={{ color: '#16a34a', fontSize: 22 }} />}
          iconBg="#f0fdf4"
          label="Active Users"
          value={activeUsers}
        />
        <StatCard
          icon={<CancelIcon sx={{ color: '#dc2626', fontSize: 22 }} />}
          iconBg="#fef2f2"
          label="Inactive Users"
          value={inactiveUsers}
        />
        {/* Pending Invitations — no invitation system yet, so hardcoded to 0 */}
        <StatCard
          icon={<HourglassEmptyIcon sx={{ color: '#ca8a04', fontSize: 22 }} />}
          iconBg="#fefce8"
          label="Pending Invitations"
          value={0}
        />
      </Box>

      {/* ── Users table ── */}
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
              ) : paginated.length === 0 ? (
                /* Empty state — no users match the current search */
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                    No users found.
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((user) => (
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
                        <IconButton size="small" onClick={() => openEdit(user)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Reset Password">
                        <IconButton size="small" onClick={() => handleResetPassword(user.id)}>
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
          count={filtered.length}
          page={page}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0); // go back to page 1 whenever rows-per-page changes
          }}
        />
      </Card>

      {/* ── Edit User Drawer ── slides in from the right when a row's edit icon is clicked */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={closeDrawer}
        slotProps={{ paper: { sx: { width: 380, p: 3 } } }}
      >
        {/* Drawer header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Edit User</Typography>
          <IconButton size="small" onClick={closeDrawer}><CloseIcon /></IconButton>
        </Box>
        <Divider sx={{ mb: 3 }} />

        {/* Only render form content when a user is actually selected */}
        {selectedUser && (
          <>
            {/* Avatar showing the first letter of the user's name */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <Avatar sx={{ width: 72, height: 72, bgcolor: '#e0e7ff', color: '#4338ca', fontSize: 28, fontWeight: 700 }}>
                {selectedUser.name.charAt(0).toUpperCase()}
              </Avatar>
            </Box>

            {/* Editable fields: Full Name, Email, Role, Status */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <TextField
                label="Full Name"
                size="small"
                fullWidth
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
              <TextField
                label="Email"
                size="small"
                fullWidth
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              />
              {/* Role dropdown — maps to the Role enum in the database */}
              <FormControl size="small" fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={editForm.role}
                  label="Role"
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value as Role })}
                >
                  <MenuItem value="ADMIN">Admin</MenuItem>
                  <MenuItem value="MANAGER">Manager</MenuItem>
                  <MenuItem value="EMPLOYEE">Employee</MenuItem>
                </Select>
              </FormControl>
              {/* Status dropdown — maps to the is_active boolean field */}
              <FormControl size="small" fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={editForm.is_active ? 'active' : 'inactive'}
                  label="Status"
                  onChange={(e) => setEditForm({ ...editForm, is_active: e.target.value === 'active' })}
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Reset Password section — separate card to visually distinguish it from the edit form */}
            <Card variant="outlined" sx={{ mt: 4, borderRadius: 2, bgcolor: '#f9fafb' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <LockResetIcon fontSize="small" color="action" />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Reset Password</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Send a password reset link to the user's email address.
                </Typography>
                {/* Calls handleResetPassword without an id — it falls back to selectedUser.id */}
                <Button
                  variant="outlined"
                  fullWidth
                  size="small"
                  startIcon={<EmailIcon />}
                  onClick={() => handleResetPassword()}
                  disabled={resetting}
                  sx={{ textTransform: 'none', borderRadius: 1.5 }}
                >
                  {resetting ? 'Resetting...' : 'Send Password Reset Link'}
                </Button>
              </CardContent>
            </Card>

            {/* Save / Cancel buttons at the bottom of the drawer */}
            <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
              <Button
                variant="contained"
                fullWidth
                onClick={handleSave}
                disabled={saving}
                sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 1.5 }}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                variant="outlined"
                fullWidth
                onClick={closeDrawer}
                sx={{ textTransform: 'none', borderRadius: 1.5 }}
              >
                Cancel
              </Button>
            </Box>
          </>
        )}
      </Drawer>

      {/* ── Add User Dialog ── opens when "+ Add New User" is clicked */}
      <Dialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Add New User</DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2.5 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              label="Full Name"
              size="small"
              fullWidth
              value={addForm.name}
              onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
            />
            <TextField
              label="Email"
              size="small"
              fullWidth
              value={addForm.email}
              onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
            />
            <TextField
              label="Password"
              type="password"
              size="small"
              fullWidth
              value={addForm.password}
              onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
            />
            {/* Role dropdown — defaults to EMPLOYEE, the safest starting role */}
            <FormControl size="small" fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={addForm.role}
                label="Role"
                onChange={(e) => setAddForm({ ...addForm, role: e.target.value as Role })}
              >
                <MenuItem value="ADMIN">Admin</MenuItem>
                <MenuItem value="MANAGER">Manager</MenuItem>
                <MenuItem value="EMPLOYEE">Employee</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={() => setAddOpen(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAddUser}
            disabled={saving}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            {saving ? 'Creating...' : 'Create User'}
          </Button>
        </DialogActions>
      </Dialog>

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
