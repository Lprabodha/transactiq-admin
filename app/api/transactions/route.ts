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
