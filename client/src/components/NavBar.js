import React from 'react';
import { NavLink, useHistory } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

export default function NavBar() {
  const { isAuthed, logout } = useAuth();
  const { t, toggleLanguage, language } = useLanguage();
  const history = useHistory();

  function handleLogout() {
    logout();
    history.push('/login');
  }

  return (
    <nav className="navbar">
      <NavLink exact to="/" activeClassName="active">{t('home')}</NavLink>
      {!isAuthed && <NavLink to="/login" activeClassName="active">{t('login')}</NavLink>}
      {!isAuthed && <NavLink to="/signup" activeClassName="active">{t('signup')}</NavLink>}
      {isAuthed && <NavLink to="/dashboard" activeClassName="active">{t('dashboard')}</NavLink>}
      {isAuthed && <NavLink to="/readings" activeClassName="active">{t('readings')}</NavLink>}
      {isAuthed && <NavLink to="/food-insights" activeClassName="active">Food Insights</NavLink>}
      {isAuthed && <NavLink to="/smart-alerts" activeClassName="active">Smart Alerts</NavLink>}
      {isAuthed && <NavLink to="/gamification" activeClassName="active">Progress</NavLink>}
      {isAuthed && <NavLink to="/education" activeClassName="active">Education</NavLink>}
      {isAuthed && <NavLink to="/profile" activeClassName="active">{t('profile')}</NavLink>}
      <div className="spacer" />
      <button 
        onClick={toggleLanguage} 
        className="btn btn-outline"
        title={`Switch to ${language === 'en' ? 'Swahili' : 'English'}`}
      >
        {language === 'en' ? '🇰🇪 SW' : '🇺🇸 EN'}
      </button>
      {isAuthed && (
        <button onClick={handleLogout} className="btn btn-outline">{t('logout')}</button>
      )}
    </nav>
  );
}
