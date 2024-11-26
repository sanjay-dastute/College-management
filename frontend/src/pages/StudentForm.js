import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box, Button, FormControl, FormLabel, Input, Select,
  VStack, Heading, useToast, FormErrorMessage, FormHelperText,
} from '@chakra-ui/react';
import { createStudent, updateStudent, getStudentDetails } from '../services/api';
import useApiRequest from '../hooks/useApiRequest';
import LoadingSpinner from '../components/LoadingSpinner';
import FileUpload from '../components/FileUpload';
import { ROUTES, BLOOD_GROUPS, GENDER_OPTIONS, SUCCESS_MESSAGES } from '../constants';
import { createInitialFormData } from '../utils/formHelpers';
import { showSuccessToast, showErrorToast } from '../utils/toastHelper';
import { validateStudentForm, validateEmail, validateContactNumber, validateAge } from '../utils/validation';

function StudentForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const initialFormData = {
    user: {
      username: '',
      password: '',
      first_name: '',
      last_name: '',
      email: ''
    },
    date_of_birth: '',
    gender: '',
    blood_group: '',
    contact_number: '',
    address: '',
    profile_pic: null
  };
  const [formData, setFormData] = useState(initialFormData);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    loading: loadingDetails,
    execute: fetchStudent
  } = useApiRequest(getStudentDetails);

  const {
    loading: savingStudent,
    execute: saveStudent
  } = useApiRequest(id ? updateStudent : createStudent);

  useEffect(() => {
    console.group('Form Data Update');
    console.log('User data:', formData.user);
    console.log('Student data:', {
      date_of_birth: formData.date_of_birth,
      gender: formData.gender,
      blood_group: formData.blood_group,
      contact_number: formData.contact_number,
      address: formData.address
    });
    console.groupEnd();
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Handling change for field "${name}" with value:`, value);

    // Update form data
    if (['username', 'password', 'first_name', 'last_name', 'email'].includes(name)) {
      setFormData(prevData => {
        const newData = {
          ...prevData,
          user: {
            ...prevData.user,
            [name]: value
          }
        };
        return newData;
      });

      // Real-time validation for user fields
      if (name === 'username' && value.length < 4) {
        setFormErrors(prev => ({ ...prev, 'user.username': 'Username must be at least 4 characters' }));
      } else if (name === 'email' && !validateEmail(value)) {
        setFormErrors(prev => ({ ...prev, 'user.email': 'Please enter a valid email address' }));
      } else {
        setFormErrors(prev => ({ ...prev, [`user.${name}`]: '' }));
      }
    } else {
      setFormData(prevData => ({
        ...prevData,
        [name]: value
      }));

      // Real-time validation for other fields
      if (name === 'contact_number' && !validateContactNumber(value)) {
        setFormErrors(prev => ({ ...prev, contact_number: 'Please enter a valid 10-digit number' }));
      } else if (name === 'date_of_birth' && !validateAge(value)) {
        setFormErrors(prev => ({ ...prev, date_of_birth: 'Student must be between 16 and 100 years old' }));
      } else {
        setFormErrors(prev => ({ ...prev, [name]: '' }));
      }
    }
  };

  useEffect(() => {
    if (id) {
      const loadStudentDetails = async () => {
        try {
          const data = await fetchStudent(id);
          setFormData({
            ...data,
            user: {
              ...data.user,
              password: '',
            },
          });
        } catch (error) {
          showErrorToast(toast, error);
        }
      };
      loadStudentDetails();
    }
  }, [id, fetchStudent, setFormData, toast]);

  const handleFileChange = (file) => {
    setFormData(prev => ({
      ...prev,
      profile_pic: file
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.group('🚀 Form Submission');
    console.log('Raw form data:', formData);

    try {
      setIsSubmitting(true);
      console.log('📝 Form state before validation:', formData);

      const { isValid, errors } = validateStudentForm(formData);
      console.log('✅ Validation result:', { isValid, errors });

      if (!isValid) {
        console.error('❌ Validation errors:', errors);
        setFormErrors(errors);
        showErrorToast(toast, 'Please fix the form errors before submitting.');
        return;
      }

      // Create FormData object for multipart/form-data
      const formDataToSend = new FormData();

      // Add user data as a stringified JSON
      const userData = {
        username: formData.user.username,
        password: formData.user.password,
        first_name: formData.user.first_name,
        last_name: formData.user.last_name,
        email: formData.user.email
      };
      formDataToSend.append('user', JSON.stringify(userData));

      // Add student fields directly
      formDataToSend.append('date_of_birth', formData.date_of_birth);
      formDataToSend.append('gender', formData.gender);
      formDataToSend.append('blood_group', formData.blood_group);
      formDataToSend.append('contact_number', formData.contact_number);
      formDataToSend.append('address', formData.address);

      // Add profile picture if exists
      if (formData.profile_pic instanceof File) {
        formDataToSend.append('profile_pic', formData.profile_pic);
      }

      console.log('📤 Sending API request with formData:');
      for (let [key, value] of formDataToSend.entries()) {
        console.log(`FormData entry - ${key}:`, value instanceof File ? value.name : value);
      }

      const response = await saveStudent(formDataToSend);
      console.log('📥 API response:', response);

      showSuccessToast(toast, SUCCESS_MESSAGES.STUDENT_CREATED);
      navigate(ROUTES.DASHBOARD);
    } catch (error) {
      console.error('❌ Form submission error:', error);
      showErrorToast(toast, error.message || 'Failed to save student');
    } finally {
      setIsSubmitting(false);
      console.groupEnd();
    }
  };

  if (loadingDetails) {
    return <LoadingSpinner message="Loading student details..." />;
  }

  return (
    <Box p={8} maxWidth="800px" mx="auto">
      <VStack spacing={6}>
        <Heading>{id ? 'Edit Student' : 'Add New Student'}</Heading>
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <VStack spacing={4}>
            <FileUpload
              label="Profile Picture"
              value={formData.profile_pic}
              onChange={handleFileChange}
              error={formErrors.profile_pic}
            />

            <FormControl isInvalid={formErrors['user.username']}>
              <FormLabel>Username</FormLabel>
              <Input
                name="username"
                value={formData.user.username}
                onChange={handleChange}
              />
              {formErrors['user.username'] ? (
                <FormErrorMessage>{formErrors['user.username']}</FormErrorMessage>
              ) : (
                <FormHelperText>Username must be at least 4 characters</FormHelperText>
              )}
            </FormControl>

            {!id && (
              <FormControl isInvalid={formErrors['user.password']}>
                <FormLabel>Password</FormLabel>
                <Input
                  type="password"
                  name="password"
                  value={formData.user.password}
                  onChange={handleChange}
                />
                <FormErrorMessage>{formErrors['user.password']}</FormErrorMessage>
                <Box fontSize="sm" color="gray.600" mt={1}>
                  Password must contain at least 8 characters, including uppercase, lowercase, number, and special character.
                </Box>
              </FormControl>
            )}

            <FormControl isInvalid={formErrors['user.first_name']}>
              <FormLabel>First Name</FormLabel>
              <Input
                name="first_name"
                value={formData.user.first_name}
                onChange={handleChange}
              />
              {formErrors['user.first_name'] ? (
                <FormErrorMessage>{formErrors['user.first_name']}</FormErrorMessage>
              ) : (
                <FormHelperText>First name must be at least 2 characters</FormHelperText>
              )}
            </FormControl>

            <FormControl isInvalid={formErrors['user.last_name']}>
              <FormLabel>Last Name</FormLabel>
              <Input
                name="last_name"
                value={formData.user.last_name}
                onChange={handleChange}
              />
              {formErrors['user.last_name'] ? (
                <FormErrorMessage>{formErrors['user.last_name']}</FormErrorMessage>
              ) : (
                <FormHelperText>Last name must be at least 2 characters</FormHelperText>
              )}
            </FormControl>

            <FormControl isInvalid={formErrors['user.email']}>
              <FormLabel>Email</FormLabel>
              <Input
                type="email"
                name="email"
                value={formData.user.email}
                onChange={handleChange}
              />
              {formErrors['user.email'] ? (
                <FormErrorMessage>{formErrors['user.email']}</FormErrorMessage>
              ) : (
                <FormHelperText>Enter a valid email address</FormHelperText>
              )}
            </FormControl>

            <FormControl isInvalid={formErrors.date_of_birth}>
              <FormLabel>Date of Birth</FormLabel>
              <Input
                type="date"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleChange}
              />
              {formErrors.date_of_birth ? (
                <FormErrorMessage>{formErrors.date_of_birth}</FormErrorMessage>
              ) : (
                <FormHelperText>Student must be between 16 and 100 years old</FormHelperText>
              )}
            </FormControl>

            <FormControl isInvalid={formErrors.gender}>
              <FormLabel>Gender</FormLabel>
              <Select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="">Select Gender</option>
                {GENDER_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              <FormErrorMessage>{formErrors.gender}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={formErrors.blood_group}>
              <FormLabel>Blood Group</FormLabel>
              <Select
                name="blood_group"
                value={formData.blood_group}
                onChange={handleChange}
              >
                <option value="">Select Blood Group</option>
                {BLOOD_GROUPS.map(group => (
                  <option key={group} value={group}>
                    {group}
                  </option>
                ))}
              </Select>
              <FormErrorMessage>{formErrors.blood_group}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={formErrors.contact_number}>
              <FormLabel>Contact Number</FormLabel>
              <Input
                name="contact_number"
                value={formData.contact_number}
                onChange={handleChange}
              />
              {formErrors.contact_number ? (
                <FormErrorMessage>{formErrors.contact_number}</FormErrorMessage>
              ) : (
                <FormHelperText>Enter a valid 10-digit contact number</FormHelperText>
              )}
            </FormControl>

            <FormControl isInvalid={formErrors.address}>
              <FormLabel>Address</FormLabel>
              <Input
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
              {formErrors.address ? (
                <FormErrorMessage>{formErrors.address}</FormErrorMessage>
              ) : (
                <FormHelperText>Enter your complete address</FormHelperText>
              )}
            </FormControl>

            <Button
              type="submit"
              colorScheme="blue"
              width="100%"
              isLoading={isSubmitting || savingStudent}
              loadingText="Saving..."
            >
              {id ? 'Update Student' : 'Create Student'}
            </Button>
            <Button
              type="button"
              colorScheme="gray"
              width="100%"
              onClick={() => {
                console.group('Current Form State');
                console.log('Form Data:', formData);
                console.log('Form Errors:', formErrors);
                console.groupEnd();
              }}
            >
              Debug Form State
            </Button>
          </VStack>
        </form>
      </VStack>
    </Box>
  );
}

export default StudentForm;
