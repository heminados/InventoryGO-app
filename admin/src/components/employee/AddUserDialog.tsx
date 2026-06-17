// The "Add New User" modal: enter name, email, password and role for a new user.
// EmployeeManage.tsx controls whether it's open and holds the form values;
// this component shows them and reports changes back via onChange.
import {
  Box, Button, TextField, Divider, Select, MenuItem, FormControl, InputLabel,
  Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import { AddUserForm, Role } from './types';

interface AddUserDialogProps {
  open: boolean;
  form: AddUserForm;                              // current form values
  onChange: (changes: Partial<AddUserForm>) => void; // update one or more form fields
  onClose: () => void;
  onSave: () => void;
  saving: boolean;
}

export default function AddUserDialog({ open, form, onChange, onClose, onSave, saving }: AddUserDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
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
            value={form.name}
            onChange={(e) => onChange({ name: e.target.value })}
          />
          <TextField
            label="Email"
            size="small"
            fullWidth
            value={form.email}
            onChange={(e) => onChange({ email: e.target.value })}
          />
          <TextField
            label="Password"
            type="password"
            size="small"
            fullWidth
            value={form.password}
            onChange={(e) => onChange({ password: e.target.value })}
          />
          {/* Role dropdown — defaults to EMPLOYEE, the safest starting role */}
          <FormControl size="small" fullWidth>
            <InputLabel>Role</InputLabel>
            <Select
              value={form.role}
              label="Role"
              onChange={(e) => onChange({ role: e.target.value as Role })}
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
        <Button onClick={onClose} sx={{ textTransform: 'none' }}>Cancel</Button>
        <Button
          variant="contained"
          onClick={onSave}
          disabled={saving}
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          {saving ? 'Creating...' : 'Create User'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
