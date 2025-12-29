import React, { createContext, useState, useContext } from 'react';
import { Snackbar, Alert, ThemeProvider, createTheme } from '@mui/material';
import { theme } from '../theme';

const SnackbarContext = createContext();

const snackbarTheme = createTheme({
  components: {
    MuiAlert: {
      styleOverrides: {
        filledSuccess: {
          backgroundColor: '#ea580c', 
          color: '#ffffff',
          fontWeight: 'bold',
        },
        root: {
          borderRadius: '12px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        }
      }
    }
  }
});

export const SnackbarProvider = ({ children }) => {
  const [state, setState] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const showSnackbar = (message, severity = 'success') => {
    setState({ open: true, message, severity });
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setState((prev) => ({ ...prev, open: false }));
  };

  return (
    <SnackbarContext.Provider value={showSnackbar}>
      <ThemeProvider theme={snackbarTheme}>
        {children}
        <Snackbar
          open={state.open}
          autoHideDuration={4000}
          onClose={handleClose}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert 
            onClose={handleClose} 
            severity={state.severity} 
            variant="filled" 
            sx={{ 
              width: '100%',
              fontFamily: 'inherit',
              fontSize: '0.875rem'
            }}
          >
            {state.message}
          </Alert>
        </Snackbar>
      </ThemeProvider>
    </SnackbarContext.Provider>
  );
};

export const useSnackbar = () => useContext(SnackbarContext);