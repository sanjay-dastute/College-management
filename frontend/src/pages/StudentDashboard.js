import React, { useEffect } from 'react';
import {
  Box, VStack, Heading, Text, Image, Grid, GridItem,
  Card, CardBody, Stack, useToast, Button
} from '@chakra-ui/react';
import { getStudentDetails } from '../services/api';
import useApiRequest from '../hooks/useApiRequest';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { showErrorToast } from '../utils/toastHelper';
import { formatDisplayDate } from '../utils/dateUtils';
import ProfilePictureUpload from '../components/ProfilePictureUpload';

function StudentDashboard() {
  const { user } = useAuth();
  const toast = useToast();
  const [student, setStudent] = React.useState(null);

  const {
    loading,
    error,
    execute: fetchStudentDetails
  } = useApiRequest(getStudentDetails, { showError: false });

  useEffect(() => {
    const loadStudentDetails = async () => {
      try {
        const data = await fetchStudentDetails(user.id);
        setStudent(data);
      } catch (error) {
        showErrorToast(toast, {
          message: 'Failed to load student details. Please try again later.'
        });
      }
    };

    if (user?.id) {
      loadStudentDetails();
    }
  }, [user, fetchStudentDetails, toast]);

  if (loading) {
    return <LoadingSpinner message="Loading student details..." />;
  }

  if (error) {
    return (
      <Box textAlign="center" py={10}>
        <Text color="red.500">Error loading student details. Please try again later.</Text>
      </Box>
    );
  }

  if (!student) return null;

  return (
    <Box p={8}>
      <VStack spacing={6} align="stretch">
        <Heading>Student Profile</Heading>
        <Grid templateColumns="repeat(2, 1fr)" gap={6}>
          <GridItem>
            <Card>
              <CardBody>
                <Stack spacing={4}>
                  <Image
                    src={student.profile_pic}
                    alt="Profile"
                    borderRadius="lg"
                    fallbackSrc="https://via.placeholder.com/150"
                  />
                  <ProfilePictureUpload
                    studentId={user.id}
                    onUploadSuccess={(url) => setStudent({ ...student, profile_pic: url })}
                  />
                  <Text><strong>Name:</strong> {`${student.user.first_name} ${student.user.last_name}`}</Text>
                  <Text><strong>Date of Birth:</strong> {formatDisplayDate(student.date_of_birth)}</Text>
                  <Text><strong>Gender:</strong> {student.gender}</Text>
                  <Text><strong>Blood Group:</strong> {student.blood_group}</Text>
                  <Text><strong>Contact:</strong> {student.contact_number}</Text>
                  <Text><strong>Address:</strong> {student.address}</Text>
                </Stack>
              </CardBody>
            </Card>
          </GridItem>
          <GridItem>
            <Card>
              <CardBody>
                <Heading size="md" mb={4}>Enrolled Subjects</Heading>
                <Stack spacing={4}>
                  {student.faculties.map((faculty) => (
                    <Box key={faculty.id} p={4} borderWidth={1} borderRadius="md">
                      <Text><strong>Subject:</strong> {faculty.subject}</Text>
                      <Text><strong>Faculty:</strong> {`${faculty.user.first_name} ${faculty.user.last_name}`}</Text>
                    </Box>
                  ))}
                </Stack>
              </CardBody>
            </Card>
          </GridItem>
        </Grid>
      </VStack>
    </Box>
  );
}

export default StudentDashboard;
