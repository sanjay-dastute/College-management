import { ERROR_MESSAGES } from '../constants';

export const createToast = (toast, { title, description, status = 'info' }) => {
  toast({
    title,
    description,
    status,
    duration: 3000,
    isClosable: true,
    position: 'top-right',
  });
};

export const showSuccessToast = (toast, message) => {
  createToast(toast, {
    title: 'Success',
    description: message,
    status: 'success',
  });
};

export const showErrorToast = (toast, error) => {
  createToast(toast, {
    title: 'Error',
    description: error.message || ERROR_MESSAGES.SERVER_ERROR,
    status: 'error',
  });
};

export const showValidationErrorToast = (toast) => {
  createToast(toast, {
    title: 'Validation Error',
    description: ERROR_MESSAGES.FORM_VALIDATION,
    status: 'warning',
  });
};

export const showAuthErrorToast = (toast) => {
  createToast(toast, {
    title: 'Authentication Error',
    description: ERROR_MESSAGES.UNAUTHORIZED,
    status: 'error',
  });
};
