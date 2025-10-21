import { NextRequest, NextResponse } from 'next/server';
import { PaymentIntelligenceDB, connectPaymentIntelligenceDB, transactionsCollection } from '@/db/payment-intelligence';

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

    return NextResponse.json({
      success: true,
      data: transactions,
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
