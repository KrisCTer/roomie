# n8n Workflow Setup Guide — 3D Room Reconstruction

## Truy cập n8n

1. Trên Ubuntu server: `docker compose up -d n8n`
2. Truy cập: `http://<ubuntu-ip>:5678`
3. Login: `admin` / `<password từ .env>`

---

## Tạo Workflow

### Step 1: Webhook Trigger

- **Node**: Webhook
- **HTTP Method**: POST
- **Path**: `3d-reconstruct`
- **Response Mode**: Immediately
- URL kết quả: `http://<server>:5678/webhook/3d-reconstruct`

### Step 2: Call COLMAP Worker

- **Node**: HTTP Request
- **Method**: POST
- **URL**: `http://colmap-worker:5000/reconstruct`
- **Body Content Type**: JSON
- **Body**:
```json
{
  "propertyId": "{{ $json.body.propertyId }}",
  "imageUrls": {{ $json.body.imageUrls }}
}
```

### Step 3: Save Job ID

- **Node**: Set
- **Fields**:
  - `jobId` = `{{ $json.jobId }}`
  - `propertyId` = `{{ $('Webhook').item.json.body.propertyId }}`

### Step 4: Wait

- **Node**: Wait
- **Duration**: 30 seconds

### Step 5: Check Status

- **Node**: HTTP Request
- **Method**: GET
- **URL**: `http://colmap-worker:5000/status/{{ $json.jobId }}`

### Step 6: IF — Is Complete?

- **Node**: IF
- **Condition**: `{{ $json.status }}` is equal to `completed`

#### TRUE branch → Done! (COLMAP worker đã tự callback)
- **Node**: No Operation (hoặc Send Notification)

#### FALSE branch → Check if Failed

- **Node**: IF
- **Condition**: `{{ $json.status }}` is equal to `failed`

  - **TRUE** → Stop (COLMAP worker đã gửi error callback)
  - **FALSE** → Loop back to **Step 4 (Wait)**

---

## Lưu ý quan trọng

> **COLMAP worker đã tự xử lý callback** về property-service khi hoàn thành hoặc thất bại.
> n8n workflow chủ yếu đóng vai trò **trigger** và **monitor**.

### Nếu muốn đơn giản hóa

Bạn có thể chỉ cần 2 nodes:
1. **Webhook** → Nhận request từ property-service
2. **HTTP Request** → Gọi `POST http://colmap-worker:5000/reconstruct`

COLMAP worker sẽ tự:
- Chạy reconstruction
- Upload .glb lên MinIO
- Callback kết quả về property-service

---

## Test Workflow

1. Activate workflow (toggle ON ở góc trên phải)
2. Test với curl:
```bash
curl -X POST http://localhost:5678/webhook/3d-reconstruct \
  -H "Content-Type: application/json" \
  -d '{
    "propertyId": "test-property-123",
    "imageUrls": [
      "http://minio:9000/roomie/img1.jpg",
      "http://minio:9000/roomie/img2.jpg"
    ]
  }'
```

---

## Biểu đồ workflow

```
[Webhook] → [HTTP: Call COLMAP Worker] → [Wait 30s] → [HTTP: Check Status] → [IF Complete?]
                                                              ↑                    ↓ NO
                                                              └────────────────────┘
                                                                                   ↓ YES
                                                                              [Done/Notify]
```
