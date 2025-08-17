import { NextRequest, NextResponse } from 'next/server';
import { PaymentIntelligenceDB, connectPaymentIntelligenceDB } from '@/db/payment-intelligence';

export async function GET(request: NextRequest) {
  try {
    await connectPaymentIntelligenceDB();
    
    const { searchParams } = new URL(request.url);
    const includeData = searchParams.get('includeData') === 'true';

    // Get all statistics
    const [
      transactionStats,
      subscriptionStats,
      fraudStats,
      customersCount,
      subscriptionForecastsCount,
      chargebackPredictionsCount
    ] = await Promise.all([
      PaymentIntelligenceDB.getTransactionStats(),
      PaymentIntelligenceDB.getSubscriptionStats(),
      PaymentIntelligenceDB.getFraudStats(),
      PaymentIntelligenceDB.getCustomersCount(),
      PaymentIntelligenceDB.getSubscriptionForecastsCount(),
      PaymentIntelligenceDB.getChargebackPredictionsCount()
    ]);

    // Get recent data if requested
    let recentData = {};
    if (includeData) {
      const [
        recentTransactions,
        recentCustomers,
        recentSubscriptions,
        recentFraudResults
      ] = await Promise.all([
        PaymentIntelligenceDB.getAllTransactions(10),
        PaymentIntelligenceDB.getAllCustomers(10),
        PaymentIntelligenceDB.getAllSubscriptions(10),
        PaymentIntelligenceDB.getAllFraudResults(10)
      ]);

      recentData = {
        recentTransactions,
        recentCustomers,
        recentSubscriptions,
        recentFraudResults
      };
    }

    // Calculate additional metrics
    const totalRevenue = transactionStats.totalAmount || 0;
    const averageTransactionValue = transactionStats.averageAmount || 0;
    const successRate = transactionStats.totalTransactions > 0 
      ? (transactionStats.successfulTransactions / transactionStats.totalTransactions) * 100 
      : 0;
    const fraudRate = fraudStats.totalChecks > 0 
      ? (fraudStats.fraudDetected / fraudStats.totalChecks) * 100 
      : 0;

    const dashboardData = {
      success: true,
      stats: {
        transactions: {
          ...transactionStats,
          successRate: Math.round(successRate * 100) / 100,
          totalRevenue: Math.round(totalRevenue * 100) / 100,
          averageTransactionValue: Math.round(averageTransactionValue * 100) / 100
        },
        subscriptions: subscriptionStats,
        fraud: {
          ...fraudStats,
          fraudRate: Math.round(fraudRate * 100) / 100,
          averageConfidence: Math.round((fraudStats.averageConfidence || 0) * 100) / 100
        },
        customers: {
          totalCustomers: customersCount
        },
        forecasts: {
          totalForecasts: subscriptionForecastsCount
        },
        chargebacks: {
          totalPredictions: chargebackPredictionsCount
        }
      },
      ...recentData
    };

    return NextResponse.json(dashboardData);

  } catch (error) {
    console.error('Error in dashboard API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch dashboard data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
