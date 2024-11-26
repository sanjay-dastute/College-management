import React, { useRef, useState } from 'react';
import {
  FormControl, FormLabel, FormErrorMessage, Input,
  Button, Image, VStack, Box, useToast,
} from '@chakra-ui/react';
import { validateFile, compressImage, readFileAsDataURL } from '../utils/fileUtils';
import { showErrorToast } from '../utils/toastHelper';
import { FILE_CONSTANTS, ERROR_MESSAGES } from '../constants';

const FileUpload = ({
  label = 'Upload File',
  accept = 'image/*',
  value = null,
  onChange,
  error,
  isRequired = false,
  maxWidth = FILE_CONSTANTS.MAX_IMAGE_WIDTH,
}) => {
  const inputRef = useRef(null);
  const toast = useToast();
  const [preview, setPreview] = useState(value);
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      showErrorToast(toast, { message: validationError });
      return;
    }

    try {
      setIsLoading(true);
      const compressedFile = await compressImage(file, maxWidth);
      const dataUrl = await readFileAsDataURL(compressedFile);
      setPreview(dataUrl);
      onChange(compressedFile);
    } catch (error) {
      showErrorToast(toast, {
        message: ERROR_MESSAGES.IMAGE_PROCESSING_ERROR
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormControl isInvalid={!!error} isRequired={isRequired}>
      <FormLabel>{label}</FormLabel>
      <VStack spacing={4} align="start">
        <Input
          type="file"
          accept={accept}
          onChange={handleFileChange}
          ref={inputRef}
          display="none"
        />
        <Button
          onClick={handleClick}
          isLoading={isLoading}
          loadingText="Processing..."
          colorScheme="blue"
          size="md"
        >
          {preview ? 'Change File' : 'Choose File'}
        </Button>
        {preview && (
          <Box borderWidth={1} borderRadius="md" p={2}>
            <Image
              src={preview}
              alt="Preview"
              maxH="200px"
              objectFit="contain"
              fallbackSrc="https://via.placeholder.com/150"
            />
          </Box>
        )}
        <FormErrorMessage>{error}</FormErrorMessage>
      </VStack>
    </FormControl>
  );
};

export default FileUpload;
