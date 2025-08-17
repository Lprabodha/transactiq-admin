import { NextRequest, NextResponse } from 'next/server';
import { PaymentIntelligenceDB, connectPaymentIntelligenceDB, fraudResultsCollection } from '@/db/payment-intelligence';

export async function GET(request: NextRequest) {
  try {
    await connectPaymentIntelligenceDB();
    
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const email = searchParams.get('email');
    const stats = searchParams.get('stats');

    // Get statistics if requested
    if (stats === 'true') {
      const fraudStats = await PaymentIntelligenceDB.getFraudStats();
      const totalCount = await PaymentIntelligenceDB.getFraudResultsCount();
      
      return NextResponse.json({
        success: true,
        stats: fraudStats,
        totalCount
      });
    }

    let fraudResults;

    // Get fraud results by email
    if (email) {
      fraudResults = await PaymentIntelligenceDB.getFraudResultsByEmail(email, limit);
    }
    // Get all fraud results
    else {
      fraudResults = await PaymentIntelligenceDB.getAllFraudResults(limit);
    }

    const totalCount = await PaymentIntelligenceDB.getFraudResultsCount();

    return NextResponse.json({
      success: true,
      data: fraudResults,
      totalCount,
      limit
    });

  } catch (error) {
    console.error('Error in fraud results API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch fraud results',
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
    if (!body.transaction_id || !body.email) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: transaction_id, email' 
        },
        { status: 400 }
      );
    }

    // Add timestamps and defaults
    const now = new Date();
    const fraudData = {
      ...body,
      timestamp: body.timestamp ? new Date(body.timestamp) : now,
      fraud_detected: body.fraud_detected ?? false,
      confidence: body.confidence ?? 0,
      reasons: body.reasons ?? []
    };

    const result = await fraudResultsCollection.insertOne(fraudData);

    return NextResponse.json({
      success: true,
      data: { _id: result.insertedId, ...fraudData }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating fraud result:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create fraud result',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
