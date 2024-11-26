import { format, parse, isValid } from 'date-fns';

export const formatDate = (date) => {
  if (!date) return '';
  const parsedDate = typeof date === 'string' ? new Date(date) : date;
  return isValid(parsedDate) ? format(parsedDate, 'yyyy-MM-dd') : '';
};

export const parseAPIDate = (dateString) => {
  if (!dateString) return null;
  const parsedDate = parse(dateString, 'yyyy-MM-dd', new Date());
  return isValid(parsedDate) ? parsedDate : null;
};

export const formatDisplayDate = (date) => {
  if (!date) return '';
  const parsedDate = typeof date === 'string' ? new Date(date) : date;
  return isValid(parsedDate) ? format(parsedDate, 'MMMM dd, yyyy') : '';
};

export const isValidDate = (date) => {
  if (!date) return false;
  const parsedDate = typeof date === 'string' ? new Date(date) : date;
  return isValid(parsedDate);
};

export const getAge = (birthDate) => {
  if (!birthDate) return null;
  const today = new Date();
  const birthDateObj = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
  if (!isValid(birthDateObj)) return null;

  let age = today.getFullYear() - birthDateObj.getFullYear();
  const monthDiff = today.getMonth() - birthDateObj.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
    age--;
  }

  return age;
};
