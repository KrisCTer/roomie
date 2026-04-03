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
     │  redirect to payUrl                   │  save Payment (PENDING)                           │
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
```

## Jira Tickets

| Ticket | Title | Status |
|--------|-------|--------|
| ROOMIE-5 | Thanh toán tiền thuê phòng bằng MoMo | ✅ Done |
| ROOMIE-7 / BE-01 | Tạo API khởi tạo thanh toán MoMo | ✅ Done |
| ROOMIE-12 / BE-02 | Xử lý callback từ MoMo | ✅ Done |
| ROOMIE-14 / BE-03 | API kiểm tra trạng thái thanh toán | ✅ Done |
| ROOMIE-15 / FE-01 | Trang thanh toán (tích hợp MoMo) | ✅ Done |

## Backend — payment-service (port 8087)

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/payment` | Create payment → returns payUrl |
| GET | `/payment/{id}` | Check payment status |
| GET | `/payment/momo/return` | MoMo redirect handler (user return) |
| POST | `/payment/webhook/momo` | MoMo IPN webhook (server-to-server) |

### Security

- HMAC-SHA256 signature verification on all MoMo webhooks
- Constant-time comparison to prevent timing attacks
- Idempotent callback handling

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

### Payment Flow

1. User views bill → clicks "Thanh toán"
2. PaymentModal appears → user selects "MoMo"
3. Frontend calls `POST /payment` with `method: "MOMO"`
4. Backend returns `paymentUrl` → frontend redirects to MoMo
5. User completes payment on MoMo
6. MoMo redirects to `/payment-result?status=success&paymentId=xxx`

## Event-Driven Integration

On payment completion, Kafka events are published:
- `payment.completed` → billing-service marks bill as PAID
- `payment.completed` → contract-service marks payment as completed
