import { useColorModeValue } from '@chakra-ui/react';

export const useThemeColors = () => {
  const bgColor = useColorModeValue(
    'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)',
    'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)'
  );

  const cardBg = useColorModeValue('white', 'gray.800');
  const cardHoverBg = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const headerBg = useColorModeValue('rgba(255, 255, 255, 0.9)', 'rgba(26, 35, 126, 0.9)');
  const footerBg = useColorModeValue('rgba(255, 255, 255, 0.9)', 'rgba(26, 35, 126, 0.9)');
  const overlayBg = useColorModeValue('rgba(255, 255, 255, 0.1)', 'rgba(0, 0, 0, 0.1)');
  const textColor = useColorModeValue('gray.800', 'white');
  const textSecondaryColor = useColorModeValue('gray.500', 'gray.400');
  const linkColor = useColorModeValue('blue.500', 'blue.300');
  const linkHoverColor = useColorModeValue('blue.600', 'blue.400');

  return {
    bgColor,
    cardBg,
    cardHoverBg,
    borderColor,
    headerBg,
    footerBg,
    overlayBg,
    textColor,
    textSecondaryColor,
    linkColor,
    linkHoverColor,
  };
}; 