// Validation utility functions
export const validateEmail = (email) => {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(email);
};

export const validateContactNumber = (number) => {
  const re = /^\d{10}$/;
  return re.test(number);
};

export const validatePassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
  const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return re.test(password);
};

export const validateAge = (dateOfBirth) => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age >= 16 && age <= 100;
};

export const validateStudentForm = (formData) => {
  console.group('Form Validation');
  console.log('Validating form data:', formData);
  const errors = {};

  // Username validation
  if (!formData.user.username) {
    console.log('Missing username');
    errors['user.username'] = 'Username is required';
  } else if (formData.user.username.length < 4) {
    console.log('Username too short');
    errors['user.username'] = 'Username must be at least 4 characters';
  }

  // Password validation
  if (!formData.id) {  // Only validate password for new students
    if (!formData.user.password) {
      console.log('Missing password');
      errors['user.password'] = 'Password is required';
    } else if (!validatePassword(formData.user.password)) {
      console.log('Invalid password format');
      errors['user.password'] = 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character';
    }
  }

  // Email validation
  if (!formData.user.email || !validateEmail(formData.user.email)) {
    console.log('Invalid email:', formData.user.email);
    errors['user.email'] = 'Please enter a valid email address';
  }

  // Name validation
  if (!formData.user.first_name || formData.user.first_name.trim().length < 2) {
    console.log('Invalid first name');
    errors['user.first_name'] = 'First name must be at least 2 characters';
  }

  if (!formData.user.last_name || formData.user.last_name.trim().length < 2) {
    console.log('Invalid last name');
    errors['user.last_name'] = 'Last name must be at least 2 characters';
  }

  // Contact number validation
  if (!formData.contact_number || !validateContactNumber(formData.contact_number)) {
    console.log('Invalid contact number:', formData.contact_number);
    errors.contact_number = 'Please enter a valid 10-digit contact number';
  }

  // Date of birth validation
  if (!formData.date_of_birth) {
    console.log('Missing date of birth');
    errors.date_of_birth = 'Date of birth is required';
  } else if (!validateAge(formData.date_of_birth)) {
    console.log('Invalid age range');
    errors.date_of_birth = 'Student must be between 16 and 100 years old';
  }

  // Gender validation
  if (!formData.gender) {
    console.log('Missing gender');
    errors.gender = 'Gender is required';
  }

  // Blood group validation
  if (!formData.blood_group) {
    console.log('Missing blood group');
    errors.blood_group = 'Blood group is required';
  }

  // Address validation
  if (!formData.address) {
    console.log('Missing address');
    errors.address = 'Address is required';
  }

  console.log('Validation complete. Errors:', errors);
  console.groupEnd();

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
