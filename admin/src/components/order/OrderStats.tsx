// The four summary cards above the table (Total / Pending / Approved /
// Completed). OrderManage.tsx passes the full order list and this component
// counts the numbers for each card itself.
import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import { Order } from './types';

// A single summary card: coloured icon on the left, number + label on the right.
function StatCard({ icon, iconBg, label, value }: {
  icon: React.ReactNode; iconBg: string; label: string; value: number;
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

export default function OrderStats({ orders }: { orders: Order[] }) {
  const totalOrders    = orders.length;
  const pendingCount   = orders.filter((o) => o.status === 'PENDING').length;
  const approvedCount  = orders.filter((o) => o.status === 'APPROVED').length;
  const completedCount = orders.filter((o) => o.status === 'COMPLETED').length;

  return (
    <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
      <StatCard icon={<ShoppingCartIcon sx={{ color: '#3b82f6', fontSize: 22 }} />} iconBg="#eff6ff" label="Total Orders" value={totalOrders} />
      <StatCard icon={<HourglassEmptyIcon sx={{ color: '#ca8a04', fontSize: 22 }} />} iconBg="#fefce8" label="Pending" value={pendingCount} />
      <StatCard icon={<CheckCircleIcon sx={{ color: '#16a34a', fontSize: 22 }} />} iconBg="#dcfce7" label="Approved" value={approvedCount} />
      <StatCard icon={<AssignmentTurnedInIcon sx={{ color: '#6366f1', fontSize: 22 }} />} iconBg="#eef2ff" label="Completed" value={completedCount} />
    </Box>
  );
}
