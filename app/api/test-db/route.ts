import { NextRequest, NextResponse } from 'next/server';
import { connectPaymentIntelligenceDB, paymentIntelligenceDB } from '@/db/payment-intelligence';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing database connection...');
    
    // Test database connection
    await connectPaymentIntelligenceDB();
    
    // Test basic database operations
    const adminDb = paymentIntelligenceDB.admin();
    const pingResult = await adminDb.ping();
    
    // Get collection names to verify database exists
    const collections = await paymentIntelligenceDB.listCollections().toArray();
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      ping: pingResult,
      collections: collections.map(col => col.name),
      database: paymentIntelligenceDB.databaseName
    });

  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Database connection failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
