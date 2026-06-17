// Shared types, the status colour map, and the store name for the order page
// and its sub-components. OrderManage.tsx and the components in this folder all
// import from here.

export const STORE_NAME = 'InventoryGO Store';

export type OrderStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED';

// One product line inside an order
export interface OrderItemDetail {
  id: number;
  quantity: number;
  item: { id: number; sku: string; name: string; price: string };
}

// One order as returned by GET /orders
export interface Order {
  id: number;
  created_at: string;
  updated_at: string;
  status: OrderStatus;
  customer_name: string;
  customer_phone: string;
  creator: { id: number; name: string; email: string };
  order_items: OrderItemDetail[];
}

// An inventory item used by the edit form's "add item" picker
export interface InventoryItem {
  id: number;
  sku: string;
  name: string;
  price: string;
  qty: number;
}

// A product line while editing an order (kept in component state)
export interface EditLineItem {
  item_id: number;
  quantity: number;
  item_name: string;
  item_sku: string;
  item_price: string;
}

// How each status is labelled and coloured in the table / chips
export const STATUS_CONFIG: Record<OrderStatus, { label: string; bg: string; color: string }> = {
  PENDING:   { label: 'Pending',   bg: '#fefce8', color: '#ca8a04' },
  APPROVED:  { label: 'Approved',  bg: '#dcfce7', color: '#16a34a' },
  REJECTED:  { label: 'Rejected',  bg: '#fff7ed', color: '#ea580c' },
  COMPLETED: { label: 'Completed', bg: '#eff6ff', color: '#3b82f6' },
  CANCELLED: { label: 'Cancelled', bg: '#f1f5f9', color: '#64748b' },
};
