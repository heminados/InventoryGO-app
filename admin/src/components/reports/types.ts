// Shared types and small display helpers for the reports page and its
// sub-components. Reports.tsx and the components in this folder import from here.

export type ReportStatus = 'NORMAL' | 'EXCEPTION';

// One inventory report as returned by GET /reports (already flattened by the
// backend from the JSON stored in the Report.description field).
export interface Report {
  id: number;
  type: string;             // currently always 'INVENTORY'
  action: string;           // e.g. "Stock added", "Product updated"
  status: ReportStatus;     // 'NORMAL' or 'EXCEPTION'
  source: string;           // 'admin' or 'client'
  details: string;          // human-readable summary of what changed
  exception_reason: string; // why a failed action was rejected (exceptions only)
  item_sku: string;
  item_name: string;
  created_at: string;
  user: { name: string; email: string; role: string } | null;
}

// Turns the stored source code into a friendly application name
export const sourceLabel = (source: string) => (source === 'admin' ? 'Admin App' : 'Client App');

// Formats an ISO timestamp as "DD Mon YYYY, HH:MM"
export const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
