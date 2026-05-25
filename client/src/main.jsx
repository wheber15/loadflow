import React from 'react';

import ReactDOM from 'react-dom/client';

import {
  BrowserRouter,
} from 'react-router-dom';

import {
  Toaster,
} from 'react-hot-toast';

import App from './App';

import './index.css';

import {
  AuthProvider,
} from './context/AuthContext';

ReactDOM.createRoot(
  document.getElementById(
    'root'
  )
).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* AUTH */}

      <AuthProvider>
        {/* GLOBAL TOASTER */}

        <Toaster
          position="top-center"
          reverseOrder={
            false
          }
          gutter={12}
          containerStyle={{
            top: 20,
            left: 20,
            right: 20,
          }}
          toastOptions={{
            duration: 3500,

            style: {
              background:
                '#18181b',

              color:
                '#ffffff',

              border:
                '1px solid #27272a',

              borderRadius:
                '22px',

              padding:
                '18px 20px',

              fontWeight:
                '700',

              fontSize:
                '15px',

              maxWidth:
                '95vw',

              boxShadow:
                '0 10px 40px rgba(0,0,0,0.45)',
            },

            success: {
              iconTheme: {
                primary:
                  '#22c55e',

                secondary:
                  '#000000',
              },
            },

            error: {
              iconTheme: {
                primary:
                  '#ef4444',

                secondary:
                  '#000000',
              },
            },

            loading: {
              iconTheme: {
                primary:
                  '#f97316',

                secondary:
                  '#000000',
              },
            },
          }}
        />

        {/* APP */}

        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);