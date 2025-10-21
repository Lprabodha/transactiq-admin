import { MongoClient, Collection, ObjectId } from "mongodb";

// Database configuration for payment_intelligence
const OPTIONS = {};
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";

const paymentIntelligenceClient = new MongoClient(MONGODB_URI, OPTIONS);

// Connect to payment_intelligence database
export const paymentIntelligenceDB = paymentIntelligenceClient.db("payment_intelligence");

// TypeScript interfaces for payment_intelligence data models
export interface Customer {
  _id: ObjectId;
  email: string;
  name: string;
  phone: string | null;
  currency: string;
  country: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  created_at: Date;
  delinquent: boolean;
  default_payment_method: string;
  balance: number;
  tax_info: {
    tax_id: string | null;
    type: string | null;
  };
  metadata: {
    onboarding_funnel: string;
    type: string;
    user_email: string;
    user_id: string;
  };
  invoice_prefix: string;
  gateway_customer_ids: {
    stripe: string;
  };
}

export interface Transaction {
  _id: ObjectId;
  transaction_id: string;
  email: string;
  amount: number;
  currency: string;
  gateway: string;
  status: string;
  payment_method: string;
  card_brand: string;
  card_country: string;
  fingerprint: string;
  funding_type: string;
  three_d_secure: string | null;
  cvc_check: string;
  address_line1_check: string | null;
  postal_code_check: string;
  risk_level: string;
  risk_score: number;
  seller_message: string;
  network_status: string;
  outcome_type: string;
  ip_address: string;
  billing_name: string | null;
  billing_email: string;
  billing_phone: string | null;
  billing_address_country: string;
  billing_address_line1: string | null;
  billing_address_line2: string | null;
  billing_address_postal_code: string;
  billing_address_city: string | null;
  billing_address_state: string | null;
  refunded: boolean;
  amount_refunded: number;
  disputed: boolean;
  captured: boolean;
  paid: boolean;
  created_at: Date;
  chargeback_confidence: number;
  chargeback_predicted: boolean;
  updated_at: Date;
}

export interface Subscription {
  _id: ObjectId;
  subscription_id: string;
  email: string;
  gateway: string;
  status: string;
  current_period_start: Date;
  current_period_end: Date;
  plan_id: string;
  plan_name: string | null;
  product_id: string;
  price_amount: number;
  currency: string;
  interval: string;
  created_at: Date;
  cancel_at_period_end: boolean;
  canceled_at: Date | null;
  ended_at: Date | null;
  trial_start: Date | null;
  trial_end: Date | null;
  quantity: number;
  metadata: Record<string, any>;
  latest_invoice: string;
  collection_method: string;
  default_payment_method: string;
  billing_cycle_anchor: Date;
}

export interface SubscriptionForecast {
  _id: ObjectId;
  subscription_id: string;
  forecasted: boolean;
  forecasted_at: Date;
  predicted_revenue: number;
}

export interface FraudResult {
  _id: ObjectId;
  transaction_id: string;
  email: string;
  fraud_detected: boolean;
  confidence: number;
  reasons: string[];
  timestamp: Date;
}

export interface ChargebackPrediction {
  _id: ObjectId;
  transaction_id: string;
  chargeback_predicted: boolean;
  confidence_score: number;
}

// Collection references for payment_intelligence
export const customersCollection: Collection<Customer> = paymentIntelligenceDB.collection<Customer>("customers");
export const transactionsCollection: Collection<Transaction> = paymentIntelligenceDB.collection<Transaction>("transactions");
export const subscriptionsCollection: Collection<Subscription> = paymentIntelligenceDB.collection<Subscription>("subscriptions");
export const subscriptionForecastsCollection: Collection<SubscriptionForecast> = paymentIntelligenceDB.collection<SubscriptionForecast>("subscription_forecasts");
export const fraudResultsCollection: Collection<FraudResult> = paymentIntelligenceDB.collection<FraudResult>("fraud_results");
export const chargebackPredictionsCollection: Collection<ChargebackPrediction> = paymentIntelligenceDB.collection<ChargebackPrediction>("chargeback_predictions");

// Database functions for payment_intelligence
export class PaymentIntelligenceDB {
  // Customer functions
  static async getAllCustomers(limit: number = 100, skip: number = 0): Promise<Customer[]> {
    try {
      return await customersCollection
        .find({})
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();
    } catch (error) {
      console.error("Error fetching customers:", error);
      throw error;
    }
  }

  static async getCustomerById(id: string): Promise<Customer | null> {
    try {
      return await customersCollection.findOne({ _id: new ObjectId(id) });
    } catch (error) {
      console.error("Error fetching customer by ID:", error);
      throw error;
    }
  }

  static async getCustomerByEmail(email: string): Promise<Customer | null> {
    try {
      return await customersCollection.findOne({ email });
    } catch (error) {
      console.error("Error fetching customer by email:", error);
      throw error;
    }
  }

  static async getCustomersCount(): Promise<number> {
    try {
      return await customersCollection.countDocuments();
    } catch (error) {
      console.error("Error counting customers:", error);
      throw error;
    }
  }

  // Transaction functions
  static async getAllTransactions(limit: number = 100, skip: number = 0): Promise<Transaction[]> {
    try {
      return await transactionsCollection
        .find({})
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();
    } catch (error) {
      console.error("Error fetching transactions:", error);
      throw error;
    }
  }

  static async getTransactionById(id: string): Promise<Transaction | null> {
    try {
      return await transactionsCollection.findOne({ _id: new ObjectId(id) });
    } catch (error) {
      console.error("Error fetching transaction by ID:", error);
      throw error;
    }
  }

  static async getTransactionsByEmail(email: string, limit: number = 50): Promise<Transaction[]> {
    try {
      return await transactionsCollection
        .find({ email })
        .sort({ created_at: -1 })
        .limit(limit)
        .toArray();
    } catch (error) {
      console.error("Error fetching transactions by email:", error);
      throw error;
    }
  }

  static async getTransactionsByStatus(status: string, limit: number = 100): Promise<Transaction[]> {
    try {
      return await transactionsCollection
        .find({ status })
        .sort({ created_at: -1 })
        .limit(limit)
        .toArray();
    } catch (error) {
      console.error("Error fetching transactions by status:", error);
      throw error;
    }
  }

  static async getTransactionsCount(): Promise<number> {
    try {
      return await transactionsCollection.countDocuments();
    } catch (error) {
      console.error("Error counting transactions:", error);
      throw error;
    }
  }

  static async getTransactionsByDateRange(startDate: Date, endDate: Date): Promise<Transaction[]> {
    try {
      return await transactionsCollection
        .find({
          created_at: {
            $gte: startDate,
            $lte: endDate
          }
        })
        .sort({ created_at: -1 })
        .toArray();
    } catch (error) {
      console.error("Error fetching transactions by date range:", error);
      throw error;
    }
  }

  // Subscription functions
  static async getAllSubscriptions(limit: number = 100, skip: number = 0): Promise<Subscription[]> {
    try {
      return await subscriptionsCollection
        .find({})
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      throw error;
    }
  }

  static async getSubscriptionById(id: string): Promise<Subscription | null> {
    try {
      return await subscriptionsCollection.findOne({ _id: new ObjectId(id) });
    } catch (error) {
      console.error("Error fetching subscription by ID:", error);
      throw error;
    }
  }

  static async getSubscriptionsByEmail(email: string, limit: number = 50): Promise<Subscription[]> {
    try {
      return await subscriptionsCollection
        .find({ email })
        .sort({ created_at: -1 })
        .limit(limit)
        .toArray();
    } catch (error) {
      console.error("Error fetching subscriptions by email:", error);
      throw error;
    }
  }

  static async getSubscriptionsByStatus(status: string, limit: number = 100): Promise<Subscription[]> {
    try {
      return await subscriptionsCollection
        .find({ status })
        .sort({ created_at: -1 })
        .limit(limit)
        .toArray();
    } catch (error) {
      console.error("Error fetching subscriptions by status:", error);
      throw error;
    }
  }

  static async getSubscriptionsCount(): Promise<number> {
    try {
      return await subscriptionsCollection.countDocuments();
    } catch (error) {
      console.error("Error counting subscriptions:", error);
      throw error;
    }
  }

  // Subscription Forecast functions
  static async getAllSubscriptionForecasts(limit: number = 100): Promise<SubscriptionForecast[]> {
    try {
      return await subscriptionForecastsCollection
        .find({})
        .sort({ forecasted_at: -1 })
        .limit(limit)
        .toArray();
    } catch (error) {
      console.error("Error fetching subscription forecasts:", error);
      throw error;
    }
  }

  static async getSubscriptionForecastsCount(): Promise<number> {
    try {
      return await subscriptionForecastsCollection.countDocuments();
    } catch (error) {
      console.error("Error counting subscription forecasts:", error);
      throw error;
    }
  }

  // Fraud Results functions
  static async getAllFraudResults(limit: number = 100): Promise<FraudResult[]> {
    try {
      return await fraudResultsCollection
        .find({})
        .sort({ timestamp: -1 })
        .limit(limit)
        .toArray();
    } catch (error) {
      console.error("Error fetching fraud results:", error);
      throw error;
    }
  }

  static async getFraudResultsByEmail(email: string, limit: number = 50): Promise<FraudResult[]> {
    try {
      return await fraudResultsCollection
        .find({ email })
        .sort({ timestamp: -1 })
        .limit(limit)
        .toArray();
    } catch (error) {
      console.error("Error fetching fraud results by email:", error);
      throw error;
    }
  }

  static async getFraudResultsCount(): Promise<number> {
    try {
      return await fraudResultsCollection.countDocuments();
    } catch (error) {
      console.error("Error counting fraud results:", error);
      throw error;
    }
  }

  // Chargeback Predictions functions
  static async getAllChargebackPredictions(limit: number = 100): Promise<ChargebackPrediction[]> {
    try {
      return await chargebackPredictionsCollection
        .find({})
        .limit(limit)
        .toArray();
    } catch (error) {
      console.error("Error fetching chargeback predictions:", error);
      throw error;
    }
  }

  static async getChargebackPredictionsCount(): Promise<number> {
    try {
      return await chargebackPredictionsCollection.countDocuments();
    } catch (error) {
      console.error("Error counting chargeback predictions:", error);
      throw error;
    }
  }

  // Insert methods for sample data generation
  static async insertManyTransactions(transactions: any[]): Promise<any> {
    try {
      return await transactionsCollection.insertMany(transactions);
    } catch (error) {
      console.error("Error inserting transactions:", error);
      throw error;
    }
  }

  static async insertManyCustomers(customers: any[]): Promise<any> {
    try {
      return await customersCollection.insertMany(customers);
    } catch (error) {
      console.error("Error inserting customers:", error);
      throw error;
    }
  }

  static async insertManyFraudResults(fraudResults: any[]): Promise<any> {
    try {
      return await fraudResultsCollection.insertMany(fraudResults);
    } catch (error) {
      console.error("Error inserting fraud results:", error);
      throw error;
    }
  }

  static async insertManySubscriptions(subscriptions: any[]): Promise<any> {
    try {
      return await subscriptionsCollection.insertMany(subscriptions);
    } catch (error) {
      console.error("Error inserting subscriptions:", error);
      throw error;
    }
  }

  static async insertManyChargebackPredictions(predictions: any[]): Promise<any> {
    try {
      return await chargebackPredictionsCollection.insertMany(predictions);
    } catch (error) {
      console.error("Error inserting chargeback predictions:", error);
      throw error;
    }
  }

  static async insertManySubscriptionForecasts(forecasts: any[]): Promise<any> {
    try {
      return await subscriptionForecastsCollection.insertMany(forecasts);
    } catch (error) {
      console.error("Error inserting subscription forecasts:", error);
      throw error;
    }
  }

  // Clear all collections (for testing/resetting)
  static async clearAllCollections(): Promise<void> {
    try {
      await Promise.all([
        transactionsCollection.deleteMany({}),
        customersCollection.deleteMany({}),
        fraudResultsCollection.deleteMany({}),
        subscriptionsCollection.deleteMany({}),
        chargebackPredictionsCollection.deleteMany({}),
        subscriptionForecastsCollection.deleteMany({})
      ]);
      console.log("All collections cleared successfully");
    } catch (error) {
      console.error("Error clearing collections:", error);
      throw error;
    }
  }

  // Analytics and aggregation functions
  static async getTransactionStats() {
    try {
      const stats = await transactionsCollection.aggregate([
        {
          $group: {
            _id: null,
            totalTransactions: { $sum: 1 },
            totalAmount: { $sum: "$amount" },
            averageAmount: { $avg: "$amount" },
            successfulTransactions: {
              $sum: { $cond: [{ $eq: ["$status", "succeeded"] }, 1, 0] }
            },
            failedTransactions: {
              $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] }
            }
          }
        }
      ]).toArray();

      return stats[0] || {
        totalTransactions: 0,
        totalAmount: 0,
        averageAmount: 0,
        successfulTransactions: 0,
        failedTransactions: 0
      };
    } catch (error) {
      console.error("Error fetching transaction stats:", error);
      throw error;
    }
  }

  static async getSubscriptionStats() {
    try {
      const stats = await subscriptionsCollection.aggregate([
        {
          $group: {
            _id: null,
            totalSubscriptions: { $sum: 1 },
            activeSubscriptions: {
              $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] }
            },
            canceledSubscriptions: {
              $sum: { $cond: [{ $eq: ["$status", "canceled"] }, 1, 0] }
            },
            totalRevenue: { $sum: "$price_amount" },
            // Calculate MRR from active subscriptions only
            mrr: {
              $sum: {
                $cond: [
                  { $eq: ["$status", "active"] },
                  {
                    $cond: [
                      { $eq: ["$interval", "month"] },
                      { $multiply: ["$price_amount", "$quantity"] },
                      {
                        $cond: [
                          { $eq: ["$interval", "year"] },
                          { $divide: [{ $multiply: ["$price_amount", "$quantity"] }, 12] },
                          {
                            $cond: [
                              { $eq: ["$interval", "week"] },
                              { $multiply: [{ $multiply: ["$price_amount", "$quantity"] }, 4.33] },
                              { $multiply: [{ $multiply: ["$price_amount", "$quantity"] }, 30] }
                            ]
                          }
                        ]
                      }
                    ]
                  },
                  0
                ]
              }
            }
          }
        }
      ]).toArray();

      const result = stats[0] || {
        totalSubscriptions: 0,
        activeSubscriptions: 0,
        canceledSubscriptions: 0,
        totalRevenue: 0,
        mrr: 0
      };

      // Calculate additional metrics
      const arr = result.mrr * 12; // Annual Recurring Revenue
      const churnRate = result.totalSubscriptions > 0 
        ? (result.canceledSubscriptions / result.totalSubscriptions) * 100 
        : 0;

      return {
        ...result,
        arr: Math.round(arr * 100) / 100,
        churnRate: Math.round(churnRate * 100) / 100,
        mrr: Math.round(result.mrr * 100) / 100,
        totalRevenue: Math.round(result.totalRevenue * 100) / 100
      };
    } catch (error) {
      console.error("Error fetching subscription stats:", error);
      throw error;
    }
  }

  static async getFraudStats() {
    try {
      const stats = await fraudResultsCollection.aggregate([
        {
          $group: {
            _id: null,
            totalChecks: { $sum: 1 },
            fraudDetected: {
              $sum: { $cond: ["$fraud_detected", 1, 0] }
            },
            averageConfidence: { $avg: "$confidence" }
          }
        }
      ]).toArray();

      return stats[0] || {
        totalChecks: 0,
        fraudDetected: 0,
        averageConfidence: 0
      };
    } catch (error) {
      console.error("Error fetching fraud stats:", error);
      throw error;
    }
  }

  // Search functions
  static async searchCustomers(query: string, limit: number = 20): Promise<Customer[]> {
    try {
      return await customersCollection
        .find({
          $or: [
            { email: { $regex: query, $options: 'i' } },
            { name: { $regex: query, $options: 'i' } }
          ]
        })
        .limit(limit)
        .toArray();
    } catch (error) {
      console.error("Error searching customers:", error);
      throw error;
    }
  }

  static async searchTransactions(query: string, limit: number = 20): Promise<Transaction[]> {
    try {
      return await transactionsCollection
        .find({
          $or: [
            { transaction_id: { $regex: query, $options: 'i' } },
            { email: { $regex: query, $options: 'i' } }
          ]
        })
        .limit(limit)
        .toArray();
    } catch (error) {
      console.error("Error searching transactions:", error);
      throw error;
    }
  }
}

// Initialize payment_intelligence database connection
export async function connectPaymentIntelligenceDB() {
  try {
    // Check if already connected by testing the database
    try {
      await paymentIntelligenceDB.admin().ping();
      console.log("Already connected to MongoDB - payment_intelligence database");
      return;
    } catch (pingError) {
      // Not connected, proceed to connect
      console.log("Database not connected, establishing connection...", pingError instanceof Error ? pingError.message : 'Unknown ping error');
    }
    
    await paymentIntelligenceClient.connect();
    console.log("Connected to MongoDB - payment_intelligence database");
    
    // Test the connection by doing a simple operation
    await paymentIntelligenceDB.admin().ping();
    console.log("MongoDB connection test successful");
    
  } catch (error) {
    console.error("Failed to connect to payment_intelligence MongoDB:", error);
    // Try to close any partial connections
    try {
      await paymentIntelligenceClient.close();
    } catch (closeError) {
      console.error("Error closing connection after failed connect:", closeError);
    }
    throw error;
  }
}

// Close payment_intelligence database connection
export async function closePaymentIntelligenceDB() {
  try {
    await paymentIntelligenceClient.close();
    console.log("Disconnected from payment_intelligence MongoDB");
  } catch (error) {
    console.error("Error closing payment_intelligence MongoDB connection:", error);
    throw error;
  }
}

// Export the client for direct access if needed
export { paymentIntelligenceClient };
