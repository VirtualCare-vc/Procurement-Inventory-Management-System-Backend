# Item Module

## Overview
The Item module provides comprehensive item/product management functionality for companies. It supports both physical products and services with extensive features including pricing, inventory tracking, vendor management, and categorization.

## Features

### Core Features
- ✅ Full CRUD operations for items
- ✅ Company-based access control
- ✅ Unique item codes per company
- ✅ Support for both products and services
- ✅ Category-based organization
- ✅ Unit of Measure (UOM) integration
- ✅ Multi-currency pricing support
- ✅ Tax rate configuration

### Pricing Management
- Unit price and cost price tracking
- Currency-specific pricing
- Tax rate configuration per item

### Inventory Management
- Optional inventory tracking flag
- Minimum and maximum stock levels
- Reorder point configuration
- Low stock alerts

### Vendor Integration
- Preferred vendor assignment
- Vendor-specific item tracking

### Additional Features
- Barcode/SKU support
- Manufacturer and brand tracking
- Technical specifications storage
- Item usage statistics
- Soft delete functionality
- Delete protection for items in use

## Database Schema

```prisma
model Item {
  id                String              @id @default(cuid())
  companyId         String
  company           Company             @relation(fields: [companyId], references: [id])
  name              String
  code              String
  description       String?
  category          String?
  uomId             String?
  uom               UoM?                @relation(fields: [uomId], references: [id])
  isService         Boolean             @default(false)
  
  // Pricing
  unitPrice         Decimal?            @db.Decimal(18,4)
  costPrice         Decimal?            @db.Decimal(18,4)
  currencyId        String?
  currency          Currency?           @relation(fields: [currencyId], references: [id])
  
  // Tax
  taxRate           Decimal?            @db.Decimal(5,2)
  
  // Stock Management
  trackInventory    Boolean             @default(false)
  minStockLevel     Decimal?            @db.Decimal(18,4)
  maxStockLevel     Decimal?            @db.Decimal(18,4)
  reorderPoint      Decimal?            @db.Decimal(18,4)
  
  // Vendor Information
  preferredVendorId String?
  preferredVendor   Vendor?             @relation(fields: [preferredVendorId], references: [id])
  
  // Additional Info
  barcode           String?
  manufacturer      String?
  brand             String?
  specifications    String?
  
  purchaseOrderLines PurchaseOrderLine[]
  isActive          Boolean             @default(true)
  createdAt         DateTime            @default(now())
  updatedAt         DateTime            @updatedAt

  @@unique([companyId, code])
  @@index([companyId, category])
  @@index([companyId, isActive])
}
```

## API Endpoints

### Create Item
**POST** `/items`

Creates a new item for a company.

**Request Body:**
```json
{
  "companyId": "company_id",
  "name": "Laptop Computer",
  "code": "ITEM-001",
  "description": "High-performance laptop",
  "category": "Electronics",
  "uomId": "uom_id",
  "isService": false,
  "unitPrice": 1200.00,
  "costPrice": 900.00,
  "currencyId": "currency_id",
  "taxRate": 10.00,
  "trackInventory": true,
  "minStockLevel": 5,
  "maxStockLevel": 50,
  "reorderPoint": 10,
  "preferredVendorId": "vendor_id",
  "barcode": "123456789",
  "manufacturer": "Dell",
  "brand": "Dell",
  "specifications": "{\"ram\": \"16GB\", \"storage\": \"512GB SSD\"}",
  "isActive": true
}
```

**Response:** `201 Created`
```json
{
  "id": "item_id",
  "companyId": "company_id",
  "name": "Laptop Computer",
  "code": "ITEM-001",
  "description": "High-performance laptop",
  "category": "Electronics",
  "uomId": "uom_id",
  "isService": false,
  "unitPrice": "1200.0000",
  "costPrice": "900.0000",
  "currencyId": "currency_id",
  "taxRate": "10.00",
  "trackInventory": true,
  "minStockLevel": "5.0000",
  "maxStockLevel": "50.0000",
  "reorderPoint": "10.0000",
  "preferredVendorId": "vendor_id",
  "barcode": "123456789",
  "manufacturer": "Dell",
  "brand": "Dell",
  "specifications": "{\"ram\": \"16GB\", \"storage\": \"512GB SSD\"}",
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "uom": { ... },
  "currency": { ... },
  "preferredVendor": { ... },
  "company": { ... }
}
```

### Get All Items (with filters)
**GET** `/items?companyId=xxx&search=laptop&category=Electronics&isActive=true`

Retrieves items with optional filtering.

**Query Parameters:**
- `companyId` (optional): Filter by company
- `search` (optional): Search in name, code, description, or barcode
- `category` (optional): Filter by category
- `isService` (optional): Filter by service flag
- `trackInventory` (optional): Filter by inventory tracking flag
- `preferredVendorId` (optional): Filter by preferred vendor
- `currencyId` (optional): Filter by currency
- `isActive` (optional): Filter by active status

### Get Item by ID
**GET** `/items/:id`

Retrieves a specific item by ID.

### Get Item by Code
**GET** `/items/code/:companyId/:code`

Retrieves an item by its code within a company.

### Get Items by Company
**GET** `/items/company/:companyId`

Retrieves all items for a specific company.

### Get Items by Category
**GET** `/items/company/:companyId/category/:category`

Retrieves all items in a specific category for a company.

### Get Low Stock Items
**GET** `/items/company/:companyId/low-stock`

Retrieves items with inventory tracking enabled (for low stock monitoring).

### Get Item Statistics
**GET** `/items/:id/statistics`

Retrieves usage statistics for an item.

**Response:**
```json
{
  "totalOrders": 15,
  "totalQuantity": 150,
  "totalValue": 180000.00
}
```

### Update Item
**PUT** `/items/:id`

Updates an existing item.

**Request Body:** (All fields optional)
```json
{
  "name": "Updated Laptop Computer",
  "unitPrice": 1300.00,
  "isActive": true
}
```

### Delete Item (Hard Delete)
**DELETE** `/items/:id`

Permanently deletes an item. Will fail if the item is used in any purchase orders.

**Response:** `204 No Content`

### Soft Delete Item
**DELETE** `/items/:id/soft`

Deactivates an item by setting `isActive` to false.

## Validation Rules

### Create/Update Validations
1. **Code uniqueness**: Item code must be unique within a company
2. **Company validation**: Company must exist
3. **UOM validation**: UOM must exist if provided
4. **Currency validation**: Currency must exist and belong to the same company
5. **Vendor validation**: Vendor must exist and belong to the same company
6. **Stock levels**: Min stock level cannot exceed max stock level
7. **Pricing**: Prices must be non-negative
8. **Tax rate**: Must be between 0 and 100

### Delete Protection
- Cannot delete items that are used in purchase order lines
- Use soft delete instead for items in use

## Common Item Categories

Suggested categories for organization:
- Raw Materials
- Finished Goods
- Work in Progress
- Consumables
- Spare Parts
- Services
- Office Supplies
- Equipment
- Tools
- Packaging Materials

## Usage Examples

### Creating a Product Item
```typescript
POST /items
{
  "companyId": "comp_123",
  "name": "Steel Rod 10mm",
  "code": "STEEL-10MM",
  "description": "High-grade steel rod, 10mm diameter",
  "category": "Raw Materials",
  "uomId": "uom_meter",
  "isService": false,
  "unitPrice": 15.50,
  "costPrice": 12.00,
  "currencyId": "curr_usd",
  "taxRate": 8.00,
  "trackInventory": true,
  "minStockLevel": 100,
  "maxStockLevel": 1000,
  "reorderPoint": 200,
  "preferredVendorId": "vendor_123",
  "manufacturer": "Steel Corp",
  "brand": "SteelPro"
}
```

### Creating a Service Item
```typescript
POST /items
{
  "companyId": "comp_123",
  "name": "Consulting Services",
  "code": "SRV-CONSULT",
  "description": "Professional consulting services",
  "category": "Services",
  "isService": true,
  "unitPrice": 150.00,
  "currencyId": "curr_usd",
  "taxRate": 0.00,
  "trackInventory": false
}
```

### Searching for Items
```typescript
GET /items?companyId=comp_123&search=steel&category=Raw Materials&isActive=true
```

### Getting Low Stock Items
```typescript
GET /items/company/comp_123/low-stock
```

## Error Handling

The module returns appropriate HTTP status codes:
- `200 OK`: Successful GET/PUT requests
- `201 Created`: Successful POST requests
- `204 No Content`: Successful DELETE requests
- `400 Bad Request`: Validation errors
- `404 Not Found`: Resource not found
- `409 Conflict`: Duplicate code or constraint violation

## Integration Points

### With Currency Module
- Items can have pricing in specific currencies
- Currency must belong to the same company

### With Vendor Module
- Items can have a preferred vendor
- Vendor must belong to the same company

### With UOM Module
- Items are measured in specific units
- UOM integration for quantity tracking

### With Purchase Order Module
- Items are used in purchase order lines
- Delete protection when items are in use
- Usage statistics tracking

## Notes

1. **Item Codes**: Must be unique per company, not globally unique
2. **Soft Delete**: Recommended for items that have been used in transactions
3. **Inventory Tracking**: Set `trackInventory` to true for items requiring stock management
4. **Specifications**: Can store JSON or plain text for technical details
5. **Multi-currency**: Each item can have pricing in a specific currency
6. **Tax Configuration**: Tax rates are stored as percentages (e.g., 10.00 for 10%)

## Future Enhancements

Potential future features:
- Actual inventory transaction tracking
- Multiple vendor pricing
- Quantity-based pricing tiers
- Item variants/configurations
- Image attachments
- Document attachments
- Batch/lot tracking
- Serial number tracking
- Expiry date management
- Alternative UOM conversions
