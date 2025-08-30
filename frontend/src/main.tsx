// App entry point. Wraps the app in AuthProvider for global authentication state.
// Renders the main router.
import React from 'react';
import ReactDOM from 'react-dom/client';
import AppRoutes from './router';
import './index.css';
import { AuthProvider } from './context/AuthContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  </React.StrictMode>
);