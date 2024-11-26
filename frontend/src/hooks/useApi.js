import { useState, useCallback } from 'react';
import { useToast } from '@chakra-ui/react';

export const useApi = (apiFunction) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const toast = useToast();

  const execute = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiFunction(...args);
      return response;
    } catch (err) {
      setError(err);
      toast({
        title: 'Error',
        description: err.message || 'Something went wrong',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction, toast]);

  return {
    loading,
    error,
    execute,
  };
};

export default useApi;
