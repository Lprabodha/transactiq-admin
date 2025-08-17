// Example usage of both database clients

// Original database client (transactiqdb)
import { db as transactiqDB, connectDB, closeDB } from '@/db';

// New payment_intelligence database client
import { 
  PaymentIntelligenceDB, 
  connectPaymentIntelligenceDB, 
  closePaymentIntelligenceDB,
  paymentIntelligenceDB 
} from '@/db/payment-intelligence';

// Example: Using the original database
async function useOriginalDatabase() {
  try {
    await connectDB();
    
    // Use the original transactiqdb database
    const originalCollection = transactiqDB.collection('your_collection');
    const result = await originalCollection.find({}).toArray();
    
    console.log('Original DB result:', result);
  } catch (error) {
    console.error('Error with original DB:', error);
  } finally {
    await closeDB();
  }
}

// Example: Using the payment_intelligence database
async function usePaymentIntelligenceDatabase() {
  try {
    await connectPaymentIntelligenceDB();
    
    // Get all transactions from payment_intelligence database
    const transactions = await PaymentIntelligenceDB.getAllTransactions(100);
    console.log('Transactions:', transactions);
    
    // Get all customers
    const customers = await PaymentIntelligenceDB.getAllCustomers(100);
    console.log('Customers:', customers);
    
    // Get transaction statistics
    const stats = await PaymentIntelligenceDB.getTransactionStats();
    console.log('Transaction stats:', stats);
    
  } catch (error) {
    console.error('Error with payment_intelligence DB:', error);
  } finally {
    await closePaymentIntelligenceDB();
  }
}

// Example: Using both databases simultaneously
async function useBothDatabases() {
  try {
    // Connect to both databases
    await connectDB();
    await connectPaymentIntelligenceDB();
    
    // Use original database
    const originalCollection = transactiqDB.collection('your_collection');
    const originalData = await originalCollection.find({}).toArray();
    
    // Use payment_intelligence database
    const transactions = await PaymentIntelligenceDB.getAllTransactions(50);
    const customers = await PaymentIntelligenceDB.getAllCustomers(50);
    
    console.log('Original DB data:', originalData);
    console.log('Payment Intelligence transactions:', transactions);
    console.log('Payment Intelligence customers:', customers);
    
  } catch (error) {
    console.error('Error using both databases:', error);
  } finally {
    // Close both connections
    await closeDB();
    await closePaymentIntelligenceDB();
  }
}

// Example: API route using payment_intelligence database
export async function exampleAPIRoute() {
  try {
    await connectPaymentIntelligenceDB();
    
    // Get recent transactions
    const recentTransactions = await PaymentIntelligenceDB.getAllTransactions(10);
    
    // Get customer analytics
    const customerAnalytics = await PaymentIntelligenceDB.getTransactionStats();
    
    return {
      success: true,
      data: {
        recentTransactions,
        analytics: customerAnalytics
      }
    };
    
  } catch (error) {
    console.error('API Error:', error);
    return {
      success: false,
      error: 'Failed to fetch data'
    };
  }
}

// Export functions for use in other files
export {
  useOriginalDatabase,
  usePaymentIntelligenceDatabase,
  useBothDatabases
};
