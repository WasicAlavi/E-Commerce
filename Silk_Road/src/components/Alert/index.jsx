import React from 'react';
import { styled } from '@mui/material/styles';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';

const StyledAlert = styled(Alert)(({ theme, severity }) => ({
  fontFamily: 'Montserrat, sans-serif',
  borderRadius: '8px',
  marginBottom: '16px',
  '& .MuiAlert-icon': {
    fontSize: '20px',
  },
  '& .MuiAlert-message': {
    fontSize: '14px',
    fontWeight: 500,
  },
  '& .MuiAlertTitle-root': {
    fontSize: '16px',
    fontWeight: 600,
    marginBottom: '4px',
  },
  ...(severity === 'error' && {
    backgroundColor: '#FEF2F2',
    color: '#DC2626',
    border: '1px solid #FECACA',
    '& .MuiAlert-icon': {
      color: '#DC2626',
    },
  }),
  ...(severity === 'success' && {
    backgroundColor: '#F0FDF4',
    color: '#16A34A',
    border: '1px solid #BBF7D0',
    '& .MuiAlert-icon': {
      color: '#16A34A',
    },
  }),
  ...(severity === 'warning' && {
    backgroundColor: '#FFFBEB',
    color: '#D97706',
    border: '1px solid #FED7AA',
    '& .MuiAlert-icon': {
      color: '#D97706',
    },
  }),
  ...(severity === 'info' && {
    backgroundColor: '#EFF6FF',
    color: '#2563EB',
    border: '1px solid #BFDBFE',
    '& .MuiAlert-icon': {
      color: '#2563EB',
    },
  }),
}));

const CloseButton = styled(IconButton)(({ theme }) => ({
  color: 'inherit',
  padding: '4px',
  fontSize: '18px',
  fontWeight: 'bold',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
}));

const CustomAlert = ({ 
  severity = 'error', 
  title, 
  message, 
  onClose, 
  show = true,
  autoHideDuration = null,
  ...props 
}) => {
  return (
    <Collapse in={show}>
      <StyledAlert
        severity={severity}
        action={
          onClose && (
            <CloseButton
              aria-label="close"
              size="small"
              onClick={onClose}
            >
              ×
            </CloseButton>
          )
        }
        {...props}
      >
        {title && <AlertTitle>{title}</AlertTitle>}
        {message}
      </StyledAlert>
    </Collapse>
  );
};

export default CustomAlert; 