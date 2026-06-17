// Reports page (read-only audit log). This file coordinates the data and state
// for the screen and renders the smaller UI components from ./reports:
//   - ReportsToolbar       (search + status filter)
//   - ReportStats          (summary cards)
//   - ReportsTable         (report list + pagination)
//   - ReportDetailsDialog  (read-only report details)
// There are no create/edit/delete actions here — reports are view-only.
import React from 'react';
import { Box, Typography, Alert, Snackbar } from '@mui/material';

import ReportsToolbar from './reports/ReportsToolbar';
import ReportStats from './reports/ReportStats';
import ReportsTable from './reports/ReportsTable';
import ReportDetailsDialog from './reports/ReportDetailsDialog';
import { Report, ReportStatus } from './reports/types';

// Base URL for all API calls — matches the Express server port
const API = 'http://localhost:5001';

// ── Main component ──
// token: JWT passed from App so every fetch is authenticated
export default function Reports({ token }: { token: string }) {

  // ── State ──
  const [reports, setReports] = React.useState<Report[]>([]);   // full report list from the API
  const [loading, setLoading] = React.useState(true);            // shows a spinner on first load
  const [search, setSearch] = React.useState('');                // current search input value
  const [statusFilter, setStatusFilter] = React.useState<ReportStatus | 'ALL'>('ALL');
  const [page, setPage] = React.useState(0);                     // current table page (0-indexed)
  const [rowsPerPage, setRowsPerPage] = React.useState(10);      // rows shown per page

  // Details dialog — the report currently being viewed (null when closed)
  const [selectedReport, setSelectedReport] = React.useState<Report | null>(null);

  // Snackbar (toast) for error feedback
  const [snack, setSnack] = React.useState<{ open: boolean; message: string }>({ open: false, message: '' });

  // Reusable headers: Content-Type + the Bearer JWT for protected routes
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  // Fetches all reports from GET /reports and stores them in state.
  const fetchReports = React.useCallback(async () => {
    try {
      const res = await fetch(`${API}/reports`, { headers });
      if (!res.ok) throw new Error('Failed to load reports');
      const data = await res.json();
      setReports(data);
    } catch {
      setSnack({ open: true, message: 'Failed to load reports' });
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Load reports once when the component mounts (or when the token changes)
  React.useEffect(() => { fetchReports(); }, [fetchReports]);

  // ── Derived data ──

  // Filter by search text (action, user, product) and by the selected status
  const filtered = reports.filter((r) => {
    const q = search.toLowerCase();
    const matchesSearch =
      r.action.toLowerCase().includes(q) ||
      (r.user?.name || '').toLowerCase().includes(q) ||
      r.item_name.toLowerCase().includes(q) ||
      r.item_sku.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Slice the filtered list to only the rows that fit on the current page
  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // ── Render ──
  return (
    <Box>

      {/* ── Page header: title + search + status filter ── */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Reports</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Audit log of inventory activity across the Admin and Client apps
          </Typography>
        </Box>
        <ReportsToolbar
          search={search}
          onSearchChange={(value) => { setSearch(value); setPage(0); }}
          statusFilter={statusFilter}
          onStatusFilterChange={(value) => { setStatusFilter(value); setPage(0); }}
        />
      </Box>

      {/* ── Stats row ── */}
      <ReportStats reports={reports} />

      {/* ── Reports table ── */}
      <ReportsTable
        rows={paginated}
        loading={loading}
        count={filtered.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={setPage}
        onRowsPerPageChange={(value) => { setRowsPerPage(value); setPage(0); }}
        onView={setSelectedReport}
      />

      {/* ── Report Details Dialog ── */}
      <ReportDetailsDialog
        report={selectedReport}
        onClose={() => setSelectedReport(null)}
      />

      {/* ── Snackbar (toast) ── only used for load errors on this read-only page ── */}
      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="error" variant="filled" onClose={() => setSnack({ ...snack, open: false })}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
