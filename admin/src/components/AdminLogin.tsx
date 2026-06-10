import React from 'react';
import '../styles/AdminLogin.css';

type AdminLoginProps = {
  onLogin: (token: string) => void;
};

export default function AdminLogin({ onLogin }: AdminLoginProps) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    try {
      const response = await fetch('http://localhost:5001/auth/login', {
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
    }
  };

  return (
    <div className="loginPage">
      <form className="loginCard" onSubmit={handleSubmit}>
        <h1>Admin Login</h1>
        <p>Sign in to access InventoryGo admin panel.</p>

        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Enter email"
          required
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Enter password"
          required
        />

        {error && <span className="loginError">{error}</span>}

        <button type="submit">Login</button>
      </form>
    </div>
  );
}
