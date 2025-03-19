export function useThemeColors() {
  const bgColor = 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)'
  const cardBg = 'white'
  const cardHoverBg = 'gray.50'
  const borderColor = 'gray.200'
  const headerBg = 'rgba(255, 255, 255, 0.9)'
  const footerBg = 'rgba(255, 255, 255, 0.9)'
  const overlayBg = 'rgba(255, 255, 255, 0.1)'
  const textColor = 'gray.800'
  const textSecondaryColor = 'gray.600'
  const linkColor = 'blue.500'
  const linkHoverColor = 'blue.600'

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
  }
} 