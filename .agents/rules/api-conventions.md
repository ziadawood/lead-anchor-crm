# API Conventions

## Base URL
All API endpoints are prefixed with `/api/v1/`.

## Authentication
All endpoints require `Authorization: Bearer <supabase_jwt>` except:
- `POST /api/v1/auth/signup`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/reset-password`
- `POST /api/v1/webhooks/*` (verified via provider signature)
- `GET  /api/v1/public/website/:slug` (public tenant website data)

## Response Shape

### Success Response
```json
{
  "data": { ... },
  "meta": {
    "page": 1,
    "per_page": 25,
    "total": 142
  }
}
```
- `meta` is optional and only included for paginated list endpoints.
- Single-resource endpoints return `{ "data": { ... } }` only.

### Error Response
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable error message",
    "details": [
      { "field": "email", "message": "Invalid email format" }
    ]
  }
}
```
- `code` is a machine-readable enum string (e.g., `NOT_FOUND`, `UNAUTHORIZED`,
  `FORBIDDEN`, `VALIDATION_ERROR`, `INTERNAL_ERROR`, `RATE_LIMITED`)
- `details` is optional; used for field-level validation errors.

## HTTP Status Codes
| Status | Usage |
|---|---|
| `200` | Successful GET, PATCH, DELETE |
| `201` | Successful POST (resource created) |
| `400` | Validation error / bad request |
| `401` | Missing or invalid authentication |
| `403` | Authenticated but insufficient permissions |
| `404` | Resource not found |
| `409` | Conflict (e.g., duplicate phone number) |
| `429` | Rate limited |
| `500` | Internal server error |

## Endpoint Naming
REST conventions with plural nouns:

```
GET    /api/v1/deals              → List deals (paginated)
POST   /api/v1/deals              → Create a deal
GET    /api/v1/deals/:id          → Get a single deal
PATCH  /api/v1/deals/:id          → Partial update a deal
DELETE /api/v1/deals/:id          → Soft-delete a deal

GET    /api/v1/contacts/:id/deals → List deals for a specific contact
```

## Tenant Scoping
- All tenant-scoped endpoints extract `tenant_id` from the authenticated
  user's JWT claims — never from query parameters or request body.
- The API middleware injects `tenant_id` into the request context.
- Super admin endpoints (platform-level) use a separate route prefix:
  `/api/v1/admin/tenants`

## Pagination
- Default: `page=1`, `per_page=25`
- Max `per_page`: 100
- Query params: `?page=2&per_page=50`
- Response includes `meta.page`, `meta.per_page`, `meta.total`

## Filtering & Sorting
- Filter: `?priority=high&stage=new_opportunity`
- Sort: `?sort=created_at&order=desc`
- Search: `?search=john` (full-text search on relevant fields)

## Webhook Endpoints
```
POST /api/v1/webhooks/telnyx   → Telnyx call/SMS events
POST /api/v1/webhooks/stripe   → Stripe payment events
```
- Always verify webhook signatures before processing.
- Log raw payloads to `webhook_logs` table for debugging.
- Return `200` immediately, process async if heavy.

## Rate Limiting
- Standard endpoints: 100 requests per minute per user
- Auth endpoints: 10 requests per minute per IP
- Webhook endpoints: 1000 requests per minute (provider bursts)

## CORS
- Allow origins: `https://leadanchor.com`, `https://*.leadanchor.com`
- Development: `http://localhost:*`
- Credentials: allowed
