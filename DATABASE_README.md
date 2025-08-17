# Payment Intelligence Database Client

This document describes the new separate database client and API endpoints for the `payment_intelligence` database. This client is separate from the existing `db/index.ts` and doesn't replace it.

## Database Configuration

The payment_intelligence database client is configured in `db/payment-intelligence.ts` and connects to the `payment_intelligence` database with the following collections:

- `customers` - Customer information and profiles
- `transactions` - Payment transaction records
- `subscriptions` - Subscription management data
- `subscription_forecasts` - Revenue forecasting data
- `fraud_results` - Fraud detection results
- `chargeback_predictions` - Chargeback prediction data

## Using Both Database Clients

You can use both the original database client and the new payment_intelligence client simultaneously:

```typescript
// Original database client (transactiqdb)
import { db as transactiqDB, connectDB, closeDB } from '@/db';

// New payment_intelligence database client
import { 
  PaymentIntelligenceDB, 
  connectPaymentIntelligenceDB, 
  closePaymentIntelligenceDB 
} from '@/db/payment-intelligence';

// Use both databases
async function useBothDatabases() {
  try {
    // Connect to both databases
    await connectDB();
    await connectPaymentIntelligenceDB();
    
    // Use original database
    const originalData = await transactiqDB.collection('your_collection').find({}).toArray();
    
    // Use payment_intelligence database
    const transactions = await PaymentIntelligenceDB.getAllTransactions(50);
    
    console.log('Original DB:', originalData);
    console.log('Payment Intelligence:', transactions);
    
  } finally {
    // Close both connections
    await closeDB();
    await closePaymentIntelligenceDB();
  }
}
```

## Payment Intelligence Database Client Usage

### Basic Usage

```typescript
import { PaymentIntelligenceDB, connectPaymentIntelligenceDB } from '@/db/payment-intelligence';

// Connect to payment_intelligence database
await connectPaymentIntelligenceDB();

// Fetch all transactions
const transactions = await PaymentIntelligenceDB.getAllTransactions(100);

// Fetch customer by email
const customer = await PaymentIntelligenceDB.getCustomerByEmail('user@example.com');

// Get transaction statistics
const stats = await PaymentIntelligenceDB.getTransactionStats();
```

### Available Methods

#### Customer Operations
- `getAllCustomers(limit, skip)` - Get paginated customers
- `getCustomerById(id)` - Get customer by ID
- `getCustomerByEmail(email)` - Get customer by email
- `getCustomersCount()` - Get total customer count
- `searchCustomers(query, limit)` - Search customers by name or email

#### Transaction Operations
- `getAllTransactions(limit, skip)` - Get paginated transactions
- `getTransactionById(id)` - Get transaction by ID
- `getTransactionsByEmail(email, limit)` - Get transactions by customer email
- `getTransactionsByStatus(status, limit)` - Get transactions by status
- `getTransactionsByDateRange(startDate, endDate)` - Get transactions within date range
- `getTransactionsCount()` - Get total transaction count
- `searchTransactions(query, limit)` - Search transactions by ID or email
- `getTransactionStats()` - Get transaction analytics

#### Subscription Operations
- `getAllSubscriptions(limit, skip)` - Get paginated subscriptions
- `getSubscriptionById(id)` - Get subscription by ID
- `getSubscriptionsByEmail(email, limit)` - Get subscriptions by customer email
- `getSubscriptionsByStatus(status, limit)` - Get subscriptions by status
- `getSubscriptionsCount()` - Get total subscription count
- `getSubscriptionStats()` - Get subscription analytics

#### Fraud Results Operations
- `getAllFraudResults(limit)` - Get paginated fraud results
- `getFraudResultsByEmail(email, limit)` - Get fraud results by customer email
- `getFraudResultsCount()` - Get total fraud results count
- `getFraudStats()` - Get fraud analytics

#### Subscription Forecasts Operations
- `getAllSubscriptionForecasts(limit)` - Get paginated forecasts
- `getSubscriptionForecastsCount()` - Get total forecasts count

#### Chargeback Predictions Operations
- `getAllChargebackPredictions(limit)` - Get paginated predictions
- `getChargebackPredictionsCount()` - Get total predictions count

## API Endpoints

### Transactions API (`/api/transactions`)

#### GET /api/transactions
Fetch transactions with optional filters:

```bash
# Get all transactions
GET /api/transactions

# Get transactions with pagination
GET /api/transactions?limit=50&skip=100

# Get transactions by email
GET /api/transactions?email=user@example.com

# Get transactions by status
GET /api/transactions?status=succeeded

# Search transactions
GET /api/transactions?search=ch_123

# Get transactions by date range
GET /api/transactions?startDate=2025-01-01&endDate=2025-01-31

# Get transaction statistics
GET /api/transactions?stats=true
```

#### POST /api/transactions
Create a new transaction:

```json
{
  "transaction_id": "ch_1234567890",
  "email": "user@example.com",
  "amount": 99.99,
  "currency": "usd",
  "gateway": "Stripe",
  "status": "succeeded",
  "payment_method": "card"
}
```

### Customers API (`/api/customers`)

#### GET /api/customers
Fetch customers with optional filters:

```bash
# Get all customers
GET /api/customers

# Get customers with pagination
GET /api/customers?limit=50&skip=100

# Get customer by email
GET /api/customers?email=user@example.com

# Search customers
GET /api/customers?search=john

# Get customer statistics
GET /api/customers?stats=true
```

#### POST /api/customers
Create a new customer:

```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "currency": "usd",
  "phone": "+1234567890"
}
```

### Subscriptions API (`/api/subscriptions`)

#### GET /api/subscriptions
Fetch subscriptions with optional filters:

```bash
# Get all subscriptions
GET /api/subscriptions

# Get subscriptions by email
GET /api/subscriptions?email=user@example.com

# Get subscriptions by status
GET /api/subscriptions?status=active

# Get subscription statistics
GET /api/subscriptions?stats=true
```

#### POST /api/subscriptions
Create a new subscription:

```json
{
  "subscription_id": "sub_1234567890",
  "email": "user@example.com",
  "gateway": "Stripe",
  "status": "active",
  "price_amount": 29.99,
  "currency": "usd",
  "interval": "month"
}
```

### Fraud Results API (`/api/fraud_results`)

#### GET /api/fraud_results
Fetch fraud results:

```bash
# Get all fraud results
GET /api/fraud_results

# Get fraud results by email
GET /api/fraud_results?email=user@example.com

# Get fraud statistics
GET /api/fraud_results?stats=true
```

#### POST /api/fraud_results
Create a new fraud result:

```json
{
  "transaction_id": "ch_1234567890",
  "email": "user@example.com",
  "fraud_detected": false,
  "confidence": 0.95,
  "reasons": ["Low risk profile"]
}
```

### Subscription Forecasts API (`/api/subscription_forecasts`)

#### GET /api/subscription_forecasts
Fetch subscription forecasts:

```bash
# Get all forecasts
GET /api/subscription_forecasts

# Get forecast statistics
GET /api/subscription_forecasts?stats=true
```

#### POST /api/subscription_forecasts
Create a new forecast:

```json
{
  "subscription_id": "sub_1234567890",
  "forecasted": true,
  "predicted_revenue": 299.99
}
```

### Chargeback Predictions API (`/api/chargeback_predictions`)

#### GET /api/chargeback_predictions
Fetch chargeback predictions:

```bash
# Get all predictions
GET /api/chargeback_predictions

# Get prediction statistics
GET /api/chargeback_predictions?stats=true
```

#### POST /api/chargeback_predictions
Create a new prediction:

```json
{
  "transaction_id": "ch_1234567890",
  "chargeback_predicted": false,
  "confidence_score": 0.02
}
```

### Dashboard API (`/api/dashboard`)

#### GET /api/dashboard
Get comprehensive dashboard data:

```bash
# Get dashboard statistics only
GET /api/dashboard

# Get dashboard statistics with recent data
GET /api/dashboard?includeData=true
```

Response includes:
- Transaction statistics (total, revenue, success rate)
- Subscription statistics (total, active, revenue)
- Fraud statistics (total checks, fraud rate)
- Customer count
- Forecast and prediction counts
- Recent data (if includeData=true)

## Utility Functions

The `utils/database-helpers.ts` file provides utility functions for:

### Data Formatting
- `formatCurrency(amount, currency)` - Format currency values
- `formatDate(date)` - Format dates consistently
- `formatPercentage(value)` - Format percentage values

### Analytics
- `getCustomerAnalytics(email)` - Get comprehensive customer analytics
- `getTransactionAnalytics(filters)` - Get transaction analytics with filters
- `getSubscriptionAnalytics(filters)` - Get subscription analytics with filters

### Search
- `searchAllCollections(query, limit)` - Search across all collections

### Validation
- `validateEmail(email)` - Validate email format
- `validateTransactionData(data)` - Validate transaction data
- `validateCustomerData(data)` - Validate customer data
- `validateSubscriptionData(data)` - Validate subscription data

### Export
- `prepareDataForExport(data, type)` - Prepare data for CSV/Excel export

## Environment Variables

Set the following environment variable:

```env
MONGODB_URI=mongodb://localhost:27017
```

## Error Handling

All API endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message",
  "details": "Detailed error information"
}
```

## TypeScript Interfaces

The payment_intelligence database client includes TypeScript interfaces for all data models:

- `Customer` - Customer data structure
- `Transaction` - Transaction data structure
- `Subscription` - Subscription data structure
- `SubscriptionForecast` - Forecast data structure
- `FraudResult` - Fraud result data structure
- `ChargebackPrediction` - Chargeback prediction data structure

## Example Usage in Components

```typescript
// In a React component
import { useEffect, useState } from 'react';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTransactions() {
      try {
        const response = await fetch('/api/transactions?limit=50');
        const data = await response.json();
        
        if (data.success) {
          setTransactions(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch transactions:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchTransactions();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {transactions.map(transaction => (
        <div key={transaction._id}>
          {transaction.transaction_id} - {transaction.amount}
        </div>
      ))}
    </div>
  );
}
```

## Database Schema

The payment_intelligence database follows the schema shown in the provided JSON examples:

### Customers Collection
- Customer profiles with contact information
- Payment method preferences
- Account status and balance
- Metadata and tax information

### Transactions Collection
- Payment transaction details
- Risk assessment data
- Billing information
- Fraud and chargeback predictions

### Subscriptions Collection
- Subscription management data
- Billing cycle information
- Plan and pricing details
- Status tracking

### Fraud Results Collection
- Fraud detection results
- Confidence scores
- Detection reasons
- Timestamps

### Subscription Forecasts Collection
- Revenue forecasting data
- Prediction timestamps
- Forecasted amounts

### Chargeback Predictions Collection
- Chargeback risk predictions
- Confidence scores
- Transaction references

## File Structure

```
db/
├── index.ts                    # Original database client (transactiqdb)
└── payment-intelligence.ts     # New payment_intelligence database client

app/api/
├── transactions/route.ts       # Uses payment_intelligence client
├── customers/route.ts          # Uses payment_intelligence client
├── subscriptions/route.ts      # Uses payment_intelligence client
├── fraud_results/route.ts      # Uses payment_intelligence client
├── subscription_forecasts/route.ts  # Uses payment_intelligence client
├── chargeback_predictions/route.ts  # Uses payment_intelligence client
└── dashboard/route.ts          # Uses payment_intelligence client

utils/
└── database-helpers.ts         # Helper functions for payment_intelligence

examples/
└── database-usage.ts           # Examples of using both database clients
```

## Key Differences from Original Database

1. **Separate Connection**: Uses `connectPaymentIntelligenceDB()` instead of `connectDB()`
2. **Different Database**: Connects to `payment_intelligence` instead of `transactiqdb`
3. **Specialized Collections**: Focuses on payment intelligence data (transactions, customers, fraud, etc.)
4. **Enhanced Analytics**: Provides comprehensive analytics and aggregation functions
5. **Type Safety**: Full TypeScript interfaces for all data models

