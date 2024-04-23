import React, { useState } from 'react';
import './Login.css'
const Login = ({login}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    login(username, password);
  };

  return (
    <div className="login-container">
      <h1 className="login-title">Login</h1>
      <form onSubmit={handleSubmit} className="login-form">
        <label className="login-label">Username:</label>
        <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} required className="login-input" /><br />
        <label className="login-label">Password:</label>
        <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="login-input" /><br />
        <button type="submit" className="login-button">Login</button>
      </form>
    </div>);
}

export default Login;