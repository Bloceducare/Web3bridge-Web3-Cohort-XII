/**
 * Utility functions for error handling in Ethereum applications
 */

/**
 * Formats an error message to be more user-friendly
 * @param {Error} error - The error object
 * @returns {string} A user-friendly error message
 */
export const formatErrorMessage = (error) => {
    // No error
    if (!error) return 'Unknown error occurred';
    
    // Handle common ethers.js errors
    if (error.message) {
      // Parse error message
      if (error.message.includes('call exception')) {
        return 'Contract call failed. This may not be a valid Uniswap V2 pair address.';
      }
      
      if (error.message.includes('invalid address')) {
        return 'The address provided is not a valid Ethereum address.';
      }
  
      if (error.message.includes('network does not support')) {
        return 'Network connection issue. Please check your internet connection.';
      }
      
      if (error.message.includes('timeout')) {
        return 'Request timed out. The Ethereum network might be congested.';
      }
  
      if (error.message.includes('user rejected')) {
        return 'Transaction was rejected.';
      }
  
      // Connection errors
      if (
        error.message.includes('connection') || 
        error.message.includes('network') ||
        error.message.includes('server')
      ) {
        return 'Network connection issue. Please check your internet connection or try a different RPC provider.';
      }
      
      // Reference errors - development issues
      if (error.name === 'ReferenceError') {
        return 'Application error. Please report this bug.';
      }
      
      // Return the raw error message if no specific handler
      return error.message;
    }
    
    // Default error message
    return 'An error occurred while processing your request';
  };
  
  /**
   * Logs detailed error information to the console
   * @param {string} context - Where the error occurred
   * @param {Error} error - The error object
   */
  export const logErrorDetails = (context, error) => {
    console.group(`Error in ${context}`);
    console.error('Error object:', error);
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    
    if (error.code) {
      console.error('Error code:', error.code);
    }
    
    if (error.data) {
      console.error('Error data:', error.data);
    }
    
    console.groupEnd();
  };
  
  /**
   * Checks if an address is potentially a Uniswap V2 pair
   * This is a basic check that doesn't guarantee it's a valid pair
   * @param {string} address - Ethereum address to check
   * @param {ethers.providers.Provider} provider - Ethers provider
   * @returns {Promise<boolean>} Whether the address might be a Uniswap V2 pair
   */
  export const isPotentialUniswapPair = async (address, provider) => {
    try {
      // Check if address is valid
      if (!ethers.utils.isAddress(address)) {
        return false;
      }
      
      // Check code at address (not EOA)
      const code = await provider.getCode(address);
      if (code === '0x' || code === '0x0') {
        return false;
      }
      
      // Try to call specific Uniswap V2 pair methods
      // This would be implemented with ethers contract calls
      
      return true;
    } catch (error) {
      console.error('Error checking if address is Uniswap pair:', error);
      return false;
    }
  };