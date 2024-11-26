import { isValidDate } from './dateUtils';

const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
const PHONE_REGEX = /^\+?[\d\s-]{10,}$/;

export const validationRules = {
  required: (value) => {
    if (value === undefined || value === null || value === '') {
      return 'This field is required';
    }
    return '';
  },

  email: (value) => {
    if (!value) return '';
    return EMAIL_REGEX.test(value) ? '' : 'Invalid email address';
  },

  phone: (value) => {
    if (!value) return '';
    return PHONE_REGEX.test(value) ? '' : 'Invalid phone number';
  },

  password: (value) => {
    if (!value) return '';
    if (value.length < 8) {
      return 'Password must be at least 8 characters';
    }
    if (!/[A-Z]/.test(value)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[a-z]/.test(value)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/[0-9]/.test(value)) {
      return 'Password must contain at least one number';
    }
    return '';
  },

  date: (value) => {
    if (!value) return '';
    return isValidDate(value) ? '' : 'Invalid date format';
  },

  minLength: (length) => (value) => {
    if (!value) return '';
    return value.length >= length ? '' : `Must be at least ${length} characters`;
  },

  maxLength: (length) => (value) => {
    if (!value) return '';
    return value.length <= length ? '' : `Must not exceed ${length} characters`;
  },

  match: (matchValue, fieldName) => (value) => {
    if (!value || !matchValue) return '';
    return value === matchValue ? '' : `Must match ${fieldName}`;
  }
};

export const validateField = (value, rules = []) => {
  for (const rule of rules) {
    const validationFunction = typeof rule === 'function' ? rule : validationRules[rule];
    if (!validationFunction) continue;

    const error = validationFunction(value);
    if (error) return error;
  }
  return '';
};
