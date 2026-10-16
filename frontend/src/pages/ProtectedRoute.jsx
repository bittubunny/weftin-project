import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  // Check if the user has a valid stored login token or user object
  const token = localStorage.getItem('weftin_token');
  const user = localStorage.getItem('weftin_user');

  if (!token || !user) {
    // If not logged in, redirect them to the login page
    return <Navigate to="/login" replace />;
  }

  // If logged in, render the requested private page
  return children;
}
