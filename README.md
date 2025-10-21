# TransactIQ - AI-Powered Fraud Detection & Payment Intelligence

Enterprise-grade fraud detection platform that safeguards businesses against payment fraud, reduces chargebacks, and delivers actionable payment intelligence.

**Version:** 1.3.0

---

## Features

### Core Functionality
- **Fraud Detection** - Real-time AI analysis with 99.8% accuracy
- **Chargeback Prevention** - Predictive analytics to reduce chargebacks by 85%
- **Revenue Analytics** - Track MRR, ARR, churn rate, and transaction metrics
- **Customer Intelligence** - Comprehensive customer profiles and risk scoring
- **Transaction Management** - View, filter, search, and export transactions
- **Multi-Gateway Support** - Compatible with Stripe, PayPal, Square, and more

### Key Capabilities
- Real-time dashboard with 8 comprehensive metrics
- Mark transactions as safe or fraudulent with audit trail
- Export data in CSV, Excel, and PDF formats
- WCAG 2.1 AA accessibility compliance
- Enterprise-level security with input validation

---

## Installation

**Prerequisites:** Node.js 18+, MongoDB, pnpm/npm

```bash
# Clone repository
git clone git@github.com:Lprabodha/transactiq-admin.git
cd transactiq-admin

# Install dependencies
pnpm install

# Configure environment (.env.local)
MONGODB_URI=mongodb://localhost:27017/payment_intelligence
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=your-secret-key

# Run application
pnpm dev              # Development mode
pnpm build && pnpm start  # Production mode
```

Access at: [http://localhost:3000](http://localhost:3000)

---

## Technology Stack

- **Framework:** Next.js 14, React 19, TypeScript 5.x
- **Database:** MongoDB
- **UI:** Radix UI, Tailwind CSS 4.1.9, Recharts 2.15.4
- **Authentication:** Better Auth
- **Notifications:** Sonner
- **Validation:** Zod

---

## Project Structure

```
transactiq-admin/
├── app/              # Next.js pages and API routes
├── components/       # React components (UI, tables, dialogs)
├── lib/              # Utilities (API client, validation, constants)
├── db/               # Database layer (MongoDB operations)
├── hooks/            # Custom React hooks
└── utils/            # Helper functions (export, database)
```

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/dashboard` | GET | Dashboard statistics (MRR, ARR, fraud metrics) |
| `/api/transactions` | GET, POST, PATCH | Manage transactions, mark safe/fraud |
| `/api/customers` | GET, POST | Customer management |
| `/api/subscriptions` | GET, POST | Subscription data |
| `/api/fraud_results` | GET, POST | Fraud detection results |
| `/api/chargeback_predictions` | GET, POST | Chargeback predictions |

**Response Format:** All endpoints return `{ success, data, totalCount, error }`

---

## License

**Proprietary Software** – All rights reserved © 2025 TransactIQ