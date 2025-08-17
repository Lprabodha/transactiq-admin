// API Service Layer for Payment Intelligence Dashboard
// This service connects all views and components to the payment_intelligence database APIs

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  details?: string;
  totalCount?: number;
  limit?: number;
  skip?: number;
}

export interface DashboardStats {
  transactions: {
    totalTransactions: number;
    totalAmount: number;
    averageAmount: number;
    successfulTransactions: number;
    failedTransactions: number;
    successRate: number;
    totalRevenue: number;
    averageTransactionValue: number;
  };
  subscriptions: {
    totalSubscriptions: number;
    activeSubscriptions: number;
    canceledSubscriptions: number;
    totalRevenue: number;
  };
  fraud: {
    totalChecks: number;
    fraudDetected: number;
    averageConfidence: number;
    fraudRate: number;
  };
  customers: {
    totalCustomers: number;
  };
  forecasts: {
    totalForecasts: number;
  };
  chargebacks: {
    totalPredictions: number;
  };
}

export interface TransactionRecommendations {
  transaction_id: string;
  created_at: string;
  priority: string;
  summary: {
    fraud_detected: number;
    fraud_confidence: number;
    fraud_level: string;
    chargeback_predicted: number;
    chargeback_confidence: number;
    amount: number;
    currency: string;
  };
  reasons: string[];
  recommended_actions: string[];
  ttl_days: number;
}

export interface Transaction {
  _id: string;
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
  created_at: string;
  chargeback_confidence: number;
  chargeback_predicted: boolean;
  updated_at: string;
  recommendations?: TransactionRecommendations;
}

export interface Customer {
  _id: string;
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
  created_at: string;
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

export interface Subscription {
  _id: string;
  subscription_id: string;
  email: string;
  gateway: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  plan_id: string;
  plan_name: string | null;
  product_id: string;
  price_amount: number;
  currency: string;
  interval: string;
  created_at: string;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
  ended_at: string | null;
  trial_start: string | null;
  trial_end: string | null;
  quantity: number;
  metadata: Record<string, any>;
  latest_invoice: string;
  collection_method: string;
  default_payment_method: string;
  billing_cycle_anchor: string;
}

export interface FraudResult {
  _id: string;
  transaction_id: string;
  email: string;
  fraud_detected: boolean;
  confidence: number;
  reasons: string[];
  timestamp: string;
}

export interface ChargebackPrediction {
  _id: string;
  transaction_id: string;
  chargeback_predicted: boolean;
  confidence_score: number;
}

export interface SubscriptionForecast {
  _id: string;
  subscription_id: string;
  forecasted: boolean;
  forecasted_at: string;
  predicted_revenue: number;
}

// API Service Class
export class ApiService {
  private static baseUrl = '/api';

  // Generic fetch method with error handling
  private static async fetchApi<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  // Dashboard API
  static async getDashboardStats(includeData: boolean = false): Promise<ApiResponse<DashboardStats>> {
    return this.fetchApi<DashboardStats>(`/dashboard?includeData=${includeData}`);
  }

  // Transactions API
  static async getTransactions(params?: {
    limit?: number;
    skip?: number;
    email?: string;
    status?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    stats?: boolean;
  }): Promise<ApiResponse<Transaction[]>> {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    return this.fetchApi<Transaction[]>(`/transactions?${searchParams.toString()}`);
  }

  static async createTransaction(transactionData: Partial<Transaction>): Promise<ApiResponse<Transaction>> {
    return this.fetchApi<Transaction>('/transactions', {
      method: 'POST',
      body: JSON.stringify(transactionData),
    });
  }

  // Customers API
  static async getCustomers(params?: {
    limit?: number;
    skip?: number;
    email?: string;
    search?: string;
    stats?: boolean;
  }): Promise<ApiResponse<Customer[]>> {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    return this.fetchApi<Customer[]>(`/customers?${searchParams.toString()}`);
  }

  static async createCustomer(customerData: Partial<Customer>): Promise<ApiResponse<Customer>> {
    return this.fetchApi<Customer>('/customers', {
      method: 'POST',
      body: JSON.stringify(customerData),
    });
  }

  // Subscriptions API
  static async getSubscriptions(params?: {
    limit?: number;
    skip?: number;
    email?: string;
    status?: string;
    stats?: boolean;
  }): Promise<ApiResponse<Subscription[]>> {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    return this.fetchApi<Subscription[]>(`/subscriptions?${searchParams.toString()}`);
  }

  static async createSubscription(subscriptionData: Partial<Subscription>): Promise<ApiResponse<Subscription>> {
    return this.fetchApi<Subscription>('/subscriptions', {
      method: 'POST',
      body: JSON.stringify(subscriptionData),
    });
  }

  // Fraud Results API
  static async getFraudResults(params?: {
    limit?: number;
    email?: string;
    stats?: boolean;
  }): Promise<ApiResponse<FraudResult[]>> {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    return this.fetchApi<FraudResult[]>(`/fraud_results?${searchParams.toString()}`);
  }

  static async createFraudResult(fraudData: Partial<FraudResult>): Promise<ApiResponse<FraudResult>> {
    return this.fetchApi<FraudResult>('/fraud_results', {
      method: 'POST',
      body: JSON.stringify(fraudData),
    });
  }

  // Chargeback Predictions API
  static async getChargebackPredictions(params?: {
    limit?: number;
    stats?: boolean;
  }): Promise<ApiResponse<ChargebackPrediction[]>> {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    return this.fetchApi<ChargebackPrediction[]>(`/chargeback_predictions?${searchParams.toString()}`);
  }

  static async createChargebackPrediction(predictionData: Partial<ChargebackPrediction>): Promise<ApiResponse<ChargebackPrediction>> {
    return this.fetchApi<ChargebackPrediction>('/chargeback_predictions', {
      method: 'POST',
      body: JSON.stringify(predictionData),
    });
  }

  // Subscription Forecasts API
  static async getSubscriptionForecasts(params?: {
    limit?: number;
    stats?: boolean;
  }): Promise<ApiResponse<SubscriptionForecast[]>> {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    return this.fetchApi<SubscriptionForecast[]>(`/subscription_forecasts?${searchParams.toString()}`);
  }

  static async createSubscriptionForecast(forecastData: Partial<SubscriptionForecast>): Promise<ApiResponse<SubscriptionForecast>> {
    return this.fetchApi<SubscriptionForecast>('/subscription_forecasts', {
      method: 'POST',
      body: JSON.stringify(forecastData),
    });
  }

  // Analytics and Search Methods
  static async searchAllCollections(query: string, limit: number = 20): Promise<ApiResponse<{
    customers: Customer[];
    transactions: Transaction[];
    subscriptions: Subscription[];
  }>> {
    const [customersRes, transactionsRes, subscriptionsRes] = await Promise.all([
      this.getCustomers({ search: query, limit }),
      this.getTransactions({ search: query, limit }),
      this.getSubscriptions({ limit }),
    ]);

    return {
      success: customersRes.success && transactionsRes.success && subscriptionsRes.success,
      data: {
        customers: customersRes.data || [],
        transactions: transactionsRes.data || [],
        subscriptions: subscriptionsRes.data || [],
      },
    };
  }

  // Utility methods for data transformation
  static formatCurrency(amount: number, currency: string = 'USD'): string {
    // Validate currency code and provide fallback
    const validCurrency = currency && currency.length === 3 ? currency.toUpperCase() : 'USD';
    
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: validCurrency,
      }).format(amount);
    } catch (error) {
      // Log the error and fallback to USD if currency is still invalid
      console.warn('Invalid currency code:', validCurrency, error);
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(amount);
    }
  }

  static formatDate(date: string | Date | null | undefined): string {
    // Handle null, undefined, or empty string
    if (!date) {
      return 'N/A';
    }

    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      console.warn('Invalid date value:', date);
      return 'Invalid Date';
    }
    
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(dateObj);
  }

  static formatPercentage(value: number): string {
    return `${(value * 100).toFixed(2)}%`;
  }

  // Risk assessment helpers
  static getRiskLevel(riskScore: number): 'low' | 'medium' | 'high' {
    if (riskScore < 30) return 'low';
    if (riskScore < 70) return 'medium';
    return 'high';
  }

  static getRiskColor(riskScore: number): string {
    if (riskScore < 30) return 'text-green-600';
    if (riskScore < 70) return 'text-yellow-600';
    return 'text-red-600';
  }

  static getStatusColor(status: string): string {
    if (!status) return 'text-gray-600'
    
    switch (status.toLowerCase()) {
      case 'succeeded':
      case 'completed':
      case 'active':
        return 'text-green-600';
      case 'pending':
        return 'text-yellow-600';
      case 'failed':
      case 'canceled':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  }

  // Location enhancement methods
  static async getEnhancedCustomerData(customer: Customer): Promise<Customer & { enhancedLocation?: string }> {
    // If customer has complete location, return as is
    if (customer.country && customer.city) {
      return {
        ...customer,
        enhancedLocation: [customer.city, customer.state, customer.country].filter(Boolean).join(', ')
      };
    }

    // If customer location is incomplete, try to get location from their transactions
    try {
      const transactionsResponse = await this.getTransactions({ 
        email: customer.email, 
        limit: 10 
      });

      if (transactionsResponse.success && transactionsResponse.data && transactionsResponse.data.length > 0) {
        // Get the most recent transaction with billing address
        const transactionWithLocation = transactionsResponse.data.find(t => 
          t.billing_address_country || t.billing_address_city
        );

        if (transactionWithLocation) {
          const enhancedLocation = [
            transactionWithLocation.billing_address_city,
            transactionWithLocation.billing_address_state,
            transactionWithLocation.billing_address_country
          ].filter(Boolean).join(', ');

          return {
            ...customer,
            enhancedLocation: enhancedLocation || 'Unknown'
          };
        }
      }
    } catch (error) {
      console.warn('Failed to fetch transaction location for customer:', customer.email, error);
    }

    return {
      ...customer,
      enhancedLocation: 'Unknown'
    };
  }

  static async getEnhancedTransactionData(transaction: Transaction): Promise<Transaction & { enhancedCustomerInfo?: Partial<Customer> }> {
    // If transaction has billing info, return as is
    if (transaction.billing_address_country && transaction.billing_address_city) {
      return transaction;
    }

    // If transaction location is incomplete, try to get customer's location
    try {
      const customersResponse = await this.getCustomers({ 
        email: transaction.email, 
        limit: 1 
      });

      if (customersResponse.success && customersResponse.data && customersResponse.data.length > 0) {
        const customer = customersResponse.data[0];
        
        return {
          ...transaction,
          enhancedCustomerInfo: {
            country: customer.country,
            city: customer.city,
            state: customer.state,
            address_line1: customer.address_line1,
            address_line2: customer.address_line2,
            postal_code: customer.postal_code,
            phone: customer.phone
          }
        };
      }
    } catch (error) {
      console.warn('Failed to fetch customer info for transaction:', transaction.email, error);
    }

    return transaction;
  }

  // Helper to get the best available location from enhanced transaction data
  static getBestLocation(transaction: Transaction & { enhancedCustomerInfo?: Partial<Customer> }): { city?: string; country?: string; state?: string } | null {
    // Priority 1: Enhanced customer location from transaction
    if (transaction.enhancedCustomerInfo?.country || transaction.enhancedCustomerInfo?.city) {
      return {
        city: transaction.enhancedCustomerInfo.city || undefined,
        state: transaction.enhancedCustomerInfo.state || undefined,
        country: transaction.enhancedCustomerInfo.country || undefined
      };
    }

    // Priority 2: Transaction billing location
    if (transaction.billing_address_country || transaction.billing_address_city) {
      return {
        city: transaction.billing_address_city || undefined,
        state: transaction.billing_address_state || undefined,
        country: transaction.billing_address_country || undefined
      };
    }

    // Priority 3: Transaction IP location (if it looks like a country code)
    if (transaction.ip_address && transaction.ip_address !== 'US' && transaction.ip_address.length === 2) {
      return {
        country: transaction.ip_address
      };
    }

    return null;
  }
}
