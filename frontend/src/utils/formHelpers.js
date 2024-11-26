import { BLOOD_GROUPS, GENDER_OPTIONS } from '../constants';

export const createInitialFormData = () => ({
  user: {
    username: '',
    password: '',
    first_name: '',
    last_name: '',
    email: '',
  },
  date_of_birth: '',
  gender: '',
  blood_group: '',
  contact_number: '',
  address: '',
  profile_pic: null,
});

export const transformFormData = (data) => {
  const formData = new FormData();

  // Handle nested user data as JSON string
  const userData = {
    username: data.user.username,
    password: data.user.password,
    first_name: data.user.first_name,
    last_name: data.user.last_name,
    email: data.user.email
  };

  console.log('Processing user data:', userData);
  formData.append('user', JSON.stringify(userData));

  // Handle file upload
  if (data.profile_pic instanceof File) {
    console.log('Processing profile picture:', data.profile_pic.name);
    formData.append('profile_pic', data.profile_pic);
  }

  // Handle other fields
  const otherFields = ['date_of_birth', 'gender', 'blood_group', 'contact_number', 'address'];
  console.log('Processing other fields:',
    otherFields.reduce((acc, field) => ({ ...acc, [field]: data[field] }), {})
  );

  otherFields.forEach(field => {
    if (data[field]) {
      const value = field === 'contact_number' ? data[field].replace(/\D/g, '') : data[field];
      formData.append(field, value);
    }
  });

  // Log final form data
  console.log('Final form data:');
  for (let [key, value] of formData.entries()) {
    console.log(`${key}:`, value);
  }

  return formData;
};

export const validateFormField = (name, value) => {
  switch (name) {
    case 'email':
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? '' : 'Invalid email format';
    case 'contact_number':
      const digitsOnly = value.replace(/\D/g, '');
      return /^\d{10}$/.test(digitsOnly) ? '' : 'Contact number must be 10 digits';
    case 'blood_group':
      return BLOOD_GROUPS.includes(value) ? '' : 'Invalid blood group';
    case 'gender':
      return GENDER_OPTIONS.some(option => option.value === value) ? '' : 'Invalid gender';
    case 'date_of_birth':
      return value ? '' : 'Date of birth is required';
    default:
      return value.trim() ? '' : `${name.replace('_', ' ')} is required`;
  }
};

export const validateForm = (formData) => {
  console.log('Starting form validation');
  const errors = {};

  // Validate user fields
  console.log('Validating user fields:', formData.user);
  Object.keys(formData.user).forEach(field => {
    const error = validateFormField(field, formData.user[field]);
    if (error) {
      errors[field] = error;
      console.log(`Validation error for ${field}:`, error);
    }
  });

  // Validate other fields
  const otherFields = ['date_of_birth', 'gender', 'blood_group', 'contact_number', 'address'];
  console.log('Validating other fields:',
    otherFields.reduce((acc, field) => ({ ...acc, [field]: formData[field] }), {})
  );

  otherFields.forEach(field => {
    const error = validateFormField(field, formData[field]);
    if (error) {
      errors[field] = error;
      console.log(`Validation error for ${field}:`, error);
    }
  });

  const result = {
    isValid: Object.keys(errors).length === 0,
    errors
  };

  console.log('Validation complete. Result:', result);
  return result;
};
