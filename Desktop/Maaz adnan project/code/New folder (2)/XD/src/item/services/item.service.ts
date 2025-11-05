import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { ItemRepository } from '../repositories/item.repository';
import { CreateItemDto } from '../dto/create-item.dto';
import { UpdateItemDto } from '../dto/update-item.dto';
import { FilterItemDto } from '../dto/filter-item.dto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ItemService {
  constructor(
    private readonly itemRepository: ItemRepository,
    private readonly prisma: PrismaService,
  ) {}

  async create(companyId: string, createItemDto: CreateItemDto) {
    // Validate company exists
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException(`Company with ID ${companyId} not found`);
    }

    // Check if code already exists for this company
    const codeExists = await this.itemRepository.checkCodeExists(
      companyId,
      createItemDto.code,
    );

    if (codeExists) {
      throw new ConflictException(
        `Item with code ${createItemDto.code} already exists for this company`,
      );
    }

    // Validate UOM if provided
    if (createItemDto.uomId) {
      const uom = await this.prisma.uoM.findUnique({
        where: { id: createItemDto.uomId },
      });

      if (!uom) {
        throw new NotFoundException(
          `UOM with ID ${createItemDto.uomId} not found`,
        );
      }
    }

    // Validate currency if provided
    if (createItemDto.currencyId) {
      const currency = await this.prisma.currency.findUnique({
        where: { id: createItemDto.currencyId },
      });

      if (!currency) {
        throw new NotFoundException(
          `Currency with ID ${createItemDto.currencyId} not found`,
        );
      }

      // Ensure currency belongs to the same company
      if (currency.companyId !== companyId) {
        throw new BadRequestException(
          'Currency must belong to the same company',
        );
      }
    }

    // Validate preferred vendor if provided
    if (createItemDto.preferredVendorId) {
      const vendor = await this.prisma.vendor.findUnique({
        where: { id: createItemDto.preferredVendorId },
      });

      if (!vendor) {
        throw new NotFoundException(
          `Vendor with ID ${createItemDto.preferredVendorId} not found`,
        );
      }

      // Ensure vendor belongs to the same company
      if (vendor.companyId !== companyId) {
        throw new BadRequestException(
          'Vendor must belong to the same company',
        );
      }
    }

    // Validate stock levels
    if (createItemDto.minStockLevel && createItemDto.maxStockLevel) {
      if (createItemDto.minStockLevel > createItemDto.maxStockLevel) {
        throw new BadRequestException(
          'Minimum stock level cannot be greater than maximum stock level',
        );
      }
    }

    return this.itemRepository.create(companyId, createItemDto);
  }

  async findAll(filters: FilterItemDto) {
    return this.itemRepository.findAll(filters);
  }

  async findById(id: string) {
    const item = await this.itemRepository.findById(id);

    if (!item) {
      throw new NotFoundException(`Item with ID ${id} not found`);
    }

    return item;
  }

  async findByCode(companyId: string, code: string) {
    const item = await this.itemRepository.findByCode(companyId, code);

    if (!item) {
      throw new NotFoundException(
        `Item with code ${code} not found for company ${companyId}`,
      );
    }

    return item;
  }

  async findByCompany(companyId: string) {
    // Validate company exists
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException(`Company with ID ${companyId} not found`);
    }

    return this.itemRepository.findByCompany(companyId);
  }

  async findByCategory(companyId: string, category: string) {
    return this.itemRepository.findByCategory(companyId, category);
  }

  async update(id: string, updateItemDto: UpdateItemDto) {
    const item = await this.itemRepository.findById(id);

    if (!item) {
      throw new NotFoundException(`Item with ID ${id} not found`);
    }

    // Check if code is being updated and if it already exists
    if (updateItemDto.code && updateItemDto.code !== item.code) {
      const codeExists = await this.itemRepository.checkCodeExists(
        item.companyId,
        updateItemDto.code,
        id,
      );

      if (codeExists) {
        throw new ConflictException(
          `Item with code ${updateItemDto.code} already exists for this company`,
        );
      }
    }

    // Validate UOM if provided
    if (updateItemDto.uomId) {
      const uom = await this.prisma.uoM.findUnique({
        where: { id: updateItemDto.uomId },
      });

      if (!uom) {
        throw new NotFoundException(
          `UOM with ID ${updateItemDto.uomId} not found`,
        );
      }
    }

    // Validate currency if provided
    if (updateItemDto.currencyId) {
      const currency = await this.prisma.currency.findUnique({
        where: { id: updateItemDto.currencyId },
      });

      if (!currency) {
        throw new NotFoundException(
          `Currency with ID ${updateItemDto.currencyId} not found`,
        );
      }

      // Ensure currency belongs to the same company
      if (currency.companyId !== item.companyId) {
        throw new BadRequestException(
          'Currency must belong to the same company',
        );
      }
    }

    // Validate preferred vendor if provided
    if (updateItemDto.preferredVendorId) {
      const vendor = await this.prisma.vendor.findUnique({
        where: { id: updateItemDto.preferredVendorId },
      });

      if (!vendor) {
        throw new NotFoundException(
          `Vendor with ID ${updateItemDto.preferredVendorId} not found`,
        );
      }

      // Ensure vendor belongs to the same company
      if (vendor.companyId !== item.companyId) {
        throw new BadRequestException(
          'Vendor must belong to the same company',
        );
      }
    }

    // Validate stock levels
    const minStock = updateItemDto.minStockLevel ?? item.minStockLevel;
    const maxStock = updateItemDto.maxStockLevel ?? item.maxStockLevel;

    if (minStock && maxStock && minStock > maxStock) {
      throw new BadRequestException(
        'Minimum stock level cannot be greater than maximum stock level',
      );
    }

    return this.itemRepository.update(id, updateItemDto);
  }

  async delete(id: string) {
    const item = await this.itemRepository.findById(id);

    if (!item) {
      throw new NotFoundException(`Item with ID ${id} not found`);
    }

    // Check if item is used in any purchase orders
    const isUsed = await this.itemRepository.isItemUsedInPurchaseOrders(id);

    if (isUsed) {
      throw new BadRequestException(
        'Cannot delete item that is used in purchase orders. Consider deactivating it instead.',
      );
    }

    return this.itemRepository.delete(id);
  }

  async softDelete(id: string) {
    const item = await this.itemRepository.findById(id);

    if (!item) {
      throw new NotFoundException(`Item with ID ${id} not found`);
    }

    return this.itemRepository.softDelete(id);
  }

  async getStatistics(id: string) {
    const item = await this.itemRepository.findById(id);

    if (!item) {
      throw new NotFoundException(`Item with ID ${id} not found`);
    }

    return this.itemRepository.getItemStatistics(id);
  }

  async getLowStockItems(companyId: string) {
    // Validate company exists
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException(`Company with ID ${companyId} not found`);
    }

    return this.itemRepository.getLowStockItems(companyId);
  }
}
