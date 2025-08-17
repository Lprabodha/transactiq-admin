import { NextRequest, NextResponse } from 'next/server';
import { PaymentIntelligenceDB, connectPaymentIntelligenceDB, customersCollection } from '@/db/payment-intelligence';

export async function GET(request: NextRequest) {
    try {
        await connectPaymentIntelligenceDB();

        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '100');
        const skip = parseInt(searchParams.get('skip') || '0');
        const email = searchParams.get('email');
        const search = searchParams.get('search');
        const stats = searchParams.get('stats');

        // Get statistics if requested
        if (stats === 'true') {
            const totalCount = await PaymentIntelligenceDB.getCustomersCount();

            return NextResponse.json({
                success: true,
                stats: {
                    totalCustomers: totalCount
                },
                totalCount
            });
        }

        let customers;

        // Search customers
        if (search) {
            customers = await PaymentIntelligenceDB.searchCustomers(search, limit);
        }
        // Get customer by email
        else if (email) {
            const customer = await PaymentIntelligenceDB.getCustomerByEmail(email);
            customers = customer ? [customer] : [];
        }
        // Get all customers with pagination
        else {
            customers = await PaymentIntelligenceDB.getAllCustomers(limit, skip);
        }

        const totalCount = await PaymentIntelligenceDB.getCustomersCount();

        return NextResponse.json({
            success: true,
            data: customers,
            totalCount,
            limit,
            skip
        });

    } catch (error) {
        console.error('Error in customers API:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch customers',
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
        if (!body.email || !body.name) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Missing required fields: email, name'
                },
                { status: 400 }
            );
        }

        // Check if customer already exists
        const existingCustomer = await PaymentIntelligenceDB.getCustomerByEmail(body.email);
        if (existingCustomer) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Customer with this email already exists'
                },
                { status: 409 }
            );
        }

        // Add timestamps and defaults
        const now = new Date();
        const customerData = {
            ...body,
            created_at: body.created_at ? new Date(body.created_at) : now,
            delinquent: body.delinquent ?? false,
            balance: body.balance ?? 0,
            tax_info: body.tax_info ?? { tax_id: null, type: null },
            metadata: body.metadata ?? {},
            gateway_customer_ids: body.gateway_customer_ids ?? {}
        };

        const result = await customersCollection.insertOne(customerData);

        return NextResponse.json({
            success: true,
            data: { _id: result.insertedId, ...customerData }
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating customer:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to create customer',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
