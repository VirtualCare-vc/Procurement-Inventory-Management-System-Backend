import { Injectable } from '@nestjs/common';
import { PORepository } from '../repositories/po.repository';
import { CreatePODto } from '../dto/create-po.dto';
import { UpdatePODto } from '../dto/update-po.dto';
import { POAction } from '../dto/change-status.dto';

@Injectable()
export class POService {
  constructor(private repo: PORepository) {}

  create(tenantId: string, userId: string, dto: CreatePODto) {
    return this.repo.create(tenantId, userId, dto);
  }

  getById(tenantId: string, id: string) {
    return this.repo.getById(tenantId, id);
  }

  list(tenantId: string, companyId: string) {
    return this.repo.list(tenantId, companyId);
  }

  update(tenantId: string, id: string, dto: UpdatePODto) {
    return this.repo.update(tenantId, id, dto);
  }

  async act(tenantId: string, id: string, action: POAction) {
    switch (action) {
      case POAction.SUBMIT:
        return this.repo.changeStatus(tenantId, id, 'SUBMITTED');
      case POAction.APPROVE:
        return this.repo.changeStatus(tenantId, id, 'APPROVED');
      case POAction.REJECT:
        return this.repo.changeStatus(tenantId, id, 'REJECTED');
      case POAction.CANCEL:
        return this.repo.changeStatus(tenantId, id, 'CANCELLED');
      case POAction.ISSUE:
        return this.repo.changeStatus(tenantId, id, 'ISSUED');
      default:
        throw new Error('Unsupported action');
    }
  }
}
