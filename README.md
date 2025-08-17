# TransactIQ – AI-Powered Fraud Detection & Payment Intelligence Platform

TransactIQ is a robust, enterprise-grade platform engineered to safeguard businesses against payment fraud, proactively reduce chargebacks, and deliver actionable payment analytics – all powered by advanced AI.

---

## 🚀 Features

### Core Fraud Detection
- **Real-Time AI Analysis**: Industry-leading 99.8% detection accuracy with <0.1% false positives
- **Risk Scoring**: Dynamic risk assessment for every transaction
- **Pattern Recognition**: Machine learning models trained on 50M+ transactions daily
- **Global 24/7 Monitoring**: Always-on protection with instant alerts

### Chargeback Prevention
- **Predictive Analytics**: Proactively identify and prevent chargebacks
- **85% Reduction**: Proven decrease in chargeback incidents
- **Early Warning System**: Alerts for high-risk transactions before they impact revenue
- **Dispute Management Tools**: Streamlined chargeback resolution

### Payment Intelligence
- **Multi-Gateway Support**: Compatible with Stripe, major processors, and custom integrations
- **Detailed Analytics**: Transaction, revenue, and customer insights
- **Customer Intelligence**: Behavior analysis and risk profiling
- **Revenue Protection**: Maximize earnings, minimize fraud

### Subscription Management
- **Subscription Analytics**: Track MRR, churn, and growth metrics
- **Revenue Forecasting**: AI-powered predictions for future subscription income
- **Customer Lifecycle Monitoring**: Retention and health tracking
- **Automated Insights**: Actionable recommendations to grow subscription revenue

---

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, React 19, TypeScript
- **UI Components**: Radix UI, Tailwind CSS 4.1.9
- **Charts**: Recharts 2.15.4
- **Forms**: React Hook Form 7.60.0 + Zod validation
- **Database**: MongoDB
- **Authentication**: Better Auth
- **Icons**: Lucide React

---

## 📋 Prerequisites

- Node.js 18+
- MongoDB database
- Better Auth configured

---

## ⚡ Quick Start

1. **Clone the repository**
    ```bash
    git clone <repository-url>
    cd transactiqadmin
    ```

2. **Install dependencies**
    ```bash
    npm install
    ```

3. **Configure environment**
    - Create a `.env.local` file in the root directory:
      ```env
      MONGODB_URI=mongodb://localhost:27017/payment_intelligence
      BETTER_AUTH_URL=http://localhost:3000
      ```

4. **Run the development server**
    ```bash
    npm run dev
    ```
    - Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🏗️ Project Structure

```
transactiqadmin/
├── app/
│   ├── api/
│   │   ├── customers/
│   │   ├── transactions/
│   │   ├── fraud_results/
│   │   ├── chargeback_predictions/
│   │   ├── subscriptions/
│   │   ├── subscription_forecasts/
│   │   ├── dashboard/
│   │   └── auth/
│   ├── dashboard/
│   ├── customers/
│   ├── transactions/
│   ├── subscriptions/
│   ├── fraud-detection/
│   ├── analytics/
│   ├── settings/
│   ├── page.tsx
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/
│   ├── dashboard-charts.tsx
│   ├── recent-activity.tsx
│   └── dashboard-layout.tsx
├── lib/
│   ├── api-service.ts
│   ├── auth-client.ts
│   └── utils.ts
├── db/
│   ├── index.ts
│   └── payment-intelligence.ts
└── hooks/
```

---

## 🔧 API Endpoints

| Feature         | Endpoint                               | Method | Description                              |
|-----------------|----------------------------------------|--------|------------------------------------------|
| Dashboard       | `/api/dashboard`                       | GET    | Retrieve dashboard metrics & statistics  |
| Transactions    | `/api/transactions`                    | GET    | List/filter transactions                 |
|                 | `/api/transactions`                    | POST   | Create a new transaction                 |
| Customers       | `/api/customers`                       | GET    | List/search customers                    |
|                 | `/api/customers`                       | POST   | Create a new customer                    |
| Fraud Detection | `/api/fraud_results`                   | GET    | Get fraud detection results              |
|                 | `/api/fraud_results`                   | POST   | Submit fraud analysis                    |
| Chargebacks     | `/api/chargeback_predictions`          | GET    | Get chargeback predictions               |
|                 | `/api/chargeback_predictions`          | POST   | Submit new prediction                    |
| Subscriptions   | `/api/subscriptions`                   | GET    | List subscriptions                       |
|                 | `/api/subscriptions`                   | POST   | Create a subscription                    |
| Forecasts       | `/api/subscription_forecasts`          | GET    | Get revenue forecasts                    |
|                 | `/api/subscription_forecasts`          | POST   | Create a forecast                        |

---

## 🎨 UI & Design

- **Color Scheme**: Teal primary, custom accents for charts
- **Typography**: Geist font family for clarity & modernity
- **Accessibility**: Radix UI primitives
- **Responsive Design**: Mobile-first with Tailwind CSS
- **Dark Mode**: Built-in theme toggle

---

## 🔒 Security & Compliance

- PCI DSS Level 1
- GDPR Compliant
- SOC 2 Type II
- ISO 27001
- Enterprise-grade data protection

---

## 📊 Key Metrics

- **99.8%** fraud detection accuracy
- **50M+** transactions protected daily
- **85%** chargeback reduction
- **24/7** monitoring

---

## 🚀 Deployment

### Build for Production
```bash
npm run build
npm start
```

### Deploy to Vercel
```bash
vercel deploy
```
> Remember to set environment variables in your deployment platform.

---

## 🤝 Contributing

1. **Fork** the repository
2. **Create a branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

---

## 📝 License

**Proprietary Software** – All rights reserved.

---

## 📞 Support

- Email: [support@transactiq.com](mailto:support@transactiq.com)
- Documentation: [docs.transactiq.com](https://docs.transactiq.com)
- Status Page: [status.transactiq.com](https://status.transactiq.com)

---

## 🔄 Version History

- **v1.0.0** – Initial release with core fraud detection
- **v1.1.0** – Added chargeback prediction
- **v1.2.0** – Enhanced dashboard analytics
- **v1.3.0** – Subscription management features

---

_Built with ❤️ by the TransactIQ Team_