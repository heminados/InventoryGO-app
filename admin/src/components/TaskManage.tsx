// Task-management page. This file coordinates the data and state for the screen
// and renders the smaller UI components from ./task:
//   - TaskSearchBar     (search + create button)
//   - TaskStats         (summary cards)
//   - TaskTable         (task list + pagination)
//   - EditTaskDrawer    (edit drawer)
//   - CreateTaskDialog  (create task modal)
//   - CancelTaskDialog  (cancel confirmation modal)
import React from 'react';
import { Box, Typography, Alert, Snackbar } from '@mui/material';

import TaskSearchBar from './task/TaskSearchBar';
import TaskStats from './task/TaskStats';
import TaskTable from './task/TaskTable';
import EditTaskDrawer from './task/EditTaskDrawer';
import CreateTaskDialog from './task/CreateTaskDialog';
import CancelTaskDialog from './task/CancelTaskDialog';
import { Task, Employee, EditTaskForm, AddTaskForm, STATUS_CONFIG } from './task/types';

const API = 'http://localhost:5001';

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
  const [editForm, setEditForm] = React.useState<EditTaskForm>({
    title: '', description: '', due_date: '', status: 'OPEN', assignee_ids: [],
  });

  // Create task dialog
  const [addOpen, setAddOpen] = React.useState(false);
  const [addForm, setAddForm] = React.useState<AddTaskForm>({
    title: '', description: '', due_date: '', assignee_ids: [],
  });

  // Cancel confirmation dialog
  const [cancelOpen, setCancelOpen] = React.useState(false);
  const [taskToCancel, setTaskToCancel] = React.useState<number | null>(null);

  const [snack, setSnack] = React.useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false, message: '', severity: 'success',
  });
  const [saving, setSaving] = React.useState(false);

  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const showSnack = (message: string, severity: 'success' | 'error' = 'success') =>
    setSnack({ open: true, message, severity });

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
        <TaskSearchBar
          search={search}
          onSearchChange={(value) => { setSearch(value); setPage(0); }}
          onCreateClick={() => setAddOpen(true)}
        />
      </Box>

      {/* ── Stats row ── */}
      <TaskStats tasks={tasks} />

      {/* ── Tasks table ── */}
      <TaskTable
        rows={paginated}
        loading={loading}
        count={filtered.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={setPage}
        onRowsPerPageChange={(value) => { setRowsPerPage(value); setPage(0); }}
        onEdit={openEdit}
        onCancel={confirmCancel}
      />

      {/* ── Edit Task Drawer ── */}
      <EditTaskDrawer
        open={drawerOpen}
        task={selectedTask}
        form={editForm}
        onChange={(changes) => setEditForm({ ...editForm, ...changes })}
        employees={employees}
        onClose={closeDrawer}
        onSave={handleSave}
        saving={saving}
      />

      {/* ── Create Task Dialog ── */}
      <CreateTaskDialog
        open={addOpen}
        form={addForm}
        onChange={(changes) => setAddForm({ ...addForm, ...changes })}
        employees={employees}
        onClose={() => setAddOpen(false)}
        onSave={handleCreateTask}
        saving={saving}
      />

      {/* ── Cancel Confirmation Dialog ── */}
      <CancelTaskDialog
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        onConfirm={handleCancelTask}
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
