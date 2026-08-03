import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { checkRateLimit, getClientIdentifier, RATE_LIMITS } from '@/lib/rate-limit';
import { fetchWithTimeout } from '@/lib/fetch-timeout';
import { recordPaymentAttempt } from '@/lib/payments/audit';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(req: Request) {
    try {
        // Rate limiting
        const clientId = getClientIdentifier(req);
        const rateLimitResult = checkRateLimit(`payment:${clientId}`, RATE_LIMITS.payment);

        if (!rateLimitResult.success) {
            return NextResponse.json(
                { success: false, message: 'Too many requests. Please try again later.' },
                {
                    status: 429,
                    headers: {
                        'X-RateLimit-Remaining': '0',
                        'X-RateLimit-Reset': rateLimitResult.resetIn.toString()
                    }
                }
            );
        }

        const body = await req.json();
        const { orderId, customerEmail } = body;

        if (!orderId || typeof orderId !== 'string') {
            return NextResponse.json({ success: false, message: 'Missing or invalid orderId' }, { status: 400 });
        }

        // Ensure environment variables are set
        if (!process.env.MOOLRE_API_USER || !process.env.MOOLRE_API_PUBKEY || !process.env.MOOLRE_ACCOUNT_NUMBER) {
            console.error('Missing Moolre credentials');
            return NextResponse.json({ success: false, message: 'Payment gateway temporarily unavailable' }, { status: 503 });
        }

        // SECURITY: Fetch the order from the database and use its total.
        // NEVER trust the amount from the client.
        let orderQuery = supabaseAdmin
            .from('orders')
            .select('id, order_number, total, email, payment_status, metadata');

        if (UUID_REGEX.test(orderId)) {
            orderQuery = orderQuery.eq('id', orderId);
        } else {
            orderQuery = orderQuery.eq('order_number', orderId);
        }

        const { data: order, error: orderError } = await orderQuery.single();

        if (orderError || !order) {
            console.error('[Payment] Order not found:', orderId);
            return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
        }

        // Don't allow payment for already-paid orders
        if (order.payment_status === 'paid') {
            return NextResponse.json({ success: false, message: 'Order is already paid' }, { status: 400 });
        }

        // Use the database amount, NOT the client-provided amount
        const amount = Number(order.total);
        if (!amount || amount <= 0) {
            return NextResponse.json({ success: false, message: 'Invalid order amount' }, { status: 400 });
        }

        const orderRef = order.order_number || orderId;

        const requestUrl = new URL(req.url);
        const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || requestUrl.origin).replace(/\/+$/, '');

        // Generate a unique external reference for Moolre
        const uniqueRef = `${orderRef}-R${Date.now()}`;

        // Moolre Payload
        const payload = {
            type: 1,
            amount: amount.toString(),
            email: process.env.MOOLRE_MERCHANT_EMAIL || 'admin@example.com',
            externalref: uniqueRef,
            callback: `${baseUrl}/api/payment/moolre/callback`,
            redirect: `${baseUrl}/order-success?order=${orderRef}&payment_success=true`,
            reusable: "0",
            currency: "GHS",
            accountnumber: process.env.MOOLRE_ACCOUNT_NUMBER,
            metadata: {
                customer_email: customerEmail || order.email,
                original_order_number: orderRef
            }
        };

        console.log('[Payment] Initiating for order:', orderRef, '| Amount from DB:', amount, '| Callback:', payload.callback);

        let response: Response;
        try {
            response = await fetchWithTimeout('https://api.moolre.com/embed/link', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-USER': process.env.MOOLRE_API_USER!,
                    'X-API-PUBKEY': process.env.MOOLRE_API_PUBKEY!
                },
                body: JSON.stringify(payload)
            }, 20000);
        } catch (err: any) {
            console.error('[Payment] Moolre request failed/timed out:', err?.message || err);
            return NextResponse.json({ success: false, message: 'Payment gateway timeout. Please try again.' }, { status: 504 });
        }

        const result = await response.json().catch(() => ({}));
        console.log('[Payment] Response status:', result.status, '| Has URL:', !!result.data?.authorization_url);

        if (result.status === 1 && result.data?.authorization_url) {
            // Persist the externalref we sent to Moolre so the verify endpoint
            // can look the transaction up later (Moolre indexes by this ref,
            // not by our plain order number).
            const { error: metaError } = await supabaseAdmin
                .from('orders')
                .update({
                    metadata: {
                        ...(order.metadata || {}),
                        payment_method: 'moolre',
                        moolre_external_ref: uniqueRef
                    }
                })
                .eq('id', order.id);
            if (metaError) {
                console.error('[Payment] Failed to store external ref (non-fatal):', metaError.message);
            }

            await recordPaymentAttempt({
                orderId: order.id,
                orderNumber: orderRef,
                internalReference: uniqueRef,
                amountExpected: amount,
                currency: 'GHS',
                initiationPayload: {
                    callback: payload.callback,
                    redirect: payload.redirect,
                    externalref: uniqueRef,
                },
            });

            return NextResponse.json({ success: true, url: result.data.authorization_url, reference: result.data.reference });
        } else {
            return NextResponse.json({ success: false, message: result.message || 'Failed to generate payment link' }, { status: 400 });
        }

    } catch (error: any) {
        console.error('Payment API Error:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}
