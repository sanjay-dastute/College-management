import { get, post, put } from '../utils/httpClient';
import jwt_decode from 'jwt-decode';

export const login = async (username, password) => {
  const response = await post('/api/token/', { username, password });
  if (response.access && response.refresh) {
    const decodedToken = jwt_decode(response.access);
    console.log('Decoded token:', decodedToken);  // Debug log
    localStorage.setItem('accessToken', response.access);
    localStorage.setItem('refreshToken', response.refresh);
    const userData = {
      ...response,
      user_id: decodedToken.user_id,
      is_faculty: decodedToken.user_type === 'faculty'
    };
    console.log('User data:', userData);  // Debug log
    return userData;
  }
  throw new Error('Authentication failed');
};

export const getFacultyDashboard = async () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) {
    throw new Error('User not found in local storage');
  }

  const user = JSON.parse(userStr);
  if (!user.faculty_id) {
    throw new Error('Faculty ID not found');
  }

  return await get(`/api/faculty/${user.faculty_id}/dashboard/`);
};

export const getFacultyStudents = async () => {
  return await get('/api/students/');
};

export const getStudentDetails = async (id) => {
  return await get(`/api/students/${id}/`);
};

export const createStudent = async (studentData) => {
  try {
    console.group('🎓 Creating New Student');
    console.log('%c1. Initial Data Check', 'color: blue; font-weight: bold');
    console.log('Raw student data:', studentData);

    const formData = new FormData();

    // Handle nested user data
    console.log('%c2. Processing User Data', 'color: green; font-weight: bold');
    const userData = JSON.parse(studentData.get('user'));
    if (!userData || !userData.username || !userData.password) {
      throw new Error('Missing required user data');
    }
    console.log('Processed user data:', userData);
    formData.append('user', studentData.get('user'));

    // Handle file upload
    if (studentData.get('profile_pic')) {
      console.log('%cProcessing profile picture:', 'color: purple; font-weight: bold');
      formData.append('profile_pic', studentData.get('profile_pic'));
    }

    // Handle other student data
    console.log('%c3. Processing Student Fields', 'color: purple; font-weight: bold');
    const requiredFields = ['date_of_birth', 'gender', 'blood_group', 'contact_number', 'address'];
    requiredFields.forEach(field => {
      const value = studentData.get(field);
      if (!value) {
        throw new Error(`Missing required field: ${field}`);
      }
      formData.append(field, value);
      console.log(`Added ${field}:`, value);
    });

    console.log('%c4. Sending Request', 'color: orange; font-weight: bold');
    console.log('FormData entries:');
    for (let [key, value] of formData.entries()) {
      console.log(`- ${key}: ${value instanceof File ? value.name : value}`);
    }

    const response = await post('/api/students/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log('%c5. Success Response:', 'color: green; font-weight: bold', response);
    console.groupEnd();
    return response;
  } catch (error) {
    console.group('%c❌ Student Creation Error', 'color: red; font-weight: bold');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Request payload:', studentData);
    console.groupEnd();
    throw error;
  }
};

export const updateStudent = async (id, studentData) => {
  try {
    console.group('🔄 Updating Student');
    console.log('Raw student data:', studentData);

    const formData = new FormData();

    // Handle nested user data
    console.log('Processing user data');
    const userData = {
      username: studentData.user.username,
      first_name: studentData.user.first_name,
      last_name: studentData.user.last_name,
      email: studentData.user.email
    };

    if (studentData.user.password) {
      userData.password = studentData.user.password;
    }

    formData.append('user', JSON.stringify(userData));

    // Handle file upload
    if (studentData.profile_pic instanceof File) {
      console.log('Processing profile picture:', studentData.profile_pic.name);
      formData.append('profile_pic', studentData.profile_pic);
    }

    // Handle other student data
    const fields = ['date_of_birth', 'gender', 'blood_group', 'contact_number', 'address'];
    fields.forEach(field => {
      if (studentData[field]) {
        formData.append(field, studentData[field]);
        console.log(`Added ${field}:`, studentData[field]);
      }
    });

    console.log('Sending update request');
    const response = await put(`/api/students/${id}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log('Update response:', response);
    console.groupEnd();
    return response;
  } catch (error) {
    console.error('Update error:', error);
    throw error;
  }
};

export const addStudentToFaculty = async (facultyId, studentId) => {
  return await post(`/api/faculty/${facultyId}/add_student/`, { student_id: studentId });
};

export const addStudentToFaculty = async (facultyId, studentId) => {
  return await post(`/api/faculty/${facultyId}/add_student/`, { student_id: studentId });
};
