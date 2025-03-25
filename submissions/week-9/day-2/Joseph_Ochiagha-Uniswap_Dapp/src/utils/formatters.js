// src/utils/formatters.js

/**
 * Formats an address by truncating the middle part
 * @param {string} address - Ethereum address
 * @returns {string} Truncated address
 */
export function shortenAddress(address) {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  }
  
  /**
   * Formats a number with commas as thousands separators
   * @param {number|string} number - Number to format
   * @param {number} decimals - Number of decimal places
   * @returns {string} Formatted number
   */
  export function formatNumber(number, decimals = 6) {
    if (!number) return '0';
    
    // Convert to number if it's a string
    const num = typeof number === 'string' ? parseFloat(number) : number;
    
    // Handle very small numbers more elegantly (scientific notation)
    if (num < 0.000001 && num > 0) {
      return num.toExponential(2);
    }
    
    // Format with commas and fixed decimals
    const options = {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals,
    };
    
    return num.toLocaleString('en-US', options);
  }
  
  /**
   * Formats a price with the appropriate precision
   * @param {number|string} price - The price to format
   * @returns {string} Formatted price
   */
  export function formatPrice(price) {
    if (!price) return '0';
    const num = typeof price === 'string' ? parseFloat(price) : price;
    
    // Use different precision based on the price magnitude
    if (num > 1000) return formatNumber(num, 2);
    if (num > 1) return formatNumber(num, 4);
    if (num > 0.01) return formatNumber(num, 5);
    if (num > 0.0001) return formatNumber(num, 6);
    return formatNumber(num, 8);
  }
  
  /**
   * Gets the token image URL from common sources
   * @param {string} address - Token address
   * @returns {string} Image URL
   */
  export function getTokenImageUrl(address) {
    // Try to get from Trust Wallet assets
    return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${address}/logo.png`;
  }
  
  /**
   * Formats a timestamp to a human-readable date
   * @param {number} timestamp - Unix timestamp
   * @returns {string} Formatted date
   */
  export function formatTimestamp(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
  }
  
  /**
   * Convert hex color to rgba
   * @param {string} hex - Hex color
   * @param {number} alpha - Alpha channel value
   * @returns {string} RGBA color
   */
  export function hexToRgba(hex, alpha = 1) {
    if (!hex) return 'rgba(0,0,0,0)';
    
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  
  /**
   * Determines if a theme should use light or dark text based on background
   * @param {string} hexColor - Background color in hex
   * @returns {string} 'light' or 'dark'
   */
  export function getContrastText(hexColor) {
    if (!hexColor) return 'light';
    
    // Convert hex to rgb
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    
    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    return luminance > 0.5 ? 'dark' : 'light';
  }