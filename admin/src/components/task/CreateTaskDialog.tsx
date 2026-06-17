// The "Create New Task" modal: enter title, description, due date and assignees.
// TaskManage.tsx controls whether it's open and holds the form values; this
// component shows them and reports changes back via onChange.
import {
  Box, Button, TextField, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import AssigneeSelect from './AssigneeSelect';
import { Employee, AddTaskForm } from './types';

interface CreateTaskDialogProps {
  open: boolean;
  form: AddTaskForm;                              // current form values
  onChange: (changes: Partial<AddTaskForm>) => void; // update one or more form fields
  employees: Employee[];                          // people who can be assigned
  onClose: () => void;
  onSave: () => void;
  saving: boolean;
}

export default function CreateTaskDialog({ open, form, onChange, employees, onClose, onSave, saving }: CreateTaskDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
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
          <AssigneeSelect
            label="Assign To"
            employees={employees}
            value={form.assignee_ids}
            onChange={(ids) => onChange({ assignee_ids: ids })}
          />
        </Box>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button onClick={onClose} sx={{ textTransform: 'none' }}>Cancel</Button>
        <Button
          variant="contained"
          onClick={onSave}
          disabled={saving}
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          {saving ? 'Creating...' : 'Create Task'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
