// A small confirmation modal asking whether to cancel an order.
// OrderManage.tsx opens it after the cancel icon is clicked and runs the
// actual cancel request through onConfirm.
import {
  Button, Divider, Dialog, DialogTitle, DialogContent, DialogActions, Typography,
} from '@mui/material';

interface CancelOrderDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  saving: boolean;
}

export default function CancelOrderDialog({ open, onClose, onConfirm, saving }: CancelOrderDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: 3 } } }}
    >
      <DialogTitle sx={{ fontWeight: 700 }}>Cancel Order</DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Are you sure you want to cancel this order? If it was already approved, inventory will be
          restored automatically. The order record will be preserved.
        </Typography>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button onClick={onClose} sx={{ textTransform: 'none' }}>Go Back</Button>
        <Button
          variant="contained"
          color="error"
          onClick={onConfirm}
          disabled={saving}
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          {saving ? 'Cancelling...' : 'Yes, Cancel Order'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
