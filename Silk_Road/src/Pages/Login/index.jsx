import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import authService from '../../services/authService.js';
import CustomAlert from '../../components/Alert';
import { useAuth } from '../../AuthContext';
import Cookies from 'js-cookie';


const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiInputBase-root': {
    fontFamily: 'Montserrat, sans-serif',
    color: '#40513B',
  },
  '& .MuiInputLabel-root': {
    fontFamily: 'Montserrat, sans-serif',
    color: '#40513B',
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: '#9DC08B',
  },
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: '#9DC08B',
    },
    '&:hover fieldset': {
      borderColor: '#40513B',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#9DC08B',
    },
  },
}));


const StyledButton = styled(Button)(({ theme }) => ({
  fontFamily: 'Montserrat, sans-serif',
  backgroundColor: '#9DC08B',
  color: '#fff',
  textTransform: 'none',
  fontSize: '1rem',
  fontWeight: 500,
  padding: '10px 20px',
  '&:hover': {
    backgroundColor: '#40513B',
  },
}));

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';
  const { login } = useAuth();



  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: '' });
    // Hide alert when user starts typing
    if (showAlert) {
      setShowAlert(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username.trim()) {
      newErrors.username = 'Username or email is required';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});
    setShowAlert(false);

    try {
      const result = await authService.login({
        username: formData.username,
        password: formData.password,
      });
      
      console.log('Login result:', result);
      console.log('Token in cookies after login:', Cookies.get('token'));
      console.log('User in cookies after login:', Cookies.get('user'));
      
      if (result.success) {
        login(result.user, result.token); // Pass both user and token
        setAlertMessage('Login successful! Redirecting...');
        setShowAlert(true);
        setTimeout(() => {
          if (result.user.role === 'admin') {
            navigate('/admin', { replace: true });
          } else {
            navigate(from, { replace: true });
          }
        }, 1500);
      } else {
        setAlertMessage(result.error || 'Invalid username or password');
        setShowAlert(true);
      }
    } catch (error) {
      setAlertMessage(error.message || 'Invalid username or password');
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseAlert = () => {
    setShowAlert(false);
  };

  return (
    <section className="bg-[#EDF6E5] py-12 font-montserrat">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-3xl font-extrabold text-[#40513B] text-center mb-6">
            Login
          </h2>
          
          <CustomAlert
            severity={alertMessage.includes('successful') ? 'success' : 'error'}
            title={alertMessage.includes('successful') ? 'Success' : 'Login Failed'}
            message={alertMessage}
            show={showAlert}
            onClose={handleCloseAlert}
            autoHideDuration={alertMessage.includes('successful') ? 1500 : null}
          />
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <StyledTextField
                fullWidth
                label="Username or Email"
                name="username"
                value={formData.username}
                onChange={handleChange}
                error={!!errors.username}
                helperText={errors.username}
                disabled={isLoading}
              />
            </div>
            <div>
              <StyledTextField
                fullWidth
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                error={!!errors.password}
                helperText={errors.password}
                disabled={isLoading}
              />
            </div>
            <StyledButton 
              type="submit" 
              fullWidth 
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </StyledButton>
          </form>
          <p className="text-center text-[#40513B] mt-4">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#9DC08B] hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
};

export default Login;