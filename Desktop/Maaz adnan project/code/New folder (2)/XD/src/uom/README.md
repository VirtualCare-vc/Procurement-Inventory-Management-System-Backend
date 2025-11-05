# UOM (Unit of Measure) Module

## Overview
The UOM module provides comprehensive unit of measure management functionality for companies. It supports creating, managing, and converting between different units of measurement used in items, purchase orders, and other business operations.

## Features

### Core Features
- ✅ Full CRUD operations for UOMs
- ✅ Company-based access control
- ✅ Unique UOM codes per company
- ✅ UOM conversion management
- ✅ Quantity conversion between UOMs
- ✅ Soft delete functionality
- ✅ Delete protection for UOMs in use

### UOM Conversion Features
- Create conversion rates between UOMs
- Bidirectional conversion support
- Automatic quantity conversion
- Conversion rate updates
- Delete conversions

## Database Schema

```prisma
model UoM {
  id                String              @id @default(cuid())
  companyId         String
  company           Company             @relation(fields: [companyId], references: [id])
  code              String              // Unique code per company (e.g., 'KG', 'M', 'PCS')
  name              String              // Full name (e.g., 'Kilogram', 'Meter', 'Pieces')
  symbol            String              // Display symbol (e.g., 'kg', 'm', 'pcs')
  description       String?             // Optional description
  fromConversions   UoMConversion[]     @relation("FromUoM")
  toConversions     UoMConversion[]     @relation("ToUoM")
  items             Item[]
  purchaseOrderLines PurchaseOrderLine[]
  isActive          Boolean             @default(true)
  createdAt         DateTime            @default(now())
  updatedAt         DateTime            @updatedAt

  @@unique([companyId, code])
  @@index([companyId, isActive])
}

model UoMConversion {
  id             String   @id @default(cuid())
  fromUomId      String
  toUomId        String
  conversionRate Decimal  @db.Decimal(10, 4)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  fromUom        UoM      @relation("FromUoM", fields: [fromUomId], references: [id])
  toUom          UoM      @relation("ToUoM", fields: [toUomId], references: [id])
}
```

## API Endpoints

### UOM Management

#### Create UOM
**POST** `/uoms`

Creates a new unit of measure for a company.

**Request Body:**
```json
{
  "companyId": "company_id",
  "code": "KG",
  "name": "Kilogram",
  "symbol": "kg",
  "description": "Unit of mass in the metric system",
  "isActive": true
}
```

**Response:** `201 Created`
```json
{
  "id": "uom_id",
  "companyId": "company_id",
  "code": "KG",
  "name": "Kilogram",
  "symbol": "kg",
  "description": "Unit of mass in the metric system",
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "company": { ... }
}
```

#### Get All UOMs (with filters)
**GET** `/uoms?companyId=xxx&search=kg&isActive=true`

Retrieves UOMs with optional filtering.

**Query Parameters:**
- `companyId` (optional): Filter by company
- `search` (optional): Search in name, code, or symbol
- `isActive` (optional): Filter by active status

#### Get UOM by ID
**GET** `/uoms/:id`

Retrieves a specific UOM by ID with all its conversions.

**Response:**
```json
{
  "id": "uom_id",
  "companyId": "company_id",
  "code": "KG",
  "name": "Kilogram",
  "symbol": "kg",
  "description": "Unit of mass in the metric system",
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "company": { ... },
  "fromConversions": [
    {
      "id": "conv_id",
      "fromUomId": "uom_id",
      "toUomId": "gram_id",
      "conversionRate": "1000.0000",
      "toUom": {
        "id": "gram_id",
        "code": "G",
        "name": "Gram",
        "symbol": "g"
      }
    }
  ],
  "toConversions": []
}
```

#### Get UOM by Code
**GET** `/uoms/code/:companyId/:code`

Retrieves a UOM by its code within a company.

#### Get UOMs by Company
**GET** `/uoms/company/:companyId`

Retrieves all UOMs for a specific company.

#### Update UOM
**PUT** `/uoms/:id`

Updates an existing UOM.

**Request Body:** (All fields optional)
```json
{
  "name": "Kilogram (Updated)",
  "description": "Updated description",
  "isActive": true
}
```

#### Delete UOM (Hard Delete)
**DELETE** `/uoms/:id`

Permanently deletes a UOM. Will fail if the UOM is used in any items or purchase orders.

**Response:** `204 No Content`

#### Soft Delete UOM
**DELETE** `/uoms/:id/soft`

Deactivates a UOM by setting `isActive` to false.

### UOM Conversion Management

#### Create UOM Conversion
**POST** `/uoms/conversions`

Creates a conversion rate between two UOMs.

**Request Body:**
```json
{
  "fromUomId": "kg_id",
  "toUomId": "g_id",
  "conversionRate": 1000
}
```

**Response:** `201 Created`
```json
{
  "id": "conversion_id",
  "fromUomId": "kg_id",
  "toUomId": "g_id",
  "conversionRate": "1000.0000",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "fromUom": {
    "id": "kg_id",
    "code": "KG",
    "name": "Kilogram",
    "symbol": "kg"
  },
  "toUom": {
    "id": "g_id",
    "code": "G",
    "name": "Gram",
    "symbol": "g"
  }
}
```

#### Get All Conversions
**GET** `/uoms/conversions/all`

Retrieves all UOM conversions across all companies.

#### Get Specific Conversion
**GET** `/uoms/conversions/:fromUomId/:toUomId`

Retrieves a specific conversion between two UOMs.

#### Get Conversions for a UOM
**GET** `/uoms/:id/conversions`

Retrieves all conversions related to a specific UOM (both from and to).

#### Update Conversion Rate
**PUT** `/uoms/conversions/:id`

Updates the conversion rate for an existing conversion.

**Request Body:**
```json
{
  "conversionRate": 1000.5
}
```

#### Delete Conversion
**DELETE** `/uoms/conversions/:id`

Deletes a UOM conversion.

**Response:** `204 No Content`

#### Convert Quantity
**POST** `/uoms/convert`

Converts a quantity from one UOM to another.

**Request Body:**
```json
{
  "fromUomId": "kg_id",
  "toUomId": "g_id",
  "quantity": 5
}
```

**Response:**
```json
{
  "fromUomId": "kg_id",
  "toUomId": "g_id",
  "originalQuantity": 5,
  "convertedQuantity": 5000
}
```

## Validation Rules

### Create/Update Validations
1. **Code uniqueness**: UOM code must be unique within a company
2. **Company validation**: Company must exist
3. **Code format**: Max 20 characters
4. **Name format**: Max 100 characters
5. **Symbol format**: Max 20 characters

### Conversion Validations
1. **UOM existence**: Both from and to UOMs must exist
2. **Same company**: Both UOMs must belong to the same company
3. **No self-conversion**: Cannot create conversion to the same UOM
4. **Unique conversion**: Cannot create duplicate conversions
5. **Positive rate**: Conversion rate must be greater than 0

### Delete Protection
- Cannot delete UOMs that are used in items
- Cannot delete UOMs that are used in purchase order lines
- Use soft delete instead for UOMs in use

## Common UOM Examples

### Weight/Mass
- **KG** - Kilogram (kg)
- **G** - Gram (g)
- **LB** - Pound (lb)
- **OZ** - Ounce (oz)
- **TON** - Metric Ton (t)

### Length/Distance
- **M** - Meter (m)
- **CM** - Centimeter (cm)
- **MM** - Millimeter (mm)
- **KM** - Kilometer (km)
- **FT** - Foot (ft)
- **IN** - Inch (in)

### Volume
- **L** - Liter (L)
- **ML** - Milliliter (mL)
- **GAL** - Gallon (gal)
- **M3** - Cubic Meter (m³)

### Quantity
- **PCS** - Pieces (pcs)
- **EA** - Each (ea)
- **DOZ** - Dozen (doz)
- **BOX** - Box (box)
- **CTN** - Carton (ctn)

### Area
- **M2** - Square Meter (m²)
- **FT2** - Square Foot (ft²)
- **HA** - Hectare (ha)

### Time
- **HR** - Hour (hr)
- **MIN** - Minute (min)
- **DAY** - Day (day)

## Usage Examples

### Creating a UOM
```typescript
POST /uoms
{
  "companyId": "comp_123",
  "code": "KG",
  "name": "Kilogram",
  "symbol": "kg",
  "description": "Metric unit of mass"
}
```

### Creating Multiple Related UOMs
```typescript
// Create Kilogram
POST /uoms
{
  "companyId": "comp_123",
  "code": "KG",
  "name": "Kilogram",
  "symbol": "kg"
}

// Create Gram
POST /uoms
{
  "companyId": "comp_123",
  "code": "G",
  "name": "Gram",
  "symbol": "g"
}

// Create conversion: 1 KG = 1000 G
POST /uoms/conversions
{
  "fromUomId": "kg_id",
  "toUomId": "g_id",
  "conversionRate": 1000
}

// Create reverse conversion: 1 G = 0.001 KG
POST /uoms/conversions
{
  "fromUomId": "g_id",
  "toUomId": "kg_id",
  "conversionRate": 0.001
}
```

### Converting Quantities
```typescript
// Convert 5 kg to grams
POST /uoms/convert
{
  "fromUomId": "kg_id",
  "toUomId": "g_id",
  "quantity": 5
}
// Returns: { convertedQuantity: 5000 }
```

### Searching for UOMs
```typescript
GET /uoms?companyId=comp_123&search=meter&isActive=true
```

## Conversion Best Practices

### 1. Bidirectional Conversions
Always create conversions in both directions for ease of use:
```typescript
// 1 KG = 1000 G
POST /uoms/conversions { fromUomId: "kg", toUomId: "g", conversionRate: 1000 }

// 1 G = 0.001 KG
POST /uoms/conversions { fromUomId: "g", toUomId: "kg", conversionRate: 0.001 }
```

### 2. Base Units
Define a base unit for each measurement type and create conversions from all other units to the base:
- Weight: Kilogram (KG)
- Length: Meter (M)
- Volume: Liter (L)

### 3. Precision
Use appropriate decimal precision for conversion rates:
- Simple conversions: 1000 (KG to G)
- Complex conversions: 0.4536 (LB to KG)
- High precision: 0.0254 (IN to M)

## Error Handling

The module returns appropriate HTTP status codes:
- `200 OK`: Successful GET/PUT requests
- `201 Created`: Successful POST requests
- `204 No Content`: Successful DELETE requests
- `400 Bad Request`: Validation errors
- `404 Not Found`: Resource not found
- `409 Conflict`: Duplicate code or conversion

## Integration Points

### With Item Module
- Items reference UOMs for measurement
- UOM must exist before creating items
- Delete protection when UOM is used in items

### With Purchase Order Module
- Purchase order lines use UOMs for quantities
- Delete protection when UOM is used in PO lines

### With Company Module
- UOMs are company-specific
- Each company can define their own UOMs
- UOM codes are unique per company

## Common Conversion Rates

### Weight
- 1 KG = 1000 G
- 1 KG = 2.20462 LB
- 1 LB = 16 OZ
- 1 TON = 1000 KG

### Length
- 1 M = 100 CM
- 1 M = 1000 MM
- 1 KM = 1000 M
- 1 M = 3.28084 FT
- 1 FT = 12 IN

### Volume
- 1 L = 1000 ML
- 1 GAL = 3.78541 L
- 1 M3 = 1000 L

### Quantity
- 1 DOZ = 12 PCS
- 1 GROSS = 144 PCS

## Notes

1. **UOM Codes**: Should be short, uppercase abbreviations (e.g., KG, M, PCS)
2. **Symbols**: Display-friendly representations (e.g., kg, m, pcs)
3. **Names**: Full descriptive names (e.g., Kilogram, Meter, Pieces)
4. **Conversions**: Always verify conversion rates for accuracy
5. **Soft Delete**: Recommended for UOMs that have been used in transactions
6. **Company Isolation**: UOMs are isolated per company for flexibility

## Future Enhancements

Potential future features:
- UOM categories/types (weight, length, volume, etc.)
- Standard UOM templates for quick setup
- Automatic reverse conversion creation
- Conversion chain support (A→B→C)
- UOM aliases (alternative codes/names)
- Import/export UOM configurations
- UOM usage analytics
- Dimensional analysis support
