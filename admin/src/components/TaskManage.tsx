import React from 'react';
import {
  Box, Typography, Button, TextField, InputAdornment, Card, CardContent,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination, Chip, IconButton, Tooltip, Drawer, Divider,
  Select, MenuItem, FormControl, InputLabel, Avatar, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, Alert, Snackbar,
  SelectChangeEvent,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import BlockIcon from '@mui/icons-material/Block';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CancelIcon from '@mui/icons-material/Cancel';
import CloseIcon from '@mui/icons-material/Close';

const API = 'http://localhost:5001';

type TaskStatus = 'OPEN' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';

interface Employee {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface TaskAssignment {
  user: Employee;
}

interface Task {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  due_date: string | null;
  created_at: string;
  created_by: number;
  creator: { id: number; name: string; email: string };
  assignments: TaskAssignment[];
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  iconBg: string;
}

function StatCard({ icon, label, value, iconBg }: StatCardProps) {
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

const STATUS_CONFIG: Record<TaskStatus, { label: string; bg: string; color: string }> = {
  OPEN:        { label: 'Pending',     bg: '#eff6ff', color: '#3b82f6' },
  IN_PROGRESS: { label: 'In Progress', bg: '#fefce8', color: '#ca8a04' },
  DONE:        { label: 'Completed',   bg: '#dcfce7', color: '#16a34a' },
  CANCELLED:   { label: 'Cancelled',   bg: '#fee2e2', color: '#dc2626' },
};

export default function TaskManage({ token }: { token: string }) {

  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [employees, setEmployees] = React.useState<Employee[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  // Edit drawer
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);
  const [editForm, setEditForm] = React.useState({
    title: '',
    description: '',
    due_date: '',
    status: 'OPEN' as TaskStatus,
    assignee_ids: [] as number[],
  });

  // Create task dialog
  const [addOpen, setAddOpen] = React.useState(false);
  const [addForm, setAddForm] = React.useState({
    title: '',
    description: '',
    due_date: '',
    assignee_ids: [] as number[],
  });

  // Cancel confirmation dialog
  const [cancelOpen, setCancelOpen] = React.useState(false);
  const [taskToCancel, setTaskToCancel] = React.useState<number | null>(null);

  const [snack, setSnack] = React.useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false, message: '', severity: 'success',
  });
  const [saving, setSaving] = React.useState(false);

  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const fetchTasks = React.useCallback(async () => {
    try {
      const res = await fetch(`${API}/tasks`, { headers });
      if (!res.ok) throw new Error('Failed to load tasks');
      const data = await res.json();
      setTasks(data);
    } catch {
      showSnack('Failed to load tasks', 'error');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const fetchEmployees = React.useCallback(async () => {
    try {
      const res = await fetch(`${API}/users`, { headers });
      if (!res.ok) return;
      const data = await res.json();
      setEmployees(data);
    } catch {
      // non-critical — table still renders without employee list
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  React.useEffect(() => {
    fetchTasks();
    fetchEmployees();
  }, [fetchTasks, fetchEmployees]);

  const showSnack = (message: string, severity: 'success' | 'error' = 'success') =>
    setSnack({ open: true, message, severity });

  // ── Derived data ──

  const filtered = tasks.filter((t) => {
    const q = search.toLowerCase();
    return (
      t.title.toLowerCase().includes(q) ||
      (t.description || '').toLowerCase().includes(q) ||
      STATUS_CONFIG[t.status].label.toLowerCase().includes(q) ||
      t.assignments.some((a) => a.user.name.toLowerCase().includes(q))
    );
  });

  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const totalTasks    = tasks.length;
  const pendingTasks  = tasks.filter((t) => t.status === 'OPEN').length;
  const activeTasks   = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const doneTasks     = tasks.filter((t) => t.status === 'DONE').length;

  // ── Handlers ──

  const openEdit = (task: Task) => {
    setSelectedTask(task);
    setEditForm({
      title: task.title,
      description: task.description || '',
      due_date: task.due_date ? task.due_date.split('T')[0] : '',
      status: task.status,
      assignee_ids: task.assignments.map((a) => a.user.id),
    });
    setDrawerOpen(true);
  };

  const closeDrawer = () => { setDrawerOpen(false); setSelectedTask(null); };

  const handleSave = async () => {
    if (!selectedTask) return;
    setSaving(true);
    try {
      const res = await fetch(`${API}/tasks/${selectedTask.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          ...editForm,
          due_date: editForm.due_date || null,
        }),
      });
      if (!res.ok) throw new Error('Update failed');
      await fetchTasks();
      showSnack('Task updated successfully');
      closeDrawer();
    } catch {
      showSnack('Failed to update task', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateTask = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/tasks`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          ...addForm,
          due_date: addForm.due_date || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Create failed');
      await fetchTasks();
      showSnack('Task created successfully');
      setAddOpen(false);
      setAddForm({ title: '', description: '', due_date: '', assignee_ids: [] });
    } catch (err: any) {
      showSnack(err.message || 'Failed to create task', 'error');
    } finally {
      setSaving(false);
    }
  };

  const confirmCancel = (taskId: number) => {
    setTaskToCancel(taskId);
    setCancelOpen(true);
  };

  const handleCancelTask = async () => {
    if (!taskToCancel) return;
    setSaving(true);
    try {
      const res = await fetch(`${API}/tasks/${taskToCancel}/cancel`, {
        method: 'PATCH',
        headers,
      });
      if (!res.ok) throw new Error('Cancel failed');
      await fetchTasks();
      showSnack('Task cancelled');
      setCancelOpen(false);
      setTaskToCancel(null);
    } catch {
      showSnack('Failed to cancel task', 'error');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (iso: string | null) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const handleMultiSelectChange = (
    e: SelectChangeEvent<number[]>,
    field: 'assignee_ids',
    form: 'add' | 'edit'
  ) => {
    const value = e.target.value;
    const ids = typeof value === 'string' ? [] : (value as number[]);
    if (form === 'add') {
      setAddForm((prev) => ({ ...prev, [field]: ids }));
    } else {
      setEditForm((prev) => ({ ...prev, [field]: ids }));
    }
  };

  // ── Render ──
  return (
    <Box>

      {/* ── Page header ── */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Task Management</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Create, assign, and monitor operational tasks
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <TextField
            size="small"
            placeholder="Search by title, employee or status..."
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
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setAddOpen(true)}
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2, whiteSpace: 'nowrap' }}
          >
            Create Task
          </Button>
        </Box>
      </Box>

      {/* ── Stats row ── */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <StatCard
          icon={<AssignmentIcon sx={{ color: '#3b82f6', fontSize: 22 }} />}
          iconBg="#eff6ff"
          label="Total Tasks"
          value={totalTasks}
        />
        <StatCard
          icon={<HourglassEmptyIcon sx={{ color: '#ca8a04', fontSize: 22 }} />}
          iconBg="#fefce8"
          label="Pending"
          value={pendingTasks}
        />
        <StatCard
          icon={<AccessTimeIcon sx={{ color: '#7c3aed', fontSize: 22 }} />}
          iconBg="#f5f3ff"
          label="In Progress"
          value={activeTasks}
        />
        <StatCard
          icon={<CheckCircleIcon sx={{ color: '#16a34a', fontSize: 22 }} />}
          iconBg="#f0fdf4"
          label="Completed"
          value={doneTasks}
        />
      </Box>

      {/* ── Tasks table ── */}
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
              ) : paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                    No tasks found.
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((task) => {
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
                          <IconButton size="small" onClick={() => openEdit(task)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {task.status !== 'CANCELLED' && task.status !== 'DONE' && (
                          <Tooltip title="Cancel Task">
                            <IconButton
                              size="small"
                              onClick={() => confirmCancel(task.id)}
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
          count={filtered.length}
          page={page}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Card>

      {/* ── Edit Task Drawer ── */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={closeDrawer}
        slotProps={{ paper: { sx: { width: 420, p: 3 } } }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Edit Task</Typography>
          <IconButton size="small" onClick={closeDrawer}><CloseIcon /></IconButton>
        </Box>
        <Divider sx={{ mb: 3 }} />

        {selectedTask && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              label="Title"
              size="small"
              fullWidth
              value={editForm.title}
              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
            />
            <TextField
              label="Description"
              size="small"
              fullWidth
              multiline
              rows={3}
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
            />
            <TextField
              label="Due Date"
              type="date"
              size="small"
              fullWidth
              value={editForm.due_date}
              onChange={(e) => setEditForm({ ...editForm, due_date: e.target.value })}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <FormControl size="small" fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={editForm.status}
                label="Status"
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value as TaskStatus })}
              >
                <MenuItem value="OPEN">Pending</MenuItem>
                <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                <MenuItem value="DONE">Completed</MenuItem>
                <MenuItem value="CANCELLED">Cancelled</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" fullWidth>
              <InputLabel>Assigned Employees</InputLabel>
              <Select
                multiple
                value={editForm.assignee_ids}
                label="Assigned Employees"
                onChange={(e: SelectChangeEvent<number[]>) =>
                  handleMultiSelectChange(e, 'assignee_ids', 'edit')
                }
                renderValue={(selected) =>
                  employees
                    .filter((emp) => (selected as number[]).includes(emp.id))
                    .map((emp) => emp.name)
                    .join(', ')
                }
              >
                {employees.map((emp) => (
                  <MenuItem key={emp.id} value={emp.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 24, height: 24, bgcolor: '#e0e7ff', color: '#4338ca', fontSize: 11, fontWeight: 700 }}>
                        {emp.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="body2">{emp.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {emp.role.charAt(0) + emp.role.slice(1).toLowerCase()}
                        </Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
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
          </Box>
        )}
      </Drawer>

      {/* ── Create Task Dialog ── */}
      <Dialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Create New Task</DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2.5 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              label="Task Title"
              size="small"
              fullWidth
              value={addForm.title}
              onChange={(e) => setAddForm({ ...addForm, title: e.target.value })}
            />
            <TextField
              label="Description"
              size="small"
              fullWidth
              multiline
              rows={3}
              value={addForm.description}
              onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
            />
            <TextField
              label="Due Date"
              type="date"
              size="small"
              fullWidth
              value={addForm.due_date}
              onChange={(e) => setAddForm({ ...addForm, due_date: e.target.value })}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <FormControl size="small" fullWidth>
              <InputLabel>Assign To</InputLabel>
              <Select
                multiple
                value={addForm.assignee_ids}
                label="Assign To"
                onChange={(e: SelectChangeEvent<number[]>) =>
                  handleMultiSelectChange(e, 'assignee_ids', 'add')
                }
                renderValue={(selected) =>
                  employees
                    .filter((emp) => (selected as number[]).includes(emp.id))
                    .map((emp) => emp.name)
                    .join(', ')
                }
              >
                {employees.map((emp) => (
                  <MenuItem key={emp.id} value={emp.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 24, height: 24, bgcolor: '#e0e7ff', color: '#4338ca', fontSize: 11, fontWeight: 700 }}>
                        {emp.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="body2">{emp.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {emp.role.charAt(0) + emp.role.slice(1).toLowerCase()}
                        </Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={() => setAddOpen(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateTask}
            disabled={saving}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            {saving ? 'Creating...' : 'Create Task'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Cancel Confirmation Dialog ── */}
      <Dialog
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <CancelIcon color="error" fontSize="small" />
          Cancel Task
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to cancel this task? The record will be preserved in the database
            with a Cancelled status.
          </Typography>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={() => setCancelOpen(false)} sx={{ textTransform: 'none' }}>
            Go Back
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleCancelTask}
            disabled={saving}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            {saving ? 'Cancelling...' : 'Yes, Cancel Task'}
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
