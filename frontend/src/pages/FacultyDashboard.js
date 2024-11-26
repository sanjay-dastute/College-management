import React, { useEffect } from 'react';
import {
  Box, Button, Table, Thead, Tbody, Tr, Th, Td,
  Heading, VStack, Text, useToast, HStack, Badge
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { getFacultyDashboard } from '../services/api';
import useApiRequest from '../hooks/useApiRequest';
import LoadingSpinner from '../components/LoadingSpinner';
import { ROUTES } from '../constants';
import { showErrorToast } from '../utils/toastHelper';
import { RepeatIcon } from '@chakra-ui/icons';

function FacultyDashboard() {
  const navigate = useNavigate();
  const toast = useToast();
  const [dashboardData, setDashboardData] = React.useState({
    faculty_info: {},
    assigned_students: []
  });

  const {
    loading,
    error,
    execute: fetchDashboard
  } = useApiRequest(getFacultyDashboard, { showError: false });

  const loadDashboard = async () => {
    try {
      const data = await fetchDashboard();
      setDashboardData(data);
    } catch (error) {
      showErrorToast(toast, {
        message: 'Failed to load dashboard. Please try again later.'
      });
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  if (error) {
    return (
      <Box textAlign="center" py={10}>
        <Text color="red.500">Error loading dashboard. Please try again later.</Text>
      </Box>
    );
  }

  const { faculty_info, assigned_students } = dashboardData;

  return (
    <Box p={8}>
      <VStack spacing={6} align="stretch">
        <Box borderWidth="1px" borderRadius="lg" p={4}>
          <VStack align="stretch" spacing={2}>
            <Heading size="md">Faculty Information</Heading>
            <Text><strong>Name:</strong> {faculty_info.name}</Text>
            <Text><strong>Subject:</strong> {faculty_info.subject}</Text>
            <Text><strong>Email:</strong> {faculty_info.email}</Text>
            <Text><strong>Contact:</strong> {faculty_info.contact}</Text>
          </VStack>
        </Box>

        <HStack justify="space-between">
          <Heading size="md">Assigned Students</Heading>
          <HStack>
            <Button
              leftIcon={<RepeatIcon />}
              colorScheme="gray"
              onClick={loadDashboard}
              size="sm"
            >
              Refresh
            </Button>
            <Button
              colorScheme="blue"
              onClick={() => navigate(ROUTES.STUDENT_NEW)}
              size="sm"
            >
              Add New Student
            </Button>
          </HStack>
        </HStack>

        {assigned_students.length === 0 ? (
          <Text textAlign="center">No students assigned yet.</Text>
        ) : (
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th>Email</Th>
                <Th>Contact</Th>
                <Th>Blood Group</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {assigned_students.map((student, index) => (
                <Tr key={index}>
                  <Td>{student.name}</Td>
                  <Td>{student.email}</Td>
                  <Td>{student.contact}</Td>
                  <Td>
                    <Badge colorScheme="red">{student.blood_group}</Badge>
                  </Td>
                  <Td>
                    <Button
                      size="sm"
                      colorScheme="teal"
                      onClick={() => navigate(`/student/${student.id}/edit`)}
                    >
                      Edit
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </VStack>
    </Box>
  );
}

export default FacultyDashboard;
