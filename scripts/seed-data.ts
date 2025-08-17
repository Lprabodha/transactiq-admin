import { MongoClient } from 'mongodb';
import { PaymentIntelligenceDB, connectPaymentIntelligenceDB } from '../db/payment-intelligence';

// Sample data generation functions
function generateSampleTransactions(count: number = 100) {
  const transactions = [];
  const gateways = ['Stripe', 'PayPal', 'Square'];
  const statuses = ['succeeded', 'failed', 'pending'];
  const paymentMethods = ['card', 'digital_wallet'];
  const cardBrands = ['visa', 'mastercard', 'amex'];
  const countries = ['US', 'CA', 'GB', 'DE', 'FR', 'AU'];
  
  for (let i = 0; i < count; i++) {
    // Generate dates within the last 30 days
    const daysAgo = Math.floor(Math.random() * 30);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    
    const amount = Math.floor(Math.random() * 1000) + 10; // $10 to $1010
    const riskScore = Math.floor(Math.random() * 100); // 0 to 100
    
    transactions.push({
      transaction_id: `ch_${Math.random().toString(36).substr(2, 9)}`,
      email: `customer${i + 1}@example.com`,
      amount: amount,
      currency: 'usd',
      gateway: gateways[Math.floor(Math.random() * gateways.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      payment_method: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
      card_brand: cardBrands[Math.floor(Math.random() * cardBrands.length)],
      card_country: countries[Math.floor(Math.random() * countries.length)],
      fingerprint: Math.random().toString(36).substr(2, 8),
      funding_type: Math.random() > 0.5 ? 'credit' : 'debit',
      three_d_secure: null,
      cvc_check: 'pass',
      address_line1_check: 'pass',
      postal_code_check: 'pass',
      risk_level: riskScore < 30 ? 'low' : riskScore < 70 ? 'medium' : 'high',
      risk_score: riskScore,
      seller_message: 'Payment complete.',
      network_status: 'approved_by_network',
      outcome_type: 'authorized',
      ip_address: countries[Math.floor(Math.random() * countries.length)],
      billing_name: `Customer ${i + 1}`,
      billing_email: `customer${i + 1}@example.com`,
      billing_phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      billing_address_country: countries[Math.floor(Math.random() * countries.length)],
      billing_address_line1: `${Math.floor(Math.random() * 9999)} Main St`,
      billing_address_line2: null,
      billing_address_postal_code: `${Math.floor(Math.random() * 99999) + 10000}`,
      billing_address_city: 'City',
      billing_address_state: 'State',
      refunded: false,
      amount_refunded: 0,
      disputed: false,
      captured: true,
      paid: true,
      created_at: date.toISOString(),
      chargeback_confidence: Math.random(),
      chargeback_predicted: Math.random() > 0.8,
      updated_at: date.toISOString()
    });
  }
  
  return transactions;
}

function generateSampleCustomers(count: number = 50) {
  const customers = [];
  const countries = ['US', 'CA', 'GB', 'DE', 'FR', 'AU'];
  
  for (let i = 0; i < count; i++) {
    const daysAgo = Math.floor(Math.random() * 365);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    
    customers.push({
      email: `customer${i + 1}@example.com`,
      name: `Customer ${i + 1}`,
      phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      currency: 'usd',
      country: countries[Math.floor(Math.random() * countries.length)],
      address_line1: `${Math.floor(Math.random() * 9999)} Main St`,
      address_line2: null,
      city: 'City',
      state: 'State',
      postal_code: `${Math.floor(Math.random() * 99999) + 10000}`,
      created_at: date.toISOString(),
      delinquent: Math.random() > 0.9,
      default_payment_method: `pm_${Math.random().toString(36).substr(2, 9)}`,
      balance: Math.floor(Math.random() * 1000) - 500, // -$500 to $500
      tax_info: {
        tax_id: null,
        type: null
      },
      metadata: {
        onboarding_funnel: '1',
        type: '0',
        user_email: `customer${i + 1}@example.com`,
        user_id: (i + 1).toString()
      },
      invoice_prefix: Math.random().toString(36).substr(2, 8).toUpperCase(),
      gateway_customer_ids: {
        stripe: `cus_${Math.random().toString(36).substr(2, 9)}`
      }
    });
  }
  
  return customers;
}

function generateSampleFraudResults(count: number = 100) {
  const fraudResults = [];
  
  for (let i = 0; i < count; i++) {
    const daysAgo = Math.floor(Math.random() * 30);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    
    const fraudDetected = Math.random() > 0.7;
    const confidence = Math.random();
    
    fraudResults.push({
      transaction_id: `ch_${Math.random().toString(36).substr(2, 9)}`,
      email: `customer${Math.floor(Math.random() * 50) + 1}@example.com`,
      fraud_detected: fraudDetected,
      confidence: confidence,
      reasons: fraudDetected ? [
        'High risk country',
        'Unusual transaction pattern',
        'Suspicious IP address'
      ].slice(0, Math.floor(Math.random() * 3) + 1) : [],
      timestamp: date.toISOString()
    });
  }
  
  return fraudResults;
}

function generateSampleSubscriptions(count: number = 30) {
  const subscriptions = [];
  const statuses = ['active', 'canceled', 'past_due'];
  
  for (let i = 0; i < count; i++) {
    const daysAgo = Math.floor(Math.random() * 365);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const priceAmount = [9.99, 19.99, 29.99, 49.99, 99.99][Math.floor(Math.random() * 5)];
    
    subscriptions.push({
      subscription_id: `sub_${Math.random().toString(36).substr(2, 9)}`,
      email: `customer${Math.floor(Math.random() * 50) + 1}@example.com`,
      gateway: 'Stripe',
      status: status,
      current_period_start: date.toISOString(),
      current_period_end: new Date(date.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      plan_id: `price_${Math.random().toString(36).substr(2, 9)}`,
      plan_name: `Plan ${Math.floor(Math.random() * 5) + 1}`,
      product_id: `prod_${Math.random().toString(36).substr(2, 9)}`,
      price_amount: priceAmount,
      currency: 'usd',
      interval: 'month',
      created_at: date.toISOString(),
      cancel_at_period_end: false,
      canceled_at: status === 'canceled' ? new Date(date.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString() : null,
      ended_at: status === 'canceled' ? new Date(date.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString() : null,
      trial_start: null,
      trial_end: null,
      quantity: 1,
      metadata: {},
      latest_invoice: `in_${Math.random().toString(36).substr(2, 9)}`,
      collection_method: 'charge_automatically',
      default_payment_method: `pm_${Math.random().toString(36).substr(2, 9)}`,
      billing_cycle_anchor: date.toISOString()
    });
  }
  
  return subscriptions;
}

function generateSampleChargebackPredictions(count: number = 50) {
  const predictions = [];
  
  for (let i = 0; i < count; i++) {
    predictions.push({
      transaction_id: `ch_${Math.random().toString(36).substr(2, 9)}`,
      chargeback_predicted: Math.random() > 0.8,
      confidence_score: Math.random()
    });
  }
  
  return predictions;
}

function generateSampleSubscriptionForecasts(count: number = 20) {
  const forecasts = [];
  
  for (let i = 0; i < count; i++) {
    const daysAgo = Math.floor(Math.random() * 30);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    
    forecasts.push({
      subscription_id: `sub_${Math.random().toString(36).substr(2, 9)}`,
      forecasted: true,
      forecasted_at: date.toISOString(),
      predicted_revenue: Math.floor(Math.random() * 1000) + 100
    });
  }
  
  return forecasts;
}

async function seedDatabase() {
  try {
    console.log('Connecting to database...');
    await connectPaymentIntelligenceDB();
    
    console.log('Generating sample data...');
    
    // Generate sample data
    const transactions = generateSampleTransactions(200);
    const customers = generateSampleCustomers(50);
    const fraudResults = generateSampleFraudResults(100);
    const subscriptions = generateSampleSubscriptions(30);
    const chargebackPredictions = generateSampleChargebackPredictions(50);
    const subscriptionForecasts = generateSampleSubscriptionForecasts(20);
    
    console.log('Inserting sample data...');
    
    // Clear existing data
    await PaymentIntelligenceDB.clearAllCollections();
    
    // Insert new data
    await PaymentIntelligenceDB.insertManyTransactions(transactions);
    await PaymentIntelligenceDB.insertManyCustomers(customers);
    await PaymentIntelligenceDB.insertManyFraudResults(fraudResults);
    await PaymentIntelligenceDB.insertManySubscriptions(subscriptions);
    await PaymentIntelligenceDB.insertManyChargebackPredictions(chargebackPredictions);
    await PaymentIntelligenceDB.insertManySubscriptionForecasts(subscriptionForecasts);
    
    console.log('Database seeded successfully!');
    console.log(`- ${transactions.length} transactions`);
    console.log(`- ${customers.length} customers`);
    console.log(`- ${fraudResults.length} fraud results`);
    console.log(`- ${subscriptions.length} subscriptions`);
    console.log(`- ${chargebackPredictions.length} chargeback predictions`);
    console.log(`- ${subscriptionForecasts.length} subscription forecasts`);
    
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    process.exit(0);
  }
}

// Run the seeding
seedDatabase();
