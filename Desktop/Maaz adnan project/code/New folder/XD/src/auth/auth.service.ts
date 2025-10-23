import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { SignupDto } from './dto/signup.dto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  async signup(dto: SignupDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already in use');

    const hashed = await bcrypt.hash(dto.password, 10);

    const [user, organization] = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: dto.email,
          password: hashed,
          name: dto.name,
        },
      });

      const org = await tx.organization.create({
        data: {
          name: dto.organizationName,
          slug: this.slugify(dto.organizationName),
          createdById: user.id,
        },
      });

      await tx.membership.create({
        data: {
          userId: user.id,
          organizationId: org.id,
          role: 'SUPER_ADMIN',
        },
      });

      return [user, org];
    });

    const token = this.jwt.sign({ sub: user.id, email: user.email });

    return {
      message: 'Signup successful',
      user: { id: user.id, email: user.email },
      organization: { id: organization.id, name: organization.name },
      access_token: token,
    };
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    const token = this.jwt.sign({ sub: user.id, email: user.email });
    return { access_token: token };
  }

  private slugify(text: string) {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  }
}
