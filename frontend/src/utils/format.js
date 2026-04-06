/**
 * Formats a numeric value into a currency string with the Rupee symbol (₹).
 * @param {number|string} amount - The numeric value to format.
 * @param {number} decimals - The number of decimal places (default is 2).
 * @returns {string} The formatted currency string.
 */
export const formatPrice = (amount, decimals = 2) => {
    const numericAmount = Number(amount) || 0;
    return `₹${numericAmount.toLocaleString('en-IN', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    })}`;
};

export const currencySymbol = '₹';
