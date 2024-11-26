import { useState } from 'react';
import { validateField } from '../utils/validationRules';

export const useForm = (initialState = {}, validationConfig = {}) => {
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e, section = null) => {
    const { name, value } = e.target;
    if (section) {
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [name]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }

    // Validate field on change if validation rules exist
    if (validationConfig[name]) {
      const fieldError = validateField(value, validationConfig[name]);
      setErrors(prev => ({
        ...prev,
        [name]: fieldError,
      }));
    }
  };

  const validate = () => {
    console.group('Form Validation');
    console.log('Current form data:', formData);
    console.log('Validation config:', validationConfig);

    const newErrors = {};
    let isValid = true;

    // Validate all fields according to their validation rules
    Object.keys(validationConfig).forEach(fieldName => {
      let value;
      // Handle nested objects in form data
      if (fieldName.includes('.')) {
        const [section, field] = fieldName.split('.');
        value = formData[section]?.[field];
        console.log(`Validating nested field ${fieldName}:`, { value, rules: validationConfig[fieldName] });
      } else {
        value = formData[fieldName];
        console.log(`Validating field ${fieldName}:`, { value, rules: validationConfig[fieldName] });
      }

      const fieldError = validateField(value, validationConfig[fieldName]);
      if (fieldError) {
        newErrors[fieldName] = fieldError;
        isValid = false;
        console.warn(`Validation failed for ${fieldName}:`, fieldError);
      }
    });

    console.log('Validation result:', { isValid, errors: newErrors });
    console.groupEnd();

    setErrors(newErrors);
    return isValid;
  };

  const resetForm = () => {
    setFormData(initialState);
    setErrors({});
    setIsSubmitting(false);
  };

  return {
    formData,
    errors,
    isSubmitting,
    setFormData,
    setErrors,
    setIsSubmitting,
    handleChange,
    validate,
    resetForm,
  };
};

export default useForm;
