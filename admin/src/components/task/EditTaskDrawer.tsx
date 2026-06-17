// The "Edit Task" drawer that slides in from the right: edit title, description,
// due date, status and assignees. TaskManage.tsx controls whether it's open and
// holds the form values; this component shows them and reports changes via onChange.
import {
  Box, Typography, Button, TextField, IconButton, Drawer, Divider,
  Select, MenuItem, FormControl, InputLabel,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AssigneeSelect from './AssigneeSelect';
import { Task, Employee, EditTaskForm, TaskStatus } from './types';

interface EditTaskDrawerProps {
  open: boolean;
  task: Task | null;                              // the task being edited (null when closed)
  form: EditTaskForm;                             // current form values
  onChange: (changes: Partial<EditTaskForm>) => void; // update one or more form fields
  employees: Employee[];                          // people who can be assigned
  onClose: () => void;
  onSave: () => void;
  saving: boolean;
}

export default function EditTaskDrawer({ open, task, form, onChange, employees, onClose, onSave, saving }: EditTaskDrawerProps) {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{ paper: { sx: { width: 420, p: 3 } } }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>Edit Task</Typography>
        <IconButton size="small" onClick={onClose}><CloseIcon /></IconButton>
      </Box>
      <Divider sx={{ mb: 3 }} />

      {task && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField
            label="Title"
            size="small"
            fullWidth
            value={form.title}
            onChange={(e) => onChange({ title: e.target.value })}
          />
          <TextField
            label="Description"
            size="small"
            fullWidth
            multiline
            rows={3}
            value={form.description}
            onChange={(e) => onChange({ description: e.target.value })}
          />
          <TextField
            label="Due Date"
            type="date"
            size="small"
            fullWidth
            value={form.due_date}
            onChange={(e) => onChange({ due_date: e.target.value })}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <FormControl size="small" fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={form.status}
              label="Status"
              onChange={(e) => onChange({ status: e.target.value as TaskStatus })}
            >
              <MenuItem value="OPEN">Pending</MenuItem>
              <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
              <MenuItem value="DONE">Completed</MenuItem>
              <MenuItem value="CANCELLED">Cancelled</MenuItem>
            </Select>
          </FormControl>
          <AssigneeSelect
            label="Assigned Employees"
            employees={employees}
            value={form.assignee_ids}
            onChange={(ids) => onChange({ assignee_ids: ids })}
          />

          <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
            <Button
              variant="contained"
              fullWidth
              onClick={onSave}
              disabled={saving}
              sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 1.5 }}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              variant="outlined"
              fullWidth
              onClick={onClose}
              sx={{ textTransform: 'none', borderRadius: 1.5 }}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      )}
    </Drawer>
  );
}
