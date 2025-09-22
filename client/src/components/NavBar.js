import React from 'react';
import { NavLink, useHistory } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function NavBar() {
  const { isAuthed, logout } = useAuth();
  const history = useHistory();

  function handleLogout() {
    logout();
    history.push('/login');
  }

  return (
    <nav className="navbar">
      <NavLink exact to="/" activeClassName="active">Home</NavLink>
      {!isAuthed && <NavLink to="/login" activeClassName="active">Login</NavLink>}
      {!isAuthed && <NavLink to="/signup" activeClassName="active">Signup</NavLink>}
      {isAuthed && <NavLink to="/dashboard" activeClassName="active">Dashboard</NavLink>}
      {isAuthed && <NavLink to="/readings" activeClassName="active">Readings</NavLink>}
      {isAuthed && <NavLink to="/medications" activeClassName="active">Medications</NavLink>}
      {isAuthed && <NavLink to="/profile" activeClassName="active">Profile</NavLink>}
      <div className="spacer" />
      {isAuthed && (
        <button onClick={handleLogout} className="btn btn-outline">Logout</button>
      )}
    </nav>
  );
}
