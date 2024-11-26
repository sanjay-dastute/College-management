import React from 'react';
import { Box, Flex, Button, Heading, Spacer, HStack } from '@chakra-ui/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  if (location.pathname === '/login' || !user) {
    return null;
  }

  return (
    <Box bg="blue.500" px={4} py={2}>
      <Flex alignItems="center">
        <Heading size="md" color="white">College Management System</Heading>
        <Spacer />
        <HStack spacing={4}>
          {user.is_faculty && (
            <>
              <Button colorScheme="whiteAlpha" variant="ghost" onClick={() => navigate('/faculty-dashboard')}>
                Dashboard
              </Button>
              <Button colorScheme="whiteAlpha" variant="ghost" onClick={() => navigate('/student-form')}>
                Add Student
              </Button>
            </>
          )}
          {!user.is_faculty && (
            <Button colorScheme="whiteAlpha" variant="ghost" onClick={() => navigate('/student-dashboard')}>
              Dashboard
            </Button>
          )}
          <Button colorScheme="whiteAlpha" onClick={handleLogout}>
            Logout
          </Button>
        </HStack>
      </Flex>
    </Box>
  );
}

export default Navigation;
