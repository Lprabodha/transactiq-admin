import { NextRequest, NextResponse } from 'next/server';
import { PaymentIntelligenceDB, connectPaymentIntelligenceDB, transactionsCollection } from '@/db/payment-intelligence';

// Transform MongoDB document to match expected Transaction interface
function transformTransaction(doc: any): any {
  const transformed: any = {
    _id: doc._id?.toString() || doc._id,
    transaction_id: doc.transaction_id,
    email: doc.email,
    amount: doc.amount,
    currency: doc.currency,
    gateway: doc.gateway,
    status: doc.status,
    payment_method: doc.payment_method,
    card_brand: doc.card_brand,
    card_country: doc.card_country,
    fingerprint: doc.fingerprint,
    funding_type: doc.funding_type,
    three_d_secure: doc.three_d_secure,
    cvc_check: doc.cvc_check,
    address_line1_check: doc.address_line1_check,
    postal_code_check: doc.postal_code_check,
    risk_level: doc.risk_level,
    risk_score: doc.risk_score,
    seller_message: doc.seller_message,
    network_status: doc.network_status,
    outcome_type: doc.outcome_type,
    ip_address: doc.ip_address,
    billing_name: doc.billing_name,
    billing_email: doc.billing_email || doc.email,
    billing_phone: doc.billing_phone,
    // Map billing_country to billing_address_country
    billing_address_country: doc.billing_address_country || doc.billing_country,
    billing_address_line1: doc.billing_address_line1,
    billing_address_line2: doc.billing_address_line2,
    billing_address_postal_code: doc.billing_address_postal_code,
    billing_address_city: doc.billing_address_city,
    billing_address_state: doc.billing_address_state,
    refunded: doc.refunded === 1 || doc.refunded === true,
    amount_refunded: doc.amount_refunded || 0,
    disputed: doc.disputed === 1 || doc.disputed === true,
    captured: doc.captured === 1 || doc.captured === true,
    paid: doc.paid === true || doc.paid === 1,
    created_at: (() => {
      if (doc.created_at?.$date) return new Date(doc.created_at.$date).toISOString();
      if (doc.created_at instanceof Date) return doc.created_at.toISOString();
      if (typeof doc.created_at === 'string') return doc.created_at;
      return doc.created_at || new Date().toISOString();
    })(),
    updated_at: (() => {
      if (doc.updated_at?.$date) return new Date(doc.updated_at.$date).toISOString();
      if (doc.updated_at instanceof Date) return doc.updated_at.toISOString();
      if (typeof doc.updated_at === 'string') return doc.updated_at;
      return doc.updated_at || new Date().toISOString();
    })(),
  };

  // Extract chargeback info - prioritize top-level, then recommendations
  if (doc.chargeback_confidence !== undefined || doc.chargeback_predicted !== undefined) {
    transformed.chargeback_confidence = doc.chargeback_confidence || 0;
    transformed.chargeback_predicted = doc.chargeback_predicted === 1 || doc.chargeback_predicted === true || false;
  } else if (doc.recommendations?.risk_assessment?.chargeback) {
    const chargeback = doc.recommendations.risk_assessment.chargeback;
    transformed.chargeback_confidence = chargeback.confidence || 0;
    transformed.chargeback_predicted = chargeback.predicted === 1 || chargeback.predicted === true || false;
  } else {
    transformed.chargeback_confidence = 0;
    transformed.chargeback_predicted = false;
  }

  // Transform recommendations structure if it exists
  if (doc.recommendations) {
    const rec = doc.recommendations;

    // Transform recommendations structure to match expected format
    transformed.recommendations = {
      transaction_id: rec.transaction_id || doc.transaction_id,
      created_at: rec.created_at || transformed.created_at,
      priority: rec.overall_priority || rec.priority || 'low',
      summary: {
        fraud_detected: rec.risk_assessment?.fraud?.detected === 1 || rec.risk_assessment?.fraud?.detected === true ? 1 : 0,
        fraud_confidence: rec.risk_assessment?.fraud?.confidence || 0,
        fraud_level: rec.risk_assessment?.fraud?.level || 'low',
        chargeback_predicted: rec.risk_assessment?.chargeback?.predicted === 1 || rec.risk_assessment?.chargeback?.predicted === true ? 1 : 0,
        chargeback_confidence: rec.risk_assessment?.chargeback?.confidence || 0,
        amount: rec.amount_context?.amount || doc.amount,
        currency: rec.amount_context?.currency || doc.currency,
      },
      reasons: rec.insights || [],
      recommended_actions: [
        ...(rec.risk_assessment?.fraud?.recommendations || []),
        ...(rec.risk_assessment?.chargeback?.recommendations || []),
        ...(rec.action_plan?.immediate_actions?.actions || []),
        ...(rec.action_plan?.short_term_actions?.actions || []),
        ...(rec.action_plan?.medium_term_actions?.actions || []),
        ...(rec.action_plan?.long_term_actions?.actions || []),
        ...(rec.action_plan?.monitoring_actions?.actions || []),
      ],
      ttl_days: rec.ttl_days || 30,
    };
  }

  return transformed;
}

export async function GET(request: NextRequest) {
  try {
    await connectPaymentIntelligenceDB();
    
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const skip = parseInt(searchParams.get('skip') || '0');
    const email = searchParams.get('email');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const stats = searchParams.get('stats');

    // Get statistics if requested
    if (stats === 'true') {
      const transactionStats = await PaymentIntelligenceDB.getTransactionStats();
      const totalCount = await PaymentIntelligenceDB.getTransactionsCount();
      
      return NextResponse.json({
        success: true,
        stats: transactionStats,
        totalCount
      });
    }

    let transactions;

    // Search transactions
    if (search) {
      transactions = await PaymentIntelligenceDB.searchTransactions(search, limit);
    }
    // Get transactions by email
    else if (email) {
      transactions = await PaymentIntelligenceDB.getTransactionsByEmail(email, limit);
    }
    // Get transactions by status
    else if (status) {
      transactions = await PaymentIntelligenceDB.getTransactionsByStatus(status, limit);
    }
    // Get transactions by date range
    else if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      transactions = await PaymentIntelligenceDB.getTransactionsByDateRange(start, end);
    }
    // Get all transactions with pagination
    else {
      transactions = await PaymentIntelligenceDB.getAllTransactions(limit, skip);
    }

    const totalCount = await PaymentIntelligenceDB.getTransactionsCount();

    // Transform transactions to match expected interface
    const transformedTransactions = transactions.map(transformTransaction);

    return NextResponse.json({
      success: true,
      data: transformedTransactions,
      totalCount,
      limit,
      skip
    });

  } catch (error) {
    console.error('Error in transactions API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch transactions',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectPaymentIntelligenceDB();
    
    const body = await request.json();
    
    // Validate required fields
    if (!body.transaction_id || !body.email || !body.amount) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: transaction_id, email, amount' 
        },
        { status: 400 }
      );
    }

    // Add timestamps
    const now = new Date();
    const transactionData = {
      ...body,
      created_at: body.created_at ? new Date(body.created_at) : now,
      updated_at: now
    };

    const result = await transactionsCollection.insertOne(transactionData);

    return NextResponse.json({
      success: true,
      data: { _id: result.insertedId, ...transactionData }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create transaction',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await connectPaymentIntelligenceDB();
    
    const body = await request.json();
    const { transaction_id, action, notes, retrain_model } = body;
    
    // Validate required fields
    if (!transaction_id || !action) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: transaction_id, action' 
        },
        { status: 400 }
      );
    }

    if (!['mark_safe', 'mark_fraud'].includes(action)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid action. Must be "mark_safe" or "mark_fraud"' 
        },
        { status: 400 }
      );
    }

    const now = new Date();
    const updateData: any = {
      updated_at: now,
      manual_review: {
        reviewed: true,
        reviewed_at: now,
        marked_as: action === 'mark_safe' ? 'safe' : 'fraud',
        notes: notes || '',
        retrain_model: retrain_model !== false
      }
    };

    // Update fraud-related fields based on action
    if (action === 'mark_fraud') {
      updateData.fraud_detected = true;
      updateData.risk_level = 'high';
      updateData.risk_score = Math.max(updateData.risk_score || 0, 90);
    } else {
      updateData.fraud_detected = false;
      updateData.risk_level = 'low';
      updateData.risk_score = Math.min(updateData.risk_score || 0, 10);
    }

    const result = await transactionsCollection.updateOne(
      { transaction_id },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Transaction not found' 
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Transaction marked as ${action === 'mark_safe' ? 'safe' : 'fraud'} successfully`,
      data: { transaction_id, ...updateData }
    });

  } catch (error) {
    console.error('Error updating transaction:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update transaction',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
