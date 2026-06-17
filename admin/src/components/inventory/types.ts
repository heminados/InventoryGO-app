// Shared types for the inventory page and its sub-components.
// Inventory.tsx and the components in this folder all import from here
// so they describe items and the edit form the same way.

// One product as returned by GET /items/getAll.
// price is a string because Prisma serialises Decimal as a string.
// NOTE: is_ordered is reused as the "Requires Inspection" flag (no schema change).
export interface Item {
  id: number;
  sku: string;
  name: string;
  description: string | null;
  price: string;
  qty: number;
  is_ordered: boolean;
}

// Editable values used by the Add and Edit dialogs.
// is_ordered = "Requires Inspection".
export interface ItemForm {
  sku: string;
  name: string;
  description: string;
  price: string;
  qty: number;
  is_ordered: boolean;
}
