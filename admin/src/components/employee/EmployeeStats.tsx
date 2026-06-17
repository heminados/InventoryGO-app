// The four summary cards above the table (Total / Active / Inactive Users,
// Pending Invitations). EmployeeManage.tsx passes the full user list and this
// component counts the numbers for each card itself.
import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import { User } from './types';

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

export default function EmployeeStats({ users }: { users: User[] }) {
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.is_active).length;
  const inactiveUsers = users.filter((u) => !u.is_active).length;

  return (
    <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
      <StatCard
        icon={<PeopleIcon sx={{ color: '#3b82f6', fontSize: 22 }} />}
        iconBg="#eff6ff"
        label="Total Users"
        value={totalUsers}
      />
      <StatCard
        icon={<CheckCircleIcon sx={{ color: '#16a34a', fontSize: 22 }} />}
        iconBg="#f0fdf4"
        label="Active Users"
        value={activeUsers}
      />
      <StatCard
        icon={<CancelIcon sx={{ color: '#dc2626', fontSize: 22 }} />}
        iconBg="#fef2f2"
        label="Inactive Users"
        value={inactiveUsers}
      />
      {/* Pending Invitations — no invitation system yet, so hardcoded to 0 */}
      <StatCard
        icon={<HourglassEmptyIcon sx={{ color: '#ca8a04', fontSize: 22 }} />}
        iconBg="#fefce8"
        label="Pending Invitations"
        value={0}
      />
    </Box>
  );
}
