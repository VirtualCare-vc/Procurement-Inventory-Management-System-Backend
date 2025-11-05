import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { UomRepository } from '../repositories/uom.repository';
import { CreateUomDto } from '../dto/create-uom.dto';
import { UpdateUomDto } from '../dto/update-uom.dto';
import { CreateUomConversionDto } from '../dto/create-uom-conversion.dto';
import { FilterUomDto } from '../dto/filter-uom.dto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UomService {
  constructor(
    private readonly uomRepository: UomRepository,
    private readonly prisma: PrismaService,
  ) {}

  async create(companyId: string, createUomDto: CreateUomDto) {
    // Validate company exists
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException(`Company with ID ${companyId} not found`);
    }

    // Check if code already exists for this company
    const codeExists = await this.uomRepository.checkCodeExists(
      companyId,
      createUomDto.code,
    );

    if (codeExists) {
      throw new ConflictException(
        `UOM with code ${createUomDto.code} already exists for this company`,
      );
    }

    return this.uomRepository.create(companyId, createUomDto);
  }

  async findAll(filters: FilterUomDto) {
    return this.uomRepository.findAll(filters);
  }

  async findById(id: string) {
    const uom = await this.uomRepository.findById(id);

    if (!uom) {
      throw new NotFoundException(`UOM with ID ${id} not found`);
    }

    return uom;
  }

  async findByCode(companyId: string, code: string) {
    const uom = await this.uomRepository.findByCode(companyId, code);

    if (!uom) {
      throw new NotFoundException(
        `UOM with code ${code} not found for company ${companyId}`,
      );
    }

    return uom;
  }

  async findByCompany(companyId: string) {
    // Validate company exists
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException(`Company with ID ${companyId} not found`);
    }

    return this.uomRepository.findByCompany(companyId);
  }

  async update(id: string, updateUomDto: UpdateUomDto) {
    const uom = await this.uomRepository.findById(id);

    if (!uom) {
      throw new NotFoundException(`UOM with ID ${id} not found`);
    }

    // Check if code is being updated and if it already exists
    if (updateUomDto.code && updateUomDto.code !== uom.code) {
      const codeExists = await this.uomRepository.checkCodeExists(
        uom.companyId,
        updateUomDto.code,
        id,
      );

      if (codeExists) {
        throw new ConflictException(
          `UOM with code ${updateUomDto.code} already exists for this company`,
        );
      }
    }

    return this.uomRepository.update(id, updateUomDto);
  }

  async delete(id: string) {
    const uom = await this.uomRepository.findById(id);

    if (!uom) {
      throw new NotFoundException(`UOM with ID ${id} not found`);
    }

    // Check if UOM is used in any items
    const isUsedInItems = await this.uomRepository.isUomUsedInItems(id);

    if (isUsedInItems) {
      throw new BadRequestException(
        'Cannot delete UOM that is used in items. Consider deactivating it instead.',
      );
    }

    // Check if UOM is used in any purchase orders
    const isUsedInPOs = await this.uomRepository.isUomUsedInPurchaseOrders(id);

    if (isUsedInPOs) {
      throw new BadRequestException(
        'Cannot delete UOM that is used in purchase orders. Consider deactivating it instead.',
      );
    }

    return this.uomRepository.delete(id);
  }

  async softDelete(id: string) {
    const uom = await this.uomRepository.findById(id);

    if (!uom) {
      throw new NotFoundException(`UOM with ID ${id} not found`);
    }

    return this.uomRepository.softDelete(id);
  }

  // UOM Conversion methods
  async createConversion(createConversionDto: CreateUomConversionDto) {
    const { fromUomId, toUomId, conversionRate } = createConversionDto;

    // Validate both UOMs exist
    const fromUom = await this.uomRepository.findById(fromUomId);
    if (!fromUom) {
      throw new NotFoundException(`From UOM with ID ${fromUomId} not found`);
    }

    const toUom = await this.uomRepository.findById(toUomId);
    if (!toUom) {
      throw new NotFoundException(`To UOM with ID ${toUomId} not found`);
    }

    // Ensure both UOMs belong to the same company
    if (fromUom.companyId !== toUom.companyId) {
      throw new BadRequestException(
        'Both UOMs must belong to the same company',
      );
    }

    // Prevent self-conversion
    if (fromUomId === toUomId) {
      throw new BadRequestException('Cannot create conversion to the same UOM');
    }

    // Check if conversion already exists
    const existingConversion = await this.uomRepository.findConversion(
      fromUomId,
      toUomId,
    );

    if (existingConversion) {
      throw new ConflictException(
        `Conversion from ${fromUom.code} to ${toUom.code} already exists`,
      );
    }

    return this.uomRepository.createConversion(createConversionDto);
  }

  async findConversion(fromUomId: string, toUomId: string) {
    const conversion = await this.uomRepository.findConversion(
      fromUomId,
      toUomId,
    );

    if (!conversion) {
      throw new NotFoundException(
        `Conversion from UOM ${fromUomId} to ${toUomId} not found`,
      );
    }

    return conversion;
  }

  async findAllConversions() {
    return this.uomRepository.findAllConversions();
  }

  async findConversionsByUom(uomId: string) {
    const uom = await this.uomRepository.findById(uomId);

    if (!uom) {
      throw new NotFoundException(`UOM with ID ${uomId} not found`);
    }

    return this.uomRepository.findConversionsByUom(uomId);
  }

  async deleteConversion(id: string) {
    // Check if conversion exists
    const conversion = await this.prisma.uoMConversion.findUnique({
      where: { id },
    });

    if (!conversion) {
      throw new NotFoundException(`Conversion with ID ${id} not found`);
    }

    return this.uomRepository.deleteConversion(id);
  }

  async updateConversion(id: string, conversionRate: number) {
    // Check if conversion exists
    const conversion = await this.prisma.uoMConversion.findUnique({
      where: { id },
    });

    if (!conversion) {
      throw new NotFoundException(`Conversion with ID ${id} not found`);
    }

    if (conversionRate <= 0) {
      throw new BadRequestException('Conversion rate must be greater than 0');
    }

    return this.uomRepository.updateConversion(id, conversionRate);
  }

  async convertQuantity(
    fromUomId: string,
    toUomId: string,
    quantity: number,
  ): Promise<number> {
    if (fromUomId === toUomId) {
      return quantity;
    }

    const conversion = await this.uomRepository.findConversion(
      fromUomId,
      toUomId,
    );

    if (!conversion) {
      throw new NotFoundException(
        `No conversion found from UOM ${fromUomId} to ${toUomId}`,
      );
    }

    return quantity * Number(conversion.conversionRate);
  }
}
