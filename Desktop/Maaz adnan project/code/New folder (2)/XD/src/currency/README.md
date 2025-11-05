# Currency Module

This module handles all currency and exchange rate operations for the application.

## Features

### 1. Currency Management
- Create currencies with code, name, and symbol
- Read currencies with filtering and pagination
- Update currency details
- Delete currencies (with validation)
- Get currencies by company

### 2. Exchange Rate Management
- Create exchange rates between currencies
- Get latest exchange rate for currency pairs
- Get all exchange rates for a specific currency
- Automatic effective date handling

## API Endpoints

### Currency CRUD

#### Create Currency
```
POST /currencies
Authorization: Bearer <token>

Body:
{
  "companyId": "uuid",
  "code": "USD",
  "name": "US Dollar",
  "symbol": "$"
}
```

#### Get All Currencies (with filtering)
```
GET /currencies?companyId=uuid&search=USD&page=1&limit=50
Authorization: Bearer <token>
```

#### Get Currency by ID
```
GET /currencies/:id
Authorization: Bearer <token>
```

#### Get Currency by Code
```
GET /currencies/code/USD
Authorization: Bearer <token>
```

#### Get Currencies by Company
```
GET /currencies/company/:companyId
Authorization: Bearer <token>
```

#### Update Currency
```
PUT /currencies/:id
Authorization: Bearer <token>

Body:
{
  "name": "United States Dollar",
  "symbol": "$"
}
```

#### Delete Currency
```
DELETE /currencies/:id
Authorization: Bearer <token>
```

### Exchange Rate Management

#### Create Exchange Rate
```
POST /currencies/exchange-rates
Authorization: Bearer <token>

Body:
{
  "baseCurrencyId": "uuid",
  "targetCurrencyId": "uuid",
  "rate": 1.18,
  "effectiveDate": "2025-11-02T00:00:00Z"
}
```

#### Get Latest Exchange Rate
```
GET /currencies/exchange-rates/latest?baseCurrencyId=uuid&targetCurrencyId=uuid
Authorization: Bearer <token>

Response:
{
  "id": "uuid",
  "baseCurrencyId": "uuid",
  "targetCurrencyId": "uuid",
  "rate": 1.18,
  "effectiveDate": "2025-11-02T00:00:00Z",
  "baseCurrency": {
    "code": "USD",
    "name": "US Dollar",
    "symbol": "$"
  },
  "targetCurrency": {
    "code": "EUR",
    "name": "Euro",
    "symbol": "€"
  }
}
```

#### Get All Exchange Rates for Currency
```
GET /currencies/:id/exchange-rates
Authorization: Bearer <token>

Response:
{
  "asBase": [...],  // Rates where this currency is the base
  "asTarget": [...]  // Rates where this currency is the target
}
```

## Database Schema

### Currency Model
```prisma
model Currency {
  id              String           @id @default(cuid())
  companyId       String
  company         Company          @relation(fields: [companyId], references: [id])
  code            String           @unique
  name            String
  symbol          String?          // Currency symbol (e.g., '$', '€', '£')
  baseRates       ExchangeRate[]   @relation("BaseCurrency")
  targetRates     ExchangeRate[]   @relation("TargetCurrency")
  vendors         Vendor[]
  purchaseOrders  PurchaseOrder[]
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt
}
```

### ExchangeRate Model
```prisma
model ExchangeRate {
  id               String          @id @default(cuid())
  baseCurrencyId   String
  targetCurrencyId String
  rate             Decimal         @db.Decimal(10, 4)
  effectiveDate    DateTime
  purchaseOrders   PurchaseOrder[]
  createdAt        DateTime        @default(now())
  updatedAt        DateTime        @updatedAt
  baseCurrency     Currency        @relation("BaseCurrency", fields: [baseCurrencyId], references: [id])
  targetCurrency   Currency        @relation("TargetCurrency", fields: [targetCurrencyId], references: [id])
}
```

## Common Currencies

Here are some common currencies you can create:

| Code | Name | Symbol |
|------|------|--------|
| USD | US Dollar | $ |
| EUR | Euro | € |
| GBP | British Pound | £ |
| JPY | Japanese Yen | ¥ |
| CNY | Chinese Yuan | ¥ |
| INR | Indian Rupee | ₹ |
| AUD | Australian Dollar | A$ |
| CAD | Canadian Dollar | C$ |
| CHF | Swiss Franc | Fr |
| AED | UAE Dirham | د.إ |
| SAR | Saudi Riyal | ﷼ |

## Validation Rules

1. **Currency Code**: Must be unique globally (typically 3-letter ISO code)
2. **Company Access**: Users can only manage currencies for companies they have access to
3. **Exchange Rate**: Base and target currencies must be different
4. **Delete Protection**: Cannot delete currency if:
   - Assigned to any vendors
   - Used in any purchase orders
5. **Effective Date**: Exchange rates use effective date for historical tracking

## Error Handling

- `400 Bad Request`: Invalid data or business rule violation
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: User doesn't have access to the company
- `404 Not Found`: Currency or exchange rate not found

## Usage Examples

### Create a Currency
```typescript
const currency = await currencyService.create(userId, {
  companyId: 'company-uuid',
  code: 'USD',
  name: 'US Dollar',
  symbol: '$',
});
```

### Create an Exchange Rate
```typescript
const exchangeRate = await currencyService.createExchangeRate(userId, {
  baseCurrencyId: 'usd-uuid',
  targetCurrencyId: 'eur-uuid',
  rate: 0.85,
  effectiveDate: '2025-11-02T00:00:00Z',
});
```

### Get Latest Exchange Rate
```typescript
const rate = await currencyService.getLatestExchangeRate(
  userId,
  'usd-uuid',
  'eur-uuid'
);
console.log(`1 USD = ${rate.rate} EUR`);
```

## Integration with Vendor Module

Currencies are used in the vendor module:
- Vendors can have a default currency
- Purchase orders use currencies for pricing
- Exchange rates are applied for multi-currency transactions

### Example: Create Vendor with Currency
```typescript
const vendor = await vendorService.create(userId, {
  companyId: 'company-uuid',
  name: 'International Supplier',
  code: 'INTL001',
  email: 'contact@supplier.com',
  currencyId: 'eur-uuid', // Vendor uses EUR
});
```

## Security Considerations

1. All endpoints require JWT authentication
2. Users can only access currencies from companies they're assigned to
3. Currency codes are globally unique to prevent conflicts
4. Delete protection prevents accidental data loss
5. Exchange rates are immutable once created (create new ones for updates)

## Migration Steps

1. Run Prisma migration:
```bash
npx prisma migrate dev --name add_currency_symbol
```

2. Generate Prisma client:
```bash
npx prisma generate
```

3. Restart the application

## Best Practices

1. **Currency Codes**: Use ISO 4217 standard 3-letter codes (USD, EUR, GBP, etc.)
2. **Exchange Rates**: Update regularly for accurate conversions
3. **Effective Dates**: Set future effective dates for planned rate changes
4. **Base Currency**: Choose one base currency per company for consistency
5. **Decimal Precision**: Exchange rates support up to 4 decimal places

## Testing

Test the endpoints using the provided examples with a valid JWT token obtained from the login endpoint.

### Test Flow
1. Create a company
2. Create currencies (USD, EUR, etc.)
3. Create exchange rates between currencies
4. Create vendors with default currencies
5. Create purchase orders using different currencies
