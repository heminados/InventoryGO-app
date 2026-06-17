// The "Edit Order" drawer that slides in from the right: edit customer info, and
// (for PENDING orders) add/remove product lines and change their quantities.
// OrderManage.tsx owns all the state and passes it down with callbacks; this
// component only renders it and reports user actions back.
import {
  Box, Typography, Button, TextField, IconButton, Drawer, Divider, Tooltip,
  Select, MenuItem, FormControl, InputLabel, Alert,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { Order, InventoryItem, EditLineItem, STATUS_CONFIG } from './types';
import { currency } from './helpers';

interface EditOrderDrawerProps {
  open: boolean;
  order: Order | null;                                  // the order being edited (null when closed)
  form: { customer_name: string; customer_phone: string };
  onFormChange: (changes: Partial<{ customer_name: string; customer_phone: string }>) => void;
  lines: EditLineItem[];                                // product lines being edited
  onChangeLineQty: (item_id: number, delta: number) => void;
  onRemoveLine: (item_id: number) => void;
  availableToAdd: InventoryItem[];                      // items not already in the order
  addItemId: number | '';                              // item currently chosen in the "add item" picker
  onAddItemIdChange: (id: number | '') => void;
  addItemQty: number;
  onAddItemQtyChange: (qty: number) => void;
  onAddLine: () => void;
  onSave: () => void;
  onClose: () => void;
  saving: boolean;
}

export default function EditOrderDrawer({
  open, order, form, onFormChange, lines, onChangeLineQty, onRemoveLine,
  availableToAdd, addItemId, onAddItemIdChange, addItemQty, onAddItemQtyChange,
  onAddLine, onSave, onClose, saving,
}: EditOrderDrawerProps) {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{ paper: { sx: { width: 500, p: 3 } } }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Edit Order</Typography>
          {order && (
            <Typography variant="caption" color="text.secondary">Order #{order.id}</Typography>
          )}
        </Box>
        <IconButton size="small" onClick={onClose}><CloseIcon /></IconButton>
      </Box>
      <Divider sx={{ mb: 3 }} />

      {order && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, overflowY: 'auto' }}>

          {/* Customer info */}
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', fontSize: 11, letterSpacing: 0.5 }}>
            Customer Information
          </Typography>
          <TextField
            label="Customer Name"
            size="small"
            fullWidth
            value={form.customer_name}
            onChange={(e) => onFormChange({ customer_name: e.target.value })}
          />
          <TextField
            label="Customer Phone"
            size="small"
            fullWidth
            value={form.customer_phone}
            onChange={(e) => onFormChange({ customer_phone: e.target.value })}
          />

          {/* Items editor — only for PENDING orders */}
          {order.status === 'PENDING' && (
            <>
              <Divider />
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', fontSize: 11, letterSpacing: 0.5 }}>
                Order Items
              </Typography>

              {lines.length === 0 ? (
                <Typography variant="body2" color="text.secondary">No items in this order.</Typography>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {lines.map((line) => (
                    <Box
                      key={line.item_id}
                      sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.25, bgcolor: '#f9fafb', borderRadius: 1.5, border: '1px solid #e5e7eb' }}
                    >
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }} noWrap>{line.item_name}</Typography>
                        <Typography variant="caption" color="text.secondary">{line.item_sku} · {currency(parseFloat(line.item_price))}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <IconButton size="small" onClick={() => onChangeLineQty(line.item_id, -1)}
                          sx={{ border: '1px solid #e5e7eb', borderRadius: 1, p: 0.25, fontSize: 14 }}>−</IconButton>
                        <Typography variant="body2" sx={{ minWidth: 28, textAlign: 'center', fontWeight: 600 }}>{line.quantity}</Typography>
                        <IconButton size="small" onClick={() => onChangeLineQty(line.item_id, 1)}
                          sx={{ border: '1px solid #e5e7eb', borderRadius: 1, p: 0.25, fontSize: 14 }}>+</IconButton>
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 64, textAlign: 'right' }}>
                        {currency(parseFloat(line.item_price) * line.quantity)}
                      </Typography>
                      <Tooltip title="Remove">
                        <IconButton size="small" onClick={() => onRemoveLine(line.item_id)} sx={{ color: 'error.main' }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  ))}
                </Box>
              )}

              {/* Add item row */}
              {availableToAdd.length > 0 && (
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
                  <FormControl size="small" sx={{ flex: 1 }}>
                    <InputLabel>Add Item</InputLabel>
                    <Select
                      value={addItemId}
                      label="Add Item"
                      onChange={(e) => onAddItemIdChange(e.target.value as number)}
                    >
                      {availableToAdd.map((i) => (
                        <MenuItem key={i.id} value={i.id}>
                          {i.name} ({i.sku}) — {currency(parseFloat(i.price))}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    label="Qty"
                    type="number"
                    size="small"
                    sx={{ width: 72 }}
                    value={addItemQty}
                    slotProps={{ htmlInput: { min: 1 } }}
                    onChange={(e) => onAddItemQtyChange(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  />
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={onAddLine}
                    disabled={!addItemId}
                    sx={{ textTransform: 'none', whiteSpace: 'nowrap' }}
                  >
                    Add
                  </Button>
                </Box>
              )}

              {/* Running total */}
              {lines.length > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 3, pt: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    {lines.reduce((s, l) => s + l.quantity, 0)} units
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {currency(lines.reduce((s, l) => s + parseFloat(l.item_price) * l.quantity, 0))}
                  </Typography>
                </Box>
              )}
            </>
          )}

          {order.status !== 'PENDING' && (
            <Alert severity="info" sx={{ borderRadius: 1.5 }}>
              Only customer information can be edited on {STATUS_CONFIG[order.status].label.toLowerCase()} orders.
            </Alert>
          )}

          {/* Buttons */}
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
