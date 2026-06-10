import React from 'react';
import {
  Box, Typography, Card, CardContent, CircularProgress, Alert,
} from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory2';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlineOutlined';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const API = 'http://localhost:5001';

// Shape returned by GET /dashboard/stats
interface DashboardStats {
  totalStock: number;
  openOrders: number;
  pendingOrders: number;
  lowStockAlerts: number;
  requiredToCheck: number;
  tasks: number;
  openTasks: number;
  completedTasks: number;
}

interface MetricCardProps {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: number;
  // Optional bottom note shown in small text under the value (e.g. warning context)
  note?: string;
  noteColor?: string;
}

// A single metric card — icon on the left, number + label on the right
function MetricCard({ icon, iconBg, label, value, note, noteColor }: MetricCardProps) {
  return (
    <Card variant="outlined" sx={{ flex: 1, minWidth: 160, borderRadius: 2 }}>
      <CardContent sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, py: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Box sx={{ bgcolor: iconBg, borderRadius: 2, p: 1.25, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {icon}
        </Box>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, lineHeight: 1.1 }}>{value}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{label}</Typography>
          {note && (
            <Typography variant="caption" sx={{ color: noteColor ?? 'text.secondary', mt: 0.5, display: 'block' }}>
              {note}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

type HomePageProps = { token: string };

// Dashboard page — fetches live stats from the server and renders them as metric cards
export default function HomePage({ token }: HomePageProps) {
  const [stats, setStats] = React.useState<DashboardStats | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    fetch(`${API}/dashboard/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((body) => {
            const msg = body?.error || body?.message || 'Failed to load dashboard stats';
            console.error('Dashboard stats error:', res.status, body);
            throw new Error(msg);
          });
        }
        return res.json();
      })
      .then((data) => setStats(data))
      .catch((err) => { console.error('Dashboard fetch failed:', err); setError(err.message); })
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <Box>
      {/* Page header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Dashboard</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Live inventory overview for your warehouse
        </Typography>
      </Box>

      {/* Loading state */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error state */}
      {!loading && error && (
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Metric cards — only rendered once data is available */}
      {!loading && !error && stats && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <MetricCard
            icon={<InventoryIcon sx={{ color: '#3b82f6', fontSize: 24 }} />}
            iconBg="#eff6ff"
            label="Total Stock"
            value={stats.totalStock}
          />
          <MetricCard
            icon={<ShoppingCartIcon sx={{ color: '#16a34a', fontSize: 24 }} />}
            iconBg="#f0fdf4"
            label="Open Orders"
            value={stats.openOrders}
          />
          <MetricCard
            icon={<HourglassEmptyIcon sx={{ color: '#ca8a04', fontSize: 24 }} />}
            iconBg="#fefce8"
            label="Pending Orders"
            value={stats.pendingOrders}
          />
          {/* Warning metric — low stock threshold is qty ≤ 5 */}
          <MetricCard
            icon={<WarningAmberIcon sx={{ color: '#ea580c', fontSize: 24 }} />}
            iconBg="#fff7ed"
            label="Low Stock Alerts"
            value={stats.lowStockAlerts}
            noteColor="#ea580c"
          />
          {/* Critical metric — negative stock means items were recorded as taken without being restocked */}
          <MetricCard
            icon={<ErrorOutlineIcon sx={{ color: '#dc2626', fontSize: 24 }} />}
            iconBg="#fef2f2"
            label="Required To Check"
            value={stats.requiredToCheck}
            noteColor="#dc2626"
          />
          {/* Tasks still open across the whole system (OPEN + IN_PROGRESS) */}
          <MetricCard
            icon={<AssignmentIcon sx={{ color: '#6366f1', fontSize: 24 }} />}
            iconBg="#eef2ff"
            label="Open Tasks"
            value={stats.openTasks}
          />
          {/* Tasks that have been fully completed */}
          <MetricCard
            icon={<CheckCircleIcon sx={{ color: '#16a34a', fontSize: 24 }} />}
            iconBg="#dcfce7"
            label="Completed Tasks"
            value={stats.completedTasks}
          />
        </Box>
      )}
    </Box>
  );
}
