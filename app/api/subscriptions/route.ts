import { NextRequest, NextResponse } from 'next/server';
import { PaymentIntelligenceDB, connectPaymentIntelligenceDB, subscriptionsCollection } from '@/db/payment-intelligence';

export async function GET(request: NextRequest) {
    try {
        await connectPaymentIntelligenceDB();

        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '100');
        const skip = parseInt(searchParams.get('skip') || '0');
        const email = searchParams.get('email');
        const status = searchParams.get('status');
        const stats = searchParams.get('stats');

        // Get statistics if requested
        if (stats === 'true') {
            const subscriptionStats = await PaymentIntelligenceDB.getSubscriptionStats();
            const totalCount = await PaymentIntelligenceDB.getSubscriptionsCount();

            return NextResponse.json({
                success: true,
                stats: subscriptionStats,
                totalCount
            });
        }

        let subscriptions;

        // Get subscriptions by email
        if (email) {
            subscriptions = await PaymentIntelligenceDB.getSubscriptionsByEmail(email, limit);
        }
        // Get subscriptions by status
        else if (status) {
            subscriptions = await PaymentIntelligenceDB.getSubscriptionsByStatus(status, limit);
        }
        // Get all subscriptions with pagination
        else {
            subscriptions = await PaymentIntelligenceDB.getAllSubscriptions(limit, skip);
        }

        const totalCount = await PaymentIntelligenceDB.getSubscriptionsCount();

        return NextResponse.json({
            success: true,
            data: subscriptions,
            totalCount,
            limit,
            skip
        });

    } catch (error) {
        console.error('Error in subscriptions API:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch subscriptions',
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
        if (!body.subscription_id || !body.email || !body.gateway || !body.status) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Missing required fields: subscription_id, email, gateway, status'
                },
                { status: 400 }
            );
        }

        // Add timestamps and defaults
        const now = new Date();
        const subscriptionData = {
            ...body,
            created_at: body.created_at ? new Date(body.created_at) : now,
            current_period_start: body.current_period_start ? new Date(body.current_period_start) : now,
            current_period_end: body.current_period_end ? new Date(body.current_period_end) : now,
            billing_cycle_anchor: body.billing_cycle_anchor ? new Date(body.billing_cycle_anchor) : now,
            canceled_at: body.canceled_at ? new Date(body.canceled_at) : null,
            ended_at: body.ended_at ? new Date(body.ended_at) : null,
            trial_start: body.trial_start ? new Date(body.trial_start) : null,
            trial_end: body.trial_end ? new Date(body.trial_end) : null,
            cancel_at_period_end: body.cancel_at_period_end ?? false,
            quantity: body.quantity ?? 1,
            metadata: body.metadata ?? {},
            price_amount: body.price_amount ?? 0,
            currency: body.currency ?? 'usd',
            interval: body.interval ?? 'month'
        };

        const result = await subscriptionsCollection.insertOne(subscriptionData);

        return NextResponse.json({
            success: true,
            data: { _id: result.insertedId, ...subscriptionData }
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating subscription:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to create subscription',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
