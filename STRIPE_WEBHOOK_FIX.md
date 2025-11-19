# Stripe Webhook Fix - Documentation

## Problem Summary

Stripe webhooks were failing with signature verification errors:
```
No signatures found matching the expected signature for payload
```

All webhook events (payment success, subscription updates) were returning HTTP 400 errors, preventing subscriptions from being activated after successful payments.

## Root Cause

The Express middleware order was incorrect:

1. `express.json()` was applied **globally** to ALL routes in `server.ts`
2. This JSON middleware parsed and modified the request body BEFORE it reached the webhook handler
3. Stripe signature verification requires the **raw, unmodified** request body
4. When the body was already parsed by `express.json()`, the signature verification failed

## Solution

### Files Modified

1. **`backend/src/server.ts`**
   - Moved webhook routes mounting to BEFORE `express.json()` middleware
   - Webhooks now receive raw body for proper signature verification
   - Added clear comments explaining the critical ordering

2. **`backend/src/routes/index.ts`**
   - Removed webhook routes from main API router
   - Prevents duplicate mounting
   - Added comment explaining why webhooks are separate

3. **`backend/src/services/stripe.service.ts`**
   - Enhanced logging in `constructWebhookEvent()`
   - Better debugging information for webhook processing
   - Clear success/failure indicators (✅/❌)

### Middleware Order (Critical!)

```typescript
// ✅ CORRECT ORDER:
app.use(helmet());           // 1. Security
app.use(cors());             // 2. CORS
app.use(morgan());           // 3. Logging
app.use('/api/webhooks', webhookRoutes);  // 4. Webhooks (with raw body)
app.use(express.json());     // 5. JSON parsing for OTHER routes
app.use('/api', routes);     // 6. Regular API routes
```

The webhook route has its own `express.raw({ type: 'application/json' })` middleware that preserves the raw body for signature verification.

## Testing

### 1. Start the Backend Server

```bash
cd backend
npm run dev
```

### 2. Start Stripe CLI Webhook Forwarding

In a new terminal:
```bash
stripe listen --forward-to http://localhost:3001/api/webhooks/stripe
```

### 3. Trigger a Test Payment

In another terminal:
```bash
stripe trigger payment_intent.succeeded
```

Or test with a real payment flow through the frontend.

### Expected Results

**Before the fix:**
```
[400] POST http://localhost:3001/api/webhooks/stripe
❌ Failed to construct webhook event: No signatures found...
```

**After the fix:**
```
[200] POST http://localhost:3001/api/webhooks/stripe
✅ Webhook signature verified successfully for event: checkout.session.completed
Subscription activated for user: <user_id>
```

### Check Logs

Look for these success indicators in backend logs:
```
✅ Webhook signature verified successfully for event: checkout.session.completed
Processing Stripe webhook: checkout.session.completed
Subscription activated for user: xxx
```

## Verification Checklist

- [ ] Backend server starts without errors
- [ ] Stripe CLI connects and forwards events
- [ ] Test payment webhook returns 200 (not 400)
- [ ] Logs show "✅ Webhook signature verified successfully"
- [ ] Database subscription updated to "premium" tier
- [ ] Frontend dashboard shows "PREMIUM" status after payment

## Important Notes

1. **Do NOT reorder middleware** - the webhook route MUST be before `express.json()`
2. **Do NOT add webhook routes back** to `routes/index.ts` - they're mounted separately
3. **Stripe CLI webhook secret** (`whsec_...`) is for local development only
4. **Production webhook secret** will be different - get it from Stripe Dashboard

## Related Files

- `backend/src/server.ts` - Main server configuration
- `backend/src/routes/webhook.routes.ts` - Webhook routes with raw body parsing
- `backend/src/controllers/stripe.controller.ts` - Webhook handler
- `backend/src/services/stripe.service.ts` - Stripe integration logic
- `backend/src/config/index.ts` - Webhook secret configuration

## Additional Resources

- [Stripe Webhook Signature Verification](https://stripe.com/docs/webhooks/signatures)
- [Express Raw Body Parser](https://expressjs.com/en/api.html#express.raw)
- [Stripe CLI Documentation](https://stripe.com/docs/cli)
