export const API_BASE_URL = 'http://localhost:8002';

export const BLOOD_GROUPS = [
  'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'
];

export const GENDER_OPTIONS = [
  { value: 'M', label: 'Male' },
  { value: 'F', label: 'Female' },
  { value: 'O', label: 'Other' }
];

export const FILE_CONSTANTS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
  MAX_IMAGE_WIDTH: 800,
  IMAGE_QUALITY: 0.8
};

export const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Invalid username or password',
  SERVER_ERROR: 'Something went wrong. Please try again later',
  NETWORK_ERROR: 'Unable to connect to server',
  UNAUTHORIZED: 'You are not authorized to perform this action',
  FORM_VALIDATION: 'Please fill in all required fields correctly',
  FILE_TOO_LARGE: 'File size exceeds 5MB limit',
  INVALID_FILE_TYPE: 'Invalid file type. Please upload a JPEG, PNG, or GIF image',
  FILE_UPLOAD_ERROR: 'Error uploading file. Please try again',
  IMAGE_PROCESSING_ERROR: 'Error processing image. Please try again'
};

export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful',
  STUDENT_CREATED: 'Student created successfully',
  STUDENT_UPDATED: 'Student updated successfully',
  PROFILE_UPDATED: 'Profile updated successfully',
  FILE_UPLOADED: 'File uploaded successfully',
  PROFILE_PICTURE_UPDATED: 'Profile picture updated successfully'
};

export const ROUTES = {
  LOGIN: '/login',
  FACULTY_DASHBOARD: '/faculty-dashboard',
  STUDENT_DASHBOARD: '/student-dashboard',
  STUDENT_NEW: '/student/new',
  STUDENT_EDIT: '/student/:id/edit'
};
