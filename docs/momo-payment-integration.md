# MoMo Payment Integration — Roomie

## Overview

This document describes the MoMo payment integration in the Roomie platform,
enabling tenants to pay rent and bills via the MoMo e-wallet.

## Architecture

```
┌──────────┐     POST /payment      ┌─────────────────┐     POST /v2/gateway/api/create    ┌──────────┐
│ Frontend │ ──────────────────────► │ payment-service │ ──────────────────────────────────► │ MoMo API │
│ (React)  │                        │  (Spring Boot)  │                                     │          │
│          │ ◄── payUrl redirect ── │                 │ ◄──────── payUrl response ────────── │          │
└──────────┘                        └────────┬────────┘                                     └────┬─────┘
     │                                       │                                                   │
     │  redirect to payUrl                   │  save Payment (PENDING)                          │
     ▼                                       ▼                                                   │
┌──────────┐                        ┌─────────────────┐                                         │
│ MoMo App │                        │    MongoDB      │                                         │
│ / Web    │                        │   (payments)    │                                         │
└────┬─────┘                        └────────┬────────┘                                         │
     │                                       │                                                   │
     │ user completes payment                │                                                   │
     ▼                                       ▼                                                   │
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ Callbacks:                                                                                       │
│  1. GET /payment/momo/return    — redirect user to /payment-result?status=success               │
│  2. POST /payment/webhook/momo  — server IPN, verify signature, update status → COMPLETED       │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────┐     Kafka: payment.completed     ┌─────────────────────┐
│ payment-service │ ──────────────────────────────► │ billing-service      │
│                 │                                  │ contract-service     │
│                 │                                  │ notification-service │
└─────────────────┘                                  └─────────────────────┘
```

## Jira Tickets

| Ticket | Title | Status |
|--------|-------|--------|
| ROOMIE-1 | Epic: Thanh toán tiền thuê phòng bằng MoMo | ✅ Done |
| ROOMIE-7 / BE-01 | Tạo API khởi tạo thanh toán MoMo | ✅ Done |
| ROOMIE-12 / BE-02 | Xử lý callback từ MoMo | ✅ Done |
| ROOMIE-7 / BE-03 | API kiểm tra trạng thái thanh toán | ✅ Done |
| ROOMIE-7 / FE-01 | Trang thanh toán (tích hợp MoMo) | ✅ Done |

## Backend — payment-service (port 8087)

### Key Files

| File | Purpose |
|------|---------|
| `MoMoService.java` | MoMo API integration (create payment URL, verify webhook signature) |
| `PaymentService.java` | Business logic (create payment, handle callbacks, idempotency) |
| `PaymentController.java` | REST endpoints (POST /payment, GET /{id}, webhook handlers) |
| `Payment.java` | MongoDB entity (payments collection) |
| `PaymentResponse.java` | Client-facing response DTO |

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/payment` | Create payment → returns payUrl |
| GET | `/payment/{id}` | Check payment status |
| GET | `/payment/momo/return` | MoMo redirect handler (user return) |
| POST | `/payment/webhook/momo` | MoMo IPN webhook (server-to-server) |
| GET | `/payment/webhook/vnpay` | VNPay callback handler |

### Security

- **HMAC-SHA256 signature** verification on all MoMo webhooks
- **Constant-time comparison** (`MessageDigest.isEqual`) to prevent timing attacks
- **Dual signature format** support (with/without accessKey) for MoMo API compatibility
- **Idempotent callback handling** — duplicate callbacks are safely ignored

### Environment Variables

```yaml
momo:
  partnerCode: ${MOMO_PARTNER_CODE}
  accessKey: ${MOMO_ACCESS_KEY}
  secretKey: ${MOMO_SECRET_KEY}
  returnUrl: ${MOMO_RETURN_URL:http://localhost:3000/payment-result}
  notifyUrl: ${MOMO_NOTIFY_URL:http://localhost:8087/payment/webhook/momo}
```

## Frontend — React 19

### Key Files

| File | Purpose |
|------|---------|
| `paymentService.js` | API calls to payment-service |
| `useBillDetail.js` | Hook handling payment flow (create → redirect → result) |
| `PaymentModal.jsx` | Modal for selecting payment method (MoMo/VNPay/Cash) |
| `PaymentResult.jsx` | Success/failure page after payment gateway redirect |
| `BillDetail.jsx` | Bill detail page with "Pay" button |

### Payment Flow (User Journey)

1. User views bill → clicks "Thanh toán"
2. PaymentModal appears → user selects "MoMo"
3. Frontend calls `POST /payment` with `method: "MOMO"`
4. Backend returns `paymentUrl` → frontend redirects to MoMo
5. User completes payment on MoMo
6. MoMo redirects to `/payment-result?status=success&paymentId=xxx`
7. PaymentResult page shows transaction details

## Event-Driven Integration

On successful payment, the following Kafka events are published:

- `payment.completed` → billing-service marks bill as PAID
- `payment.completed` → contract-service marks contract payment as completed
- `payment.failed` → logged for monitoring
