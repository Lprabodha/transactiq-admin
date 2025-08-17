# Data Seeding Script

This script populates the `payment_intelligence` database with realistic sample data for testing and development purposes.

## What it does

The seeding script generates:
- **200 sample transactions** with realistic amounts, risk scores, and dates
- **50 sample customers** with various locations and balances
- **100 sample fraud results** with detection rates and confidence scores
- **30 sample subscriptions** with different statuses and pricing
- **50 sample chargeback predictions** with confidence scores
- **20 sample subscription forecasts** with revenue predictions

## How to run

1. **Install dependencies** (if not already installed):
   ```bash
   pnpm install
   ```

2. **Run the seeding script**:
   ```bash
   pnpm seed
   ```

3. **Verify the data**:
   - Check your MongoDB database
   - Refresh your dashboard to see the charts populated with data

## What you'll see

After running the script, your dashboard will display:
- **Fraud Trend Chart**: Shows fraud detection rates over time
- **Risk by Gateway Chart**: Displays risk level distribution across payment gateways
- **Transaction Volume Chart**: Shows daily transaction volumes
- **Chargeback Prediction Chart**: Displays payment method distribution
- **Dashboard Stats**: Real numbers for transactions, fraud alerts, and revenue

## Database collections

The script populates these collections:
- `transactions` - Payment transaction data
- `customers` - Customer information
- `fraud_results` - Fraud detection results
- `subscriptions` - Subscription data
- `chargeback_predictions` - Chargeback risk predictions
- `subscription_forecasts` - Revenue forecasts

## Customization

You can modify the `scripts/seed-data.ts` file to:
- Change the number of records generated
- Adjust date ranges
- Modify risk score distributions
- Change payment gateway distributions
- Customize fraud detection rates

## Troubleshooting

If you encounter issues:
1. Ensure MongoDB is running
2. Check your connection string in environment variables
3. Verify the database name is `payment_intelligence`
4. Check console logs for error messages

## Resetting data

To clear all data and start fresh:
```bash
pnpm seed
```

The script automatically clears existing data before inserting new sample data.
