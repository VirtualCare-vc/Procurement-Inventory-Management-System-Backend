# Purchase Order Module

Complete Purchase Order (PO) management system with automatic pricing, calculations, and status workflow.

## Features

### 1. **Core PO Management**
- ✅ Create PO with vendor and line items
- ✅ Auto-generate PO numbers (PO-00001, PO-00002, etc.)
- ✅ Auto-fill pricing from item catalog (optional)
- ✅ Automatic calculation of totals (line and header level)
- ✅ Multi-currency support
- ✅ Status workflow management
- ✅ Update and delete (DRAFT only)

### 2. **Smart Pricing**
- If item is selected, pricing is **automatically pulled from item table**
- Price can be **manually overridden** if needed
- Tax rates auto-filled from item catalog
- UOM auto-filled from item catalog

### 3. **Status Workflow**
```
DRAFT → SUBMITTED → UNDER_APPROVAL → APPROVED → ISSUED
                                  ↓
                              REJECTED → DRAFT
                                  ↓
                              CANCELLED
```

### 4. **Automatic Calculations**

**Line Level:**
- `lineSubTotal = qty × price`
- `lineTax = lineSubTotal × (taxRate / 100)`
- `lineTotal = lineSubTotal + lineTax`

**Header Level:**
- `subTotal = SUM(all lineSubTotal)`
- `taxTotal = SUM(all lineTax)`
- `grandTotal = subTotal + taxTotal`

## API Endpoints

### Purchase Order Management

#### 1. Create Purchase Order
```http
POST /purchase-orders
Authorization: Bearer {token}
Content-Type: application/json

{
  "companyId": "company-id",
  "vendorId": "vendor-id",
  "siteId": "site-id",  // Optional
  "currencyId": "currency-id",  // Optional - uses vendor's default
  "orderDate": "2024-01-15",  // Optional - defaults to now
  "expectedDeliveryDate": "2024-02-15",  // Optional
  "remarks": "Urgent order",
  "paymentTerms": "Net 30",
  "shippingAddress": "123 Main St",
  "contactPerson": "John Doe",
  "contactEmail": "john@vendor.com",
  "contactPhone": "+1234567890",
  "lines": [
    {
      "itemId": "item-id-1",  // Optional - if provided, price/tax auto-filled
      "description": "Product A",
      "uomId": "uom-id",  // Optional - auto-filled from item
      "qty": 10,
      "price": 100.50,  // Optional - auto-filled from item
      "taxRate": 10,  // Optional - auto-filled from item
      "notes": "Handle with care"
    },
    {
      "description": "Custom Service",  // Free-text item (no itemId)
      "qty": 5,
      "price": 200,  // Required if no itemId
      "taxRate": 0
    }
  ]
}
```

**Response:**
```json
{
  "id": "po-id",
  "companyId": "company-id",
  "companyName": "ABC Corp",
  "vendorId": "vendor-id",
  "vendorCode": "V001",
  "vendorName": "Vendor ABC",
  "siteId": "site-id",
  "siteName": "Main Warehouse",
  "number": "PO-00001",
  "status": "DRAFT",
  "orderDate": "2024-01-15T00:00:00.000Z",
  "expectedDeliveryDate": "2024-02-15T00:00:00.000Z",
  "currencyId": "currency-id",
  "currencyCode": "USD",
  "currencySymbol": "$",
  "remarks": "Urgent order",
  "paymentTerms": "Net 30",
  "shippingAddress": "123 Main St",
  "contactPerson": "John Doe",
  "contactEmail": "john@vendor.com",
  "contactPhone": "+1234567890",
  "subTotal": 2005.00,
  "taxTotal": 100.50,
  "grandTotal": 2105.50,
  "createdById": "user-id",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z",
  "lines": [
    {
      "id": "line-id-1",
      "lineNo": 1,
      "itemId": "item-id-1",
      "itemCode": "ITEM-001",
      "itemName": "Product A",
      "description": "Product A",
      "uomId": "uom-id",
      "uomCode": "PCS",
      "uomName": "Pieces",
      "qty": 10,
      "price": 100.50,
      "taxRate": 10,
      "lineSubTotal": 1005.00,
      "lineTax": 100.50,
      "lineTotal": 1105.50,
      "notes": "Handle with care",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    },
    {
      "id": "line-id-2",
      "lineNo": 2,
      "description": "Custom Service",
      "qty": 5,
      "price": 200,
      "taxRate": 0,
      "lineSubTotal": 1000.00,
      "lineTax": 0,
      "lineTotal": 1000.00,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

#### 2. Get All Purchase Orders
```http
GET /purchase-orders?companyId=xxx&vendorId=xxx&status=DRAFT&startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer {token}
```

**Query Parameters:**
- `companyId` - Filter by company
- `vendorId` - Filter by vendor
- `siteId` - Filter by site
- `status` - Filter by status (DRAFT, SUBMITTED, APPROVED, etc.)
- `search` - Search by PO number or remarks
- `startDate` - Filter by order date (start)
- `endDate` - Filter by order date (end)
- `sortBy` - Sort field (default: orderDate)
- `sortOrder` - Sort order: asc/desc (default: desc)

#### 3. Get Purchase Order by ID
```http
GET /purchase-orders/{id}
Authorization: Bearer {token}
```

#### 4. Get Purchase Order by Number
```http
GET /purchase-orders/number/{companyId}/{number}
Authorization: Bearer {token}
```

Example: `GET /purchase-orders/number/company-123/PO-00001`

#### 5. Update Purchase Order (DRAFT only)
```http
PUT /purchase-orders/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "vendorId": "new-vendor-id",
  "remarks": "Updated remarks",
  "lines": [
    // New lines will replace all existing lines
  ]
}
```

**Note:** Only DRAFT status POs can be updated.

#### 6. Delete Purchase Order (DRAFT only)
```http
DELETE /purchase-orders/{id}
Authorization: Bearer {token}
```

**Note:** Only DRAFT status POs can be deleted.

### Status Management

#### 7. Submit Purchase Order (DRAFT → SUBMITTED)
```http
PATCH /purchase-orders/{id}/submit
Authorization: Bearer {token}
```

#### 8. Approve Purchase Order (SUBMITTED → APPROVED)
```http
PATCH /purchase-orders/{id}/approve
Authorization: Bearer {token}
```

#### 9. Reject Purchase Order (SUBMITTED → REJECTED)
```http
PATCH /purchase-orders/{id}/reject
Authorization: Bearer {token}
```

#### 10. Issue Purchase Order (APPROVED → ISSUED)
```http
PATCH /purchase-orders/{id}/issue
Authorization: Bearer {token}
```

#### 11. Cancel Purchase Order (Any → CANCELLED)
```http
PATCH /purchase-orders/{id}/cancel
Authorization: Bearer {token}
```

### Analytics

#### 12. Get Vendor Statistics
```http
GET /purchase-orders/vendor/{vendorId}/statistics?companyId={companyId}
Authorization: Bearer {token}
```

**Response:**
```json
{
  "totalOrders": 25,
  "totalSpending": 125000.50,
  "statusBreakdown": [
    { "status": "DRAFT", "_count": 5 },
    { "status": "APPROVED", "_count": 10 },
    { "status": "ISSUED", "_count": 8 },
    { "status": "CANCELLED", "_count": 2 }
  ]
}
```

## Validations

### Create/Update Validations
- ✅ Vendor must belong to the company
- ✅ Site must belong to the company (if provided)
- ✅ Currency must belong to the company (if provided)
- ✅ Items must belong to the company (if itemId provided)
- ✅ UOMs must belong to the company (if uomId provided)
- ✅ At least one line item required
- ✅ Description required for each line
- ✅ Price required (either from item or manually specified)
- ✅ Quantity must be positive

### Status Transition Validations
- ✅ DRAFT → SUBMITTED, CANCELLED
- ✅ SUBMITTED → UNDER_APPROVAL, APPROVED, REJECTED, CANCELLED
- ✅ UNDER_APPROVAL → APPROVED, REJECTED, CANCELLED
- ✅ APPROVED → ISSUED, CANCELLED
- ✅ REJECTED → DRAFT, CANCELLED
- ✅ ISSUED → CANCELLED
- ✅ CANCELLED → (no transitions allowed)

### Delete/Update Restrictions
- ✅ Can only update DRAFT status POs
- ✅ Can only delete DRAFT status POs
- ✅ Cannot modify APPROVED or ISSUED POs

## Usage Examples

### Example 1: Create PO with Catalog Items (Auto-Pricing)
```javascript
// Items will auto-fill price, tax, and UOM from item catalog
const po = await fetch('/purchase-orders', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer token',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    companyId: 'company-123',
    vendorId: 'vendor-456',
    lines: [
      {
        itemId: 'item-789',  // Price/tax auto-filled
        description: 'Widget A',
        qty: 100
      }
    ]
  })
});
```

### Example 2: Create PO with Manual Pricing
```javascript
// Specify price manually (overrides item catalog)
const po = await fetch('/purchase-orders', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer token',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    companyId: 'company-123',
    vendorId: 'vendor-456',
    lines: [
      {
        itemId: 'item-789',
        description: 'Widget A',
        qty: 100,
        price: 50.00,  // Manual override
        taxRate: 15    // Manual override
      }
    ]
  })
});
```

### Example 3: Create PO with Free-Text Items
```javascript
// No itemId - fully manual entry
const po = await fetch('/purchase-orders', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer token',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    companyId: 'company-123',
    vendorId: 'vendor-456',
    lines: [
      {
        description: 'Custom consulting service',
        qty: 10,
        price: 150.00,
        taxRate: 0
      }
    ]
  })
});
```

### Example 4: Status Workflow
```javascript
// 1. Create PO (status: DRAFT)
const po = await createPO({...});

// 2. Submit for approval
await fetch(`/purchase-orders/${po.id}/submit`, { method: 'PATCH' });

// 3. Approve
await fetch(`/purchase-orders/${po.id}/approve`, { method: 'PATCH' });

// 4. Issue to vendor
await fetch(`/purchase-orders/${po.id}/issue`, { method: 'PATCH' });
```

## Business Logic

### Auto-Number Generation
- PO numbers are automatically generated in format: `PO-00001`, `PO-00002`, etc.
- Numbers are unique per company
- Sequential numbering based on last PO number

### Currency Handling
- If no currency specified, uses vendor's default currency
- Exchange rates can be tracked for multi-currency POs
- All amounts stored in PO's currency

### Line Item Processing
1. If `itemId` provided:
   - Fetches item details from catalog
   - Auto-fills: price, taxRate, uomId, description
   - Manual values override auto-filled values
2. If no `itemId`:
   - All fields must be provided manually
   - Allows free-text items/services

### Total Calculations
- All calculations performed automatically
- Line totals calculated first
- Header totals sum all line totals
- Decimal precision: 2 places for amounts, 4 places for quantities

## Error Handling

### Common Errors
- `404 Not Found` - PO, vendor, item, or related entity not found
- `400 Bad Request` - Validation errors, invalid status transitions
- `403 Forbidden` - Attempting to modify non-DRAFT PO
- `401 Unauthorized` - Missing or invalid JWT token

### Error Response Format
```json
{
  "statusCode": 400,
  "message": "Validation error message",
  "error": "Bad Request"
}
```

## Integration with Other Modules

### Dependencies
- **Company Module** - Company validation
- **Vendor Module** - Vendor details and currency
- **Item Module** - Item catalog and pricing
- **UOM Module** - Unit of measure
- **Currency Module** - Multi-currency support
- **Auth Module** - JWT authentication

### Future Enhancements
- Goods Receipt/Receiving
- Invoice Matching (3-way match)
- Approval Workflow (multi-level)
- PDF Export
- Email notifications to vendors
- Budget tracking
- Reporting and analytics

## Notes

- All endpoints require JWT authentication
- User ID is automatically captured from JWT token
- Timestamps (createdAt, updatedAt) are automatic
- Soft delete not implemented (hard delete for DRAFT only)
- Status transitions are strictly enforced
- Company-based isolation ensures data security
