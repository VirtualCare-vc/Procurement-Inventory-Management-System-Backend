# Vendor Module

This module handles all vendor-related operations including CRUD operations and user assignments.

## Features

### 1. Vendor CRUD Operations
- Create vendor with company association
- Read vendors with filtering and pagination
- Update vendor details
- Soft delete (deactivate) vendor
- Hard delete vendor (with validation)

### 2. Vendor User Management
- Assign single user to vendor
- Assign multiple users to vendor
- Remove user from vendor
- Track user roles within vendor context

### 3. Vendor Statistics
- Total purchase orders
- Total spent amount
- Active purchase orders count

## API Endpoints

### Vendor CRUD

#### Create Vendor
```
POST /vendors
Authorization: Bearer <token>

Body:
{
  "companyId": "uuid",
  "name": "Vendor Name",
  "code": "VEND001",
  "email": "vendor@example.com",
  "phone": "+1234567890",
  "address": "123 Vendor St",
  "taxNumber": "TAX123456",
  "currencyId": "uuid",
  "isActive": true
}
```

#### Get All Vendors (with filtering)
```
GET /vendors?companyId=uuid&search=vendor&isActive=true&page=1&limit=10
Authorization: Bearer <token>
```

#### Get Vendor by ID
```
GET /vendors/:id
Authorization: Bearer <token>
```

#### Get Vendor by Company and Code
```
GET /vendors/company/:companyId/code/:code
Authorization: Bearer <token>
```

#### Get Vendors by Company
```
GET /vendors/company/:companyId?page=1&limit=10
Authorization: Bearer <token>
```

#### Get Vendor Statistics
```
GET /vendors/:id/stats
Authorization: Bearer <token>

Response:
{
  "vendorId": "uuid",
  "totalPurchaseOrders": 25,
  "totalSpent": 150000.00,
  "activePurchaseOrders": 5
}
```

#### Update Vendor
```
PUT /vendors/:id
Authorization: Bearer <token>

Body:
{
  "name": "Updated Vendor Name",
  "email": "newemail@example.com",
  "isActive": true
}
```

#### Soft Delete Vendor
```
DELETE /vendors/:id/soft
Authorization: Bearer <token>
```

#### Hard Delete Vendor
```
DELETE /vendors/:id/hard
Authorization: Bearer <token>
```

### Vendor User Management

#### Assign Single User to Vendor
```
POST /auth/vendor/assign-user
Authorization: Bearer <token>

Body:
{
  "userId": "uuid",
  "vendorId": "uuid",
  "role": "contact"
}
```

#### Assign Multiple Users to Vendor
```
POST /auth/vendor/assign-users
Authorization: Bearer <token>

Body:
{
  "vendorId": "uuid",
  "users": [
    {
      "userId": "uuid1",
      "role": "contact"
    },
    {
      "userId": "uuid2",
      "role": "manager"
    }
  ]
}
```

#### Remove User from Vendor
```
POST /auth/vendor/remove-user
Authorization: Bearer <token>

Body:
{
  "userId": "uuid",
  "vendorId": "uuid"
}
```

## Database Schema

### Vendor Model
```prisma
model Vendor {
  id             String           @id @default(cuid())
  companyId      String
  company        Company          @relation(fields: [companyId], references: [id])
  name           String
  code           String
  email          String?
  phone          String?
  address        String?
  taxNumber      String?
  currencyId     String?
  currency       Currency?        @relation(fields: [currencyId], references: [id])
  purchaseOrders PurchaseOrder[]
  vendorUsers    VendorUser[]
  isActive       Boolean          @default(true)
  createdAt      DateTime         @default(now())
  updatedAt      DateTime         @updatedAt

  @@unique([companyId, code])
}
```

### VendorUser Model
```prisma
model VendorUser {
  id        String   @id @default(cuid())
  user      User     @relation(fields: [userId], references: [id])
  userId    String
  vendor    Vendor   @relation(fields: [vendorId], references: [id])
  vendorId  String
  role      String   // e.g., 'contact', 'manager', etc.
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([userId, vendorId])
}
```

## Validation Rules

1. **Vendor Code**: Must be unique within a company
2. **Company Access**: Users can only manage vendors for companies they have access to
3. **Currency**: If provided, must exist in the system
4. **Hard Delete**: Cannot delete vendor with existing purchase orders
5. **User Assignment**: User and vendor must exist before assignment

## Error Handling

- `400 Bad Request`: Invalid data or business rule violation
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: User doesn't have access to the company
- `404 Not Found`: Vendor, company, or user not found

## Usage Examples

### Create a Vendor
```typescript
const vendor = await vendorService.create(userId, {
  companyId: 'company-uuid',
  name: 'ABC Suppliers',
  code: 'ABC001',
  email: 'contact@abcsuppliers.com',
  phone: '+1-555-0123',
  address: '123 Supply Street, City, State 12345',
  taxNumber: 'TAX-ABC-001',
  currencyId: 'usd-currency-uuid',
  isActive: true,
});
```

### Assign User to Vendor
```typescript
const assignment = await authService.assignUserToVendor(requesterId, {
  userId: 'user-uuid',
  vendorId: 'vendor-uuid',
  role: 'contact',
});
```

### Get Vendor Statistics
```typescript
const stats = await vendorService.getStats(userId, vendorId);
console.log(`Total Spent: $${stats.totalSpent}`);
console.log(`Active POs: ${stats.activePurchaseOrders}`);
```

## Security Considerations

1. All endpoints require JWT authentication
2. Users can only access vendors from companies they're assigned to
3. Vendor codes are unique per company to prevent conflicts
4. Soft delete is recommended for vendors with transaction history

## Migration Steps

1. Run Prisma migration:
```bash
npx prisma migrate dev --name add_vendor_user_table
```

2. Generate Prisma client:
```bash
npx prisma generate
```

3. Restart the application

## Testing

Test the endpoints using the provided examples with a valid JWT token obtained from the login endpoint.
