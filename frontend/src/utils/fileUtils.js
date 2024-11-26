import { FILE_CONSTANTS, ERROR_MESSAGES } from '../constants';

export const validateFile = (file) => {
  if (!file) return ERROR_MESSAGES.FORM_VALIDATION;

  if (!FILE_CONSTANTS.ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return ERROR_MESSAGES.INVALID_FILE_TYPE;
  }

  if (file.size > FILE_CONSTANTS.MAX_FILE_SIZE) {
    return ERROR_MESSAGES.FILE_TOO_LARGE;
  }

  return '';
};

export const compressImage = async (file, maxWidth = FILE_CONSTANTS.MAX_IMAGE_WIDTH) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Calculate new dimensions
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            const newFileName = generateUniqueFilename(file);
            resolve(new File([blob], newFileName, {
              type: file.type,
              lastModified: Date.now(),
            }));
          },
          file.type,
          FILE_CONSTANTS.IMAGE_QUALITY
        );
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};

export const readFileAsDataURL = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const getFileExtension = (filename) => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
};

export const generateUniqueFilename = (file) => {
  const extension = getFileExtension(file.name);
  const timestamp = new Date().getTime();
  const randomString = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${randomString}.${extension}`;
};
