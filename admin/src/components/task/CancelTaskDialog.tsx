// A small confirmation modal asking whether to cancel a task.
// TaskManage.tsx opens it after the cancel icon is clicked and runs the
// actual cancel request through onConfirm.
import {
  Button, Divider, Dialog, DialogTitle, DialogContent, DialogActions, Typography,
} from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';

interface CancelTaskDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  saving: boolean;
}

export default function CancelTaskDialog({ open, onClose, onConfirm, saving }: CancelTaskDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
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
        <Button onClick={onClose} sx={{ textTransform: 'none' }}>
          Go Back
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={onConfirm}
          disabled={saving}
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          {saving ? 'Cancelling...' : 'Yes, Cancel Task'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
