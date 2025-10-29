import { Injectable } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import { TenantRepository } from '../repositories/tenant.repository';
import { RoleRepository } from '../repositories/role.repository';
import { CreateUserDto } from '../dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    private userRepository: UserRepository,
    private tenantRepository: TenantRepository,
    private roleRepository: RoleRepository,
  ) {}


  async createUser(createUserDto: CreateUserDto) {

    const tenant = await this.tenantRepository.create(createUserDto.tenantName, `${createUserDto.tenantName}-code`);

    let role = await this.roleRepository.findByName('Super Admin');

    if (!role) {
      role = await this.roleRepository.create('Super Admin', 'Default super administrator role');
    }
    
    const user = await this.userRepository.create(createUserDto, tenant.id, role.id);

    return user;
  }


  async findByEmail(email: string) {
    return this.userRepository.findByEmail(email);
  }

  async findTenant(name: string) {
    return this.userRepository.tenantExist(name);
  }

}
