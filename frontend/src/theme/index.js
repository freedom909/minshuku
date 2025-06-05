import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  colors: {
    brand: {
      50: '#f7fafc',
      100: '#edf2f7',
      200: '#e2e8f0',
      300: '#cbd5e0',
      400: '#a0aec0',
      500: '#718096',
      600: '#4a5568',
      700: '#2d3748',
      800: '#1a202c',
      900: '#171923',
    },
    primary: {
      50: '#E6F6FF',
      100: '#BAE3FF',
      200: '#7CC4FA',
      300: '#47A3F3',
      400: '#2186EB',
      500: '#0967D2',
      600: '#0552B5',
      700: '#03449E',
      800: '#01337D',
      900: '#002159',
    },
  },
  fonts: {
    heading: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
    body: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'semibold',
        borderRadius: 'md',
      },
      variants: {
        solid: (props) => ({
          bg: props.colorMode === 'dark' ? 'primary.200' : 'primary.500',
          color: 'white',
          _hover: {
            bg: props.colorMode === 'dark' ? 'primary.300' : 'primary.600',
          },
        }),
        outline: (props) => ({
          borderColor: props.colorMode === 'dark' ? 'primary.200' : 'primary.500',
          color: props.colorMode === 'dark' ? 'primary.200' : 'primary.500',
          _hover: {
            bg: props.colorMode === 'dark' ? 'primary.800' : 'primary.50',
          },
        }),
      },
    },
    Input: {
      variants: {
        filled: {
          field: {
            _focus: {
              borderColor: 'primary.500',
            },
          },
        },
        outline: {
          field: {
            _focus: {
              borderColor: 'primary.500',
              boxShadow: '0 0 0 1px var(--chakra-colors-primary-500)',
            },
          },
        },
      },
    },
  },
  styles: {
    global: (props) => ({
      body: {
        bg: props.colorMode === 'dark' ? 'gray.800' : 'white',
        color: props.colorMode === 'dark' ? 'white' : 'gray.800',
      },
    }),
  },
});

export default theme;