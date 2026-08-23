// Back Office page — system-wide control switches.
// Loads the current values from GET /settings and saves each toggle with
// PUT /settings (Admin / Manager only — enforced by the server).
import React from 'react';
import { Alert, Box, Card, CardContent, Chip, Snackbar, Switch, Typography } from '@mui/material';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import CloudOffIcon from '@mui/icons-material/CloudOff';

// Base URL for all API calls
const API = 'http://localhost:5001';

// A single control row: coloured icon, title + description, status chip and the switch.
function ControlCard({ icon, iconBg, title, description, checked, disabled, onChange }: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
  checked: boolean;
  disabled: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 2 }}>
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Box sx={{ bgcolor: iconBg, borderRadius: 2, p: 1.25, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.3 }}>{title}</Typography>
          <Typography variant="body2" color="text.secondary">{description}</Typography>
        </Box>
        <Chip
          label={checked ? 'Enabled' : 'Disabled'}
          size="small"
          sx={{
            fontWeight: 600,
            bgcolor: checked ? '#f0fdf4' : '#fef2f2',
            color: checked ? '#16a34a' : '#dc2626',
          }}
        />
        <Switch checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
      </CardContent>
    </Card>
  );
}

export default function BackOffice({ token }: { token: string }) {
  const [systemEnabled, setSystemEnabled] = React.useState(true);
  const [offlineModeEnabled, setOfflineModeEnabled] = React.useState(true);
  const [loading, setLoading] = React.useState(true);
  const [snack, setSnack] = React.useState<{ open: boolean; message: string }>({ open: false, message: '' });

  // Reusable headers: Content-Type + the Bearer JWT for protected routes
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  // Applies a settings object from the server to both switches
  const applySettings = (data: { system_enabled: boolean; offline_mode_enabled: boolean }) => {
    setSystemEnabled(data.system_enabled);
    setOfflineModeEnabled(data.offline_mode_enabled);
  };

  // Load the current settings once on mount
  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API}/settings`, { headers });
        if (!res.ok) throw new Error('Failed to load settings');
        applySettings(await res.json());
      } catch {
        setSnack({ open: true, message: 'Failed to load settings' });
      } finally {
        setLoading(false);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Saves one switch to the server and applies the returned values
  const updateSetting = async (key: string, value: boolean) => {
    try {
      const res = await fetch(`${API}/settings`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ key, value }),
      });
      if (!res.ok) throw new Error('Failed to update setting');
      applySettings(await res.json());
    } catch {
      setSnack({ open: true, message: 'Failed to update setting' });
    }
  };

  return (
    <Box>

      {/* ── Page header ── */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Back Office</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          System-wide controls for the InventoryGo mobile app
        </Typography>
      </Box>

      {/* ── Control switches ── */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 720 }}>
        <ControlCard
          icon={<PowerSettingsNewIcon sx={{ color: '#3b82f6', fontSize: 22 }} />}
          iconBg="#eff6ff"
          title="System"
          description="Master switch — when disabled, mobile app users are blocked until it is turned back on"
          checked={systemEnabled}
          disabled={loading}
          onChange={(value) => updateSetting('system_enabled', value)}
        />
        <ControlCard
          icon={<CloudOffIcon sx={{ color: '#ca8a04', fontSize: 22 }} />}
          iconBg="#fefce8"
          title="Offline Mode"
          description="Allows the mobile app to keep working without a connection and sync changes later"
          checked={offlineModeEnabled}
          disabled={loading}
          onChange={(value) => updateSetting('offline_mode_enabled', value)}
        />
      </Box>

      {/* ── Snackbar (toast) for load / save errors ── */}
      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack({ open: false, message: '' })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setSnack({ open: false, message: '' })}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
