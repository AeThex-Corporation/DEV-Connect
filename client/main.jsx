import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './global.css';
import { AuthProvider } from './contexts/SupabaseAuthContext';
import { Toaster } from './components/ui/toaster';
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root')).render(
  <>
    <HelmetProvider>
      <BrowserRouter>
        <AuthProvider>
            <App />
            <Toaster />
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  </>
);