import { useState, useCallback } from 'react';
import { useToast } from '@chakra-ui/react';
import { showErrorToast } from '../utils/toastHelper';

const useApiRequest = (apiFunction, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const toast = useToast();

  const execute = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiFunction(...args);
      setData(result);
      return result;
    } catch (err) {
      setError(err);
      if (options.showError !== false) {
        showErrorToast(toast, err);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction, toast, options.showError]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset,
    setData
  };
};

export default useApiRequest;
