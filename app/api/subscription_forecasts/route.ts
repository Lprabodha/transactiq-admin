import { NextRequest, NextResponse } from 'next/server';
import { PaymentIntelligenceDB, connectPaymentIntelligenceDB, subscriptionForecastsCollection } from '@/db/payment-intelligence';

export async function GET(request: NextRequest) {
  try {
    await connectPaymentIntelligenceDB();
    
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const stats = searchParams.get('stats');

    // Get statistics if requested
    if (stats === 'true') {
      const totalCount = await PaymentIntelligenceDB.getSubscriptionForecastsCount();
      
      return NextResponse.json({
        success: true,
        stats: {
          totalForecasts: totalCount
        },
        totalCount
      });
    }

    // Get all subscription forecasts
    const forecasts = await PaymentIntelligenceDB.getAllSubscriptionForecasts(limit);
    const totalCount = await PaymentIntelligenceDB.getSubscriptionForecastsCount();

    return NextResponse.json({
      success: true,
      data: forecasts,
      totalCount,
      limit
    });

  } catch (error) {
    console.error('Error in subscription forecasts API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch subscription forecasts',
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
    if (!body.subscription_id) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: subscription_id' 
        },
        { status: 400 }
      );
    }

    // Add timestamps and defaults
    const now = new Date();
    const forecastData = {
      ...body,
      forecasted_at: body.forecasted_at ? new Date(body.forecasted_at) : now,
      forecasted: body.forecasted ?? true,
      predicted_revenue: body.predicted_revenue ?? 0
    };

    const result = await subscriptionForecastsCollection.insertOne(forecastData);

    return NextResponse.json({
      success: true,
      data: { _id: result.insertedId, ...forecastData }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating subscription forecast:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create subscription forecast',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
