import React from 'react';
import {
  Box,
  Button,
  Heading,
  Text,
  VStack,
} from '@chakra-ui/react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box p={8} maxWidth="500px" mx="auto" textAlign="center">
          <VStack spacing={6}>
            <Heading>Something went wrong</Heading>
            <Text>We apologize for the inconvenience. Please try again.</Text>
            <Button colorScheme="blue" onClick={this.handleReset}>
              Return to Home
            </Button>
          </VStack>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
