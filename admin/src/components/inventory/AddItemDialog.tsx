// The "Add New Item" modal: enter the details for a brand new product.
// Inventory.tsx controls whether it's open and holds the form values;
// this component shows them and reports changes back via onChange.
import {
  Box, Button, TextField, InputAdornment, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import { ItemForm } from './types';

interface AddItemDialogProps {
  open: boolean;
  form: ItemForm;                             // current form values
  onChange: (changes: Partial<ItemForm>) => void; // update one or more form fields
  onClose: () => void;
  onSave: () => void;
  saving: boolean;
}

export default function AddItemDialog({ open, form, onChange, onClose, onSave, saving }: AddItemDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: 3 } } }}
    >
      <DialogTitle sx={{ fontWeight: 700 }}>Add New Item</DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 2.5 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField
            label="Name"
            size="small"
            fullWidth
            value={form.name}
            onChange={(e) => onChange({ name: e.target.value })}
          />
          <TextField
            label="SKU (מקט)"
            size="small"
            fullWidth
            value={form.sku}
            onChange={(e) => onChange({ sku: e.target.value })}
          />
          <TextField
            label="Description"
            size="small"
            fullWidth
            multiline
            minRows={2}
            value={form.description}
            onChange={(e) => onChange({ description: e.target.value })}
          />
          <TextField
            label="Price"
            size="small"
            fullWidth
            type="number"
            value={form.price}
            onChange={(e) => onChange({ price: e.target.value })}
            slotProps={{ input: { startAdornment: <InputAdornment position="start">$</InputAdornment> } }}
          />
          <TextField
            label="Initial Quantity"
            size="small"
            fullWidth
            type="number"
            value={form.qty}
            onChange={(e) => onChange({ qty: Math.max(0, parseInt(e.target.value, 10) || 0) })}
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
          {saving ? 'Creating...' : 'Create Item'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
