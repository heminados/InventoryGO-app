import React from 'react';
import {
  Box, Card, CardContent, Typography, TextField, Button, Alert,
  InputAdornment, CircularProgress,
} from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory2';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

// Base URL for all API calls — matches the Express server port (same as the other pages)
const API = 'http://localhost:5001';

type AdminLoginProps = {
  onLogin: (token: string) => void;
};

export default function AdminLogin({ onLogin }: AdminLoginProps) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false); // true while the login request is in-flight

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        onLogin(data.token);
      } else {
        setError(data.message || 'Login failed.');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // Full-screen centered layout on the same app background as the management pages
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#f5f7fb',
        p: 2,
      }}
    >
      {/* Card grows to the screen width on mobile, capped at 400px on larger screens */}
      <Card variant="outlined" sx={{ width: '100%', maxWidth: 400, borderRadius: 3 }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>

          {/* ── Brand: same logo + name as the sidebar ── */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 3 }}>
            <Box sx={{ bgcolor: 'primary.main', borderRadius: 1.5, p: 0.75, display: 'flex' }}>
              <InventoryIcon sx={{ color: '#fff', fontSize: 20 }} />
            </Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }} color="text.primary">
              InventoryGO WS
            </Typography>
          </Box>

          {/* ── Heading ── */}
          <Typography variant="h5" sx={{ fontWeight: 700, textAlign: 'center' }}>
            Admin Login
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 0.5, mb: 3 }}>
            Sign in to access the InventoryGo admin panel
          </Typography>

          {/* ── Login form ── native form submit keeps Enter-to-submit working ── */}
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              label="Email"
              type="email"
              size="small"
              fullWidth
              required
              autoFocus
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailOutlinedIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <TextField
              label="Password"
              type="password"
              size="small"
              fullWidth
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                },
              }}
            />

            {/* Error feedback — Alert exposes role="alert" for screen readers */}
            {error && (
              <Alert severity="error" sx={{ borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
              sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2, py: 1 }}
            >
              {loading ? 'Signing in...' : 'Login'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
