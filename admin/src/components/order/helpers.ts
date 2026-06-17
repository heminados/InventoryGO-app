// Small formatting / calculation helpers shared by the order components
// (table, details dialog, edit drawer). Kept here so each component can reuse
// them instead of redefining the same maths and date/money formatting.
import { Order } from './types';

// Total money value of an order (sum of price * quantity for every line)
export const calcValue = (order: Order) =>
  order.order_items.reduce((s, oi) => s + parseFloat(oi.item.price) * oi.quantity, 0);

// Total number of units across all lines of an order
export const calcQty = (order: Order) =>
  order.order_items.reduce((s, oi) => s + oi.quantity, 0);

// Formats an ISO date into "DD Mon YYYY"
export const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

// Formats a number as "$0.00"
export const currency = (n: number) => `$${n.toFixed(2)}`;
