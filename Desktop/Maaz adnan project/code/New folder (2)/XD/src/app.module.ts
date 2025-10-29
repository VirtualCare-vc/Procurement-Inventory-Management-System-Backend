import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { AuthModule } from './auth/auth.module';


@Module({
  imports: [
    // NestJS ConfigModule for managing environment variables and configurations
    ConfigModule.forRoot({
      isGlobal: true, // Makes config globally available throughout the application
    }),
    // Importing the custom modules
    AuthModule,  // Handles authentication and signup
  ],
  controllers: [AppController], // Controllers to handle incoming HTTP requests
  providers: [AppService, PrismaService], // Providers (services) for application logic
})
export class AppModule {}
