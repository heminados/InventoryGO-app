// The "Edit User" drawer that slides in from the right: edit name/email/role/
// status and send a password reset link. EmployeeManage.tsx controls whether
// it's open and holds the form values; this component shows them and reports
// changes back via onChange.
import {
  Box, Typography, Button, TextField, Card, CardContent, IconButton, Drawer,
  Divider, Select, MenuItem, FormControl, InputLabel, Avatar,
} from '@mui/material';
import LockResetIcon from '@mui/icons-material/LockReset';
import CloseIcon from '@mui/icons-material/Close';
import EmailIcon from '@mui/icons-material/Email';
import { User, EditUserForm, Role } from './types';

interface EditUserDrawerProps {
  open: boolean;
  user: User | null;                              // the user being edited (null when closed)
  form: EditUserForm;                             // current form values
  onChange: (changes: Partial<EditUserForm>) => void; // update one or more form fields
  onClose: () => void;
  onSave: () => void;
  saving: boolean;
  onResetPassword: () => void;                    // sends a reset link for the selected user
  resetting: boolean;
}

export default function EditUserDrawer({
  open, user, form, onChange, onClose, onSave, saving, onResetPassword, resetting,
}: EditUserDrawerProps) {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{ paper: { sx: { width: 380, p: 3 } } }}
    >
      {/* Drawer header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>Edit User</Typography>
        <IconButton size="small" onClick={onClose}><CloseIcon /></IconButton>
      </Box>
      <Divider sx={{ mb: 3 }} />

      {/* Only render form content when a user is actually selected */}
      {user && (
        <>
          {/* Avatar showing the first letter of the user's name */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <Avatar sx={{ width: 72, height: 72, bgcolor: '#e0e7ff', color: '#4338ca', fontSize: 28, fontWeight: 700 }}>
              {user.name.charAt(0).toUpperCase()}
            </Avatar>
          </Box>

          {/* Editable fields: Full Name, Email, Role, Status */}
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
            {/* Role dropdown — maps to the Role enum in the database */}
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
            {/* Status dropdown — maps to the is_active boolean field */}
            <FormControl size="small" fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={form.is_active ? 'active' : 'inactive'}
                label="Status"
                onChange={(e) => onChange({ is_active: e.target.value === 'active' })}
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
              <Button
                variant="outlined"
                fullWidth
                size="small"
                startIcon={<EmailIcon />}
                onClick={onResetPassword}
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
        </>
      )}
    </Drawer>
  );
}
