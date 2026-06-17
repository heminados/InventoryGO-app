// The four summary cards above the table (Total Items, In Stock, Out of Stock,
// Requires Inspection). Inventory.tsx passes the full item list and this
// component counts the numbers for each card itself.
import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory2';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { Item } from './types';

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

export default function InventoryStats({ items }: { items: Item[] }) {
  // Counts shown on each card, calculated from the loaded item list
  const totalItems = items.length;
  const inStock = items.filter((it) => it.qty > 0).length;
  const outOfStock = items.filter((it) => it.qty === 0).length;
  const needsInspection = items.filter((it) => it.is_ordered).length;

  return (
    <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
      <StatCard
        icon={<InventoryIcon sx={{ color: '#3b82f6', fontSize: 22 }} />}
        iconBg="#eff6ff"
        label="Total Items"
        value={totalItems}
      />
      <StatCard
        icon={<CheckCircleIcon sx={{ color: '#16a34a', fontSize: 22 }} />}
        iconBg="#f0fdf4"
        label="In Stock"
        value={inStock}
      />
      <StatCard
        icon={<CancelIcon sx={{ color: '#dc2626', fontSize: 22 }} />}
        iconBg="#fef2f2"
        label="Out of Stock"
        value={outOfStock}
      />
      <StatCard
        icon={<WarningAmberIcon sx={{ color: '#ca8a04', fontSize: 22 }} />}
        iconBg="#fefce8"
        label="Requires Inspection"
        value={needsInspection}
      />
    </Box>
  );
}
