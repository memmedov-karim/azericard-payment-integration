# azericard-payment-integration

ABB/AzeriCard payment form generator and signature utilities.

## Install

```bash
npm install azericard-payment-integration
```

## Usage

```ts
import {
  AzericardPaymentClient,
  generatePaymentForm,
  AZERICARD_PROD_URL,
} from "azericard-payment-integration";

const client = new AzericardPaymentClient({
  merchantName: "Acme LLC",
  merchantEmail: "pay@acme.az",
  terminal: "17204591",
  keys: {
    privateKey: { type: "path", value: "./keys/private.pem" },
    publicKey: { type: "path", value: "./keys/public.pem" },
  },
});

const payment = await client.createPayment({
  order: "ORDER-123",
  amount: "1.00",
  successUrl: "https://example.com/payment/success",
});

const html = generatePaymentForm(payment, { actionUrl: AZERICARD_PROD_URL });
```

### Key sources

```ts
import { AzericardPaymentClient } from "azericard-payment-integration";

const client = new AzericardPaymentClient({
  merchantName: "Acme LLC",
  merchantEmail: "pay@acme.az",
  terminal: "17204591",
  keys: {
    privateKey: { type: "pem", value: process.env.AZERICARD_PRIVATE_KEY! },
    publicKey: { type: "pem", value: process.env.AZERICARD_PUBLIC_KEY! },
  },
});
```

### Verify callback signature

```ts
const isValid = await client.verifyResponseSignature(
  {
    amount: "1.00",
    terminal: "17204591",
    approval: "123456",
    rrn: "987654321",
    intRef: "ABCD1234",
  },
  response.P_SIGN
);
```
