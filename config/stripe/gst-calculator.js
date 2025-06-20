/**
 * Australian GST Calculator for Ballarat Tool Library
 * 
 * This module handles GST (Goods and Services Tax) calculations
 * in compliance with Australian Tax Office requirements.
 * 
 * Key Requirements:
 * - GST rate: 10% (0.10)
 * - Prices are typically inclusive of GST
 * - GST registration required for businesses with turnover > $75,000
 * - Proper GST records must be maintained
 */

const GST_RATE = 0.10; // 10% GST rate in Australia
const ROUNDING_PRECISION = 2; // 2 decimal places for currency

/**
 * GST Calculation Types
 */
const GST_TYPES = {
  INCLUSIVE: 'inclusive',  // Price includes GST (most common in Australia)
  EXCLUSIVE: 'exclusive',  // Price excludes GST
  EXEMPT: 'exempt'         // No GST applies
};

/**
 * Product/Service Categories and their GST treatment
 */
const GST_CATEGORIES = {
  TOOL_RENTAL: {
    name: 'Tool Rental',
    type: GST_TYPES.INCLUSIVE,
    rate: GST_RATE,
    description: 'Rental of tools and equipment'
  },
  MEMBERSHIP_FEE: {
    name: 'Membership Fee',
    type: GST_TYPES.INCLUSIVE,
    rate: GST_RATE,
    description: 'Annual membership fees'
  },
  LATE_FEE: {
    name: 'Late Return Fee',
    type: GST_TYPES.INCLUSIVE,
    rate: GST_RATE,
    description: 'Penalty for late return'
  },
  DAMAGE_FEE: {
    name: 'Damage/Repair Fee',
    type: GST_TYPES.INCLUSIVE,
    rate: GST_RATE,
    description: 'Cost of repairs or replacement'
  },
  SECURITY_DEPOSIT: {
    name: 'Security Deposit',
    type: GST_TYPES.EXEMPT,
    rate: 0,
    description: 'Refundable security deposit (not subject to GST)'
  },
  DONATION: {
    name: 'Donation',
    type: GST_TYPES.EXEMPT,
    rate: 0,
    description: 'Charitable donation (not subject to GST)'
  }
};

/**
 * Calculate GST for inclusive pricing (price includes GST)
 * @param {number} inclusiveAmount - Amount including GST
 * @param {number} gstRate - GST rate (default: 0.10)
 * @returns {Object} GST calculation breakdown
 */
function calculateGSTInclusive(inclusiveAmount, gstRate = GST_RATE) {
  const inclusiveAmountCents = Math.round(inclusiveAmount * 100);
  const exclusiveAmountCents = Math.round(inclusiveAmountCents / (1 + gstRate));
  const gstAmountCents = inclusiveAmountCents - exclusiveAmountCents;

  return {
    inclusive_amount: inclusiveAmountCents,
    exclusive_amount: exclusiveAmountCents,
    gst_amount: gstAmountCents,
    gst_rate: gstRate,
    type: GST_TYPES.INCLUSIVE
  };
}

/**
 * Calculate GST for exclusive pricing (price excludes GST)
 * @param {number} exclusiveAmount - Amount excluding GST
 * @param {number} gstRate - GST rate (default: 0.10)
 * @returns {Object} GST calculation breakdown
 */
function calculateGSTExclusive(exclusiveAmount, gstRate = GST_RATE) {
  const exclusiveAmountCents = Math.round(exclusiveAmount * 100);
  const gstAmountCents = Math.round(exclusiveAmountCents * gstRate);
  const inclusiveAmountCents = exclusiveAmountCents + gstAmountCents;

  return {
    exclusive_amount: exclusiveAmountCents,
    gst_amount: gstAmountCents,
    inclusive_amount: inclusiveAmountCents,
    gst_rate: gstRate,
    type: GST_TYPES.EXCLUSIVE
  };
}

/**
 * Calculate GST based on category
 * @param {number} amount - Amount to calculate GST for
 * @param {string} category - Category from GST_CATEGORIES
 * @returns {Object} GST calculation with category information
 */
function calculateGSTByCategory(amount, category) {
  const categoryConfig = GST_CATEGORIES[category];
  
  if (!categoryConfig) {
    throw new Error(`Invalid GST category: ${category}`);
  }

  let calculation;
  
  switch (categoryConfig.type) {
    case GST_TYPES.INCLUSIVE:
      calculation = calculateGSTInclusive(amount, categoryConfig.rate);
      break;
    case GST_TYPES.EXCLUSIVE:
      calculation = calculateGSTExclusive(amount, categoryConfig.rate);
      break;
    case GST_TYPES.EXEMPT:
      calculation = {
        exclusive_amount: Math.round(amount * 100),
        gst_amount: 0,
        inclusive_amount: Math.round(amount * 100),
        gst_rate: 0,
        type: GST_TYPES.EXEMPT
      };
      break;
    default:
      throw new Error(`Invalid GST type: ${categoryConfig.type}`);
  }

  return {
    ...calculation,
    category: categoryConfig.name,
    description: categoryConfig.description,
    category_code: category
  };
}

/**
 * Generate GST breakdown for multiple line items
 * @param {Array} lineItems - Array of {amount, category, description?, quantity?}
 * @returns {Object} Complete GST breakdown
 */
function calculateGSTBreakdown(lineItems) {
  const breakdown = {
    line_items: [],
    subtotal_exclusive: 0,
    total_gst: 0,
    total_inclusive: 0,
    gst_rate: GST_RATE,
    calculation_date: new Date().toISOString()
  };

  lineItems.forEach((item, index) => {
    const quantity = item.quantity || 1;
    const totalAmount = item.amount * quantity;
    
    const gstCalc = calculateGSTByCategory(totalAmount, item.category);
    
    const lineItem = {
      line_number: index + 1,
      description: item.description || gstCalc.description,
      quantity,
      unit_amount: Math.round(item.amount * 100),
      total_amount: gstCalc.inclusive_amount,
      ...gstCalc
    };

    breakdown.line_items.push(lineItem);
    breakdown.subtotal_exclusive += gstCalc.exclusive_amount;
    breakdown.total_gst += gstCalc.gst_amount;
    breakdown.total_inclusive += gstCalc.inclusive_amount;
  });

  return breakdown;
}

/**
 * Generate GST-compliant invoice data
 * @param {Object} invoiceData - Invoice information
 * @param {Array} lineItems - Line items with GST calculations
 * @returns {Object} GST-compliant invoice data
 */
function generateGSTInvoice(invoiceData, lineItems) {
  const gstBreakdown = calculateGSTBreakdown(lineItems);
  
  return {
    invoice_number: invoiceData.invoice_number,
    invoice_date: invoiceData.invoice_date || new Date().toISOString(),
    due_date: invoiceData.due_date,
    
    // Supplier information (Ballarat Tool Library)
    supplier: {
      name: process.env.BUSINESS_NAME || 'Ballarat Tool Library',
      abn: process.env.BUSINESS_ABN,
      address: invoiceData.supplier_address || {
        line1: 'TBD',
        city: 'Ballarat',
        state: 'VIC',
        postcode: '3350',
        country: 'Australia'
      }
    },
    
    // Customer information
    customer: invoiceData.customer,
    
    // GST breakdown
    ...gstBreakdown,
    
    // Payment information
    payment_terms: invoiceData.payment_terms || 'Due on receipt',
    payment_methods: ['Credit Card', 'Debit Card'],
    
    // Compliance information
    gst_registration_required: gstBreakdown.total_gst > 0,
    tax_invoice: gstBreakdown.total_gst > 0,
    
    // Additional metadata
    currency: 'AUD',
    created_at: new Date().toISOString()
  };
}

/**
 * Format currency amounts for display
 * @param {number} amountCents - Amount in cents
 * @returns {string} Formatted currency string
 */
function formatCurrency(amountCents) {
  return `$${(amountCents / 100).toFixed(2)}`;
}

/**
 * Validate ABN format (basic validation)
 * @param {string} abn - Australian Business Number
 * @returns {boolean} True if ABN format is valid
 */
function validateABN(abn) {
  // Remove spaces and hyphens
  const cleanABN = abn.replace(/[\s-]/g, '');
  
  // Check if it's 11 digits
  if (!/^\d{11}$/.test(cleanABN)) {
    return false;
  }
  
  // Basic ABN checksum validation
  const weights = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
  const digits = cleanABN.split('').map(Number);
  
  // Subtract 1 from the first digit
  digits[0] -= 1;
  
  // Calculate checksum
  const sum = digits.reduce((acc, digit, index) => acc + (digit * weights[index]), 0);
  
  return sum % 89 === 0;
}

module.exports = {
  GST_RATE,
  GST_TYPES,
  GST_CATEGORIES,
  calculateGSTInclusive,
  calculateGSTExclusive,
  calculateGSTByCategory,
  calculateGSTBreakdown,
  generateGSTInvoice,
  formatCurrency,
  validateABN
};