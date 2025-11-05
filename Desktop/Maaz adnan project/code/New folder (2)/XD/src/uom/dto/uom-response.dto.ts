export class UomResponseDto {
  id: string;
  companyId: string;
  code: string;
  name: string;
  symbol: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Optional relations
  company?: {
    id: string;
    name: string;
    code: string;
  };
}

export class UomConversionResponseDto {
  id: string;
  fromUomId: string;
  toUomId: string;
  conversionRate: number;
  createdAt: Date;
  updatedAt: Date;

  fromUom?: {
    id: string;
    code: string;
    name: string;
    symbol: string;
  };

  toUom?: {
    id: string;
    code: string;
    name: string;
    symbol: string;
  };
}
