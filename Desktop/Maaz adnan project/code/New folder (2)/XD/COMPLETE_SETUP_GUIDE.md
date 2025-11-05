# Complete Setup Guide - Vendor & Currency Management System

## 🎯 Overview

This guide provides a complete walkthrough for using the vendor and currency management system. All features are error-free and production-ready.

## ✅ What's Been Implemented

### 1. Vendor Management System
- ✅ Complete CRUD operations for vendors
- ✅ Vendor user assignment (link users to vendors)
- ✅ Vendor statistics (purchase orders, spending)
- ✅ Soft and hard delete with protection
- ✅ Company-based access control

### 2. Currency Management System
- ✅ Complete CRUD operations for currencies
- ✅ Exchange rate management with effective dates
- ✅ Currency symbol support ($, €, £, etc.)
- ✅ Integration with vendor module
- ✅ Delete protection for currencies in use

### 3. Automatic Company User Assignment
- ✅ When a user creates a company, they're automatically added as admin
- ✅ Ensures immediate access to the company

## 🚀 Quick Start Guide

### Step 1: Authentication

#### Sign Up
```bash
POST http://localhost:3000/auth/signup
Content-Type: application/json

{
  "email": "admin@company.com",
  "password": "SecurePass123!",
  "fullName": "Admin User",
  "tenantName": "MyCompany"
}

Response:
{
  "user": { ... },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Login
```bash
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "email": "admin@company.com",
  "password": "SecurePass123!"
}
```

**Save the `access_token` - you'll need it for all subsequent requests!**

### Step 2: Create a Company

```bash
POST http://localhost:3000/auth/create-company
Authorization: Bearer <your-access-token>
Content-Type: application/json

{
  "name": "Acme Corporation",
  "code": "ACME001",
  "description": "Main company"
}

Response:
{
  "company": {
    "id": "cm123abc...",
    "name": "Acme Corporation",
    "code": "ACME001",
    ...
  }
}
```

**Note**: You're automatically added to the company as admin! ✅

### Step 3: Create Currencies

#### Create USD
```bash
POST http://localhost:3000/currencies
Authorization: Bearer <your-access-token>
Content-Type: application/json

{
  "companyId": "<company-id-from-step-2>",
  "code": "USD",
  "name": "US Dollar",
  "symbol": "$"
}
```

#### Create EUR
```bash
POST http://localhost:3000/currencies
Authorization: Bearer <your-access-token>
Content-Type: application/json

{
  "companyId": "<company-id>",
  "code": "EUR",
  "name": "Euro",
  "symbol": "€"
}
```

#### Create GBP
```bash
POST http://localhost:3000/currencies
Authorization: Bearer <your-access-token>
Content-Type: application/json

{
  "companyId": "<company-id>",
  "code": "GBP",
  "name": "British Pound",
  "symbol": "£"
}
```

### Step 4: Create Exchange Rates

```bash
POST http://localhost:3000/currencies/exchange-rates
Authorization: Bearer <your-access-token>
Content-Type: application/json

{
  "baseCurrencyId": "<usd-currency-id>",
  "targetCurrencyId": "<eur-currency-id>",
  "rate": 0.85,
  "effectiveDate": "2025-11-02T00:00:00Z"
}
```

### Step 5: Create Vendors

#### Create Domestic Vendor (USD)
```bash
POST http://localhost:3000/vendors
Authorization: Bearer <your-access-token>
Content-Type: application/json

{
  "companyId": "<company-id>",
  "name": "ABC Suppliers Inc",
  "code": "ABC001",
  "email": "contact@abcsuppliers.com",
  "phone": "+1-555-0123",
  "address": "123 Main St, New York, NY 10001",
  "taxNumber": "TAX-ABC-001",
  "currencyId": "<usd-currency-id>"
}
```

#### Create International Vendor (EUR)
```bash
POST http://localhost:3000/vendors
Authorization: Bearer <your-access-token>
Content-Type: application/json

{
  "companyId": "<company-id>",
  "name": "European Distributors GmbH",
  "code": "EUR001",
  "email": "info@eudistributors.eu",
  "phone": "+49-30-12345678",
  "address": "Hauptstraße 1, 10115 Berlin, Germany",
  "taxNumber": "DE123456789",
  "currencyId": "<eur-currency-id>"
}
```

### Step 6: Assign Users to Vendors

```bash
POST http://localhost:3000/auth/vendor/assign-user
Authorization: Bearer <your-access-token>
Content-Type: application/json

{
  "userId": "<user-id>",
  "vendorId": "<vendor-id>",
  "role": "contact"
}
```

## 📋 Common Operations

### Get All Vendors
```bash
GET http://localhost:3000/vendors?companyId=<company-id>&page=1&limit=10
Authorization: Bearer <your-access-token>
```

### Search Vendors
```bash
GET http://localhost:3000/vendors?search=ABC&isActive=true
Authorization: Bearer <your-access-token>
```

### Get Vendor Statistics
```bash
GET http://localhost:3000/vendors/<vendor-id>/stats
Authorization: Bearer <your-access-token>

Response:
{
  "vendorId": "...",
  "totalPurchaseOrders": 25,
  "totalSpent": 150000.00,
  "activePurchaseOrders": 5
}
```

### Get All Currencies
```bash
GET http://localhost:3000/currencies?companyId=<company-id>
Authorization: Bearer <your-access-token>
```

### Get Latest Exchange Rate
```bash
GET http://localhost:3000/currencies/exchange-rates/latest?baseCurrencyId=<usd-id>&targetCurrencyId=<eur-id>
Authorization: Bearer <your-access-token>
```

### Update Vendor
```bash
PUT http://localhost:3000/vendors/<vendor-id>
Authorization: Bearer <your-access-token>
Content-Type: application/json

{
  "email": "newemail@supplier.com",
  "phone": "+1-555-9999"
}
```

### Soft Delete Vendor
```bash
DELETE http://localhost:3000/vendors/<vendor-id>/soft
Authorization: Bearer <your-access-token>
```

## 🔐 Security Features

1. **JWT Authentication**: All endpoints require valid token
2. **Company Access Control**: Users can only access their company's data
3. **Automatic Admin Assignment**: Company creators get admin role
4. **Delete Protection**: Cannot delete currencies/vendors in use
5. **Validation**: Comprehensive input validation on all endpoints

## 📊 Complete API Reference

### Authentication Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/signup | Create new account |
| POST | /auth/login | Login and get token |
| POST | /auth/create-company | Create company |
| POST | /auth/tenant/users | Add user to tenant |

### Vendor Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /vendors | Create vendor |
| GET | /vendors | List vendors |
| GET | /vendors/:id | Get vendor by ID |
| GET | /vendors/:id/stats | Get vendor statistics |
| PUT | /vendors/:id | Update vendor |
| DELETE | /vendors/:id/soft | Soft delete |
| DELETE | /vendors/:id/hard | Hard delete |

### Vendor User Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/vendor/assign-user | Assign user to vendor |
| POST | /auth/vendor/assign-users | Assign multiple users |
| POST | /auth/vendor/remove-user | Remove user from vendor |

### Currency Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /currencies | Create currency |
| GET | /currencies | List currencies |
| GET | /currencies/:id | Get currency by ID |
| GET | /currencies/code/:code | Get by code |
| PUT | /currencies/:id | Update currency |
| DELETE | /currencies/:id | Delete currency |

### Exchange Rate Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /currencies/exchange-rates | Create exchange rate |
| GET | /currencies/exchange-rates/latest | Get latest rate |
| GET | /currencies/:id/exchange-rates | Get all rates |

## 🎨 Postman Collection

Create a Postman collection with these requests for easy testing:

1. **Environment Variables**:
   - `baseUrl`: `http://localhost:3000`
   - `token`: `<your-access-token>`
   - `companyId`: `<your-company-id>`

2. **Headers** (for all authenticated requests):
   - `Authorization`: `Bearer {{token}}`
   - `Content-Type`: `application/json`

## 🐛 Troubleshooting

### Issue: "Unauthorized" Error
**Solution**: Make sure you're including the JWT token in the Authorization header:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Issue: "Forbidden - You do not have access to this company"
**Solution**: Verify that:
1. You're using the correct company ID
2. You're assigned to the company (check CompanyUser table)
3. The company belongs to your tenant

### Issue: "Currency code already exists"
**Solution**: Currency codes must be globally unique. Use different codes or check existing currencies first.

### Issue: "Cannot delete currency that is assigned to vendors"
**Solution**: This is a protection feature. First reassign vendors to a different currency, then delete.

## 📈 Best Practices

1. **Currency Codes**: Use ISO 4217 standard codes (USD, EUR, GBP)
2. **Vendor Codes**: Use consistent naming convention (ABC001, ABC002, etc.)
3. **Exchange Rates**: Update regularly for accuracy
4. **Soft Delete**: Use soft delete for vendors with transaction history
5. **Access Control**: Assign appropriate roles to users

## 🎓 Example Workflow

```
1. Sign up → Get token
2. Create company → Automatically added as admin
3. Create currencies (USD, EUR, GBP)
4. Create exchange rates
5. Create vendors with currencies
6. Assign users to vendors
7. View vendor statistics
8. Create purchase orders (future feature)
```

## 📝 Notes

- All timestamps are in UTC
- Decimal precision: 4 places for exchange rates, 2 for amounts
- Pagination default: 10 items per page
- Search is case-insensitive

## 🆘 Support

For issues or questions:
1. Check the README files in each module
2. Review the summary documents
3. Check the Prisma schema for data structure
4. Verify JWT token is valid and not expired

## ✨ What's Next?

Consider implementing:
- Purchase order creation with multi-currency support
- Vendor approval workflow
- Vendor rating system
- Automatic exchange rate updates from external API
- Vendor document management
- Advanced reporting and analytics

---

**System Status**: ✅ All features implemented and tested
**Database**: ✅ Migrations applied successfully
**Ready for**: Production use

Happy coding! 🚀
