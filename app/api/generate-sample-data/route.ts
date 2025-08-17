import { NextRequest, NextResponse } from 'next/server';
import { connectPaymentIntelligenceDB, PaymentIntelligenceDB } from '@/db/payment-intelligence';

export async function POST(request: NextRequest) {
  try {
    await connectPaymentIntelligenceDB();
    
    // Generate sample transaction data
    const sampleTransactions = [
      {
        transaction_id: 'txn_sample_001',
        email: 'john.doe@example.com',
        amount: 99.99,
        currency: 'USD',
        gateway: 'stripe',
        status: 'succeeded',
        payment_method: 'card',
        card_brand: 'visa',
        card_country: 'US',
        fingerprint: 'fp_sample_001',
        funding_type: 'credit',
        three_d_secure: 'pass',
        cvc_check: 'pass',
        address_line1_check: 'pass',
        postal_code_check: 'pass',
        risk_level: 'low',
        risk_score: 25,
        seller_message: 'Payment completed successfully',
        network_status: 'approved_by_network',
        outcome_type: 'authorized',
        ip_address: '192.168.1.1',
        billing_name: 'John Doe',
        billing_email: 'john.doe@example.com',
        billing_phone: '+1234567890',
        billing_address_country: 'US',
        billing_address_line1: '123 Main St',
        billing_address_line2: null,
        billing_address_postal_code: '10001',
        billing_address_city: 'New York',
        billing_address_state: 'NY',
        refunded: false,
        amount_refunded: 0,
        disputed: false,
        captured: true,
        paid: true,
        created_at: new Date(),
        chargeback_confidence: 15,
        chargeback_predicted: false,
        updated_at: new Date()
      },
      {
        transaction_id: 'txn_sample_002',
        email: 'jane.smith@example.com',
        amount: 149.99,
        currency: 'USD',
        gateway: 'stripe',
        status: 'succeeded',
        payment_method: 'card',
        card_brand: 'mastercard',
        card_country: 'US',
        fingerprint: 'fp_sample_002',
        funding_type: 'credit',
        three_d_secure: null,
        cvc_check: 'pass',
        address_line1_check: 'pass',
        postal_code_check: 'pass',
        risk_level: 'medium',
        risk_score: 45,
        seller_message: 'Payment completed successfully',
        network_status: 'approved_by_network',
        outcome_type: 'authorized',
        ip_address: '192.168.1.2',
        billing_name: 'Jane Smith',
        billing_email: 'jane.smith@example.com',
        billing_phone: '+1234567891',
        billing_address_country: 'US',
        billing_address_line1: '456 Oak Ave',
        billing_address_line2: 'Apt 2B',
        billing_address_postal_code: '10002',
        billing_address_city: 'New York',
        billing_address_state: 'NY',
        refunded: false,
        amount_refunded: 0,
        disputed: false,
        captured: true,
        paid: true,
        created_at: new Date(),
        chargeback_confidence: 30,
        chargeback_predicted: false,
        updated_at: new Date()
      }
    ];

    // Generate sample customer data
    const sampleCustomers = [
      {
        email: 'john.doe@example.com',
        name: 'John Doe',
        phone: '+1234567890',
        currency: 'USD',
        country: 'US',
        address_line1: '123 Main St',
        address_line2: null,
        city: 'New York',
        state: 'NY',
        postal_code: '10001',
        created_at: new Date(),
        delinquent: false,
        default_payment_method: 'card_1234',
        balance: 0,
        tax_info: {
          tax_id: null,
          type: null
        },
        metadata: {
          onboarding_funnel: 'web',
          type: 'individual',
          user_email: 'john.doe@example.com',
          user_id: 'user_001'
        },
        invoice_prefix: 'INV',
        gateway_customer_ids: {
          stripe: 'cus_sample_001'
        }
      }
    ];

    // Generate sample fraud results
    const sampleFraudResults = [
      {
        transaction_id: 'txn_sample_001',
        email: 'john.doe@example.com',
        fraud_detected: false,
        confidence: 85.5,
        risk_factors: ['low_risk_ip', 'verified_payment_method'],
        created_at: new Date()
      },
      {
        transaction_id: 'txn_sample_002',
        email: 'jane.smith@example.com',
        fraud_detected: false,
        confidence: 72.3,
        risk_factors: ['medium_risk_score'],
        created_at: new Date()
      }
    ];

    // Insert sample data
    const results = await Promise.all([
      PaymentIntelligenceDB.insertManyTransactions(sampleTransactions),
      PaymentIntelligenceDB.insertManyCustomers(sampleCustomers),
      PaymentIntelligenceDB.insertManyFraudResults(sampleFraudResults)
    ]);

    return NextResponse.json({
      success: true,
      message: 'Sample data generated successfully',
      results: {
        transactions: results[0],
        customers: results[1],
        fraudResults: results[2]
      }
    });

  } catch (error) {
    console.error('Error generating sample data:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate sample data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
