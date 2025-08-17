import { PaymentIntelligenceDB, connectPaymentIntelligenceDB } from '@/db/payment-intelligence';
import { Customer, Transaction, Subscription, FraudResult } from '@/db/payment-intelligence';

// Database connection helper
export async function ensureDBConnection() {
  try {
    await connectPaymentIntelligenceDB();
  } catch (error) {
    console.error('Failed to connect to database:', error);
    throw error;
  }
}

// Data transformation helpers
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
}

export function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}

// Search and filter helpers
export async function searchAllCollections(query: string, limit: number = 20) {
  await ensureDBConnection();
  
  const [customers, transactions, subscriptions] = await Promise.all([
    PaymentIntelligenceDB.searchCustomers(query, limit),
    PaymentIntelligenceDB.searchTransactions(query, limit),
    PaymentIntelligenceDB.getAllSubscriptions(limit)
  ]);

  return {
    customers,
    transactions,
    subscriptions
  };
}

// Analytics helpers
export async function getCustomerAnalytics(email?: string) {
  await ensureDBConnection();
  
  let customerData;
  if (email) {
    customerData = await PaymentIntelligenceDB.getCustomerByEmail(email);
    if (!customerData) {
      throw new Error('Customer not found');
    }
  }

  const [
    transactions,
    subscriptions,
    fraudResults
  ] = await Promise.all([
    email ? PaymentIntelligenceDB.getTransactionsByEmail(email) : [],
    email ? PaymentIntelligenceDB.getSubscriptionsByEmail(email) : [],
    email ? PaymentIntelligenceDB.getFraudResultsByEmail(email) : []
  ]);

  // Calculate customer metrics
  const totalSpent = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
  const successfulTransactions = transactions.filter(t => t.status === 'succeeded').length;
  const fraudDetected = fraudResults.filter(f => f.fraud_detected).length;
  const activeSubscriptions = subscriptions.filter(s => s.status === 'active').length;

  return {
    customer: customerData,
    metrics: {
      totalTransactions: transactions.length,
      successfulTransactions,
      successRate: transactions.length > 0 ? (successfulTransactions / transactions.length) * 100 : 0,
      totalSpent,
      averageTransactionValue: transactions.length > 0 ? totalSpent / transactions.length : 0,
      fraudDetected,
      fraudRate: fraudResults.length > 0 ? (fraudDetected / fraudResults.length) * 100 : 0,
      activeSubscriptions,
      totalSubscriptions: subscriptions.length
    },
    data: {
      transactions,
      subscriptions,
      fraudResults
    }
  };
}

export async function getTransactionAnalytics(filters: {
  startDate?: Date;
  endDate?: Date;
  status?: string;
  email?: string;
} = {}) {
  await ensureDBConnection();
  
  let transactions: Transaction[] = [];
  
  if (filters.email) {
    transactions = await PaymentIntelligenceDB.getTransactionsByEmail(filters.email);
  } else if (filters.startDate && filters.endDate) {
    transactions = await PaymentIntelligenceDB.getTransactionsByDateRange(filters.startDate, filters.endDate);
  } else if (filters.status) {
    transactions = await PaymentIntelligenceDB.getTransactionsByStatus(filters.status);
  } else {
    transactions = await PaymentIntelligenceDB.getAllTransactions(1000); // Get more for analytics
  }

  // Apply additional filters
  if (filters.status && !filters.email) {
    transactions = transactions.filter(t => t.status === filters.status);
  }

  // Calculate analytics
  const totalAmount = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
  const successfulTransactions = transactions.filter(t => t.status === 'succeeded');
  const failedTransactions = transactions.filter(t => t.status === 'failed');
  const refundedTransactions = transactions.filter(t => t.refunded);
  const disputedTransactions = transactions.filter(t => t.disputed);

  const analytics = {
    totalTransactions: transactions.length,
    totalAmount,
    averageAmount: transactions.length > 0 ? totalAmount / transactions.length : 0,
    successfulTransactions: successfulTransactions.length,
    failedTransactions: failedTransactions.length,
    refundedTransactions: refundedTransactions.length,
    disputedTransactions: disputedTransactions.length,
    successRate: transactions.length > 0 ? (successfulTransactions.length / transactions.length) * 100 : 0,
    refundRate: transactions.length > 0 ? (refundedTransactions.length / transactions.length) * 100 : 0,
    disputeRate: transactions.length > 0 ? (disputedTransactions.length / transactions.length) * 100 : 0,
    transactions
  };

  return analytics;
}

export async function getSubscriptionAnalytics(filters: {
  status?: string;
  email?: string;
} = {}) {
  await ensureDBConnection();
  
  let subscriptions: Subscription[] = [];
  
  if (filters.email) {
    subscriptions = await PaymentIntelligenceDB.getSubscriptionsByEmail(filters.email);
  } else if (filters.status) {
    subscriptions = await PaymentIntelligenceDB.getSubscriptionsByStatus(filters.status);
  } else {
    subscriptions = await PaymentIntelligenceDB.getAllSubscriptions(1000);
  }

  // Calculate analytics
  const totalRevenue = subscriptions.reduce((sum, s) => sum + (s.price_amount || 0), 0);
  const activeSubscriptions = subscriptions.filter(s => s.status === 'active');
  const canceledSubscriptions = subscriptions.filter(s => s.status === 'canceled');
  const trialSubscriptions = subscriptions.filter(s => s.trial_start && s.trial_end);

  const analytics = {
    totalSubscriptions: subscriptions.length,
    totalRevenue,
    averageRevenue: subscriptions.length > 0 ? totalRevenue / subscriptions.length : 0,
    activeSubscriptions: activeSubscriptions.length,
    canceledSubscriptions: canceledSubscriptions.length,
    trialSubscriptions: trialSubscriptions.length,
    activeRate: subscriptions.length > 0 ? (activeSubscriptions.length / subscriptions.length) * 100 : 0,
    cancelRate: subscriptions.length > 0 ? (canceledSubscriptions.length / subscriptions.length) * 100 : 0,
    subscriptions
  };

  return analytics;
}

// Export helpers
export function prepareDataForExport(data: any[], type: 'transactions' | 'customers' | 'subscriptions') {
  return data.map(item => {
    const exportItem = { ...item };
    
    // Convert ObjectId to string
    if (exportItem._id) {
      exportItem._id = exportItem._id.toString();
    }
    
    // Format dates
    if (exportItem.created_at) {
      exportItem.created_at = formatDate(exportItem.created_at);
    }
    if (exportItem.updated_at) {
      exportItem.updated_at = formatDate(exportItem.updated_at);
    }
    
    // Format currency amounts
    if (type === 'transactions' && exportItem.amount) {
      exportItem.formatted_amount = formatCurrency(exportItem.amount, exportItem.currency);
    }
    if (type === 'subscriptions' && exportItem.price_amount) {
      exportItem.formatted_price = formatCurrency(exportItem.price_amount, exportItem.currency);
    }
    
    return exportItem;
  });
}

// Validation helpers
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateTransactionData(data: Partial<Transaction>): string[] {
  const errors: string[] = [];
  
  if (!data.transaction_id) errors.push('Transaction ID is required');
  if (!data.email) errors.push('Email is required');
  if (!validateEmail(data.email || '')) errors.push('Invalid email format');
  if (!data.amount || data.amount <= 0) errors.push('Amount must be greater than 0');
  if (!data.currency) errors.push('Currency is required');
  
  return errors;
}

export function validateCustomerData(data: Partial<Customer>): string[] {
  const errors: string[] = [];
  
  if (!data.email) errors.push('Email is required');
  if (!validateEmail(data.email || '')) errors.push('Invalid email format');
  if (!data.name) errors.push('Name is required');
  
  return errors;
}

export function validateSubscriptionData(data: Partial<Subscription>): string[] {
  const errors: string[] = [];
  
  if (!data.subscription_id) errors.push('Subscription ID is required');
  if (!data.email) errors.push('Email is required');
  if (!validateEmail(data.email || '')) errors.push('Invalid email format');
  if (!data.gateway) errors.push('Gateway is required');
  if (!data.status) errors.push('Status is required');
  
  return errors;
}
