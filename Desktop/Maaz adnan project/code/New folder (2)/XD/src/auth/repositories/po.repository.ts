import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePODto } from '../dto/create-po.dto';
import { UpdatePODto } from '../dto/update-po.dto';
import { Prisma } from '@prisma/client/';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class PORepository {
  constructor(private prisma: PrismaService) {}

  private async assertCompanyBelongsToTenant(companyId: string, tenantId: string) {
    const company = await this.prisma.company.findFirst({ where: { id: companyId, tenantId } });
    if (!company) throw new ForbiddenException('Company does not belong to tenant');
    return company;
  }

  /** Generate a document number using NumberingRule (module="PurchaseOrder") */
  private async generateNumber(tx: Prisma.TransactionClient, companyId: string) {
    const module = 'PurchaseOrder';
    // upsert a rule if missing
    const rule = await tx.numberingRule.upsert({
      where: {
        companyId_module: { companyId, module },
      },
      create: { companyId, module, prefix: 'PO-', padding: 5, nextNumber: 1, isActive: true },
      update: {},
    });

    const seq = rule.nextNumber;
    const padded = String(seq).padStart(rule.padding ?? 5, '0');
    const number = `${rule.prefix ?? ''}${padded}${rule.suffix ?? ''}`;

    // increment
    await tx.numberingRule.update({
      where: { id: rule.id },
      data: { nextNumber: seq + 1 },
    });

    return number;
  }

  async create(tenantId: string, userId: string, dto: CreatePODto) {
    await this.assertCompanyBelongsToTenant(dto.companyId, tenantId);

    return this.prisma.$transaction(async (tx) => {
      // check vendor belongs to same company
      const vendor = await tx.vendor.findFirst({
        where: { id: dto.vendorId, companyId: dto.companyId, isActive: true },
      });
      if (!vendor) throw new NotFoundException('Vendor not found');

      const number = await this.generateNumber(tx, dto.companyId);

      // compute totals
      const calcLines = dto.lines.map((l, idx) => {
        const qty = new Decimal(l.qty);
        const price = new Decimal(l.price);
        const taxRate = l.taxRate ? new Decimal(l.taxRate) : new Decimal(0);
        const lineSub = qty.mul(price);
        const lineTax = taxRate.gt(0) ? lineSub.mul(taxRate).div(100) : new Decimal(0);
        const lineTotal = lineSub.add(lineTax);
        return {
          lineNo: idx + 1,
          itemId: l.itemId ?? null,
          description: l.description,
          uomId: l.uomId ?? null,
          qty,
          price,
          taxRate: l.taxRate ? new Decimal(l.taxRate) : null,
          lineSubTotal: lineSub,
          lineTax,
          lineTotal,
        };
      });

      const subTotal = calcLines.reduce((a, c) => a.add(c.lineSubTotal), new Decimal(0));
      const taxTotal = calcLines.reduce((a, c) => a.add(c.lineTax), new Decimal(0));
      const grandTotal = subTotal.add(taxTotal);

      const po = await tx.purchaseOrder.create({
        data: {
          companyId: dto.companyId,
          vendorId: dto.vendorId,
          siteId: dto.siteId ?? null,
          number,
          orderDate: dto.orderDate ? new Date(dto.orderDate) : undefined,
          currencyId: dto.currencyId ?? vendor.currencyId ?? null,
          exchangeRateId: dto.exchangeRateId ?? null,
          remarks: dto.remarks ?? null,
          createdById: userId,
          subTotal,
          taxTotal,
          grandTotal,
          lines: { create: calcLines },
        },
        include: { lines: true, vendor: true },
      });

      return po;
    });
  }

  async getById(tenantId: string, id: string) {
    const po = await this.prisma.purchaseOrder.findFirst({
      where: { id, company: { tenantId } },
      include: { lines: true, vendor: true, company: true, currency: true },
    });
    if (!po) throw new NotFoundException('PO not found');
    return po;
  }

  async list(tenantId: string, companyId: string) {
    await this.assertCompanyBelongsToTenant(companyId, tenantId);
    return this.prisma.purchaseOrder.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      include: { vendor: true, _count: { select: { lines: true } } },
    });
  }

  async update(tenantId: string, id: string, dto: UpdatePODto) {
    // Only allow update while DRAFT
    const existing = await this.getById(tenantId, id);
    if (existing.status !== 'DRAFT') {
      throw new ForbiddenException('Only draft POs can be updated');
    }

    return this.prisma.$transaction(async (tx) => {
      // recompute if lines provided
      let totalsUpdate: Partial<{
        subTotal: Decimal;
        taxTotal: Decimal;
        grandTotal: Decimal;
      }> = {};
      if (dto.lines && dto.lines.length) {
        // wipe & recreate
        await tx.purchaseOrderLine.deleteMany({ where: { purchaseOrderId: id } });

        const calcLines = dto.lines.map((l, idx) => {
          const qty = new Decimal(l.qty);
          const price = new Decimal(l.price);
          const taxRate = l.taxRate ? new Decimal(l.taxRate) : new Decimal(0);
          const lineSub = qty.mul(price);
          const lineTax = taxRate.gt(0) ? lineSub.mul(taxRate).div(100) : new Decimal(0);
          const lineTotal = lineSub.add(lineTax);
          return {
            purchaseOrderId: id,
            lineNo: idx + 1,
            itemId: l.itemId ?? null,
            description: l.description,
            uomId: l.uomId ?? null,
            qty,
            price,
            taxRate: l.taxRate ? new Decimal(l.taxRate) : null,
            lineSubTotal: lineSub,
            lineTax,
            lineTotal,
          };
        });

        const subTotal = calcLines.reduce((a, c) => a.add(c.lineSubTotal), new Decimal(0));
        const taxTotal = calcLines.reduce((a, c) => a.add(c.lineTax), new Decimal(0));
        const grandTotal = subTotal.add(taxTotal);

        await tx.purchaseOrderLine.createMany({ data: calcLines });
        totalsUpdate = { subTotal, taxTotal, grandTotal };
      }

      const updated = await tx.purchaseOrder.update({
        where: { id },
        data: {
          vendorId: dto.vendorId ?? undefined,
          siteId: dto.siteId ?? undefined,
          orderDate: dto.orderDate ? new Date(dto.orderDate) : undefined,
          currencyId: dto.currencyId ?? undefined,
          exchangeRateId: dto.exchangeRateId ?? undefined,
          remarks: dto.remarks ?? undefined,
          ...totalsUpdate,
        },
        include: { lines: true, vendor: true },
      });

      return updated;
    });
  }

  async changeStatus(tenantId: string, id: string, next: 'SUBMITTED'|'UNDER_APPROVAL'|'APPROVED'|'REJECTED'|'ISSUED'|'CANCELLED') {
    const po = await this.getById(tenantId, id);
    // simple guards
    const allowedFromDraft = ['SUBMITTED', 'CANCELLED'];
    if (po.status === 'DRAFT' && !allowedFromDraft.includes(next)) {
      throw new ForbiddenException(`Draft can only go to ${allowedFromDraft.join(', ')}`);
    }
    // approve path
    if (next === 'APPROVED' && !['SUBMITTED','UNDER_APPROVAL'].includes(po.status)) {
      throw new ForbiddenException('PO must be submitted before approval');
    }
    if (next === 'ISSUED' && po.status !== 'APPROVED') {
      throw new ForbiddenException('Only approved POs can be issued');
    }

    return this.prisma.purchaseOrder.update({
      where: { id },
      data: { status: next },
    });
  }
}
