// The read-only "Report Details" modal: shows the full information for one
// report (type, action, product, user, date/time, source app, details and —
// for exceptions — the reason it failed). Reports.tsx passes the selected
// report; there are no edit/delete actions because the page is audit-only.
import {
  Box, Typography, Button, IconButton, Divider, Chip, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Report, sourceLabel, formatDateTime } from './types';

interface ReportDetailsDialogProps {
  report: Report | null;   // the report to show (null when closed)
  onClose: () => void;
}

// One label/value line used throughout the dialog
function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {label}
      </Typography>
      <Typography variant="body1" sx={{ fontWeight: 500, mt: 0.25 }}>{value}</Typography>
    </Box>
  );
}

export default function ReportDetailsDialog({ report, onClose }: ReportDetailsDialogProps) {
  const isException = report?.status === 'EXCEPTION';

  return (
    <Dialog
      open={!!report}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: 3 } } }}
    >
      {report && (
        <>
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Report #{report.id}</Typography>
              <Chip
                label={isException ? 'Exception' : 'Normal'}
                size="small"
                sx={{
                  bgcolor: isException ? '#fee2e2' : '#dcfce7',
                  color: isException ? '#dc2626' : '#16a34a',
                  fontWeight: 600,
                }}
              />
            </Box>
            <IconButton size="small" onClick={onClose}><CloseIcon /></IconButton>
          </DialogTitle>
          <Divider />
          <DialogContent sx={{ pt: 2.5 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>

              {/* Two columns of summary fields */}
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ flex: 1 }}><DetailRow label="Report Type" value="Inventory" /></Box>
                <Box sx={{ flex: 1 }}><DetailRow label="Action Performed" value={report.action} /></Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ flex: 1 }}><DetailRow label="Source Application" value={sourceLabel(report.source)} /></Box>
                <Box sx={{ flex: 1 }}><DetailRow label="Date & Time" value={formatDateTime(report.created_at)} /></Box>
              </Box>

              {/* User who triggered the report */}
              <DetailRow
                label="Triggered By"
                value={report.user ? `${report.user.name} (${report.user.email})` : 'Unknown'}
              />

              {/* Affected product, when recorded */}
              {report.item_name && (
                <DetailRow
                  label="Product"
                  value={report.item_sku ? `${report.item_name} · ${report.item_sku}` : report.item_name}
                />
              )}

              {/* Additional details, when available */}
              {report.details && (
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Additional Details
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>{report.details}</Typography>
                </Box>
              )}

              {/* Exception reason — only for failed inventory actions */}
              {isException && report.exception_reason && (
                <Alert severity="error" sx={{ borderRadius: 2 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.25 }}>
                    Exception Reason
                  </Typography>
                  {report.exception_reason}
                </Alert>
              )}
            </Box>
          </DialogContent>
          <Divider />
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={onClose} sx={{ textTransform: 'none' }}>Close</Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
}
