// The "Edit Item" modal: edit details, step the stock up/down, and toggle the
// "Requires Inspection" flag. Inventory.tsx controls whether it's open and holds
// the form values; this component shows them and reports changes back via onChange.
import {
  Box, Typography, Button, TextField, InputAdornment, IconButton, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions, Alert, Switch, FormControlLabel,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { Item, ItemForm } from './types';

interface EditItemDialogProps {
  open: boolean;
  item: Item | null;                          // the item being edited (null when closed)
  form: ItemForm;                             // current form values
  onChange: (changes: Partial<ItemForm>) => void; // update one or more form fields
  onClose: () => void;
  onSave: () => void;
  saving: boolean;
}

export default function EditItemDialog({ open, item, form, onChange, onClose, onSave, saving }: EditItemDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: 3 } } }}
    >
      <DialogTitle sx={{ fontWeight: 700 }}>Edit Item</DialogTitle>
      <Divider />
      {item && (
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

            {/* Stock stepper: increase / decrease quantity (never below zero) */}
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Stock Quantity</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <IconButton
                  onClick={() => onChange({ qty: Math.max(0, form.qty - 1) })}
                  sx={{ border: '1px solid #e5e7eb', borderRadius: 2 }}
                >
                  <RemoveIcon fontSize="small" />
                </IconButton>
                <Typography variant="h6" sx={{ fontWeight: 700, minWidth: 40, textAlign: 'center' }}>
                  {form.qty}
                </Typography>
                <IconButton
                  onClick={() => onChange({ qty: form.qty + 1 })}
                  sx={{ border: '1px solid #e5e7eb', borderRadius: 2 }}
                >
                  <AddIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>

            {/* Requires Inspection toggle — reuses the is_ordered field */}
            <FormControlLabel
              control={
                <Switch
                  checked={form.is_ordered}
                  onChange={(e) => onChange({ is_ordered: e.target.checked })}
                  color="warning"
                />
              }
              label={<Typography variant="body2" sx={{ fontWeight: 600 }}>Requires Inspection</Typography>}
            />
            {form.is_ordered && (
              <Alert severity="warning" icon={<WarningAmberIcon fontSize="inherit" />} sx={{ borderRadius: 2 }}>
                While flagged, employees cannot perform any inventory operations on this item.
              </Alert>
            )}
          </Box>
        </DialogContent>
      )}
      <Divider />
      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button onClick={onClose} sx={{ textTransform: 'none' }}>Cancel</Button>
        <Button
          variant="contained"
          onClick={onSave}
          disabled={saving}
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
