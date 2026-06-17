// The four summary cards above the table (Total / Normal / Exceptions / Today).
// Reports.tsx passes the full report list and this component counts the numbers
// for each card itself.
import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import TodayIcon from '@mui/icons-material/Today';
import { Report } from './types';

// A single summary card: coloured icon on the left, number + label on the right.
function StatCard({ icon, label, value, iconBg }: {
  icon: React.ReactNode; label: string; value: number; iconBg: string;
}) {
  return (
    <Card variant="outlined" sx={{ flex: 1, borderRadius: 2 }}>
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ bgcolor: iconBg, borderRadius: 2, p: 1.25, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
        </Box>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.2 }}>{value}</Typography>
          <Typography variant="body2" color="text.secondary">{label}</Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function ReportStats({ reports }: { reports: Report[] }) {
  const total = reports.length;
  const normal = reports.filter((r) => r.status === 'NORMAL').length;
  const exceptions = reports.filter((r) => r.status === 'EXCEPTION').length;

  // Reports created today (compared by calendar date)
  const todayStr = new Date().toDateString();
  const today = reports.filter((r) => new Date(r.created_at).toDateString() === todayStr).length;

  return (
    <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
      <StatCard
        icon={<AssessmentIcon sx={{ color: '#3b82f6', fontSize: 22 }} />}
        iconBg="#eff6ff"
        label="Total Reports"
        value={total}
      />
      <StatCard
        icon={<CheckCircleIcon sx={{ color: '#16a34a', fontSize: 22 }} />}
        iconBg="#f0fdf4"
        label="Normal"
        value={normal}
      />
      <StatCard
        icon={<WarningAmberIcon sx={{ color: '#dc2626', fontSize: 22 }} />}
        iconBg="#fef2f2"
        label="Exceptions"
        value={exceptions}
      />
      <StatCard
        icon={<TodayIcon sx={{ color: '#ca8a04', fontSize: 22 }} />}
        iconBg="#fefce8"
        label="Today"
        value={today}
      />
    </Box>
  );
}
