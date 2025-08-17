import { NextRequest, NextResponse } from 'next/server';
import { PaymentIntelligenceDB, connectPaymentIntelligenceDB, chargebackPredictionsCollection } from '@/db/payment-intelligence';

export async function GET(request: NextRequest) {
  try {
    await connectPaymentIntelligenceDB();
    
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const stats = searchParams.get('stats');

    // Get statistics if requested
    if (stats === 'true') {
      const totalCount = await PaymentIntelligenceDB.getChargebackPredictionsCount();
      
      return NextResponse.json({
        success: true,
        stats: {
          totalPredictions: totalCount
        },
        totalCount
      });
    }

    // Get all chargeback predictions
    const predictions = await PaymentIntelligenceDB.getAllChargebackPredictions(limit);
    const totalCount = await PaymentIntelligenceDB.getChargebackPredictionsCount();

    return NextResponse.json({
      success: true,
      data: predictions,
      totalCount,
      limit
    });

  } catch (error) {
    console.error('Error in chargeback predictions API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch chargeback predictions',
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
    if (!body.transaction_id) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: transaction_id' 
        },
        { status: 400 }
      );
    }

    // Add defaults
    const predictionData = {
      ...body,
      chargeback_predicted: body.chargeback_predicted ?? false,
      confidence_score: body.confidence_score ?? 0
    };

    const result = await chargebackPredictionsCollection.insertOne(predictionData);

    return NextResponse.json({
      success: true,
      data: { _id: result.insertedId, ...predictionData }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating chargeback prediction:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create chargeback prediction',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
