import React from 'react';
import { BrowserRouter, Routes, Route, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Typography, Divider, Avatar, IconButton, Tooltip,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory2';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PeopleIcon from '@mui/icons-material/People';
import LogoutIcon from '@mui/icons-material/Logout';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AssessmentIcon from '@mui/icons-material/Assessment';

import AdminLogin from './components/AdminLogin';
import HomePage from './components/HomePage';
import EmployeeManage from './components/EmployeeManage';
import TaskManage from './components/TaskManage';
import ManageItems from './components/Inventory';
import OrderManage from './components/OrderManage';
import Reports from './components/Reports';

// Width of the left sidebar in pixels
const SIDEBAR_WIDTH = 220;

// All sidebar navigation links — each entry becomes one clickable row in the sidebar
const NAV_ITEMS = [
  { label: 'Dashboard', icon: <DashboardIcon />, to: '/' },
  { label: 'Inventory', icon: <InventoryIcon />, to: '/items' },
  { label: 'Orders', icon: <ShoppingCartIcon />, to: '/orders' },
  { label: 'Tasks', icon: <AssignmentIcon />, to: '/tasks' },
  { label: 'User Management', icon: <PeopleIcon />, to: '/employees' },
  { label: 'Reports', icon: <AssessmentIcon />, to: '/reports' },
];

// A single sidebar link. Highlights itself blue when its route is active.
function SidebarNavItem({ label, icon, to }: { label: string; icon: React.ReactNode; to: string }) {
  const location = useLocation();
  // For "/" we require an exact match so Dashboard doesn't stay active on every page
  const isActive = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);

  return (
    <ListItem disablePadding>
      <ListItemButton
        component={NavLink as any}
        to={to}
        sx={{
          borderRadius: 2,
          mx: 1,
          mb: 0.5,
          color: isActive ? 'primary.main' : 'text.secondary',
          bgcolor: isActive ? '#eff6ff' : 'transparent',
          '&:hover': { bgcolor: 'action.hover' },
          '& .MuiListItemIcon-root': { color: isActive ? 'primary.main' : 'text.secondary', minWidth: 36 },
        }}
      >
        <ListItemIcon>{icon}</ListItemIcon>
        <ListItemText
          primary={label}
          slotProps={{ primary: { style: { fontSize: 14, fontWeight: isActive ? 600 : 400 } } }}
        />
      </ListItemButton>
    </ListItem>
  );
}

// The main shell rendered after login: permanent sidebar on the left, top bar + page content on the right.
// Receives the JWT token (to pass down to pages that need it) and a logout callback.
function AdminLayout({ token, onLogout }: { token: string; onLogout: () => void }) {
  const navigate = useNavigate();

  // Every time AdminLayout mounts it means the user just logged in (the token only lives in state,
  // so a refresh brings them back to the login screen). Always start on Dashboard regardless of
  // what URL the browser currently has.
  React.useEffect(() => {
    navigate('/', { replace: true });
  }, []); 

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f7fb' }}>

      {/* ─ Left sidebar ─ always visible, does not scroll away */}
      <Drawer
        variant="permanent"
        sx={{
          width: SIDEBAR_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: SIDEBAR_WIDTH,
            boxSizing: 'border-box',
            border: 'none',
            boxShadow: '1px 0 0 #e5e7eb',
            bgcolor: '#fff',
          },
        }}
      >
        {/* App logo and name at the top of the sidebar */}
        <Box sx={{ px: 2, py: 2.5, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ bgcolor: 'primary.main', borderRadius: 1.5, p: 0.75, display: 'flex' }}>
            <InventoryIcon sx={{ color: '#fff', fontSize: 18 }} />
          </Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }} color="text.primary">
            InventoryGO WS
          </Typography>
        </Box>

        <Divider />

        {/* Main navigation links — mapped from NAV_ITEMS above */}
        <Box sx={{ flex: 1, pt: 1 }}>
          <List dense>
            {NAV_ITEMS.map((item) => (
              <SidebarNavItem key={item.to} {...item} />
            ))}
          </List>
        </Box>

        <Divider />

        {/* Settings and Logout buttons pinned to the bottom of the sidebar */}
        <List dense sx={{ pb: 1 }}>
          <ListItem disablePadding>
            {/* Clicking Logout clears the token in App, which brings back the login screen */}
            <ListItemButton
              onClick={onLogout}
              sx={{ borderRadius: 2, mx: 1, color: 'error.main', '& .MuiListItemIcon-root': { color: 'error.main', minWidth: 36 } }}
            >
              <ListItemIcon><LogoutIcon /></ListItemIcon>
              <ListItemText primary="Log Out" slotProps={{ primary: { style: { fontSize: 14 } } }} />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>

      {/* ── Right side: top bar + routed page content ── */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Top bar: notification bell and admin avatar — purely decorative for now */}
        <Box sx={{ bgcolor: '#fff', borderBottom: '1px solid #e5e7eb', px: 3, py: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1.5 }}>
          <Tooltip title="Notifications">
            <IconButton size="small">
              <NotificationsIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 14 }}>A</Avatar>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Admin</Typography>
          </Box>
        </Box>

        {/* Page content area — React Router swaps the component based on the current URL */}
        <Box sx={{ flex: 1, p: 3 }}>
          <Routes>
            <Route path="/" element={<HomePage token={token} />} />
            <Route path="/orders" element={<OrderManage token={token} />} />
            <Route path="/tasks" element={<TaskManage token={token} />} />
            {/* token is passed so EmployeeManage can make authenticated API calls */}
            <Route path="/employees" element={<EmployeeManage token={token} />} />
            <Route path="/items" element={<ManageItems token={token} />} />
            <Route path="/reports" element={<Reports token={token} />} />
          </Routes>
        </Box>
      </Box>
    </Box>
  );
}

// Root component. Holds the JWT token in state.
// If there is no token yet, shows the login screen.
// Once the user logs in, renders the full admin layout.
function App() {
  const [adminToken, setAdminToken] = React.useState('');

  if (!adminToken) {
    // onLogin receives the JWT from AdminLogin and stores it here
    return <AdminLogin onLogin={(token) => setAdminToken(token)} />;
  }

  return (
    <BrowserRouter>
      {/* AdminLayout needs BrowserRouter for NavLink and useLocation to work */}
      <AdminLayout token={adminToken} onLogout={() => setAdminToken('')} />
    </BrowserRouter>
  );
}

export default App;
