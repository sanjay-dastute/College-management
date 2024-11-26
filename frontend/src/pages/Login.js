import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Button, FormControl, FormLabel, Input,
  VStack, Heading, useToast, FormErrorMessage,
} from '@chakra-ui/react';
import { login } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ERROR_MESSAGES, SUCCESS_MESSAGES, ROUTES } from '../constants';
import { showSuccessToast, showErrorToast } from '../utils/toastHelper';
import useForm from '../hooks/useForm';
import { validationRules } from '../utils/validationRules';

function Login() {
  const navigate = useNavigate();
  const toast = useToast();
  const { login: authLogin } = useAuth();

  const validationConfig = {
    username: ['required', validationRules.minLength(3)],
    password: ['required']  // Remove custom password validation
  };

  const {
    formData,
    errors,
    isSubmitting,
    handleChange,
    validate,
    setIsSubmitting
  } = useForm({
    username: '',
    password: ''
  }, validationConfig);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.group('🔐 Login Attempt');
    console.log('Initial form data:', formData);

    if (!validate()) {
      console.log('Validation failed:', errors);
      console.groupEnd();
      return;
    }

    try {
      setIsSubmitting(true);
      console.log('Sending login request...');
      const response = await login(formData.username, formData.password);
      console.log('Login response received:', { ...response, token: '[REDACTED]' });

      if (!response || !localStorage.getItem('accessToken')) {
        throw new Error('Invalid login response - no token received');
      }

      authLogin(response);
      showSuccessToast(toast, SUCCESS_MESSAGES.LOGIN_SUCCESS);
      const redirectPath = response.is_faculty ? ROUTES.FACULTY_DASHBOARD : ROUTES.STUDENT_DASHBOARD;
      console.log(`Redirecting to ${redirectPath}`);
      navigate(redirectPath);
    } catch (error) {
      console.error('Login error:', error.message);
      showErrorToast(toast, {
        message: error.response?.data?.detail || ERROR_MESSAGES.INVALID_CREDENTIALS
      });
    } finally {
      setIsSubmitting(false);
      console.groupEnd();
    }
  };

  return (
    <Box p={8} maxWidth="500px" mx="auto">
      <VStack spacing={4}>
        <Heading>College Management System</Heading>
        <VStack spacing={4} as="form" onSubmit={handleSubmit} width="100%">
          <FormControl isRequired isInvalid={errors.username}>
            <FormLabel>Username</FormLabel>
            <Input
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
              autoComplete="username"
            />
            <FormErrorMessage>{errors.username}</FormErrorMessage>
          </FormControl>
          <FormControl isRequired isInvalid={errors.password}>
            <FormLabel>Password</FormLabel>
            <Input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              autoComplete="current-password"
            />
            <FormErrorMessage>{errors.password}</FormErrorMessage>
          </FormControl>
          <Button
            type="submit"
            colorScheme="blue"
            width="100%"
            isLoading={isSubmitting}
            loadingText="Logging in..."
          >
            Login
          </Button>
        </VStack>
      </VStack>
    </Box>
  );
}

export default Login;
